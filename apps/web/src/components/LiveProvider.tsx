import { ServerEvent } from "@virginia/server";
import { rpc } from "../rpc";
import { ReactNode, useEffect, useState } from "react";
import { LiveContextProvider } from "../contexts/live";

const source = new EventSource("//localhost:26541/sse");

export default function LiveProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = rpc.useUtils();

  useEffect(() => {
    function handle(event: ServerEvent) {
      console.log(event);
      switch (event.type) {
        case "feed-updated": {
          utils.feed.invalidate({ id: event.feedId });
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
    }

    function listener(event: MessageEvent) {
      try {
        const message: ServerEvent = JSON.parse(event.data);
        handle(message);
      } catch (err) {
        console.error(`Received unknown message and got error: ${err}`);
      }
    }

    source.addEventListener("message", listener);
    return () => {
      source.removeEventListener("message", listener);
    };
  }, [utils.feed]);

  return (
    <LiveContextProvider value={{ isRefreshing }}>
      {children}
    </LiveContextProvider>
  );
}
