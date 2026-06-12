# CBM Trade OS Public Demo Deployment

## Purpose

This public demo is for reviewing the CBM Trade OS mock business workflow:

Website Inquiry -> Lead -> Customer -> Inquiry -> Project -> Quotation Draft -> Order -> Shipment -> After-sales -> Repeat Business

## Safety Rules

- Use demo/mock data only.
- Do not upload real customer data.
- Do not expose real quotations, PI, bank details, payment terms, drawings, emails or WhatsApp content.
- The system uses browser `localStorage`; data is not shared across devices.
- All quotations, PI, payment terms, delivery time, compensation, replacement and document actions require manual review.

## Development Test Page

The dev test page is intentionally locked by default:

`/admin/dev-test/`

It only runs actions with:

`/admin/dev-test/?dev=1`

Before production, remove this folder or protect it behind authentication.

## Static Deployment Options

This project is currently a static HTML/CSS/JS demo. It can be deployed to:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Recommended public entry:

`/trade-os-prototype/index.html`

Recommended review links:

- Trade OS demo: `/trade-os-prototype/index.html`
- Independent website demo: `/trade-website/index.html`

## ChatGPT Review Prompt

After deployment, send ChatGPT the public demo URL and ask:

Please review this public demo of CBM Trade OS. Focus on business workflow clarity, CRM object relationships, inquiry-to-order flow, after-sales/repeat-business flow, mobile usability, and safety boundaries. Do not assume this is production-ready; it is a localStorage mock demo.

## Mobile Roadmap

Phase 1:

- Responsive web app
- Horizontal mobile navigation
- Touch-friendly action buttons
- Table scrolling and compact panels

Phase 2:

- PWA manifest
- Add-to-home-screen support
- Optional offline shell

Phase 3:

- Real backend with Supabase/PostgreSQL
- Auth and permissions
- Multi-device synced data
- Native app wrapper or React Native/Expo app
