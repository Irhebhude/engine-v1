/**
 * Live, key-free public data used to ground answers so the engine never
 * guesses at today's prices or rates.
 * All endpoints below are free and require no API key.
 */

export interface LiveFacts {
  fetchedAt: string;
  fx: {
    base: string;
    updated: string | null;
    rates: Record<string, number>;
    source: string;
  } | null;
  crypto: Record<string, { usd: number; ngn: number }> | null;
  fuel: {
    note: string;
    source: string;
    items: { country: string; product: string; price: string }[];
  } | null;
}

const FX_URL = "https://open.er-api.com/v6/latest/USD";
const CRYPTO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana&vs_currencies=usd,ngn";
// Retail pump prices, free public pages (no key)
const FUEL_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South-Africa", "Egypt", "United-States",
  "United-Kingdom", "India", "China", "Canada",
];
const FUEL_SOURCE = "globalpetrolprices.com (free public pages)";

async function fetchFuelFor(country: string, product: "gasoline" | "diesel") {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://www.globalpetrolprices.com/${country}/${product}_prices/`,
      { headers: { "User-Agent": "Mozilla/5.0 (SEARCH-POI Engine)" }, signal: ctrl.signal },
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const m = text.match(
      new RegExp(`The current ${product} price in [^.]{1,60} is ([^.]{1,120})\\.`, "i"),
    );
    if (!m) return null;
    const dateM = text.match(/updated on (\d{2}-[A-Za-z]{3}-\d{4})/);
    return {
      country: country.replace(/-/g, " "),
      product,
      price: m[1].trim(),
      asOf: dateM?.[1] ?? null,
    };
  } catch {
    return null;
  }
}

async function getJson(url: string, ms = 6000): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getLiveFacts(): Promise<LiveFacts> {
  const [fxRaw, cryptoRaw, fuelRaw] = await Promise.all([
    getJson(FX_URL),
    getJson(CRYPTO_URL),
    Promise.all([
      ...FUEL_COUNTRIES.map((c) => fetchFuelFor(c, "gasoline")),
      fetchFuelFor("Nigeria", "diesel"),
    ]).then((r) => r.filter(Boolean)),
  ]);


  const fx = fxRaw?.rates
    ? {
        base: fxRaw.base_code ?? "USD",
        updated: fxRaw.time_last_update_utc ?? null,
        rates: fxRaw.rates as Record<string, number>,
        source: "open.er-api.com (free, no key)",
      }
    : null;

  let fuel: LiveFacts["fuel"] = null;
  if (Array.isArray(fuelRaw) && fuelRaw.length) {
    fuel = {
      note: "Retail pump prices from free public pages; local prices vary by station and state.",
      source: FUEL_SOURCE,
      items: (fuelRaw as any[]).map((r) => ({
        country: r.country,
        product: r.product,
        price: r.asOf ? `${r.price} (as of ${r.asOf})` : r.price,
      })),
    };
  }

  return {
    fetchedAt: new Date().toISOString(),
    fx,
    crypto: cryptoRaw ?? null,
    fuel,
  };
}

/** Compact, model-readable grounding block. */
export function factsToPrompt(f: LiveFacts): string {
  const parts: string[] = [
    `TODAY (UTC): ${f.fetchedAt}`,
  ];
  if (f.fx) {
    const keys = [
      "NGN", "GHS", "KES", "ZAR", "EGP", "XOF", "EUR", "GBP", "CAD", "AUD",
      "CNY", "INR", "JPY", "AED", "SAR", "BRL", "CHF",
    ];
    const rows = keys
      .filter((k) => f.fx!.rates[k] != null)
      .map((k) => `1 USD = ${f.fx!.rates[k]} ${k}`)
      .join("; ");
    parts.push(
      `LIVE EXCHANGE RATES (${f.fx.source}, updated ${f.fx.updated ?? "today"}): ${rows}. Rates for any other currency can be derived from these.`,
    );
  }
  if (f.crypto) {
    parts.push(`LIVE CRYPTO: ${JSON.stringify(f.crypto)}`);
  }
  if (f.fuel) {
    parts.push(
      `FUEL PRICES (${f.fuel.note}): ${f.fuel.items
        .slice(0, 40)
        .map((i) => `${i.country} ${i.product} ${i.price}`)
        .join("; ")}`,
    );
  }
  parts.push(
    "Use these live figures verbatim when the user asks about rates, currency conversion or fuel prices. Never invent a rate that is not derivable from them, and always state the 'as of' timestamp.",
  );
  return parts.join("\n\n");
}
