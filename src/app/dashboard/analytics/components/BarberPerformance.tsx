'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../lib/services/appointment/BaseAppointmentService';

interface BarberPerformanceProps {
  bookings: Booking[];
}

const BarberPerformance: React.FC<BarberPerformanceProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Group bookings by barber
    const barberStats = bookings.reduce<Record<string, { count: number, completed: number, revenue: number }>>((acc, booking) => {
      const barber = booking.barberName;

      if (!acc[barber]) {
        acc[barber] = { count: 0, completed: 0, revenue: 0 };
      }

      acc[barber].count += 1;

      if (booking.status === 'completed') {
        acc[barber].completed += 1;
        acc[barber].revenue += booking.finalPrice || booking.totalPrice || 0;
      }

      return acc;
    }, {});

    // Sort barbers by number of bookings
    const sortedBarbers = Object.entries(barberStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5); // Top 5 barbers

    // Prepare data for chart
    const labels = sortedBarbers.map(([barber]) => barber);
    const appointmentData = sortedBarbers.map(([, stats]) => stats.count);
    const completionData = sortedBarbers.map(([, stats]) => stats.completed);

    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Total Appointments',
              data: appointmentData,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderWidth: 0,
              borderRadius: 4,
            },
            {
              label: 'Completed',
              data: completionData,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
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
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value}`;
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
  
  // Calculate barber performance metrics
  const barberMetrics = bookings.reduce<Record<string, { count: number, completed: number, revenue: number }>>((acc, booking) => {
    const barber = booking.barberName;

    if (!acc[barber]) {
      acc[barber] = { count: 0, completed: 0, revenue: 0 };
    }

    acc[barber].count += 1;

    if (booking.status === 'completed') {
      acc[barber].completed += 1;
      acc[barber].revenue += booking.finalPrice || booking.totalPrice || 0;
    }

    return acc;
  }, {});

  // Sort barbers by number of bookings
  const topBarbers = Object.entries(barberMetrics)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3); // Top 3 barbers
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-700">Barber Performance</h3>
      </div>
      
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {topBarbers.map(([barber, stats]) => (
            <div key={barber} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-sm mb-1 truncate">{barber}</div>
              <div className="text-lg font-bold">{stats.count} <span className="text-xs text-gray-500">appts</span></div>
              <div className="text-xs text-gray-500">
                {Math.round((stats.completed / stats.count) * 100)}% completion rate
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default BarberPerformance;
