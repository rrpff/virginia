import classNames from "classnames";
import { useCallback, Fragment, useState, MouseEvent } from "react";
import TimeAgo from "../components/TimeAgo";
import { rpc, RpcOutputs } from "../rpc";
import { WEEK } from "../utils/time";
import { Link } from "wouter";
import { LuPlus, LuRefreshCw } from "react-icons/lu";

export default function HomePage() {
  const [category, setCategory] = useState("🌍");
  const refresh = rpc.refresh.useMutation();
  const categories = rpc.categories.useQuery();
  const feeds = rpc.feeds.useQuery(
    {
      category: category === "🌍" ? undefined : category,
    },
    {
      keepPreviousData: true,
    }
  );

  const reload = useCallback(async () => {
    await refresh.mutateAsync();
    await feeds.refetch();
  }, [feeds, refresh]);

  if (!categories.data || !feeds.data) return;

  return (
    <main className="flex flex-row gap-36">
      <header className="flex flex-col items-center gap-4">
        <CategoryLink
          icon="🌍"
          isActive={category === "🌍"}
          onClick={(e) => {
            e.preventDefault();
            setCategory("🌍");
          }}
        />
        {categories.data?.map((cat) => (
          <CategoryLink
            key={cat}
            icon={cat}
            isActive={category === cat}
            onClick={(e) => {
              e.preventDefault();
              setCategory(cat);
            }}
          />
        ))}
        <section className="flex flex-col gap-1 mt-2">
          <button
            className="v-button bg-background! text-foreground! text-lg aspect-square"
            disabled={refresh.isLoading}
            onClick={() => reload()}
          >
            <LuRefreshCw
              style={{
                transition: "transform 0.4s",
                animation: refresh.isLoading ? "spin 1s infinite" : "",
              }}
            />
          </button>
          <Link
            className="v-button bg-background! text-foreground! flex items-center text-xl aspect-square"
            href="/add"
          >
            <LuPlus />
          </Link>
        </section>
      </header>

      <article className="py-3">
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
    <li className="max-w-180 flex flex-row">
      <div className="shrink-0 px-2">
        {<img src={feed.iconUrl ?? ""} className="v-icon" />}
      </div>
      <div>
        <span className="flex items-center gap-2 font-bold">
          {feed.name ? (
            <span className="mb-1" style={{ lineHeight: "1em" }}>
              <span>{feed.name}</span>{" "}
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
              {page.map((item, idx) => (
                <a
                  key={idx}
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
        "px-2 py-1 rounded-sm text-xs scale-75 font-bold text-foreground/70",
        Date.now() - timeF < WEEK && "bg-foreground text-white"
      )}
    >
      <TimeAgo time={timeF} />
    </span>
  );
}

function CategoryLink({
  icon,
  isActive,
  onClick,
}: {
  icon: string;
  isActive: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <div className="relative mb-9">
      <Link
        href="/"
        onClick={onClick}
        className={classNames(
          "text-2xl absolute -left-13 pl-10 pr-4 py-2 rounded-r-md",
          isActive ? "bg-white" : "bg-background hover:bg-foreground/10"
        )}
      >
        {icon}
      </Link>
    </div>
  );
}
