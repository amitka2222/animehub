import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  'action',
  'adventure',
  'comedy',
  'drama',
  'fantasy',
  'horror',
  'mystery',
  'romance',
  'sci-fi',
  'slice-of-life',
  'sports',
  'supernatural',
  'isekai',
  'psychological',
  'thriller',
  'mecha',
  'music',
  'shounen'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = (url, retries = 3, timeoutMs = 12000) => {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 AnimeHub/1.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1), 1000);
            } else {
              reject(e);
            }
          }
        });
      });

      req.on('error', (err) => {
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1), 1000);
        } else {
          reject(err);
        }
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        if (remaining > 0) {
          setTimeout(() => attempt(remaining - 1), 1000);
        } else {
          reject(new Error(`Request timed out after ${timeoutMs}ms`));
        }
      });
    };

    attempt(retries);
  });
};

function checkHasDub(anime) {
  if (anime.hasDub !== undefined && typeof anime.hasDub === 'boolean') return anime.hasDub;
  const title = (anime.title || '').toLowerCase();
  const dubTitles = [
    'attack on titan', 'shingeki no kyojin',
    'my hero academia', 'boku no hero academia',
    'demon slayer', 'kimetsu no yaiba',
    'naruto', 'boruto', 'bleach', 'one piece',
    'death note', 'fullmetal alchemist',
    'jujutsu kaisen', 'chainsaw man',
    'sword art online', 'tokyo ghoul',
    'hunter x hunter', 'steins;gate',
    'cowboy bebop', 'code geass',
    'dragon ball', 'spy x family',
    'vinland saga', 'cyberpunk',
    'frieren', 'solo leveling', 'kaiju no. 8',
    'dr. stone', 'black clover', 're:zero',
    'haikyu', 'konosuba', 'mob psycho 100',
    'overlord', 'shield hero', 'dungeon meshi',
    'blue lock', 'mashle', 'hell\'s paradise',
    'classroom of the elite', 'assassination classroom',
    'neon genesis evangelion', 'erased', 'parasyte',
    'your name', 'spirited away', 'princess mononoke',
    'howl\'s moving castle', 'a silent voice',
    'fruits basket', 'clannad', 'toradora',
    'kaguya-sama', 'horimiya', 'violet evergarden'
  ];
  if (dubTitles.some(t => title.includes(t))) return true;
  if (anime.userCount && anime.userCount > 1500) return true;
  return (anime.rank || 99) <= 12;
}

const isValidPoster = (item) => {
  const url = item.attributes?.posterImage?.large || item.attributes?.posterImage?.original;
  return url && !url.includes('Expires=');
};

const formatAnimeItem = (item, idx) => {
  const attrs = item.attributes || {};
  const title = attrs.canonicalTitle || attrs.titles?.en || attrs.titles?.en_jp || 'Anime Title';
  const season = attrs.subtype || 'TV';
  const hasDub = checkHasDub({
    title,
    season,
    rank: idx + 1,
    userCount: attrs.userCount
  });

  return {
    id: item.id,
    title,
    titles: {
      en: attrs.titles?.en || null,
      en_jp: attrs.titles?.en_jp || null,
      ja_jp: attrs.titles?.ja_jp || null
    },
    url: `https://kitsu.io/anime/${attrs.slug}`,
    poster: attrs.posterImage?.large || attrs.posterImage?.original || 'https://media.kitsu.app/anime/poster_images/7442/large.jpg',
    cover: attrs.coverImage?.large || attrs.coverImage?.original || null,
    synopsis: attrs.synopsis || 'No synopsis available.',
    score: attrs.averageRating ? `${attrs.averageRating}%` : 'N/A',
    ratingRank: attrs.ratingRank || null,
    popularityRank: attrs.popularityRank || null,
    episodes: attrs.episodeCount || null,
    episodeLength: attrs.episodeLength || null,
    season,
    year: attrs.startDate ? attrs.startDate.substring(0, 4) : 'TBA',
    startDate: attrs.startDate || null,
    endDate: attrs.endDate || null,
    status: attrs.status || 'finished',
    ageRating: attrs.ageRating || null,
    ageRatingGuide: attrs.ageRatingGuide || null,
    rank: idx + 1,
    hasSub: true,
    hasDub
  };
};

export async function fetchCategories() {
  console.log('Fetching top anime for all 18 categories (25-30 titles each)...');
  const categoryData = {};

  for (const cat of CATEGORIES) {
    console.log(`Fetching category: ${cat}...`);
    try {
      // Batch 1 (top 20)
      const url1 = `https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=${cat}&sort=-userCount&page%5Blimit%5D=20&page%5Boffset%5D=0`;
      const res1 = await fetchWithRetry(url1, 3, 14000);
      const items1 = (res1?.data || []).filter(isValidPoster);
      await delay(250);

      // Batch 2 (next 15)
      let items2 = [];
      try {
        const url2 = `https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=${cat}&sort=-userCount&page%5Blimit%5D=15&page%5Boffset%5D=20`;
        const res2 = await fetchWithRetry(url2, 2, 10000);
        items2 = (res2?.data || []).filter(isValidPoster);
      } catch {
        // Fallback to batch 1 only
      }

      // Combine and deduplicate
      const seenIds = new Set();
      const combined = [];
      for (const it of [...items1, ...items2]) {
        if (!seenIds.has(it.id)) {
          seenIds.add(it.id);
          combined.push(it);
        }
      }

      const formatted = combined.map((it, idx) => formatAnimeItem(it, idx));
      categoryData[cat] = formatted;
      console.log(`✓ ${cat}: ${formatted.length} titles`);
      await delay(300);
    } catch (err) {
      console.error(`✗ Failed to fetch category ${cat}:`, err.message);
      categoryData[cat] = [];
    }
  }

  const publicPath = path.join(__dirname, '..', 'public', 'data', 'categories.json');
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.writeFileSync(publicPath, JSON.stringify(categoryData, null, 2));
  console.log(`Saved JSON to ${publicPath}`);

  const fallbackPath = path.join(__dirname, '..', 'src', 'data', 'categoryFallbackData.js');
  const jsContent = `// Auto-generated category data for instant 0ms load\nexport const INITIAL_CATEGORY_DATA = ${JSON.stringify(categoryData, null, 2)};\n`;
  fs.writeFileSync(fallbackPath, jsContent);
  console.log(`Saved fallback JS to ${fallbackPath}`);
  return categoryData;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchCategories();
}
