// @holo/sdk — the typed client every product imports instead of raw fetch.
// The ONLY way a product talks to HOLO Core. No product calls routes or the DB
// directly. Pure typed transport + response validation against @holo/contracts.

export { createHoloClient, HoloSdkError } from "./client";
export type { HoloClient, HoloClientOptions, HoloFetch, HoloFetchResponse } from "./client";
