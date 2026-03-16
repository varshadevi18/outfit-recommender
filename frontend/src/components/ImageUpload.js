import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadClothingImage } from '../services/api';

const ImageUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
    onDropRejected: (rejections) => {
      rejections.forEach(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          toast.error('File is too large. Max size is 5MB');
        } else {
          toast.error(rejection.errors[0].message);
        }
      });
    }
  });

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
    setAnalysisResults(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    for (const fileObj of files) {
      try {
        toast.loading(`Analyzing ${fileObj.file.name}...`, { id: fileObj.id });
        
        const result = await uploadClothingImage(fileObj.file);
        
        setAnalysisResults(prev => ({
          ...prev,
          [fileObj.id]: result
        }));
        
        toast.success(`✓ ${fileObj.file.name} analyzed!`, { id: fileObj.id });
      } catch (error) {
        toast.error(`Failed to analyze ${fileObj.file.name}: ${error.message}`, { id: fileObj.id });
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
    
    // Check if all files were processed
    if (Object.keys(analysisResults).length === files.length) {
      setTimeout(() => {
        onUploadSuccess();
      }, 2000);
    }
  };

  const clearAll = () => {
    files.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    setFiles([]);
    setAnalysisResults({});
  };

  return (
    <div className="space-y-8">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-700 mb-2">
          {isDragActive ? 'Drop your images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-gray-500">
          or click to browse (Max 5MB per image)
        </p>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Uploading {files.length} {files.length === 1 ? 'item' : 'items'}
            </h2>
            <div className="space-x-3">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} ${files.length === 1 ? 'Item' : 'Items'}`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.file.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FiX className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate mb-2">
                      {fileObj.file.name}
                    </p>
                    
                    {/* Analysis Results - NO CONFIDENCE SECTION */}
                    {analysisResults[fileObj.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Category:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {analysisResults[fileObj.id].category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Color:</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: analysisResults[fileObj.id].color_primary }}
                            />
                            <span className="text-sm text-gray-900 capitalize">
                              {analysisResults[fileObj.id].color_primary.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Pattern:</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {analysisResults[fileObj.id].pattern}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Style:</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {analysisResults[fileObj.id].style}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Formality:</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {analysisResults[fileObj.id].formality_level.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
                        <span className="ml-2 text-sm text-gray-500">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;