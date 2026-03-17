import React, { useState, useMemo } from 'react';
import { FiGrid, FiList, FiFilter, FiTrash2, FiCpu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ClothingCard from './ClothingCard';
import RecommendationModal from './RecommendationModal';
import { deleteWardrobeItem, getOutfitRecommendation } from '../services/api';

const Wardrobe = ({ items, loading, onRefresh }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    color: 'all',
    style: 'all',
    formality: 'all'
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const options = {
      categories: ['all', ...new Set(items.map(item => item.category).filter(Boolean))],
      colors: ['all', ...new Set(items.map(item => item.color_primary).filter(Boolean))],
      styles: ['all', ...new Set(items.map(item => item.style).filter(Boolean))],
      formalityLevels: ['all', ...new Set(items.map(item => item.formality_level).filter(Boolean))]
    };
    return options;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.color !== 'all' && item.color_primary !== filters.color) return false;
      if (filters.style !== 'all' && item.style !== filters.style) return false;
      if (filters.formality !== 'all' && item.formality_level !== filters.formality) return false;
      return true;
    });
  }, [items, filters]);

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteWardrobeItem(itemId);
        toast.success('Item deleted successfully');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Delete ${selectedItems.length} items?`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteWardrobeItem(id)));
        toast.success(`${selectedItems.length} items deleted`);
        setSelectedItems([]);
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete some items');
      }
    }
  };

  const handleRecommend = async (query) => {
    try {
      const result = await getOutfitRecommendation(query);
      return result;
    } catch (error) {
      toast.error('Failed to get recommendation');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiList className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                showFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiFilter className="h-4 w-4" />
              <span className="text-sm">Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <FiTrash2 className="h-4 w-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </>
            )}
            
            {/* AI Recommend Button */}
            <button
              onClick={() => setIsRecommendModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-lg hover:from-purple-700 hover:to-primary-700 transition-all shadow-md"
            >
              <FiCpu className="h-4 w-4" />
              <span className="text-sm font-medium">AI Recommend</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    {filterOptions.categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={filters.color}
                    onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    {filterOptions.colors.map(color => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style
                  </label>
                  <select
                    value={filters.style}
                    onChange={(e) => setFilters({ ...filters, style: e.target.value })}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    {filterOptions.styles.map(style => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formality
                  </label>
                  <select
                    value={filters.formality}
                    onChange={(e) => setFilters({ ...filters, formality: e.target.value })}
                    className="w-full rounded-lg border-gray-300 text-sm"
                  >
                    {filterOptions.formalityLevels.map(level => (
                      <option key={level} value={level}>
                        {level.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear filters */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    color: 'all',
                    style: 'all',
                    formality: 'all'
                  })}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-gray-400 mb-4">
            <FiGrid className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-500">
            {items.length === 0 
              ? "Start by uploading some clothing items"
              : "Try adjusting your filters"
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onDelete={handleDelete}
              isSelected={selectedItems.includes(item.id)}
              onSelect={(id, selected) => {
                if (selected) {
                  setSelectedItems([...selectedItems, id]);
                } else {
                  setSelectedItems(selectedItems.filter(i => i !== id));
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecommendModalOpen}
        onClose={() => setIsRecommendModalOpen(false)}
        onRecommend={handleRecommend}
      />
    </div>
  );
};

export default Wardrobe;