from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = 'attendance.db'

def init_db():
    """Initialize the database with tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            course TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            UNIQUE(student_id, date)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ========== HEALTH CHECK ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Attendance Management API is running',
        'database': 'connected'
    })

# ========== STUDENT ROUTES ==========

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM students ORDER BY name')
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(students)

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get a specific student"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM students WHERE student_id = ?', (student_id,))
    student = cursor.fetchone()
    conn.close()
    
    if student:
        return jsonify(dict(student))
    return jsonify({'error': 'Student not found'}), 404

@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO students (student_id, name, email, phone, course)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['student_id'], data['name'], data.get('email'), 
              data.get('phone'), data.get('course')))
        conn.commit()
        student_id = data['student_id']
        conn.close()
        return jsonify({'message': 'Student created successfully', 'student_id': student_id}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Student ID already exists'}), 400

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update a student"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE students 
        SET name = ?, email = ?, phone = ?, course = ?
        WHERE student_id = ?
    ''', (data['name'], data.get('email'), data.get('phone'), 
          data.get('course'), student_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student updated successfully'})

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM students WHERE student_id = ?', (student_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404
    
    # Also delete attendance records
    cursor.execute('DELETE FROM attendance WHERE student_id = ?', (student_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted successfully'})

# ========== ATTENDANCE ROUTES ==========

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records with optional filters"""
    date_filter = request.args.get('date')
    student_id_filter = request.args.get('student_id')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT a.*, s.name as student_name, s.course
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE 1=1
    '''
    params = []
    
    if date_filter:
        query += ' AND a.date = ?'
        params.append(date_filter)
    
    if student_id_filter:
        query += ' AND a.student_id = ?'
        params.append(student_id_filter)
    
    query += ' ORDER BY a.date DESC, s.name'
    
    cursor.execute(query, params)
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(records)

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    """Mark attendance for students"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Handle bulk attendance marking
        if isinstance(data, list):
            for record in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO attendance (student_id, date, status, notes)
                    VALUES (?, ?, ?, ?)
                ''', (record['student_id'], record['date'], 
                      record['status'], record.get('notes')))
        else:
            # Single record
            cursor.execute('''
                INSERT OR REPLACE INTO attendance (student_id, date, status, notes)
                VALUES (?, ?, ?, ?)
            ''', (data['student_id'], data['date'], 
                  data['status'], data.get('notes')))
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Attendance marked successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/attendance/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    """Update an attendance record"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE attendance 
        SET status = ?, notes = ?
        WHERE id = ?
    ''', (data['status'], data.get('notes'), attendance_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Attendance record not found'}), 404
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Attendance updated successfully'})

@app.route('/api/attendance/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    """Delete an attendance record"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM attendance WHERE id = ?', (attendance_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Attendance record not found'}), 404
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Attendance record deleted successfully'})

# ========== STATISTICS ROUTES ==========

@app.route('/api/statistics/overview', methods=['GET'])
def get_statistics():
    """Get overall attendance statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total students
    cursor.execute('SELECT COUNT(*) as count FROM students')
    total_students = cursor.fetchone()['count']
    
    # Total attendance records
    cursor.execute('SELECT COUNT(*) as count FROM attendance')
    total_records = cursor.fetchone()['count']
    
    # Present count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE status = 'present'")
    present_count = cursor.fetchone()['count']
    
    # Absent count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE status = 'absent'")
    absent_count = cursor.fetchone()['count']
    
    # Late count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE status = 'late'")
    late_count = cursor.fetchone()['count']
    
    # Attendance percentage
    attendance_percentage = (present_count / total_records * 100) if total_records > 0 else 0
    
    conn.close()
    
    return jsonify({
        'total_students': total_students,
        'total_records': total_records,
        'present_count': present_count,
        'absent_count': absent_count,
        'late_count': late_count,
        'attendance_percentage': round(attendance_percentage, 2)
    })

@app.route('/api/statistics/student/<student_id>', methods=['GET'])
def get_student_statistics(student_id):
    """Get attendance statistics for a specific student"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total records for student
    cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE student_id = ?', (student_id,))
    total_records = cursor.fetchone()['count']
    
    # Present count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'present'", (student_id,))
    present_count = cursor.fetchone()['count']
    
    # Absent count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'absent'", (student_id,))
    absent_count = cursor.fetchone()['count']
    
    # Late count
    cursor.execute("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'late'", (student_id,))
    late_count = cursor.fetchone()['count']
    
    # Attendance percentage
    attendance_percentage = (present_count / total_records * 100) if total_records > 0 else 0
    
    conn.close()
    
    return jsonify({
        'student_id': student_id,
        'total_records': total_records,
        'present_count': present_count,
        'absent_count': absent_count,
        'late_count': late_count,
        'attendance_percentage': round(attendance_percentage, 2)
    })

@app.route('/api/attendance/date/<date_str>', methods=['GET'])
def get_attendance_by_date(date_str):
    """Get all attendance records for a specific date"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT a.*, s.name as student_name, s.course
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.date = ?
        ORDER BY s.name
    ''', (date_str,))
    
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(records)

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    print("✅ Database initialized!")
    print("🚀 Starting Flask server on http://localhost:5001")
    print("📡 API endpoints available at http://localhost:5001/api/")
    app.run(debug=True, port=5001, host='0.0.0.0')

