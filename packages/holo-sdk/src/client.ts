import {
  AgentRunRequestSchema,
  ArtifactCreateRequestSchema,
  ArtifactCreateResponseSchema,
  CoheringInputSchema,
  CoheringOutputSchema,
  CheckoutRequestSchema,
  CheckoutResponseSchema,
  EntitlementsGetResponseSchema,
  EventWriteRequestSchema,
  EventWriteResponseSchema,
  HurlMintRequestSchema,
  HurlMintResponseSchema,
  HurlResolveResponseSchema,
  MemoryContextResponseSchema,
  MemoryUpsertRequestSchema,
  MemoryUpsertResponseSchema,
  MergeUserRequestSchema,
  MergeUserResponseSchema,
  SetEmailRequestSchema,
  SetEmailResponseSchema,
  OrchestrationNextRequestSchema,
  OrchestrationNextResponseSchema,
  ProductManifestSchema,
  SessionGetResponseSchema,
  SessionResumeRequestSchema,
  SessionResumeResponseSchema,
  SessionStartRequestSchema,
  SessionStartResponseSchema,
  SoulSeedAgentOutputSchema,
} from "@holo/contracts";
import type {
  AgentRunRequest,
  AgentRunResponse,
  ArtifactCreateRequest,
  ArtifactCreateResponse,
  CoheringInput,
  CoheringOutput,
  CheckoutRequest,
  CheckoutResponse,
  EntitlementsGetResponse,
  EventWriteRequest,
  EventWriteResponse,
  HurlMintRequest,
  HurlMintResponse,
  HurlResolveResponse,
  MemoryContextRequest,
  MemoryContextResponse,
  MemoryUpsertRequest,
  MemoryUpsertResponse,
  MergeUserRequest,
  MergeUserResponse,
  SetEmailRequest,
  SetEmailResponse,
  OrchestrationNextRequest,
  OrchestrationNextResponse,
  ProductKey,
  ProductManifest,
  SessionGetResponse,
  SessionResumeRequest,
  SessionResumeResponse,
  SessionStartRequest,
  SessionStartResponse,
} from "@holo/contracts";

// --- minimal isomorphic shims (no zod / no Node / no DOM deps in transport) ---

interface Parser<T> {
  parse(data: unknown): T;
}

export interface HoloFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type HoloFetch = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
) => Promise<HoloFetchResponse>;

export interface HoloClientOptions {
  baseUrl: string;
  /** Override the fetch implementation (defaults to global fetch). */
  fetch?: HoloFetch;
}

export class HoloSdkError extends Error {
  readonly code: string;
  readonly status: number;
  readonly body?: unknown;

  constructor(code: string, status: number, message?: string, body?: unknown) {
    super(message ?? code);
    this.name = "HoloSdkError";
    this.code = code;
    this.status = status;
    this.body = body;
  }
}


export interface HoloClient {
  sessions: {
    start(req: SessionStartRequest): Promise<SessionStartResponse>;
    get(sessionId: string): Promise<SessionGetResponse>;
    resume(req: SessionResumeRequest): Promise<SessionResumeResponse>;
  };
  events: {
    write(req: EventWriteRequest): Promise<EventWriteResponse>;
  };
  memory: {
    upsert(req: MemoryUpsertRequest): Promise<MemoryUpsertResponse>;
    context(req: MemoryContextRequest): Promise<MemoryContextResponse>;
  };
  orchestration: {
    next(req: OrchestrationNextRequest): Promise<OrchestrationNextResponse>;
  };
  hurl: {
    mint(req: HurlMintRequest): Promise<HurlMintResponse>;
    resolve(path: string): Promise<HurlResolveResponse>;
  };
  products: {
    manifest(productKey: ProductKey): Promise<ProductManifest>;
  };
  users: {
    setEmail(req: SetEmailRequest): Promise<SetEmailResponse>;
    merge(req: MergeUserRequest): Promise<MergeUserResponse>;
  };
  commerce: {
    createCheckout(req: CheckoutRequest): Promise<CheckoutResponse>;
  };
  agents: {
    run(req: AgentRunRequest): Promise<AgentRunResponse>;
  };
  artifacts: {
    create(req: ArtifactCreateRequest): Promise<ArtifactCreateResponse>;
    /** Public URL for the shareable Snapshot PNG (no fetch — a URL builder). */
    imageUrl(artifactId: string): string;
  };
  cohering: {
    /** One freeform answer → recognition line + 6 chamber vectors (cohering-v1). */
    run(input: CoheringInput): Promise<CoheringOutput>;
  };
  entitlements: {
    check(userId: string): Promise<EntitlementsGetResponse>;
  };
}

function resolveFetch(custom?: HoloFetch): HoloFetch {
  if (custom) return custom;
  const globalFetch = (globalThis as { fetch?: HoloFetch }).fetch;
  if (!globalFetch) {
    throw new HoloSdkError("no_fetch", 0, "global fetch is unavailable; pass options.fetch");
  }
  return globalFetch;
}

