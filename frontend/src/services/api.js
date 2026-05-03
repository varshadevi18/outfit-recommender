import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Upload clothing image
export const uploadClothingImage = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/wardrobe/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Get all wardrobe items
export const getWardrobeItems = async (token) => {
  const response = await api.get('/wardrobe/items', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get single item
export const getWardrobeItem = async (id, token) => {
  const response = await api.get(`/wardrobe/items/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete item
export const deleteWardrobeItem = async (id, token) => {
  const response = await api.delete(`/wardrobe/items/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get categories with counts (if needed)
export const getCategories = async (token) => {
  const response = await api.get('/wardrobe/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// AI outfit recommendation
export const getOutfitRecommendation = async (query, token) => {
  const response = await api.post('/wardrobe/recommend', { query }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};