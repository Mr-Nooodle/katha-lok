// Katha Lok — streaming-style front end for the YouTube channel.
// Plain ES modules, hash routing, YouTube IFrame player. No build step.
import { fetchChannelData, looksLikeShort } from './yt-api.js';

const CFG = window.KATHA_CONFIG || {};
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const topbar = $('#topbar');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const SUB_URL = `${CFG.channelUrl}?sub_confirmation=1`;

/* ================= language ================= */
const I18N = {
  en: {
    skip: 'Skip to content', home: 'Home', series: 'Series', shorts: 'Shorts', mylist: 'My List', searchShort: 'Search', subscribe: 'Subscribe',
    play: 'Play', resume: 'Resume', addList: 'My List', inList: 'In My List', allEpisodes: 'All episodes', episodes: 'Episodes',
    continue: 'Continue watching', newEps: 'New episodes', shortsSub: 'One-minute stories', top10: 'Top 10 on Katha Lok', all: 'All stories', seeAll: 'See all',
    new: 'New', newEpisode: 'New episode', minLeft: '{n} min left', watched: 'Watched', nEpisodes: '{n} episodes', nEpisode: '1 episode', nMin: '{n} min', nShorts: '{n} Shorts',
    start: 'Start watching', continueEp: 'Continue Ep {n}', nextEpN: 'Next: Ep {n}', rewatch: 'Watch again',
    nextEpisode: 'Next episode', nextShort: 'Next Short', upNext: 'Up next', moreStories: 'More stories', nowPlaying: 'Now playing',
    share: 'Share', copied: 'Link copied', onYoutube: 'YouTube', about: 'About this story', chapters: 'Chapters', showMore: 'Show more', showLess: 'Show less',
    nextIn: 'Next episode in {n}', playNow: 'Play now', cancel: 'Cancel', back: 'Back',
    searchPh: 'Search stories, characters, places…', recent: 'Recent searches', suggestions: 'Try', noResults: 'No stories found for “{q}”', noResultsHint: 'Try another word, in English or Hindi.',
    results: '{n} results', result: '1 result', seeAllResults: 'See all results', episodeLabel: 'Episode', shortLabel: 'Short',
    emptyList: 'Your list is empty', emptyListHint: 'Tap “+ My List” on any story to save it here. Your list stays in this browser.', browse: 'Browse stories',
    added: 'Added to My List', removed: 'Removed from My List', undo: 'Undo', forgot: 'Removed from Continue watching', remove: 'Remove',
    newSince: '{n} new since your last visit', newSince1: '1 new story since your last visit', look: 'Show me',
    tagline: 'Untold stories from Indian mythology, the epics and history, told in Hindi.',
    hosted: 'All videos are hosted on YouTube.', updated: 'Updated {d}', videos: '{n} videos',
    seriesLabel: 'Series', allSeries: 'All series', seriesIntro: 'Every series, in order, from the first episode.',
    views: '{n} views', loadFail: 'Couldn’t load the stories.', notFound: 'Page not found', goHome: 'Go home', close: 'Close',
    feedHint: 'Swipe or use ↑ ↓', toLight: 'Switch to light mode', toDark: 'Switch to dark mode', ep: 'Ep',
    title: 'Katha Lok · Untold stories of India', footerLinks: 'Explore', watchOn: 'Watch on YouTube',
    trailerTag: 'Channel trailer', trailerTitle: 'Untold stories of India, told in full', trailerAlt: 'भारत की अनसुनी कथाएँ',
    trailerDesc: 'Myths, epics and history from the original texts, brought back to life in art and sound. New stories every Monday, Wednesday and Friday.',
    watchTrailer: 'Watch trailer', startSeries: 'Start {s} · Ep 1',
    likeOnYt: 'Like on YouTube', commentsN: '{n} comments', comments0: 'Comments', yourTake: 'Your take',
    defaultQ: 'What did you think of this story? Which moment stayed with you?', answerOnYt: 'Answer on YouTube',
    readAll: 'Read all {n} comments on YouTube', topComments: 'Top comments', engageNote: 'Plays here count as YouTube views. Likes and comments are made on YouTube.',
    shareTitle: 'Share this story', whatsapp: 'WhatsApp', copyLink: 'Copy link', moreApps: 'More apps', startAt: 'Start at {t}',
    theater: 'Theater mode', shortcuts: 'Keyboard: K play/pause · J/L −/+10s · M mute · F full screen · T theater · N next',
    fullStory: 'Watch the full story', progressOf: '{w} of {n} watched',
    releaseTitle: 'New stories every week', today: 'Today', tomorrow: 'Tomorrow', inDays: 'In {n} days', bell: 'Subscribe & turn on the bell',
    install: 'Install the app', installed: 'Katha Lok is installed', joinWa: 'Join on WhatsApp',
  },
  hi: {
    skip: 'सामग्री पर जाएँ', home: 'होम', series: 'सीरीज़', shorts: 'Shorts', mylist: 'मेरी सूची', searchShort: 'खोजें', subscribe: 'सब्सक्राइब',
    play: 'देखें', resume: 'जारी रखें', addList: 'मेरी सूची', inList: 'सूची में है', allEpisodes: 'सभी एपिसोड', episodes: 'एपिसोड',
    continue: 'देखना जारी रखें', newEps: 'नए एपिसोड', shortsSub: 'एक मिनट की कथाएँ', top10: 'कथा लोक पर टॉप 10', all: 'सभी कथाएँ', seeAll: 'सभी देखें',
    new: 'नया', newEpisode: 'नया एपिसोड', minLeft: '{n} मिनट बाकी', watched: 'देख लिया', nEpisodes: '{n} एपिसोड', nEpisode: '1 एपिसोड', nMin: '{n} मिनट', nShorts: '{n} Shorts',
    start: 'शुरू से देखें', continueEp: 'जारी रखें: Ep {n}', nextEpN: 'अगला: Ep {n}', rewatch: 'फिर से देखें',
    nextEpisode: 'अगला एपिसोड', nextShort: 'अगला Short', upNext: 'आगे देखें', moreStories: 'और कथाएँ', nowPlaying: 'अभी चल रहा है',
    share: 'शेयर', copied: 'लिंक कॉपी हो गया', onYoutube: 'YouTube', about: 'इस कथा के बारे में', chapters: 'अध्याय', showMore: 'और पढ़ें', showLess: 'कम दिखाएँ',
    nextIn: 'अगला एपिसोड {n} सेकंड में', playNow: 'अभी चलाएँ', cancel: 'रोकें', back: 'वापस',
    searchPh: 'कथा, पात्र या स्थान खोजें…', recent: 'हाल की खोजें', suggestions: 'सुझाव', noResults: '“{q}” के लिए कोई कथा नहीं मिली', noResultsHint: 'कोई दूसरा शब्द लिखकर देखें, हिंदी या English में।',
    results: '{n} परिणाम', result: '1 परिणाम', seeAllResults: 'सभी परिणाम देखें', episodeLabel: 'एपिसोड', shortLabel: 'Short',
    emptyList: 'आपकी सूची में अभी कोई कथा नहीं है', emptyListHint: 'किसी भी कथा पर “+ मेरी सूची” दबाएँ। सूची इसी ब्राउज़र में रहती है।', browse: 'कथाएँ देखें',
    added: 'मेरी सूची में जोड़ा', removed: 'मेरी सूची से हटाया', undo: 'वापस लें', forgot: '“देखना जारी रखें” से हटाया', remove: 'हटाएँ',
    newSince: 'पिछली बार के बाद {n} नई कथाएँ', newSince1: 'पिछली बार के बाद 1 नई कथा', look: 'दिखाएँ',
    tagline: 'पुराणों, महाकाव्यों और इतिहास की अनसुनी कथाएँ, हिंदी में।',
    hosted: 'सभी वीडियो YouTube पर हैं।', updated: 'अपडेट: {d}', videos: '{n} वीडियो',
    seriesLabel: 'सीरीज़', allSeries: 'सभी सीरीज़', seriesIntro: 'हर सीरीज़ पहले एपिसोड से, क्रम में।',
    views: '{n} बार देखा गया', loadFail: 'कथाएँ लोड नहीं हो सकीं।', notFound: 'यह पन्ना नहीं मिला', goHome: 'होम पर जाएँ', close: 'बंद करें',
    feedHint: 'ऊपर-नीचे स्वाइप करें', toLight: 'लाइट मोड', toDark: 'डार्क मोड', ep: 'Ep',
    title: 'कथा लोक · भारत की अनसुनी कथाएँ', footerLinks: 'देखें', watchOn: 'YouTube पर देखें',
    trailerTag: 'चैनल ट्रेलर', trailerTitle: 'भारत की अनसुनी कथाएँ, पूरी', trailerAlt: 'Untold stories of India',
    trailerDesc: 'मूल ग्रंथों से, प्रामाणिक स्रोतों के साथ, चित्रों और ध्वनि में फिर से जीवित। हर सोमवार, बुधवार और शुक्रवार नई कथा।',
    watchTrailer: 'ट्रेलर देखें', startSeries: '{s} शुरू करें · Ep 1',
    likeOnYt: 'YouTube पर लाइक करें', commentsN: '{n} कमेंट', comments0: 'कमेंट', yourTake: 'आपकी राय',
    defaultQ: 'यह कथा आपको कैसी लगी? कौन सा पल याद रह गया?', answerOnYt: 'YouTube पर जवाब दें',
    readAll: 'YouTube पर सभी {n} कमेंट पढ़ें', topComments: 'चुनिंदा कमेंट', engageNote: 'यहाँ देखने पर YouTube व्यू गिना जाता है। लाइक और कमेंट YouTube पर होते हैं।',
    shareTitle: 'यह कथा शेयर करें', whatsapp: 'WhatsApp', copyLink: 'लिंक कॉपी करें', moreApps: 'और ऐप', startAt: '{t} से शुरू करें',
    theater: 'थिएटर मोड', shortcuts: 'कीबोर्ड: K चलाएँ/रोकें · J/L 10 सेकंड पीछे/आगे · M म्यूट · F फ़ुल स्क्रीन · T थिएटर · N अगला',
    fullStory: 'पूरी कथा देखें', progressOf: '{n} में से {w} देखे',
    releaseTitle: 'हर सप्ताह नई कथाएँ', today: 'आज', tomorrow: 'कल', inDays: '{n} दिन में', bell: 'सब्सक्राइब करें और घंटी दबाएँ',
    install: 'ऐप इंस्टॉल करें', installed: 'कथा लोक इंस्टॉल हो गया', joinWa: 'WhatsApp पर जुड़ें',
  },
};
let lang = root.lang === 'hi' ? 'hi' : 'en';
const t = (k, vars = {}) => String(I18N[lang][k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? '');

/* ================= storage (per-viewer conveniences) ================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('kl:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('kl:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
let myList = store.get('mylist', []);
let progress = store.get('progress', {});
let recent = store.get('recent', []);
const prevVisit = (() => {
  try { const s = sessionStorage.getItem('kl:prev'); if (s !== null) return +s; } catch { /* */ }
  const p = store.get('lastVisit', 0);
  try { sessionStorage.setItem('kl:prev', String(p)); } catch { /* */ }
  store.set('lastVisit', Date.now());
  return p;
})();

