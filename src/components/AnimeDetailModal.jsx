import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Star, Calendar, Film, Headphones, MessageSquare, 
  ExternalLink, Clock, Tag, Award, Info, Sparkles, Tv, PlayCircle, Globe, Palette
} from 'lucide-react';
import { getDualTitles, getStreamingPlatforms, getAnimeCreator } from '../utils/animeUtils';

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
  
  // Extract dual titles
  const { primaryTitle, englishTitle, romajiTitle, japaneseTitle } = getDualTitles(anime);
  const displayTitle = anime.title || primaryTitle;
  
  const synopsis = anime.synopsis || 'No synopsis available for this anime.';
  const episodes = anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing';
  const format = anime.season || 'TV Series';
  const year = anime.year || (anime.startDate ? anime.startDate.substring(0, 4) : 'TBA');
  const status = anime.status === 'current' ? 'Currently Airing' : anime.status === 'upcoming' ? 'Coming Soon' : 'Finished Airing';

  // Get prioritized streaming platforms (Crunchyroll prioritized)
  const streamingPlatforms = getStreamingPlatforms(anime);
  const crunchyroll = streamingPlatforms.find(p => p.id === 'crunchyroll');
  const otherPlatforms = streamingPlatforms.filter(p => p.id !== 'crunchyroll');

  // Resolve creator/artist
  const creator = getAnimeCreator(anime);

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
              alt={displayTitle} 
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
                alt={displayTitle} 
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
          {/* Titles & Dual-Language Names */}
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

            {/* Main Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {displayTitle}
            </h2>

            {/* Dual Names Section: English & Japanese Original */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {englishTitle && englishTitle.toLowerCase() !== displayTitle.toLowerCase() && (
                <div className="inline-flex items-center gap-1.5 bg-blue-950/50 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs text-blue-200">
                  <span className="font-semibold text-blue-400">English:</span>
                  <span>{englishTitle}</span>
                </div>
              )}

              {romajiTitle && romajiTitle.toLowerCase() !== displayTitle.toLowerCase() && (
                <div className="inline-flex items-center gap-1.5 bg-purple-950/50 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs text-purple-200">
                  <span className="font-semibold text-purple-400">Romaji:</span>
                  <span className="italic">{romajiTitle}</span>
                </div>
              )}

              {japaneseTitle && (
                <div className="inline-flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-lg text-xs text-rose-200 font-jp">
                  <span className="font-semibold text-rose-400">日本語:</span>
                  <span>{japaneseTitle}</span>
                </div>
              )}

              {creator && (
                <Link
                  to={`/creators?creator=${creator.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 bg-purple-900/30 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer group"
                  title={`View more anime works by ${creator.name}`}
                >
                  <Palette size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-purple-400">Creator:</span>
                  <span className="underline decoration-purple-500/40 underline-offset-2">{creator.name}</span>
                </Link>
              )}
            </div>

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

          {/* WHERE TO WATCH / STREAMING LOCATIONS (PRIORITIZING CRUNCHYROLL) */}
          <div className="bg-gray-850 rounded-2xl p-4 sm:p-5 border border-gray-700/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Tv size={17} className="text-orange-400" />
                <span>Where to Watch</span>
              </h3>
              <span className="text-[11px] text-orange-400 font-semibold bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                Crunchyroll Prioritized
              </span>
            </div>

            {/* Primary Featured: Crunchyroll */}
            {crunchyroll && (
              <a
                href={crunchyroll.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:via-amber-500 hover:to-orange-600 text-white shadow-lg shadow-orange-600/25 transition-all border border-orange-400/40 cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <div className="w-10 h-10 rounded-lg bg-black/25 flex items-center justify-center shrink-0 border border-white/20">
                    <PlayCircle size={22} className="text-white fill-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base tracking-wide">Crunchyroll</span>
                      <span className="text-[10px] font-bold bg-black/40 text-amber-200 px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-wider">
                        ★ Primary Stream
                      </span>
                    </div>
                    <p className="text-xs text-orange-100/90 mt-0.5">
                      Stream official SUB & DUB in HD • Largest anime library
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-black/30 group-hover:bg-black/40 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-white/20 transition-colors">
                  <span>Watch on Crunchyroll</span>
                  <ExternalLink size={13} />
                </div>
              </a>
            )}

            {/* Secondary Streaming Locations (Netflix, Hulu) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {otherPlatforms.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gray-800/80 hover:bg-gray-750 border border-gray-700/80 hover:border-gray-600 transition-all text-gray-200 hover:text-white cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 border border-gray-700">
                      <PlayCircle size={15} className={platform.id === 'netflix' ? 'text-red-500' : 'text-emerald-400'} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-200 truncate">{platform.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{platform.tagline}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 group-hover:text-gray-200 flex items-center gap-1 shrink-0 ml-2">
                    <span>Search</span>
                    <ExternalLink size={11} />
                  </span>
                </a>
              ))}
            </div>
            
            <p className="text-[11px] text-gray-400 italic text-center sm:text-left pt-1">
              Links search official streaming services directly for availability in your region.
            </p>
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
