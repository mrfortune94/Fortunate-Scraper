<<<<<<< HEAD
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8080/api'

function App() {
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameSelector, setUsernameSelector] = useState('')
  const [passwordSelector, setPasswordSelector] = useState('')
  const [submitSelector, setSubmitSelector] = useState('')
  const [successSelector, setSuccessSelector] = useState('')
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jobs`)
        setJobs(response.data)
        
        if (selectedJob) {
          const updated = response.data.find(j => j.id === selectedJob.id)
          if (updated) {
            setSelectedJob(updated)
          }
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 2000)
    return () => clearInterval(interval)
  }, [selectedJob])

  const handleScrape = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loginSelectors = usernameSelector ? {
        username,
        password,
        usernameSelector,
        passwordSelector,
        submitSelector,
        successSelector,
      } : null

      const response = await axios.post(`${API_BASE_URL}/scrape`, {
        url,
        loginSelectors,
      })

      alert(`Scraping started! Job ID: ${response.data.jobId}`)
      // Jobs will be refreshed automatically by the useEffect interval
    } catch (error) {
      console.error('Error starting scrape:', error)
      alert('Error starting scrape: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (jobId) => {
    try {
      window.open(`${API_BASE_URL}/download/${jobId}`, '_blank')
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Error downloading: ' + error.message)
    }
  }

  const selectJob = (job) => {
    setSelectedJob(job)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>⚡ Fortunate-Scraper</h1>
          <p>Ultra-deep web scraper with Playwright</p>
        </header>

        <div className="main-content">
          <div className="scrape-form-container">
            <h2>Start New Scrape</h2>
            <form onSubmit={handleScrape} className="scrape-form">
              <div className="form-group">
                <label>Target URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="auth-section">
                <h3>Authentication (Optional)</h3>
=======
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [url, setUrl] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [auth, setAuth] = useState({
    username: '',
    password: '',
    usernameSelector: 'input[name="username"]',
    passwordSelector: 'input[name="password"]',
    submitSelector: 'button[type="submit"]',
    successSelector: ''
  });
  const [proxy, setProxy] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for job status updates
  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobs/${currentJob.id}`);
        setCurrentJob(response.data);
      } catch (error) {
        console.error('Error fetching job status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJob]);

  const handleScrape = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        url,
        auth: showAuth ? auth : null,
        proxy: proxy || null
      };

      const response = await axios.post(`${API_BASE_URL}/api/scrape`, payload);
      setCurrentJob({ id: response.data.jobId, status: 'queued', logs: [], progress: 0 });
    } catch (error) {
      console.error('Error starting scrape:', error);
      alert('Failed to start scraping job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentJob) return;
    
    window.open(`${API_BASE_URL}/api/download/${currentJob.id}`, '_blank');
  };

  const handleReset = () => {
    setCurrentJob(null);
    setUrl('');
  };

  return (
    <div className="app">
      <div className="background-overlay"></div>
      
      <div className="container">
        <header className="header">
          <h1>⚡ Fortunate-Scraper</h1>
          <p className="subtitle">Ultra-Deep Website Scraper & Duplicator</p>
        </header>

        {!currentJob ? (
          <div className="scrape-form">
            <div className="form-group">
              <label>Target URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showAuth}
                  onChange={(e) => setShowAuth(e.target.checked)}
                />
                <span style={{ marginLeft: '8px' }}>Enable Authentication</span>
              </label>
            </div>

            {showAuth && (
              <div className="auth-panel">
                <h3>Authentication Details</h3>
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
<<<<<<< HEAD
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
=======
                      value={auth.username}
                      onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                      className="input-field"
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
<<<<<<< HEAD
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                    />
                  </div>
                </div>

=======
                      value={auth.password}
                      onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                <div className="form-row">
                  <div className="form-group">
                    <label>Username Selector</label>
                    <input
                      type="text"
<<<<<<< HEAD
                      value={usernameSelector}
                      onChange={(e) => setUsernameSelector(e.target.value)}
                      placeholder="#username"
=======
                      value={auth.usernameSelector}
                      onChange={(e) => setAuth({ ...auth, usernameSelector: e.target.value })}
                      className="input-field"
                      placeholder='input[name="username"]'
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Selector</label>
                    <input
                      type="text"
<<<<<<< HEAD
                      value={passwordSelector}
                      onChange={(e) => setPasswordSelector(e.target.value)}
                      placeholder="#password"
                    />
                  </div>
                </div>

=======
                      value={auth.passwordSelector}
                      onChange={(e) => setAuth({ ...auth, passwordSelector: e.target.value })}
                      className="input-field"
                      placeholder='input[name="password"]'
                    />
                  </div>
                </div>
                
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                <div className="form-row">
                  <div className="form-group">
                    <label>Submit Button Selector</label>
                    <input
                      type="text"
<<<<<<< HEAD
                      value={submitSelector}
                      onChange={(e) => setSubmitSelector(e.target.value)}
                      placeholder="button[type='submit']"
                    />
                  </div>
                  <div className="form-group">
                    <label>Success Indicator Selector</label>
                    <input
                      type="text"
                      value={successSelector}
                      onChange={(e) => setSuccessSelector(e.target.value)}
                      placeholder=".dashboard"
=======
                      value={auth.submitSelector}
                      onChange={(e) => setAuth({ ...auth, submitSelector: e.target.value })}
                      className="input-field"
                      placeholder='button[type="submit"]'
                    />
                  </div>
                  <div className="form-group">
                    <label>Success Selector (optional)</label>
                    <input
                      type="text"
                      value={auth.successSelector}
                      onChange={(e) => setAuth({ ...auth, successSelector: e.target.value })}
                      className="input-field"
                      placeholder='.dashboard'
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
                    />
                  </div>
                </div>
              </div>
<<<<<<< HEAD

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '🔄 Starting...' : '🚀 Start Scrape'}
              </button>
            </form>
          </div>

          <div className="jobs-container">
            <h2>Scraping Jobs</h2>
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <p className="no-jobs">No jobs yet. Start a scrape above!</p>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                    onClick={() => selectJob(job)}
                  >
                    <div className="job-header">
                      <span className={`status-badge status-${job.status}`}>
                        {job.status}
                      </span>
                      <span className="job-url">{job.url}</span>
                    </div>
                    <div className="job-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{job.progress}%</span>
                    </div>
                    {job.status === 'completed' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(job.id)
                        }}
                        className="btn-download"
                      >
                        📥 Download ZIP
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedJob && (
          <div className="logs-container">
            <h2>Job Logs - {selectedJob.id.substring(0, 8)}</h2>
            <div className="logs">
              {selectedJob.logs.length === 0 ? (
                <p>No logs yet...</p>
              ) : (
                selectedJob.logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
=======
            )}

            <div className="form-group">
              <label>Proxy (optional)</label>
              <input
                type="text"
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
                placeholder="http://proxy.example.com:8080"
                className="input-field"
              />
            </div>

            <button 
              onClick={handleScrape} 
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Starting...' : '🚀 Start Scraping'}
            </button>
          </div>
        ) : (
          <div className="job-status">
            <div className="status-header">
              <h2>Job Status</h2>
              <span className={`status-badge status-${currentJob.status}`}>
                {currentJob.status}
              </span>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${currentJob.progress || 0}%` }}
              ></div>
              <span className="progress-text">{currentJob.progress || 0}%</span>
            </div>

            <div className="logs-container">
              <h3>Logs</h3>
              <div className="logs">
                {currentJob.logs && currentJob.logs.length > 0 ? (
                  currentJob.logs.map((log, index) => (
                    <div key={index} className="log-entry">
                      <span className="log-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="log-entry">
                    <span className="log-message">Waiting for logs...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              {currentJob.status === 'completed' && (
                <button onClick={handleDownload} className="btn-success">
                  📥 Download ZIP
                </button>
              )}
              <button onClick={handleReset} className="btn-secondary">
                🔄 New Scrape
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>⚠️ Use only on sites you own or have permission to scrape</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
