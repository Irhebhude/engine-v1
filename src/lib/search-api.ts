import { getAIResponseWithFailover } from "@/lib/ai-providers";
export const getAIResponse = getAIResponseWithFailover;
export type SearchMode = "default" | "deep_research" | "code" | "academic" | "business";
export interface WebResult { url: string; title: string; description: string; markdown?: string; domain?: string; }
export interface ImageResult { url: string; title: string; thumbnail?: string; }
export interface VideoResult { url: string; title: string; thumbnail?: string; }
export interface NewsResult { url: string; title: string; description: string; publishedAt?: string; }

const modePrompts: Record<SearchMode,string> = {
  default:"You are SEARCH-POI ENGINE v1.",
  deep_research:"You are deep research mode.",
  code:"You are coding expert.",
  academic:"You are academic mode.",
  business:"You are business intelligence mode."
};

export async function searchWithMode(query:string, mode:SearchMode="default", context:string=""){
  localStorage.setItem('search_mode',mode);
  const sys=modePrompts[mode];
  const fullContext=context?`${sys}\nContext: ${context}`:sys;
  return await getAIResponseWithFailover(query,fullContext);
}
export async function searchAPI(query:string, mode:SearchMode="default"){ return searchWithMode(query,mode); }
export async function webSearch(_q?:string,_l?:number,_s?:boolean): Promise<WebResult[]> { return []; }
export async function imageSearch(_q?:string): Promise<ImageResult[]> { return []; }
export async function videoSearch(_q?:string): Promise<VideoResult[]> { return []; }
export async function newsSearch(_q?:string): Promise<NewsResult[]> { return []; }
export async function streamSearch({query,mode="default",context=[],onDelta,onDone}:{query:string;mode?:SearchMode;context?:string[];onDelta:(t:string)=>void;onDone:()=>void;}){
  try{
    const contextStr=context.length?`\nContext:\n${context.join("\n")}\n`:"";
    const fullPrompt=`${contextStr}\nUser query (${mode}): ${query}`;
    const answer=await getAIResponseWithFailover(fullPrompt);
    const words=answer.split(/(\s+)/);
    for(const w of words){ onDelta(w); await new Promise(r=>setTimeout(r,15)); }
    onDone();
  }catch(e:any){ onDelta(`Error: ${e.message}`); onDone(); }
}
export async function summarizeUrl(_url?:string): Promise<string> { return ""; }
