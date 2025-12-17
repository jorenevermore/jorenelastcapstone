'use client';

import React from 'react';
import { Style } from '../../../../types/services';

interface StyleGridProps {
  styles: Style[];
  onEditStyle: (style: Style) => void;
  onDeleteStyle: (styleId: string) => void;
}

const StyleGrid: React.FC<StyleGridProps> = ({ styles, onEditStyle, onDeleteStyle }) => {
  if (styles.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-5xl text-gray-300 mb-3">
          <i className="fas fa-scissors"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No styles available</h3>
        <p className="text-gray-500 mb-4">Add your first style to this service to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {styles.map(style => (
        <div
          key={style.styleId}
          className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300"
        >
          <div className="relative">
            {style.featuredImage ? (
              <div className="h-48 overflow-hidden">
                <img
                  src={style.featuredImage}
                  alt={style.styleName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <i className="fas fa-image text-4xl text-gray-300"></i>
              </div>
            )}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button
                className="p-2 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                onClick={() => onEditStyle(style)}
                title="Edit Style"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="p-2 bg-white rounded-full shadow-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                onClick={() => onDeleteStyle(style.styleId)}
                title="Delete Style"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{style.styleName}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{style.description}</p>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xl font-bold text-black">₱{style.price}</p>
              <span className="text-sm text-gray-500 flex items-center">
                <i className="fas fa-clock mr-1"></i>
                {style.duration}hr{style.duration !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              className="w-full text-gray-500 hover:text-gray-700 text-center py-1"
              onClick={() => onEditStyle(style)}
            >
              <i className="fas fa-edit mr-1"></i>
              Edit Style
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StyleGrid;
