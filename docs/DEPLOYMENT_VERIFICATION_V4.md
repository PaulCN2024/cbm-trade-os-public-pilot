# CBM Trade OS Deployment Verification V4

Verification time: 2026-06-10 17:43 CST

## Deployment

- Vercel production deployment URL: https://project-7vo99-mqqwro23z-paul-s-projects2026.vercel.app
- Public alias URL: https://project-7vo99.vercel.app
- Alias target deployment id: `dpl_Cjmf7wY7GiaKFrVFJGggG7aijMmn`
- Deployment status: Ready

## Public Routes Checked

- https://project-7vo99.vercel.app/trade-website
- https://project-7vo99.vercel.app/trade-os-prototype
- https://project-7vo99.vercel.app/trade-website?cb=v4
- https://project-7vo99.vercel.app/trade-os-prototype?cb=v4

## Changed Files

- `/Users/paul/Documents/Codex/2026-05-18/new-chat/api/trade-website.js`
- `/Users/paul/Documents/Codex/2026-05-18/new-chat/api/trade-os-prototype.js`
- `/Users/paul/Documents/Codex/2026-05-18/new-chat/trade-website/index.html`
- `/Users/paul/Documents/Codex/2026-05-18/new-chat/trade-os-prototype/index.html`
- Synced copies under `/Users/paul/Documents/Codex/2026-05-18/new-chat/deploy/cbm-trade-os-public-demo/`

## No-Cache Headers Added

Both server routes now set:

```text
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
CDN-Cache-Control: no-store
Vercel-CDN-Cache-Control: no-store
Pragma: no-cache
Expires: 0
```

Observed public response headers included:

```text
cache-control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
cdn-cache-control: no-store
expires: 0
pragma: no-cache
x-vercel-cache: MISS
age: 0
```

Note: `Vercel-CDN-Cache-Control` is set in source code, but Vercel may consume it internally and not echo it back in public response headers.

## V4 Markers

The public HTML contains:

```text
DEPLOYMENT_CHECK_TRADE_WEBSITE_V4
DEPLOYMENT_CHECK_TRADE_OS_V4
```

## Required Strings Confirmed

`/trade-website` and `/trade-website?cb=v4` contain:

```text
Precision Aluminum Manufacturing
Submit Inquiry for Manual Review
Official quotation requires manual review
```

`/trade-os-prototype` and `/trade-os-prototype?cb=v4` contain:

```text
full mock flow checklist
Dev Test
no automatic official quotation or PI
```

## Old Strings Removed

Confirmed absent from `/trade-website` and `/trade-website?cb=v4`:

```text
Prepare inquiry email
Export saved leads
China project supplier for facade, windows and aluminum systems
```

## Exact Curl Grep Output

Command:

```bash
curl -L -H "Cache-Control: no-cache" "https://project-7vo99.vercel.app/trade-website?cb=v4" | grep -E "DEPLOYMENT_CHECK_TRADE_WEBSITE_V4|Precision Aluminum Manufacturing|Submit Inquiry for Manual Review|Official quotation requires manual review|Prepare inquiry email"
```

Output:

```text
<title>CBM | Precision Aluminum Manufacturing & Architectural Project Supply</title>
content="Precision Aluminum Manufacturing, CNC aluminum parts, custom extruded and machined aluminum components, aluminum brackets, aluminum housings, aluminum connectors, anodized aluminum parts, powder coated aluminum parts, Submit Inquiry for Manual Review, Official quotation requires manual review"
<p class="deployment-check">DEPLOYMENT_CHECK_TRADE_WEBSITE_V4</p>
<p class="eyebrow">Architectural Aluminum Project Supply · Precision Aluminum Manufacturing</p>
Official quotation requires manual review. No automatic price, delivery time, PI or payment terms are confirmed by this demo.
<span>Precision Aluminum Manufacturing</span>
<span>Submit Inquiry for Manual Review</span>
<span>business line selection: Architectural Aluminum Project / Precision Aluminum Manufacturing</span>
<span>Official quotation requires manual review. No automatic price, delivery time, PI or payment terms are confirmed by this demo.</span>
<strong>B. Precision Aluminum Manufacturing</strong>
<h3>Precision Aluminum Manufacturing</h3>
Precision Aluminum Manufacturing includes CNC aluminum parts, custom extruded and machined aluminum components,
<p class="eyebrow">Precision Aluminum Manufacturing</p>
Visible scope: Precision Aluminum Manufacturing, CNC aluminum parts, custom extruded and machined aluminum
Official quotation requires manual review. No automatic price, delivery time, PI or payment terms are confirmed by this demo.
<option>Precision Aluminum Manufacturing</option>
<button class="primary-button" type="submit">Submit Inquiry for Manual Review</button>
```

