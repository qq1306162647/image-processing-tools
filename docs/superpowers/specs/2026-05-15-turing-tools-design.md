# 图灵工具 (Turing Tools) 设计规格

## 概述

基于 Stitch 设计系统的在线图像处理工具，采用原生 HTML/CSS/JavaScript 实现，纯前端无后端依赖。

## 技术方案

### 技术栈
- 原生 HTML5 + CSS3 + JavaScript (ES6+)
- Canvas 2D API 进行图像处理
- ES6 模块化（无需打包工具）
- 兼容 file:// 本地直接运行

### 目录结构
```
D:\Engineering\image-processing-tools\
├── index.html              # 主入口（控制台主页）
├── styles/
│   ├── variables.css      # CSS 变量（颜色、间距、圆角）
│   ├── base.css           # 重置和基础样式
│   ├── layout.css         # 布局（侧边栏、画布区）
│   └── components.css     # 组件样式
├── scripts/
│   ├── app.js             # 主入口
│   ├── router.js          # 简单哈希路由
│   ├── state.js           # 状态管理
│   └── utils/
│       ├── imageProcessor.js
│       ├── formatConverter.js
│       ├── watermark.js
│       ├── base64.js
│       ├── cropSelection.js
│       └── draggable.js
├── assets/                # 静态资源
├── SPEC.md                # 本文档
└── ISSUES.md              # 问题跟踪
```

## 设计系统

### 颜色（CSS 变量）
```css
--color-primary: #2563eb;
--color-primary-hover: #1d4ed8;
--color-on-primary: #ffffff;
--color-secondary: #505f76;
--color-background: #f7f9fb;
--color-surface: #ffffff;
--color-surface-container: #eceef0;
--color-outline: #737686;
--color-outline-variant: #c3c6d7;
--color-error: #ba1a1a;
```

### 圆角
```css
--radius-sm: 4px;
--radius: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### 间距
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### 阴影
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

### 字体
- 英文：Inter
- 中文：系统无衬线字体（苹方、微软雅黑）
- 行高：body-lg 24px, body-md 20px

## 布局

### 整体布局
- 侧边导航：固定 260px 宽度
- 主内容区：流体宽度
- 画布容器：居中显示，padding 32px

### 侧边栏
- Logo 区域（顶部）
- 工具菜单列表
- 当前选中态：左侧 3px primary 色边框 + 背景色高亮

### 路由结构
| 哈希路由 | 功能 | 描述 |
|----------|------|------|
| `#/` | 首页 | 工具导航入口，展示所有功能卡片 |
| `#/format` | 格式转换 | JPEG/PNG/WebP 互转，质量滑块 |
| `#/compress` | 图像压缩 | 质量控制，实时预估大小 |
| `#/crop` | 图片裁切 | 矩形/圆形选区，拖动+缩放 |
| `#/resize` | 尺寸调整 | 宽高输入，等比例绑定 |
| `#/watermark` | 水印处理 | 文字/图片水印，9宫格位置 |
| `#/base64` | Base64 | 编码/解码/复制 |
| `#/rotate` | 图像旋转 | 左旋/右旋 90° |

## 功能模块

### 1. 格式转换
- 输出格式选择：JPEG / PNG / WebP
- 质量滑块：1-100（PNG 固定 100）
- 实时预览格式信息

### 2. 图像压缩
- 质量滑块：1-100
- 显示原文件大小
- 显示预估压缩后大小
- 支持 JPEG/WebP 压缩

### 3. 图片裁切
- 选区形状：矩形 / 圆形
- 选区可拖动移动
- 选区可缩放（4角拖拽）
- 坐标和尺寸数值输入
- 应用/重置按钮

### 4. 尺寸调整
- 宽度输入框
- 高度输入框
- 等比例锁定开关
- 预设比例快捷按钮（16:9, 4:3, 1:1）

### 5. 水印处理
- 水印类型切换：文字 / 图片
- 文字水印：内容、字号(12-72)、颜色、透明度(0-100)
- 图片水印：上传、透明度(0-100)
- 位置选择：9宫格按钮

### 6. Base64
- 文本输入区（Base64 字符串）
- 图片拖放区
- 编码按钮：将当前图片转为 Base64
- 解码按钮：将 Base64 转为图片
- 复制按钮

### 7. 图像旋转
- 左旋 90° 按钮
- 右旋 90° 按钮

### 通用功能
- 顶部：导入图片按钮
- 底部：导出图片按钮、重置按钮
- 画布区：支持拖放图片

## 组件规范

### 按钮
- Primary: 蓝色背景 #2563eb，白色文字，8px 圆角
- Secondary: 白色背景，蓝色边框，蓝色文字
- Hover: 颜色加深 10%
- Active: scale(0.98)

### 输入框
- 高度 40px
- 白色背景
- 边框 #e5e7eb
- Focus: 边框变蓝 + 微光效果

### 滑块
- 轨道：#e5e7eb
- 已填充：#2563eb
- 手柄：#2563eb 圆形

### 卡片
- 白色背景
- 边框 1px #e5e7eb
- 圆角 12px
- Hover: 微阴影

### 空状态
- 虚线边框
- 上传图标
- 引导文字

## 状态管理

```javascript
state = {
  currentRoute: '#/',
  originalImage: null,    // HTMLImageElement
  currentImage: null,    // 当前处理中的图片
  canvas: null,          // 当前 canvas
  format: 'image/jpeg',
  quality: 90,
  cropSelection: { x, y, width, height, shape: 'rect' },
  watermark: { type: 'text', text: '', fontSize: 24, color: '#ffffff', alpha: 50, position: 'bottom-right' },
  aspectRatio: 1,
  aspectLocked: true
}
```

## 验证计划

1. 打开 `index.html`
2. 测试路由切换（各功能页面）
3. 导入图片 → 各功能测试 → 导出验证
4. 裁切：绘制选区 → 拖动 → 缩放 → 确认
5. 压缩：调整质量 → 查看预估 → 导出对比
6. 导出文件可正常打开
