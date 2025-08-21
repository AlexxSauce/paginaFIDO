import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserRegister from './components/UserRegister';
import RegistroAlimento from './components/RegistroAlimento';
import Estadisticas from './components/Estadisticas';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/registro-alimento" element={<RegistroAlimento />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </Router>
  );
}

export default App;

