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
  'supernatural'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = (url, retries = 3, timeoutMs = 12000) => {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = https.get(url, { headers: { 'User-Agent': 'AnimeHub/1.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            if (remaining > 0) {
              console.log(`JSON parse error, retrying (${remaining} left)...`);
              setTimeout(() => attempt(remaining - 1), 1500);
            } else {
              reject(e);
            }
          }
        });
      });

      req.on('error', (err) => {
        if (remaining > 0) {
          console.log(`Request error ${err.message}, retrying (${remaining} left)...`);
          setTimeout(() => attempt(remaining - 1), 1500);
        } else {
          reject(err);
        }
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        if (remaining > 0) {
          console.log(`Timeout on ${url}, retrying (${remaining} left)...`);
          setTimeout(() => attempt(remaining - 1), 1500);
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
  return (anime.rank || 99) <= 8;
}

async function fetchCategories() {
  console.log('Fetching top anime for all 12 categories...');
  const categoryData = {};

  for (const cat of CATEGORIES) {
    console.log(`Fetching category: ${cat}...`);
    try {
      const url = `https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=${cat}&sort=-userCount&page%5Blimit%5D=16`;
      const res = await fetchWithRetry(url, 3, 15000);
      const items = res?.data || [];
      const formatted = items
        .filter(item => {
          const img = item.attributes?.posterImage?.large || item.attributes?.posterImage?.original;
          return img && !img.includes('Expires=');
        })
        .slice(0, 14)
        .map((item, idx) => {
          const title = item.attributes.canonicalTitle || item.attributes.titles?.en || 'Anime Title';
          const season = item.attributes.subtype || 'TV';
          const hasDub = checkHasDub({
            title,
            season,
            rank: idx + 1,
            userCount: item.attributes.userCount
          });

          return {
            id: item.id,
            title,
            url: `https://kitsu.io/anime/${item.attributes.slug}`,
            poster: item.attributes.posterImage?.large || item.attributes.posterImage?.original || 'https://media.kitsu.app/anime/poster_images/7442/large.jpg',
            synopsis: item.attributes.synopsis || 'No synopsis available.',
            score: item.attributes.averageRating ? `${item.attributes.averageRating}%` : 'N/A',
            episodes: item.attributes.episodeCount,
            season,
            year: item.attributes.startDate ? item.attributes.startDate.substring(0, 4) : 'TBA',
            rank: idx + 1,
            hasSub: true,
            hasDub
          };
        });

      categoryData[cat] = formatted;
      console.log(`✓ ${cat}: ${formatted.length} titles`);
      await delay(400);
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
  const jsContent = `// Auto-generated initial category data for instant 0ms load\nexport const INITIAL_CATEGORY_DATA = ${JSON.stringify(categoryData, null, 2)};\n`;
  fs.writeFileSync(fallbackPath, jsContent);
  console.log(`Saved fallback JS to ${fallbackPath}`);
}

fetchCategories();
