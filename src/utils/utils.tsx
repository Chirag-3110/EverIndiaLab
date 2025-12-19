// Function to format a date into "DD MMM YYYY, HH:mm" format, safely handling null/undefined
export function formatDate(dateInput: string) {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
  });
}

// Date with Time
export function formatDateTime(dateInput: string) {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
  });
}

// Function to get status text from status value, safely handling null/undefined
export function getStatusTextAndColor(statusValue: string) {
  if (!statusValue || typeof statusValue !== "string")
    return { text: "Unknown", color: "default" };
  const statusMap: Record<string, { text: string; color: string }> = {
    open: { text: "Open", color: "green" },
    pending: { text: "Pending", color: "orange" },
    closed: { text: "Closed", color: "red" },
  };
  return (
    statusMap[statusValue.toLowerCase()] || {
      text: "Unknown",
      color: "default",
    }
  );
}

export const bookingStatusColors = {
  pending: "orange",
  confirmed: "blue",
  in_progress: "cyan",
  in_route: "geekblue",
  completed: "green",
  sample_received: "green",
  cancelled: "red",
  assigned: "purple",
  started: "gold",
  test_collected: "magenta",
  temporary_completed: "lime",
};
