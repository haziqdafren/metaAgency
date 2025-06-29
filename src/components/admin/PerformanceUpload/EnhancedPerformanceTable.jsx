import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Copy, X } from 'lucide-react';
import EnhancedDataTable from '../EnhancedDataTable';
import Button from '../../common/Button';
import Notification from '../../common/Notification';

const EnhancedPerformanceTable = ({
  data = [],
  loading = false,
  onRefresh = null,
  onBulkAction = null
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [currentRow, setCurrentRow] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Filters
  const [filterSearch, setFilterSearch] = useState('');

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filterSearch && !row.username?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      return true;
    });
  }, [data, filterSearch]);

  // Actions
  const handleEdit = (row) => {
    setCurrentRow(row);
    setEditForm({ ...row });
    setShowEditModal(true);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async () => {
    setEditLoading(true);
    // TODO: Save logic (API call)
    setTimeout(() => {
      setNotification({ message: 'Performance updated.', type: 'success', isVisible: true });
      setShowEditModal(false);
      setEditLoading(false);
      if (onRefresh) onRefresh();
    }, 1000);
  };
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete performance for @${row.username}? This cannot be undone.`)) return;
    setDeleteLoadingId(row.creatorId);
    // TODO: Delete logic (API call)
    setTimeout(() => {
      setNotification({ message: 'Performance deleted.', type: 'success', isVisible: true });
      setDeleteLoadingId(null);
      if (onRefresh) onRefresh();
    }, 1000);
  };
  const handleCopyInfo = (row) => {
    const info = `@${row.username}\nDays: ${row.validDays}\nHours: ${row.liveHours}\nCoins: ${row.diamonds}`;
    navigator.clipboard.writeText(info);
    setNotification({ message: 'Performance info copied.', type: 'success', isVisible: true });
  };

  // Columns
  const columns = [
    { key: 'username', title: 'Username', sortable: true },
    { key: 'validDays', title: 'Days', sortable: true },
    { key: 'liveHours', title: 'Hours', sortable: true },
    { key: 'diamonds', title: 'Coins', sortable: true },
    { key: 'grade', title: 'Grade', sortable: true },
    { key: 'breakdown', title: 'Breakdown', sortable: false },
    { key: 'paymentStatus', title: 'Status', sortable: true },
  ];

  // Render actions
  const renderActions = (row) => (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(row); }}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(row); }} disabled={deleteLoadingId === row.creatorId}>
        {deleteLoadingId === row.creatorId ? <span className="loader w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
      </Button>
      <Button size="sm" variant="ghost" title="Copy Info" onClick={e => { e.stopPropagation(); handleCopyInfo(row); }}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  // Edit modal
  const renderEditModal = () => showEditModal && editForm && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 p-1" onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold mb-4">Edit Performance</h3>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Username</label>
          <input className="form-input w-full" name="username" value={editForm.username} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Days</label>
          <input className="form-input w-full" name="validDays" type="number" value={editForm.validDays} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Hours</label>
          <input className="form-input w-full" name="liveHours" type="number" value={editForm.liveHours} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Coins</label>
          <input className="form-input w-full" name="diamonds" type="number" value={editForm.diamonds} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Grade</label>
          <input className="form-input w-full" name="grade" value={editForm.grade} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Breakdown</label>
          <input className="form-input w-full" name="breakdown" value={editForm.breakdown} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Status</label>
          <input className="form-input w-full" name="paymentStatus" value={editForm.paymentStatus} onChange={handleEditFormChange} />
        </div>
        <Button className="mt-2 w-full" loading={editLoading} onClick={handleEditSave}>Save</Button>
      </div>
    </div>
  );

  // Notification
  const renderNotification = () => notification.isVisible && (
    <Notification type={notification.type} onClose={() => setNotification({ ...notification, isVisible: false })}>
      {notification.message}
    </Notification>
  );

  // Filters UI
  const renderFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <input className="form-input" placeholder="Search username..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
    </div>
  );

  return (
    <div className="relative">
      {renderNotification()}
      {renderEditModal()}
      {renderFilters()}
      <EnhancedDataTable
        data={filteredData}
        columns={columns}
        loading={loading}
        renderActions={renderActions}
        title="Performance Data"
        searchConfig={{ searchableColumns: ['username'], placeholder: 'Search username...' }}
        pagination={{ pageSize: 10, showSizeSelector: true }}
        selectable={true}
        sortable={true}
        filterable={true}
        exportOptions={['excel', 'csv']}
        bulkActions={[]}
      />
    </div>
  );
};

export default EnhancedPerformanceTable; 