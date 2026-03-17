import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCalendar, FiThumbsUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RecommendationModal = ({ isOpen, onClose, onRecommend }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please describe your occasion');
      return;
    }

    setLoading(true);
    try {
      const result = await onRecommend(query);
      setRecommendation(result);
    } catch (error) {
      toast.error('Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const occasionSuggestions = [
    'Job interview tomorrow',
    'Casual Friday at office',
    'Weekend party',
    'Business meeting',
    'Date night dinner',
    'Wedding ceremony',
    'Gym workout'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-primary-600" />
                AI Outfit Recommender
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {!recommendation ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Tell me about your occasion and I'll recommend the perfect outfit from your wardrobe!
                  </p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {occasionSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., I have a job interview tomorrow, what should I wear?"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <FiSend className="mr-2" />
                            Get Recommendation
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Recommended Outfit for: <span className="text-primary-600">"{query}"</span>
                    </h3>
                    <p className="text-gray-600">{recommendation.description}</p>
                  </div>

                  {recommendation.items.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {recommendation.items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start space-x-4">
                              <img
                                src={`http://localhost:8000${item.item.image_url}`}
                                alt={item.item.category}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full mb-2">
                                  {item.type} - {item.position}
                                </span>
                                <p className="font-medium text-gray-900 capitalize">
                                  {item.item.category}
                                </p>
                                <div className="flex items-center mt-1">
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                                    style={{ backgroundColor: item.item.color_primary }}
                                  />
                                  <span className="text-sm text-gray-600 capitalize">
                                    {item.item.color_primary.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 capitalize mt-1">
                                  {item.item.pattern} • {item.item.formality_level.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <FiThumbsUp className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">Outfit Complete!</h4>
                            <p className="text-sm text-green-700">
                              This outfit has {recommendation.total_items} items perfect for your {recommendation.occasion} occasion.
                              {recommendation.available_counts.tops > 0 && ` You have ${recommendation.available_counts.tops} tops, `}
                              {recommendation.available_counts.bottoms > 0 && `${recommendation.available_counts.bottoms} bottoms, `}
                              {recommendation.available_counts.dresses > 0 && `${recommendation.available_counts.dresses} dresses, `}
                              {recommendation.available_counts.outerwear > 0 && `${recommendation.available_counts.outerwear} outerwear available.`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setRecommendation(null)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Ask Again
                        </button>
                        <button
                          onClick={onClose}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Done
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No suitable items found for this occasion.</p>
                      <p className="text-sm text-gray-400">Try uploading more items or a different occasion.</p>
                      <button
                        onClick={() => setRecommendation(null)}
                        className="mt-4 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                      >
                        Try Another Occasion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecommendationModal;