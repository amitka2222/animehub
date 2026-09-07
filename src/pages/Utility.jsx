import React, { useState } from 'react';
import axios from 'axios';
import { Search, Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';

const Utility = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    
    setPreview(imageUrl);
    setFile(null);
    fetchTraceMoe(`https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImageUrl('');
    
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleFileSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    fetchTraceMoe('https://api.trace.moe/search', {
      method: 'POST',
      body: formData,
    });
  };

  const fetchTraceMoe = async (url, config = {}) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await axios(url, config);
      if (res.data && res.data.result) {
        setResults(res.data.result.slice(0, 3)); // Get top 3 results
      }
    } catch (err) {
      console.error("Trace Moe error:", err);
      setError(err.response?.data?.error || "Failed to search image. Please ensure the image is a valid scene from an anime.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      <header className="border-b border-gray-800 pb-4 sm:pb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Scene Search (Trace.moe)</h2>
        <p className="text-xs sm:text-sm text-gray-400">Upload a screenshot or paste an image URL to identify which anime scene it's from.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Input Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-indigo-400">
              <LinkIcon className="mr-2" size={17} /> Search by URL
            </h3>
            <form onSubmit={handleUrlSubmit} className="flex space-x-2">
              <input 
                type="url" 
                placeholder="https://example.com/anime-scene.jpg" 
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={loading || !imageUrl}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 sm:px-4 py-2 rounded-xl transition-colors flex items-center cursor-pointer shrink-0"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg relative">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-purple-400">
              <Upload className="mr-2" size={17} /> Upload Image
            </h3>
            
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 sm:p-8 text-center hover:border-purple-500 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <ImageIcon className="mx-auto text-gray-500 mb-2.5" size={28} />
              <p className="text-gray-300 font-medium text-xs sm:text-sm">Click or drag image here</p>
              <p className="text-[11px] text-gray-500 mt-1.5">JPEG, PNG, WEBP (Max 1MB for best results)</p>
            </div>

            {file && (
              <button 
                onClick={handleFileSubmit}
                disabled={loading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors flex justify-center items-center font-medium text-xs sm:text-sm cursor-pointer"
              >
                {loading ? 'Searching...' : 'Search Uploaded Image'}
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-lg min-h-[320px] sm:min-h-[400px] flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b border-gray-700 pb-2">Results</h3>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 sm:p-4 rounded-xl flex items-start mb-4">
              <AlertCircle className="mr-2.5 mt-0.5 shrink-0" size={17} />
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {preview && (
            <div className="mb-4 sm:mb-6">
              <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-bold">Target Image</p>
              <img src={preview} alt="Target" className="w-full h-36 sm:h-44 object-cover rounded-xl border border-gray-600" />
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-12">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs sm:text-sm">Analyzing image across anime database...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-900/90 rounded-xl p-3 sm:p-4 border border-gray-700 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="sm:w-1/3 shrink-0">
                      <video 
                        src={result.video} 
                        poster={result.image} 
                        controls 
                        className="w-full h-auto rounded-lg border border-gray-800"
                      />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base truncate">{result.filename || "Unknown"}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-800 p-2 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Episode</p>
                          <p className="font-medium text-gray-200">{result.episode || "N/A"}</p>
                        </div>
                        <div className="bg-gray-800 p-2 rounded-lg">
                          <p className="text-gray-500 text-[10px]">Similarity</p>
                          <p className={`font-bold ${result.similarity > 0.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {(result.similarity * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-800 p-2 rounded-lg col-span-2">
                          <p className="text-gray-500 text-[10px]">Timestamp</p>
                          <p className="font-medium text-gray-200">
                            {formatTime(result.from)} - {formatTime(result.to)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : preview && !error ? (
              <div className="h-full flex items-center justify-center text-gray-500 py-10 text-xs sm:text-sm">
                No matching scenes found.
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-10 text-center px-4 text-xs sm:text-sm">
                Upload or link an image of an uncropped anime scene to find out where it belongs.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to format seconds into mm:ss
function formatTime(seconds) {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default Utility;
