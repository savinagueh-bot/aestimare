export const JOB_TYPE_LABEL: Record<string, string> = {
  structured_cabling: "Structured Cabling",
  access_control: "Access Control",
  cameras: "Cameras / CCTV",
  av: "AV",
  network_config: "Network Config",
  wifi: "Wi-Fi",
  fiber: "Fiber",
  service: "Service / Repair",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  survey_scheduled: "Survey Scheduled",
  estimate_sent: "Estimate Sent",
  won: "Won",
  lost: "Lost",
};

export const ESTIMATE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  punch_list: "Punch List",
  complete: "Complete",
  on_hold: "On Hold",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
