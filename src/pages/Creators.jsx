import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Palette, Search, User, Award, BookOpen, Film, Sparkles, 
  ChevronRight, Star, ExternalLink, Filter, X, PlayCircle, Heart, Flame
} from 'lucide-react';
import { CREATORS_DATA } from '../data/creatorsData';
import { getDualTitles, checkHasDub } from '../utils/animeUtils';
import AnimeDetailModal from '../components/AnimeDetailModal';

const FALLBACK_POSTER = 'https://media.kitsu.app/anime/poster_images/7442/large.jpg';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Creators', icon: Sparkles },
  { id: 'mangaka', label: 'Mangaka & Authors', icon: BookOpen },
  { id: 'director', label: 'Visionary Directors', icon: Film },
];

const CreatorAvatar = ({ creator, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);
  const initials = creator.name
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  const isLg = size === 'lg';
  const sizeClass = isLg 
    ? 'w-20 h-24 sm:w-24 sm:h-28 text-2xl' 
    : 'w-14 h-16 sm:w-16 sm:h-20 text-lg';

  if (imgError || !creator.avatar) {
    return (
      <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-purple-800 via-indigo-900 to-gray-900 border-2 border-purple-500/50 flex flex-col items-center justify-center font-black text-white shadow-lg shrink-0 select-none`}>
        <span className="tracking-wider">{initials}</span>
        <span className="text-[9px] font-semibold text-purple-300/80 uppercase tracking-widest mt-0.5">
          {creator.category === 'director' ? 'Director' : 'Mangaka'}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shrink-0 border-2 ${isLg ? 'border-purple-500/60 shadow-xl' : 'border-gray-700 group-hover:border-purple-400 shadow'} transition-colors relative`}>
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={() => setImgError(true)}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-1 px-1.5 flex justify-between items-end">
        <span className="text-[9px] font-extrabold text-purple-300 tracking-wider">{initials}</span>
      </div>
    </div>
  );
};

