import classNames from "classnames";
import { ComponentProps, forwardRef } from "react";

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
            "border-2 outline-4 outline-transparent",
            "bg-foreground/10 peer-checked:bg-white",
            "peer-hover:border-foreground/20 peer-checked:peer-hover:border-foreground",
            "border-transparent peer-checked:border-foreground",
            "peer-focus:outline-focus peer-checked:peer-focus:outline-focus"
          )}
        >
          {emoji}
        </label>
      </div>
    );
  }
);

export default EmojiCheckbox;
