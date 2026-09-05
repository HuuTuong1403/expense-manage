"use client";

import * as React from "react";

/**
 * Theo dõi một media query. Trả về `false` ở lần render đầu trên server để
 * tránh lệch hydration, rồi cập nhật ngay khi mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    function onChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Dưới breakpoint `sm` của Tailwind. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)");
}
