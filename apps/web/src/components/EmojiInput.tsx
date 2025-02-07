import classNames from "classnames";
import {
  ComponentProps,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import useEmojiSearch from "../hooks/useEmojiSearch";
import EmojiCheckbox from "./EmojiCheckbox";

type Props = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange?: (str: string) => void;
};

export default function EmojiInput(props: Props) {
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
    <div className="relative">
      <input
        ref={inputRef}
        className={classNames("v-input", props.className)}
        type="text"
        {...props}
        onChange={(e) => props.onChange?.(e.currentTarget.value)}
        autoComplete="off"
      />
      <div
        className={classNames(
          "fixed bg-contrast w-69 flex flex-row flex-wrap gap-1 p-2 rounded-sm z-20",
          "border-2 border-foreground",
          visible ? "block pointer-events-auto" : "hidden pointer-events-none"
        )}
        style={{ left: position.x, top: position.y }}
      >
        {emojis.slice(0, 15).map((emoji, idx) => (
          <EmojiCheckbox
            key={emoji}
            onMouseDown={() => {
              setEmoji(idx);
            }}
            checked={idx === selectedIndex}
            readOnly
            emoji={emoji}
          />
        ))}
      </div>
    </div>
  );
}
