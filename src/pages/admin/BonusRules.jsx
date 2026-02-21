import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useDemoMode } from '../../contexts/DemoModeContext';

const defaultRules = {
  A: { days: 22, hours: 100, bonusPercentage: 30 },
  B: { days: 20, hours: 60, bonusPercentage: 25 },
  C: { days: 15, hours: 40, bonusPercentage: 20 }
};

const BonusRules = () => {
  const { withDemoCheck } = useDemoMode();
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
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data && data.requirements) {
          setGradeRules(data.requirements);
          console.log('✅ Rules loaded from database:', data.requirements);
        } else {
          console.log('ℹ️ No rules found in database, using defaults');
        }
      } catch (err) {
        console.error('❌ Failed to fetch rules:', err);
        setError('Failed to fetch rules. Using defaults.');
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const saveRules = withDemoCheck(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const rulesData = {
        id: 1,
        requirements: gradeRules,
        bonus_table: {
          A: [],
          B: [],
          C: []
        },
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving rules to database:', rulesData);

      const { error } = await supabase
        .from('bonus_rules')
        .upsert(rulesData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      setSuccess('Rules saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      console.log('✅ Rules saved successfully');
    } catch (err) {
      console.error('❌ Failed to save rules:', err);
      setError('Failed to save rules. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  });

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
                  value={gradeRules[grade].days}
                  onChange={e => setGradeRules(rules => ({ ...rules, [grade]: { ...rules[grade], days: parseInt(e.target.value) } }))}
                  min={0}
                />
                <Input
                  label="Min Hours"
                  type="number"
                  value={gradeRules[grade].hours}
                  onChange={e => setGradeRules(rules => ({ ...rules, [grade]: { ...rules[grade], hours: parseInt(e.target.value) } }))}
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