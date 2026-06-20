-- CBM Trade OS Knowledge Base DEMO seed data
-- Scope: insert safe DEMO_ categories and read-only sample knowledge items.
-- Safety: insert-only sample records, no real customer data, no supplier promise, no price commitment.

with demo_categories(slug, name_zh, name_en, description, sort_order) as (
  values
    ('DEMO_PRODUCT_KNOWLEDGE', '产品知识', 'Product Knowledge', 'DEMO product and specification knowledge for read-only trial display.', 10),
    ('DEMO_SUPPLIER_KNOWLEDGE', '供应商知识', 'Supplier Knowledge', 'DEMO supplier capability notes for internal review only.', 20),
    ('DEMO_QUOTATION_RULES', '报价规则', 'Quotation Rules', 'DEMO quotation readiness and manual confirmation rules.', 30),
    ('DEMO_FILE_KNOWLEDGE', '文件知识', 'File Knowledge', 'DEMO file and document source tracking rules.', 40),
    ('DEMO_COMMUNICATION_TEMPLATES', '沟通模板', 'Communication Templates', 'DEMO customer and supplier communication principles.', 50),
    ('DEMO_TRADE_SOP', '贸易 SOP', 'Trade SOP', 'DEMO operating procedures for internal workflow review.', 60),
    ('DEMO_COMPLIANCE_SAFETY', '合规与安全', 'Compliance And Safety', 'DEMO safety boundaries for AI-assisted workflows.', 70)
)
insert into public.knowledge_categories (slug, name_zh, name_en, description, sort_order)
select slug, name_zh, name_en, description, sort_order
from demo_categories
where not exists (
  select 1 from public.knowledge_categories existing
  where existing.slug = demo_categories.slug
);

