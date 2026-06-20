# Knowledge Base Safety And Privacy Plan

## Purpose

Define safety and privacy boundaries for the future Knowledge Base.

This plan protects CBM Trade OS from treating unverified, stale, confidential, or AI-generated knowledge as safe business truth.

## Main Risks

- hallucinated knowledge
- stale or outdated rules
- confidential internal rules exposed
- unverified AI summary trusted
- price or margin leakage
- supplier commitment leakage
- customer private data misuse
- accidental customer-facing output
- private file content exposure
- storage path or signed URL leakage

## Safety Controls

Future implementation should require:

- source required
- verification required
- visibility scope
- risk level
- expiration/review dates
- internal/customer-safe labeling
- no auto-send
- no auto-quote
- no unverified external output
- no raw private file content in UI
- no secret logging

## Privacy Rules

- Do not store unnecessary personal data in general knowledge.
- Avoid sensitive customer data in reusable knowledge.
- Keep project-specific data linked but scoped.
- Do not expose private file content to customer output.
- Do not expose storage paths, signed URLs, private bucket names, or raw file content.
- Use safe linked labels instead of copying full customer or file details into general knowledge records.

## RAG Safety Later

Future RAG must:

- retrieve verified knowledge first
- filter confidential/internal-only records from customer-facing output
- cite sources
- show confidence
- show verification state
- show freshness/expiration warnings
- refuse or ask a human when source evidence is weak
- never invent price, payment terms, delivery time, supplier capability, or supplier commitment

RAG should not run until taxonomy, source tracking, human verification, visibility scope, and privacy boundaries are implemented and reviewed.

## Operational Controls

Future operational controls should include:

- audit log later
- usage logs
- review queue
- stale knowledge alerts
- role-based access later
- source/version tracking
- human feedback loop for AI usage

## Non-goals

- No legal advice engine.
- No medical advice.
- No financial advice.
- No autonomous customer commitment.
- No autonomous supplier commitment.
- No autonomous quotation, PI, order, payment, production, or shipment execution.
