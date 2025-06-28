import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';

const CreatorsTable = ({
  eligibleCreators,
  paginatedCreators,
  currentPage,
  pageSize,
  totalPages,
  selectedRows,
  highlightedRows,
  copiedIndex,
  filterStatus,
  filterGrade,
  filterSearch,
  onPageChange,
  onSelectRow,
  onSelectAll,
  onStatusChange,
  onCopyMessage,
  onBulkStatusUpdate,
  onClearSelection,
  onFilterStatusChange,
  onFilterGradeChange,
  onFilterSearchChange,
  generateWhatsAppMessage
}) => {
  if (eligibleCreators.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Eligible Creators ({eligibleCreators.length})
      </h3>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select 
            value={filterStatus} 
            onChange={e => onFilterStatusChange(e.target.value)} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
          <select 
            value={filterGrade} 
            onChange={e => onFilterGradeChange(e.target.value)} 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black"
          >
            <option value="all">All</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input 
            type="text" 
            value={filterSearch} 
            onChange={e => onFilterSearchChange(e.target.value)} 
            placeholder="Search username..." 
            className="p-2 border rounded-lg bg-gray-50 text-meta-black" 
          />
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 mb-2">
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-xs">Page {currentPage} of {totalPages}</span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-xs">
                <input 
                  type="checkbox" 
                  checked={selectedRows.length === eligibleCreators.length && eligibleCreators.length > 0} 
                  onChange={onSelectAll} 
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Performance</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Coins</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">% Bonus</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Est. Bonus (USD)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Est. Bonus (IDR)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Final Bonus (IDR)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Breakdown</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase">WhatsApp</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCreators.map((creator, idx) => (
              <tr 
                key={creator.creatorId || idx} 
                className={`hover:bg-gray-50 transition-colors duration-500 ${
                  highlightedRows.includes(creator.creatorId) ? 'bg-green-50 animate-pulse' : ''
                }`}
              >
                <td className="px-2 py-1 text-xs">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.includes(creator.creatorId)} 
                    onChange={() => onSelectRow(creator.creatorId)} 
                  />
                </td>
                <td className="px-4 py-3 text-sm">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{creator.username}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-xs space-y-1">
                    <div>📅 {creator.validDays} days</div>
                    <div>⏱️ {creator.liveHours.toFixed(1)} hours</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {creator.diamonds.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">{creator.grade}</td>
                <td className="px-4 py-3 text-sm">{Math.round(creator.percentage * 100)}%</td>
                <td className="px-4 py-3 text-sm">
                  ${creator.estimatedBonusUSD?.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
                </td>
                <td className="px-4 py-3 text-sm">
                  Rp {creator.estimatedBonusLocal?.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">
                  Rp {creator.bonusAmount?.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 text-xs">{creator.breakdown}</td>
                <td className="px-4 py-3 text-center">
                  <Tooltip content="Copy WhatsApp message">
                    <Button
                      onClick={() => onCopyMessage(creator, idx)}
                      variant={copiedIndex === idx ? 'success' : 'primary'}
                      size="sm"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        copiedIndex === idx ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </Button>
                  </Tooltip>
                </td>
                <td className="px-4 py-3 text-xs">
                  <select 
                    value={creator.paymentStatus} 
                    onChange={e => onStatusChange(creator.creatorId, e.target.value)} 
                    className="border rounded p-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Message Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">WhatsApp Message Preview:</h4>
        <div className="bg-white p-4 rounded border border-gray-200 text-sm whitespace-pre-wrap font-mono">
          {generateWhatsAppMessage(eligibleCreators[0])}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="mb-4 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="font-medium text-meta-blue">{selectedRows.length} selected</span>
          <Tooltip content="Mark selected as Paid">
            <button
              className="px-3 py-1 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
              onClick={() => onBulkStatusUpdate('paid')}
            >
              Mark as Paid
            </button>
          </Tooltip>
          <button
            className="px-3 py-1 rounded bg-yellow-400 text-white text-xs font-semibold hover:bg-yellow-500"
            onClick={() => onBulkStatusUpdate('pending')}
          >
            Mark as Pending
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600"
            onClick={() => onBulkStatusUpdate('failed')}
          >
            Mark as Failed
          </button>
          <button
            className="ml-auto px-2 py-1 rounded text-xs text-meta-gray-500 hover:text-meta-black"
            onClick={onClearSelection}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatorsTable; 