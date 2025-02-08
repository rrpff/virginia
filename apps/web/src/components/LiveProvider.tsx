import { ServerEvent } from "@virginia/server";
import { rpc } from "../rpc";
import { ReactNode, useEffect, useState } from "react";
import { LiveContextProvider } from "../contexts/live";

const source = new EventSource("//localhost:26541/sse");

export default function LiveProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = rpc.useUtils();

  useEffect(() => {
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

    source.addEventListener("message", sse);
    return () => {
      source.removeEventListener("message", sse);
    };
  }, [utils.feed]);

  return (
    <LiveContextProvider value={{ isRefreshing }}>
      {children}
    </LiveContextProvider>
  );
}
