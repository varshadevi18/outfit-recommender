import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Profile = ({ user, token, onUpdate }) => {
  const [gender, setGender] = useState(user?.gender || '');
  const [skinTone, setSkinTone] = useState(user?.skin_tone || '');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/auth/profile?token=' + token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, skin_tone: skinTone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      onUpdate({ ...user, gender: data.gender, skin_tone: data.skin_tone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <p className="mb-2">Email: {user?.email}</p>
      <form onSubmit={handleUpdate} className="space-y-3">
        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select value={skinTone} onChange={e => setSkinTone(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select Skin Tone</option>
          <option value="fair">Fair</option>
          <option value="medium">Medium</option>
          <option value="olive">Olive</option>
          <option value="dark">Dark</option>
        </select>
        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;