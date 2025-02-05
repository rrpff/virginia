import { createContext, useContext } from "react";

type LiveContextType = {
  isRefreshing: boolean;
};

const LiveContext = createContext<LiveContextType>({ isRefreshing: false });

export const LiveContextProvider = LiveContext.Provider;
export function useLiveContext() {
  return useContext(LiveContext);
}
