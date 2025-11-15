const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { chromium } = require('playwright');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Rate limiters
const scrapeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 scrape requests per windowMs
  message: 'Too many scrape requests, please try again later.',
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 download requests per windowMs
  message: 'Too many download requests, please try again later.',
});

// Store active scraping jobs
const jobs = new Map();

// Scrape endpoint
app.post('/api/scrape', scrapeLimiter, async (req, res) => {
  const { url, loginSelectors, proxyConfig } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const jobId = uuidv4();
  const outputDir = path.join(__dirname, 'output', jobId);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Initialize job
  jobs.set(jobId, {
    id: jobId,
    url,
    status: 'started',
    progress: 0,
    logs: [],
    outputDir,
    createdAt: new Date().toISOString(),
  });

  // Start scraping in background
  scrapeWebsite(jobId, url, loginSelectors, proxyConfig, outputDir);

  res.json({ jobId, message: 'Scraping job started' });
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

// Download ZIP archive
app.get('/api/download/:jobId', downloadLimiter, (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job not completed yet' });
  }

  const zipPath = path.join(__dirname, 'output', `${jobId}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'ZIP file not found' });
  }

  res.download(zipPath, `scrape-${jobId}.zip`);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main scraping function
async function scrapeWebsite(jobId, targetUrl, loginSelectors, proxyConfig, outputDir) {
  const job = jobs.get(jobId);
  
  try {
    addLog(jobId, `Starting scrape of ${targetUrl}`);
    updateJobStatus(jobId, 'running', 10);

    // Launch browser with optional proxy
    const browserOptions = {
      headless: true,
    };

    if (process.env.PROXY_TARGET) {
      browserOptions.proxy = {
        server: process.env.PROXY_TARGET,
      };
    }

    const browser = await chromium.launch(browserOptions);
    const context = await browser.newContext();
    const page = await context.newPage();

    addLog(jobId, 'Browser launched');
    updateJobStatus(jobId, 'running', 20);

    // Navigate to target URL
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    addLog(jobId, `Navigated to ${targetUrl}`);
    updateJobStatus(jobId, 'running', 30);

    // Handle login if selectors provided
    if (loginSelectors && loginSelectors.usernameSelector) {
      addLog(jobId, 'Attempting login...');
      await handleLogin(page, loginSelectors);
      addLog(jobId, 'Login completed');
    }

    updateJobStatus(jobId, 'running', 40);

    // Save the main page
    const content = await page.content();
    const mainFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(mainFile, content);
    addLog(jobId, 'Saved main page');

    updateJobStatus(jobId, 'running', 60);

    // Extract and save resources
    await saveResources(page, outputDir, jobId);
    
    updateJobStatus(jobId, 'running', 80);

    await browser.close();
    addLog(jobId, 'Browser closed');

    // Create ZIP archive
    await createZipArchive(jobId, outputDir);
    
    updateJobStatus(jobId, 'completed', 100);
    addLog(jobId, 'Scraping completed successfully');

  } catch (error) {
    console.error(`Error in job ${jobId}:`, error);
    updateJobStatus(jobId, 'failed', job.progress);
    addLog(jobId, `Error: ${error.message}`);
  }
}

async function handleLogin(page, loginSelectors) {
  const { usernameSelector, passwordSelector, username, password, submitSelector, successSelector } = loginSelectors;

  if (usernameSelector && username) {
    await page.fill(usernameSelector, username);
  }

  if (passwordSelector && password) {
    await page.fill(passwordSelector, password);
  }

  if (submitSelector) {
    await page.click(submitSelector);
  }

  if (successSelector) {
    await page.waitForSelector(successSelector, { timeout: 10000 });
  } else {
    await page.waitForTimeout(2000);
  }
}

async function saveResources(page, outputDir, jobId) {
  addLog(jobId, 'Extracting resources...');

  // Create subdirectories
  const cssDir = path.join(outputDir, 'css');
  const jsDir = path.join(outputDir, 'js');
  const imgDir = path.join(outputDir, 'images');

  [cssDir, jsDir, imgDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Get all resource URLs
  // eslint-disable-next-line no-undef
  const resources = await page.evaluate(() => {
    const urls = {
      css: [],
      js: [],
      images: [],
    };

    // CSS files
    // eslint-disable-next-line no-undef
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      urls.css.push(link.href);
    });

    // JS files
    // eslint-disable-next-line no-undef
    document.querySelectorAll('script[src]').forEach(script => {
      urls.js.push(script.src);
    });

    // Images
    // eslint-disable-next-line no-undef
    document.querySelectorAll('img[src]').forEach(img => {
      urls.images.push(img.src);
    });

    return urls;
  });

  addLog(jobId, `Found ${resources.css.length} CSS, ${resources.js.length} JS, ${resources.images.length} images`);

  // Note: In a production app, you'd download these resources
  // For now, we just log them
  addLog(jobId, 'Resources extracted');
}

async function createZipArchive(jobId, outputDir) {
  const zipPath = path.join(__dirname, 'output', `${jobId}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      addLog(jobId, `ZIP created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();
  });
}

function updateJobStatus(jobId, status, progress) {
  const job = jobs.get(jobId);
  if (job) {
    job.status = status;
    job.progress = progress;
    job.updatedAt = new Date().toISOString();
  }
}

function addLog(jobId, message) {
  const job = jobs.get(jobId);
  if (job) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
    };
    job.logs.push(logEntry);
    console.log(`[${jobId}] ${message}`);
  }
}

app.listen(PORT, () => {
  console.log(`Fortunate-Scraper backend running on port ${PORT}`);
  console.log(`Proxy: ${process.env.PROXY_TARGET || 'Not configured'}`);
});
