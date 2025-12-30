import React, { useState, useEffect } from 'react';
import api from '../api';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentStats, setStudentStats] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentStats();
      fetchAttendanceHistory();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('❌ Error fetching students. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const response = await api.get(`/api/statistics/student/${selectedStudent}`);
      setStudentStats(response.data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
      setStudentStats(null);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await api.get(`/api/attendance?student_id=${selectedStudent}`);
      setAttendanceHistory(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2rem' }}>📈 Reports & Analytics</h1>

      <div className="card">
        <div className="card-title">Student Attendance Report</div>
        
        <div className="form-group">
          <label className="form-label">Select Student</label>
          <select
            className="form-input"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select a student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.student_id}>
                {student.student_id} - {student.name}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && studentStats && (
          <>
            <div className="stats-grid" style={{ marginTop: '2rem' }}>
              <div className="stat-card">
                <div className="stat-value">{studentStats.total_records}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{studentStats.present_count}</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{studentStats.absent_count}</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{studentStats.late_count}</div>
                <div className="stat-label">Late</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{studentStats.attendance_percentage}%</div>
                <div className="stat-label">Attendance Rate</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Attendance History</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${record.status}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedStudent && !studentStats && (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No attendance data available for this student.
          </p>
        )}

        {!selectedStudent && (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            Please select a student to view their attendance report.
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-title">📊 All Attendance Records</div>
        <AllAttendanceRecords />
      </div>
    </div>
  );
};

const AllAttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [dateFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = dateFilter 
        ? `/api/attendance?date=${dateFilter}`
        : '/api/attendance';
      const response = await api.get(url);
      setRecords(response.data.slice(0, 50)); // Limit to 50 most recent
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">Filter by Date (optional)</label>
        <input
          type="date"
          className="form-input"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </div>

      {records.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.student_id}</td>
                  <td>{record.student_name}</td>
                  <td>{record.course}</td>
                  <td>
                    <span className={`badge badge-${record.status}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No attendance records found.
        </p>
      )}
    </div>
  );
};

export default Reports;

