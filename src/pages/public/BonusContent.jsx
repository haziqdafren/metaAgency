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

// --- Bonus Calculation Logic (from admin) ---
const gradeRequirements = {
  A: { days: 22, hours: 100 },
  B: { days: 20, hours: 60 },
  C: { days: 15, hours: 40 }
};
const bonusTable = {
  A: [
    { minCoins: 2000, bonus: 10000 },
    { minCoins: 1000, bonus: 5000 },
    { minCoins: 750, bonus: 3100 },
    { minCoins: 500, bonus: 1300 },
    { minCoins: 300, bonus: 1000 },
    { minCoins: 200, bonus: 575 },
    { minCoins: 100, bonus: 350 },
    { minCoins: 50, bonus: 175 },
    { minCoins: 30, bonus: 100 },
    { minCoins: 10, bonus: 50 },
  ],
  B: [
    { minCoins: 200, bonus: 500 },
    { minCoins: 150, bonus: 400 },
    { minCoins: 100, bonus: 300 },
    { minCoins: 50, bonus: 150 },
    { minCoins: 20, bonus: 75 },
  ],
  C: [
    { minCoins: 200, bonus: 200 },
    { minCoins: 50, bonus: 100 },
    { minCoins: 20, bonus: 50 },
    { minCoins: 10, bonus: 20 },
  ]
};

function calculateBonuses(data) {
  return data.map(creator => {
    if (creator.is_violative) {
      return { ...creator, qualified: false, breakdown: 'Disqualified (violative)' };
    }
    let grade = null;
    let breakdown = '';
    if ((creator.valid_days ?? creator.validDays) >= gradeRequirements.A.days && (creator.streaming_hours ?? creator.liveHours) >= gradeRequirements.A.hours) {
      grade = 'A';
      breakdown = `Grade A: ${creator.valid_days ?? creator.validDays} days, ${creator.streaming_hours ?? creator.liveHours} hours`;
    } else if ((creator.valid_days ?? creator.validDays) >= gradeRequirements.B.days && (creator.streaming_hours ?? creator.liveHours) >= gradeRequirements.B.hours) {
      grade = 'B';
      breakdown = `Grade B: ${creator.valid_days ?? creator.validDays} days, ${creator.streaming_hours ?? creator.liveHours} hours`;
    } else if ((creator.valid_days ?? creator.validDays) >= gradeRequirements.C.days && (creator.streaming_hours ?? creator.liveHours) >= gradeRequirements.C.hours) {
      grade = 'C';
      breakdown = `Grade C: ${creator.valid_days ?? creator.validDays} days, ${creator.streaming_hours ?? creator.liveHours} hours`;
    }
    if (!grade) {
      return { ...creator, qualified: false, breakdown: 'Not enough days/hours' };
    }
    const bonusTiers = bonusTable[grade];
    let bonusAmount = 0;
    let bonusRule = '';
    for (const tier of bonusTiers) {
      if ((creator.diamond_earned ?? creator.diamonds) >= tier.minCoins * 1000) {
        bonusAmount = tier.bonus * 1000;
        bonusRule = `Diamonds: ${(creator.diamond_earned ?? creator.diamonds)} >= ${tier.minCoins * 1000} (Rule: ${tier.minCoins}RB → ${tier.bonus}RB)`;
        break;
      }
    }
    if (bonusAmount === 0) {
      return { ...creator, grade, qualified: false, breakdown: breakdown + ' | Not enough diamonds' };
    }
    return {
      ...creator,
      grade,
      bonusAmount,
      qualified: true,
      breakdown: breakdown + ' | ' + bonusRule
    };
  });
}

