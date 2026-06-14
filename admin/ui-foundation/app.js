import { getAdminAccessToken } from "../../lib/admin-auth.js";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "Customers", soon: true },
  { id: "companies", label: "Companies" },
  { id: "inquiries", label: "Inquiries", soon: true },
  { id: "products", label: "Products" },
  { id: "manufacturing-capabilities", label: "Capabilities" },
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
    description: "Read-only company list connected to the Step 2A companies API.",
    sectionTitle: "Companies Management",
    sectionHelp: "Read-only API list. Create, update and delete are not implemented in Step 2C-1.",
    content: renderCompanies,
    review: renderCompanyReview,
  },
  products: {
    title: "Products",
    description: "Read-only product list connected to the Step 2A products API.",
    sectionTitle: "Products Management",
    sectionHelp: "Read-only API list. Create, update and delete are not implemented in Step 2C-2.",
    content: renderProducts,
    review: renderProductReview,
  },
  "manufacturing-capabilities": {
    title: "Manufacturing Capabilities",
    description: "Read-only capability list connected to the Step 2A manufacturing capabilities API.",
    sectionTitle: "Manufacturing Capabilities",
    sectionHelp: "Read-only API list. Create, update and delete are not implemented in Step 2C-3.",
    content: renderManufacturingCapabilities,
    review: renderManufacturingCapabilityReview,
  },
  "ai-drafts": {
    title: "AI Drafts",
    description: "Read-only AI inquiry analysis draft review list connected to the Step 2A API.",
    sectionTitle: "AI Inquiry Analysis Draft Review",
    sectionHelp: "Read-only draft list. Suggested replies are draft text only and are never sent automatically.",
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

let activeSectionId = "dashboard";

const companyPreviewFallback = [
  {
    company_name: "Panama Project Buyer",
    country: "Panama",
    business_type: "Project contractor",
    notes: "Local preview fallback. API is unavailable or admin token is missing.",
  },
  {
    company_name: "ABC Industries Ltd.",
    country: "United States",
    business_type: "Industrial buyer",
    notes: "Local preview fallback. No API writes are enabled.",
  },
  {
    company_name: "Blue Horizon SA",
    country: "Brazil",
    business_type: "Facade distributor",
    notes: "Local preview fallback for visual review only.",
  },
];

const companyApiState = {
  status: "idle",
  companies: [],
  error: "",
  source: "not loaded",
};

const productPreviewFallback = [
  {
    name_en: "Aluminum Window System",
    business_line: "A_ARCHITECTURAL",
    category: "Windows & Doors",
    product_family: "Architectural systems",
    material: "6063-T5 aluminum",
    surface: "Powder coated",
    notes: "Preview fallback / local preview data. API is unavailable or admin token is missing.",
  },
  {
    name_en: "CNC Aluminum Bracket",
    business_line: "B_INDUSTRIAL",
    category: "CNC Parts",
    product_family: "Machined components",
    material: "6061 aluminum",
    surface: "Anodized",
    notes: "Preview fallback / local preview data. No API writes are enabled.",
  },
  {
    name_en: "Custom Aluminum Profile",
    business_line: "UNKNOWN",
    category: "Extrusion",
    product_family: "Custom profile",
    material: "Aluminum alloy",
    surface: "To be confirmed",
    notes: "Preview fallback / local preview data. Business application needs review.",
  },
];

const productApiState = {
  status: "idle",
  products: [],
  error: "",
  source: "not loaded",
};

const capabilityPreviewFallback = [
  {
    capability_line: "B_INDUSTRIAL",
    equipment: "CNC machining centers",
    quantity: 16,
    max_length: "To be confirmed",
    monthly_capacity: "Project-based capacity",
    public_description: "Preview fallback / local preview data. CNC machining capability for aluminum parts and components.",
    internal_notes: "Admin preview only. API is unavailable or admin token is missing.",
  },
  {
    capability_line: "A_ARCHITECTURAL",
    equipment: "Aluminum extrusion lines",
    quantity: 2,
    max_length: "Up to project requirement",
    monthly_capacity: "Around 400 tons",
    public_description: "Preview fallback / local preview data. Extrusion support for project aluminum profiles.",
    internal_notes: "Admin preview only. No API writes are enabled.",
  },
  {
    capability_line: "UNKNOWN",
    equipment: "Surface finishing support",
    quantity: null,
    max_length: "Anodizing up to 7.5m / powder coating up to 7m",
    monthly_capacity: "To be reviewed",
    public_description: "Preview fallback / local preview data. Surface finish support depends on drawing and color requirement.",
    internal_notes: "Admin preview only. Capability line needs business review.",
  },
];

const capabilityApiState = {
  status: "idle",
  capabilities: [],
  error: "",
  source: "not loaded",
};

const aiDraftPreviewFallback = [
  {
    detected_business_line: "A_ARCHITECTURAL",
    extracted_requirements: { product: "hotel facade package", destination_port: "Balboa" },
    missing_information: ["glass specification", "drawing package", "aluminum color"],
    risk_flags: ["manual quotation review required"],
    suggested_reply:
      "Preview fallback / local preview data. Thank you for your inquiry. Please share drawings, glass specification, aluminum color, quantity and destination port for manual review.",
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "B_INDUSTRIAL",
    extracted_requirements: { product: "CNC aluminum connector", material: "6061 aluminum" },
    missing_information: ["drawing file", "tolerance", "surface finish", "quantity"],
    risk_flags: ["draft only", "do not confirm production feasibility"],
    suggested_reply:
      "Preview fallback / local preview data. Please send drawing files, tolerance, finish and quantity. Our team will review before any quotation.",
    approval_required: true,
    created_at: "local preview",
  },
  {
    detected_business_line: "UNKNOWN",
    extracted_requirements: { product: "custom aluminum profile" },
    missing_information: ["application", "drawing", "quantity"],
    risk_flags: ["business line needs manual routing"],
    suggested_reply:
      "Preview fallback / local preview data. Please confirm the application and drawing details so we can route the inquiry correctly.",
    approval_required: true,
    created_at: "local preview",
  },
];

const aiDraftApiState = {
  status: "idle",
  drafts: [],
  error: "",
  source: "not loaded",
};

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
  activeSectionId = sectionId;
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
  if (sectionId === "companies") {
    loadCompaniesReadOnly();
  }
  if (sectionId === "products") {
    loadProductsReadOnly();
  }
  if (sectionId === "manufacturing-capabilities") {
    loadManufacturingCapabilitiesReadOnly();
  }
  if (sectionId === "ai-drafts") {
    loadAiDraftsReadOnly();
  }
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
  if (companyApiState.status === "idle" || companyApiState.status === "loading") {
    return renderCompaniesLoading();
  }

  if (companyApiState.status === "empty") {
    return renderCompaniesEmpty();
  }

  const statusNotice =
    companyApiState.status === "error"
      ? renderDataStatus("error", "Companies API unavailable", `${companyApiState.error} Showing local preview fallback only.`)
      : renderDataStatus("success", "Companies loaded", `Source: ${companyApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderCompanyTable(companyApiState.companies, companyApiState.source)}
    ${renderReadOnlyCompanyCard()}
  `;
}

function renderCompanyReview() {
  return renderReviewDetails({
    title: "Company API Status",
    badges: [badge("Read-only", "active"), badge(companyApiState.source, companyApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API route", "GET /api/companies"],
      ["Record count", String(companyApiState.companies.length)],
      ["Write actions", "Not connected"],
    ],
    draft: "Companies are shown as a read-only list in Step 2C-1. Create, update, delete, quotations, PI and message sending are not implemented.",
  });
}

function renderCompaniesLoading() {
  return `
    ${renderDataStatus("loading", "Loading companies", "Requesting GET /api/companies with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading company rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderCompaniesEmpty() {
  return `
    ${renderDataStatus("empty", "No companies found", "The API returned an empty list. No record is created by this page.")}
    ${renderReadOnlyCompanyCard()}
  `;
}

function renderCompanyTable(companies, source) {
  const rows = [
    ["Company", "Country", "Type", "Source", "Notes"],
    ...companies.map((company) => [
      company.company_name || "Unnamed company",
      escapeHtml(company.country || "Unknown"),
      escapeHtml(company.business_type || "Not classified"),
      badge(source === "api" ? "API" : "Preview fallback", source === "api" ? "active" : "pending"),
      escapeHtml(company.notes || "No notes"),
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (company) => company.website || company.id || "Read-only company record",
    bodyData: companies,
  });
}

function renderReadOnlyCompanyCard() {
  return `
    <div class="form-card read-only-card">
      <h3>Company Review Pattern</h3>
      <p>This card remains a static review pattern. It does not submit data or create records.</p>
      <div class="form-grid">
        <label class="field">
          <span>Allowed action</span>
          <input type="text" value="Read-only review" readonly />
          <small>No create or update API call is connected.</small>
        </label>
        <label class="field">
          <span>Safety boundary</span>
          <input type="text" value="No automatic sending or commitments" readonly />
          <small>Messages, quotations and PI are not sent.</small>
        </label>
      </div>
    </div>
  `;
}

function renderDataStatus(type, title, message) {
  return `
    <div class="data-status ${escapeHtml(type)}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

async function loadCompaniesReadOnly() {
  companyApiState.status = "loading";
  companyApiState.error = "";
  companyApiState.source = "api";
  refreshCompaniesView();

  try {
    const token = getAdminAccessToken();
    const response = await fetch("/api/companies", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `GET /api/companies failed with ${response.status}`);
    }
    const companies = Array.isArray(payload.companies) ? payload.companies : [];
    companyApiState.status = companies.length ? "loaded" : "empty";
    companyApiState.companies = companies;
    companyApiState.source = "api";
  } catch (error) {
    companyApiState.status = "error";
    companyApiState.error = error.message || "Unknown API error";
    companyApiState.companies = companyPreviewFallback;
    companyApiState.source = "local preview fallback";
  }

  refreshCompaniesView();
}

function refreshCompaniesView() {
  if (activeSectionId !== "companies") return;
  mainContent.innerHTML = renderCompanies();
  reviewPanel.innerHTML = renderCompanyReview();
}

function renderProducts() {
  if (productApiState.status === "idle" || productApiState.status === "loading") {
    return renderProductsLoading();
  }

  if (productApiState.status === "empty") {
    return renderProductsEmpty();
  }

  const statusNotice =
    productApiState.status === "error"
      ? renderDataStatus("error", "Products API unavailable", `${productApiState.error} Showing Preview fallback / local preview data only.`)
      : renderDataStatus("success", "Products loaded", `Source: ${productApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderProductTable(productApiState.products, productApiState.source)}
    ${renderReadOnlyProductCard()}
  `;
}

function renderProductReview() {
  return renderReviewDetails({
    title: "Product API Status",
    badges: [badge("Read-only", "active"), badge(productApiState.source, productApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API route", "GET /api/products"],
      ["Record count", String(productApiState.products.length)],
      ["Write actions", "Not connected"],
    ],
    draft: "Products are shown as a read-only list in Step 2C-2. Create, update, delete, quotations, PI and message sending are not implemented.",
  });
}

function renderProductsLoading() {
  return `
    ${renderDataStatus("loading", "Loading products", "Requesting GET /api/products with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading product rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderProductsEmpty() {
  return `
    ${renderDataStatus("empty", "No products found", "The API returned an empty list. No record is created by this page.")}
    ${renderReadOnlyProductCard()}
  `;
}

function renderProductTable(products, source) {
  const rows = [
    ["Product Name", "Business Line", "Category", "Product Family", "Material", "Surface", "Status / Notes"],
    ...products.map((product) => [
      product.name_en || product.name_cn || product.code || "Unnamed product",
      businessBadge(product.business_line),
      escapeHtml(product.category || "Unclassified"),
      escapeHtml(product.product_family || "Not set"),
      escapeHtml(product.material || "To be confirmed"),
      escapeHtml(product.surface || "To be confirmed"),
      `${badge(source === "api" ? "API" : "Preview fallback", source === "api" ? "active" : "pending")} ${escapeHtml(product.notes || "No notes")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (product) => product.code || product.id || "Read-only product record",
    bodyData: products,
  });
}

function renderReadOnlyProductCard() {
  return `
    <div class="form-card read-only-card">
      <h3>Product Review Pattern</h3>
      <p>This card remains a static review pattern. It does not submit data or create records.</p>
      <div class="form-grid">
        <label class="field">
          <span>Allowed action</span>
          <input type="text" value="Read-only product review" readonly />
          <small>No create, update or delete API call is connected.</small>
        </label>
        <label class="field">
          <span>Business line</span>
          <input type="text" value="A_ARCHITECTURAL / B_INDUSTRIAL / UNKNOWN" readonly />
          <small>Business-line labels are display-only in this step.</small>
        </label>
      </div>
    </div>
  `;
}

async function loadProductsReadOnly() {
  productApiState.status = "loading";
  productApiState.error = "";
  productApiState.source = "api";
  refreshProductsView();

  try {
    const token = getAdminAccessToken();
    const response = await fetch("/api/products", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `GET /api/products failed with ${response.status}`);
    }
    const products = Array.isArray(payload.products) ? payload.products : [];
    productApiState.status = products.length ? "loaded" : "empty";
    productApiState.products = products;
    productApiState.source = "api";
  } catch (error) {
    productApiState.status = "error";
    productApiState.error = error.message || "Unknown API error";
    productApiState.products = productPreviewFallback;
    productApiState.source = "Preview fallback / local preview data";
  }

  refreshProductsView();
}

function refreshProductsView() {
  if (activeSectionId !== "products") return;
  mainContent.innerHTML = renderProducts();
  reviewPanel.innerHTML = renderProductReview();
}

function renderManufacturingCapabilities() {
  if (capabilityApiState.status === "idle" || capabilityApiState.status === "loading") {
    return renderManufacturingCapabilitiesLoading();
  }

  if (capabilityApiState.status === "empty") {
    return renderManufacturingCapabilitiesEmpty();
  }

  const statusNotice =
    capabilityApiState.status === "error"
      ? renderDataStatus("error", "Manufacturing capabilities API unavailable", `${capabilityApiState.error} Showing Preview fallback / local preview data only.`)
      : renderDataStatus("success", "Manufacturing capabilities loaded", `Source: ${capabilityApiState.source}. Read-only list. No create, update or delete action is connected.`);

  return `
    ${statusNotice}
    ${renderManufacturingCapabilityTable(capabilityApiState.capabilities, capabilityApiState.source)}
    ${renderReadOnlyCapabilityCard()}
  `;
}

function renderManufacturingCapabilityReview() {
  return renderReviewDetails({
    title: "Capability API Status",
    badges: [badge("Read-only", "active"), badge(capabilityApiState.source, capabilityApiState.status === "error" ? "pending" : "draft")],
    rows: [
      ["API route", "GET /api/manufacturing-capabilities"],
      ["Record count", String(capabilityApiState.capabilities.length)],
      ["Write actions", "Not connected"],
    ],
    draft: "Manufacturing capabilities are shown as a read-only admin list in Step 2C-3. This page does not confirm production feasibility, quotation, delivery time or supplier commitments.",
  });
}

function renderManufacturingCapabilitiesLoading() {
  return `
    ${renderDataStatus("loading", "Loading manufacturing capabilities", "Requesting GET /api/manufacturing-capabilities with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading manufacturing capability rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderManufacturingCapabilitiesEmpty() {
  return `
    ${renderDataStatus("empty", "No manufacturing capabilities found", "The API returned an empty list. No record is created by this page.")}
    ${renderReadOnlyCapabilityCard()}
  `;
}

function renderManufacturingCapabilityTable(capabilities, source) {
  const rows = [
    ["Capability Line", "Equipment", "Quantity", "Max Length", "Monthly Capacity", "Public Description", "Status / Notes"],
    ...capabilities.map((capability) => [
      businessBadge(capability.capability_line),
      capability.equipment || "Unnamed equipment",
      escapeHtml(capability.quantity ?? "Not set"),
      escapeHtml(capability.max_length || "To be confirmed"),
      escapeHtml(capability.monthly_capacity || "To be confirmed"),
      escapeHtml(capability.public_description || "No public description"),
      `${badge(source === "api" ? "API" : "Preview fallback", source === "api" ? "active" : "pending")} ${escapeHtml(capability.internal_notes || "No internal notes")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (capability) => capability.id || "Read-only capability record",
    bodyData: capabilities,
  });
}

function renderReadOnlyCapabilityCard() {
  return `
    <div class="form-card read-only-card">
      <h3>Capability Review Pattern</h3>
      <p>This card remains a static review pattern. It does not submit data or create capability records.</p>
      <div class="form-grid">
        <label class="field">
          <span>Allowed action</span>
          <input type="text" value="Read-only capability review" readonly />
          <small>No create, update or delete API call is connected.</small>
        </label>
        <label class="field">
          <span>Safety boundary</span>
          <input type="text" value="No production or delivery commitment" readonly />
          <small>Capability display does not confirm feasibility, price or delivery time.</small>
        </label>
      </div>
    </div>
  `;
}

async function loadManufacturingCapabilitiesReadOnly() {
  capabilityApiState.status = "loading";
  capabilityApiState.error = "";
  capabilityApiState.source = "api";
  refreshManufacturingCapabilitiesView();

  try {
    const token = getAdminAccessToken();
    const response = await fetch("/api/manufacturing-capabilities", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `GET /api/manufacturing-capabilities failed with ${response.status}`);
    }
    const capabilities = Array.isArray(payload.manufacturing_capabilities) ? payload.manufacturing_capabilities : [];
    capabilityApiState.status = capabilities.length ? "loaded" : "empty";
    capabilityApiState.capabilities = capabilities;
    capabilityApiState.source = "api";
  } catch (error) {
    capabilityApiState.status = "error";
    capabilityApiState.error = error.message || "Unknown API error";
    capabilityApiState.capabilities = capabilityPreviewFallback;
    capabilityApiState.source = "Preview fallback / local preview data";
  }

  refreshManufacturingCapabilitiesView();
}

