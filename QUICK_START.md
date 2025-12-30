# Quick Start Guide

## The Issue
Your frontend is running but showing `ECONNREFUSED` errors because:
1. The backend server isn't running
2. Redis is required for the backend (for queue functionality)

## Solution: Start All Services

### Step 1: Start Redis

**Option A: Using Docker (if Docker Desktop is running)**
```bash
docker run -d -p 6379:6379 --name wgs-redis redis:7-alpine
```

**Option B: Using Homebrew (macOS)**
```bash
# Install Redis (if not installed)
brew install redis

# Start Redis
brew services start redis
# OR run directly:
redis-server
```

**Option C: Using Docker Compose (starts everything)**
```bash
# Make sure Docker Desktop is running, then:
docker-compose up -d
```

### Step 2: Start Backend

Open a **new terminal** and run:
```bash
cd wgs-wallet-backend
npm run dev
```

You should see:
```
WGS backend listening on http://localhost:8787
🚀 All advanced features enabled: Queues, Webhooks, SPL Tokens
```

### Step 3: Verify Frontend

Your frontend should already be running at http://localhost:5173

The proxy errors should stop once the backend is running.

## Verify Everything Works

1. **Check Backend**: Open http://localhost:8787/api/health
   - Should return JSON with status "ok"

2. **Check Frontend**: Open http://localhost:5173
   - Should load without proxy errors
   - Can create wallets, check balance, etc.

3. **Check Redis** (if installed locally):
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

## Troubleshooting

### "Cannot connect to Redis"
- Start Redis using one of the options above
- Or modify backend to handle Redis being unavailable (not recommended for production)

### "Port 8787 already in use"
```bash
# Find and kill the process
lsof -ti:8787 | xargs kill
```

### "Port 6379 already in use"
Redis is already running, you're good to go!

## Recommended: Use Docker Compose

The easiest way is to use Docker Compose which starts everything:

```bash
# Start all services (Redis + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This requires Docker Desktop to be running.




