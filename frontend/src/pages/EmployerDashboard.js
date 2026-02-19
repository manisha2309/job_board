import config from '../config';
import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';


const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/jobs/employer/my-jobs`);
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/applications/job/${jobId}`);
      setApplications(response.data);
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
      setError('Failed to update application status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await axios.delete(`${config.API_URL}/api/jobs/${jobId}`);
      fetchMyJobs();
      if (selectedJob === jobId) {
        setSelectedJob(null);
        setApplications([]);
      }
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="page-title">Employer Dashboard</h1>
          <Link to="/post-job" className="btn btn-primary">
            Post New Job
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-content">
          <div className="jobs-panel">
            <h2 className="panel-title">My Job Posts ({jobs.length})</h2>
            
            {jobs.length === 0 ? (
              <div className="empty-state">
                <p>You haven't posted any jobs yet.</p>
                <Link to="/post-job" className="btn btn-primary">
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map(job => (
                  <div 
                    key={job._id} 
                    className={`job-card ${selectedJob === job._id ? 'active' : ''}`}
                  >
                    <div className="job-card-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="job-meta">{job.location} • {job.type}</p>
                      </div>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="job-stats">
                      <span>📊 {job.applicationCount} Applications</span>
                      <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="job-actions">
                      <button 
                        onClick={() => fetchApplications(job._id)}
                        className="btn btn-sm btn-primary"
                      >
                        View Applications
                      </button>
                      <button 
                        onClick={() => toggleJobStatus(job._id, job.status)}
                        className="btn btn-sm btn-secondary"
                      >
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button 
                        onClick={() => deleteJob(job._id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="applications-panel">
            <h2 className="panel-title">
              {selectedJob ? `Applications (${applications.length})` : 'Select a job to view applications'}
            </h2>
            
            {selectedJob && applications.length === 0 && (
              <div className="empty-state">
                <p>No applications received yet for this job.</p>
              </div>
            )}

            {applications.length > 0 && (
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="application-header">
                      <div>
                        <h3>{app.candidate.name}</h3>
                        <p className="application-email">{app.candidate.email}</p>
                        {app.candidate.phone && (
                          <p className="application-phone">📞 {app.candidate.phone}</p>
                        )}
                      </div>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                    </div>

                    {app.candidate.skills && app.candidate.skills.length > 0 && (
                      <div className="skills">
                        <strong>Skills:</strong> {app.candidate.skills.join(', ')}
                      </div>
                    )}

                    {app.candidate.experience && (
                      <div className="experience">
                        <strong>Experience:</strong>
                        <p>{app.candidate.experience}</p>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="cover-letter">
                        <strong>Cover Letter:</strong>
                        <p>{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="application-footer">
                      <span className="application-date">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      
                      {app.resume && (
                        <a 
                          href={`http://localhost:5000/uploads/${app.resume}`}
                          //href={`${process.env.REACT_APP_API_URL.replace('/api','')}/uploads/${app.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          View Resume
                        </a>
                      )}
                    </div>

                    <div className="status-actions">
                      <button 
                        onClick={() => updateApplicationStatus(app._id, 'reviewed')}
                        className="btn btn-sm"
                        disabled={app.status === 'reviewed'}
                      >
                        Mark Reviewed
                      </button>
                      <button 
                        onClick={() => updateApplicationStatus(app._id, 'shortlisted')}
                        className="btn btn-sm btn-primary"
                        disabled={app.status === 'shortlisted'}
                      >
                        Shortlist
                      </button>
                      <button 
                        onClick={() => updateApplicationStatus(app._id, 'rejected')}
                        className="btn btn-sm btn-danger"
                        disabled={app.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;