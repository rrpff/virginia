import { useLocation } from "wouter";
import FeedForm, { useFeedForm } from "../components/FeedForm";
import { rpc } from "../rpc";

export default function AddFeedPage() {
  const [, setLocation] = useLocation();
  const addFeed = rpc.addFeed.useMutation();
  const utils = rpc.useUtils();

  const form = useFeedForm();

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a website</h1>
      <FeedForm
        form={form}
        onSubmit={async (values) => {
          const feed = await addFeed.mutateAsync(values);
          await utils.feeds.invalidate();
          setLocation(`/f/${feed.id}`);
        }}
      />
    </main>
  );
}
