# AI-first Full System Master Plan

## One-sentence Positioning

CBM Trade OS is not a traditional foreign trade CRM. It is an AI-first foreign trade operating system where AI is the entry point, the knowledge base is the business brain, and every customer, inquiry, supplier, quotation, file, prospecting, content, order, and after-sales workflow can be understood, assisted, and organized by AI under human approval.

## Why This Master Plan Exists

Paul does not want a normal admin backend where users click through menus, open isolated modules, and manually search scattered information.

The intended system is different: Paul should be able to give a natural-language instruction to AI, and the system should organize the business workflow across customers, inquiries, files, suppliers, quotations, knowledge, risk review, and future execution modules.

The current internal MVP is a safe read-only foundation. It proves that modules can render, admin-read routes can be auth-gated, knowledge data can exist, and RLS can protect the first Knowledge Base tables. The next product direction must now be aligned around the real target: an AI-first foreign trade operating system, not a prettier static dashboard.

## Core Product Philosophy

- AI is the entrance, not a feature.
- Knowledge base is the business brain, not a file folder.
- Every module should be AI-readable, AI-assistable, and eventually AI-orchestrated.
- The system should reduce manual clicking and menu navigation.
- AI should gather context, analyze business intent, recommend next actions, and generate drafts.
- Human approval is required before external or irreversible business actions.
- The system should support customer acquisition, inquiry conversion, supplier coordination, quotation review, content marketing, delivery, after-sales, and business intelligence as one closed loop.

The product should help Paul work by intention:

```text
Paul says what he wants to achieve
-> AI understands the task
-> AI finds the right records and knowledge
-> AI proposes a safe workflow
-> Paul reviews and approves key actions
-> the system records decisions and updates reusable knowledge
```

## Traditional CRM vs AI-first OS

| Area | Traditional CRM | AI-first Trade OS |
| --- | --- | --- |
| Entry point | User clicks modules | User starts with AI instruction |
| Data behavior | Data is stored but passive | AI understands intent and retrieves context |
| Search | User manually searches records | AI retrieves customer, inquiry, product, supplier, file, and knowledge context |
| Workflow | Depends on human memory | AI proposes workflow and next steps |
| Drafting | User writes messages manually | AI generates draft messages, RFQs, summaries, and checklists |
| Risk | Hidden in operator judgment | AI explains risk, missing information, and approval gates |
| Approval | Often implicit or manual | Human confirmation is explicit before key actions |
| Knowledge reuse | Scattered in files and memory | Data becomes reusable, source-tracked knowledge |
| AI role | Optional assistant | AI is the operating entrance and coordination layer |

## Ideal User Experience

Example instruction:

```text
帮我处理这个秘鲁客户的轻钢龙骨询盘。
```

AI should automatically:

- identify the customer
- read the inquiry
- extract products and specifications
- check the Knowledge Base
- check supplier capability
- identify missing information
- create customer clarification questions
- create supplier RFQ draft
- check quotation readiness
- mark risks
- recommend the next step

The user should not need to manually click five modules to discover the same information.

The ideal user experience is:

```text
AI summarizes the situation
AI shows what it used as evidence
AI says what is missing
AI says what should happen next
AI drafts but does not send
Paul approves or rejects the next move
```

## AI As System Entrance

The future AI Command Center should become the main entrance of CBM Trade OS.

It should support:

- natural-language task input
- task intent recognition
- workflow routing
- context retrieval
- next-step recommendation
- risk warnings
- draft generation
- approval handoff
- timeline tracking

The AI Command Center should route work such as:

- "帮我分析这个询盘"
- "找类似巴拿马 Kevin 的客户"
- "根据这个产品写一篇 LinkedIn 文章"
- "检查这个报价是否可以发给客户"
- "帮我准备给供应商的中文询价"
- "这个投诉怎么回复比较安全"
- "今天哪些客户需要跟进"

AI should become the front door. Modules should become evidence, context, and workflow surfaces behind that front door.

## Knowledge Base As Business Brain

The AI Knowledge Center should store and structure:

- product knowledge
- supplier knowledge
- customer knowledge
- quotation rules
- trade terms
- document knowledge
- installation manuals
- SOPs
- communication templates
- complaint handling rules
- compliance and safety rules
- social content knowledge

AI should cite and use verified knowledge instead of guessing.

Knowledge must be treated as business infrastructure:

