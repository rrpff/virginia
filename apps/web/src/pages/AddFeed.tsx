import { FeedSchema } from "@virginia/server";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { rpc } from "../rpc";
import AddCategoryForm from "../components/AddCategoryForm";
import { useForm } from "react-hook-form";
import emojilib from "emojilib";
import { distance } from "fastest-levenshtein";
import { z } from "zod";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
            "border-2 border-transparent peer-focus:border-foreground/20 peer-checked:peer-focus:border-foreground/60 peer-hover:border-foreground/20 peer-checked:peer-hover:border-foreground peer-checked:border-foreground"
          )}
        >
          {emoji}
        </label>
      </div>
    );
  }
);

function useEmojiSearch(query: string) {
  return useMemo(() => {
    if (query === "") return Object.keys(emojilib).slice(0, 18);

    const search = query.replace(/[\s-]/g, "_");
    return Object.entries(emojilib)
      .map(([emoji, terms], idx) => {
        const dist =
          search === ""
            ? idx
            : Math.min(...terms.map((t) => distance(t, search)));

        return [emoji, dist] as const;
      })
      .sort((a, b) => {
        return a[1] < b[1] ? -1 : b[1] < a[1] ? 1 : 0;
      })
      .slice(0, 18)
      .map((emoji) => emoji[0]);
  }, [query]);
}

function EmojiInput(
  props: Omit<ComponentProps<"input">, "onChange" | "value"> & {
    value: string;
    onChange?: (str: string) => void;
  }
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const emojis = useEmojiSearch(props.value ?? "");

  const setEmoji = useCallback(
    (index: number) => {
      setSelectedIndex(0);
      props.onChange?.(emojis[index]);
    },
    [emojis, props]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    function focus() {
      const rect = input?.getBoundingClientRect();
      if (!rect) return;

      setPosition({ x: rect.left, y: rect.top + rect.height });
      setVisible(true);
    }

    function blur() {
      setVisible(false);
    }

    function keydown(e: KeyboardEvent) {
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((cur) => Math.max(0, cur - 1));
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((cur) => Math.min(14, cur + 1)); // TODO: magic numbers
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((cur) => Math.max(0, cur - 5)); // TODO: magic numbers
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((cur) => Math.min(14, cur + 5)); // TODO: magic numbers
      }
      if (e.code === "Enter") {
        e.preventDefault();
        setEmoji(selectedIndex);
        input?.blur();
      }
    }

    input.addEventListener("focus", focus);
    input.addEventListener("blur", blur);
    input.addEventListener("keydown", keydown);
    return () => {
      input.removeEventListener("focus", focus);
      input.removeEventListener("blur", blur);
      input.removeEventListener("keydown", keydown);
    };
  }, [emojis, selectedIndex, setEmoji]);

  return (
    <div>
      <input
        ref={inputRef}
        className={classNames("v-input", props.className)}
        type="text"
        {...props}
        onChange={(e) => props.onChange?.(e.currentTarget.value)}
      />
      <div
        className={classNames(
          "absolute bg-white w-68 flex flex-row flex-wrap gap-1 p-2 rounded-sm z-20",
          visible ? "block pointer-events-auto" : "hidden pointer-events-none"
        )}
        style={{ left: position.x, top: position.y }}
      >
        {emojis.slice(0, 15).map((emoji, idx) => (
          <EmojiCheckbox
            onMouseDown={() => {
              setEmoji(idx);
            }}
            checked={idx === selectedIndex}
            emoji={emoji}
          />
        ))}
      </div>
    </div>
  );
}

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

  // TODO: rename lol
  const x = form.watch();

  const [input, setInput] = useState("");

  return (
    <main>
      <EmojiInput
        placeholder="Pick an emoji"
        value={input}
        onChange={(nextValue) => setInput(nextValue)}
      />
      <Popover>
        <h1 className="font-bold text-xl mb-2">Add a feed</h1>
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
