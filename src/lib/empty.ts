import type { AppState } from "./types";

export const EMPTY_STATE: AppState = {
  currentUserId: "",
  users: [],
  clients: [],
  leads: [],
  priceBook: [],
  estimates: [],
  projects: [],
  tasks: [],
  cableRuns: [],
  invoices: [],
  payments: [],
  timeEntries: [],
  laborRateDefault: 95,
  taxRateDefault: 7,
};
