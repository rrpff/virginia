import { LuTrash } from "react-icons/lu";

// TODO: reuse something else
type Source = {
  url: string;
  name: string | null;
  iconUrl: string | null;
};

export default function SourceCard({
  source,
  onRemove,
}: {
  source: Source;
  onRemove: () => void;
}) {
  return (
    <div className="inline-block">
      <div className="flex flex-row items-center gap-2 bg-white p-4 rounded-sm">
        <img src={source.iconUrl ?? ""} className="v-icon h-12! w-12!" />
        <div className="flex flex-col">
          <span className="font-bold">{source.name}</span>
          <span className="font-bold text-sm text-foreground/50">
            {source.url}
          </span>
        </div>
        <div className="pl-8">
          <button
            type="button"
            className="p-4 rounded-full cursor-pointer hover:bg-foreground/10"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <LuTrash />
          </button>
        </div>
      </div>
    </div>
  );
}
