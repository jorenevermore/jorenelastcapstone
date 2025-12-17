
export interface ParsedDateTime {
  date: string;
  time: string;
  session: 'morning' | 'afternoon' | 'evening';
  sessionLabel: string;
}

const parseDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const parseTime = (timeString: string): { time: string; session: 'morning' | 'afternoon' | 'evening'; sessionLabel: string } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;

  const session = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
  const sessionLabel = session.charAt(0).toUpperCase() + session.slice(1);

  return { time: formattedTime, session, sessionLabel };
};

export const parseBookingDateTime = (date: string, time: string): ParsedDateTime => {
  const parsedDate = parseDate(date);
  const timeInfo = parseTime(time);

  return {
    date: parsedDate,
    time: timeInfo.time,
    session: timeInfo.session,
    sessionLabel: timeInfo.sessionLabel
  };
};
