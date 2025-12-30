# 📚 Student Attendance Management System

A beautiful and feature-rich attendance management system built with React frontend and Python Flask backend, using SQLite database.

## ✨ Features

- **📊 Dashboard**: Overview of attendance statistics and today's records
- **👥 Student Management**: Add, edit, delete, and view students
- **✅ Attendance Marking**: Mark attendance (Present/Absent/Late) for any date
- **📈 Reports & Analytics**: View detailed attendance reports per student
- **🎨 Beautiful UI**: Modern, responsive design with gradient backgrounds
- **💾 SQLite Database**: Local database with mock data included

## 🚀 Quick Start

### Prerequisites

- **Python 3.7+** installed
- **Node.js 14+** and npm installed

### One-Command Start (Recommended)

#### Option 1: Using Python Script (Cross-platform)
```bash
python3 start.py
```

#### Option 2: Using Shell Script (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

#### Option 3: Using Batch Script (Windows)
```cmd
start.bat
```

The script will:
1. ✅ Check for Python and Node.js
2. 📦 Install all dependencies
3. 🗄️ Initialize the database
4. 📊 Create mock data (50 students with 30 days of attendance)
5. 🔙 Start the backend server (port 5000)
6. 🎨 Start the frontend server (port 3000)

### Manual Start

If you prefer to start manually:

#### Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 init_db.py  # Initialize database
python3 create_mock_data.py  # Create mock data
python3 app.py  # Runs on port 5001
```

#### Frontend Setup (in a new terminal):
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
food-delivery-app/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── create_mock_data.py    # Mock data generator
│   ├── requirements.txt       # Python dependencies
│   └── attendance.db          # SQLite database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── Students.js
│   │   │   ├── Attendance.js
│   │   │   ├── Reports.js
│   │   │   └── Navbar.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   └── package.json
├── start.sh                   # Startup script (Mac/Linux)
├── start.bat                  # Startup script (Windows)
└── README.md
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Students
- `GET /api/students` - Get all students
- `GET /api/students/<student_id>` - Get a specific student
- `POST /api/students` - Create a new student
- `PUT /api/students/<student_id>` - Update a student
- `DELETE /api/students/<student_id>` - Delete a student

### Attendance
- `GET /api/attendance` - Get attendance records (optional: `?date=YYYY-MM-DD&student_id=STU0001`)
- `POST /api/attendance` - Mark attendance (single or bulk)
- `PUT /api/attendance/<id>` - Update attendance record
- `DELETE /api/attendance/<id>` - Delete attendance record
- `GET /api/attendance/date/<date_str>` - Get attendance for specific date

### Statistics
- `GET /api/statistics/overview` - Get overall statistics
- `GET /api/statistics/student/<student_id>` - Get student-specific statistics

## 🎨 Features in Detail

### Dashboard
- Real-time statistics overview
- Total students, records, present/absent/late counts
- Attendance percentage
- Today's attendance list

### Student Management
- Add new students with ID, name, email, phone, course
- Edit existing student information
- Delete students (also removes their attendance records)
- View all students in a beautiful table

### Attendance Marking
- Select any date to mark attendance
- Quick buttons for Present/Absent/Late
- Bulk save for all students at once
- View attendance records for selected date

### Reports
- Individual student attendance reports
- Attendance percentage per student
- Complete attendance history
- Filter by date
- View all attendance records

## 🗄️ Database Schema

### Students Table
- `id` (Primary Key)
- `student_id` (Unique)
- `name`
- `email`
- `phone`
- `course`
- `created_at`

### Attendance Table
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `date`
- `status` (present/absent/late)
- `notes`
- `created_at`

## 🎯 Mock Data

The system comes with pre-generated mock data:
- **50 students** with realistic names and details
- **30 days** of attendance records (weekdays only)
- Random attendance statuses (70% present, 20% absent, 10% late)
- Some records include notes

## 🛠️ Technology Stack

- **Frontend**: React 18, Axios, CSS3
- **Backend**: Python Flask, Flask-CORS, SQLite
- **Database**: SQLite (local file)
- **API**: RESTful API with JSON responses
- **Styling**: Modern CSS with gradients and animations

## 📝 Notes

- The database file (`attendance.db`) is created automatically in the `backend` directory
- Mock data is generated when you run `create_mock_data.py`
- The frontend runs on `http://localhost:3000`
- The backend API runs on `http://localhost:5001`
- CORS is enabled for local development

## 🐛 Troubleshooting

**Script not running?**
- Make sure you're in the project root directory
- Check Python version: `python3 --version` (needs 3.7+)
- Check Node.js version: `node --version` (needs 14+)
- On Windows, try `start.bat` instead of `start.py`

**Port already in use?**
- Backend: Now uses port 5001 (changed from 5000 to avoid AirPlay conflicts)
- To change port: Edit `backend/app.py` line 354 and `frontend/package.json` line 35
- Frontend: React will prompt to use a different port if 3000 is taken
- Kill existing processes: 
  - Mac/Linux: `lsof -ti:5001 | xargs kill` or `lsof -ti:3000 | xargs kill`
  - Windows: `netstat -ano | findstr :5001` then `taskkill /PID <pid> /F`

**Database errors?**
- Delete `backend/attendance.db` and restart
- Run `python3 backend/init_db.py` to reinitialize
- Run `python3 backend/create_mock_data.py` to recreate mock data

**Dependencies not installing?**
- Make sure Python 3.7+ and Node.js 14+ are installed
- Try updating pip: `pip install --upgrade pip`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `venv` folders, then restart

**Backend not connecting?**
- Check if backend is running: `curl http://localhost:5001/api/health`
- Check browser console for CORS errors
- Verify Flask-CORS is installed: `pip list | grep Flask-CORS`
- Make sure port 5001 is not blocked by firewall

**Frontend not loading?**
- Wait 30-60 seconds for React to compile (first time is slow)
- Check browser console for errors
- Verify proxy is set in `package.json`: `"proxy": "http://localhost:5001"`

## 📄 License

This project is open source and available for educational purposes.

---

**Enjoy managing your student attendance! 🎓**

