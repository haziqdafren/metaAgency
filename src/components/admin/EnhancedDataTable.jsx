import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal,
  Check,
  X,
  Eye,
  Edit,
  Trash2,
  FileText,
  Grid3X3,
  List,
  Columns
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import CompactCard from './CompactCard';

const EnhancedDataTable = ({
  data = [],
  columns = [],
  title = "Data Table",
  subtitle = "",
  searchConfig = {},
  bulkActions = [],
  exportOptions = [],
  onRowClick = null,
  onRowSelect = null,
  selectable = false,
  sortable = true,
  filterable = true,
  pagination = { pageSize: 10, showSizeSelector: true },
  loading = false,
  emptyState = null,
  className = "",
  compact = false,
  mobileOptimized = true,
  renderActions = null,
  customActions = null,
  ...props
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid' | 'list'
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
  );

  // Computed values
  const visibleColumns = useMemo(() => 
    columns.filter(col => columnVisibility[col.key] !== false), 
    [columns, columnVisibility]
  );

  // Search and filter logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchConfig.searchableColumns) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchConfig.searchableColumns.some(key =>
          String(item[key] || '').toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          if (typeof value === 'object' && value.operator) {
            switch (value.operator) {
              case 'gte': return Number(itemValue) >= Number(value.value);
              case 'lte': return Number(itemValue) <= Number(value.value);
              case 'contains': return String(itemValue).toLowerCase().includes(String(value.value).toLowerCase());
              case 'equals': return itemValue === value.value;
              default: return true;
            }
          }
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, searchTerm, searchConfig.searchableColumns, activeFilters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Event handlers
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [sortable]);

  const handleRowSelect = useCallback((rowId, checked) => {
    if (!selectable) return;

    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });

    if (onRowSelect) {
      onRowSelect(rowId, checked);
    }
  }, [selectable, onRowSelect]);

  const handleSelectAll = useCallback((checked) => {
    if (!selectable) return;

    if (checked) {
      const allIds = new Set(paginatedData.map(row => row.id || row.key));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  }, [selectable, paginatedData]);

  const handleExport = useCallback(async (format) => {
    if (!exportOptions.includes(format)) return;

    try {
      if (format === 'excel' || format === 'csv') {
        const XLSX = await import('xlsx');
        
        // Prepare export data
        const exportData = (selectedRows.size > 0 
          ? sortedData.filter(row => selectedRows.has(row.id || row.key))
          : sortedData
        ).map(row => {
          const exportRow = {};
          visibleColumns.forEach(col => {
            exportRow[col.title || col.key] = col.exportValue 
              ? col.exportValue(row[col.key], row) 
              : row[col.key];
          });
          return exportRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
        
        const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        XLSX.writeFile(wb, fileName);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [exportOptions, selectedRows, sortedData, visibleColumns, title]);

  const handleBulkAction = useCallback((action) => {
    if (selectedRows.size === 0) return;
    
    const selectedData = sortedData.filter(row => selectedRows.has(row.id || row.key));
    action.handler(selectedData, Array.from(selectedRows));
  }, [selectedRows, sortedData]);

  // Listen for custom event to open filters from toolbarActions
  React.useEffect(() => {
    const openFiltersHandler = () => setShowFilters(true);
    window.addEventListener('openFilters', openFiltersHandler);
    return () => window.removeEventListener('openFilters', openFiltersHandler);
  }, []);

  // Render functions
  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {selectable && (
          <th className="px-3 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-meta-primary focus:ring-meta-primary"
            />
          </th>
        )}
        {visibleColumns.map((column) => (
          <th
            key={column.key}
            className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${
              compact ? 'px-2 py-2' : ''
            }`}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <div className="flex items-center gap-1">
              <span>{column.title || column.key}</span>
              {sortable && column.sortable !== false && (
                <div className="flex flex-col">
                  <ChevronUp 
                    className={`w-3 h-3 ${
                      sortConfig.key === column.key && sortConfig.direction === 'asc' 
                        ? 'text-meta-primary' 
                        : 'text-gray-300'
                    }`} 
                  />
                  <ChevronDown 
                    className={`w-3 h-3 -mt-1 ${
                      sortConfig.key === column.key && sortConfig.direction === 'desc' 
                        ? 'text-meta-primary' 
                        : 'text-gray-300'
                    }`} 
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  const renderTableRow = (row, index) => (
    <motion.tr
      key={row.id || row.key || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        ${selectedRows.has(row.id || row.key) ? 'bg-blue-50' : 'bg-white'}
        hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100
      `}
      onClick={() => onRowClick && onRowClick(row)}
    >
      {selectable && (
        <td className="px-3 py-3">
          <input
            type="checkbox"
            checked={selectedRows.has(row.id || row.key)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(row.id || row.key, e.target.checked);
            }}
            className="rounded border-gray-300 text-meta-primary focus:ring-meta-primary"
          />
        </td>
      )}
      {visibleColumns.map((column) => (
        <td 
          key={column.key} 
          className={`px-3 py-3 text-sm ${compact ? 'px-2 py-2' : ''}`}
        >
          {column.render 
            ? column.render(row[column.key], row, index)
            : (row[column.key] || '-')
          }
        </td>
      ))}
      <td className="px-3 py-3">
        {renderActions
          ? renderActions(row, index)
          : (
            <div className="flex items-center gap-1">
              {row.actions?.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={action.variant || "ghost"}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                  title={action.title}
                >
                  {action.icon}
                </Button>
              ))}
              {(!row.actions || row.actions.length === 0) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Default actions dropdown
                  }}
                  title="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
      </td>
    </motion.tr>
  );

  const renderToolbar = () => (
    <div className="mb-6 space-y-4">
      {/* Primary toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={searchConfig.placeholder || "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {customActions ? (
            <>{customActions}</>
          ) : (
            <>
              {/* View mode toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-l"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters toggle */}
              {filterable && (
                <Button
                  size="sm"
                  variant={showFilters ? 'primary' : 'secondary'}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              )}

              {/* Column visibility */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {/* TODO: Implement column visibility modal */}}
              >
                <Columns className="w-4 h-4 mr-1" />
                Columns
              </Button>

              {/* Export */}
              {exportOptions.length > 0 && (
                <Select
                  value=""
                  onChange={(e) => e.target.value && handleExport(e.target.value)}
                  className="min-w-0"
                >
                  <option value="">Export...</option>
                  {exportOptions.map(format => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </Select>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedRows.size > 0 && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'secondary'}
                  onClick={() => handleBulkAction(action)}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRows(new Set())}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns
                .filter(col => col.filterable !== false)
                .map(column => (
                  <div key={column.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {column.title || column.key}
                    </label>
                    {column.filterType === 'select' ? (
                      <Select
                        value={activeFilters[column.key] || ''}
                        onChange={(e) => setActiveFilters(prev => ({
                          ...prev,
                          [column.key]: e.target.value
                        }))}
                      >
                        <option value="">All</option>
                        {column.filterOptions?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={column.filterType || 'text'}
                        value={activeFilters[column.key] || ''}
                        onChange={(e) => setActiveFilters(prev => ({
                          ...prev,
                          [column.key]: e.target.value
                        }))}
                        placeholder={`Filter by ${column.title || column.key}`}
                      />
                    )}
                  </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveFilters({})}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          {filteredData.length !== data.length && (
            <span className="text-meta-primary"> (filtered from {data.length} total)</span>
          )}
        </span>
        {pagination.showSizeSelector && (
          <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-auto"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </Select>
        )}
      </div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const page = startPage + i;
            return (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? 'primary' : 'ghost'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <CompactCard title={title} subtitle={subtitle} compact={compact}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meta-primary"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </CompactCard>
    );
  }

  if (data.length === 0 && !searchTerm && Object.keys(activeFilters).length === 0) {
    return (
      <CompactCard title={title} subtitle={subtitle} compact={compact}>
        {emptyState || (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Get started by adding some data.</p>
          </div>
        )}
      </CompactCard>
    );
  }

  return (
    <CompactCard title={title} subtitle={subtitle} compact={compact} className={className}>
      {renderToolbar()}
      
      {sortedData.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              {renderTableHeader()}
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, index) => renderTableRow(row, index))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </CompactCard>
  );
};

export default EnhancedDataTable;