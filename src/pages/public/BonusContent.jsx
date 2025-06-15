import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, RefreshCcw, Star, Trophy, Gift, TrendingUp, Info, Calculator, Clock, Image, Music, Book } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';

const pageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Animation variants for items within sections
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const BonusContent = () => {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceReports, setPerformanceReports] = useState([]);
  const [talentPerformance, setTalentPerformance] = useState([]);
  const [achievementBadges, setAchievementBadges] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch performance reports
        const { data: reports, error: reportsError } = await supabase
          .from('performance_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;

        // Set initial selected month
        if (reports && reports.length > 0) {
          const latestReport = reports[0];
          setSelectedMonth(`${latestReport.month}/${latestReport.year}`);
        }

        setPerformanceReports(reports);

        // Fetch talent performance for the selected month
        if (reports && reports.length > 0) {
          const latestReport = reports[0];
          const { data: performance, error: performanceError } = await supabase
            .from('talent_performance')
            .select(`
              *,
              talent:talent_profiles(
                username_tiktok,
                followers_count
              )
            `)
            .eq('report_id', latestReport.id)
            .order('ranking', { ascending: true });

          if (performanceError) throw performanceError;
          setTalentPerformance(performance);
        }

        // Fetch achievement badges
        const { data: badges, error: badgesError } = await supabase
          .from('achievement_badges')
          .select('*');

        if (badgesError) throw badgesError;
        setAchievementBadges(badges);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPerformanceForMonth = async () => {
      if (!selectedMonth) return;

      const [month, year] = selectedMonth.split('/');
      try {
        const { data: report, error: reportError } = await supabase
          .from('performance_reports')
          .select('id')
          .eq('month', parseInt(month))
          .eq('year', parseInt(year))
          .single();

        if (reportError) throw reportError;

        const { data: performance, error: performanceError } = await supabase
          .from('talent_performance')
          .select(`
            *,
            talent:talent_profiles(
              username_tiktok,
              followers_count
            )
          `)
          .eq('report_id', report.id)
          .order('ranking', { ascending: true });

        if (performanceError) throw performanceError;
        setTalentPerformance(performance);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPerformanceForMonth();
  }, [selectedMonth]);

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
      className={`p-6 w-full max-w-7xl mx-auto pt-24 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-3xl font-bold mb-6">Bonus Content for Talents</h1>

      {/* Monthly Performance Reports Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-md transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Monthly Performance Reports</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`p-2 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-white border-meta-gray-700' : 'bg-gray-100 text-meta-black border-gray-300'}`}
            >
              {performanceReports.map((report) => (
                <option key={report.id} value={`${report.month}/${report.year}`}>
                  {new Date(report.year, report.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-meta-blue text-white py-2 px-4 rounded-lg flex items-center shadow-md hover:bg-meta-blue/90 transition"
            >
              <Download className="w-4 h-4 mr-2" /> Download Report
            </motion.button>
          </div>
        </div>

        {talentPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <motion.tr
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className={`text-sm font-semibold ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} border-b ${theme === 'dark' ? 'border-meta-gray-700' : 'border-gray-200'}`}
                >
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Diamonds Earned</th>
                  <th className="py-3 px-4">Viewers</th>
                  <th className="py-3 px-4">Streaming Hours</th>
                  <th className="py-3 px-4">Ranking</th>
                </motion.tr>
              </thead>
              <tbody>
                {talentPerformance.map((data, index) => (
                  <motion.tr
                    key={data.id}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                    className={`border-b ${theme === 'dark' ? 'border-meta-gray-800' : 'border-gray-100'} ${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 flex items-center">
                      <span>{data.talent?.username_tiktok}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{data.diamond_earned.toLocaleString()}</td>
                    <td className="py-3 px-4">{data.viewers_count.toLocaleString()}</td>
                    <td className="py-3 px-4">{data.streaming_hours}h</td>
                    <td className="py-3 px-4">{data.ranking}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.p
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}
          >
            No performance data available for this month.
          </motion.p>
        )}
      </motion.section>

      {/* Achievement Badges/Rewards Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-md transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className="text-2xl font-semibold mb-4">Your Achievements & Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className={`p-5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="w-10 h-10 mb-3">
                {badge.icon_name === 'star' && <Star className="w-10 h-10 text-yellow-500" />}
                {badge.icon_name === 'trophy' && <Trophy className="w-10 h-10 text-blue-500" />}
                {badge.icon_name === 'gift' && <Gift className="w-10 h-10 text-green-500" />}
                {badge.icon_name === 'trending' && <TrendingUp className="w-10 h-10 text-purple-500" />}
              </div>
              <h3 className="text-lg font-medium mt-3 mb-1">{badge.name}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{badge.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 text-meta-blue hover:underline flex items-center text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-1" /> Download Certificate
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tools & Resources Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-md transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className="text-2xl font-semibold mb-4">Tools & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`p-5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700' : 'bg-gray-50 border-gray-200'}`}
          >
            <Calculator className="w-6 h-6 text-meta-blue mb-3" />
            <h3 className="text-lg font-medium mb-2">Diamond to IDR Calculator</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>Calculate your earnings from diamonds</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`p-5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700' : 'bg-gray-50 border-gray-200'}`}
          >
            <Clock className="w-6 h-6 text-purple-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Best Time to Stream Guide</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>Optimize your streaming schedule</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`p-5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700' : 'bg-gray-50 border-gray-200'}`}
          >
            <Image className="w-6 h-6 text-red-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Thumbnail Templates</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>Professional templates for your content</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`p-5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700' : 'bg-gray-50 border-gray-200'}`}
          >
            <Music className="w-6 h-6 text-green-500 mb-3" />
            <h3 className="text-lg font-medium mb-2">Audio Library</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>Copyright-free music for your streams</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default BonusContent; 