<div align="center">

# 🌿 RePlate

### AI-Powered Food Waste Reduction Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

**RePlate** connects restaurants, hotels, grocery stores, hostels, and event organizers with NGOs and shelters to redistribute surplus food before it expires — powered by AI for intelligent food freshness analysis and urgency assessment.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Database Setup](#-database-setup) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Role-Based Auth** | Three roles — Donor, NGO, Admin — with Clerk authentication |
| 📸 **Food Donation Upload** | Image upload with drag & drop and multi-image support |
| 🤖 **AI Freshness Analysis** | Gemini AI analyzes food images for freshness score and urgency level |
| 📊 **Analytics Dashboard** | Interactive charts for donations, impact metrics, and trends |
| ⏰ **Expiry Alerts** | Automated notifications for expiring donations via email |
| 🤝 **NGO Claiming System** | NGOs can browse, claim, and track food donations |
| 📈 **Impact Tracking** | Meals saved, CO₂ reduced, water saved, land preserved |
| 🌙 **Dark Mode** | Full dark mode support with system preference detection |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 🛠 Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 8** — Build tool
- **Tailwind CSS 3.4** — Utility-first CSS
- **React Router 7** — Client-side routing
- **Recharts** — Data visualization
- **Framer Motion** — Animations
- **Lucide React** — Icon library
- **React Hot Toast** — Notifications
- **React Dropzone** — File upload

### Backend
- **Express.js 4** — API framework
- **Clerk Express** — Authentication middleware
- **Multer** — File upload handling
- **Express Rate Limit** — API rate limiting
- **Express Validator** — Input validation
- **Helmet** — Security headers
- **Morgan** — HTTP logging
- **Cron** — Scheduled tasks (expiry checks)

### Services
- **Clerk** — Authentication & user management
- **Supabase** — Database (PostgreSQL) & file storage
- **Google Gemini AI** — Food freshness analysis
- **Resend** — Transactional emails

---

## 📁 Project Structure

```
replate/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/                  # Static assets (images, fonts)
│   │   ├── components/
│   │   │   ├── analytics/           # Chart & data viz components
│   │   │   ├── auth/                # ProtectedRoute, RoleGuard
│   │   │   ├── dashboard/           # Dashboard widgets & cards
│   │   │   ├── donations/           # Donation cards, lists, forms
│   │   │   ├── layout/              # Navbar, Sidebar, Footer, DashboardLayout
│   │   │   └── ui/                  # Reusable UI (Button, Card, Modal, Badge)
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAppAuth.js        # Auth & role management hook
│   │   │   └── useDarkMode.js       # Dark mode toggle hook
│   │   ├── lib/                     # Third-party client configs
│   │   │   └── supabase.js          # Supabase client initialization
│   │   ├── pages/                   # Page components (one per route)
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── NGODashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FoodUploadPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ProfileSettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/                # API client functions
│   │   │   └── api.js               # Centralized API client
│   │   ├── store/                   # State management (if needed)
│   │   ├── styles/                  # Additional CSS files
│   │   ├── utils/
│   │   │   ├── constants.js         # App-wide constants & enums
│   │   │   └── helpers.js           # Utility functions
│   │   ├── App.jsx                  # Root component with routes
│   │   ├── main.jsx                 # Entry point with providers
│   │   └── index.css                # Global styles & Tailwind
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js          # Supabase admin & public clients
│   │   │   ├── gemini.js            # Gemini AI model config
│   │   │   └── resend.js            # Resend email client
│   │   ├── controllers/             # Route handler logic (to be created)
│   │   ├── middleware/
│   │   │   ├── auth.js              # Clerk JWT verification & role check
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   └── upload.js            # Multer image upload config
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # /api/auth — user sync, webhooks
│   │   │   ├── donation.routes.js   # /api/donations — CRUD
│   │   │   ├── claim.routes.js      # /api/claims — NGO claiming
│   │   │   ├── analytics.routes.js  # /api/analytics — stats & trends
│   │   │   ├── ai.routes.js         # /api/ai — freshness analysis
│   │   │   ├── notification.routes.js # /api/notifications
│   │   │   ├── user.routes.js       # /api/users — profile & settings
│   │   │   └── admin.routes.js      # /api/admin — admin operations
│   │   ├── services/
│   │   │   ├── ai.service.js        # Gemini API interactions
│   │   │   ├── email.service.js     # Resend email templates
│   │   │   └── storage.service.js   # Supabase Storage operations
│   │   ├── utils/
│   │   │   └── helpers.js           # Server utility functions
│   │   └── index.js                 # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── supabase/                        # Database schema & migrations
│   └── migrations/
│       └── 001_initial_schema.sql   # Full database schema
│
├── .env.example                     # Root env template (all variables)
├── .gitignore
├── package.json                     # Root scripts (concurrent dev)
└── README.md                        # This file
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Google AI Studio](https://aistudio.google.com), [Resend](https://resend.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/replate.git
cd replate
```

### 2. Install Dependencies

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Or install individually:
npm install            # Root (concurrently)
cd client && npm install
cd ../server && npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example env files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in the values in each `.env` file. See [Environment Variables](#environment-variables) below.

### 4. Set Up the Database

See the [Database Setup](#-database-setup) section below.

### 5. Run the Development Servers

```bash
# Run both client and server concurrently (from root)
npm run dev

# Or run individually:
npm run dev:client     # Frontend on http://localhost:5173
npm run dev:server     # Backend on http://localhost:5000
```

### 6. Verify Everything Works

- Frontend: http://localhost:5173
- Backend Health Check: http://localhost:5000/api/health

---

## 🔑 Environment Variables

### Client (`client/.env`)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend API key | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `VITE_API_BASE_URL` | Backend API URL | Default: `http://localhost:5000/api` |

### Server (`server/.env`)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `PORT` | Server port | Default: `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `CLERK_SECRET_KEY` | Clerk backend secret | Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Clerk Dashboard → Webhooks |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `RESEND_API_KEY` | Resend email API key | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Sender email address | Must be verified in Resend |
| `CLIENT_URL` | Frontend URL for CORS | Default: `http://localhost:5173` |

---

## 🗄 Database Setup

### Option A: Supabase SQL Editor (Recommended for quick start)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to execute

### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push the migration
supabase db push
```

### What the Migration Creates

#### Tables
| Table | Description |
|-------|-------------|
| `profiles` | User profiles synced from Clerk (donors, NGOs, admins) |
| `donations` | Food donation listings with images, AI analysis, and status |
| `claims` | NGO claims on donations with pickup tracking |
| `notifications` | In-app notifications for all users |
| `impact_logs` | Environmental impact records per completed donation |
| `audit_logs` | Admin audit trail for all platform actions |

#### Enums (Custom Types)
| Type | Values |
|------|--------|
| `user_role` | `donor`, `ngo`, `admin` |
| `donation_status` | `available`, `claimed`, `picked_up`, `delivered`, `expired`, `cancelled` |
| `urgency_level` | `critical`, `high`, `medium`, `low` |
| `food_category` | `cooked_meals`, `raw_produce`, `bakery`, `dairy`, `beverages`, `packaged`, `fruits`, `grains`, `meat`, `other` |
| `storage_condition` | `room_temp`, `refrigerated`, `frozen`, `heated` |
| `claim_status` | `pending`, `confirmed`, `picked_up`, `delivered`, `cancelled` |
| `notification_type` | `donation_alert`, `claim_update`, `expiry_warning`, `system`, `achievement` |

#### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- **Profiles**: Public read, self-update only
- **Donations**: Public read, donor-only create/update/delete
- **Claims**: Participant-based access
- **Notifications**: User-only access to their own notifications
- **Impact Logs**: Public read
- **Audit Logs**: Admin-only access

#### Database Functions
| Function | Description |
|----------|-------------|
| `get_platform_stats()` | Returns platform-wide impact statistics |
| `get_user_impact(user_id)` | Returns impact stats for a specific user |
| `expire_old_donations()` | Auto-expires donations past their expiry date |

### Supabase Storage Setup

1. Go to Supabase Dashboard → **Storage**
2. Create a new **public bucket** called `donation-images`
3. Set max upload size to **5MB**
4. Add storage policies:
   - **SELECT (download)**: Allow public access → Policy: `true`
   - **INSERT (upload)**: Allow authenticated users → Policy: `auth.role() = 'authenticated'`
   - **DELETE**: Allow owner/admin

### Setting Up Clerk User Roles

In your Clerk Dashboard:
1. Go to **Users** → Click a user → **Public Metadata**
2. Add the role field:
```json
{
  "role": "donor"
}
```
Valid roles: `donor`, `ngo`, `admin`

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <clerk_session_token>
```

### Endpoints

#### Health
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | API health check | ❌ |

#### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/sync` | Sync Clerk user with Supabase | ✅ |
| POST | `/auth/webhook` | Clerk webhook handler | ❌ (signed) |

#### Donations
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/donations` | List donations | ✅ | Any |
| GET | `/donations/:id` | Get donation details | ✅ | Any |
| POST | `/donations` | Create donation | ✅ | Donor |
| PUT | `/donations/:id` | Update donation | ✅ | Owner |
| PATCH | `/donations/:id/status` | Update status | ✅ | Owner/Admin |
| DELETE | `/donations/:id` | Delete donation | ✅ | Owner/Admin |

#### Claims
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/claims` | List claims | ✅ | Any |
| POST | `/claims` | Claim a donation | ✅ | NGO |
| PATCH | `/claims/:id/status` | Update claim status | ✅ | Participant |
| DELETE | `/claims/:id` | Cancel claim | ✅ | NGO |

#### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/analyze-freshness` | AI food freshness analysis | ✅ |
| POST | `/ai/categorize` | AI food categorization | ✅ |

#### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/overview` | Platform stats | ✅ |
| GET | `/analytics/user` | User-specific stats | ✅ |
| GET | `/analytics/trends` | Donation trends | ✅ |
| GET | `/analytics/leaderboard` | Top donors/NGOs | ✅ |

#### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | List notifications | ✅ |
| PATCH | `/notifications/:id/read` | Mark as read | ✅ |
| PATCH | `/notifications/read-all` | Mark all as read | ✅ |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/profile` | Get profile | ✅ |
| PUT | `/users/profile` | Update profile | ✅ |
| GET | `/users/settings` | Get settings | ✅ |
| PUT | `/users/settings` | Update settings | ✅ |

#### Admin
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/admin/users` | List all users | ✅ | Admin |
| PATCH | `/admin/users/:id/role` | Update user role | ✅ | Admin |
| GET | `/admin/donations` | All donations | ✅ | Admin |
| GET | `/admin/analytics` | Platform analytics | ✅ | Admin |
| DELETE | `/admin/users/:id` | Deactivate user | ✅ | Admin |

---

## 🤝 Contributing

### Branch Naming Convention

```
feature/short-description     # New features
fix/short-description         # Bug fixes
refactor/short-description    # Code refactoring
docs/short-description        # Documentation
ui/short-description          # UI/styling changes
```

### Commit Message Format

```
feat: add donation upload form with drag & drop
fix: resolve expiry alert not triggering
refactor: extract API client to service module
docs: update README with database setup guide
style: improve dashboard card hover animation
chore: update dependencies
```

### Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project structure

3. **Test locally**:
   ```bash
   npm run dev
   ```

4. **Commit with a descriptive message**:
   ```bash
   git add .
   git commit -m "feat: your descriptive message"
   ```

5. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use **functional components** with hooks
- Use **named exports** for components, **default exports** for pages
- Follow the component folder structure (ui, layout, dashboard, etc.)
- Use the `cn()` utility for conditional class merging
- Keep components focused and single-responsibility
- Add JSDoc comments for all exported functions
- Use the design tokens from `tailwind.config.js` — don't use arbitrary values

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Pages | PascalCase | `DonorDashboard.jsx` |
| Components | PascalCase | `DonationCard.jsx` |
| Hooks | camelCase with `use` prefix | `useAppAuth.js` |
| Utils | camelCase | `helpers.js` |
| Services | camelCase | `api.js` |
| Routes (server) | kebab-case with `.routes.js` | `donation.routes.js` |
| Middleware (server) | camelCase | `auth.js` |

---

## 📊 Environment Impact Formulas

The platform calculates environmental impact using industry-standard estimates:

| Metric | Formula | Source |
|--------|---------|--------|
| Meals Saved | `weight_kg / 0.5` | ~0.5 kg per meal average |
| CO₂ Reduced | `weight_kg × 2.5` kg | WRAP UK food waste studies |
| Water Saved | `weight_kg × 1000` liters | Water footprint averages |
| Land Saved | `weight_kg × 3.5` sq meters | Agricultural land use data |

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with 💚 for a sustainable future**

</div>
