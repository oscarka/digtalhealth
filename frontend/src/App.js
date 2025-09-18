import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HealthResumeSystem from './pages/HealthResumeSystem';
import './App.css';

function App() {
  console.log('🚀 App 组件加载，当前路径:', window.location.pathname);
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HealthResumeSystem />} />
          <Route path="/health-resume" element={<HealthResumeSystem />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
