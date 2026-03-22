import OpenAI from "openai";
import { buildFeedbackPrompt } from "@/lib/prompts/feedback";
import { buildImagePrompt } from "@/lib/prompts/imagePainter";
import type { AIModelConfig, ChaosEvent, CustomerData, DishData, DishSubmission, JudgeScore } from "@/types/game";

// Streams customer feedback text via SSE, returns the full text and score when done.
export async function streamFeedback(
  customer: CustomerData,
  dish: DishData,
  submission: DishSubmission,
  onChunk: (chunk: string) => void,
  config: AIModelConfig,
  chaosEvent?: ChaosEvent
): Promise<{ cleanedText: string; score: JudgeScore }> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
  });

  const prompt = buildFeedbackPrompt(
    customer,
    dish,
    submission.operationLog,
    submission.plating,
    chaosEvent
  );

  const stream = await client.chat.completions.create({
    model: config.model,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  let fullText = "";
  let inThink = false;
  let buf = ""; // buffer for partial tag detection

  const OPEN = "<think>";
  const CLOSE = "</think>";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (!delta) continue;
    fullText += delta;
    buf += delta;

    let output = "";
    while (buf.length > 0) {
      if (inThink) {
        const closeIdx = buf.indexOf(CLOSE);
        if (closeIdx !== -1) {
          inThink = false;
          buf = buf.slice(closeIdx + CLOSE.length).replace(/^\n+/, "");
        } else {
          buf = buf.slice(-CLOSE.length + 1); // keep partial match window
          break;
        }
      } else {
        const openIdx = buf.indexOf(OPEN);
        if (openIdx === -1) {
          // check for partial <think> at end of buffer
          let keepFrom = buf.length;
          for (let i = OPEN.length - 1; i > 0; i--) {
            if (buf.endsWith(OPEN.slice(0, i))) { keepFrom = buf.length - i; break; }
          }
          output += buf.slice(0, keepFrom);
          buf = buf.slice(keepFrom);
          break;
        } else {
          output += buf.slice(0, openIdx);
          inThink = true;
          buf = buf.slice(openIdx + OPEN.length);
        }
      }
    }
    if (output) onChunk(output);
  }
  // flush remaining
  if (buf && !inThink) onChunk(buf);

  // Cleaned text: strip think blocks + trailing score JSON
  const cleanedText = fullText
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/\{[^{}]*"ingredientScore"[^{}]*\}/, "")
    .trim();

  // Parse score from the full raw response
  const scoreMatch = fullText.match(/\{[^{}]*"ingredientScore"[^{}]*\}/);
  let score: JudgeScore = {
    ingredientScore: 5,
    culturalScore: 5,
    creativityScore: 5,
    totalScore: 15,
    rating: "acceptable",
  };

  if (scoreMatch) {
    try {
      const raw = JSON.parse(scoreMatch[0]) as {
        ingredientScore: number;
        culturalScore: number;
        creativityScore: number;
      };
      const total = raw.ingredientScore + raw.culturalScore + raw.creativityScore;
      score = {
        ...raw,
        totalScore: total,
        rating: getRating(total),
      };
    } catch {
      // keep default score
    }
  }

  return { cleanedText, score };
}

export async function generateDishImage(
  dish: DishData,
  submission: DishSubmission,
  config: AIModelConfig
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
  });

  const prompt = buildImagePrompt(dish, submission.operationLog, submission.plating);

  const response = await client.images.generate({
    model: config.model,
    prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data?.[0]?.url ?? "";
}

function getRating(total: number): JudgeScore["rating"] {
  if (total <= 6) return "disaster";
  if (total <= 12) return "poor";
  if (total <= 16) return "acceptable";
  if (total <= 22) return "good";
  if (total <= 27) return "excellent";
  return "masterpiece";
}
