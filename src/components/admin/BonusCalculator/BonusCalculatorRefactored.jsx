import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase, findOrCreateCreator } from '../../../lib/supabase';
import { Calculator, Download, Copy, CheckCircle, AlertCircle, Users, Trophy, Settings, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import useAuthStore from '../../../store/authStore';
import Tooltip from '../../common/Tooltip';
import CompactCard from '../CompactCard';
import CompactTable from '../CompactTable';
import UploadSection from './UploadSection';
import SummaryStats from './SummaryStats';
import ActionButtons from './ActionButtons';
import CreatorsTable from './CreatorsTable';

Chart.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const BonusCalculatorRefactored = ({ onCalculationComplete }) => {
  // Core state
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [eligibleCreators, setEligibleCreators] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [dollarRate, setDollarRate] = useState(16000);
  const [debugInfo, setDebugInfo] = useState(null);

  // UI state
  const [showBonusTable, setShowBonusTable] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bulkCopyMode, setBulkCopyMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [highlightedRows, setHighlightedRows] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Status management
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');
  const [showStatusMsg, setShowStatusMsg] = useState(true);

  // Rules management
  const [gradeRequirements, setGradeRequirements] = useState({
    A: { days: 22, hours: 100 },
    B: { days: 20, hours: 60 },
    C: { days: 15, hours: 40 }
  });
  const [bonusTable, setBonusTable] = useState({
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
  });
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState('');
  const [rulesError, setRulesError] = useState('');

  // Audit and history
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(null);

  // Notes management
  const [adminNotes, setAdminNotes] = useState('');
  const [editNotesId, setEditNotesId] = useState(null);
  const [editNotesValue, setEditNotesValue] = useState('');
  const [editNotesLoading, setEditNotesLoading] = useState(false);

  const { profile } = useAuthStore();
  const selectAllRef = useRef();

  // Memoized computations
  const filteredCreators = useMemo(() => 
    eligibleCreators.filter(c =>
      (filterStatus === 'all' || c.paymentStatus === filterStatus) &&
      (filterGrade === 'all' || c.grade === filterGrade) &&
      (filterSearch === '' || c.username.toLowerCase().includes(filterSearch.toLowerCase()))
    ), [eligibleCreators, filterStatus, filterGrade, filterSearch]
  );

  const totalPages = useMemo(() => 
    Math.ceil(filteredCreators.length / pageSize), [filteredCreators.length]
  );

  const paginatedCreators = useMemo(() => 
    filteredCreators.slice((currentPage - 1) * pageSize, currentPage * pageSize), 
    [filteredCreators, currentPage]
  );

  const filteredAuditLog = useMemo(() => 
    auditLog.filter(log =>
      (filterStatus === 'all' || log.new_status === filterStatus) &&
      (filterGrade === 'all' || (log.creator?.grade === filterGrade || log.grade === filterGrade)) &&
      (filterSearch === '' || (log.creator?.username_tiktok || '').toLowerCase().includes(filterSearch.toLowerCase()))
    ), [auditLog, filterStatus, filterGrade, filterSearch]
  );

  // Bonus calculation logic
  const calculateBonuses = useCallback((data) => {
    return data.map(creator => {
      if (creator.isViolative) {
        return { ...creator, qualified: false, breakdown: 'Disqualified (violative)' };
      }
      
      let grade = null;
      let breakdown = '';
      let percentage = 0;
      
      if (
        creator.validDays >= (gradeRequirements.A?.days || 0) &&
        creator.liveHours >= (gradeRequirements.A?.hours || 0)
      ) {
        grade = 'A';
        percentage = 0.3;
        breakdown = `A Grade: ${creator.validDays} days, ${creator.liveHours} hours`;
      } else if (
        creator.validDays >= (gradeRequirements.B?.days || 0) &&
        creator.liveHours >= (gradeRequirements.B?.hours || 0)
      ) {
        grade = 'B';
        percentage = 0.25;
        breakdown = `B Grade: ${creator.validDays} days, ${creator.liveHours} hours`;
      } else if (
        creator.validDays >= (gradeRequirements.C?.days || 0) &&
        creator.liveHours >= (gradeRequirements.C?.hours || 0)
      ) {
        grade = 'C';
        percentage = 0.2;
        breakdown = `C Grade: ${creator.validDays} days, ${creator.liveHours} hours`;
      }
      
      if (!grade) {
        return { ...creator, qualified: false, breakdown: 'Not enough days/hours', grade: '-', percentage: 0, bonusAmount: 0 };
      }
      
      const estimatedBonusUSD = creator.estimatedBonus || creator.estimated_bonus || 0;
      const estimatedBonusLocal = estimatedBonusUSD * dollarRate;
      const bonusAmount = Math.ceil(estimatedBonusLocal * percentage);
      
      return {
        ...creator,
        grade,
        percentage,
        qualified: true,
        breakdown: breakdown,
        estimatedBonusUSD,
        estimatedBonusLocal,
        bonusAmount,
        paymentStatus: 'pending',
      };
    });
  }, [gradeRequirements, dollarRate]);

  // Summary calculation
  const calculateSummary = useCallback((allData, eligibleData) => {
    const summary = {
      totalCreators: allData.length,
      eligibleCreators: eligibleData.length,
      gradeA: eligibleData.filter(c => c.grade === 'A').length,
      gradeB: eligibleData.filter(c => c.grade === 'B').length,
      gradeC: eligibleData.filter(c => c.grade === 'C').length,
      notQualified: allData.length - eligibleData.length,
      violativeCreators: allData.filter(c => c.isViolative).length,
      totalBonusAmount: eligibleData.reduce((sum, c) => sum + c.bonusAmount, 0),
      totalDiamonds: eligibleData.reduce((sum, c) => sum + c.diamonds, 0),
    };
    setSummary(summary);
  }, []);

  // File upload handler
  const handleTaskUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setEligibleCreators([]);
    setCopiedIndex(null);
    setUploadError('');
    
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (!jsonData.length) throw new Error('File is empty or format is invalid.');
      
      const processedData = jsonData
        .filter(row => row['Creator Network manager'] === 'Metaagencyid')
        .filter(row => parseFloat(row['Estimated bonus']) >= 5)
        .map(row => {
          if (!row['Creator ID'] || !row['Creator nickname']) throw new Error('Missing required columns.');
          return {
            creatorId: row['Creator ID'] || '',
            username: row['Creator nickname'] || '',
            handle: row['Handle'] || '',
            isViolative: row['Is violative creators'] === true || row['Is violative creators'] === 'true',
            diamonds: parseInt(row['Diamonds']) || 0,
            validDays: parseInt(row['Valid days(d)']) || 0,
            liveHours: parseFloat(row['LIVE duration(h)']) || 0,
            estimatedBonus: parseFloat(row['Estimated bonus']) || 0,
            networkManager: row['Creator Network manager'] || '',
          };
        });
      
      setAllData(processedData);
      setDebugInfo({
        sample: processedData.slice(0, 5),
        total: processedData.length,
        columns: Object.keys(processedData[0] || {})
      });
      
      const allZeroBonus = processedData.every(row => !row.estimatedBonus || row.estimatedBonus === 0);
      const calculatedData = calculateBonuses(processedData);
      const eligible = calculatedData.filter(c => c.qualified && c.bonusAmount > 0);
      
      setEligibleCreators(eligible);
      calculateSummary(processedData, eligible);
      setShowChart(true);
      
      if (eligible.length === 0) {
        let msg = 'No creators qualified for bonus this month.';
        if (allZeroBonus) msg += ' (All estimated bonuses are zero. Please check your Excel data and column mapping.)';
        setUploadError(msg);
      }
    } catch (error) {
      console.error('Error processing Task file:', error);
      setUploadError(error.message || 'Error processing file. Please check the format.');
    } finally {
      setLoading(false);
    }
  }, [calculateBonuses, calculateSummary]);

  // Action handlers
  const handleSaveToDatabase = useCallback(async () => {
    if (eligibleCreators.length === 0) {
      alert('No eligible creators to save.');
      return;
    }
    setLoading(true);
    let savedCount = 0;
    
    for (const creator of eligibleCreators) {
      try {
        // Use centralized creator management
        const { creator: dbCreator, error: creatorError } = await findOrCreateCreator({
          creator_id: creator.creatorId,
          username_tiktok: creator.username,
          graduation_status: creator.graduationStatus || null
        });
        
        if (creatorError) {
          console.error(`Error managing creator ${creator.username}:`, creatorError);
          continue;
        }
        
        if (!dbCreator) {
          console.error(`Failed to get/create creator for ${creator.username}`);
          continue;
        }
        
        // Save bonus calculation using the consistent creator ID
        const { error } = await supabase
          .from('bonus_calculations')
          .upsert({
            creator_id: dbCreator.id, // Use the consistent database ID
            month: selectedMonth,
            year: selectedYear,
            diamonds: creator.diamonds,
            valid_days: creator.validDays,
            live_hours: creator.liveHours,
            tier: creator.grade,
            bonus_amount_idr: creator.bonusAmount,
            payment_status: creator.paymentStatus,
            notes: `Grade ${creator.grade} bonus approved`
          });
        
        if (!error) {
          savedCount++;
          console.log(`✅ Saved bonus for ${creator.username} (TikTok ID: ${creator.creatorId})`);
        } else {
          console.error(`Error saving bonus for ${creator.username}:`, error);
        }
      } catch (error) {
        console.error(`Error processing ${creator.username}:`, error);
      }
    }
    
    // Save to history
    await supabase.from('bonus_calculation_history').insert({
      month: selectedMonth,
      year: selectedYear,
      rules_snapshot: { gradeRequirements, bonusTable },
      summary,
      eligible_creators: eligibleCreators,
      notes: adminNotes,
      created_at: new Date().toISOString(),
      created_by: profile?.id || null,
    });
    
    setLoading(false);
    setAdminNotes('');
    alert(`Successfully saved ${savedCount} bonus calculations!`);
    
    // Mark step as completed in navigation
    if (onCalculationComplete) {
      onCalculationComplete();
    }
  }, [eligibleCreators, selectedMonth, selectedYear, gradeRequirements, bonusTable, summary, adminNotes, profile]);

  const handleExportExcel = useCallback(async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    
    const eligibleData = eligibleCreators.map((creator, index) => ({
      'No': index + 1,
      'Username': creator.username,
      'Valid Days': creator.validDays,
      'Live Hours': creator.liveHours.toFixed(1),
      'Coins/Diamonds': creator.diamonds.toLocaleString('id-ID'),
      'Grade': creator.grade,
      'Bonus Amount': `Rp ${creator.bonusAmount.toLocaleString('id-ID')}`,
      'Payment Status': 'PENDING',
      'Payment Date': `25 ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
    }));
    
    const summaryData = [
      { 'Metric': 'Total Creators Processed', 'Value': summary.totalCreators },
      { 'Metric': 'Eligible for Bonus', 'Value': summary.eligibleCreators },
      { 'Metric': 'Grade A', 'Value': summary.gradeA },
      { 'Metric': 'Grade B', 'Value': summary.gradeB },
      { 'Metric': 'Grade C', 'Value': summary.gradeC },
      { 'Metric': 'Not Qualified', 'Value': summary.notQualified },
      { 'Metric': 'Total Bonus Amount', 'Value': `Rp ${summary.totalBonusAmount.toLocaleString('id-ID')}` },
      { 'Metric': 'Payment Date', 'Value': `25 ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` }
    ];
    
    const ws1 = XLSX.utils.json_to_sheet(eligibleData);
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, `Eligible Bonus ${selectedMonth}-${selectedYear}`);
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
    XLSX.writeFile(wb, `Bonus_Eligible_${selectedMonth}_${selectedYear}.xlsx`);
  }, [eligibleCreators, summary, selectedMonth, selectedYear]);

  const generateWhatsAppMessage = useCallback((creator) => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return `💰 *SELAMAT! BONUS ${monthName.toUpperCase()}*\n\nHalo *${creator.username}*! 🎉\n\nKamu mendapat bonus Grade *${creator.grade}*!\n\n📊 *Performa Kamu:*\n• Valid Days: ${creator.validDays} hari ✅\n• Live Hours: ${creator.liveHours.toFixed(1)} jam ✅\n• Total Coins: ${creator.diamonds.toLocaleString('id-ID')} 💎\n\n💵 *BONUS: Rp ${creator.bonusAmount.toLocaleString('id-ID')}*\n\nTransfer tanggal 25 ${monthName}.\n\nKeep up the great work! 🚀\n_SIM Management_`;
  }, [selectedMonth, selectedYear]);

  const handleCopyMessage = useCallback((creator, index) => {
    const message = generateWhatsAppMessage(creator);
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [generateWhatsAppMessage]);

  const handleCopyAllMessages = useCallback(() => {
    const allMessages = eligibleCreators
      .map(creator => generateWhatsAppMessage(creator))
      .join('\n\n➖➖➖➖➖➖➖➖➖➖\n\n');
    navigator.clipboard.writeText(allMessages);
    setBulkCopyMode(true);
    setTimeout(() => setBulkCopyMode(false), 2000);
  }, [eligibleCreators, generateWhatsAppMessage]);

  const handleCopyByGrade = useCallback((grade) => {
    const gradeMessages = eligibleCreators
      .filter(c => c.grade === grade)
      .map(creator => generateWhatsAppMessage(creator))
      .join('\n\n➖➖➖➖➖➖➖➖➖➖\n\n');
    navigator.clipboard.writeText(gradeMessages);
    alert(`Copied ${eligibleCreators.filter(c => c.grade === grade).length} Grade ${grade} messages!`);
  }, [eligibleCreators, generateWhatsAppMessage]);

  // Table handlers
  const handleSelectRow = useCallback((creatorId) => {
    setSelectedRows((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === eligibleCreators.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(eligibleCreators.map((c) => c.creatorId));
    }
  }, [selectedRows.length, eligibleCreators]);

  const handleStatusChange = useCallback(async (creatorId, status) => {
    const creator = eligibleCreators.find((c) => c.creatorId === creatorId);
    if (!creator || creator.paymentStatus === status) return;
    
    setEligibleCreators((prev) =>
      prev.map((c) =>
        c.creatorId === creatorId ? { ...c, paymentStatus: status } : c
      )
    );
    setHighlightedRows((prev) => [...prev, creatorId]);
    setTimeout(() => setHighlightedRows((prev) => prev.filter(id => id !== creatorId)), 1200);
    
    // Update in database
    try {
      const { data: dbCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('creator_id', creator.creatorId)
        .single();
      
      if (dbCreator) {
        await supabase
          .from('bonus_calculations')
          .update({ payment_status: status })
          .eq('creator_id', dbCreator.id)
          .eq('month', selectedMonth)
          .eq('year', selectedYear);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, [eligibleCreators, selectedMonth, selectedYear]);

  const handleBulkStatusUpdate = useCallback((status) => {
    setPendingBulkStatus(status);
    setShowConfirm(true);
  }, []);

  const confirmBulkStatusUpdate = useCallback(async () => {
    setShowConfirm(false);
    setStatusLoading(true);
    
    for (const creator of eligibleCreators) {
      if (selectedRows.includes(creator.creatorId) && creator.paymentStatus !== pendingBulkStatus) {
        await handleStatusChange(creator.creatorId, pendingBulkStatus);
      }
    }
    
    setSelectedRows([]);
    setStatusLoading(false);
  }, [eligibleCreators, selectedRows, pendingBulkStatus, handleStatusChange]);

  const cancelBulkStatusUpdate = useCallback(() => {
    setShowConfirm(false);
    setPendingBulkStatus('');
  }, []);

  // Rules management functions
  const handleGradeRequirementChange = useCallback((grade, field, value) => {
    setGradeRequirements(prev => ({
      ...prev,
      [grade]: {
        ...prev[grade],
        [field]: parseInt(value) || 0
      }
    }));
  }, []);

  const handleBonusTableChange = useCallback((grade, index, field, value) => {
    setBonusTable(prev => ({
      ...prev,
      [grade]: prev[grade].map((tier, idx) => 
        idx === index 
          ? { ...tier, [field]: parseInt(value) || 0 }
          : tier
      )
    }));
  }, []);

  const saveRules = useCallback(async () => {
    setRulesLoading(true);
    setRulesError('');
    setRulesSuccess('');
    
    try {
      const rulesData = {
        grade_requirements: gradeRequirements,
        bonus_table: bonusTable,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('bonus_rules')
        .upsert(rulesData);
        
      if (error) throw error;
      
      setRulesSuccess('Rules saved successfully!');
      setTimeout(() => setRulesSuccess(''), 3000);
    } catch (error) {
      setRulesError('Failed to save rules: ' + error.message);
      setTimeout(() => setRulesError(''), 5000);
    } finally {
      setRulesLoading(false);
    }
  }, [gradeRequirements, bonusTable]);

  const handleClearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  // Effects
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCreators]);

  useEffect(() => {
    if (statusSuccess) {
      setTimeout(() => setStatusSuccess(''), 2000);
    }
  }, [statusSuccess]);

  return (
    <>
      {/* Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CompactCard title="Settings" compact>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dollar Rate</label>
              <Input
                type="number"
                min="1"
                value={dollarRate}
                onChange={e => setDollarRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>
        </CompactCard>

        {/* Upload Section */}
        <div className="lg:col-span-2">
          <CompactCard title="Upload Task Excel" compact>
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <label className="cursor-pointer block">
                <div className="text-center">
                  <Calculator className="mx-auto mb-2 text-gray-400" size={32} />
                  <span className="text-sm font-medium">Upload Task Excel from TikTok Backstage</span>
                  <p className="text-xs text-gray-500 mt-1">Only eligible creators will be shown</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleTaskUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            {uploadError && (
              <div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-xs">{uploadError}</div>
            )}
          </CompactCard>
        </div>
      </div>

      {/* Summary Stats */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border">
            <Users className="text-blue-600 mb-1" size={20} />
            <div className="text-xl font-bold">{summary.totalCreators}</div>
            <div className="text-xs text-gray-600">Total Processed</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>A:</span>
                <span className="font-bold">{summary.gradeA}</span>
              </div>
              <div className="flex justify-between">
                <span>B:</span>
                <span className="font-bold">{summary.gradeB}</span>
              </div>
              <div className="flex justify-between">
                <span>C:</span>
                <span className="font-bold">{summary.gradeC}</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border">
            <div className="text-lg font-bold">
              Rp {summary.totalBonusAmount.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-600">Total Bonus</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {eligibleCreators.length > 0 && (
        <CompactCard title="Actions" compact>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveToDatabase} variant="success" loading={loading} size="sm">
              <CheckCircle size={16} /> Save to DB
            </Button>
            <Button onClick={handleExportExcel} variant="primary" size="sm">
              <Download size={16} /> Export Excel
            </Button>
            <Button onClick={() => handleCopyByGrade('A')} variant="primary" size="sm" disabled={summary.gradeA === 0}>
              Copy Grade A ({summary.gradeA})
            </Button>
            <Button onClick={handleCopyAllMessages} variant={bulkCopyMode ? 'success' : 'secondary'} size="sm">
              <Copy size={16} /> {bulkCopyMode ? 'Copied All!' : 'Copy All Messages'}
            </Button>
          </div>
        </CompactCard>
      )}

      {/* Creators Table */}
      {eligibleCreators.length > 0 && (
        <CompactCard 
          title={`Eligible Creators (${eligibleCreators.length})`} 
          compact
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded text-sm">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="p-2 border rounded text-sm">
                <option value="all">All Grades</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <input 
                type="text" 
                value={filterSearch} 
                onChange={e => setFilterSearch(e.target.value)} 
                placeholder="Search username..." 
                className="p-2 border rounded text-sm" 
              />
            </div>

            {/* Table */}
            <CompactTable compact>
              <CompactTable.Head>
                <CompactTable.Row>
                  <CompactTable.Header><input type="checkbox" ref={selectAllRef} checked={selectedRows.length === eligibleCreators.length && eligibleCreators.length > 0} onChange={handleSelectAll} /></CompactTable.Header>
                  <CompactTable.Header>No</CompactTable.Header>
                  <CompactTable.Header>Username</CompactTable.Header>
                  <CompactTable.Header>Performance</CompactTable.Header>
                  <CompactTable.Header>Coins</CompactTable.Header>
                  <CompactTable.Header>Grade</CompactTable.Header>
                  <CompactTable.Header>Bonus</CompactTable.Header>
                  <CompactTable.Header>WhatsApp</CompactTable.Header>
                  <CompactTable.Header>Status</CompactTable.Header>
                </CompactTable.Row>
              </CompactTable.Head>
              <CompactTable.Body>
                {paginatedCreators.map((creator, idx) => (
                  <CompactTable.Row key={creator.creatorId || idx} className={highlightedRows.includes(creator.creatorId) ? 'bg-green-50 animate-pulse' : ''}>
                    <CompactTable.Cell><input type="checkbox" checked={selectedRows.includes(creator.creatorId)} onChange={() => handleSelectRow(creator.creatorId)} /></CompactTable.Cell>
                    <CompactTable.Cell>{(currentPage - 1) * pageSize + idx + 1}</CompactTable.Cell>
                    <CompactTable.Cell className="font-medium">{creator.username}</CompactTable.Cell>
                    <CompactTable.Cell>
                      <div className="text-xs">
                        <div>📅 {creator.validDays}d</div>
                        <div>⏱️ {creator.liveHours.toFixed(1)}h</div>
                      </div>
                    </CompactTable.Cell>
                    <CompactTable.Cell className="font-medium">{creator.diamonds.toLocaleString('id-ID')}</CompactTable.Cell>
                    <CompactTable.Cell className="font-semibold">{creator.grade}</CompactTable.Cell>
                    <CompactTable.Cell className="font-bold text-green-600">Rp {creator.bonusAmount?.toLocaleString('id-ID')}</CompactTable.Cell>
                    <CompactTable.Cell>
                      <Button
                        onClick={() => handleCopyMessage(creator, idx)}
                        variant={copiedIndex === idx ? 'success' : 'primary'}
                        size="sm"
                        className="text-xs"
                      >
                        {copiedIndex === idx ? <CheckCircle size={12} /> : <Copy size={12} />}
                        {copiedIndex === idx ? 'Copied!' : 'Copy'}
                      </Button>
                    </CompactTable.Cell>
                    <CompactTable.Cell>
                      <select value={creator.paymentStatus} onChange={e => handleStatusChange(creator.creatorId, e.target.value)} className="border rounded p-1 text-xs">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </CompactTable.Cell>
                  </CompactTable.Row>
                ))}
              </CompactTable.Body>
            </CompactTable>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded disabled:opacity-50 text-sm">Prev</button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 border rounded disabled:opacity-50 text-sm">Next</button>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="font-medium text-sm">{selectedRows.length} selected</span>
                <Button onClick={() => handleBulkStatusUpdate('paid')} size="sm" variant="success">Mark as Paid</Button>
                <Button onClick={() => handleBulkStatusUpdate('pending')} size="sm" variant="secondary">Mark as Pending</Button>
                <Button onClick={() => handleBulkStatusUpdate('failed')} size="sm" variant="danger">Mark as Failed</Button>
                <Button onClick={() => setSelectedRows([])} size="sm" variant="secondary">Clear</Button>
              </div>
            )}
          </div>
        </CompactCard>
      )}

      {/* Rules Editor */}
      <CompactCard 
        title="Bonus Rules (Editable)" 
        compact
        collapsible
        defaultCollapsed={true}
        actions={
          <Button onClick={saveRules} size="sm" variant="primary" loading={rulesLoading}>
            Save Rules
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['A','B','C'].map(grade => (
            <div key={grade} className="bg-gray-50 p-3 rounded">
              <div className="font-bold mb-2">Grade {grade}</div>
              <div className="flex gap-2 mb-2">
                <label className="text-xs">Days: <input type="number" className="w-12 border rounded p-1 text-xs" value={gradeRequirements[grade].days} onChange={e => handleGradeRequirementChange(grade, 'days', e.target.value)} /></label>
                <label className="text-xs">Hours: <input type="number" className="w-12 border rounded p-1 text-xs" value={gradeRequirements[grade].hours} onChange={e => handleGradeRequirementChange(grade, 'hours', e.target.value)} /></label>
              </div>
              <table className="w-full text-xs">
                <thead><tr><th>Coins</th><th>Bonus</th></tr></thead>
                <tbody>
                  {bonusTable[grade].map((tier, idx) => (
                    <tr key={idx}>
                      <td><input type="number" className="w-12 border rounded p-1 text-xs" value={tier.minCoins} onChange={e => handleBonusTableChange(grade, idx, 'minCoins', e.target.value)} /></td>
                      <td><input type="number" className="w-12 border rounded p-1 text-xs" value={tier.bonus} onChange={e => handleBonusTableChange(grade, idx, 'bonus', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        {rulesSuccess && <div className="mt-2 text-green-600 text-sm">{rulesSuccess}</div>}
        {rulesError && <div className="mt-2 text-red-600 text-sm">{rulesError}</div>}
      </CompactCard>

      {/* Admin Notes */}
      <CompactCard title="Admin Notes" compact>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          placeholder="Add any notes or context for this bonus calculation..."
          className="w-full p-2 border rounded text-sm min-h-[60px]"
        />
      </CompactCard>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h4 className="font-bold mb-2">Confirm Bulk Status Change</h4>
            <p className="mb-4 text-sm">Are you sure you want to mark {selectedRows.length} creators as <span className="font-bold text-blue-600">{pendingBulkStatus}</span>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelBulkStatusUpdate} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancel</button>
              <button onClick={confirmBulkStatusUpdate} className="px-3 py-1 rounded bg-blue-500 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BonusCalculatorRefactored; 