'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../types/appointments';

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

    // Group bookings by service
    const bookingsByService = bookings.reduce<Record<string, number>>((acc, booking) => {
      const service = booking.serviceOrdered;
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});

    // Sort services by popularity
    const sortedServices = Object.entries(bookingsByService)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 services

    // Prepare data for chart
    const labels = sortedServices.map(([service]) => service);
    const data = sortedServices.map(([, count]) => count);

    const backgroundColors = [
      'rgba(59, 130, 246, 0.7)', 
      'rgba(16, 185, 129, 0.7)', 
      'rgba(245, 158, 11, 0.7)', 
      'rgba(239, 68, 68, 0.7)',  
      'rgba(139, 92, 246, 0.7)',  
    ];
    
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
              backgroundColor: backgroundColors,
              borderWidth: 0,
              borderRadius: 4,
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
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
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
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-700">Most Popular Services</h3>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ServicePopularity;
