import { SourceInput } from "../components/SourceInput";
import { useFieldArray, useForm } from "react-hook-form";
import { FeedCreateSchema } from "@virginia/server";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoriesSelector from "../components/CategoriesSelector";
import { rpc } from "../rpc";
import { useLocation } from "wouter";
import SourceCard from "../components/SourceCard";

type SchemaType = z.infer<typeof Schema>;
const Schema = FeedCreateSchema.extend({
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string().nullable(),
        iconUrl: z.string().nullable(),
      })
    )
    .min(1),
});

export default function AddFeedPage() {
  const [, setLocation] = useLocation();
  const addFeed = rpc.addFeed.useMutation();
  const utils = rpc.useUtils();

  const form = useForm<SchemaType>({
    values: { sources: [], categoryIds: [] },
    resolver: zodResolver(Schema),
  });

  const sources = useFieldArray({ control: form.control, name: "sources" });
  const categories = form.watch("categoryIds");

  const submit = form.handleSubmit(async (values) => {
    const feed = await addFeed.mutateAsync(values);
    await utils.feed.invalidate();

    setLocation(`/f/${feed.id}`);
  });

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a feed</h1>

      <form onSubmit={submit} className="max-w-96">
        {sources.fields.map((s, idx) => (
          <SourceCard
            key={s.id}
            source={s}
            size="lg"
            onRemove={() => {
              sources.remove(idx);
            }}
          />
        ))}

        <div className="pb-8">
          {sources.fields.length === 0 && (
            <SourceInput
              placeholder="Paste a URL"
              autoComplete="off"
              onSelectSource={(source) => {
                sources.append(source);
              }}
            />
          )}
        </div>

        <div className="pb-8 max-w-96">
          <label className="block text font-bold pb-2">Categories</label>
          <CategoriesSelector
            values={categories}
            onChange={(nextValues) => {
              form.setValue("categoryIds", nextValues, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </div>

        <button
          type="submit"
          className="v-button px-8!"
          disabled={
            !form.formState.isValid ||
            !form.formState.isDirty ||
            form.formState.isSubmitting
          }
        >
          Create
        </button>
      </form>
    </main>
  );
}