function buildQuery(query: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

/**
 * The typed Core client. The ONLY way a product talks to HOLO Core. Pure typed
 * transport + response validation — no business logic.
 */
export function createHoloClient(options: HoloClientOptions): HoloClient {
  const base = options.baseUrl.replace(/\/$/, "");
  const doFetch = resolveFetch(options.fetch);

  async function send<TRes>(opts: {
    method: "GET" | "POST";
    path: string;
    query?: Record<string, string | undefined>;
    body?: unknown;
    reqSchema?: Parser<unknown>;
    resSchema: Parser<TRes>;
  }): Promise<TRes> {
    const payload = opts.reqSchema ? opts.reqSchema.parse(opts.body) : opts.body;
    const url = base + opts.path + (opts.query ? buildQuery(opts.query) : "");

    const res = await doFetch(url, {
      method: opts.method,
      headers: opts.method === "POST" ? { "content-type": "application/json" } : undefined,
      body: opts.method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
    });

    const raw: unknown = await res.json().catch(() => undefined);
    if (!res.ok) {
      const code =
        raw && typeof raw === "object" && "error" in raw
          ? String((raw as { error: unknown }).error)
          : "request_failed";
      throw new HoloSdkError(code, res.status, `${opts.method} ${opts.path} failed (${res.status})`, raw);
    }
    return opts.resSchema.parse(raw);
  }

  const client: HoloClient = {
    sessions: {
      start: (req) =>
        send({
          method: "POST",
          path: "/v1/sessions/start",
          body: req,
          reqSchema: SessionStartRequestSchema,
          resSchema: SessionStartResponseSchema,
        }),
      get: (sessionId) =>
        send({
          method: "GET",
          path: `/v1/sessions/${encodeURIComponent(sessionId)}`,
          resSchema: SessionGetResponseSchema,
        }),
      resume: (req) =>
        send({
          method: "POST",
          path: "/v1/sessions/resume",
          body: req,
          reqSchema: SessionResumeRequestSchema,
          resSchema: SessionResumeResponseSchema,
        }),
    },

    events: {
      write: (req) =>
        send({
          method: "POST",
          path: "/v1/events",
          body: req,
          reqSchema: EventWriteRequestSchema,
          resSchema: EventWriteResponseSchema,
        }),
    },

    memory: {
      upsert: (req) =>
        send({
          method: "POST",
          path: "/v1/memory/upsert",
          body: req,
          reqSchema: MemoryUpsertRequestSchema,
          resSchema: MemoryUpsertResponseSchema,
        }),
      context: (req) =>
        send({
          method: "GET",
          path: "/v1/memory/context",
          query: {
            userId: req.userId,
            productKey: req.productKey,
            chamberKey: req.chamberKey,
            scopes: req.scopes?.join(","),
          },
          resSchema: MemoryContextResponseSchema,
        }),
    },

    orchestration: {
      next: (req) =>
        send({
          method: "POST",
          path: "/v1/orchestrations/next",
          body: req,
          reqSchema: OrchestrationNextRequestSchema,
          resSchema: OrchestrationNextResponseSchema,
        }),
    },

    hurl: {
      mint: (req) =>
        send({
          method: "POST",
          path: "/v1/hurl/mint",
          body: req,
          reqSchema: HurlMintRequestSchema,
          resSchema: HurlMintResponseSchema,
        }),
      resolve: (path) =>
        send({
          method: "GET",
          path: "/v1/hurl/resolve",
          query: { path },
          resSchema: HurlResolveResponseSchema,
        }),
    },

    products: {
      manifest: (productKey) =>
        send({
          method: "GET",
          path: "/v1/products/manifest",
          query: { productKey },
          resSchema: ProductManifestSchema,
        }),
    },

    users: {
      setEmail: (req) =>
        send({
          method: "POST",
          path: "/v1/users/email",
          body: req,
          reqSchema: SetEmailRequestSchema,
          resSchema: SetEmailResponseSchema,
        }),
      merge: (req) =>
        send({
          method: "POST",
          path: "/v1/users/merge",
          body: req,
          reqSchema: MergeUserRequestSchema,
          resSchema: MergeUserResponseSchema,
        }),
    },

    // commerce + entitlements are live as of S27 (gated by PAYMENTS_ENABLED).
    commerce: {
      createCheckout: (req) =>
        send({
          method: "POST",
          path: "/v1/checkout",
          body: req,
          reqSchema: CheckoutRequestSchema,
          resSchema: CheckoutResponseSchema,
        }),
    },

    // agents/run is live as of S20 (REZZIE/COACH harness, mock-by-default).
    agents: {
      run: (req) =>
        send({
          method: "POST",
          path: "/v1/agents/run",
          body: req,
          reqSchema: AgentRunRequestSchema,
          resSchema: SoulSeedAgentOutputSchema,
        }),
    },
    // artifacts/create is live as of S23 (Core assembles the Snapshot).
    artifacts: {
      create: (req) =>
        send({
          method: "POST",
          path: "/v1/artifacts/create",
          body: req,
          reqSchema: ArtifactCreateRequestSchema,
          resSchema: ArtifactCreateResponseSchema,
        }),
      imageUrl: (artifactId) =>
        `${base}/v1/artifacts/${encodeURIComponent(artifactId)}/image`,
    },
    cohering: {
      // selects the cohering-v1 recipe via agentKey on the shared /v1/agents/run
      run: (input) =>
        send({
          method: "POST",
          path: "/v1/agents/run",
          body: { agentKey: "cohering", ...CoheringInputSchema.parse(input) },
          resSchema: CoheringOutputSchema,
        }),
    },
    entitlements: {
      check: (userId) =>
        send({
          method: "GET",
          path: "/v1/entitlements",
          query: { userId },
          resSchema: EntitlementsGetResponseSchema,
        }),
    },
  };

  return client;
}
