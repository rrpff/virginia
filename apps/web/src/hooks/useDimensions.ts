import { RefObject, useEffect, useState } from "react";

export default function useDimensions(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setRect(ref.current?.getBoundingClientRect() ?? null);
  }, [ref]);

  return rect;
}
