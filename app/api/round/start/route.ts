import { NextResponse } from "next/server";
import { runRoundStartAgent } from "@/lib/agents/roundStartAgent";

export async function GET() {
  try {
    const data = await runRoundStartAgent();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/round/start]", err);
    return NextResponse.json({ error: "Failed to start round" }, { status: 500 });
  }
}
