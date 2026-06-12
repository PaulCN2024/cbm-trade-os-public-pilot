# Admin Security Checklist

Date: 2026-06-11
Project: CBM Trade OS

## Immediate Password Cleanup

- Reset the temporary Supabase Auth admin password for `paul.chen.china@gmail.com`.
- Clear browser URL history entries that may contain the earlier failed login query string.
- Search the repository for accidental password strings before every public deploy.
- Do not store passwords in docs, logs, README files, screenshots, commit messages or issue comments.
- Do not paste Supabase service role keys, secret keys or temporary passwords into browser code.

## Secret Boundary

- `NEXT_PUBLIC_SUPABASE_URL` may appear in browser code.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may appear in browser code.
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
- Never expose service role keys through `window.__CBM_ENV__`, public HTML, localStorage, console logs or client bundles.
- Admin APIs must require an authenticated Bearer token.

## Admin Session Hygiene

- Use the Logout action after admin testing.
- Logout must call Supabase signOut when possible.
- Logout must clear local auth/session storage used by CBM Trade OS.
- After logout, admin pages should redirect to `/admin/login`.

## Protected Pages

- `/admin/system-check` must require admin login in Supabase mode.
- `/admin/dev-test` must require admin login in Supabase mode.
- Data export and pilot cleanup tools must be admin-only.
- Dev-test actions remain development-only and should stay locked unless intentionally opened for local testing.

## Lead To Customer Rule

- Public website inquiry in Supabase mode creates `Lead + Inquiry + FollowUpTask`.
- Public website inquiry does not create `Customer` automatically.
- `Customer` should be created only after manual review/conversion by an admin user.
- Backend/internal inquiry creation routes may create a customer only when the action is explicitly admin-authenticated and manual.

## Pilot Cleanup Rules

- Pilot cleanup is for development and internal pilot data only.
- Cleanup must require admin authentication.
- Cleanup must require the phrase `DELETE PILOT TEST DATA`.
- Cleanup must not be exposed on public website pages.
- Cleanup must not send customer messages, official quotations, PI, prices, delivery time, payment terms, bank details, compensation promises or responsibility judgments.

## Safety Rules

CBM Trade OS must not:

- automatically send customer messages
- automatically send official quotations
- automatically send PI
- confirm price
- confirm delivery time
- confirm payment terms
- confirm bank account
- promise compensation
- judge responsibility automatically

All high-risk business actions require manual review.
