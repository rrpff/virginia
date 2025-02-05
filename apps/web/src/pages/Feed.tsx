import { useParams } from "wouter";
import Feed from "../components/Feed";
import { rpc } from "../rpc";
import NotFound from "./NotFound";
import FeedForm, { useFeedForm } from "../components/FeedForm";
import { useEffect } from "react";

export default function FeedPage() {
  const { id } = useParams();

  const feed = rpc.feed.useQuery({ id: id! }, { enabled: id !== undefined });
  const updateFeed = rpc.updateFeed.useMutation();
  const form = useFeedForm();

  useEffect(() => {
    if (!feed.data) return;

    form.setValue("url", feed.data.url);
    form.setValue(
      "categoryIds",
      feed.data.categories.map((c) => c.id)
    );
  }, [feed.data, form]);

  if (!id || (feed.isFetched && feed.data === null)) return <NotFound />;
  if (!feed.data) return null;

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex basis-0 grow">
        <Feed feed={feed.data} items={feed.data.items} link={false} />
      </div>
      <aside className="flex flex-col grow-0 pr-16">
        <h2 className="font-bold leading-none mb-2">Settings</h2>
        <FeedForm
          form={form}
          onSubmit={async (values) => {
            await updateFeed.mutateAsync({
              id: id,
              url: values.url,
              categories: values.categoryIds,
            });

            const newData = await feed.refetch();
            if (newData.data) {
              form.reset({
                url: newData.data.url,
                categoryIds: newData.data.categories.map((c) => c.id),
              });
            }
          }}
        />
      </aside>
    </div>
  );
}
