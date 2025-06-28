import React, { useState } from 'react';
import Button from '../../common/Button';

const TalentsTable = ({ 
  talents, 
  filteredTalents, 
  currentPage, 
  setCurrentPage, 
  pageSize, 
  totalPages, 
  paginatedTalents,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  onExportResults,
  onGenerateEndorsementList,
  onSelectTalent,
  selectedTalent
}) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');

  const handleSearch = () => {
    const filtered = talents.filter(talent => {
      const matchesSearch = !searchTerm || 
        talent.username_tiktok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.creator_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || talent.status === filters.status;
      const matchesCategory = !filters.category || talent.konten_kategori === filters.category;
      const matchesFollowers = talent.followers_count >= filters.followersMin && 
                              talent.followers_count <= filters.followersMax;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesFollowers;
    });
    
    // Update filtered talents in parent component
    // This would need to be passed as a prop or callback
  };

  const saveSearch = () => {
    if (!searchName.trim()) return;
    const newSearch = {
      name: searchName,
      filters: { ...filters },
      searchTerm,
      timestamp: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, newSearch]);
    setSearchName('');
  };

  const loadSavedSearch = (search) => {
    setFilters(search.filters);
    setSearchTerm(search.searchTerm);
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
        <div>
          <span className="font-semibold">{filteredTalents.length}</span> talents found
          {searchTerm && <span className="text-gray-600 ml-2">for "{searchTerm}"</span>}
        </div>
        <div className="flex gap-2">
          <Button onClick={onExportResults} variant="primary" disabled={filteredTalents.length === 0}>
            Export Results
          </Button>
          <Button onClick={onGenerateEndorsementList} variant="secondary" disabled={filteredTalents.length === 0}>
            Generate Endorsement List
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username or creator ID..."
            className="p-2 border rounded-lg bg-gray-50 text-meta-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select 
            value={filters.status} 
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select 
            value={filters.category} 
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black"
          >
            <option value="">All</option>
            <option value="gaming">Gaming</option>
            <option value="entertainment">Entertainment</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="education">Education</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Followers Min</label>
          <input 
            type="number" 
            value={filters.followersMin} 
            onChange={e => setFilters(f => ({ ...f, followersMin: parseInt(e.target.value) || 0 }))} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Followers Max</label>
          <input 
            type="number" 
            value={filters.followersMax} 
            onChange={e => setFilters(f => ({ ...f, followersMax: parseInt(e.target.value) || 5000000 }))} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black" 
          />
        </div>
        <Button onClick={handleSearch} variant="primary">Search</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Followers</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Games</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recent Performance</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTalents.map((talent) => (
              <tr key={talent.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => onSelectTalent(talent)}>
                <td className="px-4 py-2 text-sm font-medium">
                  <a 
                    href={talent.link_tiktok || `https://www.tiktok.com/@${talent.username_tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{talent.username_tiktok}
                  </a>
                </td>
                <td className="px-4 py-2 text-sm">{talent.followers_count?.toLocaleString('id-ID') || 0}</td>
                <td className="px-4 py-2 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{talent.konten_kategori || 'N/A'}</span>
                </td>
                <td className="px-4 py-2 text-sm">{talent.game_preference || 'N/A'}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${talent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {talent.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {talent.latestDiamonds > 0 && (
                    <div className="text-xs">
                      💎 {talent.latestDiamonds.toLocaleString('id-ID')}<br />
                      📅 {talent.latestValidDays}d | ⏱️ {talent.latestLiveHours}h
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-sm">
                  {talent.nomor_wa && (
                    <a 
                      href={`https://wa.me/${talent.nomor_wa.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      WhatsApp
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedTalent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h4 className="font-bold mb-2">Talent Profile: @{selectedTalent.username_tiktok}</h4>
            <div className="mb-2 text-xs text-gray-500">Creator ID: {selectedTalent.creator_id}</div>
            <div className="mb-4 text-xs text-gray-500">Joined: {selectedTalent.joined_date || '-'}</div>
            <div className="mb-4">
              <h5 className="font-semibold mb-1">Profile</h5>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(selectedTalent, null, 2)}
              </pre>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => onSelectTalent(null)} 
                className="px-3 py-1 rounded bg-gray-200 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentsTable; 