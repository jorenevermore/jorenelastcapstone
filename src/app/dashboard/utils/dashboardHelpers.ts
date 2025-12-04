/**
 * Dashboard Helper Functions
 * Utility functions for formatting and styling dashboard data
 */

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'fas fa-check-circle';
    case 'confirmed':
      return 'fas fa-calendar-check';
    case 'pending':
      return 'fas fa-clock';
    case 'canceled':
      return 'fas fa-times-circle';
    default:
      return 'fas fa-question-circle';
  }
};

export const calculateCompletionRate = (completed: number, total: number): number => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

