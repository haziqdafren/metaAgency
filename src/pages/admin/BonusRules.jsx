import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const defaultRules = {
  A: { minDays: 22, minHours: 100, bonusPercentage: 30 },
  B: { minDays: 20, minHours: 60, bonusPercentage: 25 },
  C: { minDays: 15, minHours: 40, bonusPercentage: 20 }
};

const BonusRules = () => {
  const [gradeRules, setGradeRules] = useState(defaultRules);
  const [dollarRate, setDollarRate] = useState(16000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('bonus_rules')
          .select('*')
          .single();
        if (data) {
          setGradeRules({
            A: {
              minDays: data.grade_a_min_days,
              minHours: data.grade_a_min_hours,
              bonusPercentage: data.grade_a_bonus_percentage
            },
            B: {
              minDays: data.grade_b_min_days,
              minHours: data.grade_b_min_hours,
              bonusPercentage: data.grade_b_bonus_percentage
            },
            C: {
              minDays: data.grade_c_min_days,
              minHours: data.grade_c_min_hours,
              bonusPercentage: data.grade_c_bonus_percentage
            }
          });
          setDollarRate(data.exchange_rate);
        }
      } catch (err) {
        setError('Failed to fetch rules. Using defaults.');
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const saveRules = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const rulesData = {
        grade_a_min_days: gradeRules.A.minDays,
        grade_a_min_hours: gradeRules.A.minHours,
        grade_a_bonus_percentage: gradeRules.A.bonusPercentage,
        grade_b_min_days: gradeRules.B.minDays,
        grade_b_min_hours: gradeRules.B.minHours,
        grade_b_bonus_percentage: gradeRules.B.bonusPercentage,
        grade_c_min_days: gradeRules.C.minDays,
        grade_c_min_hours: gradeRules.C.minHours,
        grade_c_bonus_percentage: gradeRules.C.bonusPercentage,
        exchange_rate: dollarRate,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('bonus_rules')
        .upsert(rulesData);
      if (error) throw error;
      setSuccess('Rules saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save rules. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {['A', 'B', 'C'].map(grade => (
            <div key={grade} className={`rounded-lg p-4 border-2 ${grade === 'A' ? 'border-pink-400 bg-pink-50' : grade === 'B' ? 'border-blue-400 bg-blue-50' : 'border-yellow-400 bg-yellow-50'}`}>
              <div className="font-bold text-lg mb-2">Grade {grade}</div>
              <div className="mb-2 flex flex-col gap-2">
                <Input
                  label="Min Days"
                  type="number"
                  value={gradeRules[grade].minDays}
                  onChange={e => setGradeRules(rules => ({ ...rules, [grade]: { ...rules[grade], minDays: parseInt(e.target.value) } }))}
                  min={0}
                />
                <Input
                  label="Min Hours"
                  type="number"
                  value={gradeRules[grade].minHours}
                  onChange={e => setGradeRules(rules => ({ ...rules, [grade]: { ...rules[grade], minHours: parseInt(e.target.value) } }))}
                  min={0}
                />
                <Input
                  label="Bonus %"
                  type="number"
                  value={gradeRules[grade].bonusPercentage}
                  onChange={e => setGradeRules(rules => ({ ...rules, [grade]: { ...rules[grade], bonusPercentage: parseInt(e.target.value) } }))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="text-xs text-meta-gray-600 mt-2">Formula: Estimated Bonus USD × Exchange Rate × Bonus %</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Input
            label="Exchange Rate (IDR/USD)"
            type="number"
            value={dollarRate}
            onChange={e => setDollarRate(parseInt(e.target.value))}
            min={0}
          />
        </div>
        <form onSubmit={saveRules} className="flex flex-col gap-4 mt-4">
          <div className="flex gap-4">
            <Button type="submit" loading={loading}>Save Rules</Button>
            {success && <span className="text-green-600 font-semibold self-center">{success}</span>}
            {error && <span className="text-red-600 font-semibold self-center">{error}</span>}
          </div>
        </form>
    </div>
  );
};

export default BonusRules; 