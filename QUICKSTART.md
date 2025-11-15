# Fortunate-Scraper Quick Start Guide

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 18+ and npm (for manual installation)

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/mrfortune94/Fortunate-Scraper.git
cd Fortunate-Scraper
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## Manual Installation

### Backend

```bash
cd backend
npm install
npx playwright install chromium
npm start
```

The backend will run on http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

1. Open http://localhost:5173 in your browser
2. Enter the target website URL
3. (Optional) Enable authentication if the site requires login:
   - Enter username and password
   - Provide CSS selectors for the login form fields
   - Default selectors work for most standard login forms
4. (Optional) Configure a proxy server
5. Click "Start Scraping"
6. Monitor the real-time progress and logs
7. Download the ZIP file when complete

## Configuration

### Proxy Support

Set the `PROXY_TARGET` environment variable:

```bash
export PROXY_TARGET=http://proxy.example.com:8080
# or
export PROXY_TARGET=socks5://proxy.example.com:1080
```

Or in Docker Compose, add to the environment section:

```yaml
environment:
  - PROXY_TARGET=http://proxy.example.com:8080
```

### Authentication Selectors

The default CSS selectors work for most login forms:
- Username: `input[name="username"]`
- Password: `input[name="password"]`
- Submit: `button[type="submit"]`
- Success: (optional, leave empty to skip verification)

Customize these in the UI for non-standard login forms.

## API Endpoints

- `GET /health` - Health check
- `POST /api/scrape` - Start a new scrape job
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/jobs` - List all jobs
- `GET /api/download/:jobId` - Download ZIP file
- `DELETE /api/jobs/:jobId` - Delete a job

## Troubleshooting

### Playwright Browser Not Found

If you see an error about missing Chromium:

```bash
cd backend
npx playwright install chromium
```

### Port Already in Use

Change the ports in `docker-compose.yml` or set PORT environment variable:

```bash
PORT=3000 npm start
```

### Permission Issues

Ensure the `backend/downloads` directory is writable:

```bash
chmod 755 backend/downloads
```

## Legal Notice

⚠️ **IMPORTANT**: Only use this tool on websites you own or have explicit permission to scrape. Unauthorized web scraping may violate terms of service and local laws.

## Support

For issues and questions, please open an issue on GitHub:
https://github.com/mrfortune94/Fortunate-Scraper/issues
