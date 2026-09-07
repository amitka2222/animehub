import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Heart, Sparkles, Trophy, Rocket, Coffee, Ghost, 
  Smile, Zap, Compass, Search, Star, ExternalLink, Filter, 
  ArrowUpDown, Layers, Film, Headphones, MessageSquare, X,
  Globe, Brain, ShieldAlert, Cpu, Music, Swords, Eye
} from 'lucide-react';
import { INITIAL_CATEGORY_DATA } from '../data/categoryFallbackData';
import AnimeDetailModal from '../components/AnimeDetailModal';
import { getDualTitles, matchesAnimeSearch } from '../utils/animeUtils';

const CATEGORIES = [
  { id: 'action', name: 'Action', icon: Flame, color: 'from-orange-500 to-amber-600' },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: 'from-emerald-500 to-teal-600' },
  { id: 'comedy', name: 'Comedy', icon: Smile, color: 'from-yellow-400 to-amber-500' },
  { id: 'drama', name: 'Drama', icon: Film, color: 'from-sky-500 to-blue-600' },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, color: 'from-purple-500 to-indigo-600' },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'from-red-600 to-rose-700' },
  { id: 'mystery', name: 'Mystery', icon: Search, color: 'from-indigo-500 to-violet-600' },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: Rocket, color: 'from-cyan-500 to-blue-600' },
  { id: 'slice-of-life', name: 'Slice of Life', icon: Coffee, color: 'from-amber-600 to-yellow-600' },
  { id: 'sports', name: 'Sports', icon: Trophy, color: 'from-lime-500 to-green-600' },
  { id: 'supernatural', name: 'Supernatural', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
  { id: 'isekai', name: 'Isekai', icon: Globe, color: 'from-teal-500 to-emerald-600' },
  { id: 'psychological', name: 'Psychological', icon: Brain, color: 'from-violet-600 to-purple-700' },
  { id: 'thriller', name: 'Thriller', icon: ShieldAlert, color: 'from-rose-600 to-red-600' },
  { id: 'mecha', name: 'Mecha', icon: Cpu, color: 'from-blue-600 to-cyan-600' },
  { id: 'music', name: 'Music', icon: Music, color: 'from-pink-600 to-purple-600' },
  { id: 'shounen', name: 'Shounen', icon: Swords, color: 'from-amber-500 to-orange-600' }
];

const SORT_OPTIONS = [
  { id: '-userCount', label: 'Popular' },
  { id: '-averageRating', label: 'Top Rated' },
  { id: '-startDate', label: 'Newest' },
];

