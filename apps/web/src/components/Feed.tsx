import classNames from "classnames";
import TimeAgo from "./TimeAgo";
import { RpcOutputs } from "../rpc";
import { Link } from "wouter";
import { LuExternalLink } from "react-icons/lu";
import { useMemo } from "react";
import { useLiveContext } from "../contexts/live";
import { sortBy } from "../utils/arrays";

// TODO: this is getting ugly, what was going on with those domain types huh
type Feed = Omit<NonNullable<RpcOutputs["feed"]>, "sources" | "categories">;
type Source = NonNullable<RpcOutputs["feed"]>["sources"][number];
type Item = Source["items"][number];

export default function Feed({
  feed,
  sources,
  link = true,
  limit,
}: {
  feed: Feed;
  sources: Source[];
  link?: boolean;
  limit?: number;
}) {
  const items = useMemo(() => {
    const sorted = sources
      .flatMap((source) => source.items)
      .sort(sortBy((e) => e.timestamp));

    return limit ? sorted.slice(0, limit) : sorted;
  }, [limit, sources]);

  return (
    <div className="max-w-180 flex flex-col gap-1">
      <Link
        href={`/f/${feed.id}`}
        className={classNames(
          "group flex flex-row items-center gap-3",
          link ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <img src={feed.iconUrl ?? ""} className="v-icon" />
        <span className="leading-none flex flex-row gap-1">
          <span className="font-bold group-hover:underline underline-offset-2">
            {feed.name}
          </span>
        </span>
      </Link>
      <ul className="flex flex-col pl-9 gap-2">
        {items.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function FeedItem({ item }: { item: Item }) {
  const { isUrl, formatted } = useMemo(() => {
    try {
      const uri = new URL(item.url);
      const formatted =
        uri.host.replace("www.", "") + uri.pathname.replace(/\/$/, "");
      return { isUrl: true, formatted };
    } catch {
      return { isUrl: false, formatted: item.url };
    }
  }, [item.url]);

  const Tag = isUrl ? "a" : "span";
  return (
    <Tag href={item.url} className="flex flex-col text-xs group">
      <span className="flex flex-row items-center">
        <span
          className={classNames(
            "font-bold font-sans line-clamp-1",
            isUrl && "group-hover:underline underline-offset-2"
          )}
        >
          {item.title || <>&mdash;</>}
        </span>
        <TimeBadge time={item.timestamp} />
      </span>
      <span className="flex flex-row items-center gap-1 text-foreground/50">
        <span className="line-clamp-1">{formatted}</span>
        {isUrl && <LuExternalLink />}
      </span>
    </Tag>
  );
}

function TimeBadge({ time }: { time?: number | null | string }) {
  const { lastSeenTime } = useLiveContext();
  if (!time) return;

  const timeF = typeof time === "string" ? Date.parse(time) : time;
  const timeD = new Date(timeF);
  return (
    <span
      title={timeD.toISOString()}
      className={classNames(
        "px-2 py-1 rounded-sm text-xs scale-75 font-bold text-foreground/70",
        timeF > lastSeenTime && "bg-foreground text-white"
      )}
    >
      <TimeAgo time={timeF} />
    </span>
  );
}
