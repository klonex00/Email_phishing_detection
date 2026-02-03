#!/bin/bash

# Email Guard - Automatic Start Script
# This script automatically starts both backend and frontend servers

echo "🛡️  Email Guard - Starting Application..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Checking port $port...${NC}"
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Stopping existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
        echo -e "${GREEN}✅ Port $port freed${NC}"
    fi
}

# Kill any existing processes on required ports
echo -e "${BLUE}Preparing ports...${NC}"
kill_port 8000
kill_port 3000

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed!${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${BLUE}🚀 Starting Backend Server...${NC}"
cd "$SCRIPT_DIR/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate

if [ ! -f "venv/bin/uvicorn" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
fi

# Start backend in background
echo -e "${GREEN}✅ Backend starting on http://localhost:8000${NC}"
PYTHONPATH="$SCRIPT_DIR/backend:$PYTHONPATH" python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo -e "${BLUE}🚀 Starting Frontend Server...${NC}"
cd "$SCRIPT_DIR/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install --silent
fi

# Start frontend in background
echo -e "${GREEN}✅ Frontend starting on http://localhost:3000${NC}"
npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo -e "${GREEN}=========================================="
echo -e "✅ Email Guard is running!"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend: ${NC}http://localhost:3000"
echo -e "${BLUE}🔧 Backend:  ${NC}http://localhost:8000"
echo -e "${BLUE}📚 API Docs: ${NC}http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo -e "${YELLOW}📝 Logs: backend.log & frontend.log${NC}"
echo ""

# Verify backend started
sleep 2
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors${NC}"
    tail -20 "$SCRIPT_DIR/backend.log"
fi

# Keep script running and wait for both processes
wait $BACKEND_PID $FRONTEND_PID
