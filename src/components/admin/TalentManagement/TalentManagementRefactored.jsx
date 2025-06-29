import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, History } from 'lucide-react';
import Notification from '../../common/Notification';
import UploadSection from './UploadSection';
import EnhancedTalentTable from './EnhancedTalentTable';
import RecentActivity from './RecentActivity';
import AdminLayout from '../AdminLayout';
import CompactCard from '../CompactCard';
import Button from '../../common/Button';
import { getCreatorsWithPerformance, cleanupCreatorIds } from '../../../lib/supabase';
import { supabase } from '../../../lib/supabase';

const TalentManagementRefactored = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameChanges, setUsernameChanges] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [activeTab, setActiveTab] = useState('table'); // Default to Talent Table

  useEffect(() => {
    loadTalents();
    loadUsernameChanges();
  }, []);

  const loadTalents = async () => {
    setLoading(true);
    try {
      const { creators, error } = await getCreatorsWithPerformance(1000);
      if (error) throw error;
      setTalents(creators || []);
    } catch (error) {
      setNotification({ message: 'Error loading talents: ' + error.message, type: 'error', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  const loadUsernameChanges = async () => {
    try {
      const { data } = await supabase
        .from('username_history')
        .select(`*,creators (username_tiktok)`)
        .order('changed_at', { ascending: false })
        .limit(10);
      setUsernameChanges(data || []);
    } catch (error) {
      setNotification({ message: 'Error loading username changes.', type: 'error', isVisible: true });
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('This will clean up inconsistent creator IDs in the database. This action cannot be undone. Continue?')) {
      return;
    }
    setCleaningUp(true);
    try {
      const result = await cleanupCreatorIds();
      if (result.error) {
        setNotification({ message: 'Cleanup failed: ' + result.error.message, type: 'error', isVisible: true });
      } else {
        setNotification({ message: result.message || 'Database cleanup completed successfully!', type: 'success', isVisible: true });
        await loadTalents();
      }
    } catch (error) {
      setNotification({ message: 'Cleanup error: ' + error.message, type: 'error', isVisible: true });
    } finally {
      setCleaningUp(false);
    }
  };

  const handleUploadComplete = () => {
    loadTalents();
    loadUsernameChanges();
  };

  // Tab definitions
  const tabs = [
    {
      id: 'upload',
      name: 'Upload',
      icon: Upload,
      description: 'Import or update talent data'
    },
    {
      id: 'table',
      name: 'Talent Table',
      icon: Users,
      description: 'View, search, and manage talents'
    },
    {
      id: 'activity',
      name: 'Recent Activity',
      icon: History,
      description: 'Latest username changes'
    }
  ];

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <CompactCard title="Upload Talent Data" subtitle="Import or update talent data">
            <UploadSection 
              onUploadComplete={handleUploadComplete}
              onNotification={setNotification}
            />
          </CompactCard>
        );
      case 'activity':
        return (
          <CompactCard title="Recent Activity" subtitle="Latest username changes" compact>
            <RecentActivity usernameChanges={usernameChanges} />
          </CompactCard>
        );
      case 'table':
      default:
        return (
          <CompactCard 
            title={`Talent Management (${talents.length} creators)`}
            subtitle="Enhanced data table with advanced search and bulk operations"
            className="overflow-x-auto"
            actions={
              <Button 
                onClick={handleCleanup} 
                variant="warning" 
                size="sm" 
                loading={cleaningUp}
                disabled={cleaningUp}
              >
                {cleaningUp ? 'Cleaning...' : 'Fix Creator IDs'}
              </Button>
            }
          >
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <EnhancedTalentTable 
                data={talents}
                loading={loading}
                onRefresh={loadTalents}
                onSelectTalent={setSelectedTalent}
                selectedTalent={selectedTalent}
              />
            </div>
          </CompactCard>
        );
    }
  };

  return (
    <AdminLayout title="Talent Management" compact>
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex-1 group px-6 py-4 text-sm font-medium text-center border-b-2 transition-all duration-200
                    ${isActive 
                      ? 'border-green-500 text-green-600 bg-green-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                  {/* Desktop description */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hidden sm:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-md shadow-sm whitespace-nowrap z-10"
                    >
                      {tab.description}
                    </motion.div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </AdminLayout>
  );
};

export default TalentManagementRefactored; 