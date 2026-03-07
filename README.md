# THE KNIGHT OF ORDER

Production-grade medieval-themed membership platform for nonprofits, built with **React + Vite + Tailwind + Framer Motion** on the frontend and **Netlify Functions + Node.js + PostgreSQL** on the backend.

## 1) Production Architecture

### System topology
- **Frontend (Netlify static hosting):** React SPA rendered from `frontend/dist`.
- **Backend API (Netlify Functions):** stateless serverless handlers under `netlify/functions`.
- **Database:** PostgreSQL with normalized schema for users, rank progression, organizations, certificates, and audit trails.
- **Auth:** JWT in secure HTTP-only cookie (`knight_session`).
- **Scheduled jobs:** Netlify scheduled function for backend-controlled rank promotions.

### Security model
- Password hashing: `bcryptjs` cost factor 12.
- Password policy: min 12 chars, uppercase/lowercase/number/symbol.
- JWT signed with `JWT_SECRET`, issuer/audience claims validated.
- Session transport: `HttpOnly; Secure; SameSite=Lax` cookie.
- SQL injection protection through parameterized PostgreSQL queries.
- Rate limiting per IP (in-memory baseline; upgrade path to Redis/Upstash).
- Immutable logs: `activity_log`, `admin_actions`, and `rank_history`.

### Scalability
- Stateless functions scale horizontally on Netlify.
- DB indexing for rank history, certificate lookup, activity feeds.
- Clear separation of concerns via `_lib` utilities and focused handlers.
- Ready for external caching, queueing, and object storage as usage grows.

## 2) Folder Structure

```txt
.
├── frontend/                       # React + Vite + Tailwind app
│   ├── src/components/             # UI primitives (loading, rank card)
│   ├── src/pages/                  # Dashboard, Login pages
│   ├── src/lib/                    # API client
│   └── src/styles/                 # Global Tailwind styles
├── netlify/functions/              # Serverless API and scheduled jobs
│   ├── _lib/                       # Shared auth/db/http/rate-limit helpers
│   ├── signup.js
│   ├── login.js
│   ├── session.js
│   ├── scheduled-promotions.js
│   ├── certificate-generate.js
│   └── ...
├── db/schema.sql                   # PostgreSQL schema
├── netlify.toml                    # Build, redirects, schedules
└── README.md
```

## 3) Database Schema SQL
- Full schema lives in `db/schema.sql` and defines required tables:
  - `users`
  - `organizations`
  - `memberships`
  - `rank_history`
  - `title_choices`
  - `certificates`
  - `activity_log`
  - `admin_actions`

## 4) Netlify Serverless Functions

### Authentication lifecycle
- `signup.js` — account creation, password policy enforcement, verification token.
- `verify-email.js` — marks email as verified.
- `login.js` — credential validation + cookie session issuance.
- `session.js` — active user profile lookup.
- `logout.js` — cookie invalidation.
- `request-password-reset.js` / `reset-password.js` — password reset workflow.

### Core domain
- `scheduled-promotions.js` — cron-based backend rank progression.
- `admin-members.js` — admin member list.
- `admin-rank-update.js` — manual promotions/demotions with audit log.
- `certificate-generate.js` — server-side parchment-styled PDF generation.
- `certificate-verify.js` — serial verification endpoint (wire route to `/certificate/{serial}`).
- `whatsapp-link.js` — consent tracking + deep links for WhatsApp templates.

## 5) Rank Progression Engine
- Enforced backend progression.
- Time-based promotions via scheduled function (`0 2 * * *`).
- Branch locking logic around rank 11 for male path.
- Female path supports skip-to-rank-9 rule at rank 4.
- Every transition is written to `rank_history`.
- Rank-8 female milestone emits confetti activity flag for frontend trigger.

## 6) Certificate Pipeline
1. Authenticated member requests generation.
2. Server builds PDF (parchment, signature, wax seal, serial, date).
3. PDF blob stored in `certificates` table.
4. Admin approval process can update status.
5. Public verification API validates serial and metadata.

## 7) Admin Dashboard Architecture
- RBAC based on `users.role` (`member`, `admin`, `super_admin`).
- Administrative APIs isolated and role-guarded.
- High-risk actions write to `admin_actions`.
- Visibility: member rosters, rank updates, account revocations (extension point).

## 8) Frontend Architecture
- Theming via Tailwind tokens (royal blue, gold, crimson, parchment, steel).
- Medieval UX components with accessibility-first semantic markup.
- Animated loading screen using Framer Motion.
- Dashboard modules: Rank, Guild Hall, Missions, Messenger, Certificate, Orders.
- API client includes credentials and centralized error handling.

## 9) Deployment Steps (Netlify)
1. Push repository to GitHub.
2. In Netlify, create new site from repository.
3. Configure environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `WHATSAPP_NUMBER`
   - `NODE_ENV=production`
4. Confirm `netlify.toml` build command and function directory.
5. Run `db/schema.sql` against PostgreSQL instance.
6. Deploy and validate:
   - signup/login/session flow
   - scheduled promotions logs
   - certificate generation + verification endpoint

## 10) Production Decisions and Tradeoffs
- **JWT cookies vs local storage:** chose HTTP-only cookie for XSS risk reduction.
- **Serverless function architecture:** fast to scale, but cold starts and DB pooling need care.
- **In-memory rate limit:** simple baseline; use Redis for multi-instance strict enforcement.
- **PDF in DB (`BYTEA`)** simplifies transactional consistency; object storage can reduce DB bloat at larger scale.
- **Single repo for frontend/functions** keeps deployment straightforward while preserving modular boundaries.

## 11) Environment and Operations
- All secrets in environment variables only.
- Add Sentry + structured logs for observability in production.
- Add migration tool (`dbmate`/`prisma migrate`) before multi-team scaling.
- Add CI checks (lint/test/build/security audit) in GitHub Actions for release gates.

## 12) Future Hardening Roadmap
- Replace in-memory rate limiter with Redis-backed distributed limiter.
- Add MFA and device/session inventory.
- Add WAF rules + bot detection.
- Move certificate PDFs to signed object storage links.
- Add event-driven queue for broadcasts and high-volume admin workflows.
