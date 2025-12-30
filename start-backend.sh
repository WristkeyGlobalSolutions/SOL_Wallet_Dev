#!/bin/bash

# Simple Backend Startup Script

cd "$(dirname "$0")/wgs-wallet-backend"

echo "🚀 Starting Backend Server..."
echo "📂 Directory: $(pwd)"
echo ""

# Use npm run which handles the path correctly
npm run dev




