import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">📚 Attendance Management System</div>
        <div className="navbar-tabs">
          <button
            className={`navbar-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`navbar-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👥 Students
          </button>
          <button
            className={`navbar-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ✅ Attendance
          </button>
          <button
            className={`navbar-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

