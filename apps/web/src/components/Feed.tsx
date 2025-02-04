import classNames from "classnames";
import { WEEK } from "../utils/time";
import TimeAgo from "./TimeAgo";
import { RpcOutputs } from "../rpc";

// TODO: this is getting ugly, what was going on with those domain types huh
type Feed = Omit<NonNullable<RpcOutputs["feed"]>, "items">;
type Item = NonNullable<RpcOutputs["feed"]>["items"][number];

export default function Feed({ feed, items }: { feed: Feed; items: Item[] }) {
  return (
    <div className="max-w-180 flex flex-row">
      <div className="shrink-0 px-2">
        {<img src={feed.iconUrl ?? ""} className="v-icon" />}
      </div>
      <div>
        <span className="flex items-center gap-2 font-bold">
          {feed.name ? (
            <span className="mb-1 leading-none">
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
