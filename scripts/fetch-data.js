import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { fetchCategories } from './fetch-categories.js';
import { fetchAnimeNews } from './fetch-news.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  return (anime.rank || 99) <= 10;
}

const isValidPoster = (item) => {
  const url = item.attributes?.posterImage?.large || item.attributes?.posterImage?.original;
  return url && !url.includes('Expires=');
};

const formatKitsuData = (item, index) => {
  const attrs = item.attributes || {};
  return {
    mal_id: item.id,
    id: item.id,
    title: attrs.canonicalTitle || attrs.titles?.en || 'Anime Title',
    titles: {
      en: attrs.titles?.en || null,
      en_jp: attrs.titles?.en_jp || null,
      ja_jp: attrs.titles?.ja_jp || null
    },
    url: `https://kitsu.io/anime/${attrs.slug}`,
    poster: attrs.posterImage?.large || attrs.posterImage?.original || 'https://media.kitsu.app/anime/poster_images/7442/large.jpg',
    cover: attrs.coverImage?.large || attrs.coverImage?.original || null,
    images: { 
      webp: { 
        large_image_url: attrs.posterImage?.large || attrs.posterImage?.original || attrs.coverImage?.large, 
        image_url: attrs.posterImage?.small || attrs.posterImage?.medium 
      } 
    },
    synopsis: attrs.synopsis || 'No synopsis available.',
    score: attrs.averageRating ? `${attrs.averageRating}%` : 'N/A',
    episodes: attrs.episodeCount || null,
    rank: index !== undefined ? index + 1 : (attrs.ratingRank || 'N/A'),
    season: attrs.subtype || 'TV',
    startDate: attrs.startDate,
    year: attrs.startDate ? attrs.startDate.substring(0, 4) : 'TBA',
    status: attrs.status,
    hasSub: true,
    hasDub: checkHasDub({
      title: attrs.canonicalTitle || attrs.titles?.en || '',
      season: attrs.subtype || 'TV',
      userCount: attrs.userCount,
      rank: index !== undefined ? index + 1 : 99
    })
  };
};

async function fetchDiscoveryData() {
  console.log('Fetching anime discovery data from Kitsu API...');
  
  // 1. Top Airing Anime This Week
  console.log('Fetching top airing anime this week...');
  const topWeeklyReq = await fetchWithRetry('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=current&sort=-userCount&page%5Blimit%5D=12');
  await delay(300);

  // 2. New Anime Releases This Week
  console.log('Fetching new anime releases this week...');
  const newWeeklyReq = await fetchWithRetry('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=current&sort=-startDate&page%5Blimit%5D=20');
  await delay(300);

  // 3. All-time Top Anime
  console.log('Fetching all-time top anime...');
  const topAnimeReq = await fetchWithRetry('https://kitsu.io/api/edge/anime?sort=-userCount&page%5Blimit%5D=12');
  await delay(300);
  
  // 4. Upcoming Anime
  console.log('Fetching upcoming anime...');
  const upcomingAnimeReq = await fetchWithRetry('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=upcoming&sort=-userCount&page%5Blimit%5D=12');

  const topWeekly = (topWeeklyReq.data || []).filter(isValidPoster).slice(0, 10).map((item, idx) => formatKitsuData(item, idx));
  const newThisWeek = (newWeeklyReq.data || []).filter(isValidPoster).slice(0, 10).map((item, idx) => formatKitsuData(item, idx));
  const top = (topAnimeReq.data || []).filter(isValidPoster).slice(0, 10).map((item, idx) => formatKitsuData(item, idx));
  const upcoming = (upcomingAnimeReq.data || []).filter(isValidPoster).slice(0, 10).map((item, idx) => formatKitsuData(item, idx));

  const discoveryData = {
    lastUpdated: new Date().toISOString(),
    topWeekly,
    newThisWeek,
    top,
    upcoming
  };

  const outputPath = path.join(__dirname, '..', 'public', 'data', 'discovery.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(discoveryData, null, 2));
  console.log(`Successfully saved discovery data to ${outputPath}`);
}

async function run() {
  try {
    await fetchDiscoveryData();
    await fetchCategories();
    await fetchAnimeNews();
    console.log('All anime data, 18 categories, and daily news updated successfully!');
  } catch (error) {
    console.error('Data update encountered an error:', error);
    process.exit(1);
  }
}

run();
