import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Newspaper, Rss, ExternalLink, RefreshCw, Search, Clock, 
  Sparkles, Radio, X, Tag, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { INITIAL_NEWS_DATA } from '../data/newsFallbackData';

const NewsThumbnail = ({ image, title, source, category, isFeatured = false }) => {
  const [imgError, setImgError] = useState(false);

  const getSourceGradient = () => {
    switch (source) {
      case 'Crunchyroll News':
        return 'from-amber-600/30 via-orange-950/40 to-gray-950 border-orange-500/30 text-orange-400';
      case 'Anime News Network':
        return 'from-indigo-950/80 via-blue-950/40 to-gray-950 border-indigo-500/30 text-indigo-400';
      case 'MyAnimeList':
        return 'from-purple-950/80 via-violet-950/40 to-gray-950 border-purple-500/30 text-purple-400';
      default:
        return 'from-rose-950/80 via-gray-900 to-gray-950 border-rose-500/30 text-rose-400';
    }
  };

  const containerClass = isFeatured
    ? "w-full lg:w-72 h-48 sm:h-56 rounded-2xl overflow-hidden shadow-xl shrink-0"
    : "w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-3.5 shadow-md shrink-0";

  if (!image || imgError) {
    return (
      <div className={`${containerClass} bg-gradient-to-br ${getSourceGradient()} border flex flex-col items-center justify-center p-4 relative group-hover:scale-101 transition-transform select-none`}>
        <div className="flex flex-col items-center text-center z-10 space-y-1.5">
          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-white/10 shadow-inner">
            <Newspaper size={isFeatured ? 26 : 20} className="opacity-90" />
          </div>
          <span className="text-[11px] font-bold text-gray-200 tracking-wide line-clamp-1">{category || source}</span>
          <span className="text-[10px] text-gray-400 font-medium">{source}</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`${containerClass} bg-gray-950 border border-gray-700/60 relative`}>
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

const News = () => {
  const [newsData, setNewsData] = useState(INITIAL_NEWS_DATA);
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'Crunchyroll News', 'Anime News Network', 'MyAnimeList'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);

  const fetchLatestNews = async (isManual = false) => {
    setRefreshing(true);
    setRefreshMessage(null);

    let baseItems = newsData.items || [];

    // 1. Fetch latest pre-built static news JSON with cache buster
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/news.json?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.items) && json.items.length > 0) {
          baseItems = json.items;
          setNewsData(json);
        }
      }
    } catch (err) {
      console.warn('Could not fetch static news.json, using current data:', err.message);
    }

    // 2. Query live Crunchyroll RSS feed via RSS-to-JSON for breaking stories with native images
    try {
      const liveRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcr-news-api-service.prd.crunchyrollsvc.com%2Fv1%2Fen-US%2Frss');
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.status === 'ok' && Array.isArray(liveJson.items)) {
          const liveItems = liveJson.items.map(it => ({
            id: 'cr-live-' + Math.abs((it.link || it.title).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
            title: it.title,
            link: it.link,
            description: (it.description || '').replace(/<[^>]*>/g, '').trim(),
            pubDate: new Date(it.pubDate).toISOString(),
            source: 'Crunchyroll News',
            category: it.categories?.[0] || 'Crunchyroll News',
            image: it.thumbnail || it.enclosure?.link || null
          }));

          // Merge & deduplicate, preserving existing high-res images
          const combined = [...liveItems, ...baseItems];
          const seen = new Set();
          const unique = [];
          for (const item of combined) {
            const key = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
            if (!seen.has(key)) {
              seen.add(key);
              // If incoming has no image, preserve baseItems image if present
              if (!item.image) {
                const match = baseItems.find(b => (b.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35) === key);
                if (match?.image) item.image = match.image;
              }
              unique.push(item);
            }
          }
          unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

          setNewsData({
            lastUpdated: new Date().toISOString(),
            items: unique.slice(0, 60)
          });
        }
      }
    } catch (rssErr) {
      console.warn('Live RSS stream check completed:', rssErr.message);
    }

    if (isManual) {
      setRefreshMessage('News feed updated with latest headlines!');
      setTimeout(() => setRefreshMessage(null), 3500);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLatestNews(false);
  }, []);

  const sources = useMemo(() => {
    const counts = { all: newsData.items?.length || 0 };
    (newsData.items || []).forEach(item => {
      counts[item.source] = (counts[item.source] || 0) + 1;
    });
    return counts;
  }, [newsData]);

  const filteredItems = useMemo(() => {
    let items = newsData.items || [];

    if (selectedSource !== 'all') {
      items = items.filter(item => item.source === selectedSource);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return items;
  }, [newsData, selectedSource, searchQuery]);

  // Featured story is the first matching item
  const featuredItem = filteredItems.length > 0 ? filteredItems[0] : null;
  const standardItems = filteredItems.length > 0 ? filteredItems.slice(1) : [];

  const formatPubDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const lastUpdatedDisplay = useMemo(() => {
    try {
      if (!newsData.lastUpdated) return 'Today';
      const d = new Date(newsData.lastUpdated);
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return 'Today';
    }
  }, [newsData.lastUpdated]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-gray-800 pb-4 sm:pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-2 sm:p-2.5 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Newspaper size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              Anime News & RSS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Daily curated anime industry headlines, premiere announcements, trailers, and box office updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Radio size={14} className="animate-pulse text-rose-400" />
            <span>Updated {lastUpdatedDisplay}</span>
          </div>

          <button
            onClick={() => fetchLatestNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-200 hover:text-white rounded-xl border border-gray-700 transition-colors cursor-pointer disabled:opacity-50 text-xs font-medium"
            title="Refresh news feed"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-rose-400' : 'text-gray-400'} />
            <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Update Feed'}</span>
          </button>
        </div>
      </header>

      {/* Refresh feedback toast */}
      {refreshMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-800/60 p-3 sm:p-4 rounded-2xl border border-gray-700/60 shadow-lg">
        {/* Source Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedSource === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-semibold'
                : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Sources ({sources.all})
          </button>

          {sources['Crunchyroll News'] && (
            <button
              onClick={() => setSelectedSource('Crunchyroll News')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSource === 'Crunchyroll News'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 font-semibold'
                  : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Crunchyroll News ({sources['Crunchyroll News']})
            </button>
          )}

          {sources['Anime News Network'] && (
            <button
              onClick={() => setSelectedSource('Anime News Network')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSource === 'Anime News Network'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Anime News Network ({sources['Anime News Network']})
            </button>
          )}

          {sources['MyAnimeList'] && (
            <button
              onClick={() => setSelectedSource('MyAnimeList')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSource === 'MyAnimeList'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                  : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
              }`}
            >
              MyAnimeList ({sources['MyAnimeList']})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news headlines..."
            className="w-full bg-gray-900/90 text-xs sm:text-sm text-gray-200 pl-9 pr-8 py-2 rounded-xl border border-gray-700 focus:border-rose-500 focus:outline-none placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Empty Search Result */}
      {filteredItems.length === 0 && (
        <div className="p-8 text-center bg-gray-800/40 rounded-2xl border border-gray-800 space-y-3">
          <p className="text-gray-400 text-sm">No news articles found for "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSource('all'); }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Featured Lead Story Banner */}
      {featuredItem && (
        <article className="relative overflow-hidden bg-gradient-to-r from-rose-950/60 via-gray-900 to-indigo-950/40 rounded-2xl sm:rounded-3xl border border-rose-500/30 p-5 sm:p-7 shadow-xl group">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">
            <NewsThumbnail
              image={featuredItem.image}
              title={featuredItem.title}
              source={featuredItem.source}
              category={featuredItem.category}
              isFeatured={true}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded shadow">
                  TOP STORY
                </span>
                <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded ${
                  featuredItem.source === 'Crunchyroll News'
                    ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                    : featuredItem.source === 'Anime News Network'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                }`}>
                  {featuredItem.source}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatPubDate(featuredItem.pubDate)}</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug mb-2 group-hover:text-rose-300 transition-colors">
                {featuredItem.title}
              </h3>

              {featuredItem.description && (
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                  {featuredItem.description}
                </p>
              )}

              <a
                href={featuredItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <span>Read Full Article on {featuredItem.source}</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </article>
      )}

      {/* News Cards Grid */}
      {standardItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {standardItems.map((item) => (
            <article
              key={item.id}
              className="bg-gray-800/80 hover:bg-gray-750 border border-gray-700/80 hover:border-rose-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-md hover:-translate-y-0.5"
            >
              <div>
                {/* Article thumbnail with fallback */}
                <NewsThumbnail
                  image={item.image}
                  title={item.title}
                  source={item.source}
                  category={item.category}
                  isFeatured={false}
                />

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    item.source === 'Crunchyroll News'
                      ? 'bg-orange-950/70 text-orange-300 border-orange-500/40'
                      : item.source === 'Anime News Network'
                      ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
                      : 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                  }`}>
                    {item.source}
                  </span>

                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{formatPubDate(item.pubDate)}</span>
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug mb-1.5">
                  {item.title}
                </h4>

                {item.description && (
                  <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-gray-700/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 flex items-center gap-1">
                  <Tag size={11} className="text-gray-400" />
                  <span>{item.category || 'Anime'}</span>
                </span>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 group-hover:underline"
                >
                  <span>Read</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
