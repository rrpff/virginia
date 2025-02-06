import { ServerEvent } from "@virginia/server";
import { rpc } from "../rpc";
import { ReactNode, useEffect, useState } from "react";
import { LiveContextProvider } from "../contexts/live";

const source = new EventSource("//localhost:26541/sse");

export default function LiveProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState(getLastSeenTime());
  const utils = rpc.useUtils();

  useEffect(() => {
    function updateLastSeen() {
      setLastSeenTime(Date.now());
      persistLastSeenTime(Date.now());
    }

    function sse(event: MessageEvent) {
      try {
        const message: ServerEvent = JSON.parse(event.data);
        switch (message.type) {
          case "feed-updated": {
            utils.feed.invalidate({ id: message.feedId });
            return;
          }
          case "refresh-started": {
            setIsRefreshing(true);
            return;
          }
          case "refresh-ended": {
            setIsRefreshing(false);
            return;
          }
        }
      } catch (err) {
        console.error(`Received unknown message and got error: ${err}`);
      }
    }

    window.addEventListener("visibilitychange", updateLastSeen);
    window.addEventListener("beforeunload", updateLastSeen);
    source.addEventListener("message", sse);
    return () => {
      window.removeEventListener("visibilitychange", updateLastSeen);
      window.removeEventListener("beforeunload", updateLastSeen);
      source.removeEventListener("message", sse);
    };
  }, [utils.feed]);

  return (
    <LiveContextProvider value={{ isRefreshing, lastSeenTime }}>
      {children}
    </LiveContextProvider>
  );
}

function getLastSeenTime() {
  const value = window.localStorage.getItem("v_last_left_time");
  return value ? Number(value) : Infinity;
}

function persistLastSeenTime(t: number) {
  window.localStorage.setItem("v_last_left_time", t.toString());
}
