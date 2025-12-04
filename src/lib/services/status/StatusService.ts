
export class StatusService {

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'declined': 'bg-gray-100 text-gray-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check-circle',
      'in-progress': 'fas fa-spinner',
      'completed': 'fas fa-check-double',
      'cancelled': 'fas fa-times-circle',
      'declined': 'fas fa-ban',
      'no-show': 'fas fa-user-slash'
    };
    return statusIcons[status] || 'fas fa-question-circle';
  }

  getDateIndicator(dateString: string): { label: string; color: string } {
    let appointmentDate = new Date(dateString);
    let today = new Date();

    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-700' };
    } else if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'bg-green-100 text-green-700' };
    } else if (diffDays === -1) {
      return { label: 'Yesterday', color: 'bg-gray-100 text-gray-700' };
    } else if (diffDays > 1) {
      return { label: `In ${diffDays} days`, color: 'bg-purple-100 text-purple-700' };
    } else {
      return { label: `${Math.abs(diffDays)} days ago`, color: 'bg-gray-100 text-gray-700' };
    }
  }

  isPastDue(booking: { date: string; status: string }): boolean {
    const now = new Date();
    const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString().split('T')[0];

    let bookingDateISO: string;
    if (booking.date.includes('-') && booking.date.length === 10) {
      bookingDateISO = booking.date;
    } else {
      const bookingDate = new Date(booking.date);
      bookingDateISO = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
        .toISOString().split('T')[0];
    }

    const isBookingInPast = bookingDateISO < todayISO;
    const isNotCompleted = !['completed', 'cancelled', 'declined', 'no-show'].includes(booking.status);

    return isBookingInPast && isNotCompleted;
  }
}

