import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Navbar from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'students' && <Students />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'reports' && <Reports />}
      </div>
    </div>
  );
}

export default App;

