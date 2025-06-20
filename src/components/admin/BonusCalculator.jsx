import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { Calculator, Download, Copy, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import Input from '../common/Input';
import Button from '../common/Button';

const BonusCalculator = () => {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [eligibleCreators, setEligibleCreators] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({});
  const [showBonusTable, setShowBonusTable] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bulkCopyMode, setBulkCopyMode] = useState(false);

  const GRADE_REQUIREMENTS = {
    A: { days: 22, hours: 100 },
    B: { days: 20, hours: 60 },
    C: { days: 15, hours: 40 }
  };
  const BONUS_TABLE = {
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

  const handleTaskUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setEligibleCreators([]);
    setCopiedIndex(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const processedData = jsonData.map(row => ({
        creatorId: row['Creator ID'] || '',
        username: row['Creator nickname'] || '',
        handle: row['Handle'] || '',
        isViolative: row['Is violative creators'] === true || row['Is violative creators'] === 'true',
        diamonds: parseInt(row['Diamonds']) || 0,
        validDays: parseInt(row['Valid days(d)']) || 0,
        liveHours: parseFloat(row['LIVE duration(h)']) || 0,
      }));
      setAllData(processedData);
      const calculatedData = calculateBonuses(processedData);
      const eligible = calculatedData.filter(c => c.qualified && c.bonusAmount > 0);
      setEligibleCreators(eligible);
      calculateSummary(processedData, eligible);
      if (eligible.length === 0) {
        alert('No creators qualified for bonus this month.');
      }
    } catch (error) {
      console.error('Error processing Task file:', error);
      alert('Error processing file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const calculateBonuses = (data) => {
    return data.map(creator => {
      if (creator.isViolative) {
        return { ...creator, qualified: false };
      }
      let grade = null;
      if (creator.validDays >= GRADE_REQUIREMENTS.A.days && creator.liveHours >= GRADE_REQUIREMENTS.A.hours) {
        grade = 'A';
      } else if (creator.validDays >= GRADE_REQUIREMENTS.B.days && creator.liveHours >= GRADE_REQUIREMENTS.B.hours) {
        grade = 'B';
      } else if (creator.validDays >= GRADE_REQUIREMENTS.C.days && creator.liveHours >= GRADE_REQUIREMENTS.C.hours) {
        grade = 'C';
      }
      if (!grade) {
        return { ...creator, qualified: false };
      }
      const bonusTable = BONUS_TABLE[grade];
      let bonusAmount = 0;
      for (const tier of bonusTable) {
        if (creator.diamonds >= tier.minCoins * 1000) {
          bonusAmount = tier.bonus * 1000;
          break;
        }
      }
      if (bonusAmount === 0) {
        return { ...creator, grade, qualified: false };
      }
      return {
        ...creator,
        grade,
        bonusAmount,
        qualified: true,
        paymentStatus: 'pending'
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
            payment_status: 'pending',
            notes: `Grade ${creator.grade} bonus approved`
          });
        if (!error) savedCount++;
      } catch (error) {
        console.error(`Error saving bonus for ${creator.username}:`, error);
      }
    }
    setLoading(false);
    alert(`Successfully saved ${savedCount} bonus calculations!`);
  };

  const exportToExcel = () => {
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

  return (
    <div className={`p-6 max-w-7xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black text-white' : 'bg-gray-50 text-meta-black'}`}>
      <motion.div
        className={`rounded-2xl shadow-2xl p-10 mb-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
                  {BONUS_TABLE.A.map((tier, idx) => (
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
                  {BONUS_TABLE.B.map((tier, idx) => (
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
                  {BONUS_TABLE.C.map((tier, idx) => (
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
          </>
        )}
        {/* Action Buttons - Only show when there's data */}
        {eligibleCreators.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Button onClick={saveToDatabase} variant="success" loading={loading} className="flex items-center gap-2">
              <CheckCircle size={20} /> Save to Database
            </Button>
            <Button onClick={exportToExcel} variant="primary" className="flex items-center gap-2">
              <Download size={20} /> Export Excel
            </Button>
            <Button onClick={copyAllMessages} variant={bulkCopyMode ? 'success' : 'secondary'} className="flex items-center gap-2">
              <Copy size={20} /> {bulkCopyMode ? 'Copied All!' : 'Copy All WhatsApp Messages'}
            </Button>
            {summary.gradeA > 0 && (
              <Button onClick={() => copyByGrade('A')} variant="outline" className="text-pink-700 border-pink-200 bg-pink-50">
                Copy Grade A ({summary.gradeA})
              </Button>
            )}
            {summary.gradeB > 0 && (
              <Button onClick={() => copyByGrade('B')} variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                Copy Grade B ({summary.gradeB})
              </Button>
            )}
            {summary.gradeC > 0 && (
              <Button onClick={() => copyByGrade('C')} variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
                Copy Grade C ({summary.gradeC})
              </Button>
            )}
          </div>
        )}
        {/* Eligible Creators Table */}
        {eligibleCreators.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Eligible Creators ({eligibleCreators.length})
            </h3>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Coins</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Bonus</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleCreators.map((creator, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
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
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${creator.grade === 'A' ? 'bg-pink-100 text-pink-800' : ''}
                          ${creator.grade === 'B' ? 'bg-blue-100 text-blue-800' : ''}
                          ${creator.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          Grade {creator.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        Rp {creator.bonusAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() => copyMessage(creator, index)}
                          variant={copiedIndex === index ? 'success' : 'secondary'}
                          size="sm"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all"
                        >
                          {copiedIndex === index ? (
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
      </motion.div>
    </div>
  );
};

export default BonusCalculator; 