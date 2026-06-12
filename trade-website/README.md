# CBM Trade Website

这是一个用于获取海外新客户询盘的静态外贸独立站。

## 本地预览

当前本地服务器地址：

`http://127.0.0.1:4173/`

源文件：

- `index.html`
- `styles.css`
- `script.js`

## 已实现

- 英文获客首页
- 产品能力展示：铝型材、幕墙/ACM、五金配件/售后
- 项目经验展示：Demo Market A/Demo Project Market、Demo Market B、Demo Market C
- 新客户询盘表单
- 客户线索本地保存到浏览器 `localStorage`，key 为 `cbm-website-leads`
- 可被 `CBM Trade OS` 的询盘池导入，形成 mock CRM 流程
- 导出线索 CSV
- 提交后生成邮件草稿
- WhatsApp 入口

## Mock CRM 测试方式

1. 打开 `http://127.0.0.1:4173/trade-website/index.html`
2. 填写并提交询盘表单
3. 打开 `http://127.0.0.1:4173/trade-os-prototype/index.html`
4. 进入“询盘”
5. 点击“导入独立站询盘”

当前版本不需要后端数据库，两个页面通过同一浏览器域名下的 `localStorage` 模拟询盘流转。

## 上线前需要替换

在 `index.html` 和 `script.js` 中替换：

- `sales@example.com` 为你的真实收件邮箱
- `https://wa.me/?text=...` 为你的真实 WhatsApp 链接，例如 `https://wa.me/你的号码?text=...`
- Unsplash 图片为你自己的工厂、产品、项目现场照片

## 后续升级

上线后建议接入：

- CRM 后端接口，表单直接写入客户数据库
- 邮件通知，客户提交后自动发给你
- 文件上传，支持图纸、报价单、照片、视频
- Google Analytics / Search Console
- WhatsApp 点击来源追踪
- 西语落地页
- SEO 页面：custom aluminum extrusion、curtain wall profiles、ACM facade panels
