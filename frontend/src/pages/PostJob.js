import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './PostJob.css';

const PostJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    type: 'Full-time',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/jobs', formData);
      setSuccess('Job posted successfully!');
      setTimeout(() => {
        navigate('/employer-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page">
      <div className="container">
        <div className="post-job-container">
          <h1 className="page-title">Post a New Job</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="post-job-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company" className="form-label">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-input"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Tech Company Inc."
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location" className="form-label">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, NY"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary" className="form-label">Salary Range</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className="form-input"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type" className="form-label">Job Type *</label>
                <select
                  id="type"
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Technology, Marketing, Sales"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Job Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what makes your company great..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements" className="form-label">Requirements *</label>
              <textarea
                id="requirements"
                name="requirements"
                className="form-textarea"
                rows="6"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="List the required skills, qualifications, and experience..."
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/employer-dashboard')} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;