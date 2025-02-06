import { distance } from "fastest-levenshtein";
import { useMemo } from "react";
import emojilib from "emojilib";
import { sortBy } from "../utils/arrays";

export default function useEmojiSearch(query: string) {
  return useMemo(() => {
    if (query === "") return Object.keys(emojilib).slice(0, 18);

    const search = query?.replace(/[\s-]/g, "_");
    return Object.entries(emojilib)
      .map(([emoji, terms], idx) => {
        const dist =
          search === ""
            ? idx
            : Math.min(
                ...terms.map((t) => {
                  return Math.min(
                    distance(t, search),
                    ...t.split("_").map((tt) => distance(tt, search))
                  );
                })
              );

        return [emoji, dist] as const;
      })
      .sort(sortBy((e) => e[1], 1))
      .slice(0, 18)
      .map((emoji) => emoji[0]);
  }, [query]);
}
