# Setup Instructions - Fix Connection Errors

## The Problem
Your frontend is showing `ECONNREFUSED` errors because the backend server isn't running.

## Quick Fix (3 Steps)

### Step 1: Start Redis (if not already running)
```bash
# Check if Redis is running
redis-cli ping

# If it says "PONG", Redis is running ✅
# If it errors, start Redis:
brew services start redis
```

### Step 2: Start Backend Server
Open a **NEW terminal window** and run:

```bash
cd /Users/divyanshbarodiya/Downloads/SOL_Wallet-main/wgs-wallet-backend
npm run dev
```

You should see:
```
WGS backend listening on http://localhost:8787
🚀 All advanced features enabled: Queues, Webhooks, SPL Tokens
```

### Step 3: Keep Frontend Running
Your frontend is already running at http://localhost:5173 - keep that terminal open.

## Alternative: Use the Startup Script

I've created a startup script for you:

```bash
# In a new terminal
cd /Users/divyanshbarodiya/Downloads/SOL_Wallet-main
./start-dev.sh
```

This will:
1. Check and start Redis if needed
2. Start the backend server

## Verify Everything Works

After starting the backend, test it:

```bash
curl http://localhost:8787/api/health
```

Should return: `{"status":"ok",...}`

## Terminal Layout

You'll need **2 terminals**:

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

Once both are running, open http://localhost:5173 in your browser and the errors will be gone!

## Troubleshooting

### "Port 8787 already in use"
```bash
lsof -ti:8787 | xargs kill
```

### "Redis connection failed"
```bash
brew services restart redis
```

### Still getting errors?
1. Make sure backend shows "listening on http://localhost:8787"
2. Check Redis: `redis-cli ping` should return `PONG`
3. Restart frontend after backend is running




