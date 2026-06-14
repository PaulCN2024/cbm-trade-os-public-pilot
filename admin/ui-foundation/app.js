const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "Customers", soon: true },
  { id: "companies", label: "Companies" },
  { id: "inquiries", label: "Inquiries", soon: true },
  { id: "products", label: "Products" },
  { id: "suppliers", label: "Suppliers", soon: true },
  { id: "ai-drafts", label: "AI Drafts" },
  { id: "quotations", label: "Quotations", soon: true },
  { id: "orders", label: "Orders", soon: true },
  { id: "production", label: "Production", soon: true },
  { id: "shipping", label: "Shipping", soon: true },
  { id: "after-sales", label: "After-sales", soon: true },
  { id: "settings", label: "Settings", soon: true },
];

const sections = {
  dashboard: {
    title: "Admin Dashboard",
    description: "A calm operating view for leads, companies, products and draft reviews.",
    sectionTitle: "Dashboard Overview",
    sectionHelp: "Foundation layout for future business modules.",
    content: renderDashboard,
    review: renderDashboardReview,
  },
  companies: {
    title: "Companies",
    description: "Company management pattern with a clean table and simple form card.",
    sectionTitle: "Companies Management Sample",
    sectionHelp: "Static mock data. No API or CRUD is connected.",
    content: renderCompanies,
    review: renderCompanyReview,
  },
  products: {
    title: "Products",
    description: "Product data pattern with business-line badges and review status.",
    sectionTitle: "Products Management Sample",
    sectionHelp: "Designed for architectural and industrial aluminum product data.",
    content: renderProducts,
    review: renderProductReview,
  },
  "ai-drafts": {
    title: "AI Drafts",
    description: "Draft-only AI inquiry analysis review pattern with manual approval.",
    sectionTitle: "AI Inquiry Analysis Draft Review Sample",
    sectionHelp: "Suggested replies are draft text only and are never sent automatically.",
    content: renderAiDrafts,
    review: renderAiDraftReview,
  },
};

const comingSoonContent = {
  title: "Coming Soon",
  description: "This navigation item is reserved for a future phase.",
  sectionTitle: "Module Placeholder",
  sectionHelp: "No workflow is implemented in Step 2B.",
  content: renderComingSoon,
  review: renderComingSoonReview,
};

const navList = document.querySelector("#navList");
const pageTitle = document.querySelector("#pageTitle");
const pageDescription = document.querySelector("#pageDescription");
const sectionTitle = document.querySelector("#sectionTitle");
const sectionHelp = document.querySelector("#sectionHelp");
const mainContent = document.querySelector("#mainContent");
const reviewTitle = document.querySelector("#reviewTitle");
const reviewPanel = document.querySelector("#reviewPanel");

