-- AI Follow-up Assistant fictional DEMO seed data.
-- Inserts preview-only follow-up records into followup_* tables.
-- Does not create real tasks, send messages, call AI providers, mutate
-- customers/inquiries, or trigger quotation/PI/order/payment/production/
-- shipment actions.

insert into public.followup_candidates (
  id,
  source_type,
  source_entity_id,
  customer_name,
  company_name,
  contact_name,
  country,
  language,
  followup_reason,
  current_stage,
  priority_level,
  risk_level,
  confidence_level,
  status,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'manual_note',
    '21111111-1111-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Carlos Ramirez',
    'Peru',
    'en',
    'Missing project location and specifications before any quotation judgment.',
    'information_request',
    'high',
    'medium',
    'medium',
    'needs_review',
    now(),
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'customer_verification',
    '21111111-1111-4111-8111-111111111112',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Maria Gonzalez',
    'Panama',
    'es',
    'Possible duplicate customer; review identity and company details before follow-up.',
    'risk_hold',
    'medium',
    'medium',
    'medium',
    'needs_review',
    now(),
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111113',
    'business_card',
    '21111111-1111-4111-8111-111111111113',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Daniel Wong',
    'Indonesia',
    'en',
    'Dormant or prospecting lead needs website and buyer role before deeper follow-up.',
    'dormant',
    'low',
    'medium',
    'low',
    'draft',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.followup_missing_information (
  id,
  followup_candidate_id,
  info_type,
  info_label,
  required_level,
  status,
  notes,
  created_at
) values
  (
    '12111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'project_location',
    'Project location',
    'required',
    'missing',
    'Needed before checking shipping route, local requirements, or quotation readiness.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111111',
    'product_specification',
    'Window/profile specification',
    'required',
    'missing',
    'Ask for drawings, photos, profile series, finish/color, and size details.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111111',
    'quantity',
    'Target quantity',
    'recommended',
    'missing',
    'Quantity is needed before any supplier or quotation preparation.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111114',
    '11111111-1111-4111-8111-111111111111',
    'buyer_role',
    'Buyer role',
    'recommended',
    'needs_review',
    'Clarify whether the contact is owner, contractor, importer, or purchasing agent.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111115',
    '11111111-1111-4111-8111-111111111112',
    'company_website',
    'Company website',
    'recommended',
    'missing',
    'Possible duplicate/customer identity context should be reviewed first.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111116',
    '11111111-1111-4111-8111-111111111112',
    'buyer_role',
    'Buyer role',
    'recommended',
    'needs_review',
    'Ask for role and project relation before sharing detailed commercial information.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111117',
    '11111111-1111-4111-8111-111111111113',
    'company_website',
    'Company website',
    'required',
    'missing',
    'Needed before deeper business follow-up.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111118',
    '11111111-1111-4111-8111-111111111113',
    'buyer_role',
    'Buyer role',
    'required',
    'missing',
    'Clarify decision role and project relevance.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111119',
    '11111111-1111-4111-8111-111111111113',
    'project_location',
    'Project location',
    'optional',
    'not_required',
    'Optional until the lead becomes active again.',
    now()
  )
on conflict (id) do nothing;

insert into public.followup_recommendations (
  id,
  followup_candidate_id,
  recommended_action,
  recommendation_reason,
  suggested_timing,
  priority_level,
  risk_level,
  confidence_level,
  created_at
) values
  (
    '13111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'request_more_information',
    'Project location, product specifications, target quantity, and buyer role are still missing.',
    'within 24 hours',
    'high',
    'medium',
    'medium',
    now()
  ),
  (
    '13111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'hold_due_to_risk',
    'Possible duplicate and unclear buyer role should be reviewed before follow-up.',
    'after duplicate review',
    'medium',
    'medium',
    'medium',
    now()
  ),
  (
    '13111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'mark_low_priority',
    'Dormant/prospecting lead with low confidence; request basic company context only if useful.',
    '30-60 days or after clarification',
    'low',
    'medium',
    'low',
    now()
  )
on conflict (id) do nothing;

insert into public.followup_message_drafts (
  id,
  followup_candidate_id,
  language,
  channel,
  tone,
  draft_subject,
  draft_body,
  draft_status,
  safety_notes,
  requires_approval,
  created_at,
  updated_at
) values
  (
    '14111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'en',
    'email',
    'professional',
    'Project details for your aluminum window inquiry',
    'Draft only - not sent - human approval required\n\nHello Carlos,\n\nThank you for your aluminum window inquiry. To review the most suitable solution, could you please share the project location, product specifications or drawings/photos, target quantity, and your role in the project?\n\nWith these details, we can review the requirements more accurately before deciding the next step.\n\nBest regards,\nPaul',
    'draft',
    'Draft only. Not sent. Human approval required before any external message.',
    true,
    now(),
    now()
  ),
  (
    '14111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'es',
    'email',
    'professional',
    'Confirmacion de empresa y proyecto',
    'Draft only - not sent - human approval required\n\nHola Maria,\n\nMuchas gracias por su consulta. Para entender mejor su proyecto, podria compartir el sitio web de su empresa y su rol en este proyecto?\n\nCon esta informacion podremos revisar mejor el contexto antes de preparar el siguiente paso.\n\nSaludos,\nPaul',
    'draft',
    'Draft only. Do not mention duplicate risk to the customer. Human approval required.',
    true,
    now(),
    now()
  ),
  (
    '14111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'en',
    'email',
    'concise',
    'Checking your aluminum building materials interest',
    'Draft only - not sent - human approval required\n\nHello Daniel,\n\nI wanted to check whether you are still reviewing aluminum building materials for upcoming projects. If convenient, could you share your company website and your role in the purchasing process?\n\nBest regards,\nPaul',
    'draft',
    'Draft only. Low-priority follow-up. Human approval required.',
    true,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.followup_reviews (
  id,
  followup_candidate_id,
  reviewer,
  review_status,
  decision,
  reviewer_notes,
  approved_next_action,
  reviewed_at,
  created_at
) values
  (
    '15111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Paul',
    'pending',
    null,
    'Pending Paul review before any follow-up action.',
    null,
    null,
    now()
  ),
  (
    '15111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'Paul',
    'pending',
    null,
    'Possible duplicate context requires manual review.',
    null,
    null,
    now()
  ),
  (
    '15111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'Paul',
    'pending',
    null,
    'Low-confidence dormant lead; review before follow-up.',
    null,
    null,
    now()
  )
on conflict (id) do nothing;
