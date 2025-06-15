import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const AdminDashboard = () => {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTalents: 0,
    activeToday: 0,
    pendingRegistrations: 0,
    monthlyRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{
      label: 'Monthly Revenue (Billion IDR)',
      data: [],
      borderColor: '#00bcd4',
      backgroundColor: 'rgba(0, 188, 212, 0.2)',
      fill: true,
      tension: 0.3,
    }]
  });
  const [topPerformersData, setTopPerformersData] = useState({
    labels: [],
    datasets: [{
      label: 'Diamonds Earned',
      data: [],
      backgroundColor: ['#00bcd4', '#1e88e5', '#ffc107', '#4caf50', '#f44336'],
    }]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total talents
        const { count: totalTalents, error: talentsError } = await supabase
          .from('talent_profiles')
          .select('*', { count: 'exact', head: true });

        if (talentsError) throw talentsError;

        // Fetch pending registrations
        const { count: pendingRegistrations, error: registrationsError } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (registrationsError) throw registrationsError;

        // Fetch monthly revenue from performance reports
        const { data: performanceReports, error: reportsError } = await supabase
          .from('performance_reports')
          .select('total_diamonds')
          .order('created_at', { ascending: false })
          .limit(1);

        if (reportsError) throw reportsError;

        const monthlyRevenue = performanceReports[0]?.total_diamonds || 0;

        // Fetch top performers
        const { data: topPerformers, error: performersError } = await supabase
          .from('talent_performance')
          .select(`
            diamond_earned,
            talent:talent_profiles(
              username_tiktok
            )
          `)
          .order('diamond_earned', { ascending: false })
          .limit(5);

        if (performersError) throw performersError;

        // Fetch revenue data for the last 12 months
        const { data: monthlyRevenueData, error: revenueError } = await supabase
          .from('performance_reports')
          .select('month, year, total_diamonds')
          .order('year', { ascending: true })
          .order('month', { ascending: true })
          .limit(12);

        if (revenueError) throw revenueError;

        // Process revenue data for chart
        const labels = monthlyRevenueData.map(report => 
          new Date(report.year, report.month - 1).toLocaleDateString('en-US', { month: 'short' })
        );
        const data = monthlyRevenueData.map(report => report.total_diamonds);

        // Fetch recent activities
        const { data: activities, error: activitiesError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesError) throw activitiesError;

        setStats({
          totalTalents,
          activeToday: 0, // This would need a separate query to get active users today
          pendingRegistrations,
          monthlyRevenue
        });

        setTopPerformersData({
          labels: topPerformers.map(p => p.talent.username_tiktok),
          datasets: [{
            label: 'Diamonds Earned',
            data: topPerformers.map(p => p.diamond_earned),
            backgroundColor: ['#00bcd4', '#1e88e5', '#ffc107', '#4caf50', '#f44336'],
          }]
        });

        setRevenueData({
          labels,
          datasets: [{
            label: 'Monthly Revenue (Billion IDR)',
            data,
            borderColor: '#00bcd4',
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            fill: true,
            tension: 0.3,
          }]
        });

        setRecentActivities(activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          time: new Date(activity.created_at).toLocaleDateString('en-US', { 
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        })));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: theme === 'dark' ? '#cbd5e1' : '#333' } },
      title: { display: true, text: 'Monthly Revenue Trends', color: theme === 'dark' ? '#ffffff' : '#000000' },
    },
    scales: {
      x: { ticks: { color: theme === 'dark' ? '#94a3b8' : '#666' }, grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' } },
      y: { ticks: { color: theme === 'dark' ? '#94a3b8' : '#666' }, grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' } },
    },
  };

  const topPerformersOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: theme === 'dark' ? '#cbd5e1' : '#333' } },
      title: { display: true, text: 'Top Performing Talents (Diamonds)', color: theme === 'dark' ? '#ffffff' : '#000000' },
    },
    scales: {
      x: { ticks: { color: theme === 'dark' ? '#94a3b8' : '#666' }, grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' } },
      y: { ticks: { color: theme === 'dark' ? '#94a3b8' : '#666' }, grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' } },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-meta-blue">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`p-6 flex-1 overflow-y-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-br from-meta-black via-meta-gray-900/80 to-meta-black/90' : 'bg-gradient-to-br from-white via-meta-gray-100 to-white'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'} rounded-xl p-6 shadow flex flex-col items-start border transition-colors duration-500`}
        >
          <span className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'} mb-1 text-sm`}>Total Talents</span>
          <span className="text-3xl font-bold">{stats.totalTalents}</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'} rounded-xl p-6 shadow flex flex-col items-start border transition-colors duration-500`}
        >
          <span className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'} mb-1 text-sm`}>Active Today</span>
          <span className="text-3xl font-bold">{stats.activeToday}</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'} rounded-xl p-6 shadow flex flex-col items-start border transition-colors duration-500`}
        >
          <span className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'} mb-1 text-sm`}>Pending Registrations</span>
          <span className="text-3xl font-bold">{stats.pendingRegistrations}</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'} rounded-xl p-6 shadow flex flex-col items-start border transition-colors duration-500`}
        >
          <span className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-500'} mb-1 text-sm`}>Monthly Revenue</span>
          <span className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</span>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800' : 'bg-white border-meta-gray-200'} rounded-xl p-6 shadow border transition-colors duration-500`}
        >
          <Line data={revenueData} options={revenueOptions} height={220} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800' : 'bg-white border-meta-gray-200'} rounded-xl p-6 shadow border transition-colors duration-500`}
        >
          <Bar data={topPerformersData} options={topPerformersOptions} height={220} />
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${theme === 'dark' ? 'bg-meta-gray-900/80 border-meta-gray-800' : 'bg-white border-meta-gray-200'} rounded-xl p-6 shadow border transition-colors duration-500 mb-8`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Recent Activities</h2>
        <ul className="divide-y divide-meta-gray-200 dark:divide-meta-gray-800">
          {recentActivities.map(activity => (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-2 flex items-center gap-3"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-meta-blue"></span>
              <span className="flex-1">{activity.description}</span>
              <span className="text-xs text-meta-gray-400">{activity.time}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-meta-blue text-white rounded-lg py-4 px-6 font-semibold shadow hover:bg-meta-blue/90 transition"
        >
          Add New Talent
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-meta-blue text-white rounded-lg py-4 px-6 font-semibold shadow hover:bg-meta-blue/90 transition"
        >
          Upload Performance
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-meta-blue text-white rounded-lg py-4 px-6 font-semibold shadow hover:bg-meta-blue/90 transition"
        >
          Export Data
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AdminDashboard; 