import { useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import HomePage from "./pages/Home";
import { Route, Router, Switch } from "wouter";

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
        <Router>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route>
              <main className="p-4">
                <h1 className="font-bold">404</h1>
                <p>Nothing here, friend</p>
              </main>
            </Route>
          </Switch>
        </Router>
      </QueryClientProvider>
    </rpc.Provider>
  );
}
