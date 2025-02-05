import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeedSchema } from "@virginia/server";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { LuPlus } from "react-icons/lu";
import { z } from "zod";
import { rpc } from "../rpc";
import AddCategoryForm from "./AddCategoryForm";
import EmojiCheckbox from "./EmojiCheckbox";

const Schema = FeedSchema.omit({ id: true });
type SchemaType = z.infer<typeof Schema>;

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedForm() {
  return useForm<SchemaType>({
    values: { url: "", categoryIds: [] },
    resolver: zodResolver(Schema),
  });
}

export default function FeedForm({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useFeedForm>;
  onSubmit: (values: SchemaType) => void;
}) {
  const categories = rpc.categories.useQuery();
  const currentCategoryIds = form.watch("categoryIds");

  const submit = form.handleSubmit(onSubmit);

  return (
    <Popover>
      <form onSubmit={submit} className="flex flex-col gap-2 w-full max-w-96">
        <div>
          <label className="block text-sm font-bold" htmlFor="url">
            URL
          </label>

          <input
            type="text"
            className="v-input p-4 text-lg w-full"
            {...form.register("url")}
            placeholder="https://example.com"
          />

          <ErrorMessage name="url" errors={form.formState.errors} />
        </div>

        <div>
          <label className="block text-sm font-bold">Categories</label>

          {/* TODO: aria-labelled-by */}
          <div className="flex flex-row flex-wrap gap-1">
            {categories.data?.map((category) => (
              <EmojiCheckbox
                id={category.id}
                emoji={category.icon}
                value={category.id}
                title={category.name}
                {...form.register("categoryIds")}
              />
            ))}

            <PopoverButton
              type="button"
              className={classNames(
                "flex items-center justify-center",
                "text-2xl w-12 h-12 rounded-sm",
                "border-2 border-transparent peer-checked:border-foreground"
              )}
            >
              <LuPlus />
            </PopoverButton>
          </div>
          <ErrorMessage name="categoryId" errors={form.formState.errors} />
        </div>
        <div>
          <button
            type="submit"
            className="v-button px-8!"
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            Save
          </button>
        </div>
      </form>
      <PopoverPanel
        className="absolute -mt-12 z-10 bg-white"
        anchor="bottom start"
      >
        {({ close }) => (
          <div className="border-2 border-foreground p-4 rounded-sm">
            <AddCategoryForm
              onSubmit={(category) => {
                form.setValue(
                  "categoryIds",
                  [...currentCategoryIds, category.id],
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  }
                );

                close();
              }}
            />
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