function badge(label, type = "") {
  return `<span class="badge ${type}">${escapeHtml(label)}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function businessBadge(value) {
  if (value === "A_ARCHITECTURAL") return badge("Architectural", "architectural");
  if (value === "B_INDUSTRIAL") return badge("Industrial", "industrial");
  return badge("Unknown", "unknown");
}

function renderNav() {
  navList.innerHTML = navItems
    .map(
      (item) => `
        <button class="nav-button" type="button" data-section="${item.id}" ${item.soon ? "aria-disabled=\"true\"" : ""}>
          <span>${escapeHtml(item.label)}</span>
          ${item.soon ? "<small>soon</small>" : ""}
        </button>
      `,
    )
    .join("");

  navList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    setSection(button.dataset.section);
  });
}

function setSection(sectionId) {
  const config = sections[sectionId] || comingSoonContent;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
  pageTitle.textContent = config.title;
  pageDescription.textContent = config.description;
  sectionTitle.textContent = config.sectionTitle;
  sectionHelp.textContent = config.sectionHelp;
  mainContent.innerHTML = config.content(sectionId);
  reviewTitle.textContent = config.title === "Coming Soon" ? "Module Status" : "Review Panel";
  reviewPanel.innerHTML = config.review(sectionId);
}

function renderDashboard() {
  return `
    <div class="module-preview">
      <article class="module-card">
        <h3>Foundation Objects</h3>
        <p>Companies, products, capabilities and AI draft reviews use the same page rhythm.</p>
        ${badge("Consistent layout", "active")}
      </article>
      <article class="module-card">
        <h3>Business Lines</h3>
        <p>Every major record can show Architectural, Industrial or Unknown clearly.</p>
        ${businessBadge("A_ARCHITECTURAL")} ${businessBadge("B_INDUSTRIAL")}
      </article>
      <article class="module-card">
        <h3>Manual Review</h3>
        <p>Drafts stay internal until a human approves the next action.</p>
        ${badge("Approval Required", "approval")}
      </article>
    </div>
  `;
}

function renderDashboardReview() {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>Step 2B Boundary</h3>
        <ul class="check-list">
          <li>No API connection</li>
          <li>No CRUD submission</li>
          <li>No business automation</li>
          <li>No OpenAI or outbound message integration</li>
        </ul>
      </div>
      <div class="review-card">
        <h3>Reusable Patterns</h3>
        <p>Sidebar, topbar, metric cards, tables, form cards, detail panels, badges and state cards.</p>
      </div>
    </div>
  `;
}

function renderCompanies() {
  return `
    ${renderTable([
      ["Company", "Country", "Type", "Status", "Next Action"],
      ["Panama Project Buyer", "Panama", "Project contractor", badge("Active", "active"), "Review latest inquiry"],
      ["ABC Industries Ltd.", "United States", "Industrial buyer", badge("Pending", "pending"), "Confirm drawing package"],
      ["Blue Horizon SA", "Brazil", "Facade distributor", badge("Active", "active"), "Prepare company profile"],
    ])}
    ${renderFormCard("Company Form Pattern", [
      ["Company Name", "Panama Project Buyer"],
      ["Country", "Panama"],
      ["Business Type", "Project contractor"],
      ["Notes", "Keep notes concise and business-focused.", "textarea"],
    ])}
  `;
}

function renderCompanyReview() {
  return renderReviewDetails({
    title: "Company Summary",
    badges: [badge("Active", "active"), businessBadge("A_ARCHITECTURAL")],
    rows: [
      ["Source", "Website inquiry"],
      ["Language", "English"],
      ["Next follow-up", "Manual review required"],
    ],
    draft: "Company data should support contacts, country, language, notes, inquiry history and future repeat opportunities.",
  });
}

function renderProducts() {
  return `
    ${renderTable([
      ["Product", "Business Line", "Category", "Status", "Review"],
      ["Aluminum Window System", businessBadge("A_ARCHITECTURAL"), "Windows & Doors", badge("Active", "active"), "Specs needed"],
      ["CNC Aluminum Bracket", businessBadge("B_INDUSTRIAL"), "Machined Parts", badge("Draft", "draft"), "Drawing required"],
      ["Custom Aluminum Profile", businessBadge("UNKNOWN"), "Extrusion", badge("Pending", "pending"), "Application unclear"],
    ])}
    ${renderFormCard("Product Form Pattern", [
      ["Code", "CL5437"],
      ["English Name", "Custom aluminum profile"],
      ["Business Line", "UNKNOWN"],
      ["Process Tags", "extrusion, cutting, anodizing"],
    ])}
  `;
}

function renderProductReview() {
  return renderReviewDetails({
    title: "Product Review",
    badges: [businessBadge("UNKNOWN"), badge("Needs routing", "pending")],
    rows: [
      ["Category", "Extrusion"],
      ["Material", "6063-T5"],
      ["Surface", "Anodized / Powder coated"],
    ],
    draft: "Profile or extrusion records should remain Unknown until the application is clear.",
  });
}

