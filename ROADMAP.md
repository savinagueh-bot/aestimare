# Aestimare roadmap

## Done — MVP (this folder)

- Client / lead intake (office board + public `/intake`)
- Estimate builder + price book + margin/tax/deposit
- Convert estimate → project with job-type task template
- Task checklist, hours, cable/drop tracker
- Invoice from estimate or project
- Demo payment link (card / ACH)
- Owner dashboard
- Role views (owner, office, technician)
- Supabase schema + RLS drafted

## Sprint 2 — persistence and money

- Wire store to Supabase (Auth, Postgres, Storage)
- Enforce RLS in the client with session
- Stripe Checkout + Payment Links + customer vault
- Resend: estimate sent, invoice sent, 7-day overdue
- PDF of estimate/invoice (print stylesheet first, then react-pdf)

## Sprint 3 — field + client portal

- Technician mobile PWA (add to home screen)
- Photo upload from camera roll → Storage
- Site survey form on tablet
- Client login portal (status, CO approval, pay, docs)
- Equipment serial assignment

## Sprint 4 — reporting

- Est. vs actual job cost
- Tech hours vs estimate
- Materials usage from price book
- Recurring maintenance invoices
