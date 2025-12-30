import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [statsRes, attendanceRes] = await Promise.all([
        api.get('/api/statistics/overview'),
        api.get(`/api/attendance?date=${today}`)
      ]);
      setStats(statsRes.data);
      setRecentAttendance(attendanceRes.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error
      setStats({
        total_students: 0,
        total_records: 0,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        attendance_percentage: 0
      });
      setRecentAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2rem' }}>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_students || 0}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.total_records || 0}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.present_count || 0}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.absent_count || 0}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.late_count || 0}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.attendance_percentage || 0}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📅 Today's Attendance</div>
        {recentAttendance.length > 0 ? (
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
                {recentAttendance.map((record) => (
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
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No attendance records for today yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