function refreshManufacturingCapabilitiesView() {
  if (activeSectionId !== "manufacturing-capabilities") return;
  mainContent.innerHTML = renderManufacturingCapabilities();
  reviewPanel.innerHTML = renderManufacturingCapabilityReview();
}

function renderAiDrafts() {
  if (aiDraftApiState.status === "idle" || aiDraftApiState.status === "loading") {
    return renderAiDraftsLoading();
  }

  if (aiDraftApiState.status === "empty") {
    return renderAiDraftsEmpty();
  }

  const statusNotice =
    aiDraftApiState.status === "error"
      ? renderDataStatus("error", "AI inquiry analyses API unavailable", `${aiDraftApiState.error} Showing Preview fallback / local preview data only.`)
      : renderDataStatus("success", "AI inquiry analysis drafts loaded", `Source: ${aiDraftApiState.source}. Read-only draft list. No send, quote or PI action is connected.`);

  return `
    ${statusNotice}
    ${renderAiDraftTable(aiDraftApiState.drafts, aiDraftApiState.source)}
    ${renderReadOnlyAiDraftCard()}
  `;
}

function renderAiDraftReview() {
  return renderReviewDetails({
    title: "AI Draft API Status",
    badges: [badge("Read-only", "active"), badge("Draft only", "draft"), badge("Approval Required", "approval")],
    rows: [
      ["API route", "GET /api/ai-inquiry-analyses"],
      ["Record count", String(aiDraftApiState.drafts.length)],
      ["Write actions", "Not connected"],
    ],
    draft: "AI inquiry analyses are read-only drafts in Step 2C-4. Suggested replies are not sent. This page does not confirm price, delivery time, payment terms, bank account, production feasibility, quotation or PI.",
  });
}

