import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Eye, Trash2, Filter } from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import LoadingSpinner from '../../common/LoadingSpinner';
import CompactCard from '../CompactCard';
import CompactTable from '../CompactTable';
import { supabase } from '../../../lib/supabase';

const UploadHistoryTab = () => {
  const [periodUploads, setPeriodUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search/filter state
  const [search, setSearch] = useState('');
  const [filterPeriodType, setFilterPeriodType] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchGroupedUploads();
  }, []);

  const fetchGroupedUploads = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('creator_performance')
        .select('period_identifier, period_type, period_duration_days, period_start_date, period_end_date, period_year, period_month, created_at, diamonds, valid_days, live_hours, new_followers, raw_data')
        .not('period_identifier', 'is', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // Group by period_identifier (NEW SYSTEM)
      const grouped = {};
      data.forEach(row => {
        const periodId = row.period_identifier;
        
        if (!grouped[periodId]) {
          grouped[periodId] = {
            period_identifier: row.period_identifier,
            period_type: row.period_type,
            period_duration_days: row.period_duration_days,
            period_start_date: row.period_start_date,
            period_end_date: row.period_end_date,
            period_year: row.period_year,
            period_month: row.period_month,
            created_at: row.created_at,
            count: 1,
            rows: [row],
          };
        } else {
          grouped[periodId].count += 1;
          grouped[periodId].rows.push(row);
          if (row.created_at > grouped[periodId].created_at) {
            grouped[periodId].created_at = row.created_at;
          }
        }
      });

      const groupedArr = Object.values(grouped).sort((a, b) => 
        b.created_at.localeCompare(a.created_at)
      );
      
      setPeriodUploads(groupedArr);
    } catch (err) {
      setError('Failed to fetch upload history');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get unique values for filter dropdowns
  const uniquePeriodTypes = Array.from(new Set(periodUploads.map(u => u.period_type)))
    .filter(Boolean)
    .sort();
  const uniqueDurations = Array.from(new Set(periodUploads.map(u => u.period_duration_days)))
    .filter(Boolean)
    .sort((a, b) => a - b);
  const uniqueYears = Array.from(new Set(periodUploads.map(u => u.period_year)))
    .filter(Boolean)
    .sort((a, b) => a - b);

  // Search and filter logic - UPDATED FOR NEW SYSTEM
  const filteredUploads = periodUploads.filter(upload => {
    if (filterPeriodType && upload.period_type !== filterPeriodType) return false;
    if (filterDuration && String(upload.period_duration_days) !== String(filterDuration)) return false;
    if (filterYear && String(upload.period_year) !== String(filterYear)) return false;
    
    if (search) {
      const s = search.toLowerCase();
      return (
        (upload.period_identifier && upload.period_identifier.toLowerCase().includes(s)) ||
        (upload.period_start_date && upload.period_start_date.toLowerCase().includes(s)) ||
        (upload.period_end_date && upload.period_end_date.toLowerCase().includes(s)) ||
        (upload.period_type && upload.period_type.toLowerCase().includes(s)) ||
        String(upload.period_duration_days).includes(s) ||
        String(upload.period_year).includes(s) ||
        upload.rows.some(row => (row.raw_data?.username_tiktok || '').toLowerCase().includes(s))
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUploads.length / PAGE_SIZE) || 1;
  const paginatedUploads = filteredUploads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, filterPeriodType, filterDuration, filterYear]);

  const openModal = (upload) => {
    // Sort by diamonds descending
    const sortedRows = [...upload.rows].sort((a, b) => (b.diamonds || 0) - (a.diamonds || 0));
    setModalData({ ...upload, rows: sortedRows });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const handleDelete = (upload) => {
    setDeleteTarget(upload);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    
    try {
      const { period_identifier } = deleteTarget;
      
      const { error } = await supabase
        .from('creator_performance')
        .delete()
        .eq('period_identifier', period_identifier);
        
      if (error) throw error;
      
      await fetchGroupedUploads();
      closeModal();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete records');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const stats = {
    totalUploads: periodUploads.length,
    totalCreators: periodUploads.reduce((sum, upload) => sum + upload.count, 0),
    latestPeriod: periodUploads.length > 0 
      ? (periodUploads[0].period_start_date && periodUploads[0].period_end_date 
          ? `${periodUploads[0].period_start_date} ~ ${periodUploads[0].period_end_date}`
          : periodUploads[0].period_identifier)
      : 'None',
    avgCreatorsPerUpload: periodUploads.length > 0 
      ? Math.round(periodUploads.reduce((sum, upload) => sum + upload.count, 0) / periodUploads.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.totalUploads}</div>
          <div className="text-sm text-blue-600">Total Uploads</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.totalCreators}</div>
          <div className="text-sm text-green-600">Total Records</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-lg font-bold text-purple-700">{stats.latestPeriod}</div>
          <div className="text-sm text-purple-600">Latest Period</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.avgCreatorsPerUpload}</div>
          <div className="text-sm text-orange-600">Avg per Upload</div>
        </div>
      </div>

      {/* Search and Filters */}
      <CompactCard title="Upload History" compact>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by period, month, year, or username..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterPeriodType} onChange={e => setFilterPeriodType(e.target.value)}>
                <option value="">All Types</option>
                {uniquePeriodTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
              <Select value={filterDuration} onChange={e => setFilterDuration(e.target.value)}>
                <option value="">All Durations</option>
                {uniqueDurations.map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </Select>
              <Select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="">All Years</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : (
            <>
              <CompactTable compact>
                <CompactTable.Head>
                  <CompactTable.Row>
                    <CompactTable.Header>Period Range</CompactTable.Header>
                    <CompactTable.Header>Type & Duration</CompactTable.Header>
                    <CompactTable.Header>Creators</CompactTable.Header>
                    <CompactTable.Header>Upload Date</CompactTable.Header>
                    <CompactTable.Header>Actions</CompactTable.Header>
                  </CompactTable.Row>
                </CompactTable.Head>
                <CompactTable.Body>
                  {paginatedUploads.length === 0 ? (
                    <CompactTable.Row>
                      <CompactTable.Cell colSpan={5} className="text-center py-8 text-gray-400">
                        No uploads found
                      </CompactTable.Cell>
                    </CompactTable.Row>
                  ) : (
                    paginatedUploads.map((upload, idx) => (
                      <CompactTable.Row key={upload.period_identifier}>
                        <CompactTable.Cell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {upload.period_start_date && upload.period_end_date 
                                ? `${upload.period_start_date} ~ ${upload.period_end_date}`
                                : upload.period_identifier
                              }
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {upload.period_identifier}
                            </div>
                          </div>
                        </CompactTable.Cell>
                        <CompactTable.Cell>
                          <div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              upload.period_type === 'weekly' ? 'bg-green-100 text-green-800' :
                              upload.period_type === 'bi-weekly' ? 'bg-blue-100 text-blue-800' :
                              upload.period_type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {upload.period_type || 'Unknown'}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {upload.period_duration_days} days
                            </div>
                          </div>
                        </CompactTable.Cell>
                        <CompactTable.Cell>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {upload.count}
                          </span>
                        </CompactTable.Cell>
                        <CompactTable.Cell>
                          {formatDate(upload.created_at)}
                        </CompactTable.Cell>
                        <CompactTable.Cell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => openModal(upload)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(upload)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              loading={deleteLoading && deleteTarget === upload}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CompactTable.Cell>
                      </CompactTable.Row>
                    ))
                  )}
                </CompactTable.Body>
              </CompactTable>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CompactCard>

      {/* View Details Modal */}
      <AnimatePresence>
        {modalOpen && modalData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 40 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 40 }} 
              className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Period: <span className="text-blue-600">
                      {modalData.period_start_date && modalData.period_end_date 
                        ? `${modalData.period_start_date} ~ ${modalData.period_end_date}`
                        : modalData.period_identifier
                      }
                    </span>
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                      modalData.period_type === 'weekly' ? 'bg-green-100 text-green-800' :
                      modalData.period_type === 'bi-weekly' ? 'bg-blue-100 text-blue-800' :
                      modalData.period_type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {modalData.period_type || 'Unknown'}
                    </span>
                    {modalData.period_duration_days} days • {modalData.count} creators
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <CompactTable compact>
                <CompactTable.Head>
                  <CompactTable.Row>
                    <CompactTable.Header>Rank</CompactTable.Header>
                    <CompactTable.Header>Username</CompactTable.Header>
                    <CompactTable.Header>Diamonds</CompactTable.Header>
                    <CompactTable.Header>Valid Days</CompactTable.Header>
                    <CompactTable.Header>Live Hours</CompactTable.Header>
                    <CompactTable.Header>New Followers</CompactTable.Header>
                  </CompactTable.Row>
                </CompactTable.Head>
                <CompactTable.Body>
                  {modalData.rows.map((row, idx) => (
                    <CompactTable.Row 
                      key={row.id}
                      className={idx < 3 ? 'bg-yellow-50' : ''}
                    >
                      <CompactTable.Cell>
                        <span className={`font-medium ${
                          idx === 0 ? 'text-yellow-600' : 
                          idx === 1 ? 'text-gray-600' : 
                          idx === 2 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          #{idx + 1}
                        </span>
                      </CompactTable.Cell>
                      <CompactTable.Cell className="font-medium">
                        @{row.raw_data?.username_tiktok || '-'}
                      </CompactTable.Cell>
                      <CompactTable.Cell>
                        {(row.diamonds || 0).toLocaleString('id-ID')}
                      </CompactTable.Cell>
                      <CompactTable.Cell>{row.valid_days || 0}</CompactTable.Cell>
                      <CompactTable.Cell>{row.live_hours || 0}</CompactTable.Cell>
                      <CompactTable.Cell>
                        {(row.new_followers || 0).toLocaleString('id-ID')}
                      </CompactTable.Cell>
                    </CompactTable.Row>
                  ))}
                </CompactTable.Body>
              </CompactTable>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 40 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 40 }} 
              className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold mb-4 text-red-600">Delete Confirmation</h3>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete all records for{' '}
                <span className="font-semibold text-blue-600">
                  {deleteTarget.period_start_date && deleteTarget.period_end_date 
                    ? `${deleteTarget.period_start_date} ~ ${deleteTarget.period_end_date}`
                    : deleteTarget.period_identifier
                  }
                </span>?{' '}
                This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <Button 
                  variant="secondary" 
                  onClick={cancelDelete} 
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmDelete} 
                  loading={deleteLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadHistoryTab;