#!/bin/bash

# Development Startup Script for SOL Wallet
# This script starts Redis, Backend, and provides instructions for Frontend

echo "🚀 Starting SOL Wallet Development Environment"
echo "=============================================="
echo ""

# Check if Redis is running
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is already running"
else
    echo "📦 Starting Redis..."
    if command -v brew > /dev/null 2>&1; then
        brew services start redis 2>/dev/null || redis-server --daemonize yes
    else
        echo "⚠️  Redis not found. Please install Redis first:"
        echo "   brew install redis"
        echo "   OR"
        echo "   docker run -d -p 6379:6379 redis:7-alpine"
        exit 1
    fi
    sleep 2
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis started successfully"
    else
        echo "❌ Failed to start Redis"
        exit 1
    fi
fi

echo ""
echo "📡 Starting Backend Server..."
echo "   Backend will run on http://localhost:8787"
echo ""

# Get absolute path to script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/wgs-wallet-backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    exit 1
fi

# Start backend in foreground so user can see output
echo "📂 Working directory: $(pwd)"
echo ""
exec npm run dev

