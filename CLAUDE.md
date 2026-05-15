# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

纯前端图像处理工具，使用原生 HTML/CSS/JavaScript + Canvas API 实现，无需后端服务器。

## 常用命令

无构建命令。直接在浏览器中打开 `index.html` 即可运行和调试。

## 目录结构

```
D:\Engineering\image-processing-tools\
├── index.html              # 主页面
├── styles.css              # 样式表
├── app.js                  # 主逻辑入口
├── modules/
│   ├── imageProcessor.js   # 核心：裁切、缩放、旋转、压缩
│   ├── formatConverter.js   # 格式转换
│   ├── watermark.js        # 水印
│   ├── base64.js           # Base64 编解码
│   └── ui.js              # 裁切选区交互（拖动/缩放）
└── CLAUDE.md
```

## 架构说明

- **无构建工具**：纯原生实现，ES6 模块通过 `<script type="module">` 加载
- **状态管理**：`app.js` 中的模块级变量（`currentImage`、`currentFormat`、`currentQuality`）
- **Canvas 处理**：所有图像操作基于 Canvas 2D API，通过 `toBlob()` / `toDataURL()` 导出
- **模块职责**：
  - `imageProcessor.js` — 底层像素操作（旋转、缩放、裁切、压缩）
  - `watermark.js` — 水印叠加（文字/图片）
  - `ui.js` — `CropSelection` 类处理选区拖拽和缩放交互
  - `base64.js` — FileReader 编码/解码
  - `formatConverter.js` — 格式映射和导出

## 功能模块

1. **格式转换** — JPEG/PNG/WebP，品质滑块
2. **裁切** — 矩形/圆形选区，支持拖动移动、角落缩放
3. **尺寸调整** — 宽高输入，等比例绑定开关
4. **压缩** — 质量控制，实时预估文件大小
5. **水印** — 文字/图片水印，9宫格位置，透明度
6. **Base64** — 编码、解码、复制
7. **旋转** — 左旋/右旋 90°

## 开发规范

- 提交信息使用中文
- 使用 ES6 模块语法（`import`/`export`）
- Canvas 操作相关函数返回 `{canvas, width, height}` 对象
