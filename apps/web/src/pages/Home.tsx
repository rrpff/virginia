import classNames from "classnames";
import { useCallback, Fragment } from "react";
import TimeAgo from "../components/TimeAgo";
import { rpc, RpcOutputs } from "../rpc";
import { WEEK } from "../utils/time";
import { Link } from "wouter";

export default function HomePage() {
  const feeds = rpc.feeds.useQuery();
  const refresh = rpc.refresh.useMutation();

  const reload = useCallback(async () => {
    await refresh.mutateAsync();
    await feeds.refetch();
  }, [feeds, refresh]);

  if (!feeds.isFetched) return;

  return (
    <main className="flex flex-row gap-12">
      <header className="flex flex-col gap-4 w-32">
        <div className="text-3xl">✌️</div>
        <section className="flex flex-col gap-1">
          <button
            className="v-button"
            disabled={refresh.isLoading}
            onClick={() => reload()}
          >
            {refresh.isLoading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="v-button text-center" href="/add">
            Add
          </Link>
        </section>
      </header>

      <article>
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
      initialCursor: feed.items[feed.items.length - 1]?.id,
      staleTime: 30_000, // see: https://github.com/TanStack/query/discussions/1648 // TODO: refocus breaks this, fix
      getNextPageParam: (last) => {
        if (last.length < 3) return null; // TODO: magic number
        return last[last.length - 1].id;
      },
    }
  );

  return (
    <li className="max-w-120 flex flex-row">
      <div className="shrink-0 py-1 px-2">
        <img src={feed.iconUrl ?? ""} className="w-6 h-6" />
      </div>
      <div>
        <span className="flex items-center gap-2 font-bold">
          {feed.name ? (
            <span>
              {feed.name}{" "}
              <a href={feed.url} className="opacity-50 hover:underline">
                <small>{formatURL(feed.url)}</small>
              </a>
            </span>
          ) : (
            formatURL(feed.url)
          )}
        </span>
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
            className="cursor-pointer bg-white/50 text-foreground text-sm pb-2 px-2 rounded-sm"
            onClick={() => items.fetchNextPage()}
          >
            &hellip;
          </button>
        )}
      </div>
    </li>
  );
}

function formatURL(url: string) {
  const uri = new URL(url);
  return uri.host.replace("www.", "") + uri.pathname.replace(/\/$/, "");
}

function TimeBadge({ time }: { time?: number | null | string }) {
  if (!time) return;

  const timeF = typeof time === "string" ? Date.parse(time) : time;
  return (
    <span
      className={classNames(
        "px-2 py-1 rounded-sm text-xs scale-75 font-bold",
        Date.now() - timeF < WEEK
          ? "bg-green-600 text-white"
          : " bg-white/70 text-foreground/70"
      )}
    >
      <TimeAgo time={timeF} />
    </span>
  );
}
