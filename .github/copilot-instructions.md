# Copilot Instructions for Fortunate-Scraper

## Project Overview

Fortunate-Scraper is a full-website scraper and duplicator built with Node.js, Express, Playwright, and React. It provides a web dashboard for deep website cloning with authentication support, proxy routing, and offline archive generation.

## Project Structure

```
/backend         # Node.js/Express API with Playwright scraping engine
  ├── server.js       # Express server and API routes
  ├── scraper.js      # Playwright scraping logic
  └── package.json    # Backend dependencies
/frontend        # React + Vite dashboard UI
  ├── src/
  │   ├── App.jsx     # Main React component
  │   ├── App.css     # Dark theme styling
  │   └── main.jsx    # Entry point
  └── package.json    # Frontend dependencies
```

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Scraping**: Playwright (Chromium headless browser)
- **Key Dependencies**: 
  - `playwright` - Browser automation
  - `archiver` - ZIP archive generation
  - `ws` - WebSocket for real-time logs
  - `express-rate-limit` - API rate limiting
  - `cors` - CORS handling
  - `dotenv` - Environment configuration

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS with carbon-fiber dark theme

### DevOps
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint (both backend and frontend)

## Development Commands

### Backend
```bash
cd backend
npm install                    # Install dependencies
npx playwright install chromium # Install browser
npm run dev                    # Start with nodemon (auto-reload)
npm start                      # Production start
npm run lint                   # Run ESLint
npm run lint:fix              # Auto-fix lint issues
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Docker
```bash
docker-compose up --build  # Build and start both services
docker-compose down        # Stop all services
```

## Coding Standards

### JavaScript/React
- Use **ES6+ features** (arrow functions, destructuring, async/await)
- Use **functional components with hooks** in React
- **2 spaces** for indentation
- Use **meaningful variable and function names**
- Add **comments for complex logic**
- Follow existing code patterns in the repository

### CSS
- Use **descriptive class names**
- Keep styles **modular and component-specific**
- Maintain the **dark theme aesthetic** (carbon-fiber gaming-inspired look)

### File Organization
- Backend: Keep API routes in `server.js`, scraping logic in `scraper.js`
- Frontend: Component-specific styles in the same directory as components

## Testing Requirements

Before submitting changes:
1. Test backend API endpoints (http://localhost:8080)
2. Test frontend UI functionality (http://localhost:5173)
3. Test the complete scraping workflow end-to-end
4. Verify Docker builds work: `docker-compose up --build`
5. Check browser console for errors
6. Run linters: `npm run lint` in both backend and frontend

## Security Considerations

**CRITICAL**: This is a web scraping tool with significant security implications:

1. **Legal Compliance**: Only scrape domains you own or have written permission to clone
2. **Authentication**: Handle login credentials securely, never log passwords
3. **Rate Limiting**: Respect target websites, implement appropriate delays
4. **Proxy Support**: Use `PROXY_TARGET` environment variable responsibly
5. **Input Validation**: Always validate and sanitize user inputs (URLs, selectors, credentials)
6. **Resource Limits**: Be mindful of memory usage with large sites (50-100GB+)
7. **CORS**: Properly configure CORS headers in Express
8. **Error Handling**: Never expose sensitive error details to frontend

### When Making Changes:
- **Never** store credentials in code
- **Always** validate URLs before scraping
- **Always** handle errors gracefully
- **Never** expose internal file paths to frontend
- **Always** use environment variables for sensitive config

## Common Tasks

### Adding a New API Endpoint
1. Add route handler in `backend/server.js`
2. Test with curl or Postman
3. Update frontend to consume the endpoint
4. Add error handling

### Modifying Scraping Logic
1. Edit `backend/scraper.js`
2. Test with a small test website first
3. Verify ZIP archive integrity
4. Check memory usage for large sites
5. Ensure proper cleanup of browser instances

### UI Changes
1. Edit React components in `frontend/src/`
2. Maintain carbon-fiber dark theme aesthetic
3. Test responsive design
4. Verify real-time log updates work
5. Include screenshots in PR

### Adding Dependencies
1. Install in appropriate directory (`backend/` or `frontend/`)
2. Run security audit: `npm audit`
3. Update both `package.json` and `package-lock.json`
4. Rebuild Docker images to verify

## Environment Variables

### Backend (.env)
- `PROXY_TARGET` - Optional proxy for outbound scraping (socks/http)
- `PORT` - Server port (default: 8080)

## Build and Deployment

### Production Build
```bash
# Frontend
cd frontend && npm run build

# Docker (recommended)
docker-compose up --build
```

### Ports
- Backend API: `8080`
- Frontend Dev: `5173`
- Frontend (Docker): `80` → `5173`
- Backend (Docker): `80` → `8080`

## Pull Request Guidelines

1. **Clear description** of changes
2. **Reference related issues**
3. **Screenshots** for UI changes
4. **Test results** confirmation
5. **Update documentation** if needed
6. **Run linters** before submitting
7. **Verify Docker builds** work

## Legal Notice Reminder

Always include legal compliance checks when modifying scraping functionality. Users must be warned to use this tool only on domains they own or have permission to scrape.

## Common Patterns

### Error Handling
```javascript
try {
  // operation
} catch (error) {
  console.error('Description:', error);
  res.status(500).json({ error: 'User-friendly message' });
}
```

### WebSocket Logging
```javascript
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'log', message: 'Status update' }));
  }
});
```

### React State Management
```javascript
const [state, setState] = useState(initialValue);
// Use functional updates for state based on previous state
setState(prev => ({ ...prev, newField: value }));
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

## Questions?

See `CONTRIBUTING.md` for more details or open an issue for discussions.
