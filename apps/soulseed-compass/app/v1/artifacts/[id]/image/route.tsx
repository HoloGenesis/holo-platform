import { ImageResponse } from "next/og";
import { SoulSeedSnapshotSchema } from "@holo/contracts";
import { getArtifact, getRepo, writeEvent } from "@holo/core-api";

// NODE runtime (not Edge): the pg-backed CoreRepo is Node-only (next.config
// marks `pg` as a server-external package), so the artifact fetch can't run at
// the edge. next/og's ImageResponse renders in the Node runtime in Next 15, so
// fetch + render happen in this one route. Public read — anyone with the
// artifact id can fetch the image (the user shares it). No email/PII rendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = [
  { label: "IDENTITY SIGNAL", key: "identitySignal" },
  { label: "PRESENT STATE", key: "presentState" },
  { label: "RETURNING PATTERN", key: "returningPattern" },
  { label: "EMERGING TRAJECTORY", key: "emergingTrajectory" },
  { label: "FIRST INVITATION", key: "firstInvitation" },
] as const;

const clip = (value: string): string => (value.length > 96 ? `${value.slice(0, 95)}…` : value);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepo();

  const artifact = await getArtifact(repo, id);
  if (!artifact || artifact.artifactType !== "soulseed-snapshot") {
    return new Response("Not found", { status: 404 });
  }
  const parsed = SoulSeedSnapshotSchema.safeParse(artifact.contentJson);
  if (!parsed.success) return new Response("Not found", { status: 404 });
  const snapshot = parsed.data;

  // analytics — best-effort, never blocks the render
  try {
    await writeEvent(repo, {
      userId: artifact.userId,
      sessionId: artifact.sessionId,
      productKey: artifact.productKey,
      chamberKey: "living-invitation",
      eventType: "snapshot_shared",
      payload: { method: "image" },
    });
  } catch {
    // ignore analytics failure
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #15110a 0%, #0a0a0c 60%, #08080a 100%)",
          color: "#ece7dc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#caa24a",
              marginBottom: 28,
            }}
          >
            SoulSeed Snapshot
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FIELDS.map((f) => (
              <div key={f.key} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 13, letterSpacing: 3, color: "#caa24a", opacity: 0.8 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 24, color: "#f4efe4", lineHeight: 1.3 }}>
                  {clip(String(snapshot[f.key]))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 16, color: "#7a756b" }}>
          {snapshot.hurl} · soulseed-compass.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