function renderAiDraftsLoading() {
  return `
    ${renderDataStatus("loading", "Loading AI inquiry analysis drafts", "Requesting GET /api/ai-inquiry-analyses with the current admin session when available.")}
    <div class="table-wrap table-skeleton" aria-label="Loading AI draft rows">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>
  `;
}

function renderAiDraftsEmpty() {
  return `
    ${renderDataStatus("empty", "No AI inquiry analysis drafts found", "The API returned an empty list. No record is created by this page.")}
    ${renderReadOnlyAiDraftCard()}
  `;
}

function renderAiDraftTable(drafts, source) {
  const rows = [
    ["Detected Line", "Missing Info", "Risk Flags", "Approval", "Suggested Reply Draft", "Status / Source"],
    ...drafts.map((draft) => [
      businessBadge(draft.detected_business_line),
      escapeHtml(formatList(draft.missing_information)),
      escapeHtml(formatList(draft.risk_flags)),
      draft.approval_required === false ? badge("Approval forced by API", "approval") : badge("Approval Required", "approval"),
      escapeHtml(draft.suggested_reply || "No suggested reply draft"),
      `${badge(source === "api" ? "API" : "Preview fallback", source === "api" ? "active" : "pending")} ${badge("Draft only", "draft")} ${badge("Not sent", "pending")}`,
    ]),
  ];
  return renderTable(rows, {
    firstColumnSubtitle: (draft) => draft.created_at || draft.id || "Read-only AI draft record",
    bodyData: drafts,
  });
}

