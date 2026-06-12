import test from "node:test";
import assert from "node:assert/strict";

import {
  customer360Link,
  documentCenterLink,
  followUpWorkbenchLink,
  inquiryLink,
  leadReviewLink,
} from "../lib/command-center/deep-links.js";

test("documentCenterLink carries draft and business context", () => {
  const link = documentCenterLink({
    draft_id: "doc_1",
    document_type: "PI",
    customer_id: "cus_1",
    project_id: "proj_1",
  });

  assert.equal(link, "/trade-os-prototype?view=documents&draft_id=doc_1&document_type=PI&customer_id=cus_1&project_id=proj_1");
});

test("customer360Link carries customer_id", () => {
  assert.equal(customer360Link("cus_1"), "/trade-os-prototype?view=customer-360&customer_id=cus_1");
});

test("inquiryLink carries inquiry_id", () => {
  assert.equal(inquiryLink("inq_1"), "/trade-os-prototype?view=inquiries&inquiry_id=inq_1");
});

test("leadReviewLink carries lead_id", () => {
  assert.equal(leadReviewLink("lead_1"), "/trade-os-prototype?view=lead-review&lead_id=lead_1");
});

test("followUpWorkbenchLink carries task and filter", () => {
  assert.equal(followUpWorkbenchLink({ task_id: "task_1", filter: "today" }), "/trade-os-prototype?view=follow-ups&task_id=task_1&filter=today");
});

test("deep links include command_id when available", () => {
  assert.equal(
    documentCenterLink({ draft_id: "doc_1", command_id: "cmd_1" }),
    "/trade-os-prototype?view=documents&draft_id=doc_1&command_id=cmd_1",
  );
  assert.equal(
    inquiryLink("inq_1", { command_id: "cmd_1" }),
    "/trade-os-prototype?view=inquiries&inquiry_id=inq_1&command_id=cmd_1",
  );
  assert.equal(
    followUpWorkbenchLink({ task_id: "task_1", command_id: "cmd_1" }),
    "/trade-os-prototype?view=follow-ups&task_id=task_1&command_id=cmd_1",
  );
});
