import { FormEvent, Fragment, useCallback, useState } from "react";
import { rpc } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

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

function HomePage() {
  const [search, setSearch] = useState("");
  // TODO: debounce

  const feeds = rpc.feeds.useQuery();
  const wall = rpc.wall.useInfiniteQuery(
    { search },
    {
      getNextPageParam: (last) => {
        if (last.length < 20) return null; // TODO: magic number
        return last[last.length - 1].id;
      },
    }
  );
  const addFeed = rpc.addFeed.useMutation();
  const refresh = rpc.refresh.useMutation();

  const [url, setUrl] = useState("");
  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      await addFeed.mutateAsync({ url: url.trim() });
      setUrl("");
      feeds.refetch();
    },
    [addFeed, feeds, url]
  );

  return (
    <main>
      <header className="p-4 pb-2">
        <div className="pb-4 font-black font-serif">Virginia</div>
        <form onSubmit={submit} className="flex flex-row items-center gap-2">
          <input
            type="text"
            className="bg-white border border-black p-1 px-2"
            placeholder="Feed URL"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
          />
          <button className="bg-black p-1 px-2 text-white">add</button>
          <div className="text-red-500">
            {addFeed.error && "Something bad went wrong"}
          </div>
        </form>
      </header>

      <section className="p-4">
        <span>feeds</span>
        <ul>
          {feeds.data?.map((feed) => (
            <li key={feed.id}>{feed.url}</li>
          ))}
        </ul>
        <button
          className="mt-2 bg-black p-1 px-2 text-white"
          disabled={refresh.isLoading}
          onClick={() => refresh.mutate()}
        >
          {refresh.isLoading ? "refreshing..." : "refresh feeds"}
        </button>
      </section>

      <article className="p-4 pt-2">
        <span>latest</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="bg-white border border-black p-1 px-2"
          placeholder="Search"
        />
        {wall.isLoading && <span>loading...</span>}
        <ul className="flex flex-col gap-4">
          {wall.data?.pages.map((page) => (
            <Fragment>
              {page.map((item) => (
                <li key={item.url} className="max-w-120">
                  <a
                    href={item.url}
                    className="flex flex-col visited:text-purple-400"
                  >
                    <span>{formatURL(item.feed.url)}</span>
                    <span className="font-black font-serif text-lg">
                      {item.title}
                    </span>
                    <span className="line-clamp-3">{item.description}</span>
                  </a>
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
        {wall.hasNextPage ? (
          <button
            className="bg-black p-1 px-2 text-white"
            onClick={() => wall.fetchNextPage()}
          >
            more
          </button>
        ) : (
          <span>🏝️ You're at the end. Take it easy.</span>
        )}
      </article>
    </main>
  );
}

function formatURL(url: string) {
  const uri = new URL(url);
  return uri.host.replace("www.", "") + uri.pathname;
}
