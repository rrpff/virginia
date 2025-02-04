export function formatTimeAgo(time: number) {
  const duration = Date.now() - time;
  if (duration < MINUTE) return "<1m";

  const minutes = Math.floor(duration / MINUTE);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(duration / HOUR);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(duration / DAY);
  if (days < 24) return `${days}d`;

  const weeks = Math.floor(duration / WEEK);
  if (weeks < 52) return `${weeks}w`;

  const years = Math.floor(duration / YEAR);
  return `${years}y`;
}

export const MINUTE = 60_000;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const YEAR = WEEK * 52;
