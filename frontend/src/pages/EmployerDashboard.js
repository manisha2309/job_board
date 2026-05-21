import config from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const STATUS = {
  pending:     { label: 'Pending',     color: '#BA7517', bg: '#FAEEDA' },
  reviewed:    { label: 'Reviewed',    color: '#185FA5', bg: '#E6F1FB' },
  shortlisted: { label: 'Shortlisted', color: '#0F6E56', bg: '#E1F5EE' },
  rejected:    { label: 'Rejected',    color: '#A32D2D', bg: '#FCEBEB' },
};

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#A32D2D';
  const r = 30, cx = 36, cy = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e8e8" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#999">/100</text>
    </svg>
  );
};

// Full AI analysis modal for employer
const AnalysisModal = ({ data, onClose }) => {
  if (!data || !data.analysis) return null;
  const { analysis, candidateName } = data;
  const recColors = {
    'Strong Match':  { bg: '#E1F5EE', color: '#0F6E56' },
    'Good Match':    { bg: '#E6F1FB', color: '#185FA5' },
    'Partial Match': { bg: '#FAEEDA', color: '#854F0B' },
    'Weak Match':    { bg: '#FCEBEB', color: '#A32D2D' },
  };
  const rec = recColors[analysis.recommendation] || recColors['Partial Match'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'fadeUp 0.22s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes fadeUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '16px', background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>✕</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1a1a2e' }}>AI Resume Analysis</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.83rem', color: '#666' }}>{candidateName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f8fc', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #ebebeb', flexWrap: 'wrap' }}>
          <ScoreRing score={analysis.matchScore || 0} />
          <div style={{ flex: 1, minWidth: '160px' }}>
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', background: rec.bg, color: rec.color }}>{analysis.recommendation}</span>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#444', lineHeight: 1.6 }}>{analysis.summary}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '12px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>✅ Strengths</p>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#333', lineHeight: 1.8 }}>
              {(analysis.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '12px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>⚠️ Gaps</p>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#333', lineHeight: 1.8 }}>
              {(analysis.gaps || []).map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '12px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>🎯 Keywords Matched</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {(analysis.keywordsMatched || []).map((k, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#E1F5EE', color: '#0F6E56' }}>{k}</span>)}
            </div>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '12px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>❌ Keywords Missing</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {(analysis.keywordsMissing || []).map((k, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#FCEBEB', color: '#A32D2D' }}>{k}</span>)}
            </div>
          </div>
        </div>
        <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '12px', border: '1px solid #ebebeb' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>💡 Improvement Tips</p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#333', lineHeight: 1.8 }}>
            {(analysis.improvementTips || []).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(null);
  const [modalData, setModalData] = useState(null);

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/jobs/employer/my-jobs`);
      setJobs(res.data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const res = await axios.get(`${config.API_URL}/api/applications/job/${jobId}`);
      setApplications(res.data);
      setSelectedJob(jobId);
    } catch (err) {
      setError('Failed to fetch applications');
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(`${config.API_URL}/api/applications/${applicationId}/status`, { status });
      fetchApplications(selectedJob);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`${config.API_URL}/api/jobs/${jobId}`);
      fetchMyJobs();
      if (selectedJob === jobId) { setSelectedJob(null); setApplications([]); }
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await axios.put(`${config.API_URL}/api/jobs/${jobId}`, { status: newStatus });
      fetchMyJobs();
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleAnalyze = async (app) => {
    // If already analyzed, just show modal
    if (app.aiAnalysis?.matchScore !== undefined) {
      setModalData({ analysis: app.aiAnalysis, candidateName: app.candidate.name });
      return;
    }
    setAnalyzing(app._id);
    try {
      const res = await axios.post(`${config.API_URL}/api/analyze-resume/${app._id}`);
      // Update the application in state with analysis result
      setApplications(prev => prev.map(a =>
        a._id === app._id ? { ...a, aiAnalysis: res.data.analysis } : a
      ));
      setModalData({ analysis: res.data.analysis, candidateName: app.candidate.name });
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed');
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>Employer Dashboard</h1>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Manage your job posts and review applicants</p>
          </div>
          <Link to="/post-job" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            + Post New Job
          </Link>
        </div>

        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Jobs panel */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>My Job Posts ({jobs.length})</h2>
            </div>
            {jobs.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#666', marginBottom: '1rem' }}>No jobs posted yet.</p>
                <Link to="/post-job" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>Post First Job</Link>
              </div>
            ) : (
              <div>
                {jobs.map(job => (
                  <div key={job._id} onClick={() => fetchApplications(job._id)} style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selectedJob === job._id ? '#f0f0ff' : '#fff', borderLeft: selectedJob === job._id ? '3px solid #667eea' : '3px solid transparent', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e' }}>{job.title}</h3>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: job.status === 'active' ? '#E1F5EE' : '#f5f5f5', color: job.status === 'active' ? '#0F6E56' : '#888' }}>{job.status}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#666' }}>{job.location} · {job.type}</p>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#888', marginBottom: '10px' }}>
                      <span>📊 {job.applicationCount} apps</span>
                      <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleJobStatus(job._id, job.status)} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#444', fontWeight: 600 }}>
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button onClick={() => deleteJob(job._id)} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', color: '#e53e3e', fontWeight: 600 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications panel */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden', minHeight: '400px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>
                {selectedJob ? `Applications (${applications.length})` : 'Select a job to view applications'}
              </h2>
            </div>

            {!selectedJob && (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                <p>Click a job on the left to see its applicants</p>
              </div>
            )}

            {selectedJob && applications.length === 0 && (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No applications received yet for this job.</p>
              </div>
            )}

            {applications.length > 0 && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {applications.map(app => {
                  const st = STATUS[app.status] || STATUS.pending;
                  const hasAnalysis = app.aiAnalysis?.matchScore !== undefined;
                  const score = app.aiAnalysis?.matchScore;
                  const scoreColor = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#A32D2D';

                  return (
                    <div key={app._id} style={{ border: '1px solid #ebebeb', borderRadius: '12px', padding: '16px', background: '#fafafa' }}>
                      
                      {/* Candidate header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {app.candidate.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e' }}>{app.candidate.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{app.candidate.email}</p>
                            {app.candidate.phone && <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>📞 {app.candidate.phone}</p>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* AI score badge - shown inline if analyzed */}
                          {hasAnalysis && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: `1.5px solid ${scoreColor}`, borderRadius: '20px', padding: '3px 10px', fontSize: '0.78rem' }}>
                              <span>🤖</span>
                              <strong style={{ color: scoreColor }}>{score}/100</strong>
                              <span style={{ color: '#888' }}>· {app.aiAnalysis.recommendation}</span>
                            </div>
                          )}
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {app.candidate.skills?.length > 0 && (
                        <div style={{ marginBottom: '8px', fontSize: '0.82rem', color: '#555' }}>
                          <strong>Skills:</strong> {app.candidate.skills.join(', ')}
                        </div>
                      )}

                      {/* Cover letter */}
                      {app.coverLetter && (
                        <div style={{ background: '#fff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', border: '1px solid #ebebeb', fontSize: '0.83rem', color: '#555', lineHeight: 1.5, borderLeft: '3px solid #667eea' }}>
                          {app.coverLetter.substring(0, 200)}{app.coverLetter.length > 200 ? '…' : ''}
                        </div>
                      )}

                      {/* Applied date */}
                      <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#999' }}>
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* AI Analyze button */}
                        {app.resume && (
                          <button onClick={() => handleAnalyze(app)} disabled={analyzing === app._id} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 13px', fontSize: '0.78rem', fontWeight: 600, cursor: analyzing === app._id ? 'not-allowed' : 'pointer', opacity: analyzing === app._id ? 0.7 : 1 }}>
                            {analyzing === app._id ? '⏳ Analyzing…' : hasAnalysis ? '🤖 View Analysis' : '🤖 AI Analyze'}
                          </button>
                        )}

                        {/* View Resume */}
                        {app.resume && (
                          <a href={`http://localhost:5000/uploads/${app.resume}`} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#444', border: '1px solid #ddd', borderRadius: '7px', padding: '7px 13px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                            📄 Resume
                          </a>
                        )}

                        {/* Status buttons */}
                        <button onClick={() => updateApplicationStatus(app._id, 'reviewed')} disabled={app.status === 'reviewed'} style={{ padding: '7px 13px', borderRadius: '7px', border: '1px solid #ddd', background: app.status === 'reviewed' ? '#E6F1FB' : '#fff', color: app.status === 'reviewed' ? '#185FA5' : '#444', fontSize: '0.78rem', fontWeight: 600, cursor: app.status === 'reviewed' ? 'default' : 'pointer' }}>
                          Reviewed
                        </button>
                        <button onClick={() => updateApplicationStatus(app._id, 'shortlisted')} disabled={app.status === 'shortlisted'} style={{ padding: '7px 13px', borderRadius: '7px', border: '1px solid #a7f3d0', background: app.status === 'shortlisted' ? '#E1F5EE' : '#fff', color: app.status === 'shortlisted' ? '#0F6E56' : '#0F6E56', fontSize: '0.78rem', fontWeight: 600, cursor: app.status === 'shortlisted' ? 'default' : 'pointer' }}>
                          ✓ Shortlist
                        </button>
                        <button onClick={() => updateApplicationStatus(app._id, 'rejected')} disabled={app.status === 'rejected'} style={{ padding: '7px 13px', borderRadius: '7px', border: '1px solid #fca5a5', background: app.status === 'rejected' ? '#FCEBEB' : '#fff', color: '#e53e3e', fontSize: '0.78rem', fontWeight: 600, cursor: app.status === 'rejected' ? 'default' : 'pointer' }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalData && <AnalysisModal data={modalData} onClose={() => setModalData(null)} />}
    </div>
  );
};

export default EmployerDashboard;