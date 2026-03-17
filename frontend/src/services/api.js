import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});

// Upload clothing image
export const uploadClothingImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/wardrobe/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.detail || 'Upload failed');
  }
};

// Get all wardrobe items
export const getWardrobeItems = async () => {
  try {
    const response = await api.get('/wardrobe/items');
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch items');
  }
};

// Get single item
export const getWardrobeItem = async (id) => {
  try {
    const response = await api.get(`/wardrobe/items/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch item');
  }
};

// Delete item
export const deleteWardrobeItem = async (id) => {
  try {
    const response = await api.delete(`/wardrobe/items/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete item');
  }
};

// Get categories with counts
export const getCategories = async () => {
  try {
    const response = await api.get('/wardrobe/categories');
    return response.data;
  } catch (error) {
    console.error('Fetch categories error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch categories');
  }
};

// ===== ADD THIS NEW FUNCTION FOR AI RECOMMENDATIONS =====
export const getOutfitRecommendation = async (query) => {
  try {
    const response = await api.post('/wardrobe/recommend', { query });
    return response.data;
  } catch (error) {
    console.error('Recommendation error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get recommendation');
  }
};
// ===== END OF NEW FUNCTION =====