import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Eye, Download, Search, X } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Registrations = () => {
  const { theme } = useThemeStore();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending'); // default to pending
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [filterStatus, searchQuery, sortConfig]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('registrations').select('*');

    // Temporarily commenting out filter to debug
    // if (filterStatus) {
    //   query = query.eq('status', filterStatus);
    // }

    console.log('Fetching registrations with filterStatus:', filterStatus, 'and searchQuery:', searchQuery);

    if (searchQuery) {
      query = query.ilike('nama', `%${searchQuery}%`);
    }

    if (sortConfig.key) {
      query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'ascending' });
    }

    const { data, error } = await query;

    console.log('Registrations Query Result:', { data, error });

    if (error) {
      console.error('Error fetching registrations:', error);
      setError(error.message);
    } else {
      setRegistrations(data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating registration status:', error);
      setError(error.message);
    } else {
      fetchRegistrations(); // Re-fetch to update the list
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
    }
    return '';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = registrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(registrations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const confirmExport = () => {
    // Dummy export logic
    alert('Exporting registrations to Excel!');
    setIsExportModalOpen(false);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRegistration(null);
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

  return (
    <motion.div
      className={`p-6 flex-1 overflow-y-auto transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-3xl font-bold mb-6">Registrations Management</h1>

      {/* Filters and Search */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex-1 flex items-center space-x-2">
          <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-600'}`} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-gray-100 text-meta-black placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`p-2 rounded-md ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-gray-100 text-meta-black'} focus:outline-none focus:ring-2 focus:ring-meta-blue`}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-meta-blue">Loading registrations...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}

      {!loading && !error && ( 
        <div className={`overflow-x-auto rounded-lg shadow ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
          <table className="min-w-full divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-meta-gray-800' : 'bg-gray-100'}`}>
              <tr>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                  onClick={() => requestSort('nama')}
                >
                  Applicant Name{getSortIndicator('nama')}
                </th>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                >
                  TikTok Username
                </th>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                >
                  Email
                </th>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                >
                  Phone
                </th>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                >
                  Status
                </th>
                <th 
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meta-gray-200 dark:divide-meta-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((reg) => (
                  <motion.tr 
                    key={reg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: reg.id * 0.05 }}
                    className={`${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                      {reg.nama}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {reg.username_tiktok || 'N/A'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {reg.email}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                      {reg.nomor_wa}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reg.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {reg.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(reg.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(reg.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleViewDetails(reg)}
                          className="text-meta-blue hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-gray-500'}`}>No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
              <p className="mb-6">Are you sure you want to export all registration data to Excel?</p>
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

        {isDetailsModalOpen && selectedRegistration && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`relative w-full max-w-lg mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-white text-meta-black'}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={closeDetailsModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Registration Details</h2>
              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {selectedRegistration.nama}</p>
                <p><strong>Email:</strong> {selectedRegistration.email}</p>
                <p><strong>Phone:</strong> {selectedRegistration.nomor_wa}</p>
                <p><strong>TikTok Username:</strong> {selectedRegistration.username_tiktok || 'N/A'}</p>
                <p><strong>Instagram Username:</strong> {selectedRegistration.username_instagram || 'N/A'}</p>
                <p><strong>Discord ID:</strong> {selectedRegistration.discord_id || 'N/A'}</p>
                <p><strong>Region:</strong> {selectedRegistration.region || 'N/A'}</p>
                <p><strong>Game Preference:</strong> {selectedRegistration.game_preference && selectedRegistration.game_preference.length > 0 ? selectedRegistration.game_preference.join(', ') : 'N/A'}</p>
                <p><strong>Content Category:</strong> {selectedRegistration.konten_kategori || 'N/A'}</p>
                <p><strong>Experience:</strong> {selectedRegistration.experience || 'N/A'}</p>
                <p><strong>Motivation:</strong> {selectedRegistration.motivation || 'N/A'}</p>
                <p><strong>Referral:</strong> {selectedRegistration.referral || 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedRegistration.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    selectedRegistration.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {selectedRegistration.status}
                  </span>
                </p>
                <p><strong>Registered At:</strong> {new Date(selectedRegistration.created_at).toLocaleString()}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Registrations; 