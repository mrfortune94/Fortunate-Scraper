# Contributing to Fortunate-Scraper

Thank you for your interest in contributing to Fortunate-Scraper! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Local Development

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/Fortunate-Scraper.git
cd Fortunate-Scraper
```

3. Install backend dependencies:
```bash
cd backend
npm install
npx playwright install chromium
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Project Structure

```
/backend
  ├── server.js       # Express server and API routes
  ├── scraper.js      # Playwright scraping logic
  ├── package.json    # Backend dependencies
  └── Dockerfile      # Backend Docker configuration

/frontend
  ├── src/
  │   ├── App.jsx     # Main React component
  │   ├── App.css     # Styling
  │   └── main.jsx    # Entry point
  ├── package.json    # Frontend dependencies
  └── Dockerfile      # Frontend Docker configuration

docker-compose.yml    # Docker Compose configuration
```

## Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Test your changes thoroughly
4. Commit with clear messages:
```bash
git commit -m "Add feature: description of your changes"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request

## Code Style

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks in React
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic

### CSS

- Use descriptive class names
- Keep styles modular and component-specific
- Maintain the dark theme aesthetic

## Testing

Before submitting a PR:

1. Test the backend API endpoints
2. Test the frontend UI functionality
3. Test the complete scraping workflow
4. Verify Docker builds work
5. Check for console errors

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas

## Bug Reports

Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
