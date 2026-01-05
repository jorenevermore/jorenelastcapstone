'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Booking } from '../../../../types/appointments';
import { AnalyticsService } from '../../../../lib/services/analytics/AnalyticsService';

interface RevenueChartProps {
  bookings: Booking[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { labels, data } = AnalyticsService.getRevenueData(bookings);

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data,
              borderColor: '#10b981',
              backgroundColor: gradient,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointBackgroundColor: '#10b981',
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
              borderColor: '#10b981',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  return `₱${(value || 0).toLocaleString()}`;
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
                color: '#9ca3af',
                font: { size: 11 },
                callback: function(value) {
                  return '₱' + value;
                }
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

  const { averageRevenue } = AnalyticsService.getRevenueMetrics(bookings);

  return (
    <div className="bg-white rounded-lg p-6 flex flex-col h-full border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        <div className="text-sm text-gray-600">
          Avg: <span className="font-semibold">₱{averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default RevenueChart;
