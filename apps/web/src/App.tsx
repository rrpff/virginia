import { FormEvent, Fragment, useCallback, useState } from "react";
import { rpc, RpcOutputs } from "./rpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import TimeAgo from "./components/TimeAgo";
import classNames from "classnames";
import { WEEK } from "./utils/time";

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
  const feeds = rpc.feeds.useQuery();
  const addFeed = rpc.addFeed.useMutation();
  const refresh = rpc.refresh.useMutation();

  const [url, setUrl] = useState("");
  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      await addFeed.mutateAsync({ url: url.trim() });
      setUrl("");

      await refresh.mutateAsync();
      await feeds.refetch();
    },
    [addFeed, feeds, refresh, url]
  );

  const reload = useCallback(async () => {
    await refresh.mutateAsync();
    await feeds.refetch();
  }, [feeds, refresh]);

  return (
    <main className="flex flex-row">
      <header className="flex flex-col gap-4 p-4">
        <div className="text-3xl">✌️</div>
        <section>
          <span className="font-bold">add a feed</span>
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
        </section>
        <section>
          <span className="font-bold">refresh feeds</span>
          <button
            className="block bg-black p-1 px-2 text-white"
            disabled={refresh.isLoading}
            onClick={() => reload()}
          >
            {refresh.isLoading ? "refreshing..." : "do it!"}
          </button>
        </section>
      </header>

      <article className="p-4 pt-2">
        <span className="block font-bold pb-4">
          latest {feeds.isLoading && "(loading...)"}
        </span>
        <ul className="flex flex-col gap-8">
          {feeds.data?.map((feed) => (
            <Feed key={feed.url} feed={feed} />
          ))}
        </ul>
      </article>
    </main>
  );
}

type FeedWithItems = RpcOutputs["feeds"][number];
function Feed({ feed }: { feed: FeedWithItems }) {
  const items = rpc.items.useInfiniteQuery(
    {
      feedId: feed.id,
    },
    {
      initialData: {
        pages: [feed.items],
        pageParams: [],
      },
      initialCursor: feed.items[feed.items.length - 1].id,
      staleTime: 30_000, // see: https://github.com/TanStack/query/discussions/1648
      getNextPageParam: (last) => {
        if (last.length < 3) return null; // TODO: magic number
        return last[last.length - 1].id;
      },
    }
  );

  return (
    <li className="max-w-120">
      <span className="flex items-center gap-2">{formatURL(feed.url)}</span>
      <ul className="flex flex-col gap-0.5">
        {items.data?.pages.map((page, idx) => (
          <Fragment key={idx}>
            {page.map((item) => (
              <a
                key={item.url}
                href={item.url}
                className="flex flex-row text-xs items-center group"
              >
                <span className="font-bold font-sans line-clamp-1 group-hover:underline">
                  {item.title}
                </span>
                <TimeBadge time={item.timestamp} />
              </a>
            ))}
          </Fragment>
        ))}
      </ul>

      {items.hasNextPage && (
        <button
          className="cursor-pointer bg-gray-50 text-sm pb-2 px-2 rounded-sm"
          onClick={() => items.fetchNextPage()}
        >
          &hellip;
        </button>
      )}
    </li>
  );
}

function formatURL(url: string) {
  const uri = new URL(url);
  return uri.host.replace("www.", "") + uri.pathname;
}

function TimeBadge({ time }: { time?: number | null | string }) {
  if (!time) return;

  const timeF = typeof time === "string" ? Date.parse(time) : time;
  return (
    <span
      className={classNames(
        "px-2 py-1 rounded-sm text-xs scale-75",
        Date.now() - timeF < WEEK ? "bg-green-600 text-white" : " bg-gray-200"
      )}
    >
      <TimeAgo time={timeF} />
    </span>
  );
}
