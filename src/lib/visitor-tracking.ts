import { supabase } from "@/integrations/supabase/client";

const KEY = "poi_device_id";

const sha256 = async (text: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const browserFingerprint = () =>
  [
    navigator.userAgent, navigator.language, navigator.platform,
    screen.width, screen.height, screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? "",
  ].join("|");

/** One device = one stable ID: random localStorage seed + browser fingerprint, hashed. */
export const getDeviceId = async () => {
  let id = localStorage.getItem(KEY);
  if (!id) {
    const seed = crypto.randomUUID();
    id = await sha256(`${seed}|${browserFingerprint()}`);
    localStorage.setItem(KEY, id);
  }
  return id;
};

let started = false;
export const startVisitorTracking = () => {
  if (started || typeof window === "undefined") return;
  started = true;
  const ping = async () => {
    if (document.visibilityState !== "visible") return;
    try {
      await supabase.rpc("track_visitor", { p_device_id: await getDeviceId() });
    } catch { /* tracking must never break the app */ }
  };
  ping();
  window.setInterval(ping, 60_000);
  document.addEventListener("visibilitychange", ping);
  supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN") ping(); });
};
