#!/bin/bash

echo "🚀 Starting Attendance Management System..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt

# Initialize database
echo "🗄️  Initializing database..."
python3 init_db.py

echo "📊 Creating mock data..."
python3 create_mock_data.py

# Start backend server
echo "🔙 Starting backend server..."
python3 app.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Navigate to frontend directory
cd ../frontend

# Check if node_modules exists or if react-scripts is missing
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "📦 Installing Node.js dependencies (this may take a few minutes)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install npm dependencies. Please run 'npm install' manually."
        exit 1
    fi
    echo "✅ Node.js dependencies installed!"
fi

# Start frontend server
echo "🎨 Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ System is starting up!"
echo ""
echo "📊 Backend API: http://localhost:5001"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for processes
wait

