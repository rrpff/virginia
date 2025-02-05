import classNames from "classnames";
import { WEEK } from "../utils/time";
import TimeAgo from "./TimeAgo";
import { RpcOutputs } from "../rpc";
import { Link } from "wouter";
import { LuExternalLink } from "react-icons/lu";

// TODO: this is getting ugly, what was going on with those domain types huh
type Feed = Omit<NonNullable<RpcOutputs["feed"]>, "items" | "categories">;
type Item = NonNullable<RpcOutputs["feed"]>["items"][number];

export default function Feed({
  feed,
  items,
  link = true,
}: {
  feed: Feed;
  items: Item[];
  link?: boolean;
}) {
  return (
    <div className="max-w-180 flex flex-col gap-1">
      <div className="flex flex-row gap-2">
        <Link
          href={`/f/${feed.id}`}
          className={classNames(
            "group flex flex-row items-center gap-2",
            link ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <img src={feed.iconUrl ?? ""} className="v-icon" />
          <span className="leading-none flex flex-row gap-1">
            <span className="font-bold group-hover:underline underline-offset-2">
              {feed.name ?? formatURL(feed.url)}
            </span>
          </span>
        </Link>
      </div>
      <ul className="flex flex-col pl-8 gap-2">
        {items.map((item, idx) => (
          <a key={idx} href={item.url} className="flex flex-col text-xs group">
            <span className="flex flex-row items-center gap-1">
              <span className="font-bold font-sans line-clamp-1 group-hover:underline underline-offset-2">
                {item.title || <>&mdash;</>}
              </span>
              <TimeBadge time={item.timestamp} />
            </span>
            <span className="flex flex-row items-center gap-1 text-foreground/50">
              <span className="line-clamp-1">{formatURL(item.url)}</span>
              <LuExternalLink />
            </span>
          </a>
        ))}
      </ul>
    </div>
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
