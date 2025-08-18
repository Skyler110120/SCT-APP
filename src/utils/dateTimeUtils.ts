
export const formatTimeString = (timeString: string): string => {
  if (!timeString || typeof timeString !== "string") {
    return "Invalid time";
  }

  try {
    if (timeString.includes("T")) {
      const date = new Date(timeString);

      if (isNaN(date.getTime())) {
        return "Invalid time";
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) {
        return "Invalid time";
      }
      const today = new Date();
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
    }
    return "Invalid time";
  } catch (error) {
    console.error("Error formatting time string:", timeString, error);
    return "Invalid time";
  }
};

export const formatDateString = (dateInput: string | Date): string => {
  if (!dateInput) {
    return 'Invalid date';
  }

  try {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split("-").map(Number);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return "Invalid date";
        }

        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateInput);
      }
    } else {
      console.warn("formatDateString: Unrecognized date format:", dateInput)
      return "Invalid date";
    }

    if (isNaN(date.getTime())) {
      console.warn("formatDateString: Invalid date object created from:", dateInput);
      return "Invalid date";
    }

    return date.toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("formateDateString error:", error, "Input:", dateInput);
    return "Invalid date";
  }
};

export const formatDateRange = (
  startDate: string,
  endDate?: string
): string => {
  const formattedStart = formatDateString(startDate);

  if (!endDate) {
    return `Starting ${formattedStart}`;
  }

  const formattedEnd = formatDateString(endDate);
  return `${formattedStart} - ${formattedEnd}`;
};

export const formatDateForAPI = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return "";
  }

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for API:", date, error);
    return "";
  }
};

export const formatISOTime = (isoString: string): string => {
  if (!isoString) return "Invalid time";

  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return "Invalid time";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting ISO time:", isoString, error);
    return "Invalid time";
  }
};

export const getDayName = (dayNumber: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || "Invalid day";
};

export const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};
