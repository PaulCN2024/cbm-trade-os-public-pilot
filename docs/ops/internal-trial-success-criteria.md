# Internal Trial Success Criteria

## Purpose

This document defines what counts as a successful internal read-only trial for CBM Trade OS before the project moves toward controlled-write planning.

The goal is not to prove that the system can execute business actions. The goal is to prove that Paul can use the production Admin UI to review realistic workflow data safely, understand what needs attention, and provide actionable feedback.

## Success Criteria Overview

The trial is successful when the Admin UI is:

- useful enough for Paul to review the foreign-trade workflow
- clear enough for a Chinese business operator
- safe enough that no write or business execution is implied
- stable enough for repeated review
- structured enough to produce prioritized next tasks

## Functional Success Criteria

The trial should pass when:

- all key sections load without fatal JavaScript failure
- 工作台 renders by default
- 询盘, 客户, AI 复核, 供应商, 制造能力, 文件中心, 报价前复核, 正式报价元数据, 订单, 生产, 发货, 售后, and 设置 are reachable
- read-only data or static fallback data is understandable
- admin-read routes are not missing unexpectedly
- fallback/static preview states are clearly labeled
- no `undefined` or `null` appears in normal UI text
- no horizontal overflow blocks normal review
- no active unsafe controls appear in read-only areas
- no sensitive internal fields are exposed in customer-facing or trial-visible contexts

## Business Usability Success Criteria

The trial should pass when Paul can answer:

- Which inquiries need attention?
- Which customers need follow-up?
- Which AI drafts or communications need human review?
- Which supplier or manufacturing capability items require caution?
- Which files or attachments need manual review?
- Which pre-quotation records are blocked by missing information?
- Which quotation metadata records are safe to inspect but not execute?
- Which actions are disabled and why?

The wording should feel natural for Chinese business operators and should match real foreign-trade workflow language rather than generic CRM labels.

## Safety Success Criteria

The trial should pass only if the UI does not enable or imply:

- real sending
- auto approval
- RFQ sending
- quotation generation
- PI generation
- order confirmation
- payment confirmation
- production confirmation
- shipment confirmation
- file upload/download/delete
- task creation
- customer, supplier, or factory commitment

Disabled actions should remain visibly disabled or informational. Trial wording should not imply confirmed price, confirmed delivery time, supplier commitment, quotation commitment, PI commitment, order commitment, payment commitment, production commitment, or shipment commitment.

## Feedback Success Criteria

The trial should produce:

- at least one completed manual feedback pass from Paul
- section-level scores or notes
- prioritized issues using `P0`, `P1`, `P2`, and `P3`
- screenshot or video evidence when safe
- a short list of highest-value next UI or data fixes
- a next Codex prompt generated from the feedback instead of random feature growth

## Readiness Score Guide

| Score | Meaning | Recommended Action |
| --- | --- | --- |
| 90%+ | Ready for repeated internal read-only trial | Continue feedback-driven polish and authenticated smoke |
| 80-89% | Usable, but polish needed | Fix P0/P1 issues before broader trial |
| 70-79% | Not ready for regular internal trial | Focus on clarity, stability, and safety fixes |
| Below 70% | Blocking issues remain | Stop feature expansion and fix trial blockers |

## Exit Criteria For Phase UI-2 Internal MVP

Phase UI-2 can be considered internally useful when:

- internal MVP progress remains 95% or higher
- production smoke checks pass
- read-only Admin UI baseline is stable
- operator guide exists
- manual feedback template exists
- at least one full Paul manual feedback pass is completed
- P0 safety issues are resolved or explicitly deferred with a written reason
- next steps are based on trial evidence

## Recommended Next Step

The next step should be trial-driven iteration:

`CBM-CODEX-SPRINT-TRIAL-002 - Paul Manual Trial Feedback Incorporation`

Do not start broad feature growth until the manual trial feedback has been reviewed and converted into small, safe tasks.

## Progress Report

- Full product vision: 36% -> 36%
- Internal MVP / foundation: 95% -> 96% if the full planning pack is completed and pushed
- Internal Trial Success Criteria: 0% -> 100%
- Overall: `[████░░░░░░]` 36%
- Internal MVP: `[██████████]` 96%
- Current module: `[██████████]` 100%
