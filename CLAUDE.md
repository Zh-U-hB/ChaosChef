# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chaos Chef** is a web-based cooking simulation game where an LLM Agent acts as the core game engine. Players must improvise dishes using mismatched ingredients supplied by an unreliable assistant. AI judges the results using Claude, and a separate image model generates the final dish photo.

See `开发文档.md` for the full game design and technical specification.

## Tech Stack

- **Framework**: Next.js 15 (App Router) — full-stack, frontend + API routes in one project
- **UI**: React 19 + Tailwind CSS v4
- **State**: Zustand (client-side game state and operation log)
- **Database**: SQLite via Prisma (`customers` and `dishes` tables)
- **Text AI**: Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Image AI**: DALL-E 3 via `openai` SDK
- **Language**: TypeScript throughout

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run lint       # ESLint
npx prisma studio  # browse database
npx prisma db seed # seed customers + dishes data
npx prisma migrate dev --name <name>  # create and apply a migration
```

## Architecture

### Three-Phase Game Loop

Each round follows a strict three-phase flow:

**Phase 1 — Round Start** (`/api/round/start`)
1. Query SQLite DB for a random customer record and a random dish name
2. Call Claude with both → returns `orderDialogue` (customer speech in character) and `ingredients` (the wrong ingredients the bumbling assistant brought)

**Phase 2 — Player Cooking** (client-only)
- Player applies cooking actions (`steam`, `fry`, `bake`, `boil`, `raw`, `mix`, `cut`) to ingredients
- Each step appended to `operationLog[]` in Zustand store
- No server calls during this phase

**Phase 3 — Submit & Results** (`/api/dish/submit`)
- Receives `DishSubmission` JSON (customer context + full `operationLog`)
- Fires two parallel requests:
  - Claude (SSE streaming) → customer feedback text with emotional reaction and score
  - Image model → dish photo URL (Claude first generates an image prompt from the operation log, then passes it to the image API)
- Results merged into a result panel: dish image + streamed feedback text

### Key Files to Know

| Path | Purpose |
|------|---------|
| `lib/agents/roundStartAgent.ts` | Phase 1 agent: DB query → Claude call |
| `lib/agents/resultAgent.ts` | Phase 3 agent: parallel feedback + image generation |
| `lib/prompts/` | All prompt templates (orderDialogue, feedback, imagePainter) |
| `lib/db/queries.ts` | Random customer and dish DB queries |
| `prisma/schema.prisma` | `customers` and `dishes` table definitions |
| `prisma/seed.ts` | Initial data for customers and dishes |
| `store/gameStore.ts` | Zustand store — holds `operationLog`, current customer/dish, phase state |
| `types/game.ts` | Core types including `DishSubmission` |
| `app/api/round/start/route.ts` | Phase 1 API route |
| `app/api/dish/submit/route.ts` | Phase 3 API route (SSE) |

### DishSubmission Type

The central data contract between client and server:

```typescript
interface DishSubmission {
  customerId: string;
  dishName: string;
  operationLog: {
    step: number;
    action: 'steam' | 'fry' | 'bake' | 'boil' | 'raw' | 'mix' | 'cut';
    ingredients: string[];
    duration?: string;
    note?: string;
  }[];
  plating: string[];
}
```

### Environment Variables

```env
ANTHROPIC_API_KEY=
OPENAI_API_KEY=      # for DALL-E 3 image generation
DATABASE_URL="file:./dev.db"
```
