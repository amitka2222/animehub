import { CREATORS_DATA } from '../data/creatorsData';

/**
 * AnimeHub Utility Module
 * Provides dual-name detection (English vs Japanese/Romaji), 
 * prioritized streaming platform resolution (Crunchyroll priority), 
 * audio dub availability detection, and dual-language search matching.
 */

// Curated dual-name dictionary for popular anime
// Maps lowercase normalized keywords/titles to { en, romaji, ja }
const DUAL_TITLES_MAP = [
  {
    matches: ['attack on titan', 'shingeki no kyojin'],
    en: 'Attack on Titan',
    romaji: 'Shingeki no Kyojin',
    ja: '進撃の巨人'
  },
  {
    matches: ['demon slayer', 'kimetsu no yaiba'],
    en: 'Demon Slayer: Kimetsu no Yaiba',
    romaji: 'Kimetsu no Yaiba',
    ja: '鬼滅の刃'
  },
  {
    matches: ['my hero academia', 'boku no hero academia'],
    en: 'My Hero Academia',
    romaji: 'Boku no Hero Academia',
    ja: '僕のヒーローアカデミア'
  },
  {
    matches: ['jujutsu kaisen'],
    en: 'Jujutsu Kaisen',
    romaji: 'Jujutsu Kaisen',
    ja: '呪術廻戦'
  },
  {
    matches: ['one piece'],
    en: 'One Piece',
    romaji: 'Wan Pīsu',
    ja: 'ワンピース'
  },
  {
    matches: ['naruto', 'shippuden'],
    en: 'Naruto Shippuden',
    romaji: 'Naruto Shippūden',
    ja: 'NARUTO -ナルト- 疾風伝'
  },
  {
    matches: ['bleach'],
    en: 'Bleach: Thousand-Year Blood War',
    romaji: 'Burīchi: Sennen Kessen-hen',
    ja: 'BLEACH 千年血戦篇'
  },
  {
    matches: ['death note'],
    en: 'Death Note',
    romaji: 'Desu Nōto',
    ja: 'デスノート'
  },
  {
    matches: ['fullmetal alchemist', 'hagane no renkinjutsushi'],
    en: 'Fullmetal Alchemist: Brotherhood',
    romaji: 'Hagane no Renkinjutsushi',
    ja: '鋼の錬金術師'
  },
  {
    matches: ['hunter x hunter', 'hunter hunter'],
    en: 'Hunter x Hunter',
    romaji: 'Hantā Hantā',
    ja: 'HUNTER×HUNTER'
  },
  {
    matches: ['chainsaw man'],
    en: 'Chainsaw Man',
    romaji: 'Chensō Man',
    ja: 'チェンソーマン'
  },
  {
    matches: ['spy x family', 'spy family'],
    en: 'Spy x Family',
    romaji: 'Supai Famirī',
    ja: 'SPY×FAMILY'
  },
  {
    matches: ['frieren', 'sousou no frieren'],
    en: "Frieren: Beyond Journey's End",
    romaji: 'Sousou no Frieren',
    ja: '葬送のフリーレン'
  },
  {
    matches: ['solo leveling', 'ore dake level up'],
    en: 'Solo Leveling',
    romaji: 'Ore dake Level Up na Ken',
    ja: '俺だけレベルアップな件'
  },
  {
    matches: ['cowboy bebop'],
    en: 'Cowboy Bebop',
    romaji: 'Kaubōi Bibappu',
    ja: 'カウボーイビバップ'
  },
  {
    matches: ['dragon ball'],
    en: 'Dragon Ball Super / Z',
    romaji: 'Doragon Bōru',
    ja: 'ドラゴンボール'
  },
  {
    matches: ['sword art online', 'sao'],
    en: 'Sword Art Online',
    romaji: 'Sōdo Āto Onrain',
    ja: 'ソードアート・オンライン'
  },
  {
    matches: ['tokyo ghoul'],
    en: 'Tokyo Ghoul',
    romaji: 'Tōkyō Gūru',
    ja: '東京喰種'
  },
  {
    matches: ['steins;gate', 'steins gate'],
    en: 'Steins;Gate',
    romaji: 'Shutainzu Gēto',
    ja: 'シュタインズ・ゲート'
  },
  {
    matches: ['code geass'],
    en: 'Code Geass: Lelouch of the Rebellion',
    romaji: 'Kōdo Giasu: Hangyaku no Rurūshu',
    ja: 'コードギアス 反逆のルルーシュ'
  },
  {
    matches: ['vinland saga'],
    en: 'Vinland Saga',
    romaji: 'Vinrando Saga',
    ja: 'ヴィンランド・サガ'
  },
  {
    matches: ['cyberpunk', 'edgerunners'],
    en: 'Cyberpunk: Edgerunners',
    romaji: 'Saibāpanku Edjirannāzu',
    ja: 'サイバーパンク エッジランナーズ'
  },
  {
    matches: ['evangelion', 'neon genesis'],
    en: 'Neon Genesis Evangelion',
    romaji: 'Shin Seiki Evangerion',
    ja: '新世紀エヴァンゲリオン'
  },
  {
    matches: ['detective conan', 'case closed', 'meitantei conan'],
    en: 'Case Closed / Detective Conan',
    romaji: 'Meitantei Conan',
    ja: '名探偵コナン'
  },
  {
    matches: ['haikyu'],
    en: 'Haikyu!!',
    romaji: 'Haikyū!!',
    ja: 'ハイキュー!!'
  },
  {
    matches: ['mob psycho 100', 'mob psycho'],
    en: 'Mob Psycho 100',
    romaji: 'Mobu Saiko Hyaku',
    ja: 'モブサイコ100'
  },
  {
    matches: ['konosuba', 'kono subarashii'],
    en: "KonoSuba: God's Blessing on This Wonderful World!",
    romaji: 'Kono Subarashii Sekai ni Shukufuku o!',
    ja: 'この素晴らしい世界に祝福を！'
  },
  {
    matches: ['re:zero', 're zero'],
    en: 'Re:ZERO - Starting Life in Another World',
    romaji: 'Re:Zero kara Hajimeru Isekai Seikatsu',
    ja: 'Re:ゼロから始める異世界生活'
  },
  {
    matches: ['overlord'],
    en: 'Overlord',
    romaji: 'Ōbārōdo',
    ja: 'オーバーロード'
  },
  {
    matches: ['delicious in dungeon', 'dungeon meshi'],
    en: 'Delicious in Dungeon',
    romaji: 'Dungeon Meshi',
    ja: 'ダンジョン飯'
  },
  {
    matches: ['blue lock'],
    en: 'Blue Lock',
    romaji: 'Burū Rokku',
    ja: 'ブルーロック'
  },
  {
    matches: ['kaiju no. 8', 'kaiju no 8'],
    en: 'Kaiju No. 8',
    romaji: 'Kaijū 8-gō',
    ja: '怪獣8号'
  },
  {
    matches: ['mashle'],
    en: 'Mashle: Magic and Muscles',
    romaji: 'Masshuru',
    ja: 'マッシュル-MASHLE-'
  },
  {
    matches: ['dr. stone', 'dr stone'],
    en: 'Dr. STONE',
    romaji: 'Dokutā Sutōn',
    ja: 'ドクターストーン'
  },
  {
    matches: ['black clover'],
    en: 'Black Clover',
    romaji: 'Burakku Kurōbā',
    ja: 'ブラッククローバー'
  },
  {
    matches: ['fruits basket'],
    en: 'Fruits Basket',
    romaji: 'Furūtsu Basuketto',
    ja: 'フルーツバスケット'
  },
  {
    matches: ['toradora'],
    en: 'Toradora!',
    romaji: 'Toradora!',
    ja: 'とらドラ!'
  },
  {
    matches: ['clannad'],
    en: 'Clannad',
    romaji: 'Kuranado',
    ja: 'CLANNAD'
  },
  {
    matches: ['kaguya-sama', 'love is war'],
    en: 'Kaguya-sama: Love is War',
    romaji: 'Kaguya-sama wa Kokurasetai',
    ja: 'かぐや様は告らせたい'
  },
  {
    matches: ['horimiya'],
    en: 'Horimiya',
    romaji: 'Horimiya',
    ja: 'ホリミヤ'
  },
  {
    matches: ['violet evergarden'],
    en: 'Violet Evergarden',
    romaji: 'Vaioretto Evāgāden',
    ja: 'ヴァイオレット・エヴァーガーデン'
  },
  {
    matches: ['your name', 'kimi no na wa'],
    en: 'Your Name.',
    romaji: 'Kimi no Na wa.',
    ja: '君の名は。'
  },
  {
    matches: ['spirited away', 'sen to chihiro'],
    en: 'Spirited Away',
    romaji: 'Sen to Chihiro no Kamikakushi',
    ja: '千と千尋の神隠し'
  },
  {
    matches: ['princess mononoke', 'mononoke hime'],
    en: 'Princess Mononoke',
    romaji: 'Mononoke Hime',
    ja: 'もののけ姫'
  },
  {
    matches: ['howl\'s moving castle', 'hauru no ugoku shiro'],
    en: "Howl's Moving Castle",
    romaji: 'Hauru no Ugoku Shiro',
    ja: 'ハウルの動く城'
  },
  {
    matches: ['a silent voice', 'koe no katachi'],
    en: 'A Silent Voice',
    romaji: 'Koe no Katachi',
    ja: '聲の形'
  },
  {
    matches: ['dandadan'],
    en: 'DAN DA DAN',
    romaji: 'Dandadan',
    ja: 'ダンダダン'
  }
];

