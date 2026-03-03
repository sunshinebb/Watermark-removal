# ClearMark AI - Selective Watermark Removal Tool

[中文版](#chinese-version) | [English Version](#english-version)

---

<a name="english-version"></a>
## English Version

### 🚀 Introduction
ClearMark AI is a professional, web-based image restoration tool designed to remove watermarks and unwanted objects selectively. It features a dual-mode engine that automatically switches between high-performance AI restoration and local browser-based processing.

### ✨ Key Features
- **AI-Powered Inpainting**: Uses Google Gemini 2.5 Flash for high-quality, context-aware background restoration.
- **Local Fallback Mode**: Works even without an API key using a custom pure-frontend pixel-filling algorithm.
- **Interactive Brush**: Precisely mark areas to be removed with an adjustable brush.
- **Modern UI**: Built with a sleek, dark-themed "Specialist Tool" aesthetic.
- **Privacy Focused**: Processes images locally or via secure API calls.

### 🛠 Tech Stack
- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS 4
- **Canvas Engine**: Konva.js
- **AI Model**: Google Gemini 2.5 Flash Image
- **Animations**: Motion (formerly Framer Motion)

### 📦 Build & Deployment

#### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

#### 2. Installation
```bash
npm install
```

#### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```
*Note: If no API key is provided, the app will automatically run in **Local Mode**.*

#### 4. Build for Production
```bash
npm run build
```
This will generate a `dist` folder containing optimized static files.

#### 5. Deployment to Your Server
You can host the `dist` folder on any static web server (Nginx, Apache, Vercel, Netlify, etc.).

**Nginx Example Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/your/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

<a name="chinese-version"></a>
## 中文版

### 🚀 项目介绍
ClearMark AI 是一款专业的基于 Web 的图片修复工具，旨在选择性地去除水印和不需要的对象。它拥有双模式引擎，可在高性能 AI 修复和本地浏览器处理之间自动切换。

### ✨ 核心功能
- **AI 驱动修复**：利用 Google Gemini 2.5 Flash 进行高质量、感知上下文的背景修复。
- **本地回退模式**：即使没有 API Key，也能通过自定义的纯前端像素填充算法正常工作。
- **交互式笔刷**：使用可调节大小的笔刷精确标记需要去除的区域。
- **现代 UI**：采用精致的深色调“专业工具”美学设计。
- **隐私保护**：图片在本地处理或通过安全的 API 调用。

### 🛠 技术栈
- **前端**：React 19, Vite, TypeScript
- **样式**：Tailwind CSS 4
- **画布引擎**：Konva.js
- **AI 模型**：Google Gemini 2.5 Flash Image
- **动画**：Motion

### 📦 打包与部署

#### 1. 环境准备
- Node.js (v18 或更高版本)
- npm 或 yarn

#### 2. 安装依赖
```bash
npm install
```

#### 3. 环境变量配置
在根目录创建 `.env` 文件：
```env
VITE_GEMINI_API_KEY=你的API密钥
```
*注意：如果没有提供 API Key，应用将自动以 **本地模式 (Local Mode)** 运行。*

#### 4. 项目打包
```bash
npm run build
```
运行后会生成 `dist` 文件夹，其中包含优化后的静态文件。

#### 5. 部署到个人服务器
你可以将 `dist` 文件夹托管在任何静态 Web 服务器上（如 Nginx, Apache, Vercel, Netlify 等）。

**Nginx 示例配置：**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/your/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

### ⚠️ Security Note / 安全提示
If you deploy this publicly, your API Key might be visible in the browser's network tab. For public production use, it is recommended to proxy API calls through a backend server.
如果您公开部署此项目，您的 API Key 可能会在浏览器的网络选项卡中可见。对于公开生产环境，建议通过后端服务器代理 API 调用。
