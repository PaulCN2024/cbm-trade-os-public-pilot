function renderTradeOsHtml() {
  const publicEnv = {
    NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || "mock",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  };
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CBM Trade OS</title>
    <meta
      name="description"
      content="CBM Trade OS public demo for mock foreign trade customer acquisition, CRM, inquiry, quotation, order, shipment and after-sales workflow."
    />
    <meta
      name="keywords"
      content="full mock flow checklist, Dev Test, full module list, mock vs real status table, data object relationship summary, Supabase pilot mode, localStorage mock downstream modules, no OpenAI API, no real customer messages, no automatic official quotation or PI"
    />
    <meta name="theme-color" content="#10231f" />
    <script>window.__CBM_ENV__=${JSON.stringify(publicEnv)};</script>
    <link rel="manifest" href="/trade-os-prototype/manifest.webmanifest" />
    <link rel="stylesheet" href="/trade-os-prototype/styles.css" />
  </head>
  <body>
    <aside class="sidebar" aria-label="主导航">
      <div class="brand">
        <div class="brand-mark">CBM</div>
        <div>
          <strong>CBM Trade OS</strong>
          <span>外贸项目工作台</span>
        </div>
      </div>
      <nav class="nav" id="nav">
        <a href="/trade-os-prototype">Dashboard</a>
      </nav>
      <button class="ghost-button" id="resetDataButton" type="button">重置演示数据</button>
      <button class="ghost-button" id="adminLogoutButton" type="button">退出登录</button>
    </aside>

    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">建筑铝型材 · 精密铝制造 · 外贸业务系统</p>
          <p class="deployment-check">DEPLOYMENT_CHECK_TRADE_OS_V5</p>
          <h1 id="pageTitle">CBM Trade OS</h1>
          <p class="demo-note">Admin pilot · Supabase front CRM data when configured · downstream mock modules · manual review required</p>
        </div>
        <div class="topbar-tools">
          <div class="admin-status" id="adminIdentity">
            <span><strong>Admin:</strong> session required</span>
            <span><strong>Mode:</strong> ${publicEnv.NEXT_PUBLIC_DATA_MODE || "mock"}</span>
            <span><strong>Supabase:</strong> ${publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "configured" : "not configured"}</span>
          </div>
          <a class="ghost-button" href="/admin/system-check">System Check</a>
          <div class="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input id="globalSearch" type="search" placeholder="搜索客户、项目、型材、邮件摘要" />
          </div>
        </div>
      </header>

      <section id="app" class="content" aria-live="polite">
        <section class="crawler-fallback" aria-label="CBM Trade OS static overview">
          <p class="eyebrow">Server-rendered fallback for external review tools</p>
          <h2>CBM Trade OS public demo</h2>
          <p>
            CBM Trade OS is a foreign trade business operating system prototype for customer acquisition,
            lead management, inquiry analysis, project tracking, quotation drafts, order workflow,
            shipment tracking, after-sales service and repeat business development.
          </p>
          <p>
            Current mock CRM flow: Acquisition Center for independent website, Alibaba, Gmail, WhatsApp,
            manual import, Google Ads, SEO, social media and trade show leads; then lead pool, customer 360,
            inquiry pool, mock AI summary, missing information analysis, follow-up task, project center
            and quotation draft.
          </p>
          <h3>Phase 3E admin security and pilot usability</h3>
          <p>
            Admin identity display, current data mode, Supabase configured status, admin logout, and protected pilot
            cleanup are part of the internal pilot. Public website inquiries create Lead + Inquiry + FollowUpTask in
            Supabase pilot mode; Customer is created only after manual conversion.
          </p>
          <section aria-label="Public review summary">
            <h3>Public HTML review summary</h3>
            <p>full mock flow checklist: website inquiry → import → lead/customer → inquiry → project → quotation → order → shipment → after-sales → repeat business reminder</p>
            <p>full module list: Dashboard, Action Center, Acquisition Center, Lead Pool, Customer 360, Inquiry Pool, Alibaba Inquiry Center, Project Center, Product Library, Quotation Center, Document Center, Order Center, Shipment Center, After-sales Center, Dev Test.</p>
            <p>mock vs real status table: Supabase pilot for leads, customers, inquiries, follow-up tasks and attachment metadata; localStorage mock for projects, quotations, orders, shipments and after-sales; no OpenAI API, no real customer messages, no automatic official quotation or PI.</p>
            <p>Dev Test verifies website inquiry creation, import, lead creation, inquiry creation, customer conversion, project conversion, quotation draft creation, follow-up task creation and mock data clearing.</p>
            <p>data object relationship summary: Lead, Customer, Inquiry, Project, Quotation, Order, Shipment, AfterSalesCase, FollowUpTask, RepeatBusinessTask, CommunicationLog, Attachment.</p>
          </section>
          <h3>Full module list</h3>
          <p>
            Module list: Dashboard, Action Center, Lead Pool, Customer 360, Inquiry Pool, Project Center, Product Library, Quotation Center, Document Center,
            Acquisition Center, Alibaba Inquiry Center, Order Center, Shipment Center, After-sales Center, Dev Test.
          </p>
          <ul>
            <li>Dashboard: overview of customers, prospects, high-priority inquiries, follow-ups and workflow status.</li>
            <li>Action Center: operator command queue for missing information, quote review, order review, shipment documents, after-sales follow-up and repeat business reminders.</li>
            <li>Acquisition Center: unified mock intake for website, Alibaba, Gmail, WhatsApp, manual import, Google Ads, SEO, social media and trade show leads.</li>
            <li>Flow Center: end-to-end business chain view from website inquiry to repeat business reminder.</li>
            <li>Customer 360: customer profile, related leads, inquiries, projects, quotations, logs and tasks.</li>
            <li>Target Prospects: manually researched target accounts for future development.</li>
            <li>Lead Pool: lead qualification radar, source tiering, duplicate risk review, scoring explanation and convert-to-inquiry actions.</li>
            <li>Inquiry Pool: website inquiry import, rule-based summary, missing information checklist, trilingual reply drafts, ready-to-quote review and next action.</li>
            <li>Alibaba Inquiry Center: mock Alibaba International Station inquiry paste/import, lead creation, missing information analysis and manual follow-up task creation.</li>
            <li>Website Growth Center: mock independent website growth and inquiry acquisition planning.</li>
            <li>Social Media Content: mock content planning for LinkedIn, Facebook, Instagram and other channels.</li>
            <li>Customer Development Campaigns: mock outbound campaign planning and follow-up structure.</li>
            <li>WhatsApp Learning: read-only future learning direction; no automatic sending.</li>
            <li>Order Automation: mock operation rules and task suggestions, not automatic order execution.</li>
            <li>Project Center: project command center with stage progress, risk panel, related inquiry, quotation drafts, mock order, shipment, after-sales relationship map and manual-review actions.</li>
            <li>Product Library: mock product master data for aluminum profiles, cut aluminum profiles, accessories and charge templates, including weight, length, finish, color and default pricing fields for future quotation and document workflows.</li>
            <li>Quotation Center: quotation review command center with completeness score, missing price fields, risk panel, relationship map, customer follow-up draft and manual send review status.</li>
            <li>Document Center: mock Quotation, Proforma Invoice and Chinese production order creation, preview, Excel export, PDF print export, archive naming, customer-visible field filtering and internal-cost hiding.</li>
            <li>Order Center: order command center with PI review, payment status, production status, document draft review, risk flags and relationship map.</li>
            <li>Shipment Center: shipment command center with booking status, ETA placeholder, BL / CI / PL document review, relationship map and after-sales follow-up creation.</li>
            <li>After-sales Center: mock issue follow-up, customer feedback and repeat opportunity reminders.</li>
            <li>AI Assistant: rule-based placeholder output only; no OpenAI API is connected.</li>
          </ul>
          <h3>full mock flow checklist</h3>
          <p>
            website inquiry → import → lead/customer → inquiry → project → quotation → order → shipment →
            after-sales → repeat business reminder
          </p>
          <ol>
            <li>Website inquiry submitted from the public RFQ form.</li>
            <li>Import website inquiry into CBM Trade OS.</li>
            <li>Create or update lead and customer information.</li>
            <li>Create inquiry record with business line, source, score, summary and missing information.</li>
            <li>Convert qualified inquiry to project.</li>
            <li>Create quotation draft for manual review.</li>
            <li>Create mock order only after quotation acceptance is manually indicated.</li>
            <li>Create shipment tracking placeholder and document draft placeholders.</li>
            <li>Create after-sales follow-up case after shipment completion.</li>
            <li>Create repeat business reminder for future development.</li>
          </ol>
          <h3>mock vs real status table</h3>
          <table>
            <thead>
              <tr><th>Area</th><th>Current status</th></tr>
            </thead>
            <tbody>
              <tr><td>Front CRM data storage</td><td>Supabase pilot mode for leads, customers, inquiries, follow-up tasks and attachment metadata when configured.</td></tr>
              <tr><td>Downstream modules</td><td>Projects, quotations, orders, shipments and after-sales remain mock localStorage modules.</td></tr>
              <tr><td>AI</td><td>Rule-based placeholder only; no OpenAI API.</td></tr>
              <tr><td>Authentication</td><td>Basic Supabase admin login for pilot use; no complex team permissions yet.</td></tr>
              <tr><td>Messaging</td><td>No real customer messages, no WhatsApp sending, no Gmail sending.</td></tr>
              <tr><td>Quotation and PI</td><td>Draft structure only; no automatic official quotation or PI; manual review required before official quotation or PI.</td></tr>
              <tr><td>Dev Test</td><td>Dev Test exists locally for mock checks and is excluded from the public demo.</td></tr>
            </tbody>
          </table>
          <h3>Dev Test</h3>
          <p>
            Dev Test verifies the mock CRM flow only: create sample website inquiry, import website inquiries into CRM,
            convert latest inquiry to customer, convert latest inquiry to project, create quotation draft, create
            follow-up task and clear all mock localStorage data. Dev Test is not production authentication and should
            be removed or protected before production.
          </p>
          <h3>Mock vs real implementation boundary</h3>
          <ul>
            <li>Implemented now: static website, Supabase pilot for front CRM objects, interactive browser demo, mock localStorage downstream modules, rule-based analyzer, mock projects, mock quotations, mock orders, mock shipments and mock after-sales records.</li>
            <li>Not implemented yet: complex team permission system, OpenAI API, Gmail sending, WhatsApp sending, payment workflow, official quotation generation and official PI generation.</li>
            <li>Dev Test status: a local development test page exists for mock flow checks, but it is excluded from the public demo and should be removed or protected before production.</li>
            <li>Data boundary: front CRM pilot data can come from Supabase after admin login; projects, quotations, orders, shipments and after-sales remain mock localStorage modules.</li>
          </ul>
          <h3>Data object relationship summary</h3>
          <ul>
            <li>Lead stores early customer source, company, country, business line and qualification status.</li>
            <li>Customer is the qualified account view that links related leads, inquiries, projects, quotations, orders, shipments, after-sales cases and follow-up tasks.</li>
            <li>Inquiry captures the customer's request, business line, missing information, score, mock AI summary and recommended next action.</li>
            <li>Architectural Requirement and Precision Requirement store business-line-specific details for project supply or precision manufacturing.</li>
            <li>Project is created from a qualified inquiry and tracks stage, priority, next action and quotation drafts.</li>
            <li>Quotation is a draft structure only; it links back to inquiry or project and requires manual price and term review.</li>
            <li>Order and Shipment are mock downstream records created only after manual business decisions are represented in the demo.</li>
            <li>AfterSalesCase and FollowUpTask keep post-shipment service, feedback and repeat business reminders connected to the customer history.</li>
            <li>CommunicationLog and Attachment are designed as future linked records for Gmail, WhatsApp, drawings, quotations, PI, invoice, packing list and shipment documents.</li>
          </ul>
          <ul>
            <li>Business line A: Architectural Aluminum Project Supply, including aluminum windows and doors, curtain wall systems, facade aluminum materials, aluminum louvers, glass railings and ACP panels.</li>
            <li>Business line B: Precision Aluminum Manufacturing, including CNC aluminum parts, custom extruded aluminum components with machining, brackets, housings, connectors, anodized parts and powder coated parts.</li>
          </ul>
          <h3>Alibaba Inquiry Center</h3>
          <p>
            Alibaba Inquiry Center is a mock-only module for Alibaba International Station inquiry organization.
            It supports manual paste, CSV/TSV batch import, duplicate skipping and future email import,
            then creates Lead, Inquiry, Requirement, FollowUpTask and CommunicationLog records in the same
            mock CRM flow. It can also run an Alibaba full mock flow to customer, project, quotation draft,
            order, shipment, after-sales and repeat business reminder. It does not connect to a real Alibaba
            account, does not use Alibaba API yet, and does not send buyer messages.
          </p>
          <h3>Acquisition Center</h3>
          <p>
            Acquisition Center is the unified mock customer acquisition entry point. It tracks website inquiries,
            Alibaba International inquiries, Gmail read-only leads, WhatsApp read-only leads, manual imports,
            Google Ads, SEO, social media and trade show sources. Each source can create Lead records and,
            when qualified, Inquiry records in the same mock CRM flow. It uses localStorage mock data only
            and does not send any customer message.
          </p>
          <h3>Lead Qualification</h3>
          <p>
            Lead Pool includes a rule-based qualification radar for source tiering, duplicate risk review,
            scoring explanation, ready-to-convert decisions and next manual action suggestions. It never
            auto-merges customers and never sends outreach automatically.
          </p>
          <h3>Inquiry Center</h3>
          <p>
            Inquiry Center includes a missing information checklist, Ready to Quote Decision Panel,
            English / Chinese / Spanish reply draft center, follow-up tasks and manual review controls.
            The ready-to-quote check only decides whether a quotation draft can enter manual review;
            it does not confirm price, lead time, payment terms, bank information, official quotation or PI.
          </p>
          <h3>Project Center</h3>
          <p>
            Project Center turns qualified inquiries into trackable projects with requirement review,
            quotation, negotiation, order pending, ordered and lost stages. It shows risk, next action,
            related inquiry, quotation drafts, mock order, shipment, after-sales records and project tasks.
            Project actions create internal drafts only and do not confirm official order, PI, price,
            delivery time, payment terms or shipment commitment.
          </p>
          <h3>Product Library</h3>
          <p>
            Product Library stores mock master data for aluminum profiles, cut aluminum profiles, accessories and charge
            templates. It includes sample records such as GJQ0001, YW-003, T6604, CL5437, handrail accessories and freight
            charge templates. It is designed to support future quotation, Document Center, production order and product
            knowledge workflows without hard-coding product data into individual documents.
          </p>
          <h3>Quotation Center</h3>
          <p>
            Quotation Center turns inquiry or project data into internal quotation drafts with quote completeness
            score, missing price fields, manual quote review checklist, quote risk panel, relationship map,
            customer follow-up draft and quote follow-up tasks. It can mark a draft as ready for manual send
            review, but it never sends an official quotation, never creates an official PI and never confirms
            final price, lead time, payment terms or bank information.
          </p>
          <h3>Document Center</h3>
          <p>
            Document Center is a mock localStorage module for Quotation, Proforma Invoice, Chinese production order,
            cutting list and packing list records. It includes CBM GLOBAL LIMITED seller configuration in the mock data
            layer, aluminum profile weight calculation with internal factor hidden from customer documents, cut aluminum
            profile per-piece pricing, accessory pricing, charge rows with internal freight notes hidden by default,
            customer preview, production order preview, Excel export and browser print PDF export. Production orders
            hide customer company, customer contact, price, amount, bank information, exchange rate, profit and payment terms.
          </p>
          <h3>Order and Shipment Centers</h3>
          <p>
            Order Center tracks mock order drafts, PI review, payment status, production status, document
            placeholders, risk flags and relationship maps. Shipment Center tracks mock shipment drafts,
            booking status, ETA placeholders, BL / CI / PL review, document placeholders and after-sales
            follow-up creation. These centers do not confirm PI, price, lead time, payment terms, bank account,
            booking, bill of lading, customs release or delivery.
          </p>
          <h3>Safety rules</h3>
          <ul>
            <li>The system must not automatically send customer messages, WhatsApp messages or emails.</li>
            <li>The system must not automatically send official quotation, PI, payment terms, bank account information or compensation promises.</li>
            <li>The system must not confirm price, delivery time, payment terms, technical commitments or legal commitments without manual review.</li>
            <li>Manual review is required before any official quotation, PI, price, delivery, payment or shipment commitment.</li>
            <li>Data rule: Supabase pilot is limited to front CRM objects; downstream commercial workflow remains mock only.</li>
          </ul>
          <p>
            This route is served by a Vercel serverless HTML fallback so external crawlers can read it directly.
            JavaScript then enhances the same page into the interactive CBM Trade OS dashboard.
          </p>
        </section>
      </section>
    </main>

    <dialog id="entityDialog">
      <form method="dialog" class="dialog-card" id="entityForm">
        <header>
          <h2 id="dialogTitle">新增</h2>
          <button class="icon-button" value="cancel" aria-label="关闭" type="submit">×</button>
        </header>
        <div id="dialogFields" class="form-grid"></div>
        <footer>
          <button class="ghost-button" value="cancel" type="submit">取消</button>
          <button class="primary-button" id="dialogSaveButton" value="default" type="submit">保存</button>
        </footer>
      </form>
    </dialog>

    <script type="module" src="/trade-os-prototype/app.js"></script>
  </body>
</html>`;
}

function setNoCacheHeaders(response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
}

module.exports = function handler(request, response) {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  setNoCacheHeaders(response);
  response.setHeader("X-CBM-Rendered-Route", "trade-os-prototype-server-html");
  response.status(200).send(renderTradeOsHtml());
};
