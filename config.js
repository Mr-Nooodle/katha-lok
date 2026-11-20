// Katha Lok website settings. This is the only file you normally need to edit.
window.KATHA_CONFIG = {
  channelId: 'UC_IFc8YQcoWUnTcsqqDL0mg',
  channelUrl: 'https://www.youtube.com/@Hindi-Kathalok',

  // Where the video list comes from:
  //  - data/videos.json is rebuilt automatically by the GitHub Action (recommended, no key in the page).
  //  - Optional live mode: paste a YouTube Data API key that is RESTRICTED to your site's domain
  //    (Google Cloud → Credentials → Website restrictions) and to "YouTube Data API v3" only.
  dataUrl: 'data/videos.json',
  apiKey: '',

  // Series. A video joins a series when its title matches `match` (a regular expression).
  // A YouTube playlist with the same name is merged in automatically.
  // Episodes are ordered by "Ep 01 / Ep 02…" in the title, then by upload date.
  series: [
    { slug: 'mahabharat', en: 'Mahabharat', hi: 'महाभारत', match: 'महाभारत|Mahabharat',
      tagline: { en: 'The complete epic, from the very beginning, chapter by chapter.', hi: 'आरंभ से अंत तक, अध्याय दर अध्याय, पूरी कथा।' } },
    { slug: 'ramayan', en: 'Ramayana', hi: 'रामायण', match: 'रामायण|Ramayan',
      tagline: { en: 'Untold stories from the Valmiki Ramayana.', hi: 'वाल्मीकि रामायण की अनसुनी कथाएँ।' } },
    { slug: 'gods', en: 'Stories of the Gods', hi: 'देवताओं की कथाएँ', match: 'इंद्र|Indra|दधीचि|Dadhichi|गणेश|Ganesh|शिव|Shiv|विष्णु|Vishnu',
      tagline: { en: 'Gods, sages and the choices that shaped them, from the Puranas.', hi: 'पुराणों से देवताओं की कहानियाँ।' } },
    { slug: 'sages', en: 'Sages & Kings', hi: 'ऋषि और राजा', match: 'विश्वामित्र|Vishwamitra|वशिष्ठ|Vashishtha|ऋषि',
      tagline: { en: 'Stories of penance, pride and transformation.', hi: 'तप, अहंकार और परिवर्तन की कथाएँ।' } },
    { slug: 'history', en: 'History', hi: 'इतिहास', match: 'अशोक|Ashoka|Brahmi|इतिहास|History|मौर्य|Maurya',
      tagline: { en: 'Real Indian history, from ancient to modern times.', hi: 'प्राचीन से आधुनिक भारत तक, सच्चे इतिहास की कहानियाँ।' } },
  ],

  // Optional display titles per video, used instead of the YouTube title in each language.
  // Without an entry the site picks the English or Hindi part of the YouTube title by itself.
  titles: {
    'pjfZ29giK4I': { en: 'The Blind King Who Refused to See' },
    'FHBfffs6ooY': { en: 'The Promise of Ganga That Changed the Mahabharat' },
    '99Pp5phZMXc': { en: "Bhishma's Vow" },
    'g8xnOfxsAN0': { en: 'The Untold Journey of Vishwamitra' },
    'wD2nXjV0IwY': { en: "Ashoka's Lost Name: Brahmi Decoded" },
    '-FBp5QkGEmY': { en: 'Sampati & Jatayu: The Untold Story' },
  },

  // Discussion question shown under each video ("Your take"), answered in the YouTube comments.
  // DRAFTS: please review/replace. Videos without an entry get a general question.
  questions: {
    'pjfZ29giK4I': { en: 'Should Dhritarashtra have accepted the gift of sight?', hi: 'क्या धृतराष्ट्र को दृष्टि का वरदान स्वीकार कर लेना चाहिए था?' },
    'FHBfffs6ooY': { en: 'Was Ganga right to keep her promise, whatever the cost?', hi: 'क्या गंगा का हर कीमत पर अपना वचन निभाना सही था?' },
    '99Pp5phZMXc': { en: 'Was Devavrat right to take his vow?', hi: 'क्या देवव्रत की प्रतिज्ञा सही थी?' },
  },

  // Weekly release calendar on the home page (0 = Sunday … 6 = Saturday), from the channel trailer.
  schedule: [
    { day: 1, en: 'Mahabharat', hi: 'महाभारत' },
    { day: 3, en: 'Untold stories', hi: 'अनसुनी कथाएँ' },
    { day: 5, en: 'Mahabharat', hi: 'महाभारत' },
  ],

  // WhatsApp channel or group link, if you open one (shown in share and footer). Leave '' to hide.
  whatsappChannel: '',

  // Channel trailer: first slide of the home banner. A silent 5.6 s clip from the promo master
  // (episodes/channel-promo, 21.0–26.6 s, the corridor to the keyhole door) plays in the background,
  // and "Watch trailer" opens the full video with sound.
  promo: {
    videoId: 'x8V1M4ckvPk',
    clip: 'assets/promo/hero-1280.mp4',
    clipSmall: 'assets/promo/hero-640.mp4',
    poster: 'assets/promo/poster.jpg',
    firstFrame: 'assets/promo/first.jpg',
  },

  // Videos to keep out of the regular banner slides (the trailer already has its own slide).
  heroExclude: ['x8V1M4ckvPk'],
};
