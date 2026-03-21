import { NextRequest, NextResponse } from "next/server";
import { runRoundStartAgent } from "@/lib/agents/roundStartAgent";
import type { AIModelConfig } from "@/types/game";

export async function POST(req: NextRequest) {
  try {
    const { textConfig } = (await req.json()) as { textConfig: AIModelConfig };
    const data = await runRoundStartAgent(textConfig);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/round/start]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
