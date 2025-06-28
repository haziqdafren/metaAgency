import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Book, Users, TrendingUp, UserCheck, Gem, DollarSign, Activity, Eye, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import CompactCard from './CompactCard';
import CompactTable from './CompactTable';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LazyLine = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })));

// Loading skeleton components
const StatCardSkeleton = ({ index }) => (
  <motion.div
    className="rounded-lg p-4 bg-gray-100 border border-gray-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
      </div>
      <div className="p-2 rounded-lg bg-gray-200 animate-pulse w-10 h-10"></div>
    </div>
  </motion.div>
);

const ChartSkeleton = () => (
  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      <div className="text-sm text-gray-500">Loading chart data...</div>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3 py-2">
        <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-8"></div>
      </div>
    ))}
  </div>
);

const AdminDashboardImproved = () => {
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
  const [chartLoading, setChartLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setChartLoading(true);
    setActivityLoading(true);
    
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
      
      // Recent activity
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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setChartLoading(false);
      setActivityLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Creators',
      value: stats.totalCreators,
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 text-blue-900',
      change: '+12%',
      changeType: 'positive'
    },
    {
      label: 'Active Creators',
      value: stats.activeCreators,
      icon: <Users className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50 text-green-900',
      change: '+8%',
      changeType: 'positive'
    },
    {
      label: 'Total Diamonds',
      value: stats.totalDiamonds.toLocaleString('id-ID'),
      icon: <Gem className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 text-purple-900',
      change: '+15%',
      changeType: 'positive'
    },
    {
      label: 'Total Bonuses',
      value: `Rp ${stats.totalBonuses.toLocaleString('id-ID')}`,
      icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
      color: 'bg-yellow-50 text-yellow-900',
      change: '+23%',
      changeType: 'positive'
    },
  ];

  const quickActions = [
    {
      to: '/admin/upload',
      icon: <Upload className="w-6 h-6" />,
      label: 'Upload Performance',
      description: 'Upload monthly data',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      to: '/admin/bonus',
      icon: <Book className="w-6 h-6" />,
      label: 'Bonus Calculator',
      description: 'Calculate bonuses',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    },
    {
      to: '/admin/talents',
      icon: <Users className="w-6 h-6" />,
      label: 'Talent Management',
      description: 'Manage creators',
      color: 'bg-green-50 text-green-700 hover:bg-green-100'
    },
    {
      to: '/admin/articles',
      icon: <Plus className="w-6 h-6" />,
      label: 'Create Article',
      description: 'New content',
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
    }
  ];

  return (
    <AdminLayout title="Dashboard" compact>
      {/* Stats Cards - More compact grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          // Loading skeletons for stats cards
          Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} index={i} />
          ))
        ) : (
          // Actual stats cards
          statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className={`rounded-lg p-4 ${card.color} border border-gray-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-sm opacity-80">{card.label}</div>
                  <div className={`text-xs mt-1 ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} from last month
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/50">
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid - Side by side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Section - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <CompactCard 
            title="Diamonds Trend" 
            subtitle="Last 6 months performance"
            compact
          >
            {chartLoading ? (
              <ChartSkeleton />
            ) : (
              <Suspense fallback={<ChartSkeleton />}>
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
                        pointRadius: 3,
                        pointHoverRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#666' } },
                      y: { grid: { color: '#e0e7ef' }, beginAtZero: true, ticks: { color: '#666' } },
                    },
                    animation: {
                      duration: 800,
                      easing: 'easeInOutQuart',
                    },
                  }}
                  height={200}
                />
              </Suspense>
            )}
          </CompactCard>
        </div>

        {/* Quick Actions - Takes 1/3 width */}
        <div className="space-y-3">
          <CompactCard title="Quick Actions" compact>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${action.color}`}
                >
                  {action.icon}
                  <div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CompactCard>

          {/* Recent Activity */}
          <CompactCard 
            title="Recent Activity" 
            subtitle="Latest changes"
            compact
            collapsible
            defaultCollapsed={false}
          >
            {activityLoading ? (
              <ActivitySkeleton />
            ) : (
              <div className="space-y-2">
                {recentActivity.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">No recent activity</div>
                ) : (
                  recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{item.message}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CompactCard>
        </div>
      </div>

      {/* Recent Performance Table */}
      <CompactCard 
        title="Recent Performance" 
        subtitle="Top creators this month"
        compact
        collapsible
        defaultCollapsed={true}
      >
        {loading ? (
          <TableSkeleton />
        ) : (
          <CompactTable compact>
            <CompactTable.Head>
              <CompactTable.Row>
                <CompactTable.Header>Creator</CompactTable.Header>
                <CompactTable.Header>Diamonds</CompactTable.Header>
                <CompactTable.Header>Days</CompactTable.Header>
                <CompactTable.Header>Hours</CompactTable.Header>
                <CompactTable.Header>Actions</CompactTable.Header>
              </CompactTable.Row>
            </CompactTable.Head>
            <CompactTable.Body>
              {[1, 2, 3].map((i) => (
                <CompactTable.Row key={i}>
                  <CompactTable.Cell>
                    <div className="font-medium">@creator_{i}</div>
                  </CompactTable.Cell>
                  <CompactTable.Cell>{(Math.random() * 10000).toFixed(0)}</CompactTable.Cell>
                  <CompactTable.Cell>{(Math.random() * 30).toFixed(0)}</CompactTable.Cell>
                  <CompactTable.Cell>{(Math.random() * 200).toFixed(1)}</CompactTable.Cell>
                  <CompactTable.Cell>
                    <Button size="sm" variant="secondary">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </CompactTable.Cell>
                </CompactTable.Row>
              ))}
            </CompactTable.Body>
          </CompactTable>
        )}
      </CompactCard>
    </AdminLayout>
  );
};

export default AdminDashboardImproved; 