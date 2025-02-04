import { useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import HomePage from "./pages/Home";
import { Route, Router, Switch } from "wouter";
import AddFeedPage from "./pages/AddFeed";

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
        <main className="p-8">
          <Router>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/add" component={AddFeedPage} />
              <Route>
                <h1 className="font-bold">404</h1>
                <p>Nothing here, friend</p>
              </Route>
            </Switch>
          </Router>
        </main>
      </QueryClientProvider>
    </rpc.Provider>
  );
}
