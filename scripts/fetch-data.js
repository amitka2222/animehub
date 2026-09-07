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
    // Kitsu API as Jikan seems to be having upstream connection issues to MAL
    const topAnimeReq = await fetchJson('https://kitsu.io/api/edge/anime?sort=-userCount&page[limit]=10');
    await delay(1000);
    
    const upcomingAnimeReq = await fetchJson('https://kitsu.io/api/edge/anime?filter[status]=upcoming&sort=-userCount&page[limit]=10');
    
    const formatKitsuData = (item) => ({
      mal_id: item.id, // we'll just use the kitsu ID 
      title: item.attributes.canonicalTitle,
      url: `https://kitsu.io/anime/${item.attributes.slug}`,
      images: { webp: { large_image_url: item.attributes.posterImage?.large, image_url: item.attributes.posterImage?.small } },
      synopsis: item.attributes.synopsis,
      score: item.attributes.averageRating,
      episodes: item.attributes.episodeCount,
      rank: item.attributes.ratingRank,
      season: item.attributes.subtype,
      year: item.attributes.startDate ? item.attributes.startDate.substring(0, 4) : 'TBA'
    });

    const top = topAnimeReq.data ? topAnimeReq.data.map(formatKitsuData) : [];
    const upcoming = upcomingAnimeReq.data ? upcomingAnimeReq.data.map(formatKitsuData) : [];

    const discoveryData = {
      lastUpdated: new Date().toISOString(),
      top,
      upcoming,
      news: [] // Kitsu doesn't have a simple news endpoint, we'll leave it empty for now
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