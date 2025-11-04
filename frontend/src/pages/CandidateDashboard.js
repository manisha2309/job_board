import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await axios.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      reviewed: '#17a2b8',
      shortlisted: '#28a745',
      rejected: '#dc3545',
      accepted: '#007bff'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="page-title">My Applications</h1>
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {applications.length === 0 ? (
          <div className="empty-state-large">
            <h2>No Applications Yet</h2>
            <p>You haven't applied to any jobs yet. Start exploring opportunities!</p>
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map(app => (
              <div key={app._id} className="application-item">
                <div className="application-item-header">
                  <h3>{app.job.title}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(app.status) }}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="application-details">
                  <p className="company-name">{app.job.company}</p>
                  <p className="job-info">
                    <span>📍 {app.job.location}</span>
                    <span>💼 {app.job.type}</span>
                  </p>
                  <p className="job-salary">💰 {app.job.salary}</p>
                </div>

                {app.coverLetter && (
                  <div className="cover-letter-preview">
                    <strong>Cover Letter:</strong>
                    <p>{app.coverLetter.substring(0, 100)}...</p>
                  </div>
                )}

                <div className="application-item-footer">
                  <span className="applied-date">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  <Link to={`/jobs/${app.job._id}`} className="btn btn-sm btn-secondary">
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;