import type { SearchParamsInput } from "@/lib/period";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Ghép query hiện tại với các khóa mới; `null`/`""` thì xóa khóa đó. */
export function buildQuery(
  current: URLSearchParams | SearchParamsInput,
  updates: Record<string, string | number | null | undefined>,
) {
  const params =
    current instanceof URLSearchParams
      ? new URLSearchParams(current)
      : new URLSearchParams(
          Object.entries(current).flatMap(([key, value]) => {
            const raw = firstValue(value);
            return raw ? [[key, raw]] : [];
          }),
        );

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}
