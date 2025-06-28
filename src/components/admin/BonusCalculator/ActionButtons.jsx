import React from 'react';
import { CheckCircle, Download, Copy } from 'lucide-react';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';

const ActionButtons = ({ 
  eligibleCreators, 
  summary, 
  loading, 
  bulkCopyMode,
  onSaveToDatabase, 
  onExportExcel, 
  onCopyByGrade, 
  onCopyMessage, 
  onCopyAllMessages 
}) => {
  if (eligibleCreators.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Tooltip content="Save all eligible creators to database">
        <Button 
          onClick={onSaveToDatabase} 
          variant="success" 
          loading={loading} 
          className="flex items-center gap-2"
        >
          <CheckCircle size={20} /> Save to Database
        </Button>
      </Tooltip>
      
      <Tooltip content="Export eligible creators to Excel">
        <Button 
          onClick={onExportExcel} 
          variant="primary" 
          className="flex items-center gap-2"
        >
          <Download size={20} /> Export Excel
        </Button>
      </Tooltip>
      
      <Tooltip content="Copy WhatsApp messages for all Grade A talents">
        <Button 
          onClick={() => onCopyByGrade('A')} 
          variant="primary" 
          className="flex items-center gap-2" 
          disabled={summary.gradeA === 0}
        >
          Copy Grade A ({summary.gradeA})
        </Button>
      </Tooltip>
      
      <Tooltip content="Copy WhatsApp messages for all Grade B talents">
        <Button 
          onClick={() => onCopyByGrade('B')} 
          variant="primary" 
          className="flex items-center gap-2" 
          disabled={summary.gradeB === 0}
        >
          Copy Grade B ({summary.gradeB})
        </Button>
      </Tooltip>
      
      <Tooltip content="Copy WhatsApp messages for all Grade C talents">
        <Button 
          onClick={() => onCopyByGrade('C')} 
          variant="primary" 
          className="flex items-center gap-2" 
          disabled={summary.gradeC === 0}
        >
          Copy Grade C ({summary.gradeC})
        </Button>
      </Tooltip>
      
      <Tooltip content="Copy WhatsApp messages for all eligible creators">
        <Button 
          onClick={onCopyAllMessages} 
          variant={bulkCopyMode ? 'success' : 'secondary'} 
          className="flex items-center gap-2"
        >
          <Copy size={20} /> {bulkCopyMode ? 'Copied All!' : 'Copy All WhatsApp Messages'}
        </Button>
      </Tooltip>
    </div>
  );
};

export default ActionButtons; 