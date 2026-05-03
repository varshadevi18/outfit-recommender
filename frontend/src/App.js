import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import ImageUpload from './components/ImageUpload';
import Wardrobe from './components/Wardrobe';
import { getWardrobeItems } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user profile using Authorization header
  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then(data => setUser(data))
        .catch(err => {
          console.error(err);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  const fetchItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getWardrobeItems(token);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'wardrobe' && token) fetchItems();
  }, [activeTab, token]);

  // If no token, show login/signup
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <Login onLogin={(t, u) => { setToken(t); setUser(u); localStorage.setItem('token', t); }} />
          <hr className="my-4" />
          <Signup onSignup={(t, u) => { setToken(t); setUser(u); localStorage.setItem('token', t); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster />
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Virtual Wardrobe</h1>
        <div className="flex gap-4">
          <span>Welcome, {user?.email}</span>
          <button onClick={() => { localStorage.removeItem('token'); setToken(null); }} className="text-red-600">Logout</button>
        </div>
      </header>
      <nav className="border-b bg-white flex gap-8 px-8">
        <button onClick={() => setActiveTab('upload')} className={`py-2 ${activeTab === 'upload' ? 'border-b-2 border-primary-600' : ''}`}>Upload</button>
        <button onClick={() => setActiveTab('wardrobe')} className={`py-2 ${activeTab === 'wardrobe' ? 'border-b-2 border-primary-600' : ''}`}>My Wardrobe ({items.length})</button>
        <button onClick={() => setActiveTab('profile')} className={`py-2 ${activeTab === 'profile' ? 'border-b-2 border-primary-600' : ''}`}>Profile</button>
      </nav>
      <main className="p-8">
        {activeTab === 'upload' && <ImageUpload onUploadSuccess={() => setActiveTab('wardrobe')} token={token} />}
        {activeTab === 'wardrobe' && <Wardrobe items={items} loading={loading} onRefresh={fetchItems} token={token} />}
        {activeTab === 'profile' && <Profile user={user} token={token} onUpdate={(u) => setUser(u)} />}
      </main>
    </div>
  );
}

export default App;