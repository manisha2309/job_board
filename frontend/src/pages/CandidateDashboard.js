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
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e8e8" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 44 44)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="600" fill={color}>{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#999">/100</text>
    </svg>
  );
};

const AnalysisModal = ({ data, onClose }) => {
  if (!data || !data.analysis) return null;
  const { analysis, jobTitle, company } = data;
  const recColors = {
    'Strong Match':  { bg: '#E1F5EE', color: '#0F6E56' },
    'Good Match':    { bg: '#E6F1FB', color: '#185FA5' },
    'Partial Match': { bg: '#FAEEDA', color: '#854F0B' },
    'Weak Match':    { bg: '#FCEBEB', color: '#A32D2D' },
  };
  const rec = recColors[analysis.recommendation] || recColors['Partial Match'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'fadeUp 0.22s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes fadeUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '16px', background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>✕</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '22px' }}>🤖</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e' }}>AI Resume Analysis</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#666' }}>{jobTitle} · {company}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8f8fc', borderRadius: '12px', padding: '18px 20px', marginBottom: '18px', border: '1px solid #ebebeb', flexWrap: 'wrap' }}>
          <ScoreRing score={analysis.matchScore || 0} />
          <div style={{ flex: 1, minWidth: '180px' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', background: rec.bg, color: rec.color }}>{analysis.recommendation}</span>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>{analysis.summary}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '14px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>✅ Strengths</p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#333', lineHeight: 1.8 }}>
              {(analysis.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '14px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>⚠️ Gaps</p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#333', lineHeight: 1.8 }}>
              {(analysis.gaps || []).map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '14px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>🎯 Keywords Matched</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(analysis.keywordsMatched || []).map((k, i) => <span key={i} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: '#E1F5EE', color: '#0F6E56' }}>{k}</span>)}
            </div>
          </div>
          <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '14px', border: '1px solid #ebebeb' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>❌ Keywords Missing</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(analysis.keywordsMissing || []).map((k, i) => <span key={i} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: '#FCEBEB', color: '#A32D2D' }}>{k}</span>)}
            </div>
          </div>
        </div>
        <div style={{ background: '#f8f8fc', borderRadius: '10px', padding: '14px', border: '1px solid #ebebeb' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: '#444', textTransform: 'uppercase' }}>💡 Improvement Tips</p>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#333', lineHeight: 1.8 }}>
            {(analysis.improvementTips || []).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Withdraw confirmation modal
const WithdrawModal = ({ app, onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }} onClick={onCancel}>
    <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Withdraw Application?</h3>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
        Are you sure you want to withdraw your application for <strong>{app?.job?.title}</strong> at <strong>{app?.job?.company}</strong>? This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #ddd', background: '#fff', color: '#444', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Withdrawing…' : 'Yes, Withdraw'}
        </button>
      </div>
    </div>
  </div>
);

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [modalData, setModalData] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/applications/my-applications`);
      setApplications(res.data);
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (app) => {
    if (app.aiAnalysis?.matchScore !== undefined) {
      setModalData({ analysis: app.aiAnalysis, jobTitle: app.job.title, company: app.job.company });
      return;
    }
    setAnalyzing(app._id);
    setAnalysisError('');
    try {
      const res = await axios.post(`${config.API_URL}/api/analyze-resume/${app._id}`);
      setApplications(prev => prev.map(a => a._id === app._id ? { ...a, aiAnalysis: res.data.analysis } : a));
      setModalData({ analysis: res.data.analysis, jobTitle: app.job.title, company: app.job.company });
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await axios.delete(`${config.API_URL}/api/applications/${withdrawTarget._id}/withdraw`);
      setApplications(prev => prev.filter(a => a._id !== withdrawTarget._id));
      setWithdrawTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to withdraw application');
      setWithdrawTarget(null);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#666' }}>Loading your applications…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>My Applications</h1>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Track and analyze your job applications</p>
          </div>
          <Link to="/jobs" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            + Browse Jobs
          </Link>
        </div>

        {/* Stats bar */}
        {applications.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {Object.entries(STATUS).map(([key, val]) => (
              <div key={key} style={{ background: '#fff', border: `1.5px solid ${val.color}`, borderRadius: '50px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: val.color }}>{applications.filter(a => a.status === key).length}</span>
                <span style={{ color: '#555' }}>{val.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}
        {analysisError && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{analysisError}</div>}

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #ebebeb' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ color: '#1a1a2e', marginBottom: '0.5rem' }}>No applications yet</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Start applying to jobs and track your progress here.</p>
            <Link to="/jobs" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>Find Jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
            {applications.map(app => {
              const st = STATUS[app.status] || STATUS.pending;
              const score = app.aiAnalysis?.matchScore;
              const hasRealAnalysis = app.aiAnalysis && app.aiAnalysis.matchScore !== undefined;
              const scoreColor = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#A32D2D';
              const canWithdraw = !['shortlisted', 'rejected'].includes(app.status);

              return (
                <div key={app._id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(102,126,234,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {app.job?.company?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e' }}>{app.job?.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#667eea', fontWeight: 600 }}>{app.job?.company}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#555' }}>
                    <span>📍 {app.job?.location}</span>
                    <span>💼 {app.job?.type}</span>
                    {app.job?.salary && <span>💰 {app.job.salary}</span>}
                  </div>

                  {hasRealAnalysis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8f8fc', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', color: '#444', border: '1px solid #ebebeb' }}>
                      <span>🤖 AI Score</span>
                      <strong style={{ color: scoreColor }}>{score}/100</strong>
                      <span style={{ color: '#888', fontStyle: 'italic' }}>· {app.aiAnalysis.recommendation}</span>
                    </div>
                  )}

                  {app.coverLetter && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#777', fontStyle: 'italic', borderLeft: '3px solid #667eea', paddingLeft: '8px', lineHeight: 1.5 }}>
                      "{app.coverLetter.substring(0, 90)}…"
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* AI Analyze button */}
                      <button onClick={() => handleAnalyze(app)} disabled={analyzing === app._id} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 13px', fontSize: '0.78rem', fontWeight: 600, cursor: analyzing === app._id ? 'not-allowed' : 'pointer', opacity: analyzing === app._id ? 0.6 : 1 }}>
                        {analyzing === app._id ? '⏳ Analyzing…' : hasRealAnalysis ? '🤖 View Analysis' : '🤖 AI Analyze'}
                      </button>
                      {/* View Job */}
                      <Link to={`/jobs/${app.job?._id}`} style={{ background: '#f5f5f7', color: '#444', border: '1px solid #ddd', borderRadius: '7px', padding: '7px 13px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                        View Job
                      </Link>
                      {/* Withdraw button */}
                      {canWithdraw && (
                        <button onClick={() => setWithdrawTarget(app)} style={{ background: '#fff', color: '#e53e3e', border: '1.5px solid #e53e3e', borderRadius: '7px', padding: '7px 13px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalData && <AnalysisModal data={modalData} onClose={() => setModalData(null)} />}
      {withdrawTarget && <WithdrawModal app={withdrawTarget} onConfirm={handleWithdraw} onCancel={() => setWithdrawTarget(null)} loading={withdrawing} />}
    </div>
  );
};

export default CandidateDashboard;