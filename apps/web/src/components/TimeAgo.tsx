import { useState, useEffect } from "react";
import { formatTimeAgo, HOUR, MINUTE } from "../utils/time";

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
