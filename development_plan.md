# RePlate — Full Development Roadmap

## Legend

- 🤖 **I do this** — You just say "build it"
- 🧑 **You do this manually** — Requires your accounts, keys, or decisions

---

## Phase 0 — External Service Setup

> Must be done FIRST before any feature works. All manual.

| #   | Task                                  | You Do | Where                                                                                             |
| --- | ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| 0.1 | Create Clerk project                  | 🧑 (Completed) | [clerk.com](https://clerk.com) → Create application                                               |
| 0.2 | Copy Clerk keys                       | 🧑 (Completed) | Clerk Dashboard → API Keys → copy `pk_test_...` & `sk_test_...`                                   |
| 0.3 | Create Supabase project               | 🧑 (Completed) | [supabase.com](https://supabase.com) → New Project                                                |
| 0.4 | Run the SQL migration                 | 🧑 (Completed) | Supabase → SQL Editor → paste & run `001_initial_schema.sql`                                      |
| 0.5 | Create storage bucket                 | 🧑 (Completed) | Supabase → Storage → New bucket → name: `donation-images` → set public                            |
| 0.6 | Copy Supabase keys                    | 🧑 (Completed) | Supabase → Settings → API → copy URL, anon key, service role key                                  |
| 0.7 | Get Gemini API key                    | 🧑 (Completed) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey)                                  |
| 0.8 | Create Resend account & verify domain | 🧑 (Completed) | [resend.com](https://resend.com) → Add domain or use test address                                 |
| 0.9 | Fill in `.env` files                  | 🧑 (Completed) | Copy `client/.env.example` → `client/.env`, `server/.env.example` → `server/.env`, paste all keys |

> **Estimated time for Phase 0:** ~30–45 minutes

---

## Phase 1 — Foundation & Auth

> Everything visible before logging in.

| #    | Task                                                                            | Who            |
| ---- | ------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| 1.1  | Build full Landing Page (hero, stats, how it works, testimonials, CTA)          | 🤖 (Completed) |
| 1.2  | Build Navbar component (logo, nav links, auth buttons, dark mode toggle)        | 🤖 (Completed) |
| 1.3  | Build Footer component                                                          | 🤖 (Completed) |
| 1.4  | Configure Clerk sign-in / sign-up pages with custom styling                     | 🤖 (Completed) |
| 1.5  | Build `ProtectedRoute` component (redirects unauthenticated users)              | 🤖 (Completed) |
| 1.6  | Build `RoleGuard` component (blocks wrong-role access)                          | 🤖 (Completed) |
| 1.7  | Build `DashboardLayout` (sidebar + topbar wrapper)                              | 🤖 (Completed) |
| 1.8  | Build Sidebar component (role-based nav links)                                  | 🤖 (Completed) |
| 1.9  | Set user role in Clerk after signup (Onboarding selection implemented)          | 🤖 (Completed) | In Clerk Dashboard → Users → select user → Public Metadata → add `{"role": "donor"}` or `"ngo"`                 |
| 1.10 | Wire up `/auth/sync` backend route to create profile in Supabase on first login | 🤖 (Completed) |                                                                                                                 |
| 1.11 | Configure Clerk webhook to auto-sync users (Setup guide created)                | 🤖 (Completed) | Clerk Dashboard → Webhooks → Add endpoint → point to your deployed backend URL (or use ngrok for local testing) |

---

## Phase 2 — Donor Flow

> Complete donor experience end-to-end.

| #    | Task                                                                                      | Who |
| ---- | ----------------------------------------------------------------------------------------- | --- |
| 2.1  | Build Donor Dashboard page (stat cards, recent donations, quick actions)                  | 🤖  |
| 2.2  | Build Food Upload Form — Step 1: Food details (name, category, quantity, expiry, storage) | 🤖  |
| 2.3  | Build Food Upload Form — Step 2: Image upload with drag & drop preview                    | 🤖  |
| 2.4  | Build Food Upload Form — Step 3: Pickup location & instructions                           | 🤖  |
| 2.5  | Build Food Upload Form — Step 4: Review & submit                                          | 🤖  |
| 2.6  | Wire up image upload to Supabase Storage on the backend                                   | 🤖  |
| 2.7  | Wire up donation creation to Supabase `donations` table                                   | 🤖  |
| 2.8  | Build My Donations page (list with status badges, filter, search)                         | 🤖  |
| 2.9  | Build Donation Detail page (full info, status timeline, edit/delete)                      | 🤖  |
| 2.10 | Build donation status update flow (available → cancelled)                                 | 🤖  |

---

## Phase 3 — AI Integration

> Gemini-powered food analysis.

| #   | Task                                                                                   | Who |
| --- | -------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------ |
| 3.1 | Implement `analyzeFreshness` in `ai.service.js` (send image to Gemini, parse response) | 🤖  |
| 3.2 | Wire AI analysis into the Food Upload Form (auto-runs on image upload)                 | 🤖  |
| 3.3 | Build `FreshnessIndicator` component (score gauge, urgency badge, shelf life)          | 🤖  |
| 3.4 | Implement `categorizeFood` AI auto-categorization                                      | 🤖  |
| 3.5 | Save AI analysis results to `donations.ai_analysis` in Supabase                        | 🤖  |
| 3.6 | Verify your Gemini API key has quota enabled                                           | 🧑  | [aistudio.google.com](https://aistudio.google.com) → check billing/quota |

---

## Phase 4 — NGO Flow

> Complete NGO experience end-to-end.

| #   | Task                                                                           | Who |
| --- | ------------------------------------------------------------------------------ | --- |
| 4.1 | Build NGO Dashboard (available donations map/list, active claims, impact)      | 🤖  |
| 4.2 | Build Available Food Browse page (filterable list of available donations)      | 🤖  |
| 4.3 | Build `DonationCard` component (image, freshness score, urgency, claim button) | 🤖  |
| 4.4 | Build Claim flow (confirm modal → create claim in Supabase)                    | 🤖  |
| 4.5 | Build My Claims page (claimed donations with status timeline)                  | 🤖  |
| 4.6 | Build pickup confirmation flow (mark as picked up, mark as delivered)          | 🤖  |
| 4.7 | Write `impact_logs` entry when delivery is confirmed                           | 🤖  |

---

## Phase 5 — Notifications & Email

> Real-time alerts and transactional emails.

| #   | Task                                                                             | Who |
| --- | -------------------------------------------------------------------------------- | --- | ---------------------------------------------------- |
| 5.1 | Implement `sendDonationAlert` email (Resend) — sent to NGOs when new food posted | 🤖  |
| 5.2 | Implement `sendExpiryWarning` email — sent to donors when donation is expiring   | 🤖  |
| 5.3 | Implement `sendClaimConfirmation` email — sent to both donor & NGO on claim      | 🤖  |
| 5.4 | Set up cron job on backend to auto-expire donations & send warnings              | 🤖  |
| 5.5 | Build Notifications page (in-app notification list)                              | 🤖  |
| 5.6 | Build Notification Bell in Navbar (unread count badge)                           | 🤖  |
| 5.7 | Verify sender domain in Resend                                                   | 🧑  | Resend → Domains → Add your domain → add DNS records |

---

## Phase 6 — Analytics & Impact

> Charts, metrics, and environmental stats.

| #   | Task                                                                        | Who |
| --- | --------------------------------------------------------------------------- | --- |
| 6.1 | Wire up `get_platform_stats()` Supabase function to backend analytics route | 🤖  |
| 6.2 | Build Analytics page — impact overview (meals saved, CO₂, water, land)      | 🤖  |
| 6.3 | Build donation trend line chart (Recharts)                                  | 🤖  |
| 6.4 | Build food category pie chart                                               | 🤖  |
| 6.5 | Build donor/NGO leaderboard                                                 | 🤖  |
| 6.6 | Build personal impact stats on donor & NGO dashboards                       | 🤖  |

---

## Phase 7 — Admin Dashboard

> Platform oversight and management tools.

| #   | Task                                                                       | Who |
| --- | -------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------ |
| 7.1 | Build Admin Dashboard (platform stats, recent activity, system health)     | 🤖  |
| 7.2 | Build User Management table (list all users, filter by role, view details) | 🤖  |
| 7.3 | Build role assignment UI (change donor → NGO → admin)                      | 🤖  |
| 7.4 | Build All Donations admin view (full list with moderation controls)        | 🤖  |
| 7.5 | Build Admin Analytics (platform-wide charts)                               | 🤖  |
| 7.6 | Set your own account as admin                                              | 🧑  | Clerk Dashboard → Users → your account → Public Metadata → `{"role": "admin"}` |

---

## Phase 8 — Profile & Settings

> User account management.

| #   | Task                                                                       | Who |
| --- | -------------------------------------------------------------------------- | --- |
| 8.1 | Build Profile page (name, org, contact, location, avatar)                  | 🤖  |
| 8.2 | Wire profile updates to Supabase `profiles` table                          | 🤖  |
| 8.3 | Build Settings page (notification prefs, dark/light mode, account actions) | 🤖  |

---

## Phase 9 — Polish & Performance

> Final quality pass before launch.

| #   | Task                                                        | Who |
| --- | ----------------------------------------------------------- | --- | ------------------------- |
| 9.1 | Add loading skeletons for all data-fetching states          | 🤖  |
| 9.2 | Add empty states (no donations, no claims, etc.)            | 🤖  |
| 9.3 | Add error boundaries and fallback UI                        | 🤖  |
| 9.4 | Make all pages fully mobile responsive                      | 🤖  |
| 9.5 | Add page transition animations (Framer Motion)              | 🤖  |
| 9.6 | Accessibility pass (ARIA labels, keyboard nav, focus rings) | 🤖  |
| 9.7 | Test all user flows end-to-end                              | 🧑  | Manual testing in browser |

---

## Phase 10 — Deployment

> Making it live on the internet.

| #    | Task                                                                   | Who                  |
| ---- | ---------------------------------------------------------------------- | -------------------- | -------------------------- |
| 10.1 | Choose a frontend host (Vercel recommended)                            | 🧑                   |
| 10.2 | Choose a backend host (Railway or Render recommended)                  | 🧑                   |
| 10.3 | Deploy frontend to Vercel, set environment variables                   | 🧑 + 🤖 (I'll guide) |
| 10.4 | Deploy backend to Railway/Render, set environment variables            | 🧑 + 🤖 (I'll guide) |
| 10.5 | Update CORS `CLIENT_URL` in backend env to production URL              | 🧑                   |
| 10.6 | Update Clerk webhook URL to production backend URL                     | 🧑                   | Clerk Dashboard → Webhooks |
| 10.7 | Update Supabase RLS policies if using JWT-based auth (production mode) | 🤖                   |

---

## Summary

| Phase                 | Who Does Most Work | Estimated Effort  |
| --------------------- | ------------------ | ----------------- |
| 0 — Service Setup     | 🧑 You             | 45 min (one-time) |
| 1 — Foundation & Auth | 🤖 Me              | 1 session         |
| 2 — Donor Flow        | 🤖 Me              | 1–2 sessions      |
| 3 — AI Integration    | 🤖 Me              | 1 session         |
| 4 — NGO Flow          | 🤖 Me              | 1–2 sessions      |
| 5 — Notifications     | 🤖 Me              | 1 session         |
| 6 — Analytics         | 🤖 Me              | 1 session         |
| 7 — Admin             | 🤖 Me              | 1 session         |
| 8 — Profile/Settings  | 🤖 Me              | 1 session         |
| 9 — Polish            | 🤖 Me              | 1 session         |
| 10 — Deployment       | 🧑 You + 🤖 Me     | 1 session         |

> **Your total manual work:** Phase 0 setup (~45 min) + setting roles in Clerk + final deployment. Everything else I build.

---

## Recommended Order to Start

Tell me one of these to begin:

> **"Start Phase 0"** → I'll walk you through each service setup step-by-step  
> **"Start Phase 1"** → I'll build the landing page, navbar, sidebar, auth layout (assumes you'll fill `.env` soon)  
> **"Do Phase 0 and 1 together"** → Best option — set up services while I build the UI simultaneously
