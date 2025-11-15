const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const scraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// In-memory job storage
const jobs = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initiate a new scrape job
app.post('/api/scrape', async (req, res) => {
  const { url, auth, proxy } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const jobId = uuidv4();
  const job = {
    id: jobId,
    url,
    status: 'queued',
    progress: 0,
    logs: [],
    createdAt: new Date().toISOString(),
    zipPath: null
  };

  jobs.set(jobId, job);

  // Start scraping in the background
  scraper.startScrape(jobId, url, auth, proxy, jobs);

  res.json({ jobId, status: 'queued' });
});

// Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values());
  res.json(allJobs);
});

// Download ZIP file
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (!job.zipPath || !fs.existsSync(job.zipPath)) {
    return res.status(404).json({ error: 'ZIP file not found' });
  }

  res.download(job.zipPath, `scrape-${jobId}.zip`);
});

// Delete a job
app.delete('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Delete the ZIP file if it exists
  if (job.zipPath && fs.existsSync(job.zipPath)) {
    fs.unlinkSync(job.zipPath);
  }

  jobs.delete(jobId);
  res.json({ message: 'Job deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Fortunate-Scraper backend running on port ${PORT}`);
  
  // Create downloads directory if it doesn't exist
  const downloadsDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
});
