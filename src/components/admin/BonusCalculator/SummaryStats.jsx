import React from 'react';
import { Users, Trophy, AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

const SummaryStats = ({ summary, eligibleCreators, selectedYear, selectedMonth, showChart, uploadError }) => {
  if (Object.keys(summary).length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Users className="text-blue-600 mb-2" size={24} />
          <div className="text-2xl font-bold">{summary.totalCreators}</div>
          <div className="text-sm text-gray-600">Total Processed</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <Trophy className="text-green-600 mb-2" size={24} />
          <div className="text-2xl font-bold">{summary.eligibleCreators}</div>
          <div className="text-sm text-gray-600">Eligible for Bonus</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Grade A:</span>
              <span className="font-bold">{summary.gradeA}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Grade B:</span>
              <span className="font-bold">{summary.gradeB}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Grade C:</span>
              <span className="font-bold">{summary.gradeC}</span>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-lg font-bold">
            Rp {summary.totalBonusAmount.toLocaleString('id-ID')}
          </div>
          <div className="text-sm text-gray-600">Total Bonus</div>
          <div className="text-xs text-gray-500 mt-1">
            Payment: 25 {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long' })}
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-blue-600 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-medium text-blue-900">
              Showing only {summary.eligibleCreators} eligible creators out of {summary.totalCreators} total
            </p>
            <p className="text-blue-700 mt-1">
              {summary.notQualified} creators did not qualify ({summary.violativeCreators} violative, {summary.notQualified - summary.violativeCreators} below requirements)
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
          {uploadError}
        </div>
      )}

      {showChart && eligibleCreators.length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow border border-gray-200">
          <h4 className="font-bold mb-4 text-lg">Bonus Distribution by Grade</h4>
          <Bar
            key={JSON.stringify(summary)}
            data={{
              labels: ['A', 'B', 'C'],
              datasets: [
                {
                  label: 'Number of Talents',
                  data: [
                    eligibleCreators.filter(c => c.grade === 'A').length,
                    eligibleCreators.filter(c => c.grade === 'B').length,
                    eligibleCreators.filter(c => c.grade === 'C').length,
                  ],
                  backgroundColor: ['#f472b6', '#60a5fa', '#fde68a'],
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#666' } },
                y: { grid: { color: '#e0e7ef' }, beginAtZero: true, ticks: { color: '#666', precision: 0 } },
              },
            }}
            height={220}
          />
        </div>
      )}
    </motion.div>
  );
};

export default SummaryStats; 