/**
 * Extracts and normalizes dual names (English vs Japanese / Romaji / Kanji)
 * for an anime item.
 */
export const getDualTitles = (anime) => {
  if (!anime) {
    return {
      primaryTitle: 'Unknown Anime',
      secondaryTitle: null,
      englishTitle: null,
      romajiTitle: null,
      japaneseTitle: null
    };
  }

  const rawTitle = anime.title || '';
  const titlesObj = anime.titles || {};

  let english = titlesObj.en || null;
  let romaji = titlesObj.en_jp || null;
  let japanese = titlesObj.ja_jp || null;

  // Search curated dictionary if English or Romaji is missing or if title matches
  const normTitle = rawTitle.toLowerCase().trim();
  const dictMatch = DUAL_TITLES_MAP.find(entry => 
    entry.matches.some(m => normTitle.includes(m) || m.includes(normTitle))
  );

  if (dictMatch) {
    if (!english) english = dictMatch.en;
    if (!romaji) romaji = dictMatch.romaji;
    if (!japanese) japanese = dictMatch.ja;
  }

  // Primary title should be English if available, or the main title
  const primaryTitle = english || rawTitle || 'Unknown Anime';

  // Determine the best secondary / alternate title to display
  let secondaryTitle = null;
  if (romaji && romaji.toLowerCase() !== primaryTitle.toLowerCase()) {
    secondaryTitle = romaji;
  } else if (english && english.toLowerCase() !== rawTitle.toLowerCase()) {
    secondaryTitle = english;
  } else if (japanese) {
    secondaryTitle = japanese;
  }

  return {
    primaryTitle,
    secondaryTitle,
    englishTitle: english,
    romajiTitle: romaji,
    japaneseTitle: japanese
  };
};

