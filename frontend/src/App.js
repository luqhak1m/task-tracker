import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Projects from './pages/Project';
import Tasks from './pages/Task';
import './styles/Global.css';
import './styles/Navbar.css';

import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />  
        <div className="content">
          <Routes>
            <Route path="/" element={<h2>Home</h2>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
