import { useParams } from "wouter";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";
import CategoriesSelector from "../components/CategoriesSelector";
import SourceCard from "../components/SourceCard";
import { SourceInput } from "../components/SourceInput";

export default function FeedPage() {
  const { id } = useParams();

  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });
  const updateFeed = rpc.updateFeed.useMutation();
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

      <aside className="flex flex-col grow-0 pr-16 max-w-72">
        <h2 className="font-bold leading-none mb-2">Settings</h2>

        {feed.data.sources.map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            onRemove={async () => {
              await deleteSource.mutateAsync({ sourceId: s.id });
              await utils.feed.invalidate({ id });
            }}
          />
        ))}

        <SourceInput
          placeholder="Add another URL?"
          onSelectSource={async (source) => {
            await addSource.mutateAsync({ ...source, feedId: id });
            await utils.feed.invalidate({ id });
          }}
        />

        <CategoriesSelector
          values={feed.data.categories.map((c) => c.id)}
          onChange={async (nextValues) => {
            await updateFeed.mutateAsync({ id, categoryIds: nextValues });
            await utils.feed.invalidate({ id });
          }}
        />
      </aside>
    </div>
  );
}
