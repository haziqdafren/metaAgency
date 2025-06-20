import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const TalentSearch = () => {
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    followersMin: 0,
    followersMax: 5000000,
    category: '',
    games: '',
    status: 'all',
    validDaysMin: 0
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dummy search handler (replace with real API call)
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setSearchResults([]); // Replace with real results
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-gray-50 text-meta-black'}`}>
      <motion.div
        className={`rounded-xl shadow-lg p-8 mb-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Talent Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Search by username or creator ID"
            placeholder="e.g., johndoe or 12345"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <Input
            label="Games"
            placeholder="e.g., PUBG, ML"
            value={filters.games}
            onChange={e => setFilters({ ...filters, games: e.target.value })}
            className="mb-2"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <Input
            label="Min Followers"
            type="number"
            value={filters.followersMin}
            onChange={e => setFilters({ ...filters, followersMin: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Max Followers"
            type="number"
            value={filters.followersMax}
            onChange={e => setFilters({ ...filters, followersMax: parseInt(e.target.value) || 5000000 })}
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="gaming">Gaming</option>
            <option value="entertainment">Entertainment</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="education">Education</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Min Valid Days (Last Month)"
            type="number"
            value={filters.validDaysMin}
            onChange={e => setFilters({ ...filters, validDaysMin: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSearch} variant="primary" loading={loading}>Search</Button>
        </div>
      </motion.div>
      {/* Results Table */}
      <motion.div
        className={`rounded-xl shadow-lg p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4">Results</h3>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-meta-gray-700 bg-meta-gray-900 text-white' : 'divide-gray-200 bg-white text-meta-black'}`}>
            <thead className={theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-2 text-xs font-medium uppercase">Username</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Followers</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Category</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Games</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Status</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Recent Performance</th>
                <th className="px-4 py-2 text-xs font-medium uppercase">Contact</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-meta-gray-400">No results found.</td>
                </tr>
              )}
              {/* Map searchResults here */}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default TalentSearch; 