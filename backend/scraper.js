const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');

/**
 * Start a scraping job
 */
async function startScrape(jobId, targetUrl, auth, proxy, jobs) {
  const job = jobs.get(jobId);
  job.status = 'running';
  job.progress = 0;
  addLog(job, `Starting scrape of ${targetUrl}`);

  try {
    // Create output directory for this job
    const outputDir = path.join(__dirname, 'downloads', jobId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Launch browser with optional proxy
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    if (proxy) {
      launchOptions.proxy = {
        server: proxy
      };
      addLog(job, `Using proxy: ${proxy}`);
    }

    const browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    addLog(job, 'Browser launched successfully');

    // Navigate to target URL
    addLog(job, `Navigating to ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
    job.progress = 10;

    // Handle authentication if provided
    if (auth && auth.username && auth.password) {
      addLog(job, 'Attempting authentication...');
      await handleAuthentication(page, auth, job);
      job.progress = 20;
    }

    // Collect all pages and resources
    const visited = new Set();
    const toVisit = [targetUrl];
    const baseUrl = new URL(targetUrl);
    
    let pageCount = 0;
    const maxPages = 500; // Limit for safety

    while (toVisit.length > 0 && pageCount < maxPages) {
      const currentUrl = toVisit.shift();
      
      if (visited.has(currentUrl)) {
        continue;
      }

      visited.add(currentUrl);
      pageCount++;

      try {
        addLog(job, `Scraping page ${pageCount}: ${currentUrl}`);
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });

        // Save page HTML
        const content = await page.content();
        const filename = generateFilename(currentUrl, baseUrl);
        const filepath = path.join(outputDir, filename);
        
        // Create directory if needed
        const dirname = path.dirname(filepath);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        
        fs.writeFileSync(filepath, content);

        // Download images, CSS, JS
        await downloadPageAssets(page, outputDir, baseUrl, job);

        // Find new links on the page
        const links = await page.$$eval('a[href]', anchors => 
          anchors.map(a => a.href).filter(Boolean)
        );

        for (const link of links) {
          try {
            const linkUrl = new URL(link, currentUrl);
            // Only follow links on the same domain
            if (linkUrl.hostname === baseUrl.hostname && !visited.has(linkUrl.href)) {
              toVisit.push(linkUrl.href);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }

        job.progress = Math.min(20 + Math.floor((pageCount / maxPages) * 60), 80);
      } catch (err) {
        addLog(job, `Error scraping ${currentUrl}: ${err.message}`);
      }
    }

    addLog(job, `Scraped ${pageCount} pages`);
    job.progress = 85;

    await browser.close();
    addLog(job, 'Browser closed');

    // Create ZIP archive
    addLog(job, 'Creating ZIP archive...');
    const zipPath = await createZipArchive(outputDir, jobId);
    job.zipPath = zipPath;
    job.progress = 100;
    job.status = 'completed';
    addLog(job, `Scrape completed! ZIP file ready for download`);

  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    addLog(job, `ERROR: ${error.message}`);
    console.error('Scrape error:', error);
  }
}

/**
 * Handle login authentication
 */
async function handleAuthentication(page, auth, job) {
  const { username, password, usernameSelector, passwordSelector, submitSelector, successSelector } = auth;

  try {
    // Wait for login form
    if (usernameSelector) {
      await page.waitForSelector(usernameSelector, { timeout: 10000 });
      await page.fill(usernameSelector, username);
      addLog(job, 'Filled username');
    }

    if (passwordSelector) {
      await page.waitForSelector(passwordSelector, { timeout: 10000 });
      await page.fill(passwordSelector, password);
      addLog(job, 'Filled password');
    }

    if (submitSelector) {
      await page.click(submitSelector);
      addLog(job, 'Clicked submit button');
    }

    // Wait for successful login
    if (successSelector) {
      await page.waitForSelector(successSelector, { timeout: 15000 });
      addLog(job, 'Login successful');
    } else {
      // Wait a bit for page to load
      await page.waitForTimeout(3000);
      addLog(job, 'Login attempted (no success selector provided)');
    }
  } catch (err) {
    addLog(job, `Authentication warning: ${err.message}`);
  }
}

/**
 * Download assets (images, CSS, JS) from the current page
 */
async function downloadPageAssets(page, outputDir, baseUrl, job) {
  try {
    // Get all image sources
    const images = await page.$$eval('img[src]', imgs => imgs.map(img => img.src));
    
    // Get all CSS links
    const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => links.map(link => link.href));
    
    // Get all script sources
    const scripts = await page.$$eval('script[src]', scripts => scripts.map(s => s.src));

    const allAssets = [...images, ...cssLinks, ...scripts];
    
    for (const assetUrl of allAssets) {
      try {
        const url = new URL(assetUrl);
        // Only download assets from the same domain
        if (url.hostname === baseUrl.hostname) {
          await downloadAsset(assetUrl, outputDir, baseUrl);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
  } catch (err) {
    addLog(job, `Asset download warning: ${err.message}`);
  }
}

/**
 * Download a single asset
 */
async function downloadAsset(assetUrl, outputDir, baseUrl) {
  try {
    const response = await fetch(assetUrl);
    if (!response.ok) return;

    const buffer = await response.arrayBuffer();
    const filename = generateFilename(assetUrl, baseUrl);
    const filepath = path.join(outputDir, filename);
    
    const dirname = path.dirname(filepath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(filepath, Buffer.from(buffer));
  } catch (err) {
    // Silently skip failed asset downloads
  }
}

/**
 * Generate a safe filename from a URL
 */
function generateFilename(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // Remove leading slash
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }
    
    // If it's the root or empty, use index.html
    if (!pathname || pathname === '/') {
      pathname = 'index.html';
    }
    
    // If no extension, add .html
    if (!path.extname(pathname)) {
      pathname += '.html';
    }
    
    return pathname;
  } catch (e) {
    // Fallback: use hash of URL
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `page-${hash}.html`;
  }
}

/**
 * Create a ZIP archive of the scraped content
 */
async function createZipArchive(sourceDir, jobId) {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(__dirname, 'downloads', `${jobId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(zipPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * Add a log entry to a job
 */
function addLog(job, message) {
  const timestamp = new Date().toISOString();
  job.logs.push({ timestamp, message });
  console.log(`[${job.id}] ${message}`);
}

module.exports = {
  startScrape
};
