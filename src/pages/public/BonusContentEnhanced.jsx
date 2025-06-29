import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, RefreshCcw, Star, Trophy, Gift, TrendingUp, Info, Calculator, Clock, Image, Music, Book, User, Eye, EyeOff, Filter, X, ChevronDown, Medal, Calendar, Diamond, Timer, CheckCircle, AlertCircle } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import Button from '../../components/common/Button';

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

const calculateGrade = (validDays, liveHours) => {
  if (validDays >= gradeRequirements.A.days && liveHours >= gradeRequirements.A.hours) {
    return 'A';
  } else if (validDays >= gradeRequirements.B.days && liveHours >= gradeRequirements.B.hours) {
    return 'B';
  } else if (validDays >= gradeRequirements.C.days && liveHours >= gradeRequirements.C.hours) {
    return 'C';
  }
  return null;
};

function calculateSummary(allData, eligibleData) {
  return {
    totalCreators: allData.length,
    eligibleCreators: eligibleData.length,
    gradeA: eligibleData.filter(c => c.tier === 'A').length,
    gradeB: eligibleData.filter(c => c.tier === 'B').length,
    gradeC: eligibleData.filter(c => c.tier === 'C').length,
    notQualified: allData.length - eligibleData.length,
    violativeCreators: allData.filter(c => c.is_violative).length,
    totalBonusAmount: eligibleData.reduce((sum, c) => sum + (c.bonus_amount_idr || 0), 0),
    totalDiamonds: eligibleData.reduce((sum, c) => sum + (c.diamonds || 0), 0),
    averageDiamonds: eligibleData.length > 0 ? Math.round(eligibleData.reduce((sum, c) => sum + (c.diamonds || 0), 0) / eligibleData.length) : 0,
    averageValidDays: eligibleData.length > 0 ? Math.round(eligibleData.reduce((sum, c) => sum + (c.valid_days || 0), 0) / eligibleData.length) : 0,
    averageLiveHours: eligibleData.length > 0 ? Math.round(eligibleData.reduce((sum, c) => sum + (c.live_hours || 0), 0) / eligibleData.length) : 0,
    topPerformerBonus: eligibleData.length > 0 ? Math.max(...eligibleData.map(c => c.bonus_amount_idr || 0)) : 0,
  };
}

