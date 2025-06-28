import React, { useState, useEffect } from 'react';
import { supabase, getCreatorsWithPerformance, cleanupCreatorIds } from '../../../lib/supabase';
import { motion } from 'framer-motion';
import Notification from '../../common/Notification';
import UploadSection from './UploadSection';
import TalentsTable from './TalentsTable';
import RecentActivity from './RecentActivity';
import AdminLayout from '../AdminLayout';
import CompactCard from '../CompactCard';
import Button from '../../common/Button';

const TalentManagementRefactored = () => {
  const [talents, setTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    followersMin: 0,
    followersMax: 5000000,
    category: '',
    games: '',
    status: 'all',
    validDaysMin: 0
  });
  const [usernameChanges, setUsernameChanges] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: 'info', isVisible: false });
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredTalents.length / pageSize);
  const paginatedTalents = filteredTalents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [cleaningUp, setCleaningUp] = useState(false);

  useEffect(() => {
    loadTalents();
    loadUsernameChanges();
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters, talents]);

  const loadTalents = async () => {
    setLoading(true);
    try {
      const { creators, error } = await getCreatorsWithPerformance(1000);
      
      if (error) {
        console.error('Error loading creators:', error);
        throw error;
      }
      
      const processedData = (creators || []).map(talent => {
        const latestPerf = talent.creator_performance?.length > 0 
          ? talent.creator_performance.reduce((latest, current) => {
              const latestDate = new Date(latest.period_year, latest.period_month - 1);
              const currentDate = new Date(current.period_year, current.period_month - 1);
              return currentDate > latestDate ? current : latest;
            })
          : {};
        
        return {
          ...talent,
          latestDiamonds: latestPerf.diamonds || 0,
          latestValidDays: latestPerf.valid_days || 0,
          latestLiveHours: latestPerf.live_hours || 0,
          creator_id: talent.creator_id || 'N/A'
        };
      });
      
      console.log(`✅ Loaded ${processedData.length} creators with consistent IDs`);
      setTalents(processedData);
      setFilteredTalents(processedData);
    } catch (error) {
      console.error('Error loading talents:', error);
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

  const handleSearch = () => {
    const filtered = talents.filter(talent => {
      const matchesSearch = !searchTerm || 
        talent.username_tiktok?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.creator_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || talent.status === filters.status;
      const matchesCategory = !filters.category || talent.konten_kategori === filters.category;
      const matchesFollowers = talent.followers_count >= filters.followersMin && 
                              talent.followers_count <= filters.followersMax;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesFollowers;
    });
    
    setFilteredTalents(filtered);
    setCurrentPage(1);
  };

  const exportResults = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredTalents.map(talent => ({
      'Username': talent.username_tiktok,
      'Creator ID': talent.creator_id,
      'Followers': talent.followers_count,
      'Category': talent.konten_kategori,
      'Games': talent.game_preference,
      'Status': talent.status,
      'Joined Date': talent.joined_date,
      'WhatsApp': talent.nomor_wa,
      'TikTok Link': talent.link_tiktok,
      'Recent Diamonds': talent.latestDiamonds,
      'Recent Valid Days': talent.latestValidDays,
      'Recent Live Hours': talent.latestLiveHours,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Talents');
    XLSX.writeFile(wb, `Talent_Search_Results_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const generateEndorsementList = () => {
    const endorsementText = filteredTalents
      .slice(0, 10)
      .map((talent, idx) => 
        `${idx + 1}. @${talent.username_tiktok}\n   - Followers: ${talent.followers_count.toLocaleString('id-ID')}\n   - Category: ${talent.konten_kategori}\n   - Games: ${talent.game_preference || 'N/A'}\n   - Recent Performance: ${talent.latestDiamonds.toLocaleString('id-ID')} diamonds\n   - Contact: ${talent.nomor_wa || 'N/A'}`
      ).join('\n\n');
    const fullText = `🎯 TALENT RECOMMENDATIONS FOR ENDORSEMENT\n\nBased on your criteria, here are the top matching creators:\n\n${endorsementText}\n\nTotal matching creators: ${filteredTalents.length}\n\nGenerated by Meta Agency Talent Search`;
    navigator.clipboard.writeText(fullText);
    setNotification({ message: 'Endorsement list copied to clipboard!', type: 'success', isVisible: true });
  };

  const handleUploadComplete = () => {
    loadTalents();
    loadUsernameChanges();
  };

  const handleCleanup = async () => {
    if (!window.confirm('This will clean up inconsistent creator IDs in the database. This action cannot be undone. Continue?')) {
      return;
    }
    
    setCleaningUp(true);
    try {
      const result = await cleanupCreatorIds();
      
      if (result.error) {
        setNotification({ 
          message: 'Cleanup failed: ' + result.error.message, 
          type: 'error', 
          isVisible: true 
        });
      } else {
        setNotification({ 
          message: result.message || 'Database cleanup completed successfully!', 
          type: 'success', 
          isVisible: true 
        });
        
        // Reload talents after cleanup
        await loadTalents();
      }
    } catch (error) {
      setNotification({ 
        message: 'Cleanup error: ' + error.message, 
        type: 'error', 
        isVisible: true 
      });
    } finally {
      setCleaningUp(false);
    }
  };

  return (
    <AdminLayout title="Talent Management" compact>
      <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />
      
      <UploadSection 
        onUploadComplete={handleUploadComplete}
        onNotification={setNotification}
      />
      
      <RecentActivity usernameChanges={usernameChanges} />
      
      <CompactCard 
        title={`Talent Search Results (${filteredTalents.length})`}
        subtitle={searchTerm && `for "${searchTerm}"`}
        compact
        actions={
          <div className="flex gap-2">
            <Button onClick={exportResults} variant="primary" size="sm" disabled={filteredTalents.length === 0}>
              Export Results
            </Button>
            <Button onClick={generateEndorsementList} variant="secondary" size="sm" disabled={filteredTalents.length === 0}>
              Generate Endorsement List
            </Button>
            <Button 
              onClick={handleCleanup} 
              variant="warning" 
              size="sm" 
              loading={cleaningUp}
              disabled={cleaningUp}
            >
              {cleaningUp ? 'Cleaning...' : 'Fix Creator IDs'}
            </Button>
          </div>
        }
      >
        <TalentsTable 
          talents={talents}
          filteredTalents={filteredTalents}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          paginatedTalents={paginatedTalents}
          filters={filters}
          setFilters={setFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onExportResults={exportResults}
          onGenerateEndorsementList={generateEndorsementList}
          onSelectTalent={setSelectedTalent}
          selectedTalent={selectedTalent}
        />
      </CompactCard>
    </AdminLayout>
  );
};

export default TalentManagementRefactored; 