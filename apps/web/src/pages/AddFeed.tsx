import { FeedSchema } from "@virginia/server";
import { rpc } from "../rpc";
import AddCategoryForm from "../components/AddCategoryForm";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";

const Schema = FeedSchema.omit({ id: true });

// function EmojiCheckboxField({ emoji, name }: { name: string; emoji: string }) {
//   const [props] = useField<string>(name);
//   return (
//     <div className="relative">
//       <input id={emoji} type="checkbox" {...props} />
//       <label htmlFor={emoji}>{emoji}</label>
//     </div>
//   );
// }

export default function AddFeedPage() {
  const addFeed = rpc.addFeed.useMutation();
  const categories = rpc.categories.useQuery();
  const utils = rpc.useUtils();

  const form = useForm<z.infer<typeof Schema>>({
    values: { url: "", categoryIds: [] },
    resolver: zodResolver(Schema),
  });

  const submit = form.handleSubmit(async (values) => {
    await addFeed.mutateAsync(values);
    await utils.feeds.invalidate();
    form.reset();
    // TODO: redirect?
  });

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a category</h1>
      <form onSubmit={submit}>
        <div>
          <label className="block text-sm font-bold" htmlFor="url">
            URL
          </label>

          <input
            type="text"
            className="v-input"
            {...form.register("url")}
            placeholder="https://example.com"
          />
          <ErrorMessage name="url" errors={form.formState.errors} />
        </div>

        <div>
          <label className="block text-sm font-bold">Categories</label>

          {/* TODO: aria-labelled-by */}
          {categories.data?.map((category) => (
            <div>
              <label htmlFor={category.id}>{category.icon}</label>
              <input
                id={category.id}
                type="checkbox"
                className="v-input"
                value={category.id}
                {...form.register("categoryIds")}
              />
            </div>
          ))}
          <ErrorMessage name="categoryId" errors={form.formState.errors} />
        </div>
        <div>
          <button
            type="submit"
            className="v-button px-8!"
            disabled={form.formState.isSubmitting}
          >
            Add
          </button>
        </div>
      </form>

      <div className="outline-4 outline-red-500 ml-24">
        <AddCategoryForm />
      </div>
    </main>
  );
}
