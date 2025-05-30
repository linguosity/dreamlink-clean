# Dreamlink Application Reference

## Table of Contents

1.  [Project Overview](#project-overview)
    *   [Purpose](#purpose)
    *   [Core Technologies](#core-technologies)
    *   [Hosting](#hosting)
    *   [Development Environment Notes](#development-environment-notes)
2.  [Directory Structure](#directory-structure)
3.  [High-Level Application Flow](#high-level-application-flow)
    *   [Request Lifecycle & Middleware](#request-lifecycle--middleware)
    *   [Page Rendering](#page-rendering)
    *   [Core User Journeys](#core-user-journeys)
4.  [Authentication Mechanism](#authentication-mechanism)
    *   [Identity Provider](#identity-provider)
    *   [User Registration](#user-registration)
    *   [Login](#login)
    *   [Session Management](#session-management)
    *   [Password Reset](#password-reset)
    *   [Logout](#logout)
    *   [Protected Routes](#protected-routes)
    *   [Error Handling](#error-handling)
5.  [Data Models & Database Schema](#data-models--database-schema)
    *   [Primary Data Entities](#primary-data-entities)
6.  [Critical Components & Their Roles](#critical-components--their-roles)
    *   [Key UI Components](#key-ui-components)
    *   [Key Backend Logic Handlers](#key-backend-logic-handlers)
    *   [Interactions Summary](#interactions-summary)
7.  [API Integrations](#api-integrations)
    *   [OpenAI API](#openai-api)
    *   [Bible Data (Internal)](#bible-data-internal)
8.  [Development & Build Instructions](#development--build-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Initial Setup](#initial-setup)
    *   [Supabase Setup](#supabase-setup)
    *   [Running Locally](#running-locally)
    *   [Common Scripts](#common-scripts)
    *   [Building for Production (Vercel)](#building-for-production-vercel)
9.  [Troubleshooting Tips](#troubleshooting-tips)
10. [TODOs & Known Gaps](#todos--known-gaps)
11. [Design Decisions](#design-decisions)

---

## 1. Project Overview

### Purpose
Dreamlink is a dream journal application designed to help users record their dreams and gain insights through AI-powered analysis. A key feature is the integration of biblical references and symbolism into the dream interpretations. The application supports user profiles, personalized content based on preferences (e.g., reading level), and includes a subscription system for tiered access to features.

### Core Technologies
*   **Frontend:** Next.js (App Router, v15), React (v19), Tailwind CSS.
*   **UI Components:** Shadcn/UI, built upon Radix UI primitives. Icons by Lucide React. Animations via Framer Motion.
*   **Backend & Database:** Supabase (PostgreSQL for database, Supabase Auth for authentication, Supabase Edge Functions for serverless logic).
*   **AI Integration:** OpenAI/ChatGPT (specifically `gpt-4o-mini-2024-07-18` model) for dream analysis, accessed via Supabase Edge Functions.
*   **State Management:** Primarily React built-ins (useState, useContext) with Next.js managing server state. `next-themes` for theme switching, `sonner` for toast notifications.
*   **Schema Validation:** Zod for data validation.

### Hosting
The application is configured for hosting on **Vercel**. This is indicated by:
*   `vercel.json` configuration file.
*   `vercel-build` script in `package.json`.
*   `output: 'standalone'` in `next.config.js`.

### Development Environment Notes
*   **Package Manager:** `pnpm` is indicated by `pnpm-lock.yaml` and `vercel.json` (install command). The README also mentions `npm`.
*   **Language:** TypeScript.
*   **Testing:** Vitest with React Testing Library.
*   **AI-Assisted Development:** The project includes scripts (`start-claude.sh`, `fix-errors.sh`) suggesting the use of "Claude Code," an AI coding assistant, in the development workflow, particularly for error analysis and fixing.

---

## 2. Directory Structure

*   **/app**: Core Next.js App Router directory. Contains all application routes, pages, layouts, and API handlers.
    *   **/app/(auth-pages)***: Route group for authentication pages (sign-in, sign-up, forgot-password) and their layout.
    *   **/app/api**: API route handlers for backend logic (Supabase interactions, OpenAI integration).
        *   **/app/api/auth**: Authentication-specific API routes (e.g., `/signout`).
        *   **/app/api/bible-verses**: Routes for Bible verse data management.
        *   **/app/api/dream-entries**: CRUD and search operations for dream entries.
        *   **/app/api/openai-analysis**: Handles dream analysis requests to OpenAI.
    *   **/app/auth**: Server-side auth logic, including `/auth/callback` for OAuth/email verification.
    *   **/app/account**: User account management pages.
    *   **/app/protected**: Pages requiring user authentication.
    *   **/app/settings**: User settings pages.
    *   **/app/shared**: Pages for sharing content (e.g., specific dreams).
*   **/components**: Reusable UI components.
    *   **/components/ui**: Base UI elements, likely Shadcn/UI components.
    *   **/components/tutorial**: Components for a tutorial section.
*   **/context**: React Context providers for global state (e.g., `SearchContext`).
*   **/hooks**: Custom React hooks for reusable stateful logic.
*   **/lib**: General utility functions and helper modules.
*   **/public**: Static assets (images, fonts, `version.json`).
*   **/schema**: TypeScript type definitions and Zod schemas for data structures.
*   **/scripts**: Node.js utility scripts (e.g., `update-version.js`).
*   **/supabase**: Supabase project configuration and database migrations.
    *   **/supabase/migrations**: SQL files defining database schema changes.
*   **/tests**: Test files (Vitest, React Testing Library).
*   **/utils**: Utility functions, possibly more domain-specific.
    *   **/utils/supabase**: Helpers for Supabase client/server interaction and middleware.
*   **Root Directory Files**:
    *   `middleware.ts`: Next.js request middleware (auth, redirects).
    *   `next.config.js`: Next.js configuration.
    *   `package.json`, `pnpm-lock.yaml`: Project dependencies and scripts.
    *   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `tsconfig.json`: TypeScript configuration.
    *   `vercel.json`: Vercel deployment configuration.

---

## 3. High-Level Application Flow

### Request Lifecycle & Middleware
1.  **Initial Request:** User navigates to a URL.
2.  **Middleware (`middleware.ts` & `utils/supabase/middleware.ts`):**
    *   Bypasses static files, public API routes (`/api/public`), and auth-related pages (`/sign-in`, `/sign-up`, `/auth/callback`, etc.) from full auth redirection logic. These pages still get an `x-pathname` header set.
    *   For all other routes, `updateSession` is called:
        *   It attempts to refresh the Supabase session using cookies.
        *   If a route starts with `/protected` and no user session exists, it redirects to `/sign-in`.
        *   If `supabase.auth.getUser()` fails (e.g., expired token) for `/protected` or the root (`/`) paths, it clears session cookies (if applicable) and redirects to `/sign-in`.
        *   Successful requests proceed with the `x-pathname` header set.

### Page Rendering
1.  **Root Layout (`app/layout.tsx`):**
    *   Sets up global HTML structure, styles, fonts, background, and context providers.
    *   Performs an initial Supabase user check.
    *   Conditionally renders the main `<Navbar />` if a user is authenticated and not on an auth-specific page.
    *   Renders the page content (`children`).
    *   A simple footer is shown only on auth pages; a more detailed footer is part of `app/page.tsx`.
2.  **Page Content (`app/(...)/page.tsx`):**
    *   **Auth Pages:** Render forms for sign-in, sign-up, forgot password.
    *   **Main Page (`/`, `app/page.tsx`):** This page is for authenticated users. If middleware somehow lets an unauth user through, this page has its own check and redirects to `/sign-in`. It displays dream input UI and a gallery of the user's dreams.
    *   **Protected Pages (`/protected/*`):** Render content specific to authenticated features.

### Core User Journeys
*   **New User:** `/sign-in` -> `/sign-up` -> Email Verification -> `/auth/callback` -> `/` (main app).
*   **Returning User:** `/` (middleware validates session) -> If invalid, redirects to `/sign-in` -> Login -> `/`.
*   **Logout:** Navbar logout option -> `signOutAction` -> `/api/auth/signout` -> Clears session -> Redirects to `/sign-in`.

---

## 4. Authentication Mechanism

### Identity Provider
Supabase Auth (email/password).

### User Registration
1.  User submits email/password via `app/(auth-pages)/sign-up/page.tsx`.
2.  `signUpAction` (in `app/actions.ts`) is called.
3.  `supabase.auth.signUp()` is invoked, configured to send a verification email with a link to `/auth/callback?redirect_to=/`.
4.  User clicks email link, hitting `/auth/callback/route.ts`.
5.  The callback route exchanges the code for a session using `supabase.auth.exchangeCodeForSession()` and redirects to `/`.

### Login
1.  User submits email/password via `app/(auth-pages)/sign-in/page.tsx`.
2.  `signInAction` is called.
3.  `supabase.auth.signInWithPassword()` verifies credentials.
4.  On success, session cookies are set, and the user is redirected to `/`.

### Session Management
*   Managed by Supabase using secure HTTP-only cookies (`sb-access-token`, `sb-refresh-token`).
*   The `@supabase/ssr` library's `createServerClient` and `updateSession` middleware handle cookie parsing, setting, and session refresh.
*   JWTs expire in 1 hour (configurable in `supabase/config.toml`), with refresh token rotation enabled for longer sessions.

### Password Reset
1.  User requests reset via `app/(auth-pages)/forgot-password/page.tsx`, submitting their email.
2.  `forgotPasswordAction` calls `supabase.auth.resetPasswordForEmail()`, with `redirectTo` pointing to `/auth/callback?redirect_to=/protected/reset-password`.
3.  User clicks email link, goes through `/auth/callback`, then is redirected to `/protected/reset-password/page.tsx`.
4.  User submits new password. `resetPasswordAction` calls `supabase.auth.updateUser()` to set the new password.

### Logout
1.  Triggered by UI (e.g., `LogoutButton.tsx`).
2.  `signOutAction` calls `supabase.auth.signOut()`.
3.  Session cookies are cleared. User is redirected to `/sign-in`.

### Protected Routes
*   `middleware.ts` (via `utils/supabase/middleware.ts`) checks for paths starting with `/protected`. If no authenticated session, redirects to `/sign-in`.
*   The root path (`/`) is also effectively protected, redirecting to `/sign-in` if no session.

### Error Handling
*   Auth-related errors (e.g., invalid credentials, email already taken) are typically handled by redirecting to the relevant auth page with an `?error=` query parameter.
*   The `FormMessage.tsx` component displays these errors. Success messages use `?success=`.

---

## 5. Data Models & Database Schema

The database schema is defined via SQL migrations in `/supabase/migrations/`. Corresponding Zod schemas in `/schema/` are used for type safety and validation in the application code.

### Primary Data Entities
1.  **`users` (`auth.users` table, managed by Supabase):**
    *   Stores user authentication information. Implicitly linked to all other user-specific data.
2.  **`dream_entries`**: Core table for dream journal entries.
    *   **Key Fields:** `id` (PK, UUID), `user_id` (FK to `auth.users`), `original_text` (TEXT), `title` (TEXT), AI analysis fields (`dream_summary`, `personalized_summary`, `analysis_summary`, `topic_sentence`, `supporting_points` (TEXT[]), `conclusion_sentence`, `formatted_analysis`, `gematria_interpretation`, `color_symbolism`), `image_url` (TEXT), `tags` (TEXT[]), `bible_refs` (TEXT[]), `raw_analysis` (JSONB for raw AI response), `created_at`.
    *   **Note:** A database trigger `extract_missing_analysis_fields` can populate structured analysis fields from `raw_analysis` if they are initially empty.
3.  **`bible_citations`**: Stores individual Bible verses associated with dream entries.
    *   **Key Fields:** `id` (PK, UUID), `dream_entry_id` (FK to `dream_entries`), `bible_book` (TEXT), `chapter` (INT), `verse` (INT), `full_text` (TEXT), `citation_order` (INT), `source` (TEXT, tracks origin of verse text), `supporting_text` (TEXT, in DB but not Zod schema).
4.  **`profile`**: Stores user preferences and profile information.
    *   **Key Fields:** `id` (PK, UUID), `user_id` (UNIQUE FK to `auth.users`), `language` (TEXT), `bible_version` (TEXT), `reading_level` (TEXT, e.g., 'radiant_clarity', 'celestial_insight'), `created_at`.
5.  **`subscriptions`**: Manages user subscription status and plans.
    *   **Key Fields:** `id` (PK, UUID), `user_id` (FK to `auth.users`), `stripe_subscription_id` (TEXT), `status` (TEXT), `plan` (TEXT), `credits` (INT), `trial_end` (TIMESTAMP), `current_period_end` (TIMESTAMP), `created_at`, `updated_at`.
6.  **`chatgpt_interactions`**: Logs prompts and responses for OpenAI API calls.
    *   **Key Fields:** `id` (PK, UUID), `dream_entry_id` (FK to `dream_entries`), `prompt` (TEXT), `response` (TEXT), `model` (TEXT), `temperature` (NUMERIC), `created_at`.
7.  **`payments`**: Records individual payment transactions (defined in initial migration, no Zod schema found).
    *   **Key Fields:** `id` (PK, UUID), `user_id` (FK to `auth.users`), `stripe_payment_id` (TEXT), `amount` (NUMERIC), `currency` (TEXT), `status` (TEXT), `created_at`.

---

## 6. Critical Components & Their Roles

### Key UI Components
*   **Layout & Navigation:**
    *   `components/Navbar.tsx`: Main navigation for authenticated users (logo, search, user avatar/menu). Uses `SearchContext` for keyword-based client-side search UI.
    *   `components/ThemeSwitcher.tsx`: Toggles light/dark themes.
*   **Authentication UI (in `/app/(auth-pages)/` primarily):**
    *   `components/AuthButton.tsx`: Server component showing login/signup buttons or user dropdown based on auth state.
    *   `components/LogoutButton.tsx`: Client component for sign-out form submission.
    *   `components/SubmitButton.tsx`: Reusable button for forms with pending states.
    *   `components/FormMessage.tsx`: Displays form success/error messages from URL params.
*   **Dream Management & Display:**
    *   `components/CompactDreamInput.tsx` / `DreamInput.tsx`: Forms for submitting new dreams.
    *   `components/DreamCard.tsx`: Displays a summary of a dream entry; handles interactions like opening details, delete, share. Fetches Bible verse tooltips.
    *   `components/AnimatedDreamGrid.tsx`: Renders a grid of `DreamCard`s.
*   **Utility UI:**
    *   `components/UserAvatar.tsx`: Displays user initials/avatar, part of `Navbar.tsx`.
    *   `components/VersionChecker.tsx`: Checks and notifies about app updates.
    *   `components/ui/*`: Base UI elements from Shadcn/UI (Button, Card, Dialog, etc.).

### Key Backend Logic Handlers
*   **`app/actions.ts` (Server Actions):** Handles auth operations (sign-up, sign-in, forgot/reset password, sign-out) by interacting with Supabase Auth.
*   **`app/api/dream-entries/route.ts`:** API for dream entry CRUD. `POST` creates entries and triggers AI analysis. `GET` fetches. `DELETE` removes entries and related data.
*   **`app/api/openai-analysis/route.ts` (Edge Function):** Interfaces with OpenAI API (`gpt-4o-mini-2024-07-18`) for dream analysis. Constructs detailed prompts based on dream text and user's reading level. Parses (and attempts to repair) structured JSON responses.
*   **`app/api/bible-verses/lookup/route.ts`:** Fetches Bible verse texts from the local `bible_citations` DB table for a given dream, for display in `DreamCard.tsx` tooltips.
*   **`middleware.ts` (using `utils/supabase/middleware.ts`):** Manages Supabase session refresh and protects routes by redirecting unauthenticated users.

### Interactions Summary
*   **Authentication:** Client auth forms -> Server Actions -> Supabase Auth. Middleware protects routes.
*   **Dream Journaling:** Dream Input UI -> `app/api/dream-entries/route.ts` (POST) -> `app/api/openai-analysis/route.ts` -> OpenAI API -> Results stored in Supabase DB.
*   **Dream Display:** `app/page.tsx` (Server Component) fetches from Supabase -> `AnimatedDreamGrid` -> `DreamCard`s (Client Components). `DreamCard` may call `bible-verses/lookup` API.

---

## 7. API Integrations

### OpenAI API
*   **Purpose:** AI-powered dream analysis, including interpretation, summarization, theme identification, and finding relevant biblical references with full verse texts.
*   **Interaction:** Called via a server-side Edge Function (`app/api/openai-analysis/route.ts`).
*   **Endpoint:** `https://api.openai.com/v1/chat/completions`
*   **Model:** `gpt-4o-mini-2024-07-18`.
*   **Authentication:** Bearer token (`OPENAI_API_KEY` environment variable).
*   **Key Features:** Uses structured JSON output (`response_format`). Prompt is dynamically adjusted based on the user's selected reading level preference (from `profile.reading_level`). Includes robust error handling for API responses.

### Bible Data (Internal)
*   The application does **not** use an external third-party API for fetching Bible verses.
*   Bible verse texts are primarily stored in and retrieved from the `bible_citations` table in the Supabase database. These texts are populated into the database as part of the OpenAI analysis process, where OpenAI is prompted to return the full text of cited verses.
*   A small, hardcoded list of verses in `app/api/bible-verses/route.ts` acts as a limited fallback if a verse isn't found in the database.

---

## 8. Development & Build Instructions

### Prerequisites
*   Node.js (version implied by Next.js 15, e.g., v18.17+).
*   `pnpm` (recommended package manager, due to `pnpm-lock.yaml` and `vercel.json`). `npm` is also mentioned in README.
*   Git.
*   Supabase account and project.
*   OpenAI API key.

### Initial Setup
1.  **Clone:** `git clone <repository-url> && cd <repository-directory>`
2.  **Install Dependencies:** `pnpm install`
3.  **Environment Variables:**
    *   Copy `.env.example` to `.env.local` (if example exists) or create `.env.local`.
    *   Required variables:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key.
        *   `OPENAI_API_KEY`: Your OpenAI API key.
        *   (Potentially `SUPABASE_SERVICE_ROLE_KEY` for admin tasks/migrations if not using user context for all server operations).

### Supabase Setup
*   Ensure the database schema is applied using migrations from `/supabase/migrations`.
    *   Use Supabase CLI: `supabase login`, `supabase link --project-ref <id>`, then `supabase db push` or `supabase migration up`.
*   Configure Auth settings in Supabase dashboard as per `supabase/config.toml` (e.g., email confirmations).

### Running Locally
*   `pnpm dev`
*   App typically runs on `http://localhost:3000`.

### Common Scripts (`package.json`)
*   `pnpm dev`: Start dev server.
*   `pnpm build`: Create production build.
*   `pnpm start`: Start production server (after build).
*   `pnpm lint`: Run ESLint.
*   `pnpm typecheck`: Run TypeScript compiler for type checking.
*   `pnpm test`: Run Vitest tests.
*   `pnpm test:watch`: Run tests in watch mode.
*   `pnpm version:update`: Custom script to update app version.
*   `pnpm fix`: Custom script (`fix-errors.sh`) using "Claude Code" AI for error fixing.

### Building for Production (Vercel)
*   Vercel uses the `vercel-build` script: `node scripts/update-version.js && next build`.

---

## 9. Troubleshooting Tips

*   **Missing Env Vars:** Check `.env.local` for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY`. App may show warnings (`EnvVarWarning.tsx`) or fail features.
*   **DB Schema Issues:** Ensure all Supabase migrations from `/supabase/migrations` are applied correctly.
*   **Email Rate Limiting:** Supabase default SMTP is rate-limited (`SmtpMessage.tsx` notes this). For production/heavy testing, configure custom SMTP in Supabase.
*   **OpenAI API Errors:** Verify `OPENAI_API_KEY` and quota. Check server logs for `app/api/openai-analysis/route.ts` for details; it has robust error handling and fallbacks.
*   **Auth Redirect Loops/Failures:** Confirm `site_url` in Supabase and related URLs in `.env.local`. Check browser cookies. Auth errors are often passed as URL query params.
*   **TypeScript/ESLint Errors during Build:** `next.config.js` ignores these on Vercel. Fix locally using `pnpm lint`/`typecheck`.
*   **"User from sub claim" Error:** Handled in `app/layout.tsx` by redirecting to sign-out. If frequent, investigate Supabase user/session state.
*   **OpenAI JSON Parsing:** `app/api/openai-analysis/route.ts` has extensive repair logic. If analysis is odd, check server logs for parsing issues.

---

## 10. TODOs & Known Gaps

*   **Search Strategy:**
    *   The `Navbar.tsx` implements a client-side keyword search UI using `SearchContext` and `hooks/use-dream-search.ts` (client-side filtering).
    *   `app/api/dream-entries/search/route.ts` provides a server-side search API (gated by `NEXT_PUBLIC_FEATURE_SERVER_SEARCH` flag), currently using basic `ILIKE`.
    *   **TODO:** Clarify and potentially integrate Navbar search with the server-side API for scalability, or fully rely on client-side for smaller datasets if intended.
*   **Full-Text Search Enhancement:**
    *   **TODO:** Implement proper full-text search in `app/api/dream-entries/search/route.ts` using a `search_vector` as commented in the code. This requires DB schema changes (tsvector column, index, triggers).
*   **Code Cleanup (Duplicate/Old Files):**
    *   **TODO:** Review and remove apparent duplicate or older versions of files, such as:
        *   `app/providers 2.tsx` vs `app/providers.tsx`
        *   `hooks/use-dream-search 2.ts` vs `hooks/use-dream-search.ts` (and similar for other hooks/utils noted with `2` or `.new`).
        *   Consolidate navigation components (`Navbar.tsx` seems current; `AuthDropdown.tsx`, `header-auth.tsx` might be older).
*   **Schema/Database Discrepancies:**
    *   **TODO:** The `bible_citations` table has a `supporting_text` column (from migration) not present in its Zod schema (`schema/bibleCitations.ts`). Align these.
    *   **TODO:** The `payments` table (from initial migration) does not have a corresponding Zod schema in `schema/`. Create one if this table's data is accessed or manipulated in the app logic.
*   **Build Error Suppression:**
    *   **TODO:** Address all TypeScript and ESLint errors and set `ignoreBuildErrors: false` in `next.config.js` for stricter code quality enforcement.
*   **Bible Verse Data Scalability:**
    *   **TODO:** The current system relies on OpenAI providing verse texts during analysis and a very small hardcoded fallback list. Evaluate if this is sufficient. Consider populating the `bible_citations` table more comprehensively or integrating a dedicated, free Bible API for broader coverage if needed.
*   **Feature Flags Documentation:**
    *   **TODO:** Document all feature flags (e.g., `NEXT_PUBLIC_FEATURE_SERVER_SEARCH`) and their effects.
*   **Claude Code Scripts:**
    *   **TODO:** Document the intended use and current status of `start-claude.sh` and `fix-errors.sh` if they are considered part of the standard development workflow.

---

## 11. Design Decisions

*   **Framework:** Next.js App Router for modern React development with server components, SSR, and file-system routing.
*   **Backend-as-a-Service (BaaS):** Supabase for database (PostgreSQL), authentication, and Edge Functions, simplifying backend infrastructure.
*   **Server Actions:** Used for form submissions/mutations (esp. auth), reducing boilerplate API endpoint creation and improving security.
*   **UI Components:** Shadcn/UI with Tailwind CSS for a utility-first styling approach combined with accessible, unstyled primitives from Radix UI. Components are highly composable and customizable.
*   **State Management:** Primarily React built-ins (useState, useContext) for client-side state. Next.js and Supabase client libraries manage server state and caching.
*   **Edge Functions:** Selected for latency-sensitive or secret-handling operations like OpenAI API calls (`runtime = "edge"`).
*   **Database Migrations:** SQL-based migrations via Supabase CLI for version-controlled schema management.
*   **Feature Flagging:** Basic feature control via environment variables (e.g., for server-side search).
*   **Resilient API Calls:** Robust error handling for the OpenAI integration, including JSON parsing/repair and fallbacks, to ensure user experience isn't entirely broken by external API issues.
*   **Data Consistency Trigger:** PostgreSQL trigger on `dream_entries` table to populate structured fields from a `raw_analysis` JSONB column, enhancing data integrity and backfilling capabilities.
*   **AI-Assisted Development:** Integration of "Claude Code" AI assistant into the development workflow for error fixing and analysis, as suggested by README scripts.
*   **Personalized Content:** User preferences (like `reading_level` in `profile`) are used to tailor AI-generated content.
---
