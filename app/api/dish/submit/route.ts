import { NextRequest } from "next/server";
import { streamFeedback, generateDishImage } from "@/lib/agents/resultAgent";
import type { AIModelConfig, ChaosEvent, DishSubmission, CustomerData, DishData } from "@/types/game";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    customer: CustomerData;
    dish: DishData;
    submission: DishSubmission;
    textConfig: AIModelConfig;
    imageConfig: AIModelConfig;
    chaosEvent?: ChaosEvent;
  };

  const { customer, dish, submission, textConfig, imageConfig, chaosEvent } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Fire image generation in parallel (don't await yet)
        const imagePromise = generateDishImage(dish, submission, imageConfig).catch((err) => {
          console.error("[image gen failed]", err?.message ?? err);
          send("imageError", { message: String(err?.message ?? "图片生成失败") });
          return "";
        });

        // Stream feedback text
        const { cleanedText, score } = await streamFeedback(
          customer,
          dish,
          submission,
          (chunk) => send("feedback", { chunk }),
          textConfig,
          chaosEvent
        );

        // Wait for image
        const imageUrl = await imagePromise;

        // Send final result event
        send("result", { feedback: cleanedText, score, imageUrl });
      } catch (err) {
        console.error("[/api/dish/submit]", err);
        send("error", { message: "Failed to generate result" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
