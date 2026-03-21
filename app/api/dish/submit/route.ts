import { NextRequest } from "next/server";
import { streamFeedback, generateDishImage } from "@/lib/agents/resultAgent";
import type { DishSubmission, CustomerData, DishData } from "@/types/game";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    customer: CustomerData;
    dish: DishData;
    submission: DishSubmission;
  };

  const { customer, dish, submission } = body;

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
        const imagePromise = generateDishImage(dish, submission).catch(() => "");

        // Stream feedback text
        const { fullText, score } = await streamFeedback(
          customer,
          dish,
          submission,
          (chunk) => send("feedback", { chunk })
        );

        // Wait for image
        const imageUrl = await imagePromise;

        // Send final result event
        send("result", { feedback: fullText, score, imageUrl });
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
