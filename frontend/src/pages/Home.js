
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/jobs`);
      setFeaturedJobs(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Job Today</h1>
          <p className="hero-subtitle">
            Connect with top employers and discover thousands of job opportunities
          </p>
          <div className="hero-buttons">
            {!user && (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/jobs" className="btn btn-secondary btn-lg">
                  Browse Jobs
                </Link>
              </>
            )}
            {user && user.role === 'candidate' && (
              <Link to="/jobs" className="btn btn-primary btn-lg">
                Find Jobs
              </Link>
            )}
            {user && user.role === 'employer' && (
              <Link to="/post-job" className="btn btn-primary btn-lg">
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Job Search</h3>
              <p>Find the perfect job with our powerful search and filter options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Top Companies</h3>
              <p>Connect with leading employers across various industries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Apply</h3>
              <p>Apply to multiple jobs with just one click</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Applications</h3>
              <p>Monitor your application status in real-time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-jobs">
        <div className="container">
          <h2 className="section-title">Featured Jobs</h2>
          
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : featuredJobs.length > 0 ? (
            <div className="jobs-grid">
              {featuredJobs.map(job => (
                <div key={job._id} className="job-card">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                  <p className="job-location">📍 {job.location}</p>
                  <p className="job-type">{job.type}</p>
                  <p className="job-salary">💰 {job.salary}</p>
                  <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-jobs">No jobs available at the moment.</p>
          )}
          
          <div className="view-all">
            <Link to="/jobs" className="btn btn-secondary">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of job seekers and employers today</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;