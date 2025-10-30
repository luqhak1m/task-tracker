import React, { useState } from 'react';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/UserSlice';

const schema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function Login() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await schema.validate(form);
      const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) return setErr(data.error || 'Login failed');

      dispatch(setCredentials({ user: data.user, token: data.token }));
      localStorage.setItem('token', data.token);

    } catch (validationError) {
      setErr(validationError.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><br />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><br />
        <button type="submit">Login</button>
      </form>
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  );
}
