import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    skills: '',
    experience: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        skills: user.skills ? user.skills.join(', ') : '',
        experience: user.experience || '',
        education: user.education || ''
      });
    }
  }, [user]);

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
      const updateData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      const response = await axios.put('/api/auth/profile', updateData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <h1 className="page-title">My Profile</h1>

          <div className="profile-info-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-basic">
                <h2>{user?.name}</h2>
                <p className="profile-role">{user?.role === 'employer' ? 'Employer' : 'Job Seeker'}</p>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="profile-form-card">
            <h2>Update Profile Information</h2>
            
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1234567890"
                  />
                </div>

                {user?.role === 'employer' && (
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">Company Name</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="form-input"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                    />
                  </div>
                )}
              </div>

              {user?.role === 'candidate' && (
                <>
                  <div className="form-group">
                    <label htmlFor="skills" className="form-label">Skills</label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      className="form-input"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. JavaScript, React, Node.js (comma separated)"
                    />
                    <small className="form-hint">Separate skills with commas</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience" className="form-label">Work Experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      className="form-textarea"
                      rows="4"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Describe your work experience..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="education" className="form-label">Education</label>
                    <textarea
                      id="education"
                      name="education"
                      className="form-textarea"
                      rows="3"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="Your educational background..."
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          {user?.role === 'candidate' && (
            <div className="profile-stats-card">
              <h2>Profile Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <p className="stat-label">Profile Completeness</p>
                    <p className="stat-value">
                      {(() => {
                        let score = 40; // Base score for having account
                        if (formData.phone) score += 10;
                        if (formData.skills) score += 20;
                        if (formData.experience) score += 20;
                        if (formData.education) score += 10;
                        return `${score}%`;
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">💼</div>
                  <div className="stat-info">
                    <p className="stat-label">Skills Listed</p>
                    <p className="stat-value">
                      {formData.skills.split(',').filter(s => s.trim()).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;