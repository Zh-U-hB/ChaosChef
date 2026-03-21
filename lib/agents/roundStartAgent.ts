import OpenAI from "openai";
import { getRandomCustomer, getRandomDish } from "@/lib/db/queries";
import { buildOrderDialoguePrompt } from "@/lib/prompts/orderDialogue";
import type { AIModelConfig, RoundStartResponse } from "@/types/game";

export async function runRoundStartAgent(config: AIModelConfig): Promise<RoundStartResponse> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
  });

  const [customer, dish] = await Promise.all([getRandomCustomer(), getRandomDish()]);

  const prompt = buildOrderDialoguePrompt(customer, dish);

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content ?? "";

  let parsed: { orderDialogue: string; ingredients: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    // fallback: extract JSON block from markdown-wrapped responses
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/\{[\s\S]*\}/);
    const raw = Array.isArray(match) ? (match[1] ?? match[0]) : null;
    if (!raw) throw new Error("Failed to parse model response");
    parsed = JSON.parse(raw);
  }

  if (!parsed.orderDialogue || !Array.isArray(parsed.ingredients)) {
    throw new Error(`Invalid model response — missing fields. Got: ${JSON.stringify(parsed)}`);
  }

  return {
    customer,
    dish,
    orderDialogue: parsed.orderDialogue,
    ingredients: parsed.ingredients,
  };
}
