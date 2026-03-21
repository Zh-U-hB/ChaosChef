import Anthropic from "@anthropic-ai/sdk";
import { getRandomCustomer, getRandomDish } from "@/lib/db/queries";
import { buildOrderDialoguePrompt } from "@/lib/prompts/orderDialogue";
import type { RoundStartResponse } from "@/types/game";

const client = new Anthropic();

export async function runRoundStartAgent(): Promise<RoundStartResponse> {
  const [customer, dish] = await Promise.all([getRandomCustomer(), getRandomDish()]);

  const prompt = buildOrderDialoguePrompt(customer, dish);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: { orderDialogue: string; ingredients: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    // fallback if model adds extra text around JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse round start response");
    parsed = JSON.parse(match[0]);
  }

  return {
    customer,
    dish,
    orderDialogue: parsed.orderDialogue,
    ingredients: parsed.ingredients,
  };
}