with demo_items(
  title,
  category_slug,
  language,
  summary,
  content,
  source_type,
  source_reference,
  confidence_level,
  human_verified,
  verification_status,
  risk_level,
  visibility_scope,
  tags
) as (
  values
    (
      'Aluminum window inquiry checklist',
      'DEMO_PRODUCT_KNOWLEDGE',
      'en',
      'Check drawings, opening size, profile system, glass, hardware, color, quantity, and destination before quote readiness.',
      'DEMO guidance only. Aluminum window inquiries should be reviewed for drawings, measurements, glass, hardware, finish, quantity, packing, and destination before any quotation judgment.',
      'manual_sop',
      'DEMO_SOP_WINDOW_CHECKLIST',
      'high',
      true,
      'verified',
      'medium',
      'ai_reference_only',
      array['DEMO', 'window', 'inquiry', 'checklist']
    ),
    (
      'Curtain wall quotation readiness checklist',
      'DEMO_PRODUCT_KNOWLEDGE',
      'en',
      'Curtain wall inquiries require elevation drawings, system type, glass specification, aluminum finish, quantity area, and installation responsibility confirmation.',
      'DEMO guidance only. Curtain wall quotation readiness depends on project drawings, facade system, glass, aluminum finish, quantity/area, installation scope, and human review.',
      'manual_sop',
      'DEMO_SOP_CURTAIN_WALL_READINESS',
      'medium',
      false,
      'needs_review',
      'high',
      'internal_only',
      array['DEMO', 'curtain_wall', 'quote_readiness']
    ),
    (
      'Light steel keel quotation assumptions',
      'DEMO_PRODUCT_KNOWLEDGE',
      'en',
      'Light steel keel quotes should separate material model, thickness, length, quantity, packing, and destination; assumptions must be reviewed.',
      'DEMO guidance only. Any assumptions about thickness, zinc coating, packing, loading weight, and trade term need human confirmation before customer use.',
      'quotation_note',
      'DEMO_QUOTE_LIGHT_STEEL_KEEL_ASSUMPTIONS',
      'medium',
      false,
      'needs_review',
      'medium',
      'ai_reference_only',
      array['DEMO', 'light_steel_keel', 'quotation']
    ),
    (
      'Ceiling system option comparison',
      'DEMO_PRODUCT_KNOWLEDGE',
      'en',
      'Ceiling system comparison should distinguish product type, panel size, suspension system, finish, fire rating needs, and installation notes.',
      'DEMO guidance only. Ceiling options should be compared by product type, size, finish, support system, project usage, and standards before recommendation.',
      'product_catalog',
      'DEMO_CATALOG_CEILING_OPTIONS',
      'medium',
      false,
      'draft',
      'low',
      'internal_only',
      array['DEMO', 'ceiling', 'product_options']
    ),
    (
      'Supplier capability matching rule',
      'DEMO_SUPPLIER_KNOWLEDGE',
      'en',
      'Supplier matching should consider product category, process, MOQ, surface treatment, packaging, quality risk, and recent manual confirmation.',
      'DEMO guidance only. Supplier capability notes are not production promises. Capacity, price, quality responsibility, and delivery must be reconfirmed manually.',
      'supplier_record',
      'DEMO_SUPPLIER_MATCHING_RULE',
      'medium',
      false,
      'needs_review',
      'high',
      'internal_only',
      array['DEMO', 'supplier', 'capability', 'manual_confirmation']
    ),
    (
      'FOB Qingdao quotation cost reminder',
      'DEMO_QUOTATION_RULES',
      'en',
      'FOB Qingdao quote preparation should confirm local port cost assumptions, export handling, packing, loading, and validity before customer use.',
      'DEMO guidance only. This reminder is not a price calculation and must not be sent as a customer quote. Human review is required.',
      'quotation_note',
      'DEMO_QUOTE_FOB_QINGDAO_REMINDER',
      'medium',
      false,
      'needs_review',
      'high',
      'confidential',
      array['DEMO', 'FOB', 'Qingdao', 'quotation_rule']
    ),
    (
      'Tax-inclusive vs non-tax quotation note',
      'DEMO_QUOTATION_RULES',
      'en',
      'Tax-inclusive and non-tax supplier quotes must be separated internally and reviewed before customer quotation preparation.',
      'DEMO guidance only. Internal supplier tax treatment should not be exposed to the customer unless a controlled document workflow explicitly allows it.',
      'manual_sop',
      'DEMO_QUOTE_TAX_SCOPE_NOTE',
      'medium',
      false,
      'needs_review',
      'high',
      'confidential',
      array['DEMO', 'tax', 'quotation_rule', 'internal_only']
    ),
    (
      'Customer complaint handling principle',
      'DEMO_COMMUNICATION_TEMPLATES',
      'en',
      'Complaint responses should acknowledge receipt, request evidence, avoid responsibility judgment, and route to human review.',
      'DEMO guidance only. Complaint replies are draft-only and must avoid compensation, blame, responsibility judgment, or formal promise without human approval.',
      'email_template',
      'DEMO_TEMPLATE_COMPLAINT_HANDLING',
      'high',
      true,
      'verified',
      'high',
      'customer_safe_after_review',
      array['DEMO', 'complaint', 'communication', 'human_review']
    ),
    (
      'Delay explanation template principle',
      'DEMO_COMMUNICATION_TEMPLATES',
      'en',
      'Delay explanations should be factual, reviewed by a human, and avoid unapproved compensation, blame, or delivery promises.',
      'DEMO guidance only. Delay communication should stay factual and draft-only until reviewed.',
      'email_template',
      'DEMO_TEMPLATE_DELAY_EXPLANATION',
      'medium',
      false,
      'needs_review',
      'high',
      'customer_safe_after_review',
      array['DEMO', 'delay', 'communication', 'draft_only']
    ),
    (
      'Installation manual source tracking rule',
      'DEMO_FILE_KNOWLEDGE',
      'en',
      'Installation manual knowledge should cite document title, version/date when known, linked product, and verification status.',
      'DEMO guidance only. File-derived knowledge should not expose storage paths, signed URLs, private bucket names, or raw confidential content.',
      'installation_manual',
      'DEMO_FILE_INSTALLATION_MANUAL_SOURCE_RULE',
      'medium',
      false,
      'draft',
      'medium',
      'ai_reference_only',
      array['DEMO', 'file_knowledge', 'source_tracking']
    ),
    (
      'AI prospecting compliance rule',
      'DEMO_COMPLIANCE_SAFETY',
      'en',
      'AI prospecting suggestions must be source-reviewed, opt-out aware, and never auto-send outreach.',
      'DEMO guidance only. Prospecting remains planning and draft-only. Do not create customers, scrape private data, or send messages automatically.',
      'manual_sop',
      'DEMO_COMPLIANCE_AI_PROSPECTING',
      'high',
      true,
      'verified',
      'high',
      'internal_only',
      array['DEMO', 'prospecting', 'compliance', 'no_auto_send']
    ),
    (
      'No auto-send / no price commitment rule',
      'DEMO_COMPLIANCE_SAFETY',
      'en',
      'AI may draft and summarize, but it must not send messages, confirm prices, confirm payment terms, or commit delivery without human approval.',
      'DEMO guidance only. This is a core safety boundary for AI-first workflow: draft, summarize, compare, and flag risk only; human approval is required for business commitments.',
      'manual_sop',
      'DEMO_COMPLIANCE_NO_AUTO_SEND_PRICE_COMMITMENT',
      'high',
      true,
      'verified',
      'high',
      'internal_only',
      array['DEMO', 'safety', 'no_auto_send', 'no_price_commitment']
    )
)
insert into public.knowledge_items (
  title,
  category_id,
  language,
  summary,
  content,
  source_type,
  source_reference,
  confidence_level,
  human_verified,
  verification_status,
  risk_level,
  visibility_scope,
  tags
)
select
  demo_items.title,
  categories.id,
  demo_items.language,
  demo_items.summary,
  demo_items.content,
  demo_items.source_type,
  demo_items.source_reference,
  demo_items.confidence_level,
  demo_items.human_verified,
  demo_items.verification_status,
  demo_items.risk_level,
  demo_items.visibility_scope,
  demo_items.tags
from demo_items
join public.knowledge_categories categories on categories.slug = demo_items.category_slug
where not exists (
  select 1 from public.knowledge_items existing
  where existing.source_reference = demo_items.source_reference
);

insert into public.knowledge_sources (
  knowledge_item_id,
  source_type,
  source_title,
  source_notes,
  captured_at
)
select
  items.id,
  items.source_type,
  items.source_reference,
  'DEMO source metadata for read-only Knowledge Base trial.',
  now()
from public.knowledge_items items
where items.source_reference like 'DEMO_%'
  and not exists (
    select 1 from public.knowledge_sources existing
    where existing.knowledge_item_id = items.id
      and existing.source_title = items.source_reference
  );

insert into public.knowledge_reviews (
  knowledge_item_id,
  review_status,
  reviewer_name,
  review_notes,
  reviewed_at
)
select
  items.id,
  items.verification_status,
  case when items.human_verified then 'DEMO_REVIEWER' else null end,
  case
    when items.human_verified then 'DEMO generic safety item marked verified for read-only trial.'
    else 'DEMO item requires human review before trusted use.'
  end,
  case when items.human_verified then now() else null end
from public.knowledge_items items
where items.source_reference like 'DEMO_%'
  and not exists (
    select 1 from public.knowledge_reviews existing
    where existing.knowledge_item_id = items.id
  );
