import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { buildFeedbackPrompt } from "@/lib/prompts/feedback";
import { buildImagePrompt } from "@/lib/prompts/imagePainter";
import type { CustomerData, DishData, DishSubmission, JudgeScore } from "@/types/game";

const anthropic = new Anthropic();
const openai = new OpenAI();

// Streams customer feedback text via SSE, returns the full text and score when done.
export async function streamFeedback(
  customer: CustomerData,
  dish: DishData,
  submission: DishSubmission,
  onChunk: (chunk: string) => void
): Promise<{ fullText: string; score: JudgeScore }> {
  const prompt = buildFeedbackPrompt(
    customer,
    dish,
    submission.operationLog,
    submission.plating
  );

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  let fullText = "";
  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      onChunk(chunk.delta.text);
      fullText += chunk.delta.text;
    }
  }

  // Parse score from the last JSON block in the response
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

  return { fullText, score };
}

export async function generateDishImage(
  dish: DishData,
  submission: DishSubmission
): Promise<string> {
  const prompt = buildImagePrompt(dish, submission.operationLog, submission.plating);

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
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
