import { distance } from "fastest-levenshtein";
import { useMemo } from "react";
import emojilib from "emojilib";

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
      .sort((a, b) => {
        return a[1] < b[1] ? -1 : b[1] < a[1] ? 1 : 0;
      })
      .slice(0, 18)
      .map((emoji) => emoji[0]);
  }, [query]);
}
