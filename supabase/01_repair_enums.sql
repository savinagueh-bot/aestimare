-- Run this ALONE. Do not combine with seed in the same query.
-- Postgres cannot use a newly added enum value in the same transaction.

alter type public.job_type add value if not exists 'structured_cabling';
alter type public.job_type add value if not exists 'access_control';
alter type public.job_type add value if not exists 'cameras';
alter type public.job_type add value if not exists 'av';
alter type public.job_type add value if not exists 'network_config';
alter type public.job_type add value if not exists 'wifi';
alter type public.job_type add value if not exists 'fiber';
alter type public.job_type add value if not exists 'service';

alter type public.lead_status add value if not exists 'new';
alter type public.lead_status add value if not exists 'contacted';
alter type public.lead_status add value if not exists 'survey_scheduled';
alter type public.lead_status add value if not exists 'estimate_sent';
alter type public.lead_status add value if not exists 'won';
alter type public.lead_status add value if not exists 'lost';

alter type public.project_status add value if not exists 'planned';
alter type public.project_status add value if not exists 'in_progress';
alter type public.project_status add value if not exists 'punch_list';
alter type public.project_status add value if not exists 'complete';
alter type public.project_status add value if not exists 'on_hold';