/**
 * Returns prioritized streaming platforms with Crunchyroll as #1.
 */
export const getStreamingPlatforms = (anime) => {
  const { primaryTitle, romajiTitle, englishTitle } = getDualTitles(anime);
  // Best search query for Crunchyroll / stream searches (prefer English, then canonical)
  const searchName = englishTitle || primaryTitle || anime.title || '';
  const encodedQuery = encodeURIComponent(searchName.trim());

  return [
    {
      id: 'crunchyroll',
      name: 'Crunchyroll',
      isPrimary: true,
      badge: 'Prioritized / #1 Source',
      tagline: 'Stream Full Episodes (SUB & DUB)',
      actionText: 'Watch on Crunchyroll',
      url: `https://www.crunchyroll.com/search?q=${encodedQuery}`,
      gradient: 'from-orange-500 via-amber-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:via-amber-600 hover:to-orange-700',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      accentColor: '#f47521'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      isPrimary: false,
      badge: 'Available',
      tagline: 'Streaming Catalog',
      actionText: 'Find on Netflix',
      url: `https://www.netflix.com/search?q=${encodedQuery}`,
      gradient: 'from-red-600 to-rose-700',
      hoverGradient: 'hover:from-red-700 hover:to-rose-800',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      accentColor: '#e50914'
    },
    {
      id: 'hulu',
      name: 'Hulu',
      isPrimary: false,
      badge: 'Available',
      tagline: 'Simulcasts & Dubs',
      actionText: 'Find on Hulu',
      url: `https://www.hulu.com/search?q=${encodedQuery}`,
      gradient: 'from-emerald-600 to-teal-700',
      hoverGradient: 'hover:from-emerald-700 hover:to-teal-800',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentColor: '#1ce783'
    }
  ];
};

