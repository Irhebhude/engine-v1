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
// Global fuel price dataset, free and key-free (GlobalPetrolPrices mirror on GitHub datasets)
const FUEL_URL =
  "https://raw.githubusercontent.com/datasets/fuel-prices/main/data/fuel-prices.json";

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
    getJson(FUEL_URL),
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
      note: "Retail pump prices from an open public dataset; local prices vary by station and state.",
      source: FUEL_URL,
      items: fuelRaw
        .slice(0, 60)
        .map((r: any) => ({
          country: r.country ?? r.Country ?? "",
          product: r.product ?? r.fuel ?? "gasoline",
          price: String(r.price ?? r.Price ?? ""),
        }))
        .filter((r) => r.country && r.price),
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
