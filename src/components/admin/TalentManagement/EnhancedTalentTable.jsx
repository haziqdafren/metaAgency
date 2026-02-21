import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, MessageCircle, Edit, Trash2, Copy, X } from 'lucide-react';
import EnhancedDataTable from '../EnhancedDataTable';
import { columnHelpers } from '../DataTableHelpers';
import Button from '../../common/Button';
import Notification from '../../common/Notification';
import ConfirmModal from '../../common/ConfirmModal';
import { supabase } from '../../../lib/supabase';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { useConfirm } from '../../../hooks/useConfirm';

const EnhancedTalentTable = ({
  data = [],
  loading = false,
  onTalentClick = null,
  onBulkAction = null,
  onRefresh = null,
  onSelectTalent = null,
  selectedTalent = null
}) => {
  const { withDemoCheck } = useDemoMode();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  // Modal and notification state
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [currentTalent, setCurrentTalent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Search/filter state
  const [filterUsername, setFilterUsername] = useState('');
  const [filterFollowersMin, setFilterFollowersMin] = useState('');
  const [filterFollowersMax, setFilterFollowersMax] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGames, setFilterGames] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Enhanced data with computed fields
  const enhancedTalents = useMemo(() =>
    data.map(talent => ({
      ...talent,
      totalPerformanceScore: (talent.latestDiamonds || 0) + (talent.latestValidDays || 0) * 100,
      hasContact: !!(talent.nomor_wa || talent.link_tiktok),
      performanceLevel: talent.latestDiamonds > 1000 ? 'high' : talent.latestDiamonds > 500 ? 'medium' : 'low'
    })),
    [data]
  );

  // Filtered data based on all fields
  const filteredTalents = useMemo(() => {
    return enhancedTalents.filter(talent => {
      if (filterUsername && !talent.username_tiktok?.toLowerCase().includes(filterUsername.toLowerCase())) return false;
      if (filterFollowersMin && Number(talent.followers_count) < Number(filterFollowersMin)) return false;
      if (filterFollowersMax && Number(talent.followers_count) > Number(filterFollowersMax)) return false;
      if (filterCategory && String(talent.konten_kategori) !== filterCategory) return false;
      if (filterGames && !String(talent.game_preference || '').toLowerCase().includes(filterGames.toLowerCase())) return false;
      if (filterStatus && String(talent.status) !== filterStatus) return false;
      return true;
    });
  }, [enhancedTalents, filterUsername, filterFollowersMin, filterFollowersMax, filterCategory, filterGames, filterStatus]);

  // Action handlers
  const handleEdit = (talent) => {
    setCurrentTalent(talent);
    setEditForm({
      username_tiktok: talent.username_tiktok || '',
      followers_count: talent.followers_count || 0,
      konten_kategori: talent.konten_kategori || '',
      game_preference: talent.game_preference || '',
      status: talent.status || ''
    });
    setShowEditModal(true);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async () => {
    setEditLoading(true);
    const { username_tiktok, followers_count, konten_kategori, game_preference, status } = editForm;
    const { error } = await supabase
      .from('creators')
      .update({ username_tiktok, followers_count: Number(followers_count), konten_kategori, game_preference, status })
      .eq('id', currentTalent.id);
    if (!error) {
      setNotification({ message: 'Talent updated.', type: 'success', isVisible: true });
      setShowEditModal(false);
      if (onRefresh) onRefresh();
    } else {
      setNotification({ message: 'Failed to update talent.', type: 'error', isVisible: true });
    }
    setEditLoading(false);
  };
  const handleDelete = async (talent) => {
    // Show modern confirmation modal
    const confirmed = await confirm({
      title: 'Delete Talent',
      message: `Are you sure you want to delete "@${talent.username_tiktok}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    // Use withDemoCheck to prevent actual deletion in demo mode
    const performDelete = withDemoCheck(async () => {
      setDeleteLoadingId(talent.id);
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', talent.id);
      if (!error) {
        setNotification({ message: 'Talent deleted.', type: 'success', isVisible: true });
        if (onRefresh) onRefresh();
      } else {
        setNotification({ message: 'Failed to delete talent.', type: 'error', isVisible: true });
      }
      setDeleteLoadingId(null);
    });

    await performDelete();
  };
  const handleCopyInfo = (talent) => {
    const info = `@${talent.username_tiktok}\nFollowers: ${talent.followers_count}\nCategory: ${talent.konten_kategori}\nGames: ${talent.game_preference}\nStatus: ${talent.status}`;
    navigator.clipboard.writeText(info);
    setNotification({ message: 'Talent info copied to clipboard.', type: 'success', isVisible: true });
  };

  // Add custom actions to each row
  const talentsWithActions = useMemo(() =>
    filteredTalents.map(talent => ({
      ...talent,
      actions: [
        {
          icon: <Edit className="w-4 h-4" />,
          title: 'Edit Talent',
          variant: 'ghost',
          onClick: () => handleEdit(talent)
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          title: 'Delete Talent',
          variant: 'ghost',
          onClick: () => handleDelete(talent),
          loading: deleteLoadingId === talent.id
        },
        {
          icon: <Copy className="w-4 h-4" />,
          title: 'Copy Info',
          variant: 'ghost',
          onClick: () => handleCopyInfo(talent)
        }
      ]
    })),
    [filteredTalents, deleteLoadingId]
  );

  // Render actions cell for each row
  const renderActions = (row) => (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" title="Edit Talent" onClick={e => { e.stopPropagation(); handleEdit(row); }}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" title="Delete Talent" onClick={e => { e.stopPropagation(); handleDelete(row); }} disabled={deleteLoadingId === row.id}>
        {deleteLoadingId === row.id ? <span className="loader w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
      </Button>
      <Button size="sm" variant="ghost" title="Copy Info" onClick={e => { e.stopPropagation(); handleCopyInfo(row); }}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  // Render filter UI
  const renderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <input className="form-input" placeholder="Filter by Username" value={filterUsername} onChange={e => setFilterUsername(e.target.value)} />
      <input className="form-input" placeholder="Min Followers" type="number" value={filterFollowersMin} onChange={e => setFilterFollowersMin(e.target.value)} />
      <input className="form-input" placeholder="Max Followers" type="number" value={filterFollowersMax} onChange={e => setFilterFollowersMax(e.target.value)} />
      <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="gaming">Gaming</option>
        <option value="entertainment">Entertainment</option>
        <option value="lifestyle">Lifestyle</option>
        <option value="education">Education</option>
        <option value="music">Music</option>
        <option value="other">Other</option>
      </select>
      <input className="form-input" placeholder="Filter by Games" value={filterGames} onChange={e => setFilterGames(e.target.value)} />
      <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="needs_tiktok_id">Needs TikTok ID</option>
      </select>
    </div>
  );

  // Edit modal
  const renderEditModal = () => showEditModal && editForm && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 p-1" onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold mb-4">Edit Talent</h3>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Username</label>
          <input className="form-input w-full" name="username_tiktok" value={editForm.username_tiktok} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Followers</label>
          <input className="form-input w-full" name="followers_count" type="number" value={editForm.followers_count} onChange={handleEditFormChange} />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Category</label>
          <select className="form-select w-full" name="konten_kategori" value={editForm.konten_kategori} onChange={handleEditFormChange}>
            <option value="">Select Category</option>
            <option value="gaming">Gaming</option>
            <option value="entertainment">Entertainment</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="education">Education</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Games</label>
          <input className="form-input w-full" name="game_preference" value={editForm.game_preference} onChange={handleEditFormChange} />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1">Status</label>
          <select className="form-select w-full" name="status" value={editForm.status} onChange={handleEditFormChange}>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="needs_tiktok_id">Needs TikTok ID</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleEditSave} loading={editLoading}>Save</Button>
        </div>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Edit className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No talents found</h3>
      <p className="text-gray-500 mb-6">Get started by importing talent data or adjusting your filters.</p>
      <Button variant="primary" onClick={() => onRefresh && onRefresh()}>
        Refresh Data
      </Button>
    </div>
  );

  return (
    <div className="relative">
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        loading={confirmState.loading}
      />
      {renderFilters()}
      {renderEditModal()}
      <EnhancedDataTable
        title="Talent Management"
        subtitle={`Managing ${filteredTalents.length} creators`}
        data={talentsWithActions}
        columns={[
          ...[
    {
      key: 'username_tiktok',
      title: 'Username',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <a
            href={row.link_tiktok || `https://www.tiktok.com/@${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta-primary hover:text-meta-primary-dark font-medium flex items-center gap-1"
                    onClick={e => e.stopPropagation()}
          >
            @{value}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )
    },
    columnHelpers.numberColumn('followers_count', 'Followers', {
              render: value => <span className="font-medium">{value ? value.toLocaleString('id-ID') : '0'}</span>
    }),
    columnHelpers.statusColumn('konten_kategori', 'Category', {
      gaming: { label: 'Gaming', className: 'bg-purple-100 text-purple-800' },
      entertainment: { label: 'Entertainment', className: 'bg-pink-100 text-pink-800' },
      lifestyle: { label: 'Lifestyle', className: 'bg-green-100 text-green-800' },
      education: { label: 'Education', className: 'bg-blue-100 text-blue-800' },
      music: { label: 'Music', className: 'bg-yellow-100 text-yellow-800' },
      other: { label: 'Other', className: 'bg-gray-100 text-gray-800' }
    }),
    {
      key: 'game_preference',
      title: 'Games',
      sortable: true,
      filterable: true,
              render: value => <span className="text-sm text-gray-600">{value || 'N/A'}</span>
    },
    columnHelpers.statusColumn('status', 'Status', {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      needs_tiktok_id: { label: 'Needs TikTok ID', className: 'bg-orange-100 text-orange-800' }
    }),
    {
      key: 'performance',
      title: 'Recent Performance',
      sortable: false,
      filterable: false,
      render: (value, row) => {
        if (!row.latestDiamonds && !row.latestValidDays) {
          return <span className="text-gray-400 text-sm">No data</span>;
        }
        return (
          <div className="text-xs space-y-1">
            {row.latestDiamonds > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-meta-primary">💎</span>
                <span className="font-medium">{row.latestDiamonds.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <span>📅 {row.latestValidDays || 0}d</span>
              <span>⏱️ {row.latestLiveHours || 0}h</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'contact',
      title: 'Contact',
      sortable: false,
      filterable: false,
      render: (value, row) => (
        <div className="flex items-center gap-1">
          {row.nomor_wa && (
            <a
              href={`https://wa.me/${row.nomor_wa.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                      onClick={e => e.stopPropagation()}
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          {row.link_tiktok && (
            <a
              href={row.link_tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-meta-primary hover:text-meta-primary-dark p-1 rounded hover:bg-blue-50"
                      onClick={e => e.stopPropagation()}
              title="View TikTok Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )
            }
          ]
        ]}
        searchConfig={{ searchableColumns: ['username_tiktok', 'creator_id'], placeholder: 'Search by username or creator ID...' }}
        bulkActions={[]}
        exportOptions={['excel', 'csv']}
        onRowClick={onTalentClick}
      selectable={true}
      sortable={true}
      filterable={true}
      loading={loading}
      emptyState={<EmptyState />}
        pagination={{ pageSize: 15, showSizeSelector: true }}
      mobileOptimized={true}
      compact={false}
        renderActions={renderActions}
    />
    </div>
  );
};

export default EnhancedTalentTable;