const BonusContentEnhanced = () => {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bonusData, setBonusData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [personalizedMode, setPersonalizedMode] = useState(false);
  const [foundTalent, setFoundTalent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Personal bonus calculator states
  const [calculatorData, setCalculatorData] = useState({
    diamonds: '',
    validDays: '',
    liveHours: ''
  });
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bonus calculations for the selected month/year
        const { data: bonuses, error: bonusError } = await supabase
          .from('bonus_calculations')
          .select(`*, creator:creators(username_tiktok, creator_id)`)
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

  // Filter and search bonus data
  const filteredBonusData = useMemo(() => {
    let filtered = bonusData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        (item.creator?.username_tiktok?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGrade = selectedGrade === 'all' || item.tier === selectedGrade;
      const matchesStatus = selectedStatus === 'all' || item.payment_status === selectedStatus;
      
      return matchesSearch && matchesGrade && matchesStatus;
    });

    return filtered;
  }, [bonusData, searchTerm, selectedGrade, selectedStatus]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBonusData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBonusData, currentPage]);

  const totalPages = Math.ceil(filteredBonusData.length / itemsPerPage);

  // Search for specific talent
  const handleTalentSearch = () => {
    if (!searchTerm.trim()) {
      setFoundTalent(null);
      setPersonalizedMode(false);
      return;
    }

    const talent = bonusData.find(item => 
      item.creator?.username_tiktok?.toLowerCase() === searchTerm.toLowerCase().trim()
    );

    if (talent) {
      setFoundTalent(talent);
      setPersonalizedMode(true);
    } else {
      setFoundTalent(null);
      setPersonalizedMode(false);
    }
  };

  // Personal bonus calculator
  const calculatePersonalBonus = () => {
    const { diamonds, validDays, liveHours } = calculatorData;
    
    if (!diamonds || !validDays || !liveHours) {
      alert('Please fill in all fields');
      return;
    }

    const grade = calculateGrade(parseInt(validDays), parseFloat(liveHours));
    const estimatedBonusUSD = parseFloat(diamonds) * 0.05; // Simplified calculation
    const exchangeRate = 16000;
    
    let bonusPercentage = 0;
    if (grade === 'A') bonusPercentage = 0.30;
    else if (grade === 'B') bonusPercentage = 0.25;
    else if (grade === 'C') bonusPercentage = 0.20;

    const bonusAmount = grade ? Math.ceil(estimatedBonusUSD * exchangeRate * bonusPercentage) : 0;

    setCalculatorResult({
      grade: grade || 'Not Eligible',
      bonusAmount,
      eligible: grade !== null,
      breakdown: grade ? 
        `Grade ${grade}: ${validDays} days, ${liveHours}h (${(bonusPercentage * 100)}% bonus)` :
        `Need ${gradeRequirements.C.days} days and ${gradeRequirements.C.hours} hours minimum`
    });
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGrade('all');
    setSelectedStatus('all');
    setPersonalizedMode(false);
    setFoundTalent(null);
    setCurrentPage(1);
  };

  // Get top performers for success stories
  const topPerformers = useMemo(() => {
    return bonusData
      .filter(item => item.bonus_amount_idr > 0)
      .sort((a, b) => b.bonus_amount_idr - a.bonus_amount_idr)
      .slice(0, 3);
  }, [bonusData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-meta-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-lg">Error: {error}</div>
          <Button onClick={() => window.location.reload()} variant="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full max-w-7xl mx-auto pt-24 px-4 py-8 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-meta-blue to-cyan-500 bg-clip-text text-transparent">
          Talent Bonus Dashboard
        </h1>
        <p className="text-lg text-meta-gray-600 dark:text-meta-gray-400 mb-8">
          Track your performance and bonus earnings
        </p>
      </motion.div>

      {/* Personal Talent Search Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-meta-blue" />
          <h2 className="text-xl font-semibold">Find Your Bonus</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Talent Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search by Username</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-meta-gray-400" />
              <input
                type="text"
                placeholder="Enter your TikTok username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTalentSearch()}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-meta-blue focus:border-meta-blue ${
                  theme === 'dark' 
                    ? 'bg-meta-gray-800 border-meta-gray-700 text-white placeholder-meta-gray-400' 
                    : 'bg-white border-gray-200 text-meta-black placeholder-meta-gray-500'
                }`}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleTalentSearch} variant="primary" className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Find My Bonus
              </Button>
              {(personalizedMode || searchTerm) && (
                <Button onClick={clearFilters} variant="secondary">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Calculator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Bonus Calculator</label>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-sm text-meta-blue hover:underline"
              >
                {showCalculator ? 'Hide' : 'Show'} Calculator
              </button>
            </div>
            
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Diamonds"
                    value={calculatorData.diamonds}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, diamonds: e.target.value }))}
                    className={`p-2 rounded border text-sm ${
                      theme === 'dark' 
                        ? 'bg-meta-gray-800 border-meta-gray-700 text-white' 
                        : 'bg-white border-gray-200 text-meta-black'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Valid Days"
                    value={calculatorData.validDays}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, validDays: e.target.value }))}
                    className={`p-2 rounded border text-sm ${
                      theme === 'dark' 
                        ? 'bg-meta-gray-800 border-meta-gray-700 text-white' 
                        : 'bg-white border-gray-200 text-meta-black'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Live Hours"
                    value={calculatorData.liveHours}
                    onChange={(e) => setCalculatorData(prev => ({ ...prev, liveHours: e.target.value }))}
                    className={`p-2 rounded border text-sm ${
                      theme === 'dark' 
                        ? 'bg-meta-gray-800 border-meta-gray-700 text-white' 
                        : 'bg-white border-gray-200 text-meta-black'
                    }`}
                  />
                </div>
                <Button onClick={calculatePersonalBonus} variant="primary" size="sm" className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Bonus
                </Button>
                
                {calculatorResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      calculatorResult.eligible 
                        ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                        : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {calculatorResult.eligible 
                          ? `Rp ${calculatorResult.bonusAmount.toLocaleString('id-ID')}`
                          : 'Not Eligible'
                        }
                      </div>
                      <div className="text-sm">Grade: {calculatorResult.grade}</div>
                      <div className="text-xs mt-1 opacity-80">{calculatorResult.breakdown}</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Personalized Talent View */}
      {personalizedMode && foundTalent && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-8 p-6 rounded-xl shadow-lg bg-gradient-to-br from-meta-blue to-cyan-500 text-white`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">@{foundTalent.creator?.username_tiktok}</h2>
              <p className="text-white/80">Your Performance This Month</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Diamond className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">{foundTalent.diamonds?.toLocaleString('id-ID') || 0}</div>
              <div className="text-white/80 text-sm">Diamonds</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">{foundTalent.valid_days || 0}</div>
              <div className="text-white/80 text-sm">Valid Days</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Timer className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">{foundTalent.live_hours || 0}h</div>
              <div className="text-white/80 text-sm">Live Hours</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Medal className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">
                {foundTalent.bonus_amount_idr ? `Rp ${foundTalent.bonus_amount_idr.toLocaleString('id-ID')}` : 'No Bonus'}
              </div>
              <div className="text-white/80 text-sm">Grade {foundTalent.tier || 'N/A'} Bonus</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Payment Status</div>
                <div className="text-white/80 text-sm">Current status of your bonus payment</div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                foundTalent.payment_status === 'paid' 
                  ? 'bg-green-500 text-white'
                  : foundTalent.payment_status === 'pending'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-red-500 text-white'
              }`}>
                {foundTalent.payment_status?.charAt(0).toUpperCase() + foundTalent.payment_status?.slice(1) || 'Unknown'}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Search Result Message */}
      {personalizedMode && !foundTalent && searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-6 rounded-xl text-center ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Talent Not Found</h3>
          <p className="text-meta-gray-600 dark:text-meta-gray-400 mb-4">
            Username "{searchTerm}" not found in this month's bonus data.
          </p>
          <div className="text-sm text-meta-gray-500 dark:text-meta-gray-400">
            • Make sure you entered the correct username<br/>
            • Check if you have bonus data for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}<br/>
            • Contact support if you believe this is an error
          </div>
        </motion.div>
      )}

      {/* Month/Year Selection */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Bonus Period</h2>
            <p className="text-sm text-meta-gray-600 dark:text-meta-gray-400">
              Select month and year to view bonus data
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={`p-3 rounded-lg border transition-colors duration-300 ${theme === 'dark' ? 'bg-meta-gray-800 text-white border-meta-gray-700' : 'bg-gray-50 text-meta-black border-gray-300'}`}
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
              className={`p-3 rounded-lg border transition-colors duration-300 w-24 ${theme === 'dark' ? 'bg-meta-gray-800 text-white border-meta-gray-700' : 'bg-gray-50 text-meta-black border-gray-300'}`}
              min={2020}
              max={2100}
            />
          </div>
        </div>
      </motion.section>

      {/* Bonus Summary Section */}
      {summary && summary.totalCreators > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        >
          <h2 className="text-xl font-semibold mb-6">Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Statistics */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalCreators}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Talents</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.eligibleCreators}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Eligible for Bonus</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                Rp {summary.totalBonusAmount?.toLocaleString('id-ID') || 0}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Total Bonus</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                Rp {summary.topPerformerBonus?.toLocaleString('id-ID') || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Top Bonus</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold">Grade A: {summary.gradeA}</div>
              <div className="text-sm text-meta-gray-600 dark:text-meta-gray-400">Top Performers</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold">Grade B: {summary.gradeB}</div>
              <div className="text-sm text-meta-gray-600 dark:text-meta-gray-400">Good Performers</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold">Grade C: {summary.gradeC}</div>
              <div className="text-sm text-meta-gray-600 dark:text-meta-gray-400">Standard Performers</div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Success Stories Section */}
      {topPerformers.length > 0 && !personalizedMode && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🏆 Top Performers This Month</h2>
            <p className="text-lg text-meta-gray-600 dark:text-meta-gray-400">
              Congratulations to our highest earning talents!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformers.map((performer, index) => (
              <motion.div
                key={performer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative bg-gradient-to-br from-meta-blue to-cyan-500 rounded-xl p-6 text-white overflow-hidden"
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  #{index + 1}
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/10 rounded-full" />
                
                {/* Creator Info */}
                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">@{performer.creator?.username_tiktok}</h3>
                    <p className="text-white/80">Grade {performer.tier} Creator</p>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Diamonds:</span>
                      <span className="font-bold">{performer.diamonds?.toLocaleString('id-ID') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid Days:</span>
                      <span className="font-bold">{performer.valid_days || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Live Hours:</span>
                      <span className="font-bold">{performer.live_hours || 0}h</span>
                    </div>
                  </div>
                  
                  {/* Bonus Amount */}
                  <div className="pt-4 border-t border-white/20 text-center">
                    <div className="text-2xl font-bold">
                      Rp {performer.bonus_amount_idr?.toLocaleString('id-ID') || 0}
                    </div>
                    <div className="text-white/80 text-sm">Monthly Bonus</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Filter and Search Section for All Data */}
      {!personalizedMode && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Bonus Data</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-meta-gray-800 border-meta-gray-700 text-white hover:bg-meta-gray-700'
                  : 'bg-gray-50 border-gray-200 text-meta-black hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Search Username</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-meta-gray-400" />
                  <input
                    type="text"
                    placeholder="Search usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-meta-gray-800 border-meta-gray-700 text-white'
                        : 'bg-white border-gray-200 text-meta-black'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className={`w-full p-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-meta-gray-800 border-meta-gray-700 text-white'
                      : 'bg-white border-gray-200 text-meta-black'
                  }`}
                >
                  <option value="all">All Grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full p-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-meta-gray-800 border-meta-gray-700 text-white'
                      : 'bg-white border-gray-200 text-meta-black'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
            </motion.div>
          )}
          
          <div className="text-sm text-meta-gray-500 dark:text-meta-gray-400">
            Showing {filteredBonusData.length} of {bonusData.length} entries
          </div>
        </motion.section>
      )}

      {/* Bonus Data Table */}
      {!personalizedMode && bonusData.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={`mb-8 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-sm font-semibold ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} border-b ${theme === 'dark' ? 'border-meta-gray-700' : 'border-gray-200'}`}>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Diamonds</th>
                  <th className="py-3 px-4">Valid Days</th>
                  <th className="py-3 px-4">Live Hours</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Bonus</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <motion.tr
                      key={row.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b ${theme === 'dark' ? 'border-meta-gray-800' : 'border-gray-100'} ${theme === 'dark' ? 'hover:bg-meta-gray-800' : 'hover:bg-gray-50'} transition-colors duration-200`}
                    >
                      <td className="py-3 px-4 font-bold text-meta-blue">#{actualIndex}</td>
                      <td className="py-3 px-4 font-medium">{row.creator?.username_tiktok || '-'}</td>
                      <td className="py-3 px-4">{row.diamonds?.toLocaleString('id-ID') || '-'}</td>
                      <td className="py-3 px-4">{row.valid_days || '-'}</td>
                      <td className="py-3 px-4">{row.live_hours || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          row.tier === 'A' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          row.tier === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          row.tier === 'C' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {row.tier || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600 dark:text-green-400">
                        {row.bonus_amount_idr ? `Rp ${row.bonus_amount_idr.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          row.payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                          row.payment_status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          row.payment_status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {row.payment_status ? row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1) : 'Pending'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-meta-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </motion.section>
      )}

      {/* No Data Message */}
      {bonusData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Gift className="w-16 h-16 text-meta-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Bonus Data Available</h3>
          <p className="text-meta-gray-500 dark:text-meta-gray-400">
            No bonus data found for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      )}

     
    </motion.div>
  );
};

export default BonusContentEnhanced;