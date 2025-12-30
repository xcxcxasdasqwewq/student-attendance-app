import React, { useState, useEffect } from 'react';
import api from '../api';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students.length]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/attendance?date=${selectedDate}`);
      const attendanceMap = {};
      response.data.forEach(record => {
        attendanceMap[record.student_id] = record.status;
      });
      
      // Initialize attendance for all students
      const initialAttendance = {};
      students.forEach(student => {
        initialAttendance[student.student_id] = attendanceMap[student.student_id] || 'absent';
      });
      
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Initialize all as absent if fetch fails
      const initialAttendance = {};
      students.forEach(student => {
        initialAttendance[student.student_id] = 'absent';
      });
      setAttendance(initialAttendance);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const records = students.map(student => ({
        student_id: student.student_id,
        date: selectedDate,
        status: attendance[student.student_id] || 'absent'
      }));
      
      await api.post('/api/attendance', records);
      alert('✅ Attendance saved successfully!');
      fetchAttendance();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error saving attendance. Please try again.';
      alert(`❌ ${errorMsg}`);
      console.error(error);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading students...</div>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div>{error}</div>
          <button className="btn btn-primary" onClick={fetchStudents} style={{ marginTop: '1rem' }}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">✅ Mark Attendance</div>
        
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: '1.5rem' }}
          >
            {saving ? 'Saving...' : '💾 Save Attendance'}
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No students found. Please add students first.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>{student.course || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className={`btn ${attendance[student.student_id] === 'present' ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(student.student_id, 'present')}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '90px' }}
                        >
                          ✓ Present
                        </button>
                        <button
                          className={`btn ${attendance[student.student_id] === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(student.student_id, 'absent')}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '90px' }}
                        >
                          ✗ Absent
                        </button>
                        <button
                          className={`btn ${attendance[student.student_id] === 'late' ? 'btn-warning' : 'btn-secondary'}`}
                          onClick={() => handleStatusChange(student.student_id, 'late')}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '90px' }}
                        >
                          ⏰ Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Attendance Records</div>
        <AttendanceRecords selectedDate={selectedDate} />
      </div>
    </div>
  );
};

const AttendanceRecords = ({ selectedDate }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/attendance?date=${selectedDate}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
        <div>Loading attendance records...</div>
      </div>
    );
  }

  if (records.length === 0) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No records for this date.</p>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
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
  );
};

export default Attendance;

