export type Role = "owner" | "office" | "technician" | "client";

export type LeadSource = "website" | "phone" | "referral" | "bid_portal" | "walk_in" | "repeat";

export type LeadStatus =
  | "new"
  | "contacted"
  | "survey_scheduled"
  | "estimate_sent"
  | "won"
  | "lost";

export type JobType =
  | "structured_cabling"
  | "access_control"
  | "cameras"
  | "av"
  | "network_config"
  | "wifi"
  | "fiber"
  | "service";

export type EstimateStatus = "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";

export type ProjectStatus = "planned" | "in_progress" | "punch_list" | "complete" | "on_hold";

export type TaskStatus = "pending" | "in_progress" | "blocked" | "done";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";

export type InvoiceKind = "deposit" | "progress" | "final" | "single" | "recurring";

export type CableType = "cat6" | "cat6a" | "om3" | "om4" | "os2" | "coax" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Client {
  id: string;
  company?: string;
  name: string;
  email: string;
  phone: string;
  billingAddress?: string;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  clientId?: string;
  contactName: string;
  company?: string;
  email: string;
  phone: string;
  siteAddress: string;
  city: string;
  state: string;
  zip: string;
  source: LeadSource;
  status: LeadStatus;
  jobTypes: JobType[];
  notes: string;
  estimatedValue: number;
  surveyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceBookItem {
  id: string;
  sku: string;
  category: string;
  name: string;
  unit: string;
  unitCost: number;
  markupPct: number;
  laborHoursPerUnit: number;
  taxable: boolean;
  active: boolean;
}

export interface EstimateLineItem {
  id: string;
  priceBookId?: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  markupPct: number;
  laborHours: number;
  laborRate: number;
}

export interface Estimate {
  id: string;
  number: string;
  leadId?: string;
  clientId?: string;
  clientName: string;
  company?: string;
  email: string;
  phone: string;
  siteAddress: string;
  jobTypes: JobType[];
  status: EstimateStatus;
  lineItems: EstimateLineItem[];
  taxRate: number;
  depositPct: number;
  notes: string;
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  sort: number;
  assignedTo?: string;
  dueDate?: string;
}

export interface CableRun {
  id: string;
  projectId: string;
  runId: string;
  fromLoc: string;
  toLoc: string;
  cableType: CableType;
  lengthFt: number;
  terminated: boolean;
  labeled: boolean;
  testResult?: "pass" | "fail" | "pending";
  testNotes?: string;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  clientId?: string;
  estimateId?: string;
  leadId?: string;
  siteAddress: string;
  siteContact: string;
  sitePhone: string;
  status: ProjectStatus;
  jobTypes: JobType[];
  startDate?: string;
  targetDate?: string;
  assignedTechIds: string[];
  scope: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  projectId?: string;
  estimateId?: string;
  clientName: string;
  email: string;
  siteAddress: string;
  kind: InvoiceKind;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  notes: string;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
  paymentLink?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "card" | "ach" | "check" | "cash" | "other";
  receivedAt: string;
  reference?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  technicianId: string;
  hours: number;
  date: string;
  notes?: string;
}

export interface AppState {
  currentUserId: string;
  users: User[];
  clients: Client[];
  leads: Lead[];
  priceBook: PriceBookItem[];
  estimates: Estimate[];
  projects: Project[];
  tasks: Task[];
  cableRuns: CableRun[];
  invoices: Invoice[];
  payments: Payment[];
  timeEntries: TimeEntry[];
  laborRateDefault: number;
  taxRateDefault: number;
}
