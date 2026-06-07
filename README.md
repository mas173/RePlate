<div align="center">

# 🌿 RePlate

### AI-Powered Food Waste Reduction & Redistribution Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Voice-FF5722?style=flat-square&logo=microphone&logoColor=white)](https://www.sarvam.ai)
[![Leaflet Map](https://img.shields.io/badge/Leaflet-Map-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)

**RePlate** connects restaurants, hotels, grocery stores, and event organizers (Donors) with NGOs and shelters to redistribute surplus food before it expires. Powered by Google Gemini AI for freshness/urgency assessment, MapTiler & React-Leaflet for location intelligence, and Sarvam AI for a voice-activated multilingual interface.

[✨ Features](#-key-features) • [🛠️ Tech Stack](#️-tech-stack) • [📁 Structure](#-project-structure) • [🚀 Getting Started](#-getting-started) • [🔑 Environment](#-environment-variables) • [🗄️ Database Setup](#-database-setup) • [🔌 API Reference](#-api-reference) • [🍃 Impact Formulas](#-environmental-impact-formulas)

</div>

---

> [!NOTE]
> **Project Status:** All milestones including Core Authentication, Donor Flow, Google Gemini Freshness AI, NGO claiming, Resend notification integrations, **Sarvam AI multilingual voice interaction**, and **interactive maps/geolocations** are fully implemented and verified!

---

## 📸 Visual Walkthrough


#### 🖥️ Landing Page 
<img width="1785" height="908" alt="Screenshot 2026-06-07 141324" src="https://github.com/user-attachments/assets/ec120730-61e8-4e93-9914-00cf29e11d2b" />


#### 📊 Donor Dashboard 
<img width="1917" height="910" alt="Screenshot 2026-06-07 144608" src="https://github.com/user-attachments/assets/d447730d-5513-4277-959b-be1772801ac1" />


#### 📈 Analytics & Environmental Handprint
<img width="1918" height="921" alt="Screenshot 2026-06-07 144731" src="https://github.com/user-attachments/assets/5d842ecf-e111-4cf0-96af-664b072b64b8" />


#### 🗺️ Geographic Hotspot Heatmap & Admin Panel 
<img width="1914" height="904" alt="Screenshot 2026-06-07 141913" src="https://github.com/user-attachments/assets/30218eec-fecd-4d79-99ee-95213982044f" />


---

## ✨ Key Features

| Feature Group | Description | Technologies |
| :--- | :--- | :--- |
| **👥 Role-Based Workflows** | Three customized panels (Donor, NGO, Admin) secured via Clerk authentication and database role guards. | Clerk Auth, React Router |
| **🧠 AI Freshness Analysis** | Evaluates uploaded food images using Google Gemini to estimate a freshness score (0-100%), auto-detect category, and detail potential shelf-life. | Gemini API, Supabase Storage |
| **🗣️ Multilingual Voice Assistant** | Hands-free floating voice assistant powered by Sarvam AI. Transcribes regional audio (Saaras v3 STT), generates actions (Gemini), queries live database context, and replies in speech (Bulbul v3 TTS). Supports English and 10 Indian regional languages. | Sarvam AI, Google Gemini, Web Audio API |
| **🗺️ Map & Location Intelligence** | Live interactive maps using MapTiler tile layers. Features address-based geocoding with caching/throttling, exact geo-picking for donors, nearby browse list for NGOs, and supply-vs-demand heatmaps for admins. | React-Leaflet, MapTiler API |
| **📊 Real-time Analytics** | Rich data charts displaying donation trends, categories, and leaders. Translates weight rescued into gasoline miles offset, phone charges, shower minutes, and agricultural land conserved. | Recharts, Supabase RPC Functions |
| **🔔 Alerts & Automated Crons** | Background cron checks auto-expire stale listings. Resend broadcasts notification updates to local NGOs when fresh food is uploaded in their city. | Node-cron, Resend Mail API |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite 8** — Reactive SPA framework and fast development bundler.
- **Tailwind CSS 3.4** — Utility-first styling with system-aware Dark Mode.
- **React-Leaflet** & **MapTiler** — Interactive mapping, markers, and path tracking.
- **Recharts** — Visualization engine for donation trends, categories, and metrics.
- **Framer Motion** — Smooth card hover, drawer slide, and modal fade transitions.
- **Lucide React** & **React Hot Toast** — Modern typography icons and toast alerts.
- **React Dropzone** — Drag-and-drop file upload with multi-image support.

### Backend
- **Node.js** & **Express.js 4** — Lightweight, asynchronous REST API.
- **Clerk Express** — Server-side JWT token verification.
- **Multer** — Middleware for handling multipart/form-data audio/image buffers.
- **Express Rate Limit** & **Helmet** — Prevents DDoS and configures security headers.
- **Node-cron** — Runs periodic tasks (checking expiration dates).

### Services
- **Clerk** — Managed sign-in, user profiles, and public role metadata.
- **Supabase** — PostgreSQL relational database, custom SQL functions, and file storage.
- **Google Gemini AI** — Food analysis (`gemini-2.5-flash` model for speech intents).
- **Sarvam AI** — `saaras:v3` (Speech-to-Text) and `bulbul:v3` (Text-to-Speech).
- **Resend** — Transactional, templated HTML emailing.

---

## 📁 Project Structure

```
replate/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                  # Static assets (images, logos)
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── analytics/           # Personal & platform impact graphs
│   │   │   ├── assistant/           # Floating voice assistant, audio message visualization
│   │   │   ├── auth/                # ProtectedRoute, RoleGuard wrappers
│   │   │   ├── dashboard/           # Action panels & overview cards
│   │   │   ├── donations/           # Donation creation, details, list grids
│   │   │   ├── layout/              # Sidebar (role-based), Topbar, DashboardLayout
│   │   │   └── ui/                  # Atom widgets (button, modal, badge, inputs)
│   │   ├── hooks/                   # Custom React hooks (useAppAuth, useDarkMode)
│   │   ├── lib/                     # Client configs (supabaseClient)
│   │   ├── pages/                   # Main page components
│   │   │   ├── LandingPage.jsx      # Home layout with stats & CTAs
│   │   │   ├── SignInPage.jsx / SignUpPage.jsx
│   │   │   ├── OnboardingPage.jsx   # Selects role during first registration
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── NGODashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersPage.jsx   # Admin management of active accounts & roles
│   │   │   ├── AdminDonationsPage.jsx # Moderates all donations listed
│   │   │   ├── AdminAnalyticsPage.jsx # Deep chart dashboards for administrators
│   │   │   ├── AvailableFoodPage.jsx # NGO browsing view for available food
│   │   │   ├── MyClaimsPage.jsx     # NGO claim history and status timelines
│   │   │   ├── FoodUploadPage.jsx   # Step-by-step donation form (details, images, location picker)
│   │   │   ├── AnalyticsPage.jsx    # Environmental handprint & charts
│   │   │   ├── NotificationsPage.jsx# In-app notifications listing
│   │   │   └── ProfileSettingsPage.jsx
│   │   ├── services/                # Axios client configurations
│   │   └── utils/                   # Unit constants & conversion calculations
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # Services client initialization (supabaseAdmin, gemini, resend)
│   │   ├── controllers/             # Complex request handlers
│   │   │   └── webhook.controller.js# Clerk webhook synchronization listener
│   │   ├── middleware/              # Auth context injection, error bounds, upload limits
│   │   ├── routes/                  # Express Router routes
│   │   │   ├── admin.routes.js      # /api/admin — Moderator access
│   │   │   ├── ai.routes.js         # /api/ai — Freshness and categorization
│   │   │   ├── analytics.routes.js  # /api/analytics — Overview counters
│   │   │   ├── assistant.routes.js  # /api/assistant — Sarvam voice and Gemini parsing
│   │   │   ├── auth.routes.js       # /api/auth — Synchronization endpoint
│   │   │   ├── claim.routes.js      # /api/claims — NGO claiming and pickup updates
│   │   │   ├── donation.routes.js   # /api/donations — CRUD routes for posts
│   │   │   ├── notification.routes.js# /api/notifications
│   │   │   ├── user.routes.js       # /api/users — Profiling settings
│   │   │   └── webhook.routes.js    # Clerk svix listeners
│   │   ├── services/                # Business logic helper layers
│   │   │   ├── ai.service.js        # Gemini multi-modal prompts
│   │   │   ├── assistant.service.js # Voice processing & DB context extraction
│   │   │   ├── cron.service.js      # Expiry check automation
│   │   │   ├── email.service.js     # Resend HTML email generation
│   │   │   ├── geocoding.service.js # MapTiler geocoding with cash & intervals
│   │   │   └── storage.service.js   # Image uploading & removal
│   │   └── index.js                 # Express server bootstrapper
│   └── package.json
│
├── supabase/                        # Database scripts
│   └── migrations/
│       └── 001_initial_schema.sql   # Postgres schemas (tables, enums, RPCs, policies)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- Service accounts on: **Clerk**, **Supabase**, **Google AI Studio**, **Resend**, and **MapTiler**

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-org/replate.git
cd replate

# Install dependencies for root, client, and server simultaneously
npm run install:all
```

### 2. Configure Environment Variables
Copy and paste the template files into `.env` configurations:
```bash
# Root env (combines client and server settings for reference)
cp .env.example .env

# Client env configuration
cp client/.env.example client/.env

# Server env configuration
cp server/.env.example server/.env
```
Fill in all keys inside `client/.env` and `server/.env`. (See [Environment Variables](#-environment-variables) for details).

### 3. Initialize Supabase
1. Go to your [Supabase Console](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab of your project.
3. Paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
4. Navigate to **Storage** → Create a public bucket named `donation-images` (set limit to 5MB, allowing standard images).
5. In storage policies, allow public download, and allow authenticated users (`auth.role() = 'authenticated'`) to insert.

### 4. Run Locally
Execute the concurrent dev script from the root directory:
```bash
# Fires up Vite on http://localhost:5173 and Express on http://localhost:5000
npm run dev
```

---

## 🔑 Environment Variables

### Client Config (`client/.env`)
| Variable | Description | Source |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public authentication token | Clerk dashboard → API Keys |
| `VITE_SUPABASE_URL` | Endpoint URL of the Supabase API | Supabase dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Anonymous public API key | Supabase dashboard → Settings → API |
| `VITE_API_BASE_URL` | Port mapping for Express routes | Default: `http://localhost:5000/api` |
| `VITE_MAPTILER_API_KEY` | Public MapTiler maps key | [MapTiler Account API Keys](https://cloud.maptiler.com/) |

### Server Config (`server/.env`)
| Variable | Description | Source |
| :--- | :--- | :--- |
| `PORT` | Local runtime port | Default: `5000` |
| `NODE_ENV` | Mode of operation | `development` / `production` |
| `CLERK_SECRET_KEY` | Backend private authentication key | Clerk dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key counterpart | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Signing secret for sync listeners | Clerk dashboard → Webhooks (Svix) |
| `SUPABASE_URL` | Root project url | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY`| Database administrator service key | Supabase dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Anonymous key counterpart | Supabase dashboard → Settings → API |
| `GEMINI_API_KEY` | Key for core image freshness analysis | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_ASSISTANT_KEY` | (Optional) Separate key for voice intents | Google AI Studio |
| `SARVAM_API` | Private key for STT & TTS | [Sarvam AI Console](https://dashboard.sarvam.ai/) |
| `MAPTILER_API_KEY` | Server key for geocode address parsing | MapTiler Cloud Account |
| `RESEND_API_KEY` | Transactional emails routing key | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Sender address verified in DNS | Default: `notifications@yourdomain.com` |
| `CLIENT_URL` | Cross-Origin Resource URL mapping | Default: `http://localhost:5173` |

---

## 🗄️ Database Setup

### Migrated Tables
- `profiles`: Synced with Clerk profiles. Stores geolocation coordinates, active status, role (`donor`, `ngo`, `admin`), contact coordinates, and email settings.
- `donations`: Food listings referencing the posting donor. Stores quantities, expiry timestamps, urgency labels, images array, geocoded coordinates, and Gemini AI analysis JSON payload.
- `claims`: Links a claimed donation to the claimer NGO. Manages statuses: `pending`, `confirmed`, `picked_up`, `delivered`, `cancelled`.
- `notifications`: Keeps track of in-app alert flags.
- `impact_logs`: Stores weight metrics, meal counts, and carbon reduction estimates upon delivery completion.
- `audit_logs`: Administrator logging for system oversight.

### Custom PostgreSQL RPC Functions
The database schema exposes functions callable via the Supabase Client:
- `get_platform_stats()`: Returns platform-wide aggregate counts.
- `get_user_impact(p_user_id)`: Summarizes environmental savings for a specific user ID.
- `expire_old_donations()`: Auto-transitions overdue listings from `available` to `expired`.

### Setting Admin Privileges
To configure accounts as platform administrators, set the role inside the Clerk public metadata:
```json
{
  "role": "admin"
}
```

---

## 🔌 API Reference

### Authentication Header
Secure API calls by appending the Clerk session authorization JWT:
```http
Authorization: Bearer <clerk_session_token>
```

### Endpoints List

#### 🏥 System Health
- `GET /api/health` — Checks database and server connectivity.

#### 🔐 Auth Integration
- `POST /api/auth/sync` — Forces user synchronization with profiles table.
- `POST /api/webhook` — Clerk svix webhook listener (processes deletes, updates, signups).

#### 🍎 Donations Management
- `GET /api/donations` — Lists filtered available donations (role-restricted bounds).
- `POST /api/donations` — Creates a donation (Donor/Admin only, handles file upload).
- `GET /api/donations/:id` — Retreives details and claim history.
- `PATCH /api/donations/:id` — Edits details (only if status is `available`).
- `PATCH /api/donations/:id/status` — Updates status (Donor/Admin only).
- `DELETE /api/donations/:id` — Removes listing and associated images from bucket.

#### 🤝 Claims Handling
- `GET /api/claims` — Lists claims.
- `POST /api/claims` — NGO claims a donation (locks status to `claimed`).
- `PATCH /api/claims/:id/status` — Updates claim progress (`confirmed`, `picked_up`, `delivered`). Writes to `impact_logs` on delivery.
- `DELETE /api/claims/:id` — Cancels claim, releasing food status to `available` (NGO only).

#### 🗣️ Sarvam AI Assistant
- `POST /api/assistant/voice` — Handles multipart forms with audio buffers. Transcribes speech, extracts fields, retrieves context, and returns voice/text response.
- `POST /api/assistant/text` — Fallback text-based conversational router.

#### 🧠 Gemini AI Services
- `POST /api/ai/analyze-freshness` — Performs vision analysis of uploaded food images.
- `POST /api/ai/categorize` — Classifies text/image details into standard food categories.

#### 📈 Statistics
- `GET /api/analytics/overview` — Platform-wide metrics.
- `GET /api/analytics/user` — Personal user metrics.
- `GET /api/analytics/trends` — Monthly charting arrays.
- `GET /api/analytics/leaderboard` — Displays top donors and active NGOs.

#### 🔔 Notifications
- `GET /api/notifications` — Fetches user notifications.
- `PATCH /api/notifications/:id/read` — Marks an alert as read.
- `PATCH /api/notifications/read-all` — Marks all notifications as read.

#### ⚙️ Users & Profiles
- `GET /api/users/profile` — Retrieves user info.
- `PUT /api/users/profile` — Modifies user profile and geolocates coordinates.
- `GET /api/users/settings` — Returns user settings.
- `PUT /api/users/settings` — Updates notifications or UI preferences.

#### 🛡️ Administration Panel (Admin Role Required)
- `GET /api/admin/users` — Lists all registered accounts.
- `PATCH /api/admin/users/:id/role` — Modifies role permissions.
- `DELETE /api/admin/users/:id` — Deactivates account.
- `GET /api/admin/donations` — Lists all active/expired donations.
- `GET /api/admin/analytics` — Detailed administrative graphs.

---

## 🍃 Environmental Impact Formulas

RePlate uses values estimated by WRAP UK and similar agricultural audits to estimate ecological handprints:

| Metric | Base Conversion Rate | Real-world Equivalent Handprint Translation |
| :--- | :--- | :--- |
| **Meals Saved** | `1 meal = 0.5 kg` of food | Sum of total meals distributed to shelter networks. |
| **CO₂ Reduced** | `1 kg food = 2.5 kg CO₂` offset | **Gasoline Driving Offset**: `1 km driving = 0.244 kg CO₂`<br>🚗 *Formula: `CO2_reduced / 0.244` (km driven)* |
| **Water Conserved**| `1 kg food = 1,000 Liters` saved | **Domestic Shower Minutes Saved**: `1 min shower = 12 Liters`<br>🚿 *Formula: `water_saved / 12` (minutes of shower)* |
| **Farmland Saved** | `1 kg food = 3.5 sq. meters` preserved | **Agricultural Area Conserved**: Total agricultural zone protected.<br>🌾 *Formula: `weight_kg * 3.5` (m²)* |

*Example:* A donation of **33 kg** translates to **66 meals**, **82.5 kg of CO₂ offset** (equivalent to ~338 km of gasoline driving, or ~9,900 phone battery charges), **33,000 Liters of water saved** (equivalent to 2,750 minutes of continuous hot showers), and **115.5 m² of farmland protected**.

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

✨ **Collaborating for a sustainable, zero-waste future.** 💫

</div>
