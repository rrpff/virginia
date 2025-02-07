import classNames from "classnames";
import { LuTrash } from "react-icons/lu";

type Source = {
  url: string;
  name: string | null;
  iconUrl: string | null;
};

export default function SourceCard({
  source,
  onRemove,
  size,
}: {
  source: Source;
  onRemove: () => void;
  size: "sm" | "lg";
}) {
  return (
    <div
      className={classNames(
        "flex flex-row items-center gap-2 bg-faint rounded-sm",
        {
          "p-3 py-2": size === "sm",
          "p-4": size === "lg",
        }
      )}
    >
      <img
        src={source.iconUrl ?? ""}
        className={classNames("v-icon", {
          "h-12! w-12!": size === "lg",
        })}
      />
      <div className="min-w-0 flex flex-col">
        <span
          className={classNames("min-w-0 font-bold truncate", {
            "text-sm": size === "sm",
          })}
        >
          {source.name}
        </span>
        <span
          className={classNames("min-w-0 font-bold text-muted truncate", {
            "text-xs": size === "sm",
            "text-sm": size === "lg",
          })}
        >
          {source.url}
        </span>
      </div>
      <div
        className={classNames({ "pl-4": size === "sm", "pl-8": size === "lg" })}
      >
        <button
          type="button"
          className={classNames("rounded-full cursor-pointer hover:bg-faint", {
            "p-2": size === "sm",
            "p-4": size === "lg",
          })}
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <LuTrash />
        </button>
      </div>
    </div>
  );
}
