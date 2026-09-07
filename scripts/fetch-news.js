import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchUrl = (url, timeoutMs = 12000) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnimeHub/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
};

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export async function fetchAnimeNews() {
  console.log('Fetching anime news RSS feeds (ANN & MyAnimeList)...');
  const newsItems = [];

  // 1. Anime News Network
  try {
    console.log('Fetching Anime News Network RSS...');
    const annXml = await fetchUrl('https://www.animenewsnetwork.com/all/rss.xml?ann-edition=w');
    const annItems = annXml.split('<item>').slice(1);
    
    for (const raw of annItems) {
      const chunk = raw.split('</item>')[0];
      const titleMatch = chunk.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = chunk.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const catMatch = chunk.match(/<category>([\s\S]*?)<\/category>/);

      if (titleMatch && linkMatch) {
        const link = linkMatch[1].trim();
        newsItems.push({
          id: 'ann-' + Buffer.from(link).toString('base64').slice(-12).replace(/[^a-zA-Z0-9]/g, ''),
          title: decodeHtml(titleMatch[1]),
          link,
          description: descMatch ? decodeHtml(descMatch[1]) : '',
          pubDate: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
          source: 'Anime News Network',
          category: catMatch ? decodeHtml(catMatch[1]) : 'Anime',
          image: null
        });
      }
    }
    console.log(`✓ ANN: ${annItems.length} articles`);
  } catch (err) {
    console.warn('✗ Failed to fetch Anime News Network RSS:', err.message);
  }

  // 2. MyAnimeList News
  try {
    console.log('Fetching MyAnimeList RSS...');
    const malXml = await fetchUrl('https://myanimelist.net/rss/news.xml');
    const malItems = malXml.split('<item>').slice(1);
    
    for (const raw of malItems) {
      const chunk = raw.split('</item>')[0];
      const titleMatch = chunk.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = chunk.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const imgMatch = chunk.match(/<media:thumbnail>([\s\S]*?)<\/media:thumbnail>/);

      if (titleMatch && linkMatch) {
        const link = linkMatch[1].trim();
        newsItems.push({
          id: 'mal-' + Buffer.from(link).toString('base64').slice(-12).replace(/[^a-zA-Z0-9]/g, ''),
          title: decodeHtml(titleMatch[1]),
          link,
          description: descMatch ? decodeHtml(descMatch[1]) : '',
          pubDate: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
          source: 'MyAnimeList',
          category: 'News',
          image: imgMatch ? imgMatch[1].trim() : null
        });
      }
    }
    console.log(`✓ MyAnimeList: ${malItems.length} articles`);
  } catch (err) {
    console.warn('✗ Failed to fetch MyAnimeList RSS:', err.message);
  }

  // Deduplicate by title & sort chronologically descending
  const seenTitles = new Set();
  const uniqueItems = [];
  for (const item of newsItems) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueItems.push(item);
    }
  }

  uniqueItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  const finalItems = uniqueItems.slice(0, 50);

  const payload = {
    lastUpdated: new Date().toISOString(),
    items: finalItems
  };

  const publicPath = path.join(__dirname, '..', 'public', 'data', 'news.json');
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.writeFileSync(publicPath, JSON.stringify(payload, null, 2));
  console.log(`Saved ${finalItems.length} news items to ${publicPath}`);

  const fallbackPath = path.join(__dirname, '..', 'src', 'data', 'newsFallbackData.js');
  const jsContent = `// Auto-generated news seed data for instant 0ms load\nexport const INITIAL_NEWS_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(fallbackPath, jsContent);
  console.log(`Saved news fallback JS to ${fallbackPath}`);

  return payload;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchAnimeNews().catch(err => {
    console.error('Failed to fetch anime news:', err);
    process.exit(1);
  });
}
