import { createContext, useContext } from "react";

type LiveContextType = {
  isRefreshing: boolean;
  lastSeenTime: number;
};

const LiveContext = createContext<LiveContextType>({
  isRefreshing: false,
  lastSeenTime: Infinity,
});

export const LiveContextProvider = LiveContext.Provider;
export function useLiveContext() {
  return useContext(LiveContext);
}
