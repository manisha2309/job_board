import config from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

useEffect(() => {
  fetchJobDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      setError('Only candidates can apply for jobs');
      return;
    }

    if (!resume) {
      setError('Please upload your resume');
      return;
    }

    setApplying(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('jobId', id);
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resume);

    try {
      await axios.post(`${config.API_URL}/api/applications`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Application submitted successfully!');
      setCoverLetter('');
      setResume(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error && !job) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail-content">
          <div className="job-main">
            <div className="job-detail-header">
              <h1 className="job-detail-title">{job.title}</h1>
              <span className="job-type-badge">{job.type}</span>
            </div>

            <div className="job-meta">
              <div className="meta-item">
                <span className="meta-label">Company:</span>
                <span className="meta-value">{job.company}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Location:</span>
                <span className="meta-value">📍 {job.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Salary:</span>
                <span className="meta-value">💰 {job.salary}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">📁 {job.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Applications:</span>
                <span className="meta-value">{job.applicationCount}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Posted:</span>
                <span className="meta-value">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="job-section">
              <h2>Job Description</h2>
              <p className="job-text">{job.description}</p>
            </div>

            <div className="job-section">
              <h2>Requirements</h2>
              <p className="job-text">{job.requirements}</p>
            </div>

            {job.employer && (
              <div className="job-section">
                <h2>Contact Information</h2>
                <p><strong>Name:</strong> {job.employer.name}</p>
                <p><strong>Email:</strong> {job.employer.email}</p>
                {job.employer.phone && <p><strong>Phone:</strong> {job.employer.phone}</p>}
              </div>
            )}
          </div>

          <div className="job-sidebar">
            <div className="apply-card">
              <h3>Apply for this Job</h3>
              
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              {user && user.role === 'candidate' && !message ? (
                <form onSubmit={handleApply} className="apply-form">
                  <div className="form-group">
                    <label className="form-label">Cover Letter (Optional)</label>
                    <textarea
                      className="form-textarea"
                      rows="5"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the employer why you're a good fit..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resume *</label>
                    <input
                      type="file"
                      className="form-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files[0])}
                      required
                    />
                    <small className="form-hint">PDF, DOC, or DOCX (Max 5MB)</small>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              ) : user && user.role === 'employer' ? (
                <p className="info-text">You cannot apply as an employer</p>
              ) : !user ? (
                <div>
                  <p className="info-text">Please login to apply for this job</p>
                  <button onClick={() => navigate('/login')} className="btn btn-primary btn-full">
                    Login to Apply
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;