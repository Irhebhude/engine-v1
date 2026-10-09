export const onRequestGet: PagesFunction<{DB: D1Database}> = async (ctx) => {
  try {
    const hasDB = !!ctx.env.DB;
    if (!hasDB) return Response.json({ hasDB: false, envKeys: Object.keys(ctx.env), error: "DB binding missing at runtime" });
    await ctx.env.DB.prepare(`CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      content TEXT,
      domain TEXT,
      crawled_at INTEGER,
      rank_score REAL DEFAULT 0
    )`).run();
    const check = await ctx.env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return Response.json({ hasDB: true, tables: check.results, ok: true });
  } catch (e) {
    return Response.json({ error: String(e), hasDB: !!ctx.env.DB, envKeys: Object.keys(ctx.env) }, { status: 500 });
  }
}
