import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../features/UserSlice';

export default function Profile() {
  const { token, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      const res = await fetch('http://127.0.0.1:4000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) setErr(data.error || 'Error fetching profile');
      else setProfile(data);
    };
    fetchProfile();
  }, [token]);

  if (!token) return <p>Not logged in.</p>;

  return (
    <div>
      <h2>Profile</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {profile ? (
        <div>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <button onClick={() => dispatch(clearCredentials())}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
