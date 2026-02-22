import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const base64Match = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mediaType = `image/${base64Match[1]}` as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
    const base64Data = base64Match[2];

    const prompt = `You are an expert graphologist and behavioral psychologist. Analyze this handwriting image carefully.

Observe: letter size, slant/inclination, pressure (stroke thickness), word spacing, regularity, loops, T-bars, I-dots, baseline consistency, margins.

From these observations, deduce a complete personality profile. Be precise in graphological observations but fun and accessible in interpretation. Use emojis.

Return ONLY valid JSON:
{
  "type": "A creative personality archetype name (e.g. 'The Creative Strategist', 'The Sensitive Explorer')",
  "traits": [
    {"name": "Trait Name", "percentage": 87, "emoji": "relevant emoji"},
    {"name": "Trait Name", "percentage": 72, "emoji": "relevant emoji"},
    {"name": "Trait Name", "percentage": 65, "emoji": "relevant emoji"},
    {"name": "Trait Name", "percentage": 58, "emoji": "relevant emoji"},
    {"name": "Trait Name", "percentage": 45, "emoji": "relevant emoji"}
  ],
  "emotionalStyle": "2-3 sentences about how they handle stress, relationships, and emotions",
  "careers": ["Ideal Career 1 with brief reason", "Ideal Career 2 with brief reason", "Ideal Career 3 with brief reason"],
  "secret": "A surprising hidden trait revealed by the handwriting (1-2 sentences)",
  "characterScore": 82,
  "observations": "Detailed graphological observations about letter size, slant, pressure, spacing, loops etc. (2-3 sentences)"
}`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
          { type: "text", text: prompt },
        ],
      }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
