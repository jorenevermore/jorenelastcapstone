'use client';

import React from 'react';
import { Style } from '../../../../types/services';

interface StylePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: Style | null;
  onEdit: () => void;
  onDelete: () => void;
}

const StylePreviewModal: React.FC<StylePreviewModalProps> = ({
  isOpen,
  onClose,
  style,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !style) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-black">Style Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            {style.featuredImage ? (
              <div className="h-full">
                <img
                  src={style.featuredImage}
                  alt={style.styleName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center p-8">
                <div className="text-center">
                  <i className="fas fa-image text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-400">No image available</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:w-1/2">
            <h2 className="text-2xl font-bold mb-2">{style.styleName}</h2>
            <div className="flex items-center mb-6">
              <span className="text-xl font-bold text-black">₱{style.price}</span>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Available
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">DESCRIPTION</h4>
              <p className="text-gray-700">
                {style.styleName} is a popular style offered at our barbershop.
                Our skilled barbers are trained to deliver this style with precision and care.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">DURATION</h4>
              <p className="text-gray-700">Approximately 30-45 minutes</p>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={onEdit}
                className="flex-1 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Style
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2.5 bg-white border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePreviewModal;
