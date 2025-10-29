import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });

  // Fetch users on mount
  useEffect(() => {
    fetch('http://127.0.0.1:4000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:4000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const newUser = await res.json();
    setUsers([...users, newUser]);
    setForm({ name: '', email: '' });
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>User List</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        />
        <button type="submit" style={{ width: '100%' }}>Add User</button>
      </form>

      <ul>
        {users.map(u => (
          <li key={u._id}>{u.name} — {u.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
