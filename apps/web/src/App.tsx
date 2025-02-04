import { useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import HomePage from "./pages/Home";

const host = `http://${window.location.hostname}:26541`;

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    rpc.createClient({
      links: [
        httpBatchLink({
          url: `${host}/rpc`,
        }),
      ],
    })
  );

  return (
    <rpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </rpc.Provider>
  );
}
