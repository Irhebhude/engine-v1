import { getLiveFacts } from "../_shared/live-facts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

let cache: { at: number; data: unknown } | null = null;
const TTL = 5 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (cache && Date.now() - cache.at < TTL) {
      return Response.json(cache.data, { headers: corsHeaders });
    }
    const data = await getLiveFacts();
    cache = { at: Date.now(), data };
    return Response.json(data, { headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
