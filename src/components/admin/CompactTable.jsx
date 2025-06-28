import React from 'react';

const CompactTable = ({ 
  children, 
  className = '', 
  compact = false,
  striped = true,
  hover = true,
  ...props 
}) => {
  const tableClasses = `
    min-w-full divide-y divide-gray-200
    ${compact ? 'text-sm' : 'text-base'}
    ${className}
  `;

  const rowClasses = `
    ${striped ? 'even:bg-gray-50' : ''}
    ${hover ? 'hover:bg-blue-50 transition-colors' : ''}
  `;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={tableClasses} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { 
              compact, 
              rowClasses,
              ...child.props 
            });
          }
          return child;
        })}
      </table>
    </div>
  );
};

const CompactTableHead = ({ children, compact = false, ...props }) => {
  return (
    <thead className="bg-gray-50" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { compact, ...child.props });
        }
        return child;
      })}
    </thead>
  );
};

const CompactTableBody = ({ children, compact = false, rowClasses = '', ...props }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${rowClasses}`} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { compact, ...child.props });
        }
        return child;
      })}
    </tbody>
  );
};

const CompactTableRow = ({ children, compact = false, ...props }) => {
  return (
    <tr {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { compact, ...child.props });
        }
        return child;
      })}
    </tr>
  );
};

const CompactTableCell = ({ children, compact = false, className = '', ...props }) => {
  const cellClasses = `
    ${compact ? 'px-3 py-2' : 'px-4 py-3'}
    ${className}
  `;

  return (
    <td className={cellClasses} {...props}>
      {children}
    </td>
  );
};

const CompactTableHeader = ({ children, compact = false, className = '', ...props }) => {
  const headerClasses = `
    ${compact ? 'px-3 py-2' : 'px-4 py-3'}
    text-left text-xs font-medium text-gray-500 uppercase tracking-wider
    ${className}
  `;

  return (
    <th className={headerClasses} {...props}>
      {children}
    </th>
  );
};

CompactTable.Head = CompactTableHead;
CompactTable.Body = CompactTableBody;
CompactTable.Row = CompactTableRow;
CompactTable.Cell = CompactTableCell;
CompactTable.Header = CompactTableHeader;

export default CompactTable; 