# Paul Manual Trial Feedback Template

## Purpose

Use this template when Paul manually reviews the CBM Trade OS production Admin UI and records practical business feedback before the next development sprint.

This is for internal trial feedback only. It should help turn real operator observations into small, safe Codex tasks without jumping directly into write actions or business execution.

## Trial Target

- Production Admin UI: `https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1`
- Review mode: read-only internal trial
- Do not test real send, approve, quote generation, PI, order, payment, production, shipment, file upload, file download, or file deletion actions.

## Quick Score

| Area | Score | Notes |
| --- | --- | --- |
| Overall trial readiness | `/10` |  |
| Business usefulness | `/10` |  |
| UI clarity | `/10` |  |
| Data realism | `/10` |  |
| Safety clarity | `/10` |  |
| Workflow fit | `/10` |  |

## Section Feedback

Use the same fields for each section. Mark priority as `P0`, `P1`, `P2`, or `P3`.

### 工作台

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 询盘

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 客户

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### AI 复核

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 供应商

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 制造能力

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 文件中心

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 报价前复核

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 正式报价元数据

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 订单

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 生产

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 发货

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 售后

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

### 设置

- What looks good:
- What is confusing:
- Missing fields:
- Wording issues:
- Layout issues:
- Data realism issues:
- Safety concerns:
- Suggested change:
- Priority:

## Issue Format

Copy this block for each concrete issue.

```text
Date/time:
Section:
URL:
Expected:
Actual:
Severity:
Screenshot/video:
Business impact:
Suggested fix:
```

## Priority Definitions

- `P0`: blocks internal trial or creates safety/commercial risk.
- `P1`: important workflow, wording, or data issue that should be fixed in the next sprint.
- `P2`: useful polish or clarity improvement.
- `P3`: nice-to-have improvement that can wait.

## Screenshot And Video Guidance

- Capture only the Admin UI screen.
- Do not include passwords, tokens, cookies, auth headers, or private admin links.
- Avoid real customer files, bank documents, personal contact details, or non-synthetic business records unless Paul has explicitly decided the screenshot is safe to share.
- If a screenshot includes real customer data, mark it clearly and do not paste it into broad review threads.

## What Not To Test Yet

Do not test or request:

- real message sending
- quote generation
- PI generation
- order confirmation
- payment confirmation
- production confirmation
- shipment confirmation
- file upload
- file download
- file deletion
- approval execution
- task creation

These are future controlled-write or execution workflows and require separate planning, schema, API, audit, and approval boundaries.

## Next Step After Filling This Template

After Paul completes one manual feedback pass, send the filled template to ChatGPT with:

```text
这是 Paul 的 CBM Trade OS 手动试用反馈。请按审核包模式整理问题优先级，并生成下一步 Codex 提示词：CBM-CODEX-SPRINT-TRIAL-002 - Paul Manual Trial Feedback Incorporation。
```
