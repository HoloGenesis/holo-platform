import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Markup only — no business logic. The route/core builds `returnUrl` and passes
// the canonical 4-part HURL string; this component only renders it.

export const HURL_INVITATION_SUBJECT = "Your SoulSeed is ready";

export interface HurlInvitationProps {
  /** Canonical return link: APP_URL + ?hurl=<4-part HURL>. */
  returnUrl: string;
  /** The bare HURL coordinate, shown as the user's permanent address. */
  hurlPath: string;
  /** Optional one-line summary of the Snapshot. */
  snapshotSummary?: string;
}

const main = { backgroundColor: "#0a0a0c", color: "#ece7dc", fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "520px" };
const heading = { color: "#e7cf94", fontSize: "20px", margin: "0 0 16px" };
const paragraph = { fontSize: "15px", lineHeight: "1.6", color: "#cfc9bd", margin: "0 0 16px" };
const buttonSection = { margin: "24px 0" };
const button = {
  backgroundColor: "#caa24a",
  color: "#0a0a0c",
  borderRadius: "10px",
  padding: "12px 22px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
};
const address = { fontSize: "12px", color: "#7a756b", wordBreak: "break-all" as const, margin: "16px 0 0" };

export function HurlInvitation({ returnUrl, hurlPath, snapshotSummary }: HurlInvitationProps) {
  return (
    <Html>
      <Head />
      <Preview>Come back when something changes. I&apos;ll ask you what.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your SoulSeed</Heading>
          {snapshotSummary ? <Text style={paragraph}>{snapshotSummary}</Text> : null}
          <Text style={paragraph}>Come back when something changes. I&apos;ll ask you what.</Text>
          <Section style={buttonSection}>
            <Button href={returnUrl} style={button}>
              Open my SoulSeed
            </Button>
          </Section>
          <Text style={address}>{hurlPath}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default HurlInvitation;
