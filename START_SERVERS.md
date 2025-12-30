# Starting the Application

## Quick Start

### Option 1: Start Backend and Frontend Separately (Development)

**Terminal 1 - Backend:**
```bash
cd wgs-wallet-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd wristkey-wallet
npm run dev
```

**Terminal 3 - Redis (Required for queues):**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine

# OR using Homebrew (macOS)
brew services start redis

# OR using npm (if installed globally)
redis-server
```

### Option 2: Using Docker Compose (All Services)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8787
- **Redis**: localhost:6379

## Troubleshooting

### Connection Refused Errors

If you see `ECONNREFUSED` errors in the frontend:
1. Make sure the backend is running on port 8787
2. Check if Redis is running (required for queue functionality)
3. Verify the backend started successfully (check terminal output)

### Backend Won't Start

1. **Redis Connection Error**: 
   - Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`
   - Or install Redis locally: `brew install redis && brew services start redis`

2. **Port Already in Use**:
   - Change PORT in `.env` file
   - Or kill the process using port 8787: `lsof -ti:8787 | xargs kill`

3. **Database Error**:
   - The SQLite database will be created automatically
   - Make sure the directory is writable

### Frontend Proxy Errors

The frontend proxies `/api/*` requests to `http://localhost:8787`. If you see proxy errors:
- Ensure backend is running
- Check `vite.config.ts` proxy configuration
- Verify backend is accessible at http://localhost:8787/api/health

## Health Checks

Test if services are running:

```bash
# Backend health
curl http://localhost:8787/api/health

# Redis
redis-cli ping
# Should return: PONG
```

## Development Workflow

1. Start Redis (if not using Docker Compose)
2. Start Backend in one terminal
3. Start Frontend in another terminal
4. Open http://localhost:5173 in browser

The frontend will automatically proxy API requests to the backend.




