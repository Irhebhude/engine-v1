type Env = Record<string, unknown>;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
 * JSON to CSV export.
 * Accepts a POST body: { data: Record<string, unknown>[], filename?: string }
 * Returns a CSV file download.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  try {
    const body = await request.json() as { data?: Record<string, unknown>[]; filename?: string };
    const rows = Array.isArray(body.data) ? body.data : [];

    if (rows.length === 0) {
      return jsonResponse({ error: "No data provided for export." }, 400);
    }

    const headers = Object.keys(rows[0]);
    const escapeCell = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
    ];
    const csv = csvLines.join("\n");
    const filename = body.filename || `export-${Date.now()}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...CORS_HEADERS,
      },
    });
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }
};