const Creators = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCreatorId = searchParams.get('creator') || null;

  const [selectedCreatorId, setSelectedCreatorId] = useState(initialCreatorId);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogAnime, setCatalogAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);

  // Sync with URL query parameter
  useEffect(() => {
    const param = searchParams.get('creator');
    if (param) {
      setSelectedCreatorId(param);
    }
  }, [searchParams]);

  // Fetch anime catalog from categories and discovery data
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/discovery.json`).then(r => r.json()).catch(() => ({})),
      fetch(`${import.meta.env.BASE_URL}data/categories.json`).then(r => r.json()).catch(() => ({}))
    ]).then(([disc, cats]) => {
      const allItems = [];
      const seen = new Set();

      const addItem = (item) => {
        if (!item || !item.title) return;
        const key = (item.title || '').toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          allItems.push(item);
        }
      };

      // Add from discovery
      ['topWeekly', 'newThisWeek', 'top', 'upcoming'].forEach(k => {
        (disc[k] || []).forEach(addItem);
      });

      // Add from categories
      Object.values(cats || {}).forEach(categoryList => {
        if (Array.isArray(categoryList)) {
          categoryList.forEach(addItem);
        }
      });

      setCatalogAnime(allItems);
      setLoading(false);
    }).catch(err => {
      console.error('Failed loading catalog for creators:', err);
      setLoading(false);
    });
  }, []);

  // Filter creators by tab & search query
  const filteredCreators = useMemo(() => {
    return CREATORS_DATA.filter(creator => {
      // Category filter
      if (activeTab !== 'all' && creator.category !== activeTab) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const nameMatch = creator.name.toLowerCase().includes(q);
      const jpMatch = creator.japaneseName.toLowerCase().includes(q);
      const worksMatch = creator.notableWorks.some(w => w.toLowerCase().includes(q));
      const titlesMatch = creator.associatedTitles.some(t => t.toLowerCase().includes(q));
      const bioMatch = creator.bio.toLowerCase().includes(q);

      return nameMatch || jpMatch || worksMatch || titlesMatch || bioMatch;
    });
  }, [activeTab, searchQuery]);

  // Selected creator object
  const selectedCreator = useMemo(() => {
    if (!selectedCreatorId) return null;
    return CREATORS_DATA.find(c => c.id === selectedCreatorId) || null;
  }, [selectedCreatorId]);

  // Find all anime matching the selected creator
  const creatorAnimeWorks = useMemo(() => {
    if (!selectedCreator) return [];
    return catalogAnime.filter(anime => {
      const title = (anime.title || '').toLowerCase();
      const { englishTitle, romajiTitle } = getDualTitles(anime);
      const en = (englishTitle || '').toLowerCase();
      const rom = (romajiTitle || '').toLowerCase();
      const combined = `${title} ${en} ${rom}`;

      return selectedCreator.associatedTitles.some(key => combined.includes(key));
    });
  }, [selectedCreator, catalogAnime]);

  const handleSelectCreator = (creatorId) => {
    if (selectedCreatorId === creatorId) {
      setSelectedCreatorId(null);
      setSearchParams({});
    } else {
      setSelectedCreatorId(creatorId);
      setSearchParams({ creator: creatorId });
    }
  };

  const handleClearSelection = () => {
    setSelectedCreatorId(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-gray-900 rounded-2xl sm:rounded-3xl border border-purple-500/30 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] sm:text-xs font-semibold border border-purple-500/30 mb-2.5">
            <Palette size={14} className="text-purple-400" />
            <span>Artists & Visionaries</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Filter Anime by <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">Creator & Artist</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed">
            Discover the legendary mangaka, visionary anime directors, and creative duos behind your favorite worlds. Select any creator to filter and stream their works directly in AnimeHub.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-purple-300/90 font-medium">
            <span className="bg-purple-900/40 border border-purple-500/30 px-2.5 py-1 rounded-lg">
              ✨ {CREATORS_DATA.length} Master Creators
            </span>
            <span className="bg-purple-900/40 border border-purple-500/30 px-2.5 py-1 rounded-lg">
              🎨 Mangaka, Directors & Animators
            </span>
            <span className="bg-purple-900/40 border border-purple-500/30 px-2.5 py-1 rounded-lg">
              ⚡ Crunchyroll Stream Ready
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Controls: Role Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/70 p-3 sm:p-4 rounded-2xl border border-gray-700/60 shadow-lg">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border-purple-500'
                    : 'bg-gray-700/70 text-gray-300 hover:bg-gray-700 border-gray-600/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-purple-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creator, anime, or style..."
            className="w-full bg-gray-900/90 text-xs sm:text-sm text-gray-200 pl-9 pr-8 py-2 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none placeholder-gray-500"
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

      {/* SELECTED CREATOR SHOWCASE & FILTERED WORKS */}
      {selectedCreator && (
        <div className="bg-gray-850 border-2 border-purple-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-700/80 pb-5">
            <div className="flex items-start gap-4">
              <CreatorAvatar creator={selectedCreator} size="lg" />

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedCreator.role}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {selectedCreator.birthYear} • {selectedCreator.hometown}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedCreator.name}
                </h2>
                <p className="text-xs text-purple-300/90 font-jp mt-0.5">
                  {selectedCreator.japaneseName}
                </p>

                <p className="text-xs text-gray-300 mt-2.5 max-w-2xl leading-relaxed">
                  {selectedCreator.bio}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearSelection}
              className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-750 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-gray-600 transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>Clear Filter</span>
            </button>
          </div>

          {/* Details & Signature Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800/80 p-3.5 rounded-xl border border-gray-700/60">
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Sparkles size={13} /> Signature Artistic Style
              </p>
              <p className="text-gray-300 leading-relaxed">{selectedCreator.signatureStyle}</p>
            </div>

            <div className="bg-gray-800/80 p-3.5 rounded-xl border border-gray-700/60">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Award size={13} /> Accolades & Milestones
              </p>
              <p className="text-gray-300 leading-relaxed">{selectedCreator.awards}</p>
            </div>
          </div>

          {/* WORKS BY THIS CREATOR */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-purple-400" />
                <span>Anime Works by {selectedCreator.name} in Catalog</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {creatorAnimeWorks.length} {creatorAnimeWorks.length === 1 ? 'Title' : 'Titles'} Found
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">Loading titles...</div>
            ) : creatorAnimeWorks.length === 0 ? (
              <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-800 text-center space-y-2">
                <p className="text-sm font-semibold text-gray-300">Catalog matching currently updating for this creator.</p>
                <p className="text-xs text-gray-400">Notable works include: {selectedCreator.notableWorks.join(', ')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {creatorAnimeWorks.map((anime, idx) => {
                  const { primaryTitle, secondaryTitle } = getDualTitles(anime);
                  const hasDub = checkHasDub(anime);
                  const poster = anime.poster || anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || FALLBACK_POSTER;

                  return (
                    <div
                      key={anime.id || anime.mal_id || idx}
                      onClick={() => setSelectedAnime(anime)}
                      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col select-none text-left"
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
                          src={poster}
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
                          <h4 className="font-bold text-xs sm:text-sm text-gray-100 line-clamp-1 mb-0.5 group-hover:text-purple-300 transition-colors">
                            {anime.title || primaryTitle}
                          </h4>
                          {secondaryTitle && (
                            <p className="text-[10px] sm:text-[11px] text-purple-300/80 italic truncate mb-1">
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
                            {anime.year || 'TV'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATORS GRID LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <User size={19} className="text-purple-400" />
            <span>{selectedCreatorId ? 'All Creators & Artists' : 'Browse All Creators'}</span>
          </h2>
          <span className="text-xs text-gray-400">
            Showing {filteredCreators.length} of {CREATORS_DATA.length}
          </span>
        </div>

        {filteredCreators.length === 0 ? (
          <div className="p-8 text-center bg-gray-800/40 rounded-2xl border border-gray-800 space-y-3">
            <p className="text-gray-400 text-sm">No creators matched your search query "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredCreators.map((creator) => {
              const isSelected = selectedCreatorId === creator.id;
              return (
                <div
                  key={creator.id}
                  onClick={() => handleSelectCreator(creator.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group select-none text-left ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-950/40 ring-2 ring-purple-500/40 scale-102'
                      : 'bg-gray-800/80 hover:bg-gray-750 border-gray-700/80 hover:border-purple-500/50 hover:-translate-y-1'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectCreator(creator.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <CreatorAvatar creator={creator} size="sm" />

                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1 truncate">
                        {creator.category === 'director' ? 'Director' : 'Mangaka'}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-purple-300 transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-jp truncate mt-0.5">
                        {creator.japaneseName}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {creator.hometown}
                      </p>
                    </div>
                  </div>

                  {/* Notable Works Tags */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {creator.notableWorks.slice(0, 2).map((work, wIdx) => (
                        <span
                          key={wIdx}
                          className="text-[10px] font-medium bg-gray-900/80 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md truncate max-w-full"
                        >
                          {work}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between text-[11px] text-purple-400 group-hover:text-purple-300 font-semibold">
                      <span>{isSelected ? 'Viewing Works' : 'Filter by Creator'}</span>
                      <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

export default Creators;
