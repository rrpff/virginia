import { FeedSchema } from "@virginia/server";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { rpc } from "../rpc";
import AddCategoryForm from "../components/AddCategoryForm";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentProps, forwardRef } from "react";
import classNames from "classnames";
import { LuPlus } from "react-icons/lu";

const Schema = FeedSchema.omit({ id: true });

type Props = ComponentProps<"input"> & { emoji: string };
const EmojiCheckbox = forwardRef<HTMLInputElement, Props>(
  ({ emoji, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          id={props.id}
          className="peer opacity-0 absolute top-0 left-0 w-full h-full"
          type="checkbox"
          {...props}
        />
        <label
          htmlFor={props.id}
          className={classNames(
            "flex items-center justify-center",
            "text-2xl w-12 h-12 rounded-sm",
            "bg-foreground/10 peer-checked:bg-white",
            "border-2 border-transparent peer-checked:border-foreground"
          )}
        >
          {emoji}
        </label>
      </div>
    );
  }
);

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

  const x = form.watch();
  console.log(x);

  return (
    <main>
      <Popover>
        <h1 className="font-bold text-xl mb-2">Add a feed</h1>
        <form onSubmit={submit} className="flex flex-col gap-2">
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
              disabled={form.formState.isSubmitting}
            >
              Add
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
                  form.setValue("categoryIds", [...x.categoryIds, category.id]);
                  close();
                }}
              />
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </main>
  );
}