Command:

```bash
curl -L -H "Cache-Control: no-cache" "https://project-7vo99.vercel.app/trade-os-prototype?cb=v4" | grep -E "DEPLOYMENT_CHECK_TRADE_OS_V4|full mock flow checklist|Dev Test|no automatic official quotation or PI"
```

Output:

```text
content="full mock flow checklist, Dev Test, full module list, mock vs real status table, data object relationship summary, localStorage mock only, no Supabase, no OpenAI API, no authentication, no real customer messages, no automatic official quotation or PI"
<p class="deployment-check">DEPLOYMENT_CHECK_TRADE_OS_V4</p>
<p>full mock flow checklist: website inquiry → import → lead/customer → inquiry → project → quotation → order → shipment → after-sales → repeat business reminder</p>
<p>full module list: Dashboard, Acquisition Center, Lead Pool, Customer 360, Inquiry Pool, Alibaba Inquiry Center, Project Center, Quotation Center, Order Center, Shipment Center, After-sales Center, Dev Test.</p>
<p>mock vs real status table: localStorage mock only, no Supabase, no OpenAI API, no authentication, no real customer messages, no automatic official quotation or PI.</p>
<p>Dev Test verifies website inquiry creation, import, lead creation, inquiry creation, customer conversion, project conversion, quotation draft creation, follow-up task creation and mock data clearing.</p>
Acquisition Center, Alibaba Inquiry Center, Order Center, Shipment Center, After-sales Center, Dev Test.
<h3>full mock flow checklist</h3>
<tr><td>Quotation and PI</td><td>Draft structure only; no automatic official quotation or PI; manual review required before official quotation or PI.</td></tr>
<tr><td>Dev Test</td><td>Dev Test exists locally for mock checks and is excluded from the public demo.</td></tr>
<h3>Dev Test</h3>
Dev Test verifies the mock CRM flow only: create sample website inquiry, import website inquiries into CRM,
follow-up task and clear all mock localStorage data. Dev Test is not production authentication and should
<li>Dev Test status: a local development test page exists for mock flow checks, but it is excluded from the public demo and should be removed or protected before production.</li>
```

## Additional Verification

Both normal alias URLs and cache-busting URLs were checked:

```text
[trade-website]
OK DEPLOYMENT_CHECK_TRADE_WEBSITE_V4
OK Precision Aluminum Manufacturing
OK Submit Inquiry for Manual Review
OK Official quotation requires manual review

[trade-website?cb=v4]
OK DEPLOYMENT_CHECK_TRADE_WEBSITE_V4
OK Precision Aluminum Manufacturing
OK Submit Inquiry for Manual Review
OK Official quotation requires manual review

[trade-os-prototype]
OK DEPLOYMENT_CHECK_TRADE_OS_V4
OK full mock flow checklist
OK Dev Test
OK no automatic official quotation or PI

[trade-os-prototype?cb=v4]
OK DEPLOYMENT_CHECK_TRADE_OS_V4
OK full mock flow checklist
OK Dev Test
OK no automatic official quotation or PI
```

## Remaining Note

Some external review tools may still return `Cache miss` or show stale HTML because of their own fetch cache, geographic edge inconsistency, or cached review snapshots. The Vercel public alias itself was verified with no-cache request headers and `?cb=v4` cache-busting URLs.
