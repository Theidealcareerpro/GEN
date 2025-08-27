// theidealprogen/src/lib/client/fp.ts
export function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem("fp");
  if (!fp) {
    if (crypto && "randomUUID" in crypto) fp = crypto.randomUUID();
    else fp = "fp-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("fp", fp);
  }
  return fp;
}
