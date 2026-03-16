import React from 'react';
import { FiCalendar, FiTag, FiTrash2, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const ClothingCard = ({ item, viewMode, onDelete, isSelected, onSelect }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getFormalityColor = (level) => {
    const colors = {
      'very_casual': 'bg-green-100 text-green-800',
      'casual': 'bg-blue-100 text-blue-800',
      'business_casual': 'bg-purple-100 text-purple-800',
      'business_formal': 'bg-orange-100 text-orange-800',
      'formal': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatFormality = (level) => {
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
        {/* Selection checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isSelected}
              onChange={(e) => onSelect(item.id, e.target.checked)}
            />
            <div className={`w-5 h-5 border rounded transition-all ${
              isSelected 
                ? 'bg-primary-600 border-primary-600' 
                : 'bg-white border-gray-300 group-hover:border-primary-400'
            }`}>
              {isSelected && <FiCheck className="h-4 w-4 text-white" />}
            </div>
          </label>
        </div>

        <div className="relative">
          <img
            src={`http://localhost:8000${item.image_url}`}
            alt={item.category}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={() => onDelete(item.id)}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiTrash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 capitalize">
              {item.category}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getFormalityColor(item.formality_level)}`}>
              {formatFormality(item.formality_level)}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                style={{ backgroundColor: item.color_primary }}
              />
              <span className="capitalize">{item.color_primary.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <FiTag className="h-4 w-4 mr-2" />
              <span className="capitalize">{item.pattern}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <FiCalendar className="h-4 w-4 mr-2" />
              <span>{formatDate(item.upload_date)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />

        <img
          src={`http://localhost:8000${item.image_url}`}
          alt={item.category}
          className="w-16 h-16 object-cover rounded-lg"
        />

        <div className="flex-1 grid grid-cols-6 gap-4">
          <div className="col-span-1">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {item.category}
            </p>
            <p className="text-xs text-gray-500">Category</p>
          </div>

          <div className="col-span-1">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                style={{ backgroundColor: item.color_primary }}
              />
              <p className="text-sm text-gray-900 capitalize">
                {item.color_primary.replace('_', ' ')}
              </p>
            </div>
            <p className="text-xs text-gray-500">Color</p>
          </div>

          <div className="col-span-1">
            <p className="text-sm text-gray-900 capitalize">{item.pattern}</p>
            <p className="text-xs text-gray-500">Pattern</p>
          </div>

          <div className="col-span-1">
            <p className="text-sm text-gray-900 capitalize">{item.style}</p>
            <p className="text-xs text-gray-500">Style</p>
          </div>

          <div className="col-span-1">
            <span className={`text-xs px-2 py-1 rounded-full ${getFormalityColor(item.formality_level)}`}>
              {formatFormality(item.formality_level)}
            </span>
            <p className="text-xs text-gray-500 mt-1">Formality</p>
          </div>

          <div className="col-span-1 text-right">
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingCard;