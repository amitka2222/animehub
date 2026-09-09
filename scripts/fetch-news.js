import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchUrl = (url, timeoutMs = 12000, maxRedirects = 3) => {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error(`Too many redirects: ${url}`));
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'http:' ? http : https;
      const req = lib.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AnimeHub/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const nextUrl = new URL(res.headers.location, url).toString();
          return resolve(fetchUrl(nextUrl, timeoutMs, maxRedirects - 1));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(new Error(`Timeout fetching ${url}`));
      });
    } catch (e) {
      reject(e);
    }
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
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim();
}

async function fetchAnnImage(link) {
  if (!link || !link.startsWith('http')) return null;
  try {
    const html = await fetchUrl(link, 3500);
    const ogMatch = html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) ||
                    html.match(/<meta name=["']twitter:image["'] content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      const imgUrl = ogMatch[1].trim();
      if (!imgUrl.includes('ann-square') && !imgUrl.includes('placeholder')) {
        return imgUrl;
      }
    }
  } catch {
    // Gracefully ignore fetch errors for image scraping
  }
  return null;
}

export async function fetchAnimeNews() {
  console.log('Fetching anime news RSS feeds (Crunchyroll, ANN & MyAnimeList)...');
  const newsItems = [];

  // 1. Crunchyroll News (Prioritized)
  try {
    console.log('Fetching Crunchyroll News RSS...');
    const crXml = await fetchUrl('https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss', 10000);
    const crItems = crXml.split('<item>').slice(1);

    for (const raw of crItems) {
      const chunk = raw.split('</item>')[0];
      const titleMatch = chunk.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/) || chunk.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
      const descMatch = chunk.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const catMatch = chunk.match(/<category>([\s\S]*?)<\/category>/);
      const mediaMatch = chunk.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i) ||
                         chunk.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
                         chunk.match(/url=["']([^"']+\.(?:jpg|png|jpeg|webp))["']/i);

      if (titleMatch && linkMatch) {
        const link = linkMatch[1].trim();
        newsItems.push({
          id: 'cr-' + Buffer.from(link).toString('base64').slice(-12).replace(/[^a-zA-Z0-9]/g, ''),
          title: decodeHtml(titleMatch[1]),
          link,
          description: descMatch ? decodeHtml(descMatch[1]) : '',
          pubDate: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
          source: 'Crunchyroll News',
          category: catMatch ? decodeHtml(catMatch[1]) : 'Crunchyroll',
          image: mediaMatch ? mediaMatch[1].trim() : null
        });
      }
    }
    console.log(`✓ Crunchyroll News: ${newsItems.length} articles`);
  } catch (err) {
    console.warn('✗ Failed to fetch Crunchyroll News RSS:', err.message);
  }

  // 2. MyAnimeList News
  try {
    console.log('Fetching MyAnimeList RSS...');
    const malXml = await fetchUrl('https://myanimelist.net/rss/news.xml', 10000);
    const malItems = malXml.split('<item>').slice(1);
    let malCount = 0;

    for (const raw of malItems) {
      const chunk = raw.split('</item>')[0];
      const titleMatch = chunk.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = chunk.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const imgMatch = chunk.match(/<media:thumbnail>([\s\S]*?)<\/media:thumbnail>/) ||
                       chunk.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);

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
        malCount++;
      }
    }
    console.log(`✓ MyAnimeList: ${malCount} articles`);
  } catch (err) {
    console.warn('✗ Failed to fetch MyAnimeList RSS:', err.message);
  }

  // 3. Anime News Network
  try {
    console.log('Fetching Anime News Network RSS...');
    const annXml = await fetchUrl('https://www.animenewsnetwork.com/all/rss.xml?ann-edition=w', 10000);
    const annRawItems = annXml.split('<item>').slice(1);
    const parsedAnn = [];

    for (const raw of annRawItems) {
      const chunk = raw.split('</item>')[0];
      const titleMatch = chunk.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = chunk.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const catMatch = chunk.match(/<category>([\s\S]*?)<\/category>/);

      if (titleMatch && linkMatch) {
        const link = linkMatch[1].trim();
        parsedAnn.push({
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

    console.log(`Extracting images for top ${Math.min(30, parsedAnn.length)} ANN articles...`);
    const annToEnrich = parsedAnn.slice(0, 30);
    const annRemainder = parsedAnn.slice(30);

    // Concurrently fetch images in chunks of 6 to be server-friendly
    const chunkSize = 6;
    for (let i = 0; i < annToEnrich.length; i += chunkSize) {
      const batch = annToEnrich.slice(i, i + chunkSize);
      await Promise.all(batch.map(async (item) => {
        item.image = await fetchAnnImage(item.link);
      }));
    }

    const annAll = [...annToEnrich, ...annRemainder];
    const withImagesCount = annAll.filter(i => i.image).length;
    console.log(`✓ ANN: ${annAll.length} articles (${withImagesCount} with thumbnails)`);
    newsItems.push(...annAll);
  } catch (err) {
    console.warn('✗ Failed to fetch Anime News Network RSS:', err.message);
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
  const finalItems = uniqueItems.slice(0, 60);

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
