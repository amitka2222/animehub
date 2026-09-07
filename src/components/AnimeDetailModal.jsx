import React, { useEffect } from 'react';
import { 
  X, Star, Calendar, Film, Headphones, MessageSquare, 
  ExternalLink, Clock, Tag, Award, Info, Sparkles 
} from 'lucide-react';

const FALLBACK_POSTER = 'https://media.kitsu.app/anime/poster_images/7442/large.jpg';

const AnimeDetailModal = ({ anime, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!anime) return null;

  const poster = anime.poster || anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || FALLBACK_POSTER;
  const score = anime.score || (anime.averageRating ? `${anime.averageRating}%` : 'N/A');
  const title = anime.title || 'Anime Title';
  const enTitle = anime.titles?.en && anime.titles?.en !== title ? anime.titles.en : null;
  const jpTitle = anime.titles?.ja_jp || anime.titles?.en_jp || null;
  const synopsis = anime.synopsis || 'No synopsis available for this anime.';
  const episodes = anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing';
  const format = anime.season || 'TV Series';
  const year = anime.year || (anime.startDate ? anime.startDate.substring(0, 4) : 'TBA');
  const status = anime.status === 'current' ? 'Currently Airing' : anime.status === 'upcoming' ? 'Coming Soon' : 'Finished Airing';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner / Header Image */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-gray-900 overflow-hidden shrink-0">
          {anime.cover ? (
            <img 
              src={anime.cover} 
              alt={title} 
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 to-purple-950/80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-full transition-colors cursor-pointer border border-white/10 z-20"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Floating Poster Preview */}
          <div className="absolute -bottom-6 left-4 sm:left-6 flex items-end space-x-4 z-10">
            <div className="w-24 sm:w-32 h-36 sm:h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 shrink-0 bg-gray-950">
              <img 
                src={poster} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_POSTER;
                }}
              />
            </div>
            
            <div className="pb-8 hidden sm:block">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                status === 'Currently Airing' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : status === 'Coming Soon'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-8 sm:pt-10 space-y-5">
          {/* Titles & Metadata */}
          <div>
            <div className="sm:hidden mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                status === 'Currently Airing' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : status === 'Coming Soon'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {status}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {title}
            </h2>

            {enTitle && (
              <p className="text-xs sm:text-sm text-indigo-300 mt-0.5 font-medium">{enTitle}</p>
            )}
            {jpTitle && (
              <p className="text-xs text-gray-400 mt-0.5">{jpTitle}</p>
            )}

            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="flex items-center text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg">
                <Star size={13} className="mr-1 fill-current" /> {score}
              </span>

              <span className="text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                {format}
              </span>

              <span className="text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                {year}
              </span>

              <span className="text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                {episodes}
              </span>

              {anime.ageRating && (
                <span className="text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg">
                  {anime.ageRating}
                </span>
              )}
            </div>
          </div>

          {/* Audio Availability Banner */}
          <div className="bg-gray-800/80 rounded-xl p-3 sm:p-4 border border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-200">Audio Availability</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Available audio tracks for this title</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold px-2.5 py-1 rounded-lg">
                <MessageSquare size={13} />
                <span>Japanese (SUB)</span>
              </span>

              {anime.hasDub ? (
                <span className="inline-flex items-center gap-1 bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  <Headphones size={13} />
                  <span>English (DUB)</span>
                </span>
              ) : (
                <span className="text-[11px] text-gray-500 italic">Sub only</span>
              )}
            </div>
          </div>

          {/* Full Synopsis */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-1.5">
              <Info size={15} className="text-indigo-400" />
              <span>Synopsis & Overview</span>
            </h3>
            <div className="bg-gray-800/50 rounded-xl p-3.5 sm:p-4 border border-gray-800 text-xs sm:text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
              {synopsis}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-gray-800/70 p-2.5 rounded-xl border border-gray-700/60">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rank</p>
              <p className="font-bold text-sm text-white mt-0.5">#{anime.rank || 'N/A'}</p>
            </div>

            <div className="bg-gray-800/70 p-2.5 rounded-xl border border-gray-700/60">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Episodes</p>
              <p className="font-bold text-sm text-white mt-0.5">{anime.episodes || 'TBD'}</p>
            </div>

            <div className="bg-gray-800/70 p-2.5 rounded-xl border border-gray-700/60">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Type</p>
              <p className="font-bold text-sm text-white mt-0.5">{format}</p>
            </div>

            <div className="bg-gray-800/70 p-2.5 rounded-xl border border-gray-700/60">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</p>
              <p className="font-bold text-sm text-yellow-400 mt-0.5">{score}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-gray-950/80 border-t border-gray-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          {anime.url && (
            <a
              href={anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <span>View Kitsu Entry</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailModal;
