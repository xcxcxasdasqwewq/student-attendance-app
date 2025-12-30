@echo off
echo 🚀 Starting Attendance Management System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📥 Installing Python dependencies...
pip install -q -r requirements.txt

REM Initialize database
echo 🗄️  Initializing database...
python init_db.py

echo 📊 Creating mock data...
python create_mock_data.py

REM Start backend server
echo 🔙 Starting backend server...
start "Backend Server" python app.py

REM Wait a bit for backend to start
timeout /t 2 /nobreak >nul

REM Navigate to frontend directory
cd ..\frontend

REM Check if node_modules exists or if react-scripts is missing
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies (this may take a few minutes)...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install npm dependencies. Please run 'npm install' manually.
        exit /b 1
    )
    echo ✅ Node.js dependencies installed!
) else if not exist "node_modules\.bin\react-scripts.cmd" (
    echo 📦 Installing Node.js dependencies (react-scripts missing)...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install npm dependencies. Please run 'npm install' manually.
        exit /b 1
    )
    echo ✅ Node.js dependencies installed!
)

REM Start frontend server
echo 🎨 Starting frontend server...
start "Frontend Server" npm start

echo.
echo ✅ System is starting up!
echo.
echo 📊 Backend API: http://localhost:5001
echo 🎨 Frontend App: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