/* ================= data ================= */
async function loadData() {
  if (CFG.apiKey) {
    const cached = store.get('live');
    if (cached && Date.now() - cached.at < 30 * 60e3) return cached.data;
    try {
      const data = await fetchChannelData({ apiKey: CFG.apiKey, channelId: CFG.channelId });
      store.set('live', { at: Date.now(), data });
      return data;
    } catch (e) { console.warn('Live YouTube read failed, using the snapshot instead.', e); }
  }
  const r = await fetch(`${CFG.dataUrl}?v=${Math.floor(Date.now() / 6e5)}`);
  if (!r.ok) throw new Error(`${CFG.dataUrl} (${r.status})`);
  return r.json();
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFC');
const slugify = (s) => norm(s).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
function epNum(v) {
  const m = /\b(?:Ep|Episode)\.?\s*0*(\d{1,3})\b/i.exec(v.title) || /(?:भाग|एपिसोड)\s*0*(\d{1,3})/.exec(v.title);
  return m ? +m[1] : null;
}
const epSort = (a, b) => (epNum(a) ?? 1e9) - (epNum(b) ?? 1e9) || a.published.localeCompare(b.published);

let M;
function buildModel(data) {
  const videos = (data.videos || []).map((v) => ({ ...v, isShort: v.isShort ?? looksLikeShort(v) }))
    .sort((a, b) => b.published.localeCompare(a.published));
  const byId = new Map(videos.map((v) => [v.id, v]));
  const longs = videos.filter((v) => !v.isShort);
  const shorts = videos.filter((v) => v.isShort);
  const playlists = (data.playlists || []).map((p) => ({ ...p, used: false }));
  const series = (CFG.series || []).map((s) => {
    const re = new RegExp(s.match, 'i');
    const ids = new Set(longs.filter((v) => re.test(v.title)).map((v) => v.id));
    const pl = playlists.find((p) => !p.used && (re.test(p.title) || norm(p.title).includes(norm(s.hi)) || norm(p.title).includes(norm(s.en))));
    if (pl) { pl.used = true; pl.videoIds.forEach((id) => { const v = byId.get(id); if (v && !v.isShort) ids.add(id); }); }
    return { ...s, episodes: [...ids].map((id) => byId.get(id)).sort(epSort), shorts: shorts.filter((v) => re.test(v.title)) };
  }).filter((s) => s.episodes.length);
  for (const p of playlists) {
    if (p.used) continue;
    const eps = p.videoIds.map((id) => byId.get(id)).filter((v) => v && !v.isShort);
    const line = (p.description || '').split('\n')[0];
    if (eps.length >= 2) series.push({ slug: slugify(p.title) || p.id, en: p.title, hi: p.title, tagline: { en: line, hi: line }, episodes: eps.sort(epSort), shorts: [] });
  }
  const seriesOf = new Map();
  series.forEach((s) => s.episodes.forEach((v) => { if (!seriesOf.has(v.id)) seriesOf.set(v.id, s); }));
  return { data, videos, byId, longs, shorts, series, seriesOf };
}

/* ================= text helpers ================= */
const sname = (s) => (lang === 'hi' ? s.hi : s.en) || s.en || s.hi;
const salt = (s) => (lang === 'hi' ? s.en : s.hi);
const DEV = /[ऀ-ॿ]/g, LAT = /[A-Za-z]/g;
const scriptOf = (s) => ((s.match(DEV) || []).length >= (s.match(LAT) || []).length ? 'hi' : 'en');
const stripTags = (s) => s.replace(/#[\p{L}\p{N}_]+/gu, ' ').replace(/\s{2,}/g, ' ').trim();

/** Language-aware title: { main, alt, altLang }. Uses config overrides, else the matching script's part of the YouTube title. */
const titleCache = new Map();
function titleParts(v) {
  const key = v.id + lang;
  if (titleCache.has(key)) return titleCache.get(key);
  const parts = stripTags(v.title).split(/\s*\|\s*/).filter(Boolean);
  if (parts.length > 1 && /\bEp\.?\s*\d/i.test(parts[0])) parts.shift();
  const seriesNames = new Set((CFG.series || []).flatMap((s) => [norm(s.en), norm(s.hi)]));
  const segs = parts.flatMap((p) => p.split(/\s*(?:\p{Extended_Pictographic}|️|‍)+\s*/u))
    .map((s) => s.replace(/\s*(full story )?in hindi\s*$/i, '').replace(/[\s—–-]+$/, '').trim())
    .filter((s) => s.length > 2);
  const pick = (code) => { const a = segs.filter((s) => scriptOf(s) === code); return a.find((s) => !seriesNames.has(norm(s))) || ''; };
  const ov = (CFG.titles || {})[v.id] || {};
  const en = ov.en || pick('en'), hi = ov.hi || pick('hi');
  const main = (lang === 'en' ? en || hi : hi || en) || v.title;
  const alt = lang === 'en' ? (hi && hi !== main ? hi : '') : (en && en !== main ? en : '');
  const out = { main, alt, altLang: lang === 'en' ? 'hi' : 'en' };
  titleCache.set(key, out);
  return out;
}
function kicker(v) {
  const s = M.seriesOf.get(v.id), n = epNum(v);
  if (s && n) return `${sname(s)} · ${t('ep')} ${n}`;
  if (s) return sname(s);
  return v.isShort ? 'Shorts' : '';
}
function blurb(v, max = 220) {
  const lines = (v.description || '').split('\n').map((l) => l.trim())
    .filter((l) => l && !/^(#|http|www\.|[-–•*]|\d{1,2}:\d{2})/.test(l) && l.length > 25);
  const s = lines[0] || '';
  return s.length > max ? s.slice(0, max).replace(/\s+\S*$/, '') + '…' : s;
}
function fmtDur(sec) {
  if (!sec) return '';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(s).padStart(2, '0')}`;
}
const fmtDate = (iso) => new Date(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtViews = (n) => (n ? t('views', { n: new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n) }) : '');
const minutesLeft = (id) => { const p = progress[id]; return p && p.d && !p.done ? Math.max(1, Math.round((p.d - p.t) / 60)) : 0; };
const isNew = (v) => { const ts = Date.parse(v.published); return Date.now() - ts < 3 * 864e5 || (prevVisit > 0 && ts > prevVisit); };
const meta = (...a) => a.filter(Boolean).map(esc).join('<span class="dot" aria-hidden="true">·</span>');
const href = (v) => (v.isShort ? `#/shorts/${v.id}` : `#/watch/${v.id}`);

/* ================= thumbnails ================= */
const yt = (id, name) => `https://i.ytimg.com/vi/${id}/${name}.jpg`;
function thumbImg(v, kind = 'card', attrs = '') {
  const chain = kind === 'short' ? [yt(v.id, 'oar2'), yt(v.id, 'hq720'), yt(v.id, 'hqdefault')]
    : kind === 'hero' ? [yt(v.id, 'maxresdefault'), yt(v.id, 'hq720'), v.thumb, yt(v.id, 'hqdefault')]
    : kind === 'mini' ? [yt(v.id, 'mqdefault')]
    : [yt(v.id, 'hq720'), v.thumb, yt(v.id, 'mqdefault')];
  const [first, ...rest] = [...new Set(chain.filter(Boolean))];
  return `<img src="${esc(first)}" data-fb="${esc(rest.join('|'))}" alt="" decoding="async" ${attrs || 'loading="lazy"'}>`;
}
function nextThumb(img) {
  const list = (img.dataset.fb || '').split('|').filter(Boolean);
  if (!list.length) return;
  img.src = list.shift();
  img.dataset.fb = list.join('|');
}
// YouTube answers a missing size with a 120x90 grey placeholder: treat that as an error too.
document.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') nextThumb(e.target); }, true);
document.addEventListener('load', (e) => { const i = e.target; if (i.tagName === 'IMG' && i.dataset.fb && i.naturalWidth <= 120) nextThumb(i); }, true);

/* ================= components ================= */
function listBtn(id, variant = '') {
  const on = myList.includes(id);
  return `<button type="button" class="btn ${variant === 'icon' ? 'btn-round' : 'btn-ghost'}${on ? ' on' : ''}" data-list="${id}" aria-pressed="${on}" ${variant === 'icon' ? `aria-label="${esc(t(on ? 'inList' : 'addList'))}"` : ''}>${icon(on ? 'check' : 'plus')}${variant === 'icon' ? '' : `<span>${esc(t(on ? 'inList' : 'addList'))}</span>`}</button>`;
}
function progressBar(id) {
  const p = progress[id];
  if (!p || !p.d) return '';
  return `<span class="progress" aria-hidden="true"><i style="width:${p.done ? 100 : Math.min(100, (p.t / p.d) * 100).toFixed(1)}%"></i></span>`;
}
function card(v, { rank = 0, forget = false } = {}) {
  const tp = titleParts(v);
  const left = minutesLeft(v.id);
  const sub = forget && left ? t('minLeft', { n: left }) : kicker(v) || fmtDate(v.published);
  return `<article class="card${rank ? ' ranked' : ''}" data-id="${v.id}">
    ${rank ? `<span class="rank" aria-hidden="true">${rank}</span>` : ''}
    <a class="card-link" href="${href(v)}">
      <div class="thumb">${thumbImg(v)}
        ${isNew(v) ? `<span class="badge">${esc(t('new'))}</span>` : ''}
        ${v.duration ? `<span class="dur">${fmtDur(v.duration)}</span>` : ''}
        <div class="card-hover"><span class="play-dot">${icon('play', 22)}</span>${blurb(v, 130) ? `<p lang="hi">${esc(blurb(v, 130))}</p>` : ''}</div>
        ${progressBar(v.id)}
      </div>
      <div class="card-text"><h3>${esc(tp.main)}</h3><p>${esc(sub)}</p></div>
    </a>
    ${forget ? `<button type="button" class="card-x" data-forget="${v.id}" aria-label="${esc(t('remove'))}">${icon('close', 16)}</button>` : ''}
  </article>`;
}
function shortCard(v) {
  return `<article class="card short" data-id="${v.id}"><a class="card-link" href="${href(v)}">
    <div class="thumb">${thumbImg(v, 'short')}${isNew(v) ? `<span class="badge">${esc(t('new'))}</span>` : ''}
      ${v.views ? `<span class="short-views">${icon('play', 12)}${esc(new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v.views))}</span>` : ''}
      <span class="short-title">${esc(titleParts(v).main)}</span>
    </div></a></article>`;
}
function row({ title, sub, link, items, kind = 'card', forget = false, id = '' }) {
  if (!items.length) return '';
  const cards = items.map((v, i) => (kind === 'short' ? shortCard(v) : card(v, { rank: kind === 'ranked' ? i + 1 : 0, forget }))).join('');
  return `<section class="row row-${kind}"${id ? ` id="${id}"` : ''}>
    <div class="row-head"><h2>${esc(title)}${sub ? ` <span class="row-sub">${esc(sub)}</span>` : ''}</h2>${link ? `<a class="see-all" href="${link}">${esc(t('seeAll'))}${icon('right', 16)}</a>` : ''}</div>
    <div class="rail-wrap">
      <button type="button" class="rail-btn prev" data-rail="-1" aria-label="Previous">${icon('left', 22)}</button>
      <div class="rail">${cards}</div>
      <button type="button" class="rail-btn next" data-rail="1" aria-label="Next">${icon('right', 22)}</button>
    </div></section>`;
}
const grid = (items, kind = 'card') => `<div class="grid grid-${kind}">${items.map((v) => (kind === 'short' ? shortCard(v) : card(v))).join('')}</div>`;
const emptyState = (title, hint, btn = true) => `<div class="empty"><svg class="empty-mark" width="44" height="62" aria-hidden="true"><use href="#mark"/></svg><h2>${esc(title)}</h2>${hint ? `<p>${esc(hint)}</p>` : ''}${btn ? `<a class="btn btn-accent" href="#/">${esc(t('browse'))}</a>` : ''}</div>`;

/* ================= pages ================= */
function heroSlides() {
  const ex = new Set(CFG.heroExclude || []);
  return M.longs.filter((v) => !ex.has(v.id)).slice(0, 5);
}
function playLabel(v) { return progress[v.id] && !progress[v.id].done && progress[v.id].t > 15 ? t('resume') : t('play'); }
function heroSlide(v, i) {
  const tp = titleParts(v), s = M.seriesOf.get(v.id);
  return `<div class="hero-slide${i ? '' : ' active'}" data-i="${i}" ${i ? 'aria-hidden="true" inert' : ''}>
    <p class="eyebrow">${isNew(v) ? `<span class="tag">${esc(t('newEpisode'))}</span>` : ''}<span>${esc(kicker(v))}</span></p>
    <h1 class="hero-title">${esc(tp.main)}</h1>
    ${tp.alt ? `<p class="hero-alt" lang="${tp.altLang}">${esc(tp.alt)}</p>` : ''}
    <p class="meta">${meta(fmtDate(v.published), fmtDur(v.duration), fmtViews(v.views))}</p>
    ${blurb(v) ? `<p class="hero-desc" lang="hi">${esc(blurb(v))}</p>` : ''}
    <div class="hero-actions">
      <a class="btn btn-accent btn-lg" href="${href(v)}">${icon('play', 20)}<span>${esc(playLabel(v))}</span></a>
      ${listBtn(v.id)}
      ${s ? `<a class="btn btn-text" href="#/series/${s.slug}">${esc(t('allEpisodes'))}${icon('right', 16)}</a>` : ''}
    </div>
  </div>`;
}
/** Trailer slide: the promo clip plays silently behind the copy; "Watch trailer" opens the full film with sound. */
function promoSlide() {
  const P = CFG.promo;
  const first = M.series[0];
  return `<div class="hero-slide active" data-i="0">
    <p class="eyebrow"><span class="tag">${esc(t('trailerTag'))}</span><span>Katha Lok · ${esc(fmtDur((M.byId.get(P.videoId) || {}).duration) || '1:24')}</span></p>
    <h1 class="hero-title">${esc(t('trailerTitle'))}</h1>
    <p class="hero-alt" lang="${lang === 'en' ? 'hi' : 'en'}">${esc(t('trailerAlt'))}</p>
    <p class="hero-desc">${esc(t('trailerDesc'))}</p>
    <div class="hero-actions">
      <a class="btn btn-accent btn-lg" href="#/watch/${P.videoId}">${icon('play', 20)}<span>${esc(t('watchTrailer'))}</span></a>
      ${first ? `<a class="btn btn-ghost btn-lg" href="${href(first.episodes[0])}">${esc(t('startSeries', { s: sname(first) }))}</a>` : ''}
    </div>
  </div>`;
}
function hero(slides) {
  const P = CFG.promo;
  const withPromo = !!(P && P.clip);
  if (!slides.length && !withPromo) return '';
  const off = withPromo ? 1 : 0;
  const arts = slides.map((v, i) => `<div class="hero-img${i + off ? '' : ' active'}">${thumbImg(v, 'hero', i + off ? 'loading="lazy"' : 'fetchpriority="high"')}</div>`);
  const bodies = slides.map((v, i) => heroSlide(v, i + off));
  const picks = slides.map((v, i) => `<button type="button" role="tab" class="pick${i + off ? '' : ' active'}" data-pick="${i + off}" aria-selected="${!(i + off)}" aria-label="${esc(titleParts(v).main)}">${thumbImg(v, 'mini')}<span class="pick-bar"><i></i></span></button>`);
  if (withPromo) {
    arts.unshift(`<div class="hero-img is-video active"><video id="promoClip" muted playsinline preload="none" poster="${esc(P.firstFrame || P.poster)}" aria-hidden="true"></video></div>`);
    bodies.unshift(promoSlide());
    picks.unshift(`<button type="button" role="tab" class="pick active" data-pick="0" aria-selected="true" aria-label="${esc(t('trailerTag'))}" style="--dur:10s"><img src="${esc(P.poster)}" alt=""><span class="pick-bar"><i></i></span></button>`);
  }
  return `<section class="hero" id="hero" aria-roledescription="carousel">
    <div class="hero-art">${arts.join('')}</div>
    <div class="hero-scrim"></div>
    <div class="hero-body">${bodies.join('')}</div>
    ${picks.length > 1 ? `<div class="hero-picker" role="tablist">${picks.join('')}</div>` : ''}
  </section>`;
}
function promoPlayback(on) {
  const vid = $('#promoClip');
  if (!vid) return;
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  if (!on || quiet) { vid.pause(); if (quiet) vid.poster = CFG.promo.poster; return; }
  if (!vid.src) vid.src = window.innerWidth < 860 ? CFG.promo.clipSmall || CFG.promo.clip : CFG.promo.clip;
  vid.currentTime = 0;
  vid.play().catch(() => { vid.poster = CFG.promo.poster; });
}
function chipsBar() {
  const chips = M.series.map((s) => `<a class="chip" href="#/series/${s.slug}">${esc(sname(s))}<span>${s.episodes.length}</span></a>`);
  if (M.shorts.length) chips.push(`<a class="chip" href="#/shorts">Shorts<span>${M.shorts.length}</span></a>`);
  return `<nav class="chips" aria-label="${esc(t('series'))}">${chips.join('')}</nav>`;
}
/** Weekly release calendar with the next release highlighted. */
function releaseStrip() {
  const S = CFG.schedule || [];
  if (!S.length) return '';
  const now = new Date();
  const today = now.getDay();
  const releasedToday = M.longs.some((v) => v.id !== (CFG.promo || {}).videoId && new Date(v.published).toDateString() === now.toDateString());
  const wait = (s) => { const d = (s.day - today + 7) % 7; return d === 0 && releasedToday ? 7 : d; };
  const next = [...S].sort((a, b) => wait(a) - wait(b))[0];
  const dayName = (d) => { const x = new Date(now); x.setDate(now.getDate() + ((d - today + 7) % 7)); return x.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' }); };
  const w = wait(next);
  const when = w === 0 ? t('today') : w === 1 ? t('tomorrow') : t('inDays', { n: w });
  return `<section class="release" aria-label="${esc(t('releaseTitle'))}">
    <div class="release-head"><svg class="release-mark" width="26" height="36" aria-hidden="true"><use href="#mark"/></svg><h2>${esc(t('releaseTitle'))}</h2></div>
    <ol class="release-days">${S.map((s) => `<li class="${s === next ? 'next' : ''}"><span class="rd-day">${esc(dayName(s.day))}</span><span class="rd-what">${esc(s[lang] || s.en)}</span>${s === next ? `<span class="rd-when">${esc(when)}</span>` : ''}</li>`).join('')}</ol>
    <a class="btn btn-accent" href="${SUB_URL}" target="_blank" rel="noopener">${icon('bell', 18)}<span>${esc(t('bell'))}</span></a>
  </section>`;
}
const watchedIn = (s) => s.episodes.filter((v) => progress[v.id] && progress[v.id].done).length;
function seriesProgress(s) {
  const w = watchedIn(s);
  if (!w) return '';
  return `<div class="sprog"><span class="sprog-bar"><i style="width:${(w / s.episodes.length) * 100}%"></i></span><span>${esc(t('progressOf', { w, n: s.episodes.length }))}</span></div>`;
}
/** Shorts → long form: find the episode that tells this Short's story in full (shared words in title + description). */
const tokens = (s) => new Set(norm(s).split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length >= 4));
const fullStoryCache = new Map();
let commonWords = null; // words found in many videos (channel boilerplate, hashtags) say nothing about the story
function fullStoryFor(sv) {
  if (fullStoryCache.has(sv.id)) return fullStoryCache.get(sv.id);
  if (!commonWords) {
    const df = new Map();
    M.videos.forEach((v) => tokens(`${v.title} ${v.description}`).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
    commonWords = new Set([...df].filter(([, n]) => n > Math.max(2, M.videos.length * 0.25)).map(([w]) => w));
  }
  const st = new Set([...tokens(`${sv.title} ${sv.description}`)].filter((w) => !commonWords.has(w)));
  let best = null, score = 0;
  for (const v of M.longs) {
    if (CFG.promo && v.id === CFG.promo.videoId) continue;
    const lt = tokens(`${v.title} ${v.description}`);
    if (lt.has(sv.id.toLowerCase())) { best = v; score = 99; break; } // the episode's description links this Short
    let sc = 0;
    st.forEach((w) => { if (lt.has(w)) sc += 1; });
    if (sc > score) { score = sc; best = v; }
  }
  const out = score >= 4 ? best : null;
  fullStoryCache.set(sv.id, out);
  return out;
}
function continueItems() {
  return Object.entries(progress).filter(([id, p]) => M.byId.has(id) && !p.done && p.t > 15)
    .sort((a, b) => b[1].at - a[1].at).map(([id]) => M.byId.get(id)).slice(0, 12);
}
function homePage() {
  const out = [hero(heroSlides()), '<div class="rows">', chipsBar()];
  out.push(row({ title: t('continue'), items: continueItems(), forget: true }));
  out.push(row({ title: t('newEps'), items: M.longs.slice(0, 20), id: 'new' }));
  out.push(releaseStrip());
  const shortsRow = row({ title: 'Shorts', sub: t('shortsSub'), link: '#/shorts', items: M.shorts.slice(0, 20), kind: 'short' });
  M.series.forEach((s, i) => {
    out.push(row({ title: sname(s), sub: s.episodes.length > 1 ? t('nEpisodes', { n: s.episodes.length }) : '', link: `#/series/${s.slug}`, items: s.episodes }));
    if (i === 0) out.push(shortsRow);
  });
  if (!M.series.length) out.push(shortsRow);
  const popular = M.longs.filter((v) => v.views).sort((a, b) => b.views - a.views).slice(0, 10);
  if (popular.length >= 3) out.push(row({ title: t('top10'), items: popular, kind: 'ranked' }));
  out.push(row({ title: t('mylist'), link: '#/mylist', items: myList.map((id) => M.byId.get(id)).filter(Boolean) }));
  out.push(row({ title: t('all'), items: M.longs }));
  out.push('</div>');
  return out.join('');
}
function seriesIndex() {
  return `<section class="page"><header class="page-head"><p class="eyebrow">${esc(t('seriesLabel'))}</p><h1>${esc(t('allSeries'))}</h1><p>${esc(t('seriesIntro'))}</p></header>
    <div class="series-grid">${M.series.map((s) => `<a class="series-tile" href="#/series/${s.slug}">
        ${thumbImg(s.episodes[s.episodes.length - 1])}<div class="series-tile-scrim"></div>
        <div class="series-tile-text"><h2>${esc(sname(s))}</h2>${salt(s) && salt(s) !== sname(s) ? `<p class="alt">${esc(salt(s))}</p>` : ''}
          <p class="series-tile-meta">${meta(s.episodes.length === 1 ? t('nEpisode') : t('nEpisodes', { n: s.episodes.length }), s.shorts.length ? t('nShorts', { n: s.shorts.length }) : '')}</p>
          ${s.tagline ? `<p class="series-tile-tag">${esc(s.tagline[lang] || s.tagline.en)}</p>` : ''}${seriesProgress(s)}</div></a>`).join('')}</div></section>`;
}
function resumeTarget(s) {
  const started = s.episodes.filter((v) => progress[v.id]).sort((a, b) => progress[b.id].at - progress[a.id].at)[0];
  const n = (v) => epNum(v) ?? s.episodes.indexOf(v) + 1;
  if (!started) return { v: s.episodes[0], label: t('start') };
  if (progress[started.id].done) {
    const nxt = s.episodes[s.episodes.indexOf(started) + 1];
    return nxt ? { v: nxt, label: t('nextEpN', { n: n(nxt) }) } : { v: s.episodes[0], label: t('rewatch') };
  }
  return { v: started, label: t('continueEp', { n: n(started) }) };
}
function epStatus(v) {
  const p = progress[v.id];
  if (p && p.done) return `<span class="status done">${icon('check', 14)}${esc(t('watched'))}</span>`;
  const left = minutesLeft(v.id);
  return left && p.t > 15 ? `<span class="status">${icon('clock', 14)}${esc(t('minLeft', { n: left }))}</span>` : '';
}
function seriesPage(slug) {
  const s = M.series.find((x) => x.slug === slug);
  if (!s) return notFound();
  const r = resumeTarget(s);
  const total = s.episodes.reduce((a, v) => a + (v.duration || 0), 0);
  const latest = s.episodes[s.episodes.length - 1];
  return `<section class="hero hero-series">
      <div class="hero-art"><div class="hero-img active">${thumbImg(latest, 'hero', 'fetchpriority="high"')}</div></div><div class="hero-scrim"></div>
      <div class="hero-body"><div class="hero-slide active">
        <p class="eyebrow"><span>${esc(t('seriesLabel'))}</span></p>
        <h1 class="hero-title">${esc(sname(s))}</h1>${salt(s) && salt(s) !== sname(s) ? `<p class="hero-alt">${esc(salt(s))}</p>` : ''}
        <p class="meta">${meta(s.episodes.length === 1 ? t('nEpisode') : t('nEpisodes', { n: s.episodes.length }), total ? t('nMin', { n: Math.round(total / 60) }) : '', s.shorts.length ? t('nShorts', { n: s.shorts.length }) : '')}</p>
        ${s.tagline ? `<p class="hero-desc">${esc(s.tagline[lang] || s.tagline.en)}</p>` : ''}
        ${seriesProgress(s)}
        <div class="hero-actions"><a class="btn btn-accent btn-lg" href="${href(r.v)}">${icon('play', 20)}<span>${esc(r.label)}</span></a></div>
      </div></div></section>
    <section class="page page-tight">
      <div class="section-head"><h2>${esc(t('episodes'))}</h2><span class="count">${s.episodes.length}</span></div>
      <ol class="eplist">${s.episodes.map((v, i) => {
        const tp = titleParts(v);
        return `<li><a class="ep${progress[v.id] && progress[v.id].done ? ' is-done' : ''}" href="${href(v)}" data-id="${v.id}">
          <span class="ep-num">${epNum(v) ?? i + 1}</span>
          <div class="thumb">${thumbImg(v)}${v.duration ? `<span class="dur">${fmtDur(v.duration)}</span>` : ''}<div class="card-hover"><span class="play-dot">${icon('play', 22)}</span></div>${progressBar(v.id)}</div>
          <div class="ep-text"><h3>${esc(tp.main)}</h3>${tp.alt ? `<p class="ep-alt" lang="${tp.altLang}">${esc(tp.alt)}</p>` : ''}
            ${blurb(v, 240) ? `<p class="ep-desc" lang="hi">${esc(blurb(v, 240))}</p>` : ''}
            <p class="ep-meta">${meta(fmtDate(v.published), fmtViews(v.views))}${epStatus(v)}</p></div>
        </a></li>`;
      }).join('')}</ol>
    </section>
    <div class="rows rows-plain">${row({ title: `${sname(s)} · Shorts`, items: s.shorts, kind: 'short' })}</div>`;
}
function shortsPage() {
  return `<section class="page"><header class="page-head"><p class="eyebrow">Shorts</p><h1>${esc(t('shortsSub'))}</h1><p>${esc(t('nShorts', { n: M.shorts.length }))}</p></header>${grid(M.shorts, 'short')}</section>`;
}
function myListPage() {
  const items = myList.map((id) => M.byId.get(id)).filter(Boolean);
  const longs = items.filter((v) => !v.isShort), shorts = items.filter((v) => v.isShort);
  return `<section class="page"><header class="page-head"><h1>${esc(t('mylist'))}</h1></header>
    ${items.length ? `${longs.length ? grid(longs) : ''}${shorts.length ? `<div class="section-head"><h2>Shorts</h2></div>${grid(shorts, 'short')}` : ''}` : emptyState(t('emptyList'), t('emptyListHint'))}
  </section>`;
}
function searchVideos(q) {
  const n = norm(q).trim();
  if (!n) return [];
  const scored = [];
  for (const v of M.videos) {
    const s = M.seriesOf.get(v.id);
    const ov = (CFG.titles || {})[v.id] || {};
    const title = norm(`${v.title} ${ov.en || ''} ${ov.hi || ''} ${s ? s.en + ' ' + s.hi : ''}`);
    const body = norm(`${v.description} ${(v.tags || []).join(' ')}`);
    const score = title.includes(n) ? 2 : body.includes(n) ? 1 : 0;
    if (score) scored.push([score, v]);
  }
  return scored.sort((a, b) => b[0] - a[0] || b[1].published.localeCompare(a[1].published)).map((x) => x[1]);
}
function searchPage(q) {
  const hits = searchVideos(q);
  const longs = hits.filter((v) => !v.isShort), shorts = hits.filter((v) => v.isShort);
  return `<section class="page"><header class="page-head"><p class="eyebrow">${esc(t('searchShort'))}</p><h1>“${esc(q)}”</h1><p>${esc(hits.length === 1 ? t('result') : t('results', { n: hits.length }))}</p></header>
    ${hits.length ? `${longs.length ? grid(longs) : ''}${shorts.length ? `<div class="section-head"><h2>Shorts</h2></div>${grid(shorts, 'short')}` : ''}`
      : emptyState(t('noResults', { q }), t('noResultsHint'))}</section>`;
}
const notFound = () => `<section class="page">${emptyState(t('notFound'), '', false)}<p class="center"><a class="btn btn-accent" href="#/">${esc(t('goHome'))}</a></p></section>`;

/* ================= watch page ================= */
function parseChapters(desc = '') {
  const out = [];
  for (const line of desc.split('\n')) {
    const m = /^\s*[▶►•-]?\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s*[-–—:|]?\s*(.+)$/.exec(line);
    if (m) out.push({ sec: m[1].split(':').reduce((a, n) => a * 60 + +n, 0), label: m[2].trim() });
  }
  return out.length >= 2 && out[0].sec === 0 ? out : [];
}
function linkify(text) {
  return esc(text)
    .replace(/(https?:\/\/[^\s<]+)/g, (url) => {
      // links to our own videos stay on the site
      const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/)([\w-]{11})/.exec(url);
      const v = m && M.byId.get(m[1]);
      return v ? `<a href="${href(v)}">${esc(titleParts(v).main)}</a>` : `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    })
    .replace(/(^|\s)((?:\d{1,2}:)?\d{1,2}:\d{2})(?=\s)/gm, (m, pre, ts) => `${pre}<button type="button" class="ts" data-seek="${ts.split(':').reduce((a, n) => a * 60 + +n, 0)}">${ts}</button>`);
}
function nextOf(v) {
  if (!v) return null;
  if (v.isShort) return M.shorts[M.shorts.indexOf(v) + 1] || null;
  const s = M.seriesOf.get(v.id);
  return s ? s.episodes[s.episodes.indexOf(v) + 1] || null : null;
}
function sideItem(v, current) {
  const tp = titleParts(v);
  return `<li><a class="side-item${current ? ' current' : ''}" href="${href(v)}" ${current ? 'aria-current="true"' : ''}>
    <div class="thumb">${thumbImg(v)}${v.duration ? `<span class="dur">${fmtDur(v.duration)}</span>` : ''}${progressBar(v.id)}${current ? `<span class="now">${icon('play', 14)}</span>` : ''}</div>
    <div class="side-text"><p class="side-kicker">${esc(current ? t('nowPlaying') : kicker(v) || fmtDate(v.published))}</p><h3>${esc(tp.main)}</h3></div>
  </a></li>`;
}
const fmtNum = (n) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
/** Engagement lives on YouTube: we show the numbers and top comments, then send people there to like and comment. */
function engagePanel(v) {
  const q = (CFG.questions || {})[v.id];
  const question = q ? q[lang] || q.en : t('defaultQ');
  const ytUrl = `https://www.youtube.com/watch?v=${v.id}`;
  const cm = v.comments || [];
  return `<section class="panel engage">
    <div class="engage-stats">
      <a class="stat" href="${ytUrl}" target="_blank" rel="noopener">${icon('like', 20)}<span>${v.likes ? `<b>${fmtNum(v.likes)}</b> · ` : ''}${esc(t('likeOnYt'))}</span></a>
      <a class="stat" href="${ytUrl}" target="_blank" rel="noopener">${icon('comment', 20)}<span>${esc(v.commentCount ? t('commentsN', { n: fmtNum(v.commentCount) }) : t('comments0'))}</span></a>
      <a class="btn btn-accent btn-sm" href="${SUB_URL}" target="_blank" rel="noopener">${icon('bell', 18)}<span>${esc(t('subscribe'))}</span></a>
    </div>
    <div class="take">
      <p class="eyebrow"><span>${esc(t('yourTake'))}</span></p>
      <p class="take-q">${esc(question)}</p>
      <a class="btn btn-ghost" href="${ytUrl}" target="_blank" rel="noopener">${icon('comment', 18)}<span>${esc(t('answerOnYt'))}</span></a>
    </div>
    ${cm.length ? `<h3 class="cm-title">${esc(t('topComments'))}</h3><ul class="comments">${cm.map((c) => `<li>
        ${c.avatar ? `<img src="${esc(c.avatar)}" alt="" width="36" height="36" loading="lazy" referrerpolicy="no-referrer">` : `<span class="c-avatar" aria-hidden="true">${esc((c.author || '?').replace(/^@/, '').charAt(0).toUpperCase())}</span>`}
        <div><p class="c-head"><b>${esc(c.author)}</b><span>${esc(fmtDate(c.published))}</span></p><p class="c-text">${esc(c.text)}</p>
        <p class="c-meta">${icon('like', 14)}${c.likes ? fmtNum(c.likes) : ''}${c.replies ? `<span>${icon('comment', 14)}${c.replies}</span>` : ''}</p></div></li>`).join('')}</ul>
      <a class="btn btn-text" href="${ytUrl}" target="_blank" rel="noopener">${esc(t('readAll', { n: fmtNum(v.commentCount || cm.length) }))}${icon('right', 16)}</a>` : ''}
    <p class="engage-note">${icon('yt', 16)}${esc(t('engageNote'))}</p>
  </section>`;
}
function watchPage(id) {
  const v = M.byId.get(id);
  if (v && v.isShort) { location.replace(`#/shorts/${id}`); return null; }
  if (!v) {
    return `<div class="watch"><div class="watch-main"><div class="player-box"><div id="ytPlayer" data-vid="${esc(id)}"></div></div>
      <div class="watch-actions"><a class="btn btn-ghost" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(id)}">${icon('yt')}<span>${esc(t('watchOn'))}</span></a></div></div></div>`;
  }
  const tp = titleParts(v), s = M.seriesOf.get(id), nxt = nextOf(v), chapters = parseChapters(v.description);
  const side = s && s.episodes.length > 1 ? s.episodes : [v, ...M.longs.filter((x) => x !== v).slice(0, 10)];
  return `<div class="watch">
    <div class="watch-main">
      <button type="button" class="back-link" data-back>${icon('left', 18)}<span>${esc(t('back'))}</span></button>
      <div class="player-box"><div id="ytPlayer" data-vid="${v.id}"></div><div class="endcard" id="endcard" hidden></div></div>
      <div class="watch-head">
        <p class="eyebrow"><span>${esc(kicker(v))}</span></p>
        <h1>${esc(tp.main)}</h1>${tp.alt ? `<p class="watch-alt" lang="${tp.altLang}">${esc(tp.alt)}</p>` : ''}
        <p class="meta">${meta(fmtDate(v.published), fmtDur(v.duration), fmtViews(v.views))}</p>
      </div>
      <div class="watch-actions">
        ${nxt ? `<a class="btn btn-accent" href="${href(nxt)}">${esc(t('nextEpisode'))}${icon('right', 18)}</a>` : ''}
        ${listBtn(v.id)}
        <button type="button" class="btn btn-ghost" data-share="${v.id}">${icon('share', 18)}<span>${esc(t('share'))}</span></button>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${v.id}">${icon('yt', 18)}<span>${esc(t('onYoutube'))}</span></a>
        <button type="button" class="btn btn-ghost theater-btn" data-theater aria-pressed="${document.body.classList.contains('theater')}">${icon('theater', 18)}<span>${esc(t('theater'))}</span></button>
      </div>
      <p class="keys-hint">${esc(t('shortcuts'))}</p>
      ${engagePanel(v)}
      ${chapters.length ? `<section class="panel"><h2>${esc(t('chapters'))}</h2><ol class="chapters">${chapters.map((c, i) => `<li><button type="button" data-seek="${c.sec}" data-ch="${i}"><span class="ch-time">${fmtDur(c.sec) || '0:00'}</span><span lang="hi">${esc(c.label)}</span></button></li>`).join('')}</ol></section>` : ''}
      ${v.description ? `<section class="panel"><h2>${esc(t('about'))}</h2><div class="desc clamp" id="desc" lang="hi">${linkify(v.description)}</div><button type="button" class="btn btn-text" data-more>${esc(t('showMore'))}</button></section>` : ''}
    </div>
    <aside class="watch-side"><h2>${esc(s && s.episodes.length > 1 ? `${sname(s)} · ${t('episodes')}` : t('upNext'))}</h2><ol class="side-list">${side.map((x) => sideItem(x, x === v)).join('')}</ol></aside>
  </div>
  <div class="rows rows-plain">${row({ title: 'Shorts', sub: t('shortsSub'), link: '#/shorts', items: (s ? s.shorts : []).concat(M.shorts).filter((x, i, a) => a.indexOf(x) === i).slice(0, 14), kind: 'short' })}</div>`;
}

/* ---------- YouTube player ---------- */
let ytReady = null, ytPlayer = null, currentId = null, saveTick = null, chTick = null, endTimer = null;
function loadYT() {
  if (ytReady) return ytReady;
  ytReady = new Promise((res) => {
    window.onYouTubeIframeAPIReady = () => res(window.YT);
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return ytReady;
}
function saveProgress() {
  if (!ytPlayer || !currentId || typeof ytPlayer.getCurrentTime !== 'function') return;
  const tm = ytPlayer.getCurrentTime(), d = ytPlayer.getDuration();
  if (!d || tm < 5) return;
  progress[currentId] = { t: tm, d, at: Date.now(), done: tm / d > 0.93 };
  store.set('progress', progress);
}
async function initWatch() {
  const el = $('#ytPlayer');
  if (!el) return;
  const id = el.dataset.vid;
  currentId = id;
  const p = progress[id];
  const tParam = parseInt(parseHash().q.get('t'), 10); // shared "start at" links
  const start = tParam > 0 ? tParam : p && !p.done && p.t > 15 ? Math.floor(p.t - 3) : 0;
  const YT = await loadYT();
  if (currentId !== id || !document.body.contains(el)) return;
  ytPlayer = new YT.Player(el, {
    host: 'https://www.youtube-nocookie.com', videoId: id,
    playerVars: { autoplay: 1, rel: 0, playsinline: 1, start, modestbranding: 1, hl: lang },
    events: { onStateChange: (e) => { if (e.data === 0) onEnded(); if (e.data === 2) saveProgress(); } },
  });
  saveTick = setInterval(saveProgress, 5000);
  const chButtons = $$('[data-ch]');
  if (chButtons.length) {
    chTick = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
      const now = ytPlayer.getCurrentTime();
      let cur = 0;
      chButtons.forEach((b, i) => { if (+b.dataset.seek <= now + 0.5) cur = i; });
      chButtons.forEach((b, i) => b.classList.toggle('current', i === cur));
    }, 1000);
  }
}
function onEnded() {
  saveProgress();
  const nxt = nextOf(M.byId.get(currentId));
  const box = $('#endcard');
  if (!nxt || !box) return;
  let n = 8;
  const tp = titleParts(nxt);
  box.hidden = false;
  box.innerHTML = `<div class="endcard-inner"><p class="eyebrow">${esc(t('upNext'))}</p>
    <div class="endcard-media">${thumbImg(nxt)}<svg class="ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/></svg></div>
    <h3>${esc(tp.main)}</h3><p class="endcard-count">${esc(t('nextIn', { n }))}</p>
    <div class="endcard-actions"><a class="btn btn-accent" href="${href(nxt)}">${icon('play', 18)}<span>${esc(t('playNow'))}</span></a><button type="button" class="btn btn-ghost" data-cancel-next>${esc(t('cancel'))}</button></div></div>`;
  endTimer = setInterval(() => {
    n -= 1;
    const c = $('.endcard-count', box);
    if (c) c.textContent = t('nextIn', { n });
    if (n <= 0) { clearInterval(endTimer); location.hash = href(nxt); }
  }, 1000);
}
function leaveWatch() {
  saveProgress();
  clearInterval(saveTick); clearInterval(chTick); clearInterval(endTimer);
  if (ytPlayer && ytPlayer.destroy) { try { ytPlayer.destroy(); } catch { /* */ } }
  ytPlayer = null; currentId = null;
}

/* ================= Shorts feed (vertical, swipeable) ================= */
let feedEl = null, feedObs = null, feedActive = null;
function feedItem(v) {
  const tp = titleParts(v);
  return `<section class="feed-item" data-id="${v.id}">
    <div class="feed-stage">
      <div class="feed-media">${thumbImg(v, 'short')}<div class="feed-frame"></div></div>
      <div class="feed-info">
        <p class="eyebrow"><span>${esc(kicker(v))}</span></p>
        <h2>${esc(tp.main)}</h2>${tp.alt ? `<p class="feed-alt" lang="${tp.altLang}">${esc(tp.alt)}</p>` : ''}
        <p class="meta">${meta(fmtViews(v.views), fmtDate(v.published))}</p>
        ${(() => { const fs = fullStoryFor(v); return fs ? `<a class="btn btn-accent btn-sm feed-full" href="${href(fs)}">${icon('play', 16)}<span>${esc(t('fullStory'))}</span><small>${esc(kicker(fs) || titleParts(fs).main)}</small></a>` : ''; })()}
        <div class="feed-actions">${listBtn(v.id, 'icon')}
          <button type="button" class="btn btn-round" data-share="${v.id}" aria-label="${esc(t('share'))}">${icon('share')}</button>
          <a class="btn btn-round" target="_blank" rel="noopener" href="https://www.youtube.com/shorts/${v.id}" aria-label="${esc(t('watchOn'))}">${icon('yt')}</a></div>
      </div>
    </div></section>`;
}
function activateFeed(item) {
  if (!item || feedActive === item) return;
  if (feedActive) { const f = $('.feed-frame', feedActive); if (f) f.innerHTML = ''; feedActive.classList.remove('active'); }
  feedActive = item;
  item.classList.add('active');
  const id = item.dataset.id;
  $('.feed-frame', item).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${id}&modestbranding=1&hl=${lang}" title="${esc(titleParts(M.byId.get(id)).main)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowfullscreen></iframe>`;
  history.replaceState(null, '', `#/shorts/${id}`);
}
function openFeed(id) {
  closeFeed(true);
  feedEl = document.createElement('div');
  feedEl.className = 'feed';
  feedEl.setAttribute('role', 'dialog');
  feedEl.setAttribute('aria-modal', 'true');
  feedEl.setAttribute('aria-label', 'Shorts');
  feedEl.innerHTML = `<div class="feed-top"><button type="button" class="btn btn-round" data-feed-close aria-label="${esc(t('close'))}">${icon('close')}</button><span class="feed-title">Shorts</span><span class="feed-hint">${esc(t('feedHint'))}</span></div>
    <div class="feed-scroll">${M.shorts.map(feedItem).join('')}</div>
    <div class="feed-nav"><button type="button" class="btn btn-round" data-feed-step="-1" aria-label="Previous">${icon('up')}</button><button type="button" class="btn btn-round" data-feed-step="1" aria-label="Next">${icon('down')}</button></div>`;
  document.body.appendChild(feedEl);
  document.body.classList.add('no-scroll');
  const scroller = $('.feed-scroll', feedEl);
  const target = $(`.feed-item[data-id="${CSS.escape(id)}"]`, feedEl) || $('.feed-item', feedEl);
  scroller.scrollTop = target.offsetTop;
  feedObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio >= 0.6) activateFeed(e.target); });
  }, { root: scroller, threshold: [0.6] });
  $$('.feed-item', feedEl).forEach((it) => feedObs.observe(it));
  activateFeed(target);
  $('[data-feed-close]', feedEl).focus({ preventScroll: true });
}
function stepFeed(d) {
  if (!feedEl || !feedActive) return;
  const sib = d > 0 ? feedActive.nextElementSibling : feedActive.previousElementSibling;
  if (sib) sib.scrollIntoView({ behavior: 'smooth' });
}
function closeFeed(silent) {
  if (!feedEl) return;
  if (feedObs) feedObs.disconnect();
  feedEl.remove();
  feedEl = null; feedActive = null; feedObs = null;
  document.body.classList.remove('no-scroll');
  if (!silent && /^#\/shorts\/./.test(location.hash)) {
    if (navCount > 0) history.back(); else location.replace('#/shorts');
  }
}

/* ================= hero carousel ================= */
let heroIdx = 0;
function showSlide(i) {
  const h = $('#hero');
  if (!h) return;
  const slides = $$('.hero-slide', h), imgs = $$('.hero-img', h), picks = $$('.pick', h);
  heroIdx = (i + slides.length) % slides.length;
  slides.forEach((s, k) => { const on = k === heroIdx; s.classList.toggle('active', on); s.toggleAttribute('inert', !on); s.setAttribute('aria-hidden', String(!on)); });
  imgs.forEach((s, k) => s.classList.toggle('active', k === heroIdx));
  picks.forEach((p, k) => { p.classList.remove('active'); p.setAttribute('aria-selected', String(k === heroIdx)); });
  const p = picks[heroIdx];
  if (p) { void p.offsetWidth; p.classList.add('active'); }
  promoPlayback(imgs[heroIdx] && imgs[heroIdx].classList.contains('is-video'));
}
function initHero() {
  const h = $('#hero');
  if (!h) return;
  heroIdx = 0;
  promoPlayback(true);
  if (!$('.hero-picker', h)) return;
  h.addEventListener('animationend', (e) => { if (e.target.closest('.pick.active') && e.animationName === 'fill') showSlide(heroIdx + 1); });
  let x0 = null;
  h.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  h.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) showSlide(heroIdx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ================= rails ================= */
function updateRail(r) {
  const w = r.parentElement;
  w.classList.toggle('can-prev', r.scrollLeft > 4);
  w.classList.toggle('can-next', r.scrollLeft + r.clientWidth < r.scrollWidth - 4);
}
const updateRails = () => $$('.rail').forEach(updateRail);
document.addEventListener('scroll', (e) => { if (e.target.classList && e.target.classList.contains('rail')) updateRail(e.target); }, true);
window.addEventListener('resize', updateRails);

/* ================= search overlay ================= */
const ov = $('#searchOv'), sInput = $('#searchInput'), sResults = $('#searchResults');
let sActive = -1;
function openSearch() {
  ov.hidden = false;
  document.body.classList.add('no-scroll');
  sInput.value = '';
  renderSearch();
  requestAnimationFrame(() => sInput.focus());
}
function closeSearch() {
  if (ov.hidden) return;
  ov.hidden = true;
  if (!feedEl) document.body.classList.remove('no-scroll');
}
function saveRecent(q) {
  q = q.trim();
  if (!q) return;
  recent = [q, ...recent.filter((x) => x !== q)].slice(0, 6);
  store.set('recent', recent);
}
function renderSearch() {
  const q = sInput.value.trim();
  sActive = -1;
  if (!q) {
    const sugg = [...M.series.map(sname), ...(lang === 'hi' ? ['भीष्म', 'गंगा', 'इंद्र', 'अशोक'] : ['Bhishma', 'Ganga', 'Indra', 'Ashoka'])];
    sResults.innerHTML = `${recent.length ? `<p class="sr-label">${esc(t('recent'))}</p>${recent.map((r) => `<button type="button" class="sr-item sr-recent" role="option" data-q="${esc(r)}">${icon('clock', 18)}<span>${esc(r)}</span></button>`).join('')}` : ''}
      <p class="sr-label">${esc(t('suggestions'))}</p><div class="sr-chips">${sugg.map((s) => `<button type="button" class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
    return;
  }
  const hits = searchVideos(q);
  if (!hits.length) { sResults.innerHTML = `<p class="sr-empty">${esc(t('noResults', { q }))}<br><span>${esc(t('noResultsHint'))}</span></p>`; return; }
  sResults.innerHTML = hits.slice(0, 7).map((v) => `<a class="sr-item" role="option" href="${href(v)}" data-go>
      <span class="sr-thumb${v.isShort ? ' is-short' : ''}">${thumbImg(v, 'mini')}</span>
      <span class="sr-text"><span class="sr-title">${esc(titleParts(v).main)}</span><span class="sr-sub">${esc(kicker(v) || fmtDate(v.published))}${v.duration ? ' · ' + fmtDur(v.duration) : ''}</span></span>
      <span class="sr-kind">${esc(v.isShort ? t('shortLabel') : t('episodeLabel'))}</span></a>`).join('')
    + `<a class="sr-item sr-all" role="option" href="#/search?q=${encodeURIComponent(q)}" data-go>${icon('search', 18)}<span>${esc(t('seeAllResults'))} (${hits.length})</span></a>`;
}
function moveActive(d) {
  const items = $$('[role=option]', sResults);
  if (!items.length) return;
  sActive = (sActive + d + items.length) % items.length;
  items.forEach((it, i) => it.classList.toggle('active', i === sActive));
  items[sActive].scrollIntoView({ block: 'nearest' });
}
sInput.addEventListener('input', renderSearch);
sInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const items = $$('[role=option]', sResults);
    if (sActive >= 0 && items[sActive]) items[sActive].click();
    else if (sInput.value.trim()) { saveRecent(sInput.value); closeSearch(); location.hash = `#/search?q=${encodeURIComponent(sInput.value.trim())}`; }
  }
});

