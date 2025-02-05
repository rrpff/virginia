import FeedForm, { useFeedForm } from "../components/FeedForm";
import { rpc } from "../rpc";

export default function AddFeedPage() {
  const addFeed = rpc.addFeed.useMutation();
  const utils = rpc.useUtils();

  const form = useFeedForm();

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a feed</h1>
      <FeedForm
        form={form}
        onSubmit={async (values) => {
          await addFeed.mutateAsync(values);
          await utils.feeds.invalidate();
          form.reset();
          // TODO: redirect? some kinda feedback
        }}
      />
    </main>
  );
}
