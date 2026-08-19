export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} '${year}`;
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${day} ${month} '${year}, ${time}`;
};

/** Notification footer label, e.g. "12:15 PM | Today" */
export const formatNotificationTimeLabel = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let dayStr;
  if (isToday) {
    dayStr = "Today";
  } else if (isYesterday) {
    dayStr = "Yesterday";
  } else {
    dayStr = formatDate(date);
  }

  return `${timeStr} | ${dayStr}`;
};
