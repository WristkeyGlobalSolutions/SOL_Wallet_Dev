# Airdrop Fix - What Was Wrong and How It's Fixed

## Issues Fixed

### 1. ✅ Port 8787 Already in Use
**Problem**: Backend couldn't start because port 8787 was already occupied by a previous instance.

**Solution**: 
```bash
lsof -ti:8787 | xargs kill -9
```
This kills any process using port 8787. The backend can now start successfully.

### 2. ✅ Airdrop Not Working
**Problem**: The backend uses a **queue system** (BullMQ) for airdrops, which returns a `jobId` instead of immediate results. The frontend was expecting an immediate response with `signature` and `explorerUrl`.

**Solution**: Updated the frontend to:
1. Call the backend airdrop API
2. Receive the `jobId` 
3. Poll the job status endpoint (`/api/airdrop/status/:jobId`)
4. Wait for the job to complete
5. Extract the result (signature, explorerUrl) from the completed job
6. Update the UI with the result

## How Airdrop Works Now

### Backend Flow:
1. Frontend sends POST to `/api/airdrop` with `{ pubkey: "..." }`
2. Backend adds job to queue and returns `{ jobId: "...", status: "airdrop-pending" }`
3. Worker processes the airdrop in the background
4. Frontend polls `/api/airdrop/status/:jobId` to check progress
5. When job completes, result contains `{ signature, explorerUrl, status }`

### Frontend Flow:
1. User clicks "Airdrop 1 SOL"
2. Frontend calls backend API
3. If `jobId` is returned, frontend starts polling every 1 second
4. Shows progress updates: "Airdrop processing... X%"
5. When completed, shows "Airdrop confirmed" and refreshes balance
6. If backend fails, falls back to direct Solana RPC call

## Testing

1. **Start Backend**:
   ```bash
   cd wgs-wallet-backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd wristkey-wallet
   npm run dev
   ```

3. **Test Airdrop**:
   - Create a wallet
   - Click "Airdrop 1 SOL"
   - You should see: "Airdrop queued, processing..." → "Airdrop processing... X%" → "Airdrop confirmed"
   - Balance should update automatically

## Fallback Behavior

If the backend queue system fails, the frontend automatically falls back to:
- Direct Solana RPC airdrop request
- If that fails with rate limit (429), tries 0.25 SOL instead
- Shows appropriate error messages

## Troubleshooting

### Airdrop Still Not Working?

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:8787/api/health
   ```
   Should return `{"status":"ok",...}`

2. **Check Redis is Running**:
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed API calls

4. **Check Backend Logs**:
   - Look at the terminal where backend is running
   - Should see queue processing messages

### Common Issues

- **"Airdrop failed: Rate limited"**: Devnet faucet is rate-limited. Wait a few minutes and try again, or the system will automatically retry with 0.25 SOL.

- **"Job not found"**: The job may have been cleaned up (jobs are removed after 100 completions). This is normal for old jobs.

- **"Airdrop taking longer than expected"**: The Solana network might be slow. The airdrop will still complete - just refresh your balance manually.

## Queue System Benefits

The queue system provides:
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Progress tracking
- ✅ Job monitoring via `/api/airdrop/jobs`
- ✅ Better error handling
- ✅ Non-blocking requests




