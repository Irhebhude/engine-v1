import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, type } = await req.json(); // type: "text" | "image"
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (type === "image") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a detailed technical blueprint schematic diagram for: ${query}. 
              Style: Engineering blueprint with dark blue background, white/cyan lines, technical annotations, component labels, dimensions, and connection points. 
              Include: circuit layout, component placement, wiring paths, and technical specifications.
              Make it look like a professional CAD/engineering drawing.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok) throw new Error("Image generation failed");

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      const text = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ imageUrl, text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Text blueprint generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are SEARCH-POI Blueprint Generator — an advanced technical blueprint and build instruction system. 
            Generate comprehensive, detailed technical blueprints for building real-world technology devices and systems.
            
            Always structure your response with these sections:
            ## 📋 Overview
            Brief description of the device/system
            
            ## 🔧 Component List
            Detailed bill of materials with quantities, specifications, and estimated costs
            
            ## 📐 Technical Specifications
            Dimensions, power requirements, operating conditions
            
            ## 🔌 Wiring & Connection Diagram
            Text-based connection diagram showing how components connect
            
            ## 🛠️ Step-by-Step Assembly Guide
            Numbered steps with detailed instructions
            
            ## ⚡ Circuit Layout
            Description of PCB layout or circuit connections
            
            ## 🧪 Testing & Calibration
            How to verify the build works correctly
            
            ## ⚠️ Safety Notes
            Important safety considerations
            
            Be technically accurate, detailed, and practical. Use real component part numbers where possible.`,
          },
          { role: "user", content: `Generate a complete technical blueprint for: ${query}` },
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Usage limit reached." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) throw new Error("Blueprint generation failed");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Blueprint error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