/**
 * Resolves the creator/artist for a given anime
 */
export const getAnimeCreator = (anime) => {
  if (!anime) return null;
  const rawTitle = (anime.title || '').toLowerCase();
  const { englishTitle, romajiTitle } = getDualTitles(anime);
  const en = (englishTitle || '').toLowerCase();
  const rom = (romajiTitle || '').toLowerCase();

  const fullStr = `${rawTitle} ${en} ${rom}`;

  for (const creator of CREATORS_DATA) {
    if (creator.associatedTitles.some(titleKey => fullStr.includes(titleKey))) {
      return creator;
    }
  }

  return null;
};

/**
 * Checks whether an anime matches a search query across dual titles, creator, and synopsis
 */
export const matchesAnimeSearch = (anime, query) => {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  const title = (anime.title || '').toLowerCase();
  if (title.includes(q)) return true;

  const { englishTitle, romajiTitle, japaneseTitle } = getDualTitles(anime);
  if (englishTitle && englishTitle.toLowerCase().includes(q)) return true;
  if (romajiTitle && romajiTitle.toLowerCase().includes(q)) return true;
  if (japaneseTitle && japaneseTitle.toLowerCase().includes(q)) return true;

  if (anime.titles?.en && anime.titles.en.toLowerCase().includes(q)) return true;
  if (anime.titles?.en_jp && anime.titles.en_jp.toLowerCase().includes(q)) return true;
  if (anime.titles?.ja_jp && anime.titles.ja_jp.toLowerCase().includes(q)) return true;

  // Check creator match
  const creator = getAnimeCreator(anime);
  if (creator) {
    if (creator.name.toLowerCase().includes(q)) return true;
    if (creator.japaneseName.toLowerCase().includes(q)) return true;
  }

  const synopsis = (anime.synopsis || '').toLowerCase();
  if (synopsis.includes(q)) return true;

  return false;
};

/**
 * Determines whether an anime has English Dub availability
 * based on explicit flag, licensing, mainstream popularity, and format.
 */
export const checkHasDub = (anime) => {
  if (!anime) return false;
  if (typeof anime.hasDub === 'boolean') return anime.hasDub;
  
  const title = (anime.title || '').toLowerCase();
  const { englishTitle, romajiTitle } = getDualTitles(anime);
  const fullCheck = `${title} ${englishTitle || ''} ${romajiTitle || ''}`.toLowerCase();

  const knownDubKeywords = [
    'titan', 'hero academia', 'one piece', 'naruto', 'bleach', 'jujutsu', 
    'demon slayer', 'death note', 'fullmetal', 'hunter', 'dragon ball', 
    'slime', 're:zero', 'sword art', 'tokyo ghoul', 'cowboy bebop', 'evangelion', 
    'conan', 'shin-chan', 'doraemon', 'jojo', 'chainsaw', 'spy x family', 
    'haikyu', 'vinland', 'cyberpunk', 'solo leveling', 'fate', 'overlord', 
    'konosuba', 'mob psycho', 'frieren', 'mashle', 'youjo senki', 'danmachi',
    'classroom of the elite', 'kaiju', 'dandadan', 'delicious in dungeon'
  ];
  
  if (knownDubKeywords.some(kw => fullCheck.includes(kw))) return true;
  if (anime.season === 'TV' && anime.rank && Number(anime.rank) <= 7) return true;
  
  return false;
};
