import type { AgentRunRequest } from "@holo/contracts";
import { CoreError } from "../../errors";
import { mockAgentOutput } from "./mock";

export interface GenerateInput {
  systemPrompt: string;
  userContent: string;
  request: AgentRunRequest;
  /** Appended on a retry after a schema-invalid first response. */
  corrective?: string;
}

/** Provider abstraction. `generate` returns the raw model text (expected JSON). */
export interface ModelRouter {
  readonly model: string;
  generate(input: GenerateInput): Promise<string>;
}

/** MOCK router — deterministic, schema-valid, no network, no key. */
export function mockRouter(model = "mock"): ModelRouter {
  return {
    model,
    generate: ({ request }) => Promise.resolve(JSON.stringify(mockAgentOutput(request))),
  };
}

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

interface AnthropicMessagesResponse {
  content?: { type: string; text?: string }[];
}

/** LIVE router — Anthropic Messages API. Only used when a key is present. */
function anthropicRouter(apiKey: string): ModelRouter {
  return {
    model: `anthropic:${ANTHROPIC_MODEL}`,
    async generate({ systemPrompt, userContent, corrective }) {
      const system = corrective ? `${systemPrompt}\n\n${corrective}` : systemPrompt;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1500,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      });
      if (!res.ok) {
        throw new CoreError("model_provider_error", 502, `provider returned ${res.status}`);
      }
      const data = (await res.json()) as AnthropicMessagesResponse;
      return (data.content ?? []).map((block) => block.text ?? "").join("");
    },
  };
}

/**
 * Resolve the model router from the environment.
 * - AGENT_MODE=mock (default): the mock router.
 * - AGENT_MODE=live + ANTHROPIC_API_KEY present: the live router.
 * - AGENT_MODE=live + no key: falls back to mock (so dev/CI never needs a key).
 */
export function createModelRouter(): ModelRouter {
  const mode = process.env.AGENT_MODE === "live" ? "live" : "mock";
  if (mode === "live") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) return anthropicRouter(key);
    return mockRouter("mock(live-fallback:no-key)");
  }
  return mockRouter("mock");
}
