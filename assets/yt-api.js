// Katha Lok — YouTube data layer.
// Shared by the browser (live mode) and scripts/sync-videos.mjs (build mode).
// Every function returns the same normalized shape that data/videos.json uses:
// { generatedAt, source, channel:{...}, videos:[...], playlists:[...] }

const API = 'https://www.googleapis.com/youtube/v3/';

async function get(path, params, key) {
  const u = new URL(API + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, v);
  u.searchParams.set('key', key);
  const r = await fetch(u);
  if (!r.ok) throw new Error(`YouTube API ${path} ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

export function parseDuration(iso) {
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '');
  if (!m) return 0;
  return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0);
}

export function bestThumb(t = {}) {
  return (t.maxres || t.standard || t.high || t.medium || t.default || {}).url || '';
}

export function looksLikeShort(v) {
  const text = `${v.title} ${v.description || ''}`;
  if (/#shorts?\b/i.test(text)) return true;
  return v.duration > 0 && v.duration <= 60;
}

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

async function playlistVideoIds(playlistId, key, max) {
  const ids = [];
  let pageToken;
  do {
    const r = await get('playlistItems', { part: 'contentDetails', playlistId, maxResults: 50, pageToken }, key);
    for (const it of r.items || []) ids.push(it.contentDetails.videoId);
    pageToken = r.nextPageToken;
  } while (pageToken && ids.length < max);
  return ids.slice(0, max);
}

/** Top public comments for one video (1 quota unit). Returns [] when comments are off. */
export async function fetchTopComments(videoId, apiKey, max = 6) {
  try {
    const r = await get('commentThreads', { part: 'snippet', videoId, order: 'relevance', maxResults: max, textFormat: 'plainText' }, apiKey);
    return (r.items || []).map((it) => {
      const c = it.snippet.topLevelComment.snippet;
      return { author: c.authorDisplayName, avatar: c.authorProfileImageUrl, text: c.textDisplay, likes: c.likeCount || 0, published: c.publishedAt, replies: it.snippet.totalReplyCount || 0 };
    });
  } catch { return []; }
}

/** Full channel snapshot through the YouTube Data API v3 (about 10–30 quota units). */
export async function fetchChannelData({ apiKey, channelId, maxVideos = 1000, withPlaylists = true }) {
  const ch = await get('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id: channelId }, apiKey);
  const c = ch.items && ch.items[0];
  if (!c) throw new Error('Channel not found: ' + channelId);

  const uploadIds = await playlistVideoIds(c.contentDetails.relatedPlaylists.uploads, apiKey, maxVideos);
  const videos = [];
  for (const ids of chunk(uploadIds, 50)) {
    const r = await get('videos', { part: 'snippet,contentDetails,statistics,status', id: ids.join(','), maxResults: 50 }, apiKey);
    for (const v of r.items || []) {
      if (v.status && v.status.privacyStatus !== 'public') continue;
      if (v.snippet.liveBroadcastContent === 'upcoming') continue;
      const item = {
        id: v.id,
        title: v.snippet.title,
        description: v.snippet.description || '',
        published: v.snippet.publishedAt,
        duration: parseDuration(v.contentDetails.duration),
        views: +(v.statistics.viewCount || 0),
        likes: +(v.statistics.likeCount || 0),
        commentCount: +(v.statistics.commentCount || 0),
        thumb: bestThumb(v.snippet.thumbnails),
        tags: v.snippet.tags || [],
      };
      item.isShort = looksLikeShort(item);
      videos.push(item);
    }
  }
  videos.sort((a, b) => b.published.localeCompare(a.published));

  const playlists = [];
  if (withPlaylists) {
    let pageToken;
    do {
      const r = await get('playlists', { part: 'snippet,contentDetails', channelId, maxResults: 50, pageToken }, apiKey);
      for (const p of r.items || []) {
        if (!p.contentDetails.itemCount) continue;
        playlists.push({ id: p.id, title: p.snippet.title, description: p.snippet.description || '', thumb: bestThumb(p.snippet.thumbnails), videoIds: [] });
      }
      pageToken = r.nextPageToken;
    } while (pageToken);
    const known = new Set(videos.map((v) => v.id));
    for (const p of playlists) p.videoIds = (await playlistVideoIds(p.id, apiKey, 300)).filter((id) => known.has(id));
  }

  return {
    generatedAt: new Date().toISOString(),
    source: 'youtube-data-api',
    channel: {
      id: c.id,
      title: c.snippet.title,
      handle: c.snippet.customUrl || '',
      description: c.snippet.description || '',
      avatar: bestThumb(c.snippet.thumbnails),
      banner: (c.brandingSettings && c.brandingSettings.image && c.brandingSettings.image.bannerExternalUrl) || '',
      subscribers: +(c.statistics.subscriberCount || 0),
      videoCount: +(c.statistics.videoCount || 0),
      views: +(c.statistics.viewCount || 0),
    },
    videos,
    playlists: playlists.filter((p) => p.videoIds.length),
  };
}
