import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Flame, Heart, Sparkles, Trophy, Rocket, Coffee, Ghost, 
  Smile, Zap, Compass, Search, Star, ExternalLink, Filter, 
  ArrowUpDown, Layers, Film, Headphones, MessageSquare
} from 'lucide-react';
import { checkHasDub } from '../utils/animeUtils';

const CATEGORIES = [
  { id: 'action', name: 'Action', icon: Flame, color: 'from-orange-500 to-amber-600', activeBorder: 'border-orange-500' },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: 'from-emerald-500 to-teal-600', activeBorder: 'border-emerald-500' },
  { id: 'comedy', name: 'Comedy', icon: Smile, color: 'from-yellow-400 to-amber-500', activeBorder: 'border-yellow-400' },
  { id: 'drama', name: 'Drama', icon: Film, color: 'from-sky-500 to-blue-600', activeBorder: 'border-sky-500' },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, color: 'from-purple-500 to-indigo-600', activeBorder: 'border-purple-500' },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'from-red-600 to-rose-700', activeBorder: 'border-red-600' },
  { id: 'mystery', name: 'Mystery', icon: Search, color: 'from-indigo-500 to-violet-600', activeBorder: 'border-indigo-500' },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500', activeBorder: 'border-pink-500' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: Rocket, color: 'from-cyan-500 to-blue-600', activeBorder: 'border-cyan-500' },
  { id: 'slice-of-life', name: 'Slice of Life', icon: Coffee, color: 'from-amber-600 to-yellow-600', activeBorder: 'border-amber-600' },
  { id: 'sports', name: 'Sports', icon: Trophy, color: 'from-lime-500 to-green-600', activeBorder: 'border-lime-500' },
  { id: 'supernatural', name: 'Supernatural', icon: Zap, color: 'from-fuchsia-500 to-purple-600', activeBorder: 'border-fuchsia-500' },
];

const SORT_OPTIONS = [
  { id: '-userCount', label: 'Most Popular' },
  { id: '-averageRating', label: 'Top Rated' },
  { id: '-startDate', label: 'Newest Releases' },
];

const FALLBACK_POSTER = 'https://media.kitsu.app/anime/poster_images/7442/large.jpg';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('action');
  const [sortBy, setSortBy] = useState('-userCount');
  const [audioFilter, setAudioFilter] = useState('all'); // 'all', 'dub', 'sub'
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cache, setCache] = useState({});

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  useEffect(() => {
    const cacheKey = `${selectedCategory}_${sortBy}`;
    if (cache[cacheKey]) {
      setAnimeList(cache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const categorySlug = selectedCategory;

    axios.get(`https://kitsu.io/api/edge/anime?filter%5Bcategories%5D=${categorySlug}&sort=${sortBy}&page%5Blimit%5D=15`, {
      timeout: 8000
    })
      .then(res => {
        const items = res.data?.data || [];
        const formatted = items
          .filter(item => {
            const img = item.attributes?.posterImage?.large || item.attributes?.posterImage?.original;
            return img && !img.includes('Expires=');
          })
          .map((item, idx) => {
            const title = item.attributes.canonicalTitle || item.attributes.titles?.en || 'Anime Title';
            const season = item.attributes.subtype || 'TV';
            const hasDub = checkHasDub({
              title,
              season,
              rank: idx + 1,
              hasDub: item.attributes.userCount > 1000
            });

            return {
              id: item.id,
              title,
              url: `https://kitsu.io/anime/${item.attributes.slug}`,
              poster: item.attributes.posterImage?.large || item.attributes.posterImage?.original || FALLBACK_POSTER,
              synopsis: item.attributes.synopsis || 'No synopsis available.',
              score: item.attributes.averageRating ? `${item.attributes.averageRating}%` : 'N/A',
              episodes: item.attributes.episodeCount,
              season,
              year: item.attributes.startDate ? item.attributes.startDate.substring(0, 4) : 'TBA',
              rank: idx + 1,
              hasSub: true,
              hasDub
            };
          });

        setAnimeList(formatted);
        setCache(prev => ({ ...prev, [cacheKey]: formatted }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load category anime:', err);
        setLoading(false);
      });
  }, [selectedCategory, sortBy]);

  const filteredAnime = useMemo(() => {
    let result = animeList;
    if (audioFilter === 'dub') {
      result = result.filter(anime => anime.hasDub);
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(anime => 
      anime.title.toLowerCase().includes(q) ||
      anime.synopsis.toLowerCase().includes(q)
    );
  }, [animeList, searchQuery, audioFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-gray-800 pb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Layers size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white">Browse by Category</h2>
        </div>
        <p className="text-gray-400">
          Discover anime across genres — from high-octane Action to heartfelt Romance and thrilling Sci-Fi.
        </p>
      </header>

      {/* Category Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
              className={`flex items-center space-x-2.5 p-3 rounded-xl transition-all cursor-pointer text-left border ${
                isSelected 
                  ? `bg-gradient-to-r ${category.color} text-white font-semibold shadow-lg shadow-black/40 border-transparent scale-102` 
                  : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-700/60 hover:border-gray-600'
              }`}
            >
              <Icon size={18} className={isSelected ? 'text-white' : 'text-gray-400'} />
              <span className="text-sm truncate">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Controls: Sort, Audio & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-800/60 p-4 rounded-2xl border border-gray-700/60">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300 flex items-center">
              <ArrowUpDown size={15} className="mr-1.5 text-indigo-400" /> Sort:
            </span>
            <div className="flex space-x-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-indigo-600 text-white shadow'
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
        </div>

        <div className="relative min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search in ${activeCategoryObj.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Anime Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>{activeCategoryObj.name} Anime</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {filteredAnime.length} Titles
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <p className="text-sm text-gray-400">Fetching {activeCategoryObj.name} anime...</p>
          </div>
        ) : filteredAnime.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-gray-800/40 rounded-2xl border border-gray-800">
            No anime found matching your search and audio filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredAnime.map((anime) => (
              <a
                key={anime.id}
                href={anime.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-gray-900">
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded border border-white/10 z-10">
                    #{anime.rank}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-indigo-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded z-10">
                    {anime.season} • {anime.year}
                  </div>

                  {/* SUB / DUB Audio Badges */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
                    <span className="bg-indigo-600/95 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      SUB
                    </span>
                    {anime.hasDub && (
                      <span className="bg-amber-600/95 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        DUB
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-100 line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Categories;