/* ================= toast ================= */
const toastEl = $('#toast');
let toastTimer, toastFn;
function toast(msg, action) {
  toastEl.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button" data-toast-action>${esc(action.label)}</button>` : ''}`;
  toastFn = action && action.fn;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), action ? 5000 : 2400);
}

/* ================= actions ================= */
function refreshListButtons(id) {
  $$(`[data-list="${id}"]`).forEach((b) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = listBtn(id, b.classList.contains('btn-round') ? 'icon' : '');
    b.replaceWith(tmp.firstElementChild);
  });
}
function toggleList(id) {
  const was = myList.includes(id);
  myList = was ? myList.filter((x) => x !== id) : [id, ...myList];
  store.set('mylist', myList);
  refreshListButtons(id);
  if (parseHash().parts[0] === 'mylist') rerender();
  toast(t(was ? 'removed' : 'added'), { label: t('undo'), fn: () => toggleList(id) });
}
function forget(id) {
  const saved = progress[id];
  delete progress[id];
  store.set('progress', progress);
  rerender();
  toast(t('forgot'), { label: t('undo'), fn: () => { progress[id] = saved; store.set('progress', progress); rerender(); } });
}
/* ---------- share sheet (WhatsApp first: that's where Indian audiences share) ---------- */
const shareOv = $('#shareOv'), shareSheet = $('#shareSheet');
let shareCtx = null;
function shareUrl() {
  const { v, id, at } = shareCtx;
  const useAt = at > 5 && $('#shareAt') && $('#shareAt').checked;
  return `${location.origin}${location.pathname}${href(v || { id })}${useAt ? `?t=${at}` : ''}`;
}
function share(id) {
  const v = M.byId.get(id);
  const at = currentId === id && ytPlayer && ytPlayer.getCurrentTime ? Math.floor(ytPlayer.getCurrentTime()) : 0;
  shareCtx = { v, id, at, title: v ? titleParts(v).main : 'Katha Lok' };
  shareSheet.innerHTML = `<div class="sheet-head"><h2 id="shareTitle">${esc(t('shareTitle'))}</h2><button type="button" class="icon-btn" data-close-share aria-label="${esc(t('close'))}">${icon('close')}</button></div>
    ${v ? `<div class="sheet-item">${thumbImg(v, 'mini')}<div><p class="sheet-item-title">${esc(shareCtx.title)}</p><p class="muted small">${esc(kicker(v) || 'Katha Lok')}</p></div></div>` : ''}
    ${at > 5 ? `<label class="check"><input type="checkbox" id="shareAt"><span>${esc(t('startAt', { t: fmtDur(at) }))}</span></label>` : ''}
    <div class="sheet-actions">
      <button type="button" class="share-opt wa" data-share-go="wa"><span class="share-ic">${icon('wa', 26)}</span>${esc(t('whatsapp'))}</button>
      <button type="button" class="share-opt" data-share-go="copy"><span class="share-ic">${icon('link', 24)}</span>${esc(t('copyLink'))}</button>
      ${navigator.share ? `<button type="button" class="share-opt" data-share-go="native"><span class="share-ic">${icon('share', 24)}</span>${esc(t('moreApps'))}</button>` : ''}
    </div>`;
  shareOv.hidden = false;
  $('[data-share-go]', shareSheet).focus();
}
function closeShare() { shareOv.hidden = true; }
async function shareGo(kind) {
  const url = shareUrl();
  if (kind === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(`${shareCtx.title} | Katha Lok\n${url}`)}`, '_blank', 'noopener');
  else if (kind === 'copy') { try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch { toast(url); } }
  else if (kind === 'native') { try { await navigator.share({ title: shareCtx.title, url }); } catch { /* cancelled */ } }
  closeShare();
}

/* ================= theme + language ================= */
function setTheme(th) {
  root.dataset.theme = th;
  store.set('theme', th);
  applyStatic();
}
function setLang(l) {
  if (l === lang) return;
  lang = l;
  root.lang = l;
  store.set('lang', l);
  titleCache.clear();
  applyStatic();
  rerender();
  footer();
  if (!ov.hidden) renderSearch();
}
function applyStatic() {
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  const dark = root.dataset.theme === 'dark';
  const tb = $('#themeToggle');
  tb.innerHTML = icon(dark ? 'sun' : 'moon');
  tb.setAttribute('aria-label', t(dark ? 'toLight' : 'toDark'));
  tb.title = t(dark ? 'toLight' : 'toDark');
  $('meta[name="theme-color"]').content = dark ? '#0D0C0B' : '#F6F2EA';
  sInput.placeholder = t('searchPh');
  document.title = t('title');
}

/* ================= routing ================= */
function parseHash() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map((p) => decodeURIComponent(p)), q: new URLSearchParams(qs || '') };
}
let pageKey = null, navCount = 0, linkNav = false;
const scrollMemory = new Map();
function rerender() { const y = window.scrollY; pageKey = null; route(true); window.scrollTo(0, y); }
function route(keepScroll) {
  if (!M) return;
  const { parts, q } = parseHash();
  if (q.get('v')) { location.replace(`#/watch/${q.get('v')}`); return; } // links from the first version
  const view = parts[0] || 'home';
  closeSearch();
  if (view === 'shorts' && parts[1]) {
    if (!pageKey) renderPage('shorts', [], q, '#/shorts');
    if (!feedEl) openFeed(parts[1]);
    return;
  }
  if (feedEl) closeFeed(true);
  const key = location.hash || '#/';
  if (key === pageKey) return;
  if (pageKey) scrollMemory.set(pageKey, window.scrollY);
  renderPage(view, parts, q, key);
  if (!keepScroll) window.scrollTo(0, !linkNav && scrollMemory.has(key) ? scrollMemory.get(key) : 0);
  linkNav = false;
}
function renderPage(view, parts, q, key) {
  leaveWatch();
  pageKey = key;
  let html;
  switch (view) {
    case 'series': html = parts[1] ? seriesPage(parts[1]) : seriesIndex(); break;
    case 'shorts': html = shortsPage(); break;
    case 'watch': html = watchPage(parts[1]); break;
    case 'mylist': html = myListPage(); break;
    case 'search': html = searchPage(q.get('q') || ''); break;
    case 'home': html = homePage(); break;
    default: html = notFound();
  }
  if (html === null) return;
  app.innerHTML = html;
  document.body.dataset.view = view === 'series' && parts[1] ? 'series-detail' : view;
  $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === view));
  onScroll();
  updateRails();
  if (view === 'home') initHero();
  if (view === 'watch') initWatch();
}
window.addEventListener('hashchange', () => { navCount += 1; route(); });