function calculateSummary(allData, eligibleData) {
  return {
    totalCreators: allData.length,
    eligibleCreators: eligibleData.length,
    gradeA: eligibleData.filter(c => c.grade === 'A').length,
    gradeB: eligibleData.filter(c => c.grade === 'B').length,
    gradeC: eligibleData.filter(c => c.grade === 'C').length,
    notQualified: allData.length - eligibleData.length,
    violativeCreators: allData.filter(c => c.is_violative).length,
    totalBonusAmount: eligibleData.reduce((sum, c) => sum + (c.bonusAmount || 0), 0),
    totalDiamonds: eligibleData.reduce((sum, c) => sum + (c.diamond_earned || 0), 0),
  };
}
// --- End Bonus Logic ---

const BonusContent = () => {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bonusData, setBonusData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bonus calculations for the selected month/year
        const { data: bonuses, error: bonusError } = await supabase
          .from('bonus_calculations')
          .select(`*, creator:creators(username_tiktok)`)
          .eq('month', selectedMonth)
          .eq('year', selectedYear)
          .order('bonus_amount_idr', { ascending: false });
        if (bonusError) throw bonusError;
        setBonusData(bonuses || []);
        setSummary(calculateSummary(bonuses || [], (bonuses || []).filter(c => c.bonus_amount_idr > 0)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

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

      {/* Bonus Summary Section */}
      {summary && summary.totalCreators > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={`mb-8 p-6 rounded-xl shadow-md transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        >
          <h2 className="text-xl font-semibold mb-2">Bonus Summary</h2>
          <div className="flex flex-wrap gap-6 text-base">
            <div>Total Talents: <span className="font-bold">{summary.totalCreators}</span></div>
            <div>Eligible for Bonus: <span className="font-bold text-green-600 dark:text-green-400">{summary.eligibleCreators}</span></div>
            <div>Grade A: <span className="font-bold">{summary.gradeA}</span></div>
            <div>Grade B: <span className="font-bold">{summary.gradeB}</span></div>
            <div>Grade C: <span className="font-bold">{summary.gradeC}</span></div>
            <div>Not Qualified: <span className="font-bold text-red-500">{summary.notQualified}</span></div>
            <div>Total Bonus: <span className="font-bold text-meta-blue">Rp {summary.totalBonusAmount?.toLocaleString('id-ID')}</span></div>
          </div>
        </motion.section>
      )}

      {/* Bonus Table Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-md transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bonus Results</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={`p-2 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-white border-meta-gray-700' : 'bg-gray-100 text-meta-black border-gray-300'}`}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleDateString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className={`p-2 rounded-md border transition-colors duration-300 w-24 ${theme === 'dark' ? 'bg-meta-gray-800 text-white border-meta-gray-700' : 'bg-gray-100 text-meta-black border-gray-300'}`}
              min={2020}
              max={2100}
            />
          </div>
        </div>
        {bonusData.length > 0 ? (
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
                  <th className="py-3 px-4">Diamonds</th>
                  <th className="py-3 px-4">Valid Days</th>
                  <th className="py-3 px-4">Live Hours</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Bonus</th>
                  <th className="py-3 px-4">Status</th>
                </motion.tr>
              </thead>
              <tbody>
                {bonusData.map((row, index) => (
                  <motion.tr
                    key={row.id || index}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                    className={`border-b ${theme === 'dark' ? 'border-meta-gray-800' : 'border-gray-100'} ${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-4">{row.creator?.username_tiktok || '-'}</td>
                    <td className="py-3 px-4">{row.diamonds?.toLocaleString('id-ID') ?? '-'}</td>
                    <td className="py-3 px-4">{row.valid_days ?? '-'}</td>
                    <td className="py-3 px-4">{row.live_hours ?? '-'}</td>
                    <td className="py-3 px-4 font-bold text-meta-blue">{row.tier || '-'}</td>
                    <td className="py-3 px-4 font-bold text-green-600 dark:text-green-400">{row.bonus_amount_idr ? `Rp ${row.bonus_amount_idr.toLocaleString('id-ID')}` : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                        ${row.payment_status === 'paid' ? 'bg-green-100 text-green-700' : row.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {row.payment_status ? row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1) : '-'}
                      </span>
                    </td>
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
            No bonus data available for this month.
          </motion.p>
        )}
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