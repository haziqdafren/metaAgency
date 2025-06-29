// Enhanced DataTable Helper Functions and Utilities

/**
 * Export utilities for different formats
 */
export const exportHelpers = {
  /**
   * Export data to Excel format
   * @param {Array} data - Array of objects to export
   * @param {Array} columns - Column configuration
   * @param {string} filename - Export filename
   */
  async exportToExcel(data, columns, filename = 'export') {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare export data
      const exportData = data.map(row => {
        const exportRow = {};
        columns.forEach(col => {
          exportRow[col.title || col.key] = col.exportValue 
            ? col.exportValue(row[col.key], row) 
            : row[col.key];
        });
        return exportRow;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      const fileName = `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return { success: true, filename: fileName };
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export data to CSV format
   * @param {Array} data - Array of objects to export
   * @param {Array} columns - Column configuration
   * @param {string} filename - Export filename
   */
  exportToCSV(data, columns, filename = 'export') {
    try {
      // Prepare headers
      const headers = columns.map(col => col.title || col.key);
      
      // Prepare rows
      const rows = data.map(row => 
        columns.map(col => {
          const value = col.exportValue 
            ? col.exportValue(row[col.key], row) 
            : row[col.key];
          
          // Escape and quote values containing commas, quotes, or newlines
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
      );

      // Create CSV content
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, filename: link.download };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Search and filter utilities
 */
export const searchHelpers = {
  /**
   * Advanced search function with multiple criteria
   * @param {Array} data - Data to search
   * @param {string} searchTerm - Search term
   * @param {Array} searchableColumns - Columns to search in
   * @param {Object} filters - Active filters
   */
  performSearch(data, searchTerm, searchableColumns = [], filters = {}) {
    let filtered = [...data];

    // Apply text search
    if (searchTerm && searchableColumns.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchableColumns.some(key => {
          const value = this.getNestedValue(item, key);
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filter]) => {
      if (filter && filter !== '' && filter !== null && filter !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = this.getNestedValue(item, key);
          return this.applyFilter(itemValue, filter);
        });
      }
    });

    return filtered;
  },

  /**
   * Get nested object value by key path (e.g., 'user.profile.name')
   * @param {Object} obj - Object to get value from
   * @param {string} path - Dot notation path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  /**
   * Apply filter based on filter type and operator
   * @param {any} value - Value to filter
   * @param {any} filter - Filter configuration
   */
  applyFilter(value, filter) {
    // Simple string/exact match
    if (typeof filter === 'string' || typeof filter === 'number') {
      return String(value || '').toLowerCase().includes(String(filter).toLowerCase());
    }

    // Advanced filter with operator
    if (typeof filter === 'object' && filter.operator) {
      const { operator, value: filterValue } = filter;
      
      switch (operator) {
        case 'equals':
          return value === filterValue;
        case 'not_equals':
          return value !== filterValue;
        case 'contains':
          return String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase());
        case 'not_contains':
          return !String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase());
        case 'starts_with':
          return String(value || '').toLowerCase().startsWith(String(filterValue || '').toLowerCase());
        case 'ends_with':
          return String(value || '').toLowerCase().endsWith(String(filterValue || '').toLowerCase());
        case 'gte':
          return Number(value) >= Number(filterValue);
        case 'lte':
          return Number(value) <= Number(filterValue);
        case 'gt':
          return Number(value) > Number(filterValue);
        case 'lt':
          return Number(value) < Number(filterValue);
        case 'between':
          const [min, max] = filterValue;
          return Number(value) >= Number(min) && Number(value) <= Number(max);
        case 'in':
          return Array.isArray(filterValue) && filterValue.includes(value);
        case 'not_in':
          return Array.isArray(filterValue) && !filterValue.includes(value);
        case 'is_null':
          return value === null || value === undefined || value === '';
        case 'is_not_null':
          return value !== null && value !== undefined && value !== '';
        default:
          return true;
      }
    }

    return true;
  },

  /**
   * Generate search suggestions based on data
   * @param {Array} data - Data to analyze
   * @param {Array} columns - Searchable columns
   * @param {number} limit - Maximum suggestions to return
   */
  generateSearchSuggestions(data, columns, limit = 10) {
    const suggestions = new Set();
    
    data.forEach(item => {
      columns.forEach(column => {
        const value = this.getNestedValue(item, column);
        if (value && typeof value === 'string' && value.length > 2) {
          // Add words from the value
          const words = value.split(/\s+/).filter(word => word.length > 2);
          words.forEach(word => suggestions.add(word.toLowerCase()));
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }
};

/**
 * Sorting utilities
 */
export const sortHelpers = {
  /**
   * Sort data by column with proper type handling
   * @param {Array} data - Data to sort
   * @param {string} key - Column key to sort by
   * @param {string} direction - 'asc' or 'desc'
   * @param {Function} customSort - Custom sort function
   */
  sortData(data, key, direction = 'asc', customSort = null) {
    return [...data].sort((a, b) => {
      if (customSort) {
        return direction === 'asc' ? customSort(a, b) : customSort(b, a);
      }

      const aValue = searchHelpers.getNestedValue(a, key);
      const bValue = searchHelpers.getNestedValue(b, key);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Number sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String sorting
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      const comparison = aString.localeCompare(bString);
      return direction === 'asc' ? comparison : -comparison;
    });
  },

  /**
   * Multi-column sorting
   * @param {Array} data - Data to sort
   * @param {Array} sortConfigs - Array of {key, direction} objects
   */
  multiSort(data, sortConfigs) {
    return [...data].sort((a, b) => {
      for (const config of sortConfigs) {
        const aValue = searchHelpers.getNestedValue(a, config.key);
        const bValue = searchHelpers.getNestedValue(b, config.key);
        
        let comparison = 0;
        
        if (aValue === null || aValue === undefined) comparison = 1;
        else if (bValue === null || bValue === undefined) comparison = -1;
        else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }
        
        if (comparison !== 0) {
          return config.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }
};

/**
 * Column configuration helpers
 */
export const columnHelpers = {
  /**
   * Create a standard text column
   * @param {string} key - Data key
   * @param {string} title - Display title
   * @param {Object} options - Additional options
   */
  textColumn(key, title, options = {}) {
    return {
      key,
      title,
      sortable: true,
      filterable: true,
      ...options
    };
  },

  /**
   * Create a number column with formatting
   * @param {string} key - Data key
   * @param {string} title - Display title
   * @param {Object} options - Additional options
   */
  numberColumn(key, title, options = {}) {
    return {
      key,
      title,
      sortable: true,
      filterable: true,
      filterType: 'number',
      render: (value) => value ? Number(value).toLocaleString() : '-',
      exportValue: (value) => Number(value) || 0,
      ...options
    };
  },

  /**
   * Create a date column with formatting
   * @param {string} key - Data key
   * @param {string} title - Display title
   * @param {Object} options - Additional options
   */
  dateColumn(key, title, options = {}) {
    return {
      key,
      title,
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
      exportValue: (value) => value ? new Date(value).toISOString() : '',
      ...options
    };
  },

  /**
   * Create a status badge column
   * @param {string} key - Data key
   * @param {string} title - Display title
   * @param {Object} statusConfig - Status configuration
   */
  statusColumn(key, title, statusConfig = {}) {
    return {
      key,
      title,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.keys(statusConfig).map(status => ({
        value: status,
        label: statusConfig[status]?.label || status
      })),
      render: (value) => {
        const config = statusConfig[value] || { label: value, className: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
            {config.label}
          </span>
        );
      }
    };
  },

  /**
   * Create an action column
   * @param {Array} actions - Array of action configurations
   */
  actionColumn(actions = []) {
    return {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      filterable: false,
      render: (value, row) => (
        <div className="flex items-center gap-1">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(row);
              }}
              className={`p-1 rounded hover:bg-gray-100 ${action.className || ''}`}
              title={action.title}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )
    };
  }
};

/**
 * Performance optimization helpers
 */
export const performanceHelpers = {
  /**
   * Debounce function for search input
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  /**
   * Throttle function for scroll events
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Virtual scrolling helper for large datasets
   * @param {Array} data - Full dataset
   * @param {number} startIndex - Start index
   * @param {number} endIndex - End index
   */
  getVirtualizedData(data, startIndex, endIndex) {
    return data.slice(startIndex, endIndex + 1);
  }
};

/**
 * Mobile optimization helpers
 */
export const mobileHelpers = {
  /**
   * Convert table data to mobile-friendly cards
   * @param {Array} data - Table data
   * @param {Array} columns - Column configuration
   * @param {Function} onRowClick - Row click handler
   */
  generateMobileCards(data, columns, onRowClick) {
    return data.map((row, index) => ({
      id: row.id || index,
      title: row[columns[0]?.key] || 'Item',
      subtitle: row[columns[1]?.key] || '',
      content: columns.slice(2).map(col => ({
        label: col.title,
        value: col.render ? col.render(row[col.key], row) : row[col.key]
      })),
      actions: row.actions || [],
      onClick: () => onRowClick && onRowClick(row)
    }));
  },

  /**
   * Determine if device is mobile
   */
  isMobileDevice() {
    return window.innerWidth < 768;
  },

  /**
   * Get responsive column configuration
   * @param {Array} columns - Original columns
   * @param {boolean} isMobile - Is mobile device
   */
  getResponsiveColumns(columns, isMobile) {
    if (!isMobile) return columns;
    
    // On mobile, show only the most important columns
    return columns.filter(col => col.mobileVisible !== false).slice(0, 3);
  }
};

export default {
  exportHelpers,
  searchHelpers,
  sortHelpers,
  columnHelpers,
  performanceHelpers,
  mobileHelpers
};