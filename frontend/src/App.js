import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Projects from './pages/Project';


function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 600, margin: '1rem auto', fontFamily: 'sans-serif' }}>
        <nav style={{ marginBottom: 12 }}>
          <Link to="/" style={{ marginRight: 8 }}>Home</Link>
          <Link to="/register" style={{ marginRight: 8 }}>Register</Link>
          <Link to="/login" style={{ marginRight: 8 }}>Login</Link>
          <Link to="/profile" style={{ marginRight: 8 }}>Profile</Link>
          <Link to="/projects" style={{ marginRight: 8 }}>Projects</Link>
        </nav>

        <Routes>
          <Route path="/" element={<h2>Home</h2>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
