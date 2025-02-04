import { useParams } from "wouter";
import { useState, useCallback, FormEvent, useEffect } from "react";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";

export default function FeedPage() {
  const { id } = useParams();

  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });
  const updateFeed = rpc.updateFeed.useMutation();

  const [url, setUrl] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const submit = useCallback(
    async (e: FormEvent) => {
      if (!id) return;
      e.preventDefault();

      await updateFeed.mutateAsync({
        id: id,
        url: url.trim(),
        categories: categoryIds,
      });

      feed.refetch();
    },
    [categoryIds, feed, id, updateFeed, url]
  );

  useEffect(() => {
    if (!feed.data) return;
    console.log("replacing");
    setUrl(feed.data.url);
    setCategoryIds(feed.data.categories.map((c) => c.id));
  }, [feed.data]);

  if (!id) return <NotFound />;
  if (!feed.data) return null;

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex basis-0 grow">
        <Feed feed={feed.data} items={feed.data.items} />
      </div>
      <aside className="flex flex-col grow-0 pr-16">
        <h2 className="font-bold leading-none mb-2">Settings</h2>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <div>
            <label className="block text-sm font-bold" htmlFor="url">
              URL
            </label>
            <input
              id="url"
              type="text"
              className="v-input"
              placeholder="website"
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
            />
          </div>
          {/* <div>
            <label className="block text-sm font-bold" htmlFor="categories">
              Categories
            </label>
            <input
              id="categories"
              type="text"
              className="v-input"
              placeholder="space separated emojis"
              value={categories}
              onChange={(e) => setCategories(e.currentTarget.value)}
            />
          </div> */}
          <div>
            <button className="v-button px-8!">Save</button>
          </div>
          <div className="text-red-500 text-sm">
            {updateFeed.error && "Something bad went wrong"}
          </div>
        </form>
      </aside>
    </div>
  );
}
