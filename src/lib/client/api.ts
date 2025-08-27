// theidealprogen/src/lib/client/api.ts
export async function getUsage(fingerprint: string) {
  const res = await fetch("/api/usage", { headers: { "x-fp": fingerprint } });
  if (!res.ok) throw new Error("Usage fetch failed");
  return res.json();
}

export async function createExtendCheckout(opts: { fingerprint: string; plan: "3m" | "6m"; tier: "supporter" | "business"; }) {
  const res = await fetch("/api/checkout/extend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error("Checkout failed");
  return res.json() as Promise<{ id: string; url: string | null }>;
}