const FALLBACK_POSTER = 'https://media.kitsu.app/anime/poster_images/7442/large.jpg';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('action');
  const [sortBy, setSortBy] = useState('-userCount');
  const [audioFilter, setAudioFilter] = useState('all'); // 'all', 'dub', 'sub'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDataMap, setCategoryDataMap] = useState(INITIAL_CATEGORY_DATA);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/categories.json`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(json => {
        if (json && Object.keys(json).length > 0) {
          setCategoryDataMap(prev => ({ ...prev, ...json }));
        }
      })
      .catch(err => {
        console.warn('Using initial categories data:', err.message);
      });
  }, []);

  const filteredAnime = useMemo(() => {
    const rawList = categoryDataMap[selectedCategory] || INITIAL_CATEGORY_DATA[selectedCategory] || [];
    let list = [...rawList];

    // Sort
    if (sortBy === '-averageRating') {
      list.sort((a, b) => {
        const scoreA = parseFloat(a.score) || 0;
        const scoreB = parseFloat(b.score) || 0;
        return scoreB - scoreA;
      });
    } else if (sortBy === '-startDate') {
      list.sort((a, b) => {
        const yearA = parseInt(a.year, 10) || 0;
        const yearB = parseInt(b.year, 10) || 0;
        return yearB - yearA;
      });
    } else {
      list.sort((a, b) => (a.rank || 99) - (b.rank || 99));
    }

    // Audio filter
    if (audioFilter === 'dub') {
      list = list.filter(anime => anime.hasDub);
    } else if (audioFilter === 'sub') {
      list = list.filter(anime => anime.hasSub);
    }

    // Search query filter (matches both English and Japanese names)
    if (searchQuery.trim()) {
      list = list.filter(anime => matchesAnimeSearch(anime, searchQuery));
    }

    return list;
  }, [categoryDataMap, selectedCategory, sortBy, audioFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="border-b border-gray-800 pb-4 sm:pb-6">
        <div className="flex items-center space-x-2.5 mb-1.5">
          <div className="p-2 sm:p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Layers size={20} className="sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Browse by Category</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          Explore curated anime across 18 genres — click any title for full synopsis, audio info, and details right here.
        </p>
      </header>

      {/* Category Pills Grid: 18 categories */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchQuery('');
              }}
              className={`flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                isSelected 
                  ? `bg-gradient-to-r ${category.color} text-white font-semibold shadow-lg shadow-black/40 border-transparent scale-102` 
                  : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-700/60 hover:border-gray-600'
              }`}
            >
              <Icon size={15} className={`shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
              <span className="text-xs sm:text-sm truncate">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Controls: Sort, Audio & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/60 p-3 sm:p-4 rounded-2xl border border-gray-700/60 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Sort By */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs sm:text-sm font-medium text-gray-300 flex items-center">
              <ArrowUpDown size={14} className="mr-1 text-indigo-400" /> Sort:
            </span>
            <div className="flex space-x-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Filter (SUB / DUB) */}
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-700/80">
            <button
              onClick={() => setAudioFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAudioFilter('sub')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'sub'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={12} />
              <span>SUB</span>
            </button>
            <button
              onClick={() => setAudioFilter('dub')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                audioFilter === 'dub'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Headphones size={12} />
              <span>DUB</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeCategoryObj.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
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

      {/* Anime Grid Section */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <span>{activeCategoryObj.name} Anime</span>
            <span className="text-[11px] sm:text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
              {filteredAnime.length} Titles
            </span>
          </h3>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Click any title to view details
          </span>
        </div>

        {filteredAnime.length === 0 ? (
          <div className="py-12 sm:py-16 text-center bg-gray-800/40 rounded-2xl border border-gray-700/60 p-6 sm:p-8">
            <p className="text-gray-300 font-medium mb-1.5 text-sm sm:text-base">No anime matched your current filter.</p>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">Try clearing the search query or setting audio to "All".</p>
            <button
              onClick={() => { setSearchQuery(''); setAudioFilter('all'); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filteredAnime.map((anime) => {
              const { primaryTitle, secondaryTitle } = getDualTitles(anime);
              return (
                <div
                  key={anime.id}
                  onClick={() => setSelectedAnime(anime)}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500 hover:-translate-y-1 transition-all duration-200 group cursor-pointer flex flex-col select-none text-left"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedAnime(anime);
                    }
                  }}
                >
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-900">
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_POSTER;
                      }}
                    />
                    {/* Crunchyroll stream indicator */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-black/75 backdrop-blur-xs text-orange-400 border border-orange-500/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        CR
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border border-white/10 z-10">
                      #{anime.rank}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-indigo-600/90 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded z-10">
                      {anime.season} • {anime.year}
                    </div>

                    {/* SUB / DUB Audio Badges */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
                      <span className="bg-indigo-600/95 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        SUB
                      </span>
                      {anime.hasDub && (
                        <span className="bg-amber-600/95 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          DUB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-100 line-clamp-1 mb-0.5 group-hover:text-indigo-300 transition-colors">
                        {anime.title || primaryTitle}
                      </h4>
                      {secondaryTitle && (
                        <p className="text-[10px] sm:text-[11px] text-indigo-300/80 italic truncate mb-1">
                          {secondaryTitle}
                        </p>
                      )}
                      <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Internal Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal 
          anime={selectedAnime} 
          onClose={() => setSelectedAnime(null)} 
        />
      )}
    </div>
  );
};

export default Categories;
