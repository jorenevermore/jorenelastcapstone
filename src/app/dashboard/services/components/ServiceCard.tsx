'use client';

import React from 'react';
import { Service, Style } from '../types';
import StyleGrid from './StyleGrid';

interface ServiceCardProps {
  service: Service;
  styles: Style[];
  expanded: boolean;
  globalServiceName: string;
  onToggleExpand: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onEditStyle: (style: Style) => void;
  onAddStyle: (serviceId: string) => void;
  onDeleteStyle: (styleDocId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  styles,
  expanded,
  globalServiceName,
  onToggleExpand,
  onEditService,
  onDeleteService,
  onEditStyle,
  onAddStyle,
  onDeleteStyle
}) => {
  return (
    <>
      <tr
        className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${expanded ? 'bg-gray-50' : ''}`}
        onClick={onToggleExpand}
      >
        <td className="px-6 py-5 whitespace-nowrap">
          {service.featuredImage ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
              <img
                src={service.featuredImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
              <i className="fas fa-cut text-2xl"></i>
            </div>
          )}
        </td>
        <td className="px-6 py-5">
          <div className="font-semibold text-lg text-gray-900">{service.title}</div>
          <div className="text-sm text-gray-500 mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium mr-2">
              <i className="fas fa-tag mr-1"></i>
              {globalServiceName}
            </span>
            {styles.length} {styles.length === 1 ? 'style' : 'styles'} available
          </div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${service.status === 'Available'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'}`}
          >
            {service.status === 'Available' ? (
              <><i className="fas fa-check-circle mr-1.5"></i> {service.status}</>
            ) : (
              <><i className="fas fa-times-circle mr-1.5"></i> {service.status}</>
            )}
          </span>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
          <div className="text-sm text-gray-900">{new Date().toLocaleDateString()}</div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap text-right">
          <div className="flex justify-end space-x-3">
            <button
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEditService(service);
              }}
              title="Edit Service"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteService(service.id);
              }}
              title="Delete Service"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} className="px-0 py-0 bg-gray-50 border-t border-b border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Styles for {service.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddStyle(service.id);
                  }}
                  className="px-3 py-1.5 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors flex items-center"
                >
                  <i className="fas fa-plus mr-1.5"></i> Add Style
                </button>
              </div>
              <StyleGrid
                styles={styles}
                onEditStyle={onEditStyle}
                onDeleteStyle={onDeleteStyle}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ServiceCard;
