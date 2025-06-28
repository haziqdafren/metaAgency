import React from 'react';

const RecentActivity = ({ usernameChanges }) => {
  if (usernameChanges.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Recent Username Changes</span>
      </div>
      <div className="space-y-1 text-sm">
        {usernameChanges.slice(0, 3).map((change, idx) => (
          <div key={idx} className="text-gray-700">
            {change.old_username} → {change.new_username}
            <span className="text-gray-500 ml-2">
              ({new Date(change.changed_at).toLocaleDateString('id-ID')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity; 