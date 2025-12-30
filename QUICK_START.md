# 🚀 Quick Start Guide

## One-Command Start

Simply run:

```bash
python3 start.py
```

That's it! The script will:
1. ✅ Check for Python and Node.js
2. 📦 Install all dependencies
3. 🗄️ Initialize the database
4. 📊 Create mock data (50 students, 30 days)
5. 🔙 Start backend (port 5000)
6. 🎨 Start frontend (port 3000)

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## Features Available

### 📊 Dashboard
- View overall statistics
- See today's attendance at a glance
- Quick overview of all metrics

### 👥 Students
- Add new students
- Edit student information
- Delete students
- View all students in a table

### ✅ Attendance
- Mark attendance for any date
- Quick buttons: Present/Absent/Late
- Bulk save for all students
- View attendance records

### 📈 Reports
- Individual student reports
- Attendance percentage per student
- Complete attendance history
- Filter by date

## Troubleshooting

**Port already in use?**
- Backend: Kill process on port 5000
- Frontend: React will prompt for different port

**Can't connect to backend?**
- Check if backend is running: `curl http://localhost:5001/api/health`
- Check browser console for errors

**Database issues?**
- Delete `backend/attendance.db`
- Restart the application

## Manual Start (if script fails)

### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 init_db.py
python3 create_mock_data.py
python3 app.py
```

### Frontend (new terminal):
```bash
cd frontend
npm install
npm start
```

## Need Help?

Check the main README.md for detailed documentation.

