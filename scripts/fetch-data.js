import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

async function fetchDiscoveryData() {
  console.log('Fetching anime discovery data from Kitsu API...');
  
  try {
    // 1. Top Airing Anime This Week
    console.log('Fetching top airing anime this week...');
    const topWeeklyReq = await fetchJson('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=current&sort=-userCount&page%5Blimit%5D=10');
    await delay(500);

    // 2. New Anime Releases This Week
    console.log('Fetching new anime releases this week...');
    const newWeeklyReq = await fetchJson('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=current&sort=-startDate&page%5Blimit%5D=20');
    await delay(500);

    // 3. All-time Top Anime
    console.log('Fetching all-time top anime...');
    const topAnimeReq = await fetchJson('https://kitsu.io/api/edge/anime?sort=-userCount&page%5Blimit%5D=10');
    await delay(500);
    
    // 4. Upcoming Anime
    console.log('Fetching upcoming anime...');
    const upcomingAnimeReq = await fetchJson('https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=upcoming&sort=-userCount&page%5Blimit%5D=10');
    
    const formatKitsuData = (item, index) => ({
      mal_id: item.id,
      title: item.attributes.canonicalTitle || item.attributes.titles?.en || 'Anime Title',
      url: `https://kitsu.io/anime/${item.attributes.slug}`,
      images: { 
        webp: { 
          large_image_url: item.attributes.posterImage?.large || item.attributes.posterImage?.original || item.attributes.coverImage?.large, 
          image_url: item.attributes.posterImage?.small || item.attributes.posterImage?.medium 
        } 
      },
      synopsis: item.attributes.synopsis || 'No synopsis available.',
      score: item.attributes.averageRating ? `${item.attributes.averageRating}%` : 'N/A',
      episodes: item.attributes.episodeCount,
      rank: index !== undefined ? index + 1 : (item.attributes.ratingRank || 'N/A'),
      season: item.attributes.subtype || 'TV',
      startDate: item.attributes.startDate,
      year: item.attributes.startDate ? item.attributes.startDate.substring(0, 4) : 'TBA',
      status: item.attributes.status
    });

    const isValidPoster = (item) => {
      const url = item.attributes?.posterImage?.large || item.attributes?.posterImage?.original;
      return url && !url.includes('Expires=');
    };

    const topWeekly = topWeeklyReq.data 
      ? topWeeklyReq.data
          .filter(isValidPoster)
          .slice(0, 10)
          .map((item, idx) => formatKitsuData(item, idx)) 
      : [];

    const newThisWeek = newWeeklyReq.data 
      ? newWeeklyReq.data
          .filter(isValidPoster)
          .slice(0, 10)
          .map((item, idx) => formatKitsuData(item, idx))
      : [];

    const top = topAnimeReq.data 
      ? topAnimeReq.data
          .filter(isValidPoster)
          .slice(0, 10)
          .map((item, idx) => formatKitsuData(item, idx)) 
      : [];

    const upcoming = upcomingAnimeReq.data 
      ? upcomingAnimeReq.data
          .filter(isValidPoster)
          .slice(0, 10)
          .map((item, idx) => formatKitsuData(item, idx)) 
      : [];

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
  } catch (error) {
    console.error('Error fetching discovery data:', error);
    process.exit(1);
  }
}

fetchDiscoveryData();