function renderReadOnlyAiDraftCard() {
  return `
    <div class="form-card read-only-card">
      <h3>AI Draft Safety Review</h3>
      <p>Suggested replies are internal draft text only. This page does not send or approve any customer-facing action.</p>
      <div class="form-grid">
        <label class="field">
          <span>Draft status</span>
          <input type="text" value="Draft only / not sent" readonly />
          <small>No email, WhatsApp or customer message is sent.</small>
        </label>
        <label class="field">
          <span>Approval rule</span>
          <input type="text" value="Manual approval required" readonly />
          <small>No quotation, PI, price, delivery, payment or bank information is confirmed.</small>
        </label>
      </div>
    </div>
  `;
}

async function loadAiDraftsReadOnly() {
  aiDraftApiState.status = "loading";
  aiDraftApiState.error = "";
  aiDraftApiState.source = "api";
  refreshAiDraftsView();

  try {
    const token = getAdminAccessToken();
    const response = await fetch("/api/ai-inquiry-analyses", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `GET /api/ai-inquiry-analyses failed with ${response.status}`);
    }
    const drafts = Array.isArray(payload.ai_inquiry_analyses) ? payload.ai_inquiry_analyses : [];
    aiDraftApiState.status = drafts.length ? "loaded" : "empty";
    aiDraftApiState.drafts = drafts.map((draft) => ({ ...draft, approval_required: true }));
    aiDraftApiState.source = "api";
  } catch (error) {
    aiDraftApiState.status = "error";
    aiDraftApiState.error = error.message || "Unknown API error";
    aiDraftApiState.drafts = aiDraftPreviewFallback.map((draft) => ({ ...draft, approval_required: true }));
    aiDraftApiState.source = "Preview fallback / local preview data";
  }

  refreshAiDraftsView();
}

function refreshAiDraftsView() {
  if (activeSectionId !== "ai-drafts") return;
  mainContent.innerHTML = renderAiDrafts();
  reviewPanel.innerHTML = renderAiDraftReview();
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(", ");
  return value || "None";
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

function renderTable(rows, options = {}) {
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
              (row, rowIndex) => `
                <tr>
                  ${row
                    .map((cell, index) => {
                      const sourceRecord = options.bodyData?.[rowIndex] || {};
                      const subtitle = options.firstColumnSubtitle
                        ? options.firstColumnSubtitle(sourceRecord)
                        : "Static sample";
                      return index === 0
                        ? `<td><span class="row-title"><strong>${escapeHtml(cell)}</strong><span>${escapeHtml(subtitle)}</span></span></td>`
                        : `<td>${cell}</td>`;
                    })
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
