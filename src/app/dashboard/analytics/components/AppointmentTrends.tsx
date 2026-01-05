'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../types/appointments';
import { AnalyticsService } from '../../../../lib/services/analytics/AnalyticsService';

interface AppointmentTrendsProps {
  bookings: Booking[];
}

const AppointmentTrends: React.FC<AppointmentTrendsProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { labels, data } = AnalyticsService.getAppointmentTrendsData(bookings);

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Appointments',
              data,
              borderColor: '#3b82f6',
              backgroundColor: gradient,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              borderColor: '#6366f1',
              borderWidth: 1,
              displayColors: false,
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
      <div className="flex-1 min-h-0">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AppointmentTrends;
