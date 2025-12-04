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
  try {
    const [hours, minutes] = timeString.split(':').map(Number);

    // determine session
    let session: 'morning' | 'afternoon' | 'evening';
    let sessionLabel: string;

    if (hours >= 5 && hours < 12) {
      session = 'morning';
      sessionLabel = 'Morning';
    } else if (hours >= 12 && hours < 17) {
      session = 'afternoon';
      sessionLabel = 'Afternoon';
    } else {
      session = 'evening';
      sessionLabel = 'Evening';
    }

    // format time to 12-hour format
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;

    return {
      time: formattedTime,
      session,
      sessionLabel
    };
  } catch {
    return {
      time: timeString,
      session: 'morning',
      sessionLabel: 'Morning'
    };
  }
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