/* ================= global events ================= */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (a) { linkNav = true; if (a.hasAttribute('data-go')) { saveRecent(sInput.value); closeSearch(); } }
  const el = e.target.closest('[data-list],[data-rail],[data-pick],[data-share],[data-seek],[data-cancel-next],[data-forget],[data-back],[data-more],[data-toast-action],[data-feed-close],[data-feed-step],[data-lang],[data-q],[data-open-search],[data-close-search],[data-close-share],[data-share-go],[data-theater],[data-install]');
  if (!el) return;
  const d = el.dataset;
  if ('closeShare' in d) { closeShare(); return; }
  if (d.shareGo) { shareGo(d.shareGo); return; }
  if ('theater' in d) { toggleTheater(); return; }
  if ('install' in d) { promptInstall(); return; }
  if (d.list) { e.preventDefault(); toggleList(d.list); }
  else if (d.rail) { const r = $('.rail', el.parentElement); r.scrollBy({ left: +d.rail * r.clientWidth * 0.85, behavior: 'smooth' }); }
  else if (d.pick) showSlide(+d.pick);
  else if (d.share) share(d.share);
  else if (d.seek !== undefined) { if (ytPlayer && ytPlayer.seekTo) { ytPlayer.seekTo(+d.seek, true); ytPlayer.playVideo(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  else if ('cancelNext' in d) { clearInterval(endTimer); $('#endcard').hidden = true; }
  else if (d.forget) { e.preventDefault(); forget(d.forget); }
  else if ('back' in d) { if (navCount > 0) history.back(); else location.hash = '#/'; }
  else if ('more' in d) { const desc = $('#desc'); const open = desc.classList.toggle('clamp'); el.textContent = t(open ? 'showMore' : 'showLess'); }
  else if ('toastAction' in d) { toastEl.classList.remove('show'); if (toastFn) toastFn(); }
  else if ('feedClose' in d) closeFeed();
  else if (d.feedStep) stepFeed(+d.feedStep);
  else if (d.lang) setLang(d.lang);
  else if (d.q !== undefined) { sInput.value = d.q; renderSearch(); sInput.focus(); }
  else if ('openSearch' in d) openSearch();
  else if ('closeSearch' in d) closeSearch();
});
$('#searchOpen').addEventListener('click', openSearch);
$('#themeToggle').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
function toggleTheater() {
  const on = document.body.classList.toggle('theater');
  store.set('theater', on);
  $$('[data-theater]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
}
if (store.get('theater', false)) document.body.classList.add('theater');
/** YouTube-style keys on the watch page (when focus is on our page, not inside the player). */
function watchKeys(e) {
  if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function' || e.ctrlKey || e.metaKey || e.altKey) return false;
  const k = e.key.toLowerCase();
  const seekBy = (s) => ytPlayer.seekTo(Math.max(0, ytPlayer.getCurrentTime() + s), true);
  if (k === 'k' || k === ' ') { if (ytPlayer.getPlayerState() === 1) ytPlayer.pauseVideo(); else ytPlayer.playVideo(); }
  else if (k === 'j' || k === 'arrowleft') seekBy(-10);
  else if (k === 'l' || k === 'arrowright') seekBy(10);
  else if (k === 'm') { if (ytPlayer.isMuted()) ytPlayer.unMute(); else ytPlayer.mute(); }
  else if (k === 'f') { const box = $('.player-box'); if (document.fullscreenElement) document.exitFullscreen(); else if (box && box.requestFullscreen) box.requestFullscreen(); }
  else if (k === 't') toggleTheater();
  else if (k === 'n') { const nx = nextOf(M.byId.get(currentId)); if (nx) location.hash = href(nx); }
  else return false;
  e.preventDefault();
  return true;
}
document.addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (e.key === 'Escape') { if (!shareOv.hidden) closeShare(); else if (!ov.hidden) closeSearch(); else if (feedEl) closeFeed(); return; }
  if (!typing && document.body.dataset.view === 'watch' && ov.hidden && shareOv.hidden) {
    // Space/Enter on a focused button or link keeps its normal meaning.
    const onControl = /^(BUTTON|A)$/.test(document.activeElement.tagName);
    if (!(onControl && (e.key === ' ' || e.key === 'Enter')) && watchKeys(e)) return;
  }
  if (feedEl && !typing && ['ArrowDown', 'ArrowUp', 'j', 'k'].includes(e.key)) { e.preventDefault(); stepFeed(e.key === 'ArrowDown' || e.key === 'j' ? 1 : -1); return; }
  if (e.key === '/' && !typing && ov.hidden) { e.preventDefault(); openSearch(); }
});
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  topbar.classList.toggle('scrolled', y > 12 || !/home|series-detail/.test(document.body.dataset.view || ''));
  topbar.classList.toggle('tucked', window.innerWidth < 860 && y > lastY && y > 240);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('pagehide', saveProgress);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(); });

