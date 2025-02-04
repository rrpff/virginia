import { useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import HomePage from "./pages/Home";
import { Route, Router, Switch } from "wouter";
import AddFeedPage from "./pages/AddFeed";
import NotFound from "./pages/NotFound";
import FeedPage from "./pages/Feed";
import Sidebar from "./components/Sidebar";

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
        <main className="p-8 flex flex-row gap-36">
          <Sidebar />
          <article className="py-3">
            <Router>
              <Switch>
                <Route path="/feed/:id" component={FeedPage} />
                <Route path="/add" component={AddFeedPage} />
                <Route path="/:category" component={HomePage} />
                <Route path="/" component={HomePage} />
                <Route component={NotFound} />
              </Switch>
            </Router>
          </article>
        </main>
      </QueryClientProvider>
    </rpc.Provider>
  );
}
