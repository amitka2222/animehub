import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star, Calendar, ExternalLink, Activity, Flame, Sparkles, Trophy, Search, Tv } from 'lucide-react';

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

  const filterByQuery = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.title.toLowerCase().includes(q) || 
      (item.synopsis && item.synopsis.toLowerCase().includes(q))
    );
  };

  const filteredTopWeekly = useMemo(() => filterByQuery(data.topWeekly), [data.topWeekly, searchQuery]);
  const filteredNewThisWeek = useMemo(() => filterByQuery(data.newThisWeek), [data.newThisWeek, searchQuery]);
  const filteredTop = useMemo(() => filterByQuery(data.top), [data.top, searchQuery]);
  const filteredUpcoming = useMemo(() => filterByQuery(data.upcoming), [data.upcoming, searchQuery]);

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-gray-400">Loading anime discovery catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Anime Discovery
          </h2>
          <p className="text-gray-400">
            Top airing shows this week, new weekly releases, and community favorites.
          </p>
        </div>
        {data.lastUpdated && (
          <div className="text-xs md:text-sm text-gray-400 flex items-center bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 w-fit">
            <Activity size={14} className="mr-2 text-green-400" />
            Updated {formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true })}
          </div>
        )}
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Categories', icon: Tv },
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/60'
                }`}
              >
                <Icon size={16} className={tab.color || ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter anime by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 1. TOP ANIME THIS WEEK */}
      {(activeTab === 'all' || activeTab === 'topWeekly') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <Flame className="fill-current text-amber-400" size={24} /> 
              Top Anime For This Week
            </h3>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
              Weekly Airing Leaders
            </span>
          </div>

          {filteredTopWeekly.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {filteredTopWeekly.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-amber-600"
                  badgeText={`#${idx + 1} Airing`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. NEW ANIME FOR THIS WEEK */}
      {(activeTab === 'all' || activeTab === 'newThisWeek') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles size={24} className="text-emerald-400" /> 
              New One For This Week (Fresh Releases)
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
              Newly Premiered
            </span>
          </div>

          {filteredNewThisWeek.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No new anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {filteredNewThisWeek.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-emerald-600"
                  badgeText={anime.startDate ? `New: ${anime.startDate}` : 'New This Week'}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. ALL-TIME TOP RANKED ANIME */}
      {(activeTab === 'all' || activeTab === 'top') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
              <Trophy size={24} /> 
              All-Time Fan Favorites
            </h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
              Hall of Fame
            </span>
          </div>

          {filteredTop.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No top anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {filteredTop.map((anime, idx) => (
                <AnimeCard 
                  key={anime.mal_id || idx} 
                  anime={anime} 
                  badgeColor="bg-indigo-600"
                  badgeText={`#${idx + 1} Classic`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. ANTICIPATED UPCOMING */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
              <Calendar size={24} /> 
              Anticipated Upcoming Anime
            </h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-1 rounded-full border border-purple-500/30">
              Coming Soon
            </span>
          </div>

          {filteredUpcoming.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No upcoming anime matched your search query.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUpcoming.map((anime) => (
                <div key={anime.mal_id} className="bg-gray-800 rounded-xl p-4 flex gap-4 border border-gray-700 hover:border-purple-500/50 transition-colors">
                  <img 
                    src={anime.images?.webp?.image_url || anime.images?.webp?.large_image_url} 
                    alt={anime.title} 
                    className="w-24 h-36 object-cover rounded shadow"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-100 mb-1">{anime.title}</h4>
                      <span className="inline-block bg-gray-700 text-xs px-2.5 py-1 rounded text-gray-300 mb-2">
                        {anime.season} {anime.year}
                      </span>
                      <p className="text-sm text-gray-400 line-clamp-2">{anime.synopsis || "No synopsis available yet."}</p>
                    </div>
                    <a 
                      href={anime.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-2 inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-medium"
                    >
                      View on Kitsu <ExternalLink size={12} className="ml-1" />
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

// Reusable Anime Card Component
const AnimeCard = ({ anime, badgeColor, badgeText }) => {
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || FALLBACK_POSTER;

  return (
    <a 
      href={anime.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
    >
      <div className="relative h-64 overflow-hidden bg-gray-900">
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
          <div className={`absolute top-2 right-2 ${badgeColor || 'bg-indigo-600'} text-white text-xs font-bold px-2.5 py-1 rounded shadow`}>
            {badgeText}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-gray-100 line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
            {anime.title}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-3">
            {anime.synopsis}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700/60 flex justify-between items-center text-xs">
          <span className="flex items-center text-yellow-400 font-medium">
            <Star size={13} className="mr-1 fill-current" /> {anime.score}
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