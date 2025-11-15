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
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Username Selector</label>
                    <input
                      type="text"
                      value={usernameSelector}
                      onChange={(e) => setUsernameSelector(e.target.value)}
                      placeholder="#username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Selector</label>
                    <input
                      type="text"
                      value={passwordSelector}
                      onChange={(e) => setPasswordSelector(e.target.value)}
                      placeholder="#password"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Submit Button Selector</label>
                    <input
                      type="text"
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
                    />
                  </div>
                </div>
              </div>

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
