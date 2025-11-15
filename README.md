# Fortunate-Scraper

Fortunate-Scraper is an ultra-deep, full-website scraper and duplicator. It uses Playwright (headless browser) to crawl, log in, download every page/asset (HTML, CSS, JS, images, iframes), and outputs a browsable offline ZIP archive via a beautiful dark-theme web dashboard.

![screenshot](add_your_screenshot_here.png)

## Features

- 🌐 **Full-Site Scrape:** Recursively downloads all internal pages, scripts, images, CSS, assets—even renders JS-powered/dynamic content.
- 🛡️ **Authentication Support:** Log in before scraping (username/password form, selectors, cookies).
- 🔗 **Iframe & Asset Capture:** Downloads all iframes and embedded resources.
- 👥 **Proxy-Friendly:** Route scraping through configurable proxies (for CORS/geo/IP protection).
- 🖤 **Carbon-Fiber Dark Theme:** Modern dashboard with a gaming-inspired carbon fiber look.
- 🗃️ **One-Click ZIP Export:** Download an entire site clone as a zipped archive.
- ⚙️ **Docker & Manual Launch:** Easy to run with Docker Compose or locally.
- 🚀 **Scalable:** Designed for huge sites, 50–100GB+ ready.

## Quickstart

```bash
git clone https://github.com/mrfortune94/Fortunate-Scraper.git
cd Fortunate-Scraper
docker-compose up --build
```

- The backend runs at http://localhost:8080
- The frontend dashboard runs at http://localhost:5173

## Usage

1. Open the frontend: [http://localhost:5173](http://localhost:5173)
2. Enter the target website URL.
3. (Optionally) Enter login details and form selectors for protected/member sites.
4. Click **Scrape**.
5. Monitor real-time logs, wait for job completion.
6. Download the full ZIP archive when it's ready.

## Environment Configuration

- **Proxy:** Set the environment variable `PROXY_TARGET` for backend outbound scraping (supports socks/http proxies).
- **Auth:** Use the web form for login selectors (input, button, success marker).

## File Structure

```
/backend         # Node/Express/Playwright deep scraper API
/frontend        # React frontend (dashboard UI)
/frontend/src/assets/carbon-fiber.png # Carbon fiber background
/docker-compose.yml
/README.md
```

## Legal Notice

Use this tool only on domains you own or operate, or where you have clear, written permission to clone content.  
**DO NOT** use it on third-party intellectual property without authorization.  
The authors take no liability for misuse.

---

PRs and suggestions welcome!  
Powered by [Node.js](https://nodejs.org/), [Playwright](https://playwright.dev/), and [React](https://react.dev/).
