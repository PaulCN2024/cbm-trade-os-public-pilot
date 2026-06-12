# CBM Trade OS Prototype

这是一个无需安装依赖的静态 MVP 原型。

## 打开方式

直接用浏览器打开：

`/Users/paul/Documents/Codex/2026-05-18/new-chat/trade-os-prototype/index.html`

## 已实现

- Dashboard 工作台
- 客户 360 列表
- 潜在客户池
- 询盘池看板
- 独立站增长中心
- 社媒内容与触达
- 客户开发活动
- WhatsApp 智能学习模块
- 订单自动化中枢
- 项目中心
- 报价中心
- 出货中心
- AI 助手模拟输出
- 搜索
- 新增客户、询盘、项目、报价、出货
- 从 CBM 独立站导入本地保存的询盘
- 使用 `localStorage` 本地保存演示数据
- 一键重置演示数据

## 独立站询盘导入

当前 mock CRM 流程使用浏览器 `localStorage`：

- 独立站保存询盘到 `cbm-website-leads`
- Trade OS 保存后台数据到 `cbm-trade-os-v2`

测试步骤：

1. 先在 `http://127.0.0.1:4173/trade-website/index.html` 提交一条询盘
2. 再打开 `http://127.0.0.1:4173/trade-os-prototype/index.html`
3. 点击侧边栏“询盘”
4. 点击“导入独立站询盘”

导入后，系统会自动生成询盘标题、来源、评分、摘要和缺失信息。

## 演示数据

原型已经预置了从真实资料中归纳出的客户和项目线：

- Demo Facade Buyer / Demo Contact
- Demo Importer / Demo Market B / Demo Port B
- Demo Metal Works C / Demo Market C inspection
- Demo Window Fabricator D
- Demo Project Market Curtain Wall & ACM
- Demo Tower Aluminium Order
- Demo Residence
- WhatsApp 脱敏沟通信号：Demo Contact、Demo Metal Contact、Demo Importer、Demo After-sales Contact、Demo Tube Inquiry、Demo Windows and Doors、Demo Accessories

## 后续迁移方向

这个静态原型可以继续升级为：

- Next.js 前端
- PostgreSQL 数据库
- Prisma ORM
- Gmail 同步
- WhatsApp 只读同步和任务提取
- OpenAI API
- 独立站询盘表单
- 自动生成客户回复草稿，但所有发送动作保留人工确认

对应的数据库草案在：

`/Users/paul/Documents/Codex/2026-05-18/new-chat/research_output/database_schema_v1.sql`
