type Env = Record<string, unknown>;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

/**
 * Server clock sync — returns the current UTC timestamp.
 * Used by the frontend to correct for clock drift.
 */
export const onRequestGet: PagesFunction<Env> = async () => {
  return jsonResponse({
    success: true,
    utc: new Date().toISOString(),
    epoch: Date.now(),
  });
};