function renderAiDrafts() {
  return `
    ${renderTable([
      ["Inquiry", "Detected Line", "Missing Info", "Risk", "Status"],
      ["Hotel facade package", businessBadge("A_ARCHITECTURAL"), "Glass spec, area, port", badge("Medium", "risk"), badge("Approval Required", "approval")],
      ["CNC connector drawing", businessBadge("B_INDUSTRIAL"), "Tolerance, finish, quantity", badge("Low", "active"), badge("Draft", "draft")],
      ["Aluminum profile inquiry", businessBadge("UNKNOWN"), "Application, drawing, quantity", badge("Manual route", "pending"), badge("Approval Required", "approval")],
    ])}
    <div class="form-card">
      <h3>AI Draft Review Area</h3>
      <p>Suggested replies are internal draft text only. They are not sent by this UI.</p>
      <div class="draft-box">
        Thank you for your inquiry. To prepare a review-ready quotation draft, please confirm drawings, quantity, material, surface finish and destination port.
      </div>
      <div class="form-actions">
        <button class="button secondary" type="button">Copy Draft</button>
        <button class="button primary" type="button">Mark Reviewed</button>
      </div>
    </div>
  `;
}

function renderAiDraftReview() {
  return renderReviewDetails({
    title: "AI Safety Review",
    badges: [badge("Draft", "draft"), badge("Approval Required", "approval")],
    rows: [
      ["Draft status", "Internal only"],
      ["Suggested reply", "Not sent"],
      ["Price / lead time", "Not confirmed"],
    ],
    draft: "This area is for review. It must not send customer messages, official quotations, PI, payment terms, bank details, delivery time or production feasibility confirmations.",
  });
}

function renderComingSoon(sectionId) {
  return `
    <div class="module-preview">
      <article class="module-card">
        <h3>${escapeHtml(sectionId || "Module")}</h3>
        <p>This module is reserved for a later phase and is not implemented in Step 2B.</p>
        ${badge("Coming soon", "pending")}
      </article>
    </div>
  `;
}

function renderComingSoonReview() {
  return `
    <div class="review-card">
      <h3>Not Implemented</h3>
      <p>This placeholder does not connect to data, create records or execute business actions.</p>
    </div>
  `;
}

function renderTable(rows) {
  const [headers, ...bodyRows] = rows;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${bodyRows
            .map(
              (row) => `
                <tr>
                  ${row
                    .map((cell, index) =>
                      index === 0
                        ? `<td><span class="row-title"><strong>${escapeHtml(cell)}</strong><span>Static sample</span></span></td>`
                        : `<td>${cell}</td>`,
                    )
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFormCard(title, fields) {
  return `
    <div class="form-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="form-grid">
        ${fields
          .map(([label, value, type]) => {
            const control =
              type === "textarea"
                ? `<textarea>${escapeHtml(value)}</textarea>`
                : `<input type="text" value="${escapeHtml(value)}" />`;
            return `
              <label class="field">
                <span>${escapeHtml(label)}</span>
                ${control}
                <small>Static field style sample.</small>
              </label>
            `;
          })
          .join("")}
      </div>
      <div class="form-actions">
        <button class="button secondary" type="button">Cancel</button>
        <button class="button primary" type="button">Save Draft</button>
      </div>
    </div>
  `;
}

function renderReviewDetails({ title, badges, rows, draft }) {
  return `
    <div class="review-stack">
      <div class="review-card">
        <h3>${escapeHtml(title)}</h3>
        <p>${badges.join(" ")}</p>
        <dl>
          ${rows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
        </dl>
      </div>
      <div class="review-card">
        <h3>Draft / Review Note</h3>
        <div class="draft-box">${escapeHtml(draft)}</div>
      </div>
      <div class="review-card">
        <h3>Safety Checklist</h3>
        <ul class="check-list">
          <li>Draft only</li>
          <li>Manual approval required</li>
          <li>No automatic sending</li>
          <li>No price, payment, delivery or PI confirmation</li>
        </ul>
      </div>
    </div>
  `;
}

renderNav();
setSection("dashboard");