- source-tracked
- human-verifiable
- freshness-aware
- visibility-scoped
- risk-labeled
- safe for internal use before customer-facing use

The Knowledge Base should not become a dumping folder. It should become the structured business brain that tells AI what CBM knows, what CBM does not know, and what must still be confirmed by a human.

## Full Foreign Trade Workflow Loop

The target closed loop:

```text
AI Knowledge Center
-> AI Prospecting
-> AI Content Marketing
-> Customer Inquiry
-> Inquiry Analysis
-> Supplier Matching
-> Quotation Readiness
-> Quotation Draft
-> Human Approval
-> Order / Production / Shipment
-> After-sales / Complaint Handling
-> Business Review
-> Knowledge Base Update
```

This loop matters because every completed business action should improve the next one:

- inquiries reveal missing product knowledge
- supplier responses improve supplier knowledge
- quotation review improves quotation rules
- complaints improve after-sales SOPs
- content performance improves prospecting and marketing knowledge
- repeated customer patterns improve follow-up and sales priority

## High-level System Layers

### A. AI Entrance Layer

- AI Command Center
- AI Copilot
- Today's priorities
- risk alerts
- next action suggestions

This layer should answer: "What should Paul do next, and why?"

### B. Customer Acquisition Layer

- AI Prospecting Center
- lookalike customer discovery
- AI Social Content Studio
- multilingual marketing drafts
- follow-up assistant

This layer should help Paul find, attract, and nurture potential customers without unauthorized scraping, automatic outreach, or unreviewed publishing.

### C. Business Processing Layer

- Inquiry Center
- Customer Center
- Supplier Center
- File Center
- Quotation Pre-review
- Quotation Draft
- Formal Quote / PI later

This layer should convert real business signals into reviewed next steps.

### D. Knowledge Foundation Layer

- AI Knowledge Center
- product knowledge
- supplier knowledge
- quotation rules
- SOPs
- communication templates
- compliance rules
- file/document knowledge

This layer should make AI assistance grounded, cited, and reviewable.

### E. Delivery And After-sales Layer

- order tracking
- production tracking
- shipment tracking
- payment reminders
- quality complaint handling
- after-sales records
- repurchase follow-up

This layer should come later because it carries higher business risk and requires stronger approval and audit controls.

### F. Governance Layer

- approval center
- risk and compliance center
- audit logs
- permissions
- business intelligence
- model/provider routing

This layer protects the system from becoming uncontrolled automation.

## AI Capability Principles

Every module should eventually expose:

- what data AI can read
- what AI can suggest
- what AI can draft
- what AI cannot do
- what requires human approval
- what knowledge sources are used
- what confidence/risk level applies

Every serious AI-assisted module should make its safety boundary visible:

```text
AI can help prepare.
AI cannot commit.
Paul approves before external or irreversible action.
```

## Human Approval Principle

AI may:

- summarize
- analyze
- classify
- suggest
- draft
- compare
- warn
- route tasks
- prepare messages

AI must not automatically:

- send messages
- publish social posts
- approve quotes
- commit prices
- confirm delivery dates
- issue PI
- place orders
- update production status as fact
- promise compensation
- modify sensitive business data
- scrape unauthorized platforms

Human approval is not a UI decoration. It is a product architecture rule.

## AI Output Quality Requirements

Every serious AI output should include:

- source
- confidence level
- missing information
- risk notes
- recommended next action
- human confirmation requirement

Customer-facing or supplier-facing drafts should also include:

- language
- tone
- target recipient
- exact proposed message
- forbidden commitments avoided
- whether the message is safe to send after review

## Role Of Multi-model Architecture

The system should keep AI Provider / Model Gateway / Model Router abstraction so it can use:

- OpenAI
- Anthropic / Claude
- Gemini
- Qwen
- DeepSeek
- Kimi
- OpenRouter
- local models later

Model selection should depend on task:

- long document analysis
- translation
- drafting
- structured extraction
- coding
- reasoning
- low-cost batch tasks

The product should not be locked to one model if different models are better for different trade workflows. The routing layer should also support cost control, quality comparison, fallback, and future local/private model usage.

## Product Direction Summary

The long-term goal is for Paul to operate foreign trade work by telling AI what he wants to achieve, while the system handles context collection, task routing, document/knowledge retrieval, draft generation, risk review, and human approval flow.

CBM Trade OS should become a business operating system where AI understands the work, knowledge grounds the advice, and human approval protects the company.
