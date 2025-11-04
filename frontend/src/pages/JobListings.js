import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './JobListings.css';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    category: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filterParams);
      const response = await axios.get(`/api/jobs?${params}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    fetchJobs(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      category: ''
    });
    fetchJobs();
  };

  return (
    <div className="job-listings-page">
      <div className="container">
        <h1 className="page-title">Find Your Perfect Job</h1>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-grid">
              <div className="form-group">
                <input
                  type="text"
                  name="search"
                  placeholder="Job title, keywords, or company"
                  className="form-input"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  className="form-input"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <select
                  name="type"
                  className="form-select"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  className="form-input"
                  value={filters.category}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="search-buttons">
              <button type="submit" className="btn btn-primary">
                Search Jobs
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="results-section">
          <p className="results-count">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </p>

          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map(job => (
                <div key={job._id} className="job-item">
                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <span className="job-type-badge">{job.type}</span>
                  </div>
                  
                  <p className="job-company">{job.company}</p>
                  
                  <div className="job-details">
                    <span className="job-detail">
                      <span className="icon">📍</span> {job.location}
                    </span>
                    <span className="job-detail">
                      <span className="icon">💰</span> {job.salary}
                    </span>
                    <span className="job-detail">
                      <span className="icon">📁</span> {job.category}
                    </span>
                  </div>

                  <p className="job-description">
                    {job.description.substring(0, 150)}...
                  </p>

                  <div className="job-footer">
                    <span className="job-date">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;