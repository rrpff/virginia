import { useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import CategoryPage from "./pages/Category";
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
        <main className="pl-0 p-8 flex flex-row gap-24">
          <Sidebar />
          <article className="py-3 w-full">
            <Router>
              <Switch>
                <Route path="/f/:id" component={FeedPage} />
                <Route path="/add" component={AddFeedPage} />
                <Route path="/c/:category" component={CategoryPage} />
                <Route path="/" component={CategoryPage} />
                <Route component={NotFound} />
              </Switch>
            </Router>
          </article>
        </main>
      </QueryClientProvider>
    </rpc.Provider>
  );
}