function footer() {
  const when = M.data.generatedAt ? new Date(M.data.generatedAt).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  $('#footer').innerHTML = `<div class="footer-inner">
    <div class="footer-brand"><svg class="brand-mark" width="34" height="48" aria-hidden="true"><use href="#mark"/></svg>
      <div><p class="footer-word">${lang === 'hi' ? 'कथा लोक' : 'Katha Lok'}</p><p class="muted">${esc(t('tagline'))}</p></div></div>
    <nav class="footer-links" aria-label="${esc(t('footerLinks'))}"><a href="#/series">${esc(t('series'))}</a><a href="#/shorts">Shorts</a><a href="#/mylist">${esc(t('mylist'))}</a><a href="${SUB_URL}" target="_blank" rel="noopener">${esc(t('subscribe'))} ↗</a>${CFG.whatsappChannel ? `<a href="${esc(CFG.whatsappChannel)}" target="_blank" rel="noopener">${esc(t('joinWa'))} ↗</a>` : ''}
      <button type="button" class="btn btn-ghost btn-sm install-btn" data-install ${installEvt ? '' : 'hidden'}>${icon('install', 18)}<span>${esc(t('install'))}</span></button></nav>
    <p class="muted small">${esc(t('hosted'))} ${esc(t('videos', { n: M.videos.length }))}${when ? ` · ${esc(t('updated', { d: when }))}` : ''}</p>
  </div>`;
}

