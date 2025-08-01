export const formatTimeString = (timeString: string): string => {
  if (!timeString || typeof timeString !== "string") {
    return "Invalid time";
  }

  try {
    const today = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return "Invalid time";
    }

    const timeDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hours,
      minutes
    );

    return timeDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time string:", timeString, error);
    return "Invalid time";
  }
};

export const formatDateString = (dateString: string): string => {
  if (!dateString || typeof dateString !== "string") {
    return "Invalid date";
  }

  try {
    const [year, month, day] = dateString.split("-").map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "Invalid date";
    }

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date string:", dateString, error);
    return "Invalid date";
  }
};

export const formatDateRange = (startDate: string, endDate?: string): string => {
    const formattedStart = formatDateString(startDate);

    if (!endDate) {
        return `Starting ${formattedStart}`;
    }

    const formattedEnd = formatDateString(endDate);
    return `${formattedStart} - ${formattedEnd}`;
};

export const formatDateForAPI = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for API:', date, error);
    return '';
  }
}

export const formatISOTime = (isoString: string): string => {
  if (!isoString) return 'Invalid time';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting ISO time:', isoString, error);
    return 'Invalid time';
  }
};

export const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Invalid day';
};

export const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);  // month is 0-indexed
}
