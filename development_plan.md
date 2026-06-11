# RePlate - Development Roadmap

This document outlines the step-by-step implementation phases for RePlate.

---

## Phase 0 - External Service Setup

Must be completed before any feature development. All tasks in this phase are manual configuration steps.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 0.1 | Create Clerk project | Done | clerk.com -> Create application |
| 0.2 | Copy Clerk keys | Done | Clerk Dashboard -> API Keys -> copy pk_test and sk_test |
| 0.3 | Create Supabase project | Done | supabase.com -> New Project |
| 0.4 | Run the SQL migration | Done | Supabase -> SQL Editor -> paste and run 001_initial_schema.sql |
| 0.5 | Create storage bucket | Done | Supabase -> Storage -> New bucket (donation-images, public) |
| 0.6 | Copy Supabase keys | Done | Supabase -> Settings -> API -> copy URL, anon, and service role keys |
| 0.7 | Get Gemini API key | Done | aistudio.google.com/apikey |
| 0.8 | Create Resend account and verify domain | Done | resend.com -> Add domain or use test address |
| 0.9 | Fill in env files | Done | Copy env.example files to .env in client and server directories |

---

## Phase 1 - Foundation & Auth

Core authentication infrastructure, layout wrappers, and role guard setups.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 1.1 | Build landing page | Done | Hero, stats, how it works, testimonials, CTA |
| 1.2 | Build Navbar component | Done | Logo, nav links, auth buttons, dark mode toggle |
| 1.3 | Build Footer component | Done | Footer details and links |
| 1.4 | Configure Clerk sign-in / sign-up pages | Done | Branded login/signup pages with custom CSS overrides |
| 1.5 | Build ProtectedRoute component | Done | Prevents unauthenticated access, handles onboarding redirects |
| 1.6 | Build RoleGuard component | Done | Restricts access based on user role metadata |
| 1.7 | Build DashboardLayout component | Done | Sidebar and topbar wrapper layout |
| 1.8 | Build Sidebar component | Done | Role-based navigation links for Donor, NGO, and Admin |
| 1.9 | Set user role in Clerk after signup | Done | Implement onboarding screen to set role to donor or ngo |
| 1.10 | Wire up auth sync backend route | Done | POST /api/auth/sync to ensure Supabase profile exists |
| 1.11 | Configure Clerk webhook to auto-sync users | Done | Implement webhook listener with Svix signature verification |

---

## Phase 2 - Donor Flow

Complete donor experience including dashboard, uploading food, and viewing status.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 2.1 | Build Donor Dashboard page | Done | Stat cards, recent donations, quick actions |
| 2.2 | Build Food Upload Form - Step 1 | Done | Food details (name, category, quantity, expiry, storage) |
| 2.3 | Build Food Upload Form - Step 2 | Done | Image upload with drag & drop preview |
| 2.4 | Build Food Upload Form - Step 3 | Done | Pickup location & instructions |
| 2.5 | Build Food Upload Form - Step 4 | Done | Review & submit |
| 2.6 | Wire up image upload to Supabase Storage | Done | File storage for food items |
| 2.7 | Wire up donation creation to Supabase | Done | Insert entries into donations table |
| 2.8 | Build My Donations page | Done | List with status badges, filter, search |
| 2.9 | Build Donation Detail page | Done | Full info, status timeline, edit/delete |
| 2.10 | Build donation status update flow | Done | Update statuses like available, cancelled, etc. |

---

## Phase 3 - AI Integration

Gemini-powered food freshness analysis.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 3.1 | Implement freshness analysis service | Done | Gemini API request and response parsing |
| 3.2 | Wire AI analysis into the Food Upload Form | Done | Auto-run analysis when food image is uploaded |
| 3.3 | Build FreshnessIndicator component | Done | Score gauge, urgency badge, shelf life |
| 3.4 | Implement AI auto-categorization | Done | Automatically suggest category based on food details/image |
| 3.5 | Save AI analysis results to database | Done | Update donations.ai_analysis column in Supabase |
| 3.6 | Verify Gemini API key has quota enabled | Done | aistudio.google.com -> check billing/quota |

---

## Phase 4 - NGO Flow

Complete NGO experience including claiming food, dashboards, and maps.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 4.1 | Build NGO Dashboard | Done | Available donations map/list, active claims, impact stats |
| 4.2 | Build Available Food Browse page | Done | Filterable list of available donations |
| 4.3 | Build DonationCard component | Done | Image, freshness score, urgency, claim button |
| 4.4 | Build Claim flow | Done | Confirm modal -> create claim in Supabase |
| 4.5 | Build My Claims page | Done | Claimed donations with status timeline |
| 4.6 | Build pickup confirmation flow | Done | Mark as picked up, mark as delivered |
| 4.7 | Write impact logs on delivery | Done | Update impact logs table in Supabase |

---

## Phase 5 - Notifications & Email

Real-time alerts and transactional emails.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 5.1 | Implement new donation email notification | Done | Send email to local NGOs when new food is posted |
| 5.2 | Implement expiry warning email | Done | Send warning to donor when food is expiring soon |
| 5.3 | Implement claim confirmation email | Done | Send email to donor and NGO when donation is claimed |
| 5.4 | Set up server cron job | Done | Auto-expire donations & send warnings |
| 5.5 | Build Notifications page | Done | List of in-app notifications |
| 5.6 | Build Notification Bell in Navbar | Done | Unread notification count indicator |
| 5.7 | Verify sender domain in Resend | Done | Resend -> Domains -> Add DNS records |

---

## Phase 6 - Analytics & Impact

