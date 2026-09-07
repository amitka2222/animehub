import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';

const Entertainment = () => {
  const [quote, setQuote] = useState(null);
  const [image, setImage] = useState(null);
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState({ quote: true, image: true, fact: true });

  const fetchQuote = async () => {
    setLoading(prev => ({ ...prev, quote: true }));
    try {
      // Using an alternative quote API since AnimeChan is often down or rate-limited
      const res = await axios.get('https://animechan.xyz/api/random');
      setQuote(res.data);
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      // Fallback quote if API fails
      setQuote({
        anime: "Naruto",
        character: "Jiraiya",
        quote: "A place where someone still thinks about you is a place you can call home."
      });
    }
    setLoading(prev => ({ ...prev, quote: false }));
  };

  const fetchImage = async () => {
    setLoading(prev => ({ ...prev, image: true }));
    try {
      // Using NekosBest or waifu.pics
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');
      setImage(res.data.url);
    } catch (error) {
      console.error("Failed to fetch image:", error);
      setImage('https://nekos.best/api/v2/neko/0001.png'); // fallback
    }
    setLoading(prev => ({ ...prev, image: false }));
  };

  const fetchFact = async () => {
    setLoading(prev => ({ ...prev, fact: true }));
    try {
      // AnimeFacts API
      const animes = ['bleach', 'black_clover', 'dragon_ball', 'jujutsu_kaisen', 'fma_brotherhood', 'naruto', 'gintama', 'itachi_uchiha', 'one_piece', 'demon_slayer', 'attack_on_titan', 'hunter_x_hunter', 'boku_no_hero_academia'];
      const randomAnime = animes[Math.floor(Math.random() * animes.length)];
      const res = await axios.get(`https://anime-facts-rest-api.herokuapp.com/api/v1/${randomAnime}`);
      
      if (res.data && res.data.data && res.data.data.length > 0) {
        const facts = res.data.data;
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        setFact({ anime: randomAnime.replace(/_/g, ' '), fact: randomFact.fact });
      }
    } catch (error) {
      console.error("Failed to fetch fact:", error);
      setFact({
        anime: "Anime Trivia",
        fact: "The highest grossing anime film of all time is Demon Slayer: Mugen Train."
      });
    }
    setLoading(prev => ({ ...prev, fact: false }));
  };

  useEffect(() => {
    fetchQuote();
    fetchImage();
    fetchFact();
  }, []);

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Entertainment Dashboard</h2>
        <p className="text-gray-400">Discover random quotes, facts, and art.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quote Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Quote size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-indigo-400">
                <Quote className="mr-2" size={20} /> Random Quote
              </h3>
              <button onClick={fetchQuote} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <RefreshCw size={16} className={loading.quote ? "animate-spin" : ""} />
              </button>
            </div>
            
            {loading.quote ? (
              <div className="h-32 flex items-center justify-center text-gray-500 animate-pulse">Loading quote...</div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg italic text-gray-200 font-serif leading-relaxed">"{quote?.quote}"</p>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="font-bold text-white">— {quote?.character}</p>
                  <p className="text-sm text-indigo-400">{quote?.anime}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fact Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-green-400">
                <Info className="mr-2" size={20} /> Did You Know?
              </h3>
              <button onClick={fetchFact} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <RefreshCw size={16} className={loading.fact ? "animate-spin" : ""} />
              </button>
            </div>
            
            {loading.fact ? (
              <div className="h-32 flex items-center justify-center text-gray-500 animate-pulse">Loading fact...</div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-gray-200 leading-relaxed">{fact?.fact}</p>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-green-400 uppercase tracking-wider font-bold">From: {fact?.anime}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center text-pink-400">
              <ImageIcon className="mr-2" size={20} /> Random Anime Art
            </h3>
            <button onClick={fetchImage} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2">
              <RefreshCw size={16} className={loading.image ? "animate-spin" : ""} />
              <span>Get New Image</span>
            </button>
          </div>
          
          <div className="w-full bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px] border border-gray-700">
            {loading.image ? (
              <div className="text-gray-500 animate-pulse">Loading image...</div>
            ) : (
              <img 
                src={image} 
                alt="Random Anime Art" 
                className="max-w-full max-h-[600px] object-contain rounded-xl"
                loading="lazy"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Entertainment;