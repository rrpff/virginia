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
    <div className="max-w-180 flex flex-row">
      <Link
        href={`/f/${feed.id}`}
        className={classNames(
          "shrink-0 px-2 peer",
          link ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {<img src={feed.iconUrl ?? ""} className="v-icon" />}
      </Link>
      <div className="peer-hover:[&_.peer-link]:underline">
        <span className="flex items-center gap-2 font-bold">
          <span className="mb-1 leading-none">
            <Link
              href={`/f/${feed.id}`}
              className={classNames(
                "peer-link hover:underline",
                link ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              {feed.name ?? formatURL(feed.url)}
            </Link>{" "}
            <a href={feed.url} className="opacity-50 group">
              <small className="inline-flex flex-row items-center gap-1 group-hover:underline">
                {formatURL(feed.url)} <LuExternalLink />
              </small>
            </a>
          </span>
        </span>
        <ul className="flex flex-col gap-0.5">
          {items.map((item, idx) => (
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
        </ul>
      </div>
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
