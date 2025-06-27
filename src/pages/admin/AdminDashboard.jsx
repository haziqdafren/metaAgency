import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Book, Users, TrendingUp, UserCheck, Gem, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LazyLine = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })));

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

const AdminDashboard = () => {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState({
    totalCreators: 0,
    activeCreators: 0,
    totalDiamonds: 0,
    totalBonuses: 0,
  });
  const [diamondsTrend, setDiamondsTrend] = useState({ labels: [], data: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Total creators & active creators
      const { count: totalCreators } = await supabase
        .from('creators')
          .select('*', { count: 'exact', head: true });
      const { count: activeCreators } = await supabase
        .from('creators')
          .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      // Diamonds trend (last 6 months)
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
      });
      let trendLabels = [];
      let trendData = [];
      for (const m of months) {
        const { data, error } = await supabase
          .from('creator_performance')
          .select('diamonds')
          .eq('period_year', m.year)
          .eq('period_month', m.month);
        const sum = data ? data.reduce((acc, row) => acc + (row.diamonds || 0), 0) : 0;
        trendLabels.push(`${m.month}/${m.year}`);
        trendData.push(sum);
      }
      // Total diamonds (latest month)
      const latestDiamonds = trendData[trendData.length - 1] || 0;
      // Total bonuses (latest month)
      const { data: bonusRows } = await supabase
        .from('bonus_calculations')
        .select('bonus_amount_idr, month, year');
      let totalBonuses = 0;
      if (bonusRows && bonusRows.length > 0) {
        const latest = months[months.length - 1];
        totalBonuses = bonusRows
          .filter(b => b.month === latest.month && b.year === latest.year)
          .reduce((acc, b) => acc + (b.bonus_amount_idr || 0), 0);
      }
      // Recent activity (simulate with last 5 username changes)
      const { data: usernameChanges } = await supabase
        .from('username_history')
        .select('old_username, new_username, changed_at')
        .order('changed_at', { ascending: false })
          .limit(5);
        setStats({
        totalCreators: totalCreators || 0,
        activeCreators: activeCreators || 0,
        totalDiamonds: latestDiamonds,
        totalBonuses,
      });
      setDiamondsTrend({ labels: trendLabels, data: trendData });
      setRecentActivity(
        (usernameChanges || []).map(change => ({
          type: 'Username Change',
          message: `${change.old_username} → ${change.new_username}`,
          date: new Date(change.changed_at).toLocaleDateString('id-ID'),
        }))
      );
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-500 bg-gray-50 text-meta-black">
      <motion.h1
        className="text-3xl font-bold mb-2 text-meta-blue"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome{profile?.name ? `, ${profile.name}` : ''}!
      </motion.h1>
      <motion.p
        className="mb-8 text-lg text-meta-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Here's your agency's latest performance at a glance.
      </motion.p>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: 'Total Creators',
            value: stats.totalCreators,
            icon: <UserCheck className="w-7 h-7 text-meta-blue" />, color: 'bg-blue-50 text-meta-black',
          },
          {
            label: 'Active Creators',
            value: stats.activeCreators,
            icon: <Users className="w-7 h-7 text-green-600" />, color: 'bg-green-50 text-meta-black',
          },
          {
            label: 'Total Diamonds',
            value: stats.totalDiamonds,
            icon: <Gem className="w-7 h-7 text-purple-600" />, color: 'bg-purple-50 text-meta-black',
          },
          {
            label: 'Total Bonuses',
            value: `Rp ${stats.totalBonuses.toLocaleString('id-ID')}`,
            icon: <DollarSign className="w-7 h-7 text-yellow-500" />, color: 'bg-yellow-50 text-meta-black',
          },
        ].map((card, i) => (
        <motion.div
            key={card.label}
            className={`rounded-xl shadow p-6 flex flex-col items-center ${card.color}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            whileHover={{ scale: 1.05 }}
          >
            {card.icon}
        <motion.div
              className="text-3xl font-bold mt-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200 }}
            >
              {card.value}
        </motion.div>
            <div className="text-sm text-meta-gray-600 mt-1">{card.label}</div>
        </motion.div>
        ))}
      </div>
      {/* Diamonds Trend Chart */}
        <motion.div
        className={`rounded-xl shadow p-6 mb-10 transition-colors duration-500 bg-white border border-gray-200`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-meta-blue mr-2" />
          <span className="font-semibold text-lg">Diamonds Trend (Last 6 Months)</span>
        </div>
        <Suspense fallback={<div>Loading chart...</div>}>
          <LazyLine
            data={{
              labels: diamondsTrend.labels,
              datasets: [
                {
                  label: 'Diamonds',
                  data: diamondsTrend.data,
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 7,
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
                y: { grid: { color: '#e0e7ef' }, beginAtZero: true, ticks: { color: '#666' } },
              },
              animation: {
                duration: 1200,
                easing: 'easeInOutQuart',
              },
            }}
          />
        </Suspense>
        </motion.div>
      {/* Recent Activity */}
      <motion.div
        className={`rounded-xl shadow p-6 mb-10 transition-colors duration-500 bg-white border border-gray-200`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <Activity className="w-6 h-6 text-meta-blue mr-2" />
          <span className="font-semibold text-lg">Recent Activity</span>
        </div>
        <ul className="divide-y divide-meta-gray-100">
          <AnimatePresence>
            {recentActivity.length === 0 && (
              <motion.li className="py-2 text-meta-gray-400">No recent activity.</motion.li>
            )}
            {recentActivity.map((item, i) => (
            <motion.li
                key={i}
              className="py-2 flex items-center gap-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ delay: 0.1 * i }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-meta-blue"></span>
                <span className="flex-1">{item.message}</span>
                <span className="text-xs text-meta-gray-400">{item.date}</span>
            </motion.li>
          ))}
          </AnimatePresence>
        </ul>
      </motion.div>
      {/* Feature Shortcuts */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {[
          {
            to: '/admin/upload',
            icon: <Upload className="w-10 h-10 mb-2 text-meta-blue" />,
            label: 'Upload Performance',
            color: 'bg-blue-50 text-meta-black',
          },
          {
            to: '/admin/bonus',
            icon: <Book className="w-10 h-10 mb-2 text-purple-700" />,
            label: 'Bonus Calculator',
            color: 'bg-purple-50 text-meta-black',
          },
          {
            to: '/admin/talents',
            icon: <Users className="w-10 h-10 mb-2 text-green-700" />,
            label: 'Talent Management',
            color: 'bg-green-50 text-meta-black',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className={`flex flex-col items-center p-6 rounded-lg shadow cursor-pointer hover:scale-105 transition ${card.color}`}
            whileHover={{ scale: 1.08, boxShadow: '0 8px 32px rgba(99,102,241,0.15)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link to={card.to} className="flex flex-col items-center">
              {card.icon}
              <span className="font-semibold text-lg mt-2">{card.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      </div>
  );
};

export default AdminDashboard; 