import { getAIResponseWithFailover } from "@/lib/ai-providers";
export const getAIResponse = getAIResponseWithFailover;
export const generateAIResponse = getAIResponseWithFailover;
export const aiService = { getAIResponse, generateAIResponse };
export default { getAIResponse, generateAIResponse };
