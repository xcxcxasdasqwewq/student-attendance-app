import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = 'attendance.db'

# Sample data
FIRST_NAMES = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 
               'Robert', 'Amanda', 'William', 'Ashley', 'Richard', 'Melissa', 'Joseph', 
               'Nicole', 'Thomas', 'Michelle', 'Christopher', 'Kimberly', 'Daniel', 'Amy',
               'Matthew', 'Angela', 'Anthony', 'Lisa', 'Mark', 'Nancy', 'Donald', 'Karen',
               'Steven', 'Betty', 'Paul', 'Helen', 'Andrew', 'Sandra', 'Joshua', 'Donna',
               'Kenneth', 'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Laura',
               'Timothy', 'Emily', 'Ronald', 'Donna']

LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
              'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
              'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
              'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
              'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams']

COURSES = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
           'Engineering', 'Business', 'Economics', 'Psychology', 'History']

def create_mock_data():
    """Create mock students and attendance data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute('DELETE FROM attendance')
    cursor.execute('DELETE FROM students')
    
    # Create students
    students = []
    for i in range(1, 51):  # Create 50 students
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        student_id = f"STU{str(i).zfill(4)}"
        email = f"{first_name.lower()}.{last_name.lower()}@university.edu"
        phone = f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
        course = random.choice(COURSES)
        
        cursor.execute('''
            INSERT INTO students (student_id, name, email, phone, course)
            VALUES (?, ?, ?, ?, ?)
        ''', (student_id, name, email, phone, course))
        
        students.append(student_id)
    
    # Create attendance records for the last 30 days
    today = datetime.now().date()
    for day_offset in range(30):
        attendance_date = today - timedelta(days=day_offset)
        date_str = attendance_date.strftime('%Y-%m-%d')
        
        # Skip weekends (optional - you can remove this if you want weekend data)
        if attendance_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
            continue
        
        for student_id in students:
            # Random attendance status (70% present, 20% absent, 10% late)
            rand = random.random()
            if rand < 0.70:
                status = 'present'
            elif rand < 0.90:
                status = 'absent'
            else:
                status = 'late'
            
            # Sometimes add notes
            notes = None
            if status == 'absent' and random.random() < 0.3:
                notes = random.choice(['Sick', 'Family emergency', 'Personal reason', 'Medical appointment'])
            elif status == 'late' and random.random() < 0.5:
                notes = random.choice(['Traffic', 'Public transport delay', 'Overslept'])
            
            cursor.execute('''
                INSERT OR REPLACE INTO attendance (student_id, date, status, notes)
                VALUES (?, ?, ?, ?)
            ''', (student_id, date_str, status, notes))
    
    conn.commit()
    conn.close()
    print(f"Created {len(students)} students with attendance records for the last 30 days!")
    print("Mock data generation completed successfully!")

if __name__ == '__main__':
    create_mock_data()

