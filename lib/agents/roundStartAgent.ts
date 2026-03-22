import OpenAI from "openai";
import { getRandomCustomer, getRandomDish } from "@/lib/db/queries";
import { buildOrderDialoguePrompt } from "@/lib/prompts/orderDialogue";
import type { AIModelConfig, ChaosEvent, RoundStartResponse } from "@/types/game";

const CHAOS_EVENTS: ChaosEvent[] = [
  {
    type: "oven_broken",
    title: "烤箱罢工了！",
    description: "烤箱在最关键的时刻坏了，本轮禁止使用「烤」这个操作。",
    bannedAction: "bake",
  },
  {
    type: "mystery_ingredient",
    title: "神秘礼物！",
    description: "助手神秘地额外塞进来一样东西，说是「特别优惠赠品」。",
    bonusIngredient: pickMysteryIngredient(),
  },
  {
    type: "picky_customer",
    title: "超级挑剔食客！",
    description: "这位食客今天心情不好，对每一口都会加倍苛刻。",
  },
  {
    type: "inspiration",
    title: "灵感爆发！",
    description: "你今天状态极佳，所有创意搭配的得分翻倍！",
  },
];

function pickMysteryIngredient(): string {
  const pool = ["棉花糖", "芥末冰淇淋", "腌制榴莲", "椰子油醋", "辣椒巧克力", "泡菜奶酪", "蜂蜜咸鱼", "抹茶酱油"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollChaosEvent(): ChaosEvent | undefined {
  if (Math.random() > 0.30) return undefined;
  const events = CHAOS_EVENTS.map((e) =>
    e.type === "mystery_ingredient" ? { ...e, bonusIngredient: pickMysteryIngredient() } : e
  );
  return events[Math.floor(Math.random() * events.length)];
}

export async function runRoundStartAgent(config: AIModelConfig): Promise<RoundStartResponse> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
  });

  const [customer, dish] = await Promise.all([getRandomCustomer(), getRandomDish()]);

  const prompt = buildOrderDialoguePrompt(customer, dish);

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content ?? "";

  let parsed: { orderDialogue: string; assistantQuote?: string; ingredients: string[] };
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

  const chaosEvent = rollChaosEvent();

  // If mystery_ingredient event, append the bonus ingredient
  const ingredients = [...parsed.ingredients];
  if (chaosEvent?.type === "mystery_ingredient" && chaosEvent.bonusIngredient) {
    ingredients.push(chaosEvent.bonusIngredient);
  }

  return {
    customer,
    dish,
    orderDialogue: parsed.orderDialogue,
    assistantQuote: parsed.assistantQuote ?? "这些绝对是你要的！相信我！",
    ingredients,
    chaosEvent,
  };
}
