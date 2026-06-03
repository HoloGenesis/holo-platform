"use client";

import { createHoloClient } from "@holo/sdk";

// The single Core client for the app. Same-origin by default (Core routes live
// at /v1/* in this Next app for v1); set NEXT_PUBLIC_HOLO_CORE_URL once Core is
// extracted to its own service.
const baseUrl =
  process.env.NEXT_PUBLIC_HOLO_CORE_URL ?? process.env.NEXT_PUBLIC_HOLO_BASE_URL ?? "";

export const holo = createHoloClient({ baseUrl });