/* ================= installable app ================= */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvt = e;
  $$('[data-install]').forEach((b) => { b.hidden = false; });
});
window.addEventListener('appinstalled', () => { installEvt = null; $$('[data-install]').forEach((b) => { b.hidden = true; }); toast(t('installed')); });
async function promptInstall() {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice.catch(() => {});
  installEvt = null;
  $$('[data-install]').forEach((b) => { b.hidden = true; });
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

/* ================= boot ================= */
$('#subscribeTop').href = SUB_URL;
applyStatic();
loadData().then((data) => {
  M = buildModel(data);
  footer();
  if (!location.hash) history.replaceState(null, '', '#/');
  route();
  const fresh = prevVisit ? M.videos.filter((v) => Date.parse(v.published) > prevVisit).length : 0;
  if (fresh && !sessionStorage.getItem('kl:toasted')) {
    try { sessionStorage.setItem('kl:toasted', '1'); } catch { /* */ }
    setTimeout(() => toast(fresh === 1 ? t('newSince1') : t('newSince', { n: fresh }), { label: t('look'), fn: () => { location.hash = '#/'; setTimeout(() => $('#new') && $('#new').scrollIntoView({ behavior: 'smooth' }), 50); } }), 900);
  }
}).catch((err) => {
  console.error(err);
  app.innerHTML = `<section class="page">${emptyState(t('loadFail'), err.message, false)}<p class="center"><a class="btn btn-accent" href="${esc(CFG.channelUrl)}" target="_blank" rel="noopener">${esc(t('watchOn'))}</a></p></section>`;
});
