import { useLocation, useParams } from "wouter";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";
import CategoriesSelector from "../components/CategoriesSelector";
import SourceCard from "../components/SourceCard";
import { SourceInput } from "../components/SourceInput";

export default function FeedPage() {
  const { id } = useParams();

  const [, setLocation] = useLocation();
  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });
  const updateFeed = rpc.updateFeed.useMutation();
  const deleteFeed = rpc.deleteFeed.useMutation();
  const addSource = rpc.addSource.useMutation();
  const deleteSource = rpc.deleteSource.useMutation();
  const utils = rpc.useUtils();

  if (!id || (feed.isFetched && feed.data === null)) return <NotFound />;
  if (!feed.data) return null;

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex basis-0 grow">
        <Feed feed={feed.data} sources={feed.data.sources} link={false} />
      </div>

      <aside className="flex flex-col grow-0 pr-16 max-w-96">
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
