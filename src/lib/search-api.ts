import { getAIResponseWithFailover } from "@/lib/ai-providers";
export const getAIResponse = getAIResponseWithFailover;
export type SearchMode = "default" | "deep_research" | "code" | "academic" | "business";
const modePrompts: Record<SearchMode,string> = { default:"You are SEARCH-POI ENGINE v1.", deep_research:"You are deep research mode.", code:"You are coding expert.", academic:"You are academic mode.", business:"You are business intelligence mode." };
export async function searchWithMode(query:string, mode:SearchMode="default", context:string=""){ localStorage.setItem('search_mode',mode); const sys=modePrompts[mode]; const fullContext=context?`${sys}\nContext: ${context}`:sys; return await getAIResponseWithFailover(query,fullContext); }
export async function searchAPI(query:string, mode:SearchMode="default"){ return searchWithMode(query,mode); }
export async function webSearch(){ return []; }
export async function streamSearch({query,mode="default",context=[],onDelta,onDone}:{query:string;mode?:SearchMode;context?:string[];onDelta:(t:string)=>void;onDone:()=>void;}){ try{ const contextStr=context.length?`\nContext:\n${context.join("\n")}\n`:""; const fullPrompt=`${contextStr}\nUser query (${mode}): ${query}`; const answer=await getAIResponseWithFailover(fullPrompt); const words=answer.split(/(\s+)/); for(const w of words){ onDelta(w); await new Promise(r=>setTimeout(r,15)); } onDone(); }catch(e:any){ onDelta(`Error: ${e.message}`); onDone(); } }
export async function summarizeUrl(){ return ""; } export async function imageSearch(){ return []; } export async function videoSearch(){ return []; }
