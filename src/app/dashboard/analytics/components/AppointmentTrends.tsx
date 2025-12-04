'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../lib/services/appointment/BaseAppointmentService';

interface AppointmentTrendsProps {
  bookings: Booking[];
}

const AppointmentTrends: React.FC<AppointmentTrendsProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Group bookings by date
    const bookingsByDate = bookings.reduce<Record<string, number>>((acc, booking) => {
      const date = new Date(booking.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(bookingsByDate).sort();

    // Prepare data for chart
    const data = sortedDates.map(date => bookingsByDate[date]);

    // Format dates for display
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Appointments',
              data,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#3b82f6',
              pointRadius: 3,
              pointHoverRadius: 5,
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
              mode: 'index',
              intersect: false,
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
        <h3 className="text-base font-medium text-gray-700">Appointment Trends</h3>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AppointmentTrends;
