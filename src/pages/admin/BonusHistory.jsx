import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const pageSize = 10;

const BonusHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // Edit state
  const [editingRows, setEditingRows] = useState(new Set());
  const [editingData, setEditingData] = useState({});
  const [savingRows, setSavingRows] = useState(new Set());

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('bonus_calculations')
          .select('*, creator:creators(username_tiktok, creator_id)')
          .order('created_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        setError('Failed to fetch history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, filterMonth, filterYear, filterWeek]);

  // Edit functions
  const startEditing = (row) => {
    setEditingRows(prev => new Set([...prev, row.id]));
    setEditingData(prev => ({
      ...prev,
      [row.id]: {
        payment_status: row.payment_status,
        bonus_amount_idr: row.bonus_amount_idr,
        notes: row.notes || '',
        tier: row.tier
      }
    }));
  };

  const cancelEditing = (rowId) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowId);
      return newSet;
    });
    setEditingData(prev => {
      const newData = { ...prev };
      delete newData[rowId];
      return newData;
    });
  };

  const updateEditingData = (rowId, field, value) => {
    setEditingData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const saveChanges = async (rowId) => {
    const editData = editingData[rowId];
    if (!editData) return;

    setSavingRows(prev => new Set([...prev, rowId]));

    try {
      const { error } = await supabase
        .from('bonus_calculations')
        .update({
          payment_status: editData.payment_status,
          bonus_amount_idr: parseInt(editData.bonus_amount_idr) || 0,
          notes: editData.notes,
          tier: editData.tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', rowId);

      if (error) throw error;

      // Update local state optimistically
      setHistory(prev => prev.map(item => 
        item.id === rowId 
          ? {
              ...item,
              payment_status: editData.payment_status,
              bonus_amount_idr: parseInt(editData.bonus_amount_idr) || 0,
              notes: editData.notes,
              tier: editData.tier
            }
          : item
      ));

      // Exit edit mode
      cancelEditing(rowId);

    } catch (error) {
      console.error('Error saving changes:', error);
      setError('Failed to save changes: ' + error.message);
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
    }
  };

  // Helper function to get week number from date
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Get unique months, years, and weeks for filters
  const uniqueMonths = Array.from(new Set(history.map(h => h.month))).filter(Boolean).sort((a, b) => a - b);
  const uniqueYears = Array.from(new Set(history.map(h => h.year))).filter(Boolean).sort((a, b) => a - b);
  const uniqueWeeks = Array.from(new Set(history.map(h => getWeekNumber(h.created_at)))).filter(Boolean).sort((a, b) => a - b);

  const filtered = history.filter(row => {
    const search = filterSearch.toLowerCase();
    const rowWeek = getWeekNumber(row.created_at);
    
    // Search filter
    const matchesSearch = !search || (
      row.creator?.username_tiktok?.toLowerCase().includes(search) ||
      String(row.month).includes(search) ||
      String(row.year).includes(search) ||
      row.tier?.toLowerCase().includes(search)
    );
    
    // Month filter
    const matchesMonth = !filterMonth || String(row.month) === String(filterMonth);
    
    // Year filter
    const matchesYear = !filterYear || String(row.year) === String(filterYear);
    
    // Week filter
    const matchesWeek = !filterWeek || String(rowWeek) === String(filterWeek);
    
    return matchesSearch && matchesMonth && matchesYear && matchesWeek;
  });

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Bonus History</h3>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by creator, grade, etc..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Months</option>
                {uniqueMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
              <select
                value={filterWeek}
                onChange={e => setFilterWeek(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Weeks</option>
                {uniqueWeeks.map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {(filterSearch || filterMonth || filterYear || filterWeek) && (
              <Button
                onClick={() => {
                  setFilterSearch('');
                  setFilterMonth('');
                  setFilterYear('');
                  setFilterWeek('');
                  setCurrentPage(1);
                }}
                variant="secondary"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filtered.length} of {history.length} bonus calculations
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-meta-blue/10">
              <tr>
                <th className="px-4 py-2">Creator</th>
                <th className="px-4 py-2">Month/Year</th>
                <th className="px-4 py-2">Week</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Bonus</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><Loading size="md" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-meta-gray-500">No bonus calculations found with current filters.</td></tr>
              ) : (
                filtered
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((row, idx) => {
                    const weekNumber = getWeekNumber(row.created_at);
                    const statusColors = {
                      'pending': 'bg-yellow-100 text-yellow-800',
                      'paid': 'bg-green-100 text-green-800',
                      'failed': 'bg-red-100 text-red-800'
                    };
                    
                    return (
                      <tr key={row.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2">
                          <div className="font-medium">{row.creator?.username_tiktok || '-'}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-sm">
                            {new Date(row.year, row.month - 1).toLocaleDateString('id-ID', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Week {weekNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {editingRows.has(row.id) ? (
                            <select
                              value={editingData[row.id]?.tier || row.tier}
                              onChange={(e) => updateEditingData(row.id, 'tier', e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="A">Grade A</option>
                              <option value="B">Grade B</option>
                              <option value="C">Grade C</option>
                              <option value="D">Grade D</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              row.tier === 'A' ? 'bg-purple-100 text-purple-800' :
                              row.tier === 'B' ? 'bg-blue-100 text-blue-800' :
                              row.tier === 'C' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              Grade {row.tier}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRows.has(row.id) ? (
                            <input
                              type="number"
                              value={editingData[row.id]?.bonus_amount_idr || row.bonus_amount_idr || 0}
                              onChange={(e) => updateEditingData(row.id, 'bonus_amount_idr', e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded"
                              placeholder="Bonus amount"
                            />
                          ) : (
                            <div className="font-medium">
                              Rp {row.bonus_amount_idr?.toLocaleString('id-ID') || '-'}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRows.has(row.id) ? (
                            <select
                              value={editingData[row.id]?.payment_status || row.payment_status}
                              onChange={(e) => updateEditingData(row.id, 'payment_status', e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[row.payment_status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {row.payment_status || 'unknown'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRows.has(row.id) ? (
                            <input
                              type="text"
                              value={editingData[row.id]?.notes || row.notes || ''}
                              onChange={(e) => updateEditingData(row.id, 'notes', e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded"
                              placeholder="Add notes..."
                            />
                          ) : (
                            <div className="text-sm text-gray-600 max-w-32 truncate" title={row.notes}>
                              {row.notes || '-'}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-sm text-gray-600">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {editingRows.has(row.id) ? (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => saveChanges(row.id)}
                                loading={savingRows.has(row.id)}
                                disabled={savingRows.has(row.id)}
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => cancelEditing(row.id)}
                                disabled={savingRows.has(row.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Button size="sm" variant="secondary" onClick={() => setSelectedHistory(row)}>
                                Details
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => startEditing(row)}>
                                Edit
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="px-2">Page {currentPage}</span>
          <Button size="sm" disabled={filtered.length <= currentPage * pageSize} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
        <AnimatePresence>
          {selectedHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setSelectedHistory(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Bonus Calculation Details</h3>
                <div className="space-y-2">
                  <div><b>Creator:</b> {selectedHistory.creator?.username_tiktok || '-'}</div>
                  <div><b>Month/Year:</b> {selectedHistory.month}/{selectedHistory.year}</div>
                  <div><b>Grade:</b> {selectedHistory.tier}</div>
                  <div><b>Bonus:</b> Rp {selectedHistory.bonus_amount_idr?.toLocaleString('id-ID') || '-'}</div>
                  <div><b>Status:</b> {selectedHistory.payment_status}</div>
                  <div><b>Exchange Rate:</b> {selectedHistory.exchange_rate}</div>
                  <div><b>Calculation Date:</b> {selectedHistory.created_at ? new Date(selectedHistory.created_at).toLocaleString('id-ID') : '-'}</div>
                  <div><b>Notes:</b> {selectedHistory.notes || '-'}</div>
                </div>
                <Button className="mt-6 w-full" onClick={() => setSelectedHistory(null)}>Close</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default BonusHistory; 