import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxInputProps,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { rpc, RpcOutputs } from "../rpc";
import classNames from "classnames";
import { LuLoader } from "react-icons/lu";
import useDimensions from "../hooks/useDimensions";

type Source = RpcOutputs["sourcesForUrl"][number];

type Props = ComboboxInputProps & {
  onSelectSource?: (result: Source) => void;
};

export function SourceInput({ onSelectSource, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputDimensions = useDimensions(inputRef);
  const [query, setQuery] = useState("");

  const results = rpc.sourcesForUrl.useQuery(
    { url: query },
    { enabled: isURL(query) }
  );

  return (
    <Combobox
      onChange={(result: Source) => {
        if (result !== null) {
          onSelectSource?.(result);
        }
      }}
    >
      <div className="flex flex-row w-full relative">
        <ComboboxInput
          {...props}
          ref={inputRef}
          className={classNames(
            "v-input w-full pr-8!",
            results.data?.length && "data-[open]:rounded-b-none!",
            props.className
          )}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <div className="absolute right-6 top-0 h-full flex items-center">
          <LuLoader
            className={classNames(
              "absolute pointer-events-none",
              results.isFetching
                ? "opacity-100 animate-spin"
                : "invisible animate-none"
            )}
          />
        </div>
      </div>
      <ComboboxOptions
        anchor="bottom start"
        style={{ width: inputDimensions?.width }}
        className={classNames(
          "rounded-b-sm empty:invisible",
          "bg-contrast border-2 border-t-0 border-foreground"
        )}
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
