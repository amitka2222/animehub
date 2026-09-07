import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Newspaper, Rss, ExternalLink, RefreshCw, Search, Clock, 
  Sparkles, Radio, X, Tag, ArrowUpRight
} from 'lucide-react';
import { INITIAL_NEWS_DATA } from '../data/newsFallbackData';

const News = () => {
  const [newsData, setNewsData] = useState(INITIAL_NEWS_DATA);
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'Anime News Network', 'MyAnimeList'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestNews = () => {
    setRefreshing(true);
    fetch(`${import.meta.env.BASE_URL}data/news.json?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load news');
        return res.json();
      })
      .then(json => {
        if (json && json.items && json.items.length > 0) {
          setNewsData(json);
        }
      })
      .catch(err => {
        console.warn('Using bundled initial news data:', err.message);
      })
      .finally(() => {
        setTimeout(() => setRefreshing(false), 300);
      });
  };

  useEffect(() => {
    fetchLatestNews();
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
            <span>Updated Daily</span>
          </div>

          <button
            onClick={fetchLatestNews}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh news feed"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-rose-400' : ''} />
          </button>
        </div>
      </header>

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
            placeholder="Search news headlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* News Content */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-gray-800/40 rounded-2xl border border-gray-700/60 p-8">
          <p className="text-gray-300 font-medium mb-1.5">No news articles found matching your filter.</p>
          <p className="text-gray-500 text-xs mb-4">Try clearing the search query or selecting "All Sources".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSource('all'); }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Headline Hero Card */}
          {featuredItem && !searchQuery && (
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-800 to-rose-950/40 rounded-2xl border border-gray-700/80 p-5 sm:p-7 shadow-xl hover:border-rose-500/50 transition-all group">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                {featuredItem.image ? (
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.title}
                    className="w-full md:w-56 h-40 md:h-44 object-cover rounded-xl border border-gray-700 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-full md:w-48 h-32 md:h-40 bg-gradient-to-br from-rose-900/40 to-gray-900 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-rose-400 shrink-0">
                    <Sparkles size={36} className="mb-2 opacity-80" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Featured Story</span>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        TOP STORY
                      </span>
                      <span className="text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        {featuredItem.source}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Clock size={12} className="mr-1 text-gray-500" />
                        {formatPubDate(featuredItem.pubDate)}
                      </span>
                    </div>

                    <a
                      href={featuredItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg sm:text-2xl font-bold text-white hover:text-rose-300 transition-colors line-clamp-2 mb-2 block"
                    >
                      {featuredItem.title}
                    </a>

                    <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed mb-4">
                      {featuredItem.description}
                    </p>
                  </div>

                  <a
                    href={featuredItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 self-start group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Full Article on {featuredItem.source}</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Standard Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(searchQuery ? filteredItems : standardItems).map((article) => (
              <a
                key={article.id || article.link}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-700/70 hover:border-rose-500/60 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between shadow-lg"
              >
                <div>
                  {article.image && (
                    <div className="mb-3 rounded-xl overflow-hidden h-36 bg-gray-900 border border-gray-700/60">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      article.source === 'MyAnimeList'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                        : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {article.source}
                    </span>

                    <span className="text-[11px] text-gray-400 flex items-center">
                      <Clock size={11} className="mr-1 text-gray-500" />
                      {formatPubDate(article.pubDate)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-gray-100 group-hover:text-rose-300 transition-colors line-clamp-2 mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                    {article.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500 flex items-center">
                    <Tag size={11} className="mr-1" />
                    {article.category || 'Anime'}
                  </span>

                  <span className="text-rose-400 group-hover:text-rose-300 font-medium inline-flex items-center gap-0.5">
                    <span>Read</span>
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
