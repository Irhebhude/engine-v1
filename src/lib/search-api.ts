import { getAIResponseWithFailover } from "@/lib/ai-providers";
export const getAIResponse = getAIResponseWithFailover;
export type SearchMode = "default" | "deep_research" | "code" | "academic" | "business";
export interface WebResult { url: string; title: string; description: string; markdown?: string; domain?: string; }
export interface ImageResult { url: string; title: string; thumbnail?: string; }
export interface VideoResult { url: string; title: string; thumbnail?: string; }
export interface NewsResult { url: string; title: string; description: string; publishedAt?: string; }
export async function searchWithMode(query:string, mode:SearchMode="default", context:string=""){ localStorage.setItem('search_mode',mode); return await getAIResponseWithFailover(query, context); }
export async function searchAPI(q:string,m:SearchMode="default"){ return searchWithMode(q,m); }
export async function webSearch(): Promise<WebResult[]> { return []; }
export async function imageSearch(): Promise<ImageResult[]> { return []; }
export async function videoSearch(): Promise<VideoResult[]> { return []; }
export async function newsSearch(): Promise<NewsResult[]> { return []; }
export async function streamSearch({query,mode="default",context=[],onDelta,onDone}:{query:string;mode?:SearchMode;context?:string[];onDelta:(t:string)=>void;onDone:()=>void;}){
  try{ const s=context.length?context.join("\n")+"":""; const ans=await getAIResponseWithFailover(`${s}\n${query}`); const w=ans.split(/(\s+)/); for(const c of w){ onDelta(c); await new Promise(r=>setTimeout(r,15)); } onDone(); }catch(e:any){ onDelta(`Error: ${e.message}`); onDone(); }
}
export async function summarizeUrl(): Promise<string> { return ""; }
