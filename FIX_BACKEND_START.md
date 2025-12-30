# Fix: Backend Startup Issue

## The Problem
The `ts-node-dev` command is having trouble with the script path when run from the startup script.

## Solution: Run Backend Directly

Instead of using the startup script, run the backend directly:

### Option 1: Direct Command (Recommended)
```bash
cd /Users/divyanshbarodiya/Downloads/SOL_Wallet-main/wgs-wallet-backend
npm run dev
```

### Option 2: Use the Simple Script
```bash
cd /Users/divyanshbarodiya/Downloads/SOL_Wallet-main
./start-backend.sh
```

## What You Should See

When the backend starts successfully, you'll see:
```
WGS backend listening on http://localhost:8787
🚀 All advanced features enabled: Queues, Webhooks, SPL Tokens
```

## Verify It's Working

In another terminal, test:
```bash
curl http://localhost:8787/api/health
```

Should return JSON with `"status": "ok"`.

## Complete Setup

You need **2 terminals running**:

**Terminal 1 - Backend:**
```bash
cd /Users/divyanshbarodiya/Downloads/SOL_Wallet-main/wgs-wallet-backend
npm run dev
```

**Terminal 2 - Frontend (already running):**
- Keep your current frontend terminal open
- It's running at http://localhost:5173

Once the backend starts, the connection errors will stop!




