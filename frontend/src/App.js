import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import ImageUpload from './components/ImageUpload';
import Wardrobe from './components/Wardrobe';
import { getWardrobeItems } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getWardrobeItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'wardrobe') {
      fetchItems();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Virtual Wardrobe
          </h1>
          <p className="mt-2 text-gray-600">
            Upload, analyze, and organize your clothing items
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Items
            </button>
            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wardrobe'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Wardrobe
              {items.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' ? (
          <ImageUpload onUploadSuccess={() => setActiveTab('wardrobe')} />
        ) : (
          <Wardrobe items={items} loading={loading} onRefresh={fetchItems} />
        )}
      </main>
    </div>
  );
}

export default App;