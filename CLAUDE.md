# CLAUDE.md
# MUST FOLLOW 规则
你之后的所有回答，请务必始终使用简体中文。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

图灵工具 - 在线图像处理工具，使用 Nuxt.js (Vue SSR) + Canvas API 实现，支持 SEO。

## 常用命令

```bash
cd src
npm run dev      # 开发服务器 (http://localhost:3000)
npm run build    # 构建生产版本
npm run generate  # 静态生成
npm run preview  # 预览生产版本
```

## 目录结构

```
D:\Engineering\image-processing-tools\
├── src/
│   ├── app.vue              # 主布局组件
│   ├── nuxt.config.ts      # Nuxt 配置
│   ├── pages/               # 页面组件（自动路由）
│   │   ├── index.vue        # 控制台/首页
│   │   ├── format.vue       # 格式转换
│   │   ├── crop.vue         # 图片裁剪
│   │   ├── resize.vue        # 尺寸调整
│   │   ├── compress.vue     # 图片压缩
│   │   ├── watermark.vue    # 水印工具
│   │   ├── base64.vue       # Base64 转换
│   │   └── rotate.vue        # 旋转工具
│   ├── components/           # Vue 组件
│   │   ├── Sidebar.vue      # 侧边导航
│   │   └── TopBar.vue       # 顶部栏
│   ├── composables/          # Vue Composables
│   │   └── useImageStore.ts # 全局图像状态管理
│   ├── assets/
│   │   ├── css/             # 样式文件
│   │   └── fonts/           # 字体文件
│   └── public/
│       └── fonts/           # 公共字体资源
├── styles/                   # 原始样式文件（备份）
├── fonts/                    # 原始字体文件（备份）
└── CLAUDE.md
```

## 架构说明

- **框架**：Nuxt.js 4 (Vue 3 SSR)
- **UI 框架**：Tailwind CSS CDN + Stitch 设计系统
- **状态管理**：Nuxt useState() 实现 SSR 安全全局状态
- **Canvas 处理**：所有图像操作基于 Canvas 2D API
- **路由**：Nuxt 文件路由系统（pages/ 目录）
- **组件通信**：inject/provide 机制

## 状态管理 (useImageStore)

```typescript
const imageStore = useImageStore()
// 属性
imageStore.originalImage   // 原始图像
imageStore.currentImage   // 当前处理图像
imageStore.format         // 输出格式
imageStore.quality        // 质量 1-100
imageStore.watermark      // 水印配置
imageStore.hasImage       // 计算属性：是否有图像

// 方法
imageStore.loadImage(file)    // 加载图像
imageStore.setCurrentImage()  // 设置当前图像
imageStore.setFormat()        // 设置格式
imageStore.setQuality()       // 设置质量
imageStore.setWatermark()     // 设置水印
imageStore.reset()            // 重置到原始图像
imageStore.resetWatermark()  // 重置水印配置
```

## 功能模块

1. **格式转换** (`format.vue`) — JPEG/PNG/WebP，品质滑块
2. **裁切** (`crop.vue`) — 矩形/圆形选区，拖动移动
3. **尺寸调整** (`resize.vue`) — 宽高输入，等比例绑定
4. **压缩** (`compress.vue`) — 质量控制，实时预估大小
5. **水印** (`watermark.vue`) — 文字/图片水印，9宫格位置
6. **Base64** (`base64.vue`) — 编码、解码、复制
7. **旋转** (`rotate.vue`) — 左旋/右旋 90°，水平/垂直翻转

## 开发规范

- 提交信息使用中文
- 使用 Vue 3 Composition API (`<script setup>`)
- Canvas 操作相关函数返回 `{canvas, width, height}` 对象
- 组件使用 PascalCase 命名



Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
