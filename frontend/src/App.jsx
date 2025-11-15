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
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={auth.username}
                      onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={auth.password}
                      onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Username Selector</label>
                    <input
                      type="text"
                      value={auth.usernameSelector}
                      onChange={(e) => setAuth({ ...auth, usernameSelector: e.target.value })}
                      className="input-field"
                      placeholder='input[name="username"]'
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Selector</label>
                    <input
                      type="text"
                      value={auth.passwordSelector}
                      onChange={(e) => setAuth({ ...auth, passwordSelector: e.target.value })}
                      className="input-field"
                      placeholder='input[name="password"]'
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Submit Button Selector</label>
                    <input
                      type="text"
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
                    />
                  </div>
                </div>
              </div>
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
