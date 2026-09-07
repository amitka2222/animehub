import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, RefreshCw, Image as ImageIcon, Info, ExternalLink } from 'lucide-react';
import { ANIME_QUOTES, ANIME_FACTS } from '../data/entertainmentData';

const FALLBACK_ARTWORKS = [
  {
    title: "Attack on Titan",
    url: "https://media.kitsu.app/anime/poster_images/7442/large.jpg",
    source: "Kitsu"
  },
  {
    title: "My Hero Academia",
    url: "https://media.kitsu.app/anime/poster_images/11469/large.jpg",
    source: "Kitsu"
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    url: "https://media.kitsu.app/anime/poster_images/3936/large.jpg",
    source: "Kitsu"
  },
  {
    title: "Death Note",
    url: "https://media.kitsu.app/anime/poster_images/1376/large.jpg",
    source: "Kitsu"
  },
  {
    title: "Hunter x Hunter (2011)",
    url: "https://media.kitsu.app/anime/poster_images/6448/large.jpg",
    source: "Kitsu"
  }
];

const Entertainment = () => {
  const [quote, setQuote] = useState(null);
  const [art, setArt] = useState(null);
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState({ quote: false, image: true, fact: false });

  const getRandomItem = (list, currentItem) => {
    if (list.length <= 1) return list[0];
    let next;
    do {
      next = list[Math.floor(Math.random() * list.length)];
    } while (next === currentItem);
    return next;
  };

  const fetchQuote = () => {
    setLoading(prev => ({ ...prev, quote: true }));
    setTimeout(() => {
      setQuote(prev => getRandomItem(ANIME_QUOTES, prev));
      setLoading(prev => ({ ...prev, quote: false }));
    }, 150);
  };

  const fetchFact = () => {
    setLoading(prev => ({ ...prev, fact: true }));
    setTimeout(() => {
      setFact(prev => getRandomItem(ANIME_FACTS, prev));
      setLoading(prev => ({ ...prev, fact: false }));
    }, 150);
  };

  const fetchImage = async () => {
    setLoading(prev => ({ ...prev, image: true }));
    try {
      const randomOffset = Math.floor(Math.random() * 150);
      const res = await axios.get(
        `https://kitsu.io/api/edge/anime?page%5Blimit%5D=10&page%5Boffset%5D=${randomOffset}&sort=-userCount`,
        { timeout: 6000 }
      );

      const items = res.data?.data || [];
      const validItems = items.filter(
        item => item.attributes?.posterImage?.large || item.attributes?.coverImage?.large
      );

      if (validItems.length > 0) {
        const selected = validItems[Math.floor(Math.random() * validItems.length)];
        const poster = selected.attributes.posterImage?.large || selected.attributes.posterImage?.original;
        const cover = selected.attributes.coverImage?.large || selected.attributes.coverImage?.original;
        
        setArt({
          title: selected.attributes.canonicalTitle || selected.attributes.titles?.en || "Featured Anime",
          year: selected.attributes.startDate ? selected.attributes.startDate.substring(0, 4) : "",
          url: cover || poster,
          kitsuSlug: selected.attributes.slug,
          score: selected.attributes.averageRating
        });
      } else {
        throw new Error("No artwork found in batch");
      }
    } catch (error) {
      console.warn("Using fallback artwork:", error.message);
      const fallback = getRandomItem(FALLBACK_ARTWORKS, art);
      setArt({
        title: fallback.title,
        year: "",
        url: fallback.url,
        kitsuSlug: null,
        score: null
      });
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  useEffect(() => {
    setQuote(getRandomItem(ANIME_QUOTES, null));
    setFact(getRandomItem(ANIME_FACTS, null));
    fetchImage();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="border-b border-gray-800 pb-4 sm:pb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Entertainment Dashboard</h2>
        <p className="text-xs sm:text-sm text-gray-400">Discover random quotes, facts, and official anime artwork.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Quote Section */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Quote size={80} className="sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold flex items-center text-indigo-400">
                <Quote className="mr-2" size={18} /> Random Quote
              </h3>
              <button 
                onClick={fetchQuote} 
                title="Get new quote"
                className="p-2 bg-gray-700 hover:bg-indigo-600 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw size={15} className={loading.quote ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-base sm:text-lg italic text-gray-200 font-serif leading-relaxed">
                "{quote?.quote}"
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                <p className="font-bold text-sm sm:text-base text-white">— {quote?.character}</p>
                <p className="text-xs sm:text-sm text-indigo-400">{quote?.anime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fact Section */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg relative overflow-hidden group flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold flex items-center text-green-400">
                <Info className="mr-2" size={18} /> Did You Know?
              </h3>
              <button 
                onClick={fetchFact} 
                title="Get new fact"
                className="p-2 bg-gray-700 hover:bg-green-600 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw size={15} className={loading.fact ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{fact?.fact}</p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                <p className="text-xs sm:text-sm text-green-400 uppercase tracking-wider font-bold">
                  From: {fact?.anime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg col-span-1 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold flex items-center text-pink-400">
                <ImageIcon className="mr-2" size={18} /> Random Anime Art
              </h3>
              {art?.title && (
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Featured: <span className="text-white font-medium">{art.title}</span> {art.year ? `(${art.year})` : ""}
                  {art.score ? ` • ★ ${art.score}%` : ""}
                </p>
              )}
            </div>
            <button 
              onClick={fetchImage} 
              disabled={loading.image}
              className="self-start sm:self-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-pink-600 rounded-xl text-xs sm:text-sm transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading.image ? "animate-spin" : ""} />
              <span>Get New Image</span>
            </button>
          </div>
          
          <div className="w-full bg-gray-900 rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[300px] sm:min-h-[420px] border border-gray-700 relative p-3 sm:p-4">
            {loading.image ? (
              <div className="flex flex-col items-center space-y-3 py-16 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="text-xs sm:text-sm">Fetching anime artwork...</span>
              </div>
            ) : art?.url ? (
              <div className="flex flex-col items-center w-full">
                <img 
                  src={art.url} 
                  alt={art.title || "Random Anime Art"} 
                  className="max-w-full max-h-[420px] sm:max-h-[550px] object-contain rounded-lg shadow-2xl transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ARTWORKS[0].url;
                  }}
                />
                {art.kitsuSlug && (
                  <a
                    href={`https://kitsu.io/anime/${art.kitsuSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-gray-400 hover:text-pink-400 flex items-center transition-colors"
                  >
                    View on Kitsu <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            ) : (
              <div className="text-gray-500 py-16 text-xs sm:text-sm">Click 'Get New Image' to load artwork.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entertainment;
