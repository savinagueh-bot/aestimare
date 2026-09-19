-- Wipe operational demo rows. Keep company settings and task templates.
-- Run in Supabase → SQL Editor.

truncate table
  public.payments,
  public.invoice_line_items,
  public.invoices,
  public.time_entries,
  public.cable_runs,
  public.tasks,
  public.project_technicians,
  public.photos,
  public.documents,
  public.change_orders,
  public.equipment_inventory,
  public.site_surveys,
  public.estimate_line_items,
  public.estimates,
  public.projects,
  public.leads,
  public.client_users,
  public.clients,
  public.price_book_items
restart identity cascade;

alter sequence public.estimate_number_seq restart with 1001;
alter sequence public.project_number_seq restart with 1;
alter sequence public.invoice_number_seq restart with 1001;
