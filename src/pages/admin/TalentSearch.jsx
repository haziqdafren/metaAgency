import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sliders, CheckSquare, MessageSquare, Save, User, ExternalLink, X } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';

const categories = [
  'gaming', 'entertainment', 'education', 'lifestyle', 'music', 'other' // Updated to match content_category enum
];

const games = [
  'Mobile Legends', 'PUBG Mobile', 'Genshin Impact', 'Free Fire', 'Valorant', 'Apex Legends', 'Others'
];

const TalentSearch = () => {
  const { theme } = useThemeStore();
  const [followerRange, setFollowerRange] = useState([0, 2000000]); // 0 to 2M
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [talents, setTalents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id, username_tiktok, link_tiktok, nomor_wa, followers_count, konten_kategori, game_preference, status');
      
      if (error) {
        console.error('Error fetching talents:', error);
        setError(error.message);
      } else {
        setTalents(data);
        setSearchResults(data); // Initialize search results with all talents
      }
      setLoading(false);
    };

    fetchTalents();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [followerRange, selectedCategory, selectedGames, talents]);

  const handleSearch = () => {
    let filtered = talents.filter(talent => {
      const matchesFollowers = talent.followers_count >= followerRange[0] && talent.followers_count <= followerRange[1];
      const matchesCategory = selectedCategory ? talent.konten_kategori === selectedCategory : true;
      const matchesGames = selectedGames.length > 0 
        ? selectedGames.every(game => talent.game_preference && talent.game_preference.includes(game)) 
        : true;

      return matchesFollowers && matchesCategory && matchesGames;
    });
    setSearchResults(filtered);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const handleGameChange = (game) => {
    setSelectedGames(prev => 
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    );
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    // In a real application, you would save the search criteria to a database.
    // For now, we'll just simulate the action.
    alert('Search criteria saved!');
    setIsSaveModalOpen(false);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-meta-blue">Loading talent data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-gray-50 text-meta-black'}`}
    >
      <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Search Talent for Endorsements</h1>

      {/* Search Form */}
      <div className={`mb-8 p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Search Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="follower-range" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Follower Range: {formatNumber(followerRange[0])} - {formatNumber(followerRange[1])}</label>
            <input
              type="range"
              id="follower-range"
              min="0"
              max="2000000"
              value={followerRange[1]}
              onChange={(e) => setFollowerRange([0, parseInt(e.target.value)])}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-meta-blue/50 accent-meta-blue"
            />
          </div>

          <div>
            <label htmlFor="category" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="relative">
            <label htmlFor="games" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Games ({selectedGames.length})</label>
            <button 
              type="button"
              className={`w-full p-2 rounded-md text-left flex items-center justify-between ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
              onClick={() => setShowGamesDropdown(!showGamesDropdown)}
            >
              {selectedGames.length > 0 ? selectedGames.join(', ') : 'Select Games'}
              <Sliders className="w-4 h-4" />
            </button>
            {showGamesDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-full p-4 rounded-md shadow-lg z-10 ${theme === 'dark' ? 'bg-meta-gray-800 border border-meta-gray-700' : 'bg-white border border-gray-200'}`}>
                {games.map(game => (
                  <label key={game} className={`flex items-center space-x-2 cursor-pointer py-1 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>
                    <input
                      type="checkbox"
                      checked={selectedGames.includes(game)}
                      onChange={() => handleGameChange(game)}
                      className="form-checkbox text-meta-blue rounded"
                    />
                    <span>{game}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSearch} 
            className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            <span>Search Talents</span>
          </button>
          <button 
            onClick={handleSaveClick} 
            className={`${theme === 'dark' ? 'bg-meta-gray-700 text-white hover:bg-meta-gray-600' : 'bg-gray-200 text-meta-black hover:bg-gray-300'} rounded-lg py-2 px-4 font-semibold shadow transition flex items-center gap-2`}
          >
            <Save className="w-5 h-5" />
            <span>Save Search Criteria</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Search Results ({searchResults.length} talents)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.length > 0 ? (
            searchResults.map(talent => (
              <motion.div
                key={talent.id}
                className={`rounded-lg p-6 shadow-sm ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
                whileHover={{ scale: 1.02, boxShadow: theme === 'dark' ? "0 10px 20px rgba(0, 188, 212, 0.1)" : "0 10px 20px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <User className={`w-10 h-10 p-2 rounded-full ${theme === 'dark' ? 'bg-meta-blue/20 text-meta-blue' : 'bg-blue-100 text-blue-600'}`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{talent.username_tiktok}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Followers: {formatNumber(talent.followers_count)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className={`${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Category: {talent.konten_kategori || 'N/A'}</p>
                  <p className={`${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Games: {(talent.game_preference && talent.game_preference.length > 0) ? talent.game_preference.join(', ') : 'N/A'}</p>
                  <p className={`${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      talent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {talent.status}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <a
                    href={talent.link_tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-meta-blue hover:text-blue-700 flex items-center gap-1 text-sm"
                    title="View TikTok Profile"
                  >
                    <ExternalLink className="w-4 h-4" /> TikTok
                  </a>
                  {talent.nomor_wa && (
                    <a
                      href={`https://wa.me/${talent.nomor_wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 flex items-center gap-1 text-sm"
                      title="Contact via WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className={`text-center col-span-full py-8 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>No talents found matching your search criteria.</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isSaveModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`relative w-full max-w-md mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-white text-meta-black'}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={closeSaveModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Save Search Criteria</h2>
              <p className="mb-6">Are you sure you want to save the current search criteria?</p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeSaveModal}
                  className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSave}
                  className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TalentSearch; 