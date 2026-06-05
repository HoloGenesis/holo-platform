import type { AgentRunRequest } from "@holo/contracts";
import { CoreError } from "../../errors";
import { mockAgentOutput } from "./mock";

export interface GenerateInput {
  systemPrompt: string;
  userContent: string;
  request: AgentRunRequest;
  /** Which engine output shape the active agent yields. */
  outputKind: "agent" | "synthesis";
  /** The active chamber's opener — the generic mock echoes it when there's no input. */
  chamberIntro: string;
  /** Appended on a retry after a schema-invalid first response. */
  corrective?: string;
}

/** Provider abstraction. `generate` returns the raw model text (expected JSON). */
export interface ModelRouter {
  readonly model: string;
  generate(input: GenerateInput): Promise<string>;
}

/** MOCK router — deterministic, schema-valid, no network, no key, no persona. */
export function mockRouter(model = "mock"): ModelRouter {
  return {
    model,
    generate: ({ request, outputKind, chamberIntro }) =>
      Promise.resolve(JSON.stringify(mockAgentOutput({ request, outputKind, chamberIntro }))),
  };
}

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";

/**
 * The engine's output contract for a real model — derived ONLY from outputKind,
 * never from a persona. The skin owns the voice (systemPrompt); the engine owns
 * the shape. Without this, a live model returns prose and fails schema validation.
 */
function outputContract(outputKind: "agent" | "synthesis"): string {
  const memoryWrites =
    '"memoryWrites": [{ "scope": "profile|state|narrative|trajectory|event", "content": string, "contentJson": object|null, "importance": number (0..1) }]';
  const common =
    '"insight": string (one private observation, not shown to the user),\n' +
    '  "detectedThemes": string[],\n' +
    '  "coherenceDelta": number (small, e.g. -0.2..0.2),\n' +
    `  ${memoryWrites},\n` +
    '  "statePatch": object (optional partial; omit keys you are not changing)';

  if (outputKind === "synthesis") {
    return [
      "Respond with a SINGLE valid JSON object and NOTHING else — no markdown, no prose outside the JSON.",
      "Shape:",
      "{",
      '  "message": string (what the user reads, in your voice),',
      '  "snapshot": {',
      '    "identitySignal": string, "presentState": string, "returningPattern": string,',
      '    "emergingTrajectory": string, "firstInvitation": string,',
      '    "hurl": "hurl://soulseed/living-invitation/state-0/coherence-000",',
      '    "deeperTrajectoryTeaser": string|null',
      "  },",
      `  ${common},`,
      '  "returnSeed": string (one line that will greet them when they return)',
      "}",
    ].join("\n");
  }
  return [
    "Respond with a SINGLE valid JSON object and NOTHING else — no markdown, no prose outside the JSON.",
    "Shape:",
    "{",
    '  "message": string (what the user reads, in your voice),',
    `  ${common},`,
    '  "suggestedNextQuestion": string|null,',
    '  "suggestedNextChamber": string|null',
    "}",
  ].join("\n");
}

interface AnthropicMessagesResponse {
  content?: { type: string; text?: string }[];
}

/**
 * Pull the JSON object out of a model reply: strip ```json fences and any prose
 * before/after the outermost braces. Returns the original text if no object is
 * found (validation will then fail and the runner retries / falls back).
 */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end > start ? body.slice(start, end + 1) : body;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Statuses worth retrying: rate-limit, overloaded, and transient 5xx. */
const TRANSIENT = new Set([408, 429, 500, 502, 503, 529]);
const MAX_ATTEMPTS = 3;

/** LIVE router — Anthropic Messages API. Only used when a key is present. */
function anthropicRouter(apiKey: string): ModelRouter {
  return {
    model: `anthropic:${ANTHROPIC_MODEL}`,
    async generate({ systemPrompt, userContent, outputKind, corrective }) {
      // skin's voice (systemPrompt) + engine's shape contract (outputKind) + retry note
      const parts = [systemPrompt, outputContract(outputKind)];
      if (corrective) parts.push(corrective);
      const system = parts.join("\n\n---\n\n");
      const body = JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: userContent }],
      });

      let lastStatus = 0;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let res: Response;
        try {
          res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body,
          });
        } catch {
          // network blip — treat as transient and retry with backoff
          if (attempt < MAX_ATTEMPTS) {
            await sleep(250 * attempt);
            continue;
          }
          throw new CoreError("model_provider_error", 502, "provider unreachable");
        }

        if (res.ok) {
          const data = (await res.json()) as AnthropicMessagesResponse;
          const text = (data.content ?? []).map((block) => block.text ?? "").join("");
          return extractJson(text);
        }

        lastStatus = res.status;
        if (TRANSIENT.has(res.status) && attempt < MAX_ATTEMPTS) {
          await sleep(250 * attempt); // 250ms, 500ms backoff
          continue;
        }
        break; // non-transient (e.g. 400/401/404) — fail fast
      }
      throw new CoreError("model_provider_error", 502, `provider returned ${lastStatus}`);
    },
  };
}

/**
 * Resolve the model router. The mode comes from the skin's agent manifest
 * (per-agent `mode`) and falls back to env AGENT_MODE, then mock.
 * - mock (default): the mock router.
 * - live + ANTHROPIC_API_KEY present: the live router.
 * - live + no key: falls back to mock (so dev/CI never needs a key).
 */
export function createModelRouter(agentMode?: "mock" | "live"): ModelRouter {
  const mode = agentMode ?? (process.env.AGENT_MODE === "live" ? "live" : "mock");
  if (mode === "live") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) return anthropicRouter(key);
    return mockRouter("mock(live-fallback:no-key)");
  }
  return mockRouter("mock");
}
