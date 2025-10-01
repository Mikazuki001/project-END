import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import HomePage from "./pages/HomePage";
import DormMapPage from './pages/DormMapPage';
import RegisterPage from './pages/RegisterPage';
import OwnerStatusPage from "./pages/OwnerStatusPage";

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<DormMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/status" element={<OwnerStatusPage />} />
      </Routes>
    </Router>
  );
}

export default App;
