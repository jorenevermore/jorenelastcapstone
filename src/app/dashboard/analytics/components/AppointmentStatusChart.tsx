'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../types/appointments';
import { AnalyticsService } from '../../../../lib/services/analytics/AnalyticsService';

interface AppointmentStatusChartProps {
  bookings: Booking[];
}

const AppointmentStatusChart: React.FC<AppointmentStatusChartProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { labels, data } = AnalyticsService.getAppointmentStatusData(bookings);

    // Map status names to colors
    const statusColorMap: Record<string, string> = {
      'Completed': '#10b981',
      'Cancelled': '#ef4444',
      'Pending': '#f59e0b',
      'Confirmed': '#3b82f6',
      'In Progress': '#8b5cf6',
      'Declined': '#6b7280',
      'No Show': '#f97316',
      'Completed And Reviewed': '#059669',
    };

    const backgroundColors = labels.map(label => statusColorMap[label] || '#9ca3af');

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors,
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 16,
                font: { size: 12 },
                color: '#6b7280',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              borderColor: '#10b981',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            },
          },
          cutout: '70%',
        },
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [bookings]);
  
  const totalAppointments = bookings.length;
  const completedAppointments = bookings.filter(b => b.status === 'completed').length;
  const completionRate = totalAppointments > 0
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0;
  
  return (
    <div className="bg-white rounded-lg p-6 flex flex-col h-full border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Appointment Status</h3>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{completionRate}%</span> complete
        </div>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AppointmentStatusChart;
