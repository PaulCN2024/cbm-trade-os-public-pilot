-- AI Inquiry Intelligence DEMO seed data.
-- Fictional internal review examples only.
-- No AI provider, file parsing, supplier RFQ, quotation, sending,
-- customer/inquiry mutation, or business execution is introduced.

insert into public.inquiry_intelligence_requests (
  id,
  source_type,
  source_entity_id,
  inquiry_id,
  customer_id,
  customer_name,
  company_name,
  country,
  source_channel,
  inquiry_title,
  inquiry_text,
  language,
  analysis_status,
  priority_level,
  risk_level,
  confidence_level,
  requested_by,
  requested_at,
  created_at,
  updated_at
) values
(
  '21000000-0000-4000-8000-000000000001',
  'inquiry',
  null,
  null,
  null,
  'Maria Gonzalez',
  'DEMO Construction Importers',
  'Peru',
  'WhatsApp / Inquiry',
  'Peru Light Steel Keel Inquiry',
  'Customer asks for drywall galvanized steel profiles. Thickness, quantity split, packing and private label details are not confirmed.',
  'en',
  'needs_more_info',
  'high',
  'medium',
  'medium',
  'demo_operator',
  '2026-06-22 09:00:00+00',
  '2026-06-22 09:00:00+00',
  '2026-06-22 09:00:00+00'
),
(
  '21000000-0000-4000-8000-000000000002',
  'email',
  null,
  null,
  null,
  'Daniel Wong',
  'DEMO Building Materials Asia',
  'Indonesia',
  'Email',
  'Indonesia Ceiling System Inquiry',
  'Customer asks about ceiling system options. Drawing, material option, thickness and target port are not confirmed.',
  'en',
  'supplier_confirm_needed',
  'medium',
  'medium',
  'medium',
  'demo_operator',
  '2026-06-22 09:15:00+00',
  '2026-06-22 09:15:00+00',
  '2026-06-22 09:15:00+00'
),
(
  '21000000-0000-4000-8000-000000000003',
  'email',
  null,
  null,
  null,
  'Carlos Ramirez',
  'DEMO Developer Contact',
  'Ecuador',
  'Email',
  'Ecuador Window Measurement Issue',
  'Customer asks about aluminum window/door project measurements. Project location, drawings and installation responsibility need clarification.',
  'en',
  'needs_more_info',
  'medium',
  'medium',
  'medium',
  'demo_operator',
  '2026-06-22 09:30:00+00',
  '2026-06-22 09:30:00+00',
  '2026-06-22 09:30:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_product_classifications (
  id,
  inquiry_intelligence_request_id,
  primary_category,
  secondary_category,
  product_family,
  material,
  likely_process,
  supplier_type_needed,
  classification_confidence,
  classification_notes,
  created_at
) values
(
  '22000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'Light Steel Keel',
  'Drywall Profile',
  'Drywall galvanized steel profiles',
  'galvanized steel',
  'roll forming / cutting / packing',
  'steel profile roll-forming factory',
  'medium',
  'Classification is based on demo inquiry wording and requires human review before supplier matching.',
  '2026-06-22 09:00:00+00'
),
(
  '22000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000002',
  'Ceiling System',
  'Aluminum Ceiling / Light Steel Keel',
  'Ceiling system profiles and panels',
  'aluminum / galvanized steel',
  'extrusion / roll forming / surface treatment',
  'ceiling system supplier',
  'medium',
  'Product option and material are not confirmed. Supplier review is needed before quotation work.',
  '2026-06-22 09:15:00+00'
),
(
  '22000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000003',
  'Aluminum Window/Door',
  'Project measurement / installation clarification',
  'Aluminum window and door system',
  'aluminum + glass',
  'profile cutting / assembly / glazing',
  'aluminum window factory / installation consultant',
  'medium',
  'Project responsibility and measurement scope must be clarified before any quotation judgment.',
  '2026-06-22 09:30:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_missing_information (
  id,
  inquiry_intelligence_request_id,
  info_type,
  info_label,
  required_level,
  status,
  reason,
  created_at
) values
(
  '23000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'thickness',
  'Profile thickness',
  'required',
  'missing',
  'Formal quote is blocked until thickness is confirmed.',
  '2026-06-22 09:00:00+00'
),
(
  '23000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000001',
  'quantity_breakdown',
  'Quantity by profile type',
  'required',
  'missing',
  'Weight and loading cannot be reviewed without quantity split.',
  '2026-06-22 09:01:00+00'
),
(
  '23000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000001',
  'packing',
  'Packing preference',
  'recommended',
  'needs_review',
  'Packing affects supplier confirmation and loading assumptions.',
  '2026-06-22 09:02:00+00'
),
(
  '23000000-0000-4000-8000-000000000004',
  '21000000-0000-4000-8000-000000000001',
  'target_port',
  'Target port',
  'recommended',
  'confirmed',
  'Callao appears in the demo inquiry and still needs Paul review before freight assumptions.',
  '2026-06-22 09:03:00+00'
),
(
  '23000000-0000-4000-8000-000000000005',
  '21000000-0000-4000-8000-000000000002',
  'drawing',
  'Drawing or selected option',
  'required',
  'needs_review',
  'Ceiling system option must be reviewed before supplier confirmation.',
  '2026-06-22 09:15:00+00'
),
(
  '23000000-0000-4000-8000-000000000006',
  '21000000-0000-4000-8000-000000000002',
  'thickness',
  'Panel/profile thickness',
  'required',
  'missing',
  'Material and thickness affect supplier category and quotation basis.',
  '2026-06-22 09:16:00+00'
),
(
  '23000000-0000-4000-8000-000000000007',
  '21000000-0000-4000-8000-000000000002',
  'specification',
  'Option selection',
  'required',
  'needs_review',
  'The inquiry may refer to different ceiling systems and requires clarification.',
  '2026-06-22 09:17:00+00'
),
(
  '23000000-0000-4000-8000-000000000008',
  '21000000-0000-4000-8000-000000000003',
  'installation_responsibility',
  'Installation responsibility',
  'required',
  'needs_review',
  'Supply-only and installation-related expectations must be separated before quotation discussion.',
  '2026-06-22 09:30:00+00'
),
(
  '23000000-0000-4000-8000-000000000009',
  '21000000-0000-4000-8000-000000000003',
  'project_location',
  'Project location',
  'required',
  'missing',
  'Project location affects specification, logistics and responsibility review.',
  '2026-06-22 09:31:00+00'
),
(
  '23000000-0000-4000-8000-000000000010',
  '21000000-0000-4000-8000-000000000003',
  'drawing',
  'Drawing or photo',
  'recommended',
  'missing',
  'Window and door dimensions require drawings or photos before supplier review.',
  '2026-06-22 09:32:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_quotation_readiness (
  id,
  inquiry_intelligence_request_id,
  readiness_status,
  can_prepare_budget_estimate,
  can_prepare_formal_quote,
  quote_blockers,
  assumption_needed,
  risk_if_quoted_now,
  confidence_level,
  created_at
) values
(
  '24000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'blocked_by_missing_info',
  true,
  false,
  'Missing thickness, quantity split, packing preference and supplier confirmation.',
  'Budget estimate could only use explicit assumptions and Paul review.',
  'Wrong weight, loading plan, or price expectation.',
  'medium',
  '2026-06-22 09:04:00+00'
),
(
  '24000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000002',
  'supplier_confirm_needed',
  false,
  false,
  'Ceiling option, material, thickness and target port are not confirmed.',
  'Supplier option and material confirmation are needed first.',
  'Wrong product option or material assumption.',
  'medium',
  '2026-06-22 09:18:00+00'
),
(
  '24000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000003',
  'not_ready',
  false,
  false,
  'Project location, drawings and installation responsibility are unclear.',
  'Clarify supply scope and measurement responsibility first.',
  'Responsibility misunderstanding, wrong size, or delivery expectation risk.',
  'medium',
  '2026-06-22 09:33:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_supplier_rfq_requirements (
  id,
  inquiry_intelligence_request_id,
  supplier_required,
  supplier_category,
  rfq_needed,
  rfq_reason,
  supplier_questions,
  priority_level,
  created_at
) values
(
  '25000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  true,
  'steel profile roll-forming factory',
  true,
  'Need to confirm material thickness, unit weight, MOQ, packing, 20GP loading, FOB cost and production lead time.',
  'Can you make this drywall profile? Please confirm material/thickness, unit weight, MOQ, packing, loading quantity, lead time and price basis.',
  'high',
  '2026-06-22 09:05:00+00'
),
(
  '25000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000002',
  true,
  'ceiling system supplier',
  true,
  'Ceiling option and material are unclear and require supplier technical review.',
  'Please confirm whether this ceiling system option can be supplied, material choices, panel/profile thickness, MOQ, packing and lead time.',
  'medium',
  '2026-06-22 09:19:00+00'
),
(
  '25000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000003',
  false,
  'aluminum window factory / installation consultant',
  false,
  'Supplier confirmation may be needed later after drawings and responsibility scope are clarified.',
  'Later supplier questions may include profile system, glass option, hardware, packing and lead time after drawings are available.',
  'medium',
  '2026-06-22 09:34:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_reply_drafts (
  id,
  inquiry_intelligence_request_id,
  language,
  channel,
  draft_subject,
  draft_body,
  draft_status,
  safety_notes,
  requires_approval,
  created_at,
  updated_at
) values
(
  '26000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'en',
  'email',
  'Details needed for your drywall profile inquiry',
  'Dear Maria, thank you for your inquiry. Before preparing any quotation review, could you please confirm the profile thickness, drawing or photo, exact quantity by profile type, packing preference, and whether private label is required?',
  'draft',
  'Draft only. Paul must review before any external use.',
  true,
  '2026-06-22 09:06:00+00',
  '2026-06-22 09:06:00+00'
),
(
  '26000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000002',
  'en',
  'email',
  'Confirming ceiling system details',
  'Dear Daniel, thank you for your ceiling system inquiry. Could you please confirm the drawing or selected product option, material preference, thickness, quantity and target port so our team can review the suitable supplier direction?',
  'needs_review',
  'Draft only. Supplier confirmation and Paul review are required before quotation work.',
  true,
  '2026-06-22 09:20:00+00',
  '2026-06-22 09:20:00+00'
),
(
  '26000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000003',
  'es',
  'email',
  'Aclaracion sobre medidas y alcance del proyecto',
  'Estimado Carlos, gracias por la informacion del proyecto. Antes de revisar posibilidades de cotizacion, podria confirmar los planos, medidas, ubicacion del proyecto y si CBM solo suministra materiales o tambien debe revisar temas de instalacion?',
  'draft',
  'Draft only. Responsibility boundary must be reviewed before any external use.',
  true,
  '2026-06-22 09:35:00+00',
  '2026-06-22 09:35:00+00'
)
on conflict (id) do nothing;

insert into public.inquiry_intelligence_reviews (
  id,
  inquiry_intelligence_request_id,
  reviewer,
  review_status,
  decision,
  reviewer_notes,
  approved_next_action,
  reviewed_at,
  created_at
) values
(
  '27000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000001',
  'Paul',
  'pending',
  'request_more_info',
  '',
  'Ask customer for thickness, drawing/photo, quantity split, packing and private label details.',
  null,
  '2026-06-22 09:07:00+00'
),
(
  '27000000-0000-4000-8000-000000000002',
  '21000000-0000-4000-8000-000000000002',
  'Paul',
  'pending',
  'prepare_supplier_rfq',
  '',
  'Prepare supplier questions after customer confirms ceiling system option and target port.',
  null,
  '2026-06-22 09:21:00+00'
),
(
  '27000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000003',
  'Paul',
  'pending',
  'request_more_info',
  '',
  'Clarify project location, drawings and installation responsibility before supplier or quote review.',
  null,
  '2026-06-22 09:36:00+00'
)
on conflict (id) do nothing;
