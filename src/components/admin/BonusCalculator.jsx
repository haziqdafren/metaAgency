import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Calculator, Download, Copy, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../common/Input';
import Button from '../common/Button';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import useAuthStore from '../../store/authStore';
import Tooltip from '../common/Tooltip';
Chart.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const BonusCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [eligibleCreators, setEligibleCreators] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});
  const [showBonusTable, setShowBonusTable] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bulkCopyMode, setBulkCopyMode] = useState(false);
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
  const [uploadError, setUploadError] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const selectAllRef = useRef();
  const { profile } = useAuthStore();
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [highlightedRows, setHighlightedRows] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] = useState('');
  const [showStatusMsg, setShowStatusMsg] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState('');
  const [rulesError, setRulesError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [editNotesId, setEditNotesId] = useState(null);
  const [editNotesValue, setEditNotesValue] = useState('');
  const [editNotesLoading, setEditNotesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [dollarRate, setDollarRate] = useState(16000);
  const [debugInfo, setDebugInfo] = useState(null);
  const filteredCreators = eligibleCreators.filter(c =>
    (filterStatus === 'all' || c.paymentStatus === filterStatus) &&
    (filterGrade === 'all' || c.grade === filterGrade) &&
    (filterSearch === '' || c.username.toLowerCase().includes(filterSearch.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredCreators.length / pageSize);
  const paginatedCreators = filteredCreators.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filteredAuditLog = auditLog.filter(log =>
    (filterStatus === 'all' || log.new_status === filterStatus) &&
    (filterGrade === 'all' || (log.creator?.grade === filterGrade || log.grade === filterGrade)) &&
    (filterSearch === '' || (log.creator?.username_tiktok || '').toLowerCase().includes(filterSearch.toLowerCase()))
  );

  const handleTaskUpload = async (e) => {
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
      // Debug: show sample of processed creators
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
  };

  const calculateBonuses = (data) => {
    return data.map(creator => {
      if (creator.isViolative) {
        return { ...creator, qualified: false, breakdown: 'Disqualified (violative)' };
      }
      let grade = null;
      let breakdown = '';
      let percentage = 0;
      // Use editable gradeRequirements for grade logic
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
      // Estimated bonus in local currency
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
  };

  const calculateSummary = (allData, eligibleData) => {
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
  };

  const saveToDatabase = async () => {
    if (eligibleCreators.length === 0) {
      alert('No eligible creators to save.');
      return;
    }
    setLoading(true);
    let savedCount = 0;
    for (const creator of eligibleCreators) {
      try {
        const { data: existingCreator } = await supabase
          .from('creators')
          .select('id')
          .eq('creator_id', creator.creatorId)
          .single();
        let creatorDbId;
        if (!existingCreator) {
          const { data: newCreator } = await supabase
            .from('creators')
            .insert({
              creator_id: creator.creatorId,
              username_tiktok: creator.username
            })
            .select()
            .single();
          creatorDbId = newCreator.id;
        } else {
          creatorDbId = existingCreator.id;
        }
        const { error } = await supabase
          .from('bonus_calculations')
          .upsert({
            creator_id: creatorDbId,
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
        if (!error) savedCount++;
      } catch (error) {
        console.error(`Error saving bonus for ${creator.username}:`, error);
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
    fetchHistory();
  };

  const exportToExcel = async () => {
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
  };

  const generateWhatsAppMessage = (creator) => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return `💰 *SELAMAT! BONUS ${monthName.toUpperCase()}*\n\nHalo *${creator.username}*! 🎉\n\nKamu mendapat bonus Grade *${creator.grade}*!\n\n📊 *Performa Kamu:*\n• Valid Days: ${creator.validDays} hari ✅\n• Live Hours: ${creator.liveHours.toFixed(1)} jam ✅\n• Total Coins: ${creator.diamonds.toLocaleString('id-ID')} 💎\n\n💵 *BONUS: Rp ${creator.bonusAmount.toLocaleString('id-ID')}*\n\nTransfer tanggal 25 ${monthName}.\n\nKeep up the great work! 🚀\n_SIM Management_`;
  };

  const copyMessage = (creator, index) => {
    const message = generateWhatsAppMessage(creator);
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllMessages = () => {
    const allMessages = eligibleCreators
      .map(creator => generateWhatsAppMessage(creator))
      .join('\n\n➖➖➖➖➖➖➖➖➖➖\n\n');
    navigator.clipboard.writeText(allMessages);
    setBulkCopyMode(true);
    setTimeout(() => setBulkCopyMode(false), 2000);
  };

  const copyByGrade = (grade) => {
    const gradeMessages = eligibleCreators
      .filter(c => c.grade === grade)
      .map(creator => generateWhatsAppMessage(creator))
      .join('\n\n➖➖➖➖➖➖➖➖➖➖\n\n');
    navigator.clipboard.writeText(gradeMessages);
    alert(`Copied ${eligibleCreators.filter(c => c.grade === grade).length} Grade ${grade} messages!`);
  };

  const handleGradeRequirementChange = (grade, field, value) => {
    setGradeRequirements(prev => ({
      ...prev,
      [grade]: { ...prev[grade], [field]: parseInt(value) }
    }));
  };

  const handleBonusTableChange = (grade, idx, field, value) => {
    setBonusTable(prev => ({
      ...prev,
      [grade]: prev[grade].map((tier, i) =>
        i === idx ? { ...tier, [field]: parseInt(value) } : tier
      )
    }));
  };

  const handleSelectRow = (creatorId) => {
    setSelectedRows((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === eligibleCreators.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(eligibleCreators.map((c) => c.creatorId));
    }
  };

  async function updatePaymentStatusInDb(creator, newStatus) {
    setStatusLoading(true);
    setStatusError('');
    setStatusSuccess('');
    try {
      // Get creator DB id
      const { data: dbCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('creator_id', creator.creatorId)
        .single();
      if (!dbCreator) throw new Error('Creator not found in DB');
      // Update bonus_calculations
      const { error: updateError } = await supabase
        .from('bonus_calculations')
        .update({ payment_status: newStatus })
        .eq('creator_id', dbCreator.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear);
      if (updateError) throw updateError;
      // Insert audit log
      await supabase.from('bonus_audit_log').insert({
        creator_id: dbCreator.id,
        admin_id: profile?.id || null,
        month: selectedMonth,
        year: selectedYear,
        old_status: creator.paymentStatus,
        new_status: newStatus,
        action: 'status_change',
        changed_at: new Date().toISOString(),
      });
      setStatusSuccess('Status updated!');
    } catch (err) {
      setStatusError('Failed to update status: ' + (err.message || err));
    } finally {
      setStatusLoading(false);
      setTimeout(() => setStatusSuccess(''), 2000);
    }
  }

  const handleBulkStatusUpdate = async (status) => {
    setPendingBulkStatus(status);
    setShowConfirm(true);
  };

  const confirmBulkStatusUpdate = async () => {
    setShowConfirm(false);
    setStatusLoading(true);
    setStatusError('');
    setStatusSuccess('');
    for (const creator of eligibleCreators) {
      if (selectedRows.includes(creator.creatorId) && creator.paymentStatus !== pendingBulkStatus) {
        await updatePaymentStatusInDb(creator, pendingBulkStatus);
        setHighlightedRows((prev) => [...prev, creator.creatorId]);
        setTimeout(() => setHighlightedRows((prev) => prev.filter(id => id !== creator.creatorId)), 1200);
      }
    }
    setEligibleCreators((prev) =>
      prev.map((c) =>
        selectedRows.includes(c.creatorId)
          ? { ...c, paymentStatus: pendingBulkStatus }
          : c
      )
    );
    setSelectedRows([]);
    setStatusLoading(false);
  };

  const cancelBulkStatusUpdate = () => {
    setShowConfirm(false);
    setPendingBulkStatus('');
  };

  const handleStatusChange = async (creatorId, status) => {
    const creator = eligibleCreators.find((c) => c.creatorId === creatorId);
    if (!creator || creator.paymentStatus === status) return;
    setEligibleCreators((prev) =>
      prev.map((c) =>
        c.creatorId === creatorId ? { ...c, paymentStatus: status } : c
      )
    );
    setHighlightedRows((prev) => [...prev, creatorId]);
    setTimeout(() => setHighlightedRows((prev) => prev.filter(id => id !== creatorId)), 1200);
    await updatePaymentStatusInDb(creator, status);
  };

  async function fetchAuditLog() {
    setAuditLoading(true);
    const { data, error } = await supabase
      .from('bonus_audit_log')
      .select('*, creator:creators(username_tiktok), admin:admins(username)')
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .order('changed_at', { ascending: false })
      .limit(10);
    if (!error) setAuditLog(data || []);
    setAuditLoading(false);
  }

  useEffect(() => {
    fetchAuditLog();
    // eslint-disable-next-line
  }, [selectedMonth, selectedYear]);

  // After status change, refetch audit log
  useEffect(() => {
    if (statusSuccess) fetchAuditLog();
    // eslint-disable-next-line
  }, [statusSuccess]);

  useEffect(() => { setShowStatusMsg(true); }, [statusError, statusSuccess]);

  const exportAuditLog = async () => {
    const XLSX = await import('xlsx');
    const wsData = auditLog.map(log => ({
      'Date/Time': new Date(log.changed_at).toLocaleString('id-ID'),
      'Creator': log.creator?.username_tiktok || log.creator_id,
      'Admin': log.admin?.username || log.admin_id || '-',
      'Old Status': log.old_status,
      'New Status': log.new_status,
      'Action': log.action,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log');
    XLSX.writeFile(wb, `Bonus_Audit_Log_${selectedMonth}_${selectedYear}.xlsx`);
  };

  // Fetch rules on mount
  useEffect(() => {
    async function fetchRules() {
      setRulesLoading(true);
      setRulesError('');
      const { data, error } = await supabase
        .from('bonus_rules')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) {
        setGradeRequirements(data.requirements);
        setBonusTable(data.bonus_table);
      }
      if (error) setRulesError('Failed to load rules');
      setRulesLoading(false);
    }
    fetchRules();
  }, []);

  // Save rules
  async function saveRules() {
    setRulesLoading(true);
    setRulesError('');
    setRulesSuccess('');
    const { error } = await supabase
      .from('bonus_rules')
      .upsert({
        id: 1,
        requirements: gradeRequirements,
        bonus_table: bonusTable,
        updated_at: new Date().toISOString(),
      });
    if (error) setRulesError('Failed to save rules');
    else setRulesSuccess('Rules saved!');
    setRulesLoading(false);
    setTimeout(() => setRulesSuccess(''), 2000);
  }

  // Fetch history
  async function fetchHistory() {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('bonus_calculation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setHistory(data || []);
    setHistoryLoading(false);
  }

  useEffect(() => { fetchHistory(); }, []);

  // Edit notes for past runs
  async function saveHistoryNotes(id, value) {
    setEditNotesLoading(true);
    await supabase.from('bonus_calculation_history').update({ notes: value }).eq('id', id);
    setEditNotesId(null);
    setEditNotesValue('');
    setEditNotesLoading(false);
    fetchHistory();
  }

  useEffect(() => { setCurrentPage(1); }, [filteredCreators]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div className="rounded-xl shadow-md p-8 mb-8 bg-white border border-gray-200" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calculator className="inline-block w-7 h-7 text-blue-500" /> Bonus Calculator</h2>
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dollar Currency Rate</label>
            <Input
              type="number"
              min="1"
              value={dollarRate}
              onChange={e => setDollarRate(Number(e.target.value))}
              className="w-40"
            />
            <span className="text-xs text-gray-500 ml-2">Current USD to IDR rate</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bonus Calculator</h2>
            <p className="text-gray-400">Upload Task Excel to calculate and manage monthly bonuses</p>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black"
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
                className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black"
              />
            </div>
          </div>
        </div>
        {/* Upload Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <label className="cursor-pointer block">
            <div className="text-center">
              <Calculator className="mx-auto mb-2 text-gray-400" size={48} />
              <span className="text-meta-black font-medium">Upload Task Excel from TikTok Backstage</span>
              <p className="text-sm text-gray-500 mt-1">Only eligible creators will be shown</p>
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
        {/* Show Bonus Table */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowBonusTable(!showBonusTable)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {showBonusTable ? 'Hide' : 'Show'} Bonus Table Reference
          </button>
        </div>
        {showBonusTable && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Grade tables here - same as before */}
            <div className="bg-pink-50 p-4 rounded-lg">
              <h4 className="font-bold text-pink-700 mb-2">Grade A</h4>
              <p className="text-xs text-gray-600 mb-2">22 days, 100 hours</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-pink-100">
                    <th className="p-1">Coins</th>
                    <th className="p-1">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusTable.A.map((tier, idx) => (
                    <tr key={idx} className="border-b border-pink-100">
                      <td className="p-1">{tier.minCoins >= 1000 ? `${tier.minCoins/1000}JT` : `${tier.minCoins}RB`}</td>
                      <td className="p-1">{tier.bonus >= 1000 ? `${tier.bonus/1000}JT` : `${tier.bonus}RB`}</td>
                    </tr>
                  )).reverse()}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-700 mb-2">Grade B</h4>
              <p className="text-xs text-gray-600 mb-2">20 days, 60 hours</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="p-1">Coins</th>
                    <th className="p-1">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusTable.B.map((tier, idx) => (
                    <tr key={idx} className="border-b border-blue-100">
                      <td className="p-1">{tier.minCoins}RB</td>
                      <td className="p-1">{tier.bonus}RB</td>
                    </tr>
                  )).reverse()}
                </tbody>
              </table>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-700 mb-2">Grade C</h4>
              <p className="text-xs text-gray-600 mb-2">15 days, 40 hours</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="p-1">Coins</th>
                    <th className="p-1">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusTable.C.map((tier, idx) => (
                    <tr key={idx} className="border-b border-yellow-100">
                      <td className="p-1">{tier.minCoins}RB</td>
                      <td className="p-1">{tier.bonus}RB</td>
                    </tr>
                  )).reverse()}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Summary Stats - Only show after upload */}
        {Object.keys(summary).length > 0 && (
          <>
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
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">{uploadError}</div>
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
          </>
        )}
        {/* Action Buttons - Only show when there's data */}
        {eligibleCreators.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Tooltip content="Save all eligible creators to database">
              <Button onClick={saveToDatabase} variant="success" loading={loading} className="flex items-center gap-2">
                <CheckCircle size={20} /> Save to Database
              </Button>
            </Tooltip>
            <Tooltip content="Export eligible creators to Excel">
              <Button onClick={exportToExcel} variant="primary" className="flex items-center gap-2">
                <Download size={20} /> Export Excel
              </Button>
            </Tooltip>
            <Tooltip content="Copy WhatsApp messages for all Grade A talents">
              <Button onClick={copyByGrade} variant="primary" className="flex items-center gap-2" disabled={summary.gradeA === 0}>
                Copy Grade A ({summary.gradeA})
              </Button>
            </Tooltip>
            <Tooltip content="Copy WhatsApp message">
              <Button onClick={copyMessage} variant="primary" className="flex items-center gap-2">
                <Copy size={20} /> Copy WhatsApp Message
              </Button>
            </Tooltip>
            <Tooltip content="Copy WhatsApp messages for all eligible creators">
              <Button onClick={copyAllMessages} variant={bulkCopyMode ? 'success' : 'secondary'} className="flex items-center gap-2">
                <Copy size={20} /> {bulkCopyMode ? 'Copied All!' : 'Copy All WhatsApp Messages'}
              </Button>
            </Tooltip>
          </div>
        )}
        {/* Eligible Creators Table */}
        {eligibleCreators.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Eligible Creators ({eligibleCreators.length})
            </h3>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-meta-black">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
                <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="p-2 border rounded-lg bg-gray-50 text-meta-black">
                  <option value="all">All</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search username..." className="p-2 border rounded-lg bg-gray-50 text-meta-black" />
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center gap-2 mb-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-xs">Page {currentPage} of {totalPages}</span>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-xs"><input type="checkbox" ref={selectAllRef} checked={selectedRows.length === eligibleCreators.length && eligibleCreators.length > 0} onChange={handleSelectAll} /></th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Coins</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">% Bonus</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Est. Bonus (USD)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Est. Bonus (IDR)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Final Bonus (IDR)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Breakdown</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">WhatsApp</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCreators.map((creator, idx) => (
                    <tr key={creator.creatorId || idx} className={`hover:bg-gray-50 transition-colors duration-500 ${highlightedRows.includes(creator.creatorId) ? 'bg-green-50 animate-pulse' : ''}`}>
                      <td className="px-2 py-1 text-xs"><input type="checkbox" checked={selectedRows.includes(creator.creatorId)} onChange={() => handleSelectRow(creator.creatorId)} /></td>
                      <td className="px-4 py-3 text-sm">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{creator.username}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-xs space-y-1">
                          <div>📅 {creator.validDays} days</div>
                          <div>⏱️ {creator.liveHours.toFixed(1)} hours</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {creator.diamonds.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{creator.grade}</td>
                      <td className="px-4 py-3 text-sm">{Math.round(creator.percentage * 100)}%</td>
                      <td className="px-4 py-3 text-sm">${creator.estimatedBonusUSD?.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      <td className="px-4 py-3 text-sm">Rp {creator.estimatedBonusLocal?.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">Rp {creator.bonusAmount?.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-xs">{creator.breakdown}</td>
                      <td className="px-4 py-3 text-center">
                        <Tooltip content="Copy WhatsApp message">
                          <Button
                            onClick={() => copyMessage(creator, idx)}
                            variant={copiedIndex === idx ? 'success' : 'primary'}
                            size="sm"
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${copiedIndex === idx ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                          >
                            {copiedIndex === idx ? (
                              <>
                                <CheckCircle size={16} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                Copy
                              </>
                            )}
                          </Button>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <select value={creator.paymentStatus} onChange={e => handleStatusChange(creator.creatorId, e.target.value)} className="border rounded p-1 text-xs">
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* WhatsApp Message Preview */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">WhatsApp Message Preview:</h4>
              <div className="bg-white p-4 rounded border border-gray-200 text-sm whitespace-pre-wrap font-mono">
                {generateWhatsAppMessage(eligibleCreators[0])}
              </div>
            </div>
            {selectedRows.length > 0 && (
              <div className="mb-4 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="font-medium text-meta-blue">{selectedRows.length} selected</span>
                <Tooltip content="Mark selected as Paid">
                  <button
                    className="px-3 py-1 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
                    onClick={() => handleBulkStatusUpdate('paid')}
                  >Mark as Paid</button>
                </Tooltip>
                <button
                  className="px-3 py-1 rounded bg-yellow-400 text-white text-xs font-semibold hover:bg-yellow-500"
                  onClick={() => handleBulkStatusUpdate('pending')}
                >Mark as Pending</button>
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600"
                  onClick={() => handleBulkStatusUpdate('failed')}
                >Mark as Failed</button>
                <button
                  className="ml-auto px-2 py-1 rounded text-xs text-meta-gray-500 hover:text-meta-black"
                  onClick={() => setSelectedRows([])}
                >Clear</button>
              </div>
            )}
          </div>
        )}
        {/* Empty State */}
        {allData.length > 0 && eligibleCreators.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No creators qualified for bonus this month</p>
            <p className="text-sm text-gray-500 mt-2">
              Out of {allData.length} creators processed, none met the minimum requirements
            </p>
          </div>
        )}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-2 text-lg">Bonus Rules (Editable)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['A','B','C'].map(grade => (
              <div key={grade} className="bg-white p-4 rounded shadow">
                <div className="font-bold mb-2">Grade {grade}</div>
                <div className="flex gap-2 mb-2">
                  <label className="text-xs">Days: <input type="number" className="w-14 border rounded p-1 text-xs" value={gradeRequirements[grade].days} onChange={e => handleGradeRequirementChange(grade, 'days', e.target.value)} /></label>
                  <label className="text-xs">Hours: <input type="number" className="w-14 border rounded p-1 text-xs" value={gradeRequirements[grade].hours} onChange={e => handleGradeRequirementChange(grade, 'hours', e.target.value)} /></label>
                </div>
                <table className="w-full text-xs">
                  <thead><tr><th>Coins</th><th>Bonus</th></tr></thead>
                  <tbody>
                    {bonusTable[grade].map((tier, idx) => (
                      <tr key={idx}>
                        <td><input type="number" className="w-16 border rounded p-1 text-xs" value={tier.minCoins} onChange={e => handleBonusTableChange(grade, idx, 'minCoins', e.target.value)} /></td>
                        <td><input type="number" className="w-16 border rounded p-1 text-xs" value={tier.bonus} onChange={e => handleBonusTableChange(grade, idx, 'bonus', e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center mt-4">
          <button
            onClick={saveRules}
            className="px-4 py-2 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 shadow"
            disabled={rulesLoading}
          >{rulesLoading ? 'Saving...' : 'Save Rules'}</button>
          {rulesSuccess && <span className="text-green-600 text-sm">{rulesSuccess}</span>}
          {rulesError && <span className="text-red-600 text-sm">{rulesError}</span>}
        </div>
        {statusLoading && showStatusMsg && <div className="mb-2 text-blue-600 text-sm flex items-center">Updating status... <button className="ml-2 text-xs text-blue-800" onClick={()=>setShowStatusMsg(false)}>✕</button></div>}
        {statusError && showStatusMsg && <div className="mb-2 text-red-600 text-sm flex items-center">{statusError} <button className="ml-2 text-xs text-red-800" onClick={()=>setShowStatusMsg(false)}>✕</button></div>}
        {statusSuccess && showStatusMsg && <div className="mb-2 text-green-600 text-sm flex items-center">{statusSuccess} <button className="ml-2 text-xs text-green-800" onClick={()=>setShowStatusMsg(false)}>✕</button></div>}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Recent Status Changes</h3>
          <Tooltip content="Export audit log to Excel">
            <button
              onClick={exportAuditLog}
              className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 shadow"
              disabled={auditLog.length === 0}
            >Export Audit Log</button>
          </Tooltip>
        </div>
        <div className="mt-10">
          {auditLoading ? (
            <div className="text-meta-blue">Loading audit log...</div>
          ) : auditLog.length === 0 ? (
            <div className="text-meta-gray-500 text-sm">No recent changes.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-xs">Date/Time</th>
                    <th className="px-4 py-2 text-xs">Creator</th>
                    <th className="px-4 py-2 text-xs">Admin</th>
                    <th className="px-4 py-2 text-xs">Old Status</th>
                    <th className="px-4 py-2 text-xs">New Status</th>
                    <th className="px-4 py-2 text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLog.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs">{new Date(log.changed_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-xs">{log.creator?.username_tiktok || log.creator_id}</td>
                      <td className="px-4 py-2 text-xs">{log.admin?.username || log.admin_id || '-'}</td>
                      <td className="px-4 py-2 text-xs">{log.old_status}</td>
                      <td className="px-4 py-2 text-xs font-bold text-blue-600">{log.new_status}</td>
                      <td className="px-4 py-2 text-xs">{log.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-2">Bonus Calculation History</h3>
          {historyLoading ? (
            <div className="text-meta-blue">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-meta-gray-500 text-sm">No history found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-xs">Month/Year</th>
                    <th className="px-4 py-2 text-xs">Created At</th>
                    <th className="px-4 py-2 text-xs">Created By</th>
                    <th className="px-4 py-2 text-xs">Eligible</th>
                    <th className="px-4 py-2 text-xs">Total Bonus</th>
                    <th className="px-4 py-2 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs">{h.month}/{h.year}</td>
                      <td className="px-4 py-2 text-xs">{new Date(h.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-xs">{h.created_by || '-'}</td>
                      <td className="px-4 py-2 text-xs">{h.summary?.eligibleCreators || '-'}</td>
                      <td className="px-4 py-2 text-xs">Rp {h.summary?.totalBonusAmount?.toLocaleString('id-ID') || '-'}</td>
                      <td className="px-4 py-2 text-xs">
                        <button onClick={() => setShowHistoryDetail(h)} className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* History Detail Modal */}
          {showHistoryDetail && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
                <h4 className="font-bold mb-2">Bonus Calculation Detail ({showHistoryDetail.month}/{showHistoryDetail.year})</h4>
                <div className="mb-2 text-xs text-gray-500">Created: {new Date(showHistoryDetail.created_at).toLocaleString('id-ID')}</div>
                <div className="mb-4 text-xs text-gray-500">By: {showHistoryDetail.created_by || '-'}</div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-1">Rules Snapshot</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(showHistoryDetail.rules_snapshot, null, 2)}</pre>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-1">Summary</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(showHistoryDetail.summary, null, 2)}</pre>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-1">Eligible Creators</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">{JSON.stringify(showHistoryDetail.eligible_creators, null, 2)}</pre>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-1">Admin Notes</h5>
                  {editNotesId === showHistoryDetail.id ? (
                    <div>
                      <textarea value={editNotesValue} onChange={e => setEditNotesValue(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black min-h-[60px]" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveHistoryNotes(showHistoryDetail.id, editNotesValue)} className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600" disabled={editNotesLoading}>{editNotesLoading ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => setEditNotesId(null)} className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded">{showHistoryDetail.notes || <span className="text-meta-gray-400">No notes</span>}</div>
                      <button onClick={() => { setEditNotesId(showHistoryDetail.id); setEditNotesValue(showHistoryDetail.notes || ''); }} className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600">Edit</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowHistoryDetail(null)} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes/Comments</label>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder="Add any notes or context for this bonus calculation..."
            className="w-full p-2 border rounded-lg bg-gray-50 text-meta-black min-h-[60px]"
          />
        </div>
        {debugInfo && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="font-bold mb-2">Debug: Sample of Processed Creators</div>
            <div className="text-xs mb-1">Columns: {debugInfo.columns?.join(', ')}</div>
            <pre className="text-xs overflow-x-auto" style={{ maxHeight: 120 }}>{JSON.stringify(debugInfo.sample, null, 2)}</pre>
            <div className="text-xs text-gray-500">Total rows processed: {debugInfo.total}</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BonusCalculator; 