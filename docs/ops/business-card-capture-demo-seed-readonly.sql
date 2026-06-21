-- Business Card Capture DEMO seed data for read-only trial review.
-- Fictional DEMO records only. Do not use real customer data in this seed pack.

insert into public.card_capture_sources (
  id,
  source_type,
  source_label,
  original_filename,
  captured_channel,
  captured_at,
  uploaded_by,
  processing_status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'trade_show_card',
    'DEMO_TRADE_SHOW_CARD_PERU',
    'demo-peru-business-card.jpg',
    'manual_upload',
    '2026-06-21T09:00:00+08:00',
    'demo_operator',
    'needs_review'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'trade_show_card',
    'DEMO_TRADE_SHOW_CARD_PANAMA',
    'demo-panama-business-card.jpg',
    'manual_upload',
    '2026-06-21T09:10:00+08:00',
    'demo_operator',
    'needs_review'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'whatsapp_contact_image',
    'DEMO_WHATSAPP_CONTACT_INDONESIA',
    'demo-indonesia-contact.png',
    'manual_upload',
    '2026-06-21T09:20:00+08:00',
    'demo_operator',
    'extracted'
  )
on conflict (id) do nothing;

insert into public.card_extraction_results (
  id,
  capture_source_id,
  extracted_name,
  extracted_company,
  extracted_title,
  extracted_email,
  extracted_phone,
  extracted_whatsapp,
  extracted_website,
  extracted_country,
  extracted_address,
  extracted_business_type,
  extracted_product_interest,
  raw_extraction_json,
  confidence_level,
  extraction_provider,
  extraction_language,
  extraction_notes
) values
  (
    '11111111-aaaa-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Project Manager',
    'carlos.ramirez@example.com',
    '+51 900 000 000',
    '+51 900 000 000',
    'www.demo-facade.example',
    'Peru',
    'Lima, Peru',
    'facade contractor',
    'aluminum windows and facade systems',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'medium',
    'manual_demo',
    'en',
    'DEMO extraction. Email, phone, company and product interest require human review.'
  ),
  (
    '22222222-aaaa-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Purchasing Manager',
    'maria.gonzalez@example.com',
    '+507 6000 0000',
    '+507 6000 0000',
    'www.demo-importers.example',
    'Panama',
    'Panama City, Panama',
    'construction material importer',
    'glass and aluminum accessories',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'medium',
    'manual_demo',
    'es',
    'DEMO extraction. Possible duplicate requires human review.'
  ),
  (
    '33333333-aaaa-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Distributor',
    null,
    '+62 800 0000 0000',
    '+62 800 0000 0000',
    null,
    'Indonesia',
    'Jakarta, Indonesia',
    'distributor',
    'ceiling system and light steel keel',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'low',
    'manual_demo',
    'en',
    'DEMO extraction. Website and email are missing.'
  )
on conflict (id) do nothing;

insert into public.customer_profile_drafts (
  id,
  capture_source_id,
  extraction_result_id,
  proposed_customer_name,
  proposed_company_name,
  proposed_country,
  proposed_email,
  proposed_phone,
  proposed_whatsapp,
  proposed_website,
  proposed_customer_type,
  proposed_product_interest,
  source_channel,
  confidence_level,
  duplicate_status,
  risk_level,
  review_status,
  reviewer_notes
) values
  (
    '11111111-bbbb-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '11111111-aaaa-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Peru',
    'carlos.ramirez@example.com',
    '+51 900 000 000',
    '+51 900 000 000',
    'www.demo-facade.example',
    'facade contractor',
    'aluminum windows and facade systems',
    'trade_show_card',
    'medium',
    'not_checked',
    'medium',
    'needs_review',
    'DEMO draft only. Do not create customer until Paul reviews contact and project context.'
  ),
  (
    '22222222-bbbb-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '22222222-aaaa-4222-8222-222222222222',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Panama',
    'maria.gonzalez@example.com',
    '+507 6000 0000',
    '+507 6000 0000',
    'www.demo-importers.example',
    'construction material importer',
    'glass and aluminum accessories',
    'trade_show_card',
    'medium',
    'possible_duplicate',
    'medium',
    'needs_review',
    'DEMO draft only. Possible duplicate should be reviewed before any customer profile is created.'
  ),
  (
    '33333333-bbbb-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '33333333-aaaa-4333-8333-333333333333',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Indonesia',
    null,
    '+62 800 0000 0000',
    '+62 800 0000 0000',
    null,
    'distributor',
    'ceiling system and light steel keel',
    'whatsapp_contact_image',
    'low',
    'not_checked',
    'medium',
    'draft',
    'DEMO draft only. Email and website are missing.'
  )
on conflict (id) do nothing;

insert into public.card_duplicate_checks (
  id,
  customer_profile_draft_id,
  match_type,
  match_entity_type,
  match_entity_id,
  match_label,
  match_confidence,
  match_reason
) values
  (
    '11111111-cccc-4111-8111-111111111111',
    '11111111-bbbb-4111-8111-111111111111',
    'none_detected_demo',
    'customer',
    null,
    'No DEMO duplicate detected',
    'low',
    'DEMO record has not been checked against real customer data.'
  ),
  (
    '22222222-cccc-4222-8222-222222222222',
    '22222222-bbbb-4222-8222-222222222222',
    'possible_company_match',
    'customer',
    null,
    'Possible DEMO company-name similarity',
    'medium',
    'Company name resembles an importer profile and requires human review.'
  ),
  (
    '33333333-cccc-4333-8333-333333333333',
    '33333333-bbbb-4333-8333-333333333333',
    'insufficient_contact_data',
    'customer',
    null,
    'Missing email and website',
    'low',
    'Not enough contact fields to complete duplicate review.'
  )
on conflict (id) do nothing;

insert into public.card_followup_drafts (
  id,
  customer_profile_draft_id,
  language,
  channel,
  subject,
  body,
  tone,
  review_status,
  risk_notes
) values
  (
    '11111111-dddd-4111-8111-111111111111',
    '11111111-bbbb-4111-8111-111111111111',
    'en',
    'email',
    'Nice to meet you at the exhibition',
    'Hi Carlos, nice to meet you at the exhibition. We mainly supply aluminum windows, facade systems, glass and related building materials. May I know what kind of project or product you are currently looking for?',
    'polite_intro',
    'draft',
    'Draft only. Paul must review before sending.'
  ),
  (
    '22222222-dddd-4222-8222-222222222222',
    '22222222-bbbb-4222-8222-222222222222',
    'es',
    'email',
    'Seguimiento de productos de vidrio y aluminio',
    'Hola Maria, fue un gusto conocerle. Podemos revisar productos de vidrio, accesorios de aluminio y materiales para construcción. Antes de continuar, ¿podría confirmar qué tipo de proyecto está evaluando?',
    'polite_intro',
    'needs_review',
    'Spanish draft only. Human review required before use.'
  ),
  (
    '33333333-dddd-4333-8333-333333333333',
    '33333333-bbbb-4333-8333-333333333333',
    'en',
    'whatsapp',
    'Ceiling system inquiry follow-up',
    'Hi Daniel, thanks for sharing your contact. We can review ceiling system and light steel keel requirements. Could you share your target specification, quantity and destination?',
    'polite_intro',
    'draft',
    'Draft only. Email and website are missing.'
  )
on conflict (id) do nothing;
