
import React, { useState } from 'react';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/UserSlice';

const schema = Yup.object().shape({
  name: Yup.string()
    .required('Name is Required'),
  email: Yup.string()
    .required('Email is Required')
    .email('Invalid email'),
  password: Yup.string()
    .required('Password is Required')
    .min(6, 'Min 6 chars'),
});

export default function Register() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
    //   await schema.validate(form, { abortEarly: true });
    await schema.fields.name.validate(form.name);
    await schema.fields.email.validate(form.email);
    await schema.fields.password.validate(form.password);


      // Register user
      const res = await fetch('http://127.0.0.1:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) return setErr(data.error || 'Register failed');

      // Auto login after register
      const loginRes = await fetch('http://127.0.0.1:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();

      if (!loginRes.ok) return setErr(loginData.error || 'Auto login failed');

      dispatch(setCredentials({ user: loginData.user, token: loginData.token }));
      setMsg('Registered and logged in successfully!');
    } catch (validationError) {
      setErr(validationError.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><br />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><br />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><br />
        <button type="submit">Register</button>
      </form>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
    </div>
  );
}
