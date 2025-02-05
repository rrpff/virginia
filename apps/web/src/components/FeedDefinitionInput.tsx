import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxInputProps,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { rpc, RpcOutputs } from "../rpc";
import classNames from "classnames";

type FeedDefinition = RpcOutputs["feedDefinitions"][number];

type Props = ComboboxInputProps & {
  onSelectFeed?: (result: FeedDefinition) => void;
};

export function FeedDefinitionInput({ onSelectFeed, ...props }: Props) {
  const [query, setQuery] = useState("");

  const results = rpc.feedDefinitions.useQuery(
    { url: query },
    { enabled: isURL(query) }
  );

  return (
    <Combobox
      onChange={(result: FeedDefinition) => {
        if (result !== null) {
          onSelectFeed?.(result);
        }
      }}
    >
      <ComboboxInput
        {...props}
        className={classNames(
          "v-input w-96 data-[open]:rounded-b-none!",
          props.className
        )}
        onChange={(e) => setQuery(e.currentTarget.value)}
      />
      <ComboboxOptions
        anchor="bottom start"
        className="bg-white w-96 border-2 border-t-0 border-foreground rounded-b-sm empty:invisible"
      >
        {results.data?.map((result) => (
          <ComboboxOption
            key={result.url}
            value={result}
            className="flex flex-row gap-2 cursor-pointer p-2 data-[focus]:bg-foreground data-[focus]:text-background"
          >
            <img className="v-icon" src={result.iconUrl ?? ""} />
            <div className="flex flex-col">
              <span className="font-bold">{result.name}</span>
              <span className="text-sm line-clamp-1">{result.url}</span>
            </div>
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
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
