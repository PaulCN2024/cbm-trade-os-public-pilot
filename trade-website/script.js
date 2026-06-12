import {
  normalizeWebsiteForm,
  readWebsiteInquiries,
} from "../lib/mock-crm.js";
import { DATA_MODE, createWebsiteInquiry } from "../lib/data-adapter.js";

const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");
const exportButton = document.querySelector("#exportLeads");

function getLeads() {
  return readWebsiteInquiries();
}

function csvEscape(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const leads = getLeads();
  if (!leads.length) {
    formStatus.textContent = "No saved leads yet.";
    return;
  }

  const headers = [
    "created_at",
    "status",
    "business_line",
    "source",
    "title",
    "name",
    "company",
    "email",
    "whatsapp",
    "country",
    "project_type",
    "drawing_status",
    "quote_method",
    "material_finish",
    "destination_port",
    "support_needed",
    "project_description",
    "attachment_names",
  ];
  const rows = leads.map((lead) =>
    headers
      .map((key) => {
        if (["name", "company", "email", "whatsapp", "country"].includes(key)) return csvEscape(lead.lead_info?.[key]);
        if (key === "attachment_names") return csvEscape((lead.attachment_names || []).join("; "));
        return csvEscape(lead[key]);
      })
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cbm-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
  formStatus.textContent = `${leads.length} saved lead${leads.length > 1 ? "s" : ""} exported.`;
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const files = Array.from(leadForm.elements.files.files || []).map((file) => file.name);
  const support = formData.getAll("support");
  const legacyLead = {
    createdAt: new Date().toISOString(),
    website: formData.get("website"),
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    businessLine: formData.get("businessLine"),
    country: formData.get("country"),
    projectType: formData.get("projectType"),
    drawingStatus: formData.get("drawingStatus"),
    quoteBasis: formData.get("quoteBasis"),
    finish: formData.get("finish"),
    destination: formData.get("destination"),
    support: support.join("; "),
    details: formData.get("details"),
    files: files.join("; "),
  };
  const inquiry = normalizeWebsiteForm(legacyLead);

  try {
    await createWebsiteInquiry(inquiry, { legacyLead });
    formStatus.textContent =
      DATA_MODE === "supabase"
        ? "Inquiry submitted to the Supabase pilot for manual review. No official quotation, price, delivery time or payment terms have been confirmed."
        : "Inquiry saved locally for manual review. No official quotation, price, delivery time or payment terms have been confirmed.";
    leadForm.reset();
  } catch (error) {
    formStatus.textContent =
      `Submission failed: ${error.message}. Manual review is still required before any official quotation.`;
  }
});

exportButton.addEventListener("click", exportCsv);
