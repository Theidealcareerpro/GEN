// theidealprogen/src/lib/fingerprint.ts
export async function fingerprint(): Promise<string> {
  const ua = navigator.userAgent || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  let quota = "";
  try {
    quota = String((await (navigator.storage as any)?.estimate?.())?.quota || "");
  } catch {}
  const enc = new TextEncoder().encode([ua, tz, quota].join("|"));
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
