import { ComponentProps, useState } from "react";
import { rpc, RpcOutputs } from "../rpc";

type FeedDefinition = RpcOutputs["feedDefinitions"][number];

type Props = ComponentProps<"input"> & {
  onSelectFeed?: (result: FeedDefinition) => void;
};

export function FeedDefinitionInput({ onSelectFeed, ...props }: Props) {
  const [url, setUrl] = useState("");
  const query = rpc.feedDefinitions.useQuery({ url }, { enabled: isURL(url) });

  return (
    <div>
      <input
        type="text"
        className="v-input w-full max-w-96"
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
        {...props}
      />
      {/* TODO: replace with actual autocomplete */}
      {query.data?.length && (
        <div className="p-4 bg-white max-w-96 flex flex-col gap-2">
          {query.data?.map((result) => (
            <span
              key={result.url}
              className="flex flex-row gap-2"
              onClick={() => {
                setUrl("");
                onSelectFeed?.(result);
              }}
            >
              <img src={result.iconUrl ?? ""} className="v-icon" />
              <div className="flex flex-col">
                <span className="font-bold">{result.name}</span>
                <span className="text-sm line-clamp-1">{result.url}</span>
              </div>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function isURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
