const SW_PATH = "/sw.js";

function blocked(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAll() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => (r.active?.scriptURL || "").endsWith(SW_PATH))
      .map((r) => r.unregister()),
  );
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (blocked()) {
    await unregisterAll();
    return;
  }
  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch {
    /* offline support unavailable */
  }
}
