export function readQuery(name: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function replaceQuery(values: Record<string, string | number | undefined>) {
  if (typeof window === "undefined") return;
  const query = new URLSearchParams(window.location.search);
  Object.entries(values).forEach(([key, value]) => value === "" || value === undefined || value === 1 ? query.delete(key) : query.set(key, String(value)));
  const search = query.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
}
