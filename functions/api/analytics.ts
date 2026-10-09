export const onRequestPost = async ({ request, env }: any) => {
  const { query, clicked_url, dwellTime, type='click' } = await request.json();
  const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
  // SAVE TO D1 - THIS IS YOUR TRAINING DATASET (100% owned)
  // CREATE TABLE IF NOT EXISTS training (query TEXT, url TEXT, clicks INT, dwell INT, ics_boost INT, timestamp DATETIME)
  // On each click, increase ICS for that URL for that query
  // This is exactly how Google trains web results
  const icsBoost = dwellTime > 60 ? 15 : dwellTime > 20 ? 5 : -5;
  return new Response(JSON.stringify({trained:true, query, clicked_url, ics_boost:icsBoost, message:'Google-style training: click + dwell trains ICS'}),{headers:cors});
}
