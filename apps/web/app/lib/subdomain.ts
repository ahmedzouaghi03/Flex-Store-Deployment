/**
 * Builds an href to reach `path` on the shop.<domain> (or www.<domain>) origin,
 * derived from the current request/window host — no domain env var needed.
 * Returns `path` unchanged when already on the target origin, or when `host`
 * isn't known yet (e.g. before client hydration), so it's always a safe default.
 */
export function subdomainHref(path: string, targetSub: "shop" | "www", host: string): string {
  if (!host) return path;
  const [hostname, port] = host.split(":");
  const onShop = hostname.startsWith("shop.");
  if ((targetSub === "shop") === onShop) return path;
  const bareHost = hostname.replace(/^(shop|www)\./, "");
  const portSuffix = port ? `:${port}` : "";
  return `//${targetSub}.${bareHost}${portSuffix}${path}`;
}
