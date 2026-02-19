# Meta Agency — TikTok Creator Management Platform

A full-stack web application built for a TikTok talent agency, replacing days of manual Excel work with an automated system that handles creator performance tracking, bonus calculation, and content publishing — all in one dashboard.

---

## The Pipeline

```
Agency CSV Export  →  Admin Upload Panel  →  Supabase (PostgreSQL)  →  Auto Bonus Engine  →  Admin Dashboard
                                                                     →  Public Website (Articles, Join, Services)
```

---

## Step 1 — The Problem: Manual Excel Processes

Before this system, the agency managed everything through Excel spreadsheets. Each month, the team would manually:

- Copy-paste creator performance data (diamonds, valid live days, live hours) from TikTok's backend export
- Run bonus calculations row by row using formulas
- Track payment statuses across separate sheets
- Publish articles and announcements via external tools

The process took several days per cycle and was prone to human error. This platform was built to compress that workflow into a few hours with accurate, automated logic.

---

## Step 2 — Data Ingestion via CSV Upload

The admin uploads a CSV file exported from TikTok's creator platform. The system processes each row through a smart `findOrCreateCreator()` function that:

- Matches creators by TikTok Creator ID (primary key)
- Falls back to username matching if no ID is present
- Detects and records username changes in a history table
- Assigns a `TEMP_` prefixed ID for creators without a TikTok ID, to avoid duplicate records

Performance data stored per creator per period: **diamonds earned**, **valid live days**, **total live hours**, **month**, **year**.

---

## Step 3 — Bonus Calculation Engine

The core value of the system. Once performance data is uploaded, the bonus calculator:

- Applies tiered bonus rules based on diamond thresholds and valid day counts
- Computes each creator's payout in IDR automatically
- Stores results in the `bonus_calculations` table with payment status tracking
- Displays a summary with totals, breakdowns, and per-creator details
- Supports CSV export of the full bonus sheet for the finance team

What used to take days of manual formula work now runs in minutes.

---

## Step 4 — Admin Dashboard

The protected admin panel (`/admin`) provides a unified view across four modules:

| Module | Purpose |
|--------|---------|
| **Dashboard** | Live stats — total creators, diamonds, bonuses paid, activity feed |
| **Talent Management** | Creator profiles, bulk CSV import, status and category filters |
| **Performance Upload** | Monthly data upload, upload history, validation and error reporting |
| **Bonus Calculator** | Auto-calculation, per-creator breakdown, payment status, export |
| **Article Management** | Rich text editor (TipTap), category management, publish/draft control |

Role-based access control enforces that only `admin` users can reach these routes.

---

## Step 5 — Public Website

The public-facing side of the platform serves as the agency's marketing hub:

- **Home** — Hero section, services overview, testimonials, contact
- **Articles** — Blog with search, filter by category, pagination, bookmarking
- **Join** — Talent registration form wired to the database
- **Bonus Info** — Transparent explanation of the bonus structure for creators
- **About, Services, FAQ, Careers, Privacy, Terms**

Light/dark mode toggle is available on all public pages. Admin routes enforce light mode only.

---

## Key Outcomes

- **Days → Hours** — Monthly performance processing time reduced significantly through automation
- **Zero formula errors** — Bonus calculation logic is centralised and version-controlled in code, not per-person Excel files
- **Creator history tracking** — Username changes are recorded automatically; no data is silently overwritten
- **Dual audience** — One codebase serves both the internal ops team (admin panel) and external talent/clients (public site)

---

## Screenshots

> _Add screenshots of the admin dashboard, bonus calculator, performance upload, and public homepage here._

---

## Project Structure

```
metaAgency/
├── public/
│   └── index.html
│
├── src/
│   ├── App.jsx               → App root, auth init, theme management
│   ├── routes.jsx            → All routes, ProtectedRoute guard, AdminLayout
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboardImproved.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── CreatorDataUpload.jsx
│   │   │   ├── TalentManagement/     → Table, upload section, activity feed
│   │   │   ├── PerformanceUpload/    → Upload tab, history tab, export tab
│   │   │   └── BonusCalculator/      → Calc logic, bonus table, summary stats
│   │   ├── common/                   → Button, Input, Navbar, Footer, Toast, etc.
│   │   ├── brand/                    → Meta Agency visual identity & animations
│   │   └── sections/                 → Hero, About, Services, Testimonials, Contact
│   │
│   ├── pages/
│   │   ├── public/                   → Home, About, Services, Articles, Join, FAQ…
│   │   ├── admin/                    → AdminDashboard, TalentManagement, PerformanceUpload…
│   │   ├── talent/                   → Talent portal dashboard
│   │   └── auth/                     → LoginPage
│   │
│   ├── store/
│   │   ├── authStore.js              → Auth state, session, role management (Zustand)
│   │   ├── themeStore.js             → Light/dark mode (Zustand + localStorage)
│   │   └── sidebarStore.js           → Sidebar open/close state
│   │
│   ├── hooks/                        → useAuth, useApi, useAnimation, useFormValidation…
│   ├── context/                      → NotificationContext
│   ├── lib/
│   │   └── supabase.js               → Supabase client + all DB helper functions
│   └── utils/
│       └── slugUtils.js              → URL slug generation for articles
│
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend framework | React 19, React Router v6 (lazy loading) |
| Styling | Tailwind CSS, custom Meta Agency design tokens |
| State management | Zustand (auth, theme, sidebar) |
| Animations | Framer Motion |
| Forms & validation | React Hook Form, Yup |
| Rich text editor | TipTap |
| Charts | Chart.js, Recharts |
| File handling | XLSX (CSV import/export) |
| Backend & database | Supabase (PostgreSQL, Auth, Realtime) |
| Deployment | Vercel |

---

## Running Locally

```bash
# 1. Clone and install
git clone https://github.com/haziqdafren/metaAgency.git
cd metaAgency
npm install

# 2. Set up environment variables
# Create a .env file in the project root:
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# 3. Start the dev server
npm start
# → http://localhost:3000
```

> **Note:** The Supabase instance used in the original deployment has been decommissioned. To run the full system, provision a new Supabase project and import the schema from `db_cluster-27-08-2025@06-29-23.backup`.

---

## Team

Kelompok — Teknik Informatika, Politeknik Caltex Riau

| Name | Student ID | Role |
|------|------------|------|
| Mohamad Haziq Dafren | 235530119 | Backend architecture, Supabase schema & queries, bonus calculation logic, data pipeline |
| Luthfiah Rahmi | 2355301098 | Frontend development, UI/UX implementation |
| Muhammad Arya | 2355301126 | Frontend development, documentation |
