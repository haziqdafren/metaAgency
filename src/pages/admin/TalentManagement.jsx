import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sliders, X, Download, User, MessageSquare, ExternalLink } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';

const categories = [
  'gaming', 'entertainment', 'education', 'lifestyle', 'music', 'other' // Updated to match content_category enum
];

const games = [
  'Mobile Legends', 'PUBG Mobile', 'Genshin Impact', 'Free Fire', 'Valorant', 'Apex Legends', 'Others'
];

const TalentManagement = () => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [followerRange, setFollowerRange] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [openGamesDropdown, setOpenGamesDropdown] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
      }
      setLoading(false);
    };

    fetchTalents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, selectedCategory, followerRange, selectedGames, sortConfig, talents]);

  const applyFiltersAndSort = () => {
    let filtered = talents.filter(talent => {
      const matchesSearch = talent.username_tiktok.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? talent.konten_kategori === selectedCategory : true;
      const matchesFollowerRange = followerRange ? checkFollowerRange(talent.followers_count, followerRange) : true;
      const matchesGames = selectedGames.length > 0 
        ? selectedGames.every(game => talent.game_preference && talent.game_preference.includes(game)) 
        : true;
      return matchesSearch && matchesCategory && matchesFollowerRange && matchesGames;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    setFilteredTalents(filtered);
    setCurrentPage(1); // Reset to first page on filter/sort change
  };

  const checkFollowerRange = (followers, range) => {
    if (followers === null || followers === undefined) return false; // Handle null/undefined followers
    switch (range) {
      case '0-100k': return followers >= 0 && followers <= 100000;
      case '100k-500k': return followers > 100000 && followers <= 500000;
      case '500k-1M': return followers > 500000 && followers <= 1000000;
      case '1M+': return followers > 1000000;
      default: return true;
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleGameChange = (game) => {
    setSelectedGames(prev => 
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTalents(currentItems.map(talent => talent.id));
    } else {
      setSelectedTalents([]);
    }
  };

  const handleSelectTalent = (id) => {
    setSelectedTalents(prev => 
      prev.includes(id) ? prev.filter(talentId => talentId !== id) : [...prev, id]
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTalents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
    }
    return '';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const confirmExport = () => {
    // Actual export logic will go here later
    alert('Exporting data to Excel!'); // Keep alert for now as a placeholder for actual export
    setIsExportModalOpen(false);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
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
      <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Talent Database</h1>
      
      {/* Search and Filter Bar */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex-1 flex items-center space-x-2">
          <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-600'}`} />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-gray-100 text-meta-black placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select
          value={followerRange}
          onChange={(e) => setFollowerRange(e.target.value)}
          className={`p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
        >
          <option value="">All Followers</option>
          <option value="0-100k">0 - 100K</option>
          <option value="100k-500k">100K - 500K</option>
          <option value="500k-1M">500K - 1M</option>
          <option value="1M+">1M+</option>
        </select>

        {/* Games Multi-select (simplified) */}
        <div className="relative">
          <button 
            onClick={() => setOpenGamesDropdown(!openGamesDropdown)}
            className={`p-2 rounded-md flex items-center justify-between gap-2 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
          >
            Games <Sliders className="w-4 h-4"/>
          </button>
          {openGamesDropdown && (
            <div className={`absolute right-0 mt-2 p-4 rounded-md shadow-lg z-10 ${theme === 'dark' ? 'bg-meta-gray-800 border border-meta-gray-700' : 'bg-white border border-gray-200'}`}>
              {games.map(game => (
                <label key={game} className="flex items-center space-x-2 whitespace-nowrap mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    checked={selectedGames.includes(game)}
                    onChange={() => handleGameChange(game)}
                    className="form-checkbox text-meta-blue rounded focus:ring-meta-blue"
                  />
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{game}</span>
                </label>
              ))}
              <button 
                onClick={() => setOpenGamesDropdown(false)}
                className="absolute top-2 right-2 text-meta-gray-400 hover:text-meta-gray-600"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Talent Table */}
      <div className={`overflow-x-auto rounded-lg shadow ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <table className="min-w-full divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
          <thead className={`${theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}`}>
            <tr>
              <th scope="col" className="p-4 text-left">
                <input 
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedTalents.length === currentItems.length && currentItems.length > 0}
                  className="form-checkbox text-meta-blue rounded focus:ring-meta-blue"
                />
              </th>
              <th
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                onClick={() => requestSort('username_tiktok')}
              >
                Username{getSortIndicator('username_tiktok')}
              </th>
              <th
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                onClick={() => requestSort('followers_count')}
              >
                Followers{getSortIndicator('followers_count')}
              </th>
              <th
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                onClick={() => requestSort('konten_kategori')}
              >
                Category{getSortIndicator('konten_kategori')}
              </th>
              <th
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
              >
                Games
              </th>
              <th
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                onClick={() => requestSort('status')}
              >
                Status{getSortIndicator('status')}
              </th>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
            {currentItems.length > 0 ? (
              currentItems.map((talent) => (
                <motion.tr 
                  key={talent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: talent.id.charCodeAt(0) * 0.001 }}
                  className={`${selectedTalents.includes(talent.id) ? (theme === 'dark' ? 'bg-meta-blue/20' : 'bg-blue-50') : ''} ${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}
                >
                  <td className="p-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTalents.includes(talent.id)}
                      onChange={() => handleSelectTalent(talent.id)}
                      className="form-checkbox text-meta-blue rounded focus:ring-meta-blue"
                    />
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-meta-gray-500" />
                      <span>@{talent.username_tiktok}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                    {formatNumber(talent.followers_count)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                    {talent.konten_kategori || 'N/A'}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                    {(talent.game_preference && talent.game_preference.length > 0) ? talent.game_preference.join(', ') : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      talent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {talent.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <a
                        href={talent.link_tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-meta-blue hover:text-blue-700"
                        title="View TikTok Profile"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <a
                        href={`https://wa.me/${talent.nomor_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="Contact via WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </a>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>No talents found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-600'}`}>
            Page {currentPage} of {totalPages}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : (theme === 'dark' ? 'bg-meta-gray-700 text-white hover:bg-meta-gray-600' : 'bg-gray-200 text-meta-black hover:bg-gray-300')}`}
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : (theme === 'dark' ? 'bg-meta-blue text-white hover:bg-meta-blue/90' : 'bg-meta-blue text-white hover:bg-meta-blue/90')}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Export to Excel Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleExportClick}
          className="bg-green-600 text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-green-700 transition flex items-center justify-center gap-2 float-right"
        >
          <Download className="w-5 h-5" />
          <span>Export to Excel</span>
        </button>
      </div>

      <AnimatePresence>
        {isExportModalOpen && (
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
                onClick={closeExportModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Confirm Export</h2>
              <p className="mb-6">Are you sure you want to export all talent data to Excel?</p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeExportModal}
                  className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmExport}
                  className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition"
                >
                  Export
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TalentManagement; 