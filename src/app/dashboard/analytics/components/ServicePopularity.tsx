'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../types/appointments';
import { AnalyticsService } from '../../../../lib/services/analytics/AnalyticsService';

interface ServicePopularityProps {
  bookings: Booking[];
}

const ServicePopularity: React.FC<ServicePopularityProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { labels, data } = AnalyticsService.getServicePopularityData(bookings);

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Bookings',
              data,
              backgroundColor: '#3b82f6',
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              borderColor: '#3b82f6',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} bookings`;
                }
              }
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#9ca3af',
                font: { size: 11 },
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: '#9ca3af',
                font: { size: 11 },
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [bookings]);
  
  return (
    <div className="bg-white rounded-lg p-6 flex flex-col h-full border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Services</h3>
      <div className="flex-1 min-h-0">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ServicePopularity;