Charts, metrics, and environmental statistics.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 6.1 | Integrate stats function to backend | Done | Wire up get_platform_stats() function |
| 6.2 | Build Analytics page | Done | Impact metrics (meals saved, CO2, water, land) |
| 6.3 | Build donation trend line chart | Done | Monthly donation analytics via Recharts |
| 6.4 | Build food category pie chart | Done | Food category breakdown visualizer |
| 6.5 | Build donor/NGO leaderboard | Done | Show top active donors and NGOs |
| 6.6 | Build personal impact dashboard widgets | Done | Stats visible to individual users |

---

## Phase 7 - Admin Dashboard

Platform oversight and user management tools.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 7.1 | Build Admin Dashboard home | Done | Platform stats, recent activity, system health |
| 7.2 | Build User Management table | Done | List all users, filter by role, view profile details |
| 7.3 | Build role assignment controls | Done | UI to change user roles between donor, NGO, admin |
| 7.4 | Build All Donations admin view | Done | Admin list of all donations with moderation features |
| 7.5 | Build Admin Analytics view | Done | Deeper platform-wide chart metrics |
| 7.6 | Set account role as admin | Done | Clerk Dashboard -> User -> Public Metadata -> {"role": "admin"} |

---

## Phase 8 - Profile & Settings

User account settings.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 8.1 | Build Profile settings page | Done | Name, organization, contact, location, avatar |
| 8.2 | Wire profile updates to database | Done | Sync updates to Supabase profiles table |
| 8.3 | Build Settings page | Done | Notification preferences, dark/light mode toggle |

---

## Phase 9 - Sarvam AI Integration

Enhancing accessibility, multilingual communication, and voice-based interaction using Sarvam AI.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 9.1 | Integrate Sarvam AI SDK/API | Done | Configure API keys and backend service setup |
| 9.2 | Implement Speech-to-Text for donation upload | Done | Allow donors to speak food details instead of typing |
| 9.3 | Build Voice Input component | Done | Microphone UI with live transcription |
| 9.4 | Add multilingual translation support | Done | Translate dashboard content, alerts, and notifications |
| 9.5 | Implement Text-to-Speech alerts | Done | Read notifications and instructions aloud |
| 9.6 | Add regional language selector | Done | Allow users to switch preferred language |
| 9.7 | Build multilingual NGO notifications | Done | Send alerts in user-selected language |
| 9.8 | Integrate voice-based NGO assistance | Done | Voice guidance for claiming and navigating donations |
| 9.9 | Accessibility optimization with voice support | Done | Improve usability for low-literacy and visually impaired users |
| 9.10 | Test multilingual and voice workflows | Done | Validate speech accuracy and translation flows |

---

## Phase 10 - Maps & Location Intelligence

Integrating live maps and location-based coordination for smarter food redistribution.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 10.1 | Integrate React-Leaflet & MapTiler | Done | Configure free map system for the platform |
| 10.2 | Add donation location picker | Done | Allow donors to pin exact pickup location |
| 10.3 | Implement live donation map on NGO dashboard | Done | Show nearby donations with map markers |
| 10.4 | Add urgency-based marker colors | Done | Highlight urgent donations visually |
| 10.5 | Build nearby donation filtering | Done | Sort donations by nearest distance |
| 10.6 | Implement current location detection | Done | Auto-detect user location using browser GPS |
| 10.7 | Add route navigation support | Done | Open directions for pickup locations |
| 10.8 | Build live pickup tracking system | Done | Track donation pickup and delivery progress |
| 10.9 | Add admin heatmap analytics | Done | Visualize donation-heavy and high-demand areas |
| 10.10 | Optimize mobile map responsiveness | Done | Ensure smooth map usage on mobile devices |

---

## Phase 11 - Polish & Performance

Final testing and optimization pass.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 11.1 | Add loading skeletons | Pending | UI placeholders during loading states |
| 11.2 | Add empty states | Pending | Skeletons for empty lists, search, etc. |
| 11.3 | Implement error boundaries | Pending | Prevent layout crash on API/UI exceptions |
| 11.4 | Ensure mobile responsiveness | Pending | Validate CSS responsive breakpoints |
| 11.5 | Add page transition animations | Pending | Framer Motion animations |
| 11.6 | Accessibility optimizations | Pending | Focus states, keyboard navigation, and ARIA labels |
| 11.7 | Test all flows end-to-end | Pending | Manual testing in browser |

---

## Phase 12 - Deployment

Deploying frontend and backend to production hosting.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 12.1 | Choose a frontend host | Pending | Vercel is recommended |
| 12.2 | Choose a backend host | Pending | Railway or Render is recommended |
| 12.3 | Deploy frontend to host | Pending | Configure Vite build and set env variables |
| 12.4 | Deploy backend to host | Pending | Deploy Node/Express server and set env variables |
| 12.5 | Update CORS CLIENT_URL env variable | Pending | Point to production frontend URL |
| 12.6 | Update Clerk webhooks to production domain | Pending | Clerk Dashboard -> Webhooks -> Point to production URL |
| 12.7 | Update Supabase Row Level Security | Pending | Secure tables for production environment |

---

## Phase 13 - Caching & API Performance

Integrating Redis caching layer to optimize API response times.

| Task ID | Task Description | Status | Details / Location |
| :--- | :--- | :--- | :--- |
| 13.1 | Configure Redis client | In Progress | Add redis dependency, config, and env variables |
| 13.2 | Create Caching & Invalidation middleware | Pending | Safe caching decorator with db fallback |
| 13.3 | Implement caching in routes | Pending | Cache GET donations, analytics, and listings with low TTLs |
| 13.4 | Setup invalidation on mutations | Pending | Invalidate cache on post, patch, put, delete, and claims |