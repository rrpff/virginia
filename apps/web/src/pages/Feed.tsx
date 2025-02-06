import { useLocation, useParams } from "wouter";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";
import CategoriesSelector from "../components/CategoriesSelector";
import SourceCard from "../components/SourceCard";
import { SourceInput } from "../components/SourceInput";
import { useMemo } from "react";
import classNames from "classnames";
import { dedup } from "../utils/arrays";

export default function FeedPage() {
  const { id } = useParams();

  const [, setLocation] = useLocation();
  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });
  const updateFeed = rpc.updateFeed.useMutation();
  const deleteFeed = rpc.deleteFeed.useMutation();
  const addSource = rpc.addSource.useMutation();
  const deleteSource = rpc.deleteSource.useMutation();
  const utils = rpc.useUtils();

  const icons = useMemo(() => {
    const sources = feed.data?.sources ?? [];
    return dedup(
      sources.flatMap((i) => {
        return i.iconUrl ? [i.iconUrl] : [];
      })
    );
  }, [feed.data?.sources]);

  if (!id || (feed.isFetched && feed.data === null)) return <NotFound />;
  if (!feed.data) return null;

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex basis-0 grow">
        <Feed feed={feed.data} sources={feed.data.sources} link={false} />
      </div>

      <aside className="flex flex-col grow-0 pr-16 max-w-96">
        <div className="flex flex-col mb-6">
          <label htmlFor="name" className="font-bold leading-none mb-2 text-sm">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="v-input"
            defaultValue={feed.data.name ?? ""}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                e.currentTarget.blur();
              }
            }}
            onBlur={async (e) => {
              await updateFeed.mutateAsync({ id, name: e.currentTarget.value });
              await utils.feed.invalidate({ id });
            }}
          />
        </div>

        {icons.length > 1 && (
          <div className="flex flex-col mb-6">
            <h2 className="font-bold leading-none mb-2 text-sm">Icon</h2>

            <div className="flex flex-row flex-wrap gap-1">
              {icons.map((icon) => (
                <div
                  key={icon}
                  onClick={async () => {
                    await updateFeed.mutateAsync({ id, iconUrl: icon });
                    await utils.feed.invalidate({ id });
                  }}
                  className={classNames(
                    "flex items-center justify-center w-12 h-12 rounded-md",
                    "border-2",
                    feed.data?.iconUrl === icon
                      ? "border-foreground bg-white"
                      : "border-transparent bg-foreground/10"
                  )}
                >
                  <img className="v-icon" src={icon} />
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="font-bold leading-none mb-2 text-sm">Sources</h2>
        <div className="flex flex-col gap-2">
          {feed.data.sources.map((s) => (
            <SourceCard
              size="sm"
              key={s.id}
              source={s}
              onRemove={async () => {
                await deleteSource.mutateAsync({ sourceId: s.id });
                await utils.feed.invalidate({ id });
              }}
            />
          ))}
        </div>

        <SourceInput
          className="mt-2 mb-6 text-sm"
          placeholder="Add another source?"
          onSelectSource={async (source) => {
            await addSource.mutateAsync({ ...source, feedId: id });
            await utils.feed.invalidate({ id });
          }}
        />

        <h2 className="font-bold leading-none mb-2 text-sm">Categories</h2>
        <CategoriesSelector
          values={feed.data.categories.map((c) => c.id)}
          onChange={async (nextValues) => {
            await updateFeed.mutateAsync({ id, categoryIds: nextValues });
            await utils.feed.invalidate({ id });
          }}
        />

        <h2 className="font-bold leading-none mt-6 mb-2 text-sm">Delete</h2>
        <button
          className="v-button"
          onClick={async () => {
            if (confirm("Are you sure?")) {
              await deleteFeed.mutateAsync({ feedId: id });
              setLocation("/");
            }
          }}
        >
          Do it, delete {feed.data.name}
        </button>
      </aside>
    </div>
  );
}
