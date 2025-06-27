import React, { useEffect, useState } from 'react';
import CreatorDataUpload from '../../components/admin/CreatorDataUpload';
import { supabase } from '../../lib/supabase';

function formatMonthYear(month, year) {
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('default', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PAGE_SIZE = 10;

const PerformanceUpload = () => {
  const [periodUploads, setPeriodUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchGroupedUploads = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('creator_performance')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch uploads');
        setLoading(false);
        return;
      }
      const grouped = {};
      data.forEach(row => {
        const period = row.raw_data?.period || '-';
        const key = `${row.period_year}-${row.period_month}-${period}`;
        if (!grouped[key]) {
          grouped[key] = {
            period,
            period_month: row.period_month,
            period_year: row.period_year,
            created_at: row.created_at,
            count: 1,
            rows: [row],
          };
        } else {
          grouped[key].count += 1;
          grouped[key].rows.push(row);
          if (row.created_at > grouped[key].created_at) {
            grouped[key].created_at = row.created_at;
          }
        }
      });
      const groupedArr = Object.values(grouped).sort((a, b) => b.created_at.localeCompare(a.created_at));
      setPeriodUploads(groupedArr);
      setLoading(false);
    };
    fetchGroupedUploads();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(periodUploads.length / PAGE_SIZE);
  const paginatedUploads = periodUploads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openModal = (upload) => {
    setModalData(upload);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  return (
    <div>
      <h2>Upload Creator Performance Data</h2>
      <CreatorDataUpload />
      <hr style={{ margin: '2rem 0' }} />
      <h3>Existing Performance Uploads</h3>
      {loading ? <div>Loading...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: 16}}>
            <thead>
              <tr style={{background: '#f3f4f6'}}>
                <th style={{padding: 8, border: '1px solid #e5e7eb'}}>Period</th>
                <th style={{padding: 8, border: '1px solid #e5e7eb'}}>Month/Year</th>
                <th style={{padding: 8, border: '1px solid #e5e7eb'}}># Creators</th>
                <th style={{padding: 8, border: '1px solid #e5e7eb'}}>Upload Date</th>
                <th style={{padding: 8, border: '1px solid #e5e7eb'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUploads.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', padding:16}}>No uploads found.</td></tr>
              ) : paginatedUploads.map((upload, idx) => (
                <tr key={upload.period + upload.period_month + upload.period_year}>
                  <td style={{padding: 8, border: '1px solid #e5e7eb'}}>{upload.period}</td>
                  <td style={{padding: 8, border: '1px solid #e5e7eb'}}>{formatMonthYear(upload.period_month, upload.period_year)}</td>
                  <td style={{padding: 8, border: '1px solid #e5e7eb'}}>{upload.count}</td>
                  <td style={{padding: 8, border: '1px solid #e5e7eb'}}>{formatDate(upload.created_at)}</td>
                  <td style={{padding: 8, border: '1px solid #e5e7eb'}}>
                    <button style={{marginRight:8}} onClick={() => openModal(upload)}>View Details</button>
                    <button onClick={() => alert('Delete coming soon!')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:8}}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      )}
      {/* Modal for View Details */}
      {modalOpen && modalData && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', borderRadius:8, padding:24, minWidth:320, maxWidth:900, maxHeight:'90vh', overflow:'auto', boxShadow:'0 2px 16px rgba(0,0,0,0.2)'}}>
            <h3 style={{marginBottom:16}}>Details for Period: <span style={{color:'#2563eb'}}>{modalData.period}</span></h3>
            <table style={{width:'100%', borderCollapse:'collapse', marginBottom:16}}>
              <thead>
                <tr style={{background:'#f3f4f6'}}>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>Username</th>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>Diamonds</th>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>Valid Days</th>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>Live Hours</th>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>New Followers</th>
                  <th style={{padding:6, border:'1px solid #e5e7eb'}}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {modalData.rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{row.raw_data?.username_tiktok || '-'}</td>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{row.diamonds}</td>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{row.valid_days}</td>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{row.live_hours}</td>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{row.new_followers}</td>
                    <td style={{padding:6, border:'1px solid #e5e7eb'}}>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={closeModal} style={{marginTop:8, padding:'6px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:4}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceUpload; 