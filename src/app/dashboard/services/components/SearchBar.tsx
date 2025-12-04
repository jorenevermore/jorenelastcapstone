'use client';

import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddService: () => void;
  onAddStyle: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddService,
  onAddStyle
}) => {

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="relative flex-grow md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fas fa-search text-gray-400"></i>
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            onClick={() => onSearchChange('')}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500 gap-3">
        <span>Quick Add:</span>
        <button
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          onClick={onAddService}
        >
          <i className="fas fa-cut mr-1.5"></i> Service
        </button>
        <button
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          onClick={onAddStyle}
        >
          <i className="fas fa-image mr-1.5"></i> Style
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
