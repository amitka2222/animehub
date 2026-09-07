import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Star, Calendar, ExternalLink, Activity, Flame, Sparkles, Trophy, 
  Search, Tv, Headphones, MessageSquare, X, Layers, Newspaper, ChevronRight, Zap
} from 'lucide-react';
import { checkHasDub } from '../utils/animeUtils';

const FALLBACK_POSTER = 'https://media.kitsu.app/anime/poster_images/7442/large.jpg';

const Discovery = () => {
  const [data, setData] = useState({ 
    topWeekly: [], 
    newThisWeek: [], 
    top: [], 
    upcoming: [], 
    lastUpdated: null 
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'topWeekly', 'newThisWeek', 'top', 'upcoming'
  const [audioFilter, setAudioFilter] = useState('all'); // 'all', 'dub', 'sub'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/discovery.json`)
      .then(res => res.json())
      .then(json => {
        setData({
          topWeekly: json.topWeekly || [],
          newThisWeek: json.newThisWeek || [],
          top: json.top || [],
          upcoming: json.upcoming || [],
          lastUpdated: json.lastUpdated || null
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load discovery data.", err);
        setLoading(false);
      });
  }, []);

  const filterByAudioAndQuery = (list) => {
    let result = list;
    if (audioFilter === 'dub') {
      result = result.filter(item => checkHasDub(item));
    } else if (audioFilter === 'sub') {
      result = result.filter(item => item.hasSub);
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.synopsis && item.synopsis.toLowerCase().includes(q))
    );
  };

  const filteredTopWeekly = useMemo(() => filterByAudioAndQuery(data.topWeekly), [data.topWeekly, searchQuery, audioFilter]);
  const filteredNewThisWeek = useMemo(() => filterByAudioAndQuery(data.newThisWeek), [data.newThisWeek, searchQuery, audioFilter]);
  const filteredTop = useMemo(() => filterByAudioAndQuery(data.top), [data.top, searchQuery, audioFilter]);
  const filteredUpcoming = useMemo(() => filterByAudioAndQuery(data.upcoming), [data.upcoming, searchQuery, audioFilter]);

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-sm text-gray-400">Loading anime catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Homepage Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-gray-850 rounded-2xl sm:rounded-3xl border border-indigo-500/30 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-semibold border border-indigo-500/30 mb-2.5">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Welcome to AnimeHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Your Central Portal for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Anime & News</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-5 leading-relaxed">
            Discover weekly top trending anime, fresh releases, explore 12 genre categories, and stay informed with daily RSS news.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Layers size={14} />
              <span>Explore Categories</span>
              <ChevronRight size={13} />
            </Link>

            <Link
              to="/news"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold rounded-xl border border-gray-700 transition-all cursor-pointer"
            >
              <Newspaper size={14} className="text-rose-400" />
              <span>Daily News Feed</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Header and Last Updated Status */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 border-b border-gray-800 pb-3 sm:pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Discovery & Rankings
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Top airing shows this week, new releases, and community favorites.
          </p>
        </div>
        {data.lastUpdated && (
          <div className="text-[11px] sm:text-xs text-gray-400 flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 w-fit shrink-0">
            <Activity size={13} className="mr-1.5 text-green-400" />
            Updated {formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true })}
          </div>
        )}
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Horizontally scrollable tabs on mobile */}
        <div className="flex overflow-x-auto no-scrollbar pb-1 md:flex-wrap gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'all', label: 'All', icon: Tv },
            { id: 'topWeekly', label: 'Top This Week', icon: Flame, color: 'text-amber-400' },
            { id: 'newThisWeek', label: 'New Releases', icon: Sparkles, color: 'text-emerald-400' },
            { id: 'top', label: 'All-Time Top', icon: Trophy, color: 'text-indigo-400' },
            { id: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-purple-400' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/60'
                }`}
              >
                <Icon size={15} className={tab.color || ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Audio Filter and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-800/60 p-3 sm:p-4 rounded-2xl border border-gray-700/60">
          {/* Audio Filter (SUB / DUB) */}
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-700/80 self-start sm:self-auto">
            <button
              onClick={() => setAudioFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Audio
            </button>
            <button
              onClick={() => setAudioFilter('sub')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'sub'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={13} />
              <span>SUB</span>
            </button>
            <button
              onClick={() => setAudioFilter('dub')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'dub'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Headphones size={13} />
              <span>DUB</span>
            </button>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. TOP AIRING ANIME FOR THIS WEEK */}
      {(activeTab === 'all' || activeTab === 'topWeekly') && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
              <Flame size={20} className="text-amber-400" /> 
              Top Anime For This Week
            </h3>
            <span className="text-[11px] sm:text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Trending
            </span>
          </div>

          {filteredTopWeekly.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm py-4">No anime matched your search query in this section.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {filteredTopWeekly.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-amber-600"
                  badgeText={`#${anime.rank || idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. NEW ANIME FOR THIS WEEK */}
      {(activeTab === 'all' || activeTab === 'newThisWeek') && (
        <section className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-400" /> 
              New One For This Week
            </h3>
            <span className="text-[11px] sm:text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Fresh Releases
            </span>
          </div>

          {filteredNewThisWeek.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm py-4">No new anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {filteredNewThisWeek.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-emerald-600"
                  badgeText="New"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. ALL-TIME TOP RANKED ANIME */}
      {(activeTab === 'all' || activeTab === 'top') && (
        <section className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-indigo-400 flex items-center gap-2">
              <Trophy size={20} className="text-indigo-400" /> 
              All-Time Top Anime
            </h3>
            <span className="text-[11px] sm:text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Hall of Fame
            </span>
          </div>

          {filteredTop.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm py-4">No anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {filteredTop.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-indigo-600"
                  badgeText={`#${anime.rank || idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. UPCOMING ANIME */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <section className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-purple-400 flex items-center gap-2">
              <Calendar size={20} /> 
              Anticipated Upcoming Anime
            </h3>
            <span className="text-[11px] sm:text-xs bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Coming Soon
            </span>
          </div>

          {filteredUpcoming.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm py-4">No upcoming anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUpcoming.map((anime) => (
                <div key={anime.mal_id} className="bg-gray-800 rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 border border-gray-700 hover:border-purple-500/50 transition-colors">
                  <img 
                    src={anime.images?.webp?.image_url || anime.images?.webp?.large_image_url} 
                    alt={anime.title} 
                    className="w-20 sm:w-24 h-28 sm:h-36 object-cover rounded shadow shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-gray-100 mb-1 truncate">{anime.title}</h4>
                      <span className="inline-block bg-gray-700 text-[10px] sm:text-xs px-2 py-0.5 rounded text-gray-300 mb-1.5">
                        {anime.season} {anime.year}
                      </span>
                      <p className="text-xs text-gray-400 line-clamp-2">{anime.synopsis || "No synopsis available yet."}</p>
                    </div>
                    <a 
                      href={anime.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-2 inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      View on Kitsu <ExternalLink size={11} className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const AnimeCard = ({ anime, badgeColor, badgeText }) => {
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || FALLBACK_POSTER;
  const hasDub = checkHasDub(anime);

  return (
    <a 
      href={anime.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-900">
        <img 
          src={imageUrl} 
          alt={anime.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
        {badgeText && (
          <div className={`absolute top-2 right-2 ${badgeColor || 'bg-indigo-600'} text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow z-10`}>
            {badgeText}
          </div>
        )}

        {/* SUB / DUB Audio Badges */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
          <span className="bg-indigo-600/95 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            SUB
          </span>
          {hasDub && (
            <span className="bg-amber-600/95 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              DUB
            </span>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-gray-100 line-clamp-2 mb-1 sm:mb-1.5 group-hover:text-indigo-300 transition-colors">
            {anime.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {anime.synopsis}
          </p>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-700/60 flex justify-between items-center text-[10px] sm:text-xs">
          <span className="flex items-center text-yellow-400 font-medium">
            <Star size={12} className="mr-1 fill-current" /> {anime.score}
          </span>
          <span className="text-gray-400 font-medium">
            {anime.episodes ? `${anime.episodes} Eps` : 'Ongoing'}
          </span>
        </div>
      </div>
    </a>
  );
};

export default Discovery;
