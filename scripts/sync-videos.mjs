#!/usr/bin/env node
// Rebuilds data/videos.json from the YouTube channel.
//   YT_API_KEY set  → full catalogue via YouTube Data API v3 (all videos, durations, views, playlists).
//   no key          → public RSS feed (latest 15 uploads), merged into the existing file so older videos are kept.
// Usage: node scripts/sync-videos.mjs            (reads channelId from config.js)
// No npm packages needed (Node 18+).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchChannelData, fetchTopComments, looksLikeShort } from '../assets/yt-api.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'data', 'videos.json');
const cfgText = await readFile(join(root, 'config.js'), 'utf8');
const channelId = process.env.YT_CHANNEL_ID || /channelId:\s*'([^']+)'/.exec(cfgText)[1];

async function readExisting() {
  try { return JSON.parse(await readFile(outFile, 'utf8')); } catch { return null; }
}

const decode = (s = '') => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const tag = (xml, name) => { const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml); return m ? decode(m[1].trim()) : ''; };
const attr = (xml, name, a) => { const m = new RegExp(`<${name}[^>]*\\s${a}="([^"]*)"`).exec(xml); return m ? decode(m[1]) : ''; };

async function isShortUrl(id) {
  try {
    const r = await fetch(`https://www.youtube.com/shorts/${id}`, { method: 'HEAD', redirect: 'manual' });
    return r.status === 200;
  } catch { return null; }
}

async function watchPageSeconds(id) {
  try {
    const r = await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: { 'Accept-Language': 'en' } });
    const m = /"lengthSeconds":"(\d+)"/.exec(await r.text());
    return m ? +m[1] : 0;
  } catch { return 0; }
}

async function fromRss(existing) {
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!r.ok) throw new Error('RSS ' + r.status);
  const xml = await r.text();
  const entries = xml.split('<entry>').slice(1);
  const fresh = entries.map((e) => {
    const v = {
      id: tag(e, 'yt:videoId'),
      title: tag(e, 'title'),
      description: tag(e, 'media:description'),
      published: tag(e, 'published'),
      duration: 0,
      views: +attr(e, 'media:statistics', 'views') || 0,
      likes: +attr(e, 'media:starRating', 'count') || 0,
      thumb: attr(e, 'media:thumbnail', 'url'),
      tags: [],
    };
    const link = attr(e, 'link', 'href');
    v.isShort = link.includes('/shorts/') || looksLikeShort(v);
    return v;
  });
  const old = new Map(((existing && existing.videos) || []).map((v) => [v.id, v]));
  // RSS has no durations: keep any we already know, read the rest once from the public watch page.
  for (const v of fresh) {
    const o = old.get(v.id);
    if (o) { v.duration = o.duration || 0; v.tags = o.tags || []; if (o.comments) { v.comments = o.comments; v.commentCount = o.commentCount; } }
    if (!v.duration) v.duration = await watchPageSeconds(v.id);
    old.set(v.id, v);
  }
  const authorName = tag(xml.split('<entry>')[0], 'name');
  return {
    generatedAt: new Date().toISOString(),
    source: 'rss',
    channel: { ...((existing && existing.channel) || {}), id: channelId, title: (existing && existing.channel && existing.channel.title) || authorName },
    videos: [...old.values()].sort((a, b) => b.published.localeCompare(a.published)),
    playlists: (existing && existing.playlists) || [],
  };
}

const existing = await readExisting();
let data;
if (process.env.YT_API_KEY) {
  data = await fetchChannelData({ apiKey: process.env.YT_API_KEY, channelId });
  // Short-form check against youtube.com/shorts/<id> for anything 3 minutes or less.
  for (const v of data.videos) {
    if (v.duration && v.duration <= 180) { const s = await isShortUrl(v.id); if (s !== null) v.isShort = s; }
  }
  // Top comments for the watch page (1 unit per video; long-form only).
  for (const v of data.videos) if (!v.isShort && v.commentCount) v.comments = await fetchTopComments(v.id, process.env.YT_API_KEY);
} else {
  console.log('YT_API_KEY not set: using the public RSS feed (latest 15 uploads, merged with the existing list).');
  data = await fromRss(existing);
}

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(data, null, 1) + '\n');
console.log(`Wrote ${outFile}: ${data.videos.length} videos (${data.videos.filter((v) => v.isShort).length} Shorts), ${data.playlists.length} playlists, source=${data.source}`);
