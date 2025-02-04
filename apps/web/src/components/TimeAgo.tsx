import { useState, useEffect } from "react";

export default function TimeAgo({ time }: { time: number }) {
  const [formatted, setFormatted] = useState(formatTimeAgo(time));

  useEffect(() => {
    const duration = Date.now() - time;
    if (duration > HOUR) return;

    setInterval(() => {
      setFormatted(formatTimeAgo(time));
    }, MINUTE);
  }, [time]);

  return formatted;
}

function formatTimeAgo(time: number) {
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

const MINUTE = 60_000;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const YEAR = WEEK * 52;
