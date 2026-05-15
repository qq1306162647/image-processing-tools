# 图灵工具 (Turing Tools) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 实现完整的在线图像处理工具，包含 7 个功能模块

**架构:** 单页应用 + 哈希路由，纯前端 Canvas 处理，无后端依赖

**技术栈:** 原生 HTML5 + CSS3 + JavaScript (ES6+), Canvas 2D API

---

## 文件结构

```
D:\Engineering\image-processing-tools\
├── index.html                 # 主入口
├── styles/
│   ├── variables.css          # CSS 变量（颜色、间距、圆角、阴影）
│   ├── base.css               # 重置和基础样式
│   ├── layout.css             # 布局（侧边栏、画布区）
│   └── components.css        # 组件样式
├── scripts/
│   ├── app.js                 # 主入口、初始化、事件绑定
│   ├── router.js              # 哈希路由
│   ├── state.js               # 状态管理
│   └── utils/
│       ├── imageProcessor.js  # 图像处理核心
│       ├── formatConverter.js # 格式转换
│       ├── cropSelection.js   # 裁切选区
│       ├── watermark.js       # 水印
│       └── base64.js         # Base64 编解码
├── SPEC.md                    # 设计规格文档
└── ISSUES.md                  # 问题跟踪
```

---

## 任务列表

### Task 1: CSS 设计系统

**文件:** 创建 `styles/variables.css`, `styles/base.css`, `styles/layout.css`, `styles/components.css`

- [ ] **Step 1: 创建 variables.css**

```css
:root {
  /* 颜色 */
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

  /* 圆角 */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* 布局 */
  --sidebar-width: 260px;
  --header-height: 64px;
}
```

- [ ] **Step 2: 创建 base.css**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--color-background);
  color: var(--color-on-surface);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, canvas {
  display: block;
  max-width: 100%;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input, select, textarea {
  font-family: inherit;
}
```

- [ ] **Step 3: 创建 layout.css**

```css
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-outline-variant);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
}

.sidebar-logo {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-outline-variant);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  color: var(--color-secondary);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--color-surface-container);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(37, 99, 235, 0.08);
  border-left-color: var(--color-primary);
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.toolbar {
  background: var(--color-surface);
  border-top: 1px solid var(--color-outline-variant);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  gap: var(--space-sm);
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
}
```

- [ ] **Step 4: 创建 components.css**

```css
/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  transition: all 0.2s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-outline);
}

.btn-secondary:hover {
  background: var(--color-surface-container);
}

/* 输入框 */
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 滑块 */
.slider {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-surface-container);
  appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

/* 卡片 */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

.card:hover {
  box-shadow: var(--shadow-sm);
}

/* 空状态 */
.empty-state {
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-secondary);
}

/* Tab 面板 */
.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

/* 工具面板 */
.tool-panel {
  width: 300px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-outline-variant);
  padding: var(--space-lg);
  overflow-y: auto;
}

.tool-panel h3 {
  margin-bottom: var(--space-md);
  font-size: 1rem;
}

.tool-group {
  margin-bottom: var(--space-lg);
}

.tool-group label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 位置网格 */
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.pos-btn {
  padding: var(--space-sm);
  background: var(--color-surface-container);
  border: 2px solid transparent;
  border-radius: var(--radius);
  font-size: 0.75rem;
  cursor: pointer;
}

.pos-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 形状按钮组 */
.shape-btns {
  display: flex;
  gap: var(--space-xs);
}

.shape-btn {
  flex: 1;
  padding: var(--space-sm);
  background: var(--color-surface-container);
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
}

.shape-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 裁切覆盖层 */
.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-selection {
  position: absolute;
  border: 2px dashed var(--color-primary);
  background: rgba(37, 99, 235, 0.1);
  cursor: move;
  pointer-events: all;
}

.crop-selection.circle {
  border-radius: 50%;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border: 2px solid var(--color-surface);
  border-radius: 2px;
}

.resize-handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
.resize-handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-handle.se { bottom: -5px; right: -5px; cursor: se-resize; }
```

- [ ] **Step 5: 提交**

```bash
git add styles/
git commit -m "feat: add CSS design system (variables, base, layout, components)"
```

---

### Task 2: 状态管理和路由

**文件:** 创建 `scripts/state.js`, `scripts/router.js`

- [ ] **Step 1: 创建 state.js**

```javascript
// 状态管理
export const state = {
  currentRoute: '#/',
  originalImage: null,
  currentImage: null,
  canvas: null,
  format: 'image/jpeg',
  quality: 90,
  cropSelection: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    shape: 'rect'
  },
  watermark: {
    type: 'text',
    text: '水印',
    fontSize: 24,
    color: '#ffffff',
    alpha: 50,
    position: 'bottom-right',
    image: null
  },
  resize: {
    width: 800,
    height: 600,
    aspectLocked: true
  },
  originalSize: 0
};

export function setState(key, value) {
  if (typeof key === 'object') {
    Object.assign(state, key);
  } else {
    state[key] = value;
  }
}

export function getState(key) {
  return key ? state[key] : state;
}

export function resetState() {
  if (state.originalImage) {
    state.currentImage = state.originalImage;
    state.format = 'image/jpeg';
    state.quality = 90;
    state.cropSelection = { x: 0, y: 0, width: 100, height: 100, shape: 'rect' };
    state.resize = { width: state.originalImage.width, height: state.originalImage.height, aspectLocked: true };
  }
}
```

- [ ] **Step 2: 创建 router.js**

```javascript
import { render } from './app.js';

const routes = {
  '#/': { title: '图灵工具', render },
  '#/format': { title: '格式转换', render },
  '#/compress': { title: '图像压缩', render },
  '#/crop': { title: '图片裁切', render },
  '#/resize': { title: '尺寸调整', render },
  '#/watermark': { title: '水印处理', render },
  '#/base64': { title: 'Base64', render },
  '#/rotate': { title: '图像旋转', render }
};

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const route = routes[hash] || routes['#/'];

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === hash);
  });

  // 调用渲染函数
  if (route.render) {
    route.render(hash);
  }

  // 更新标题
  document.title = `${route.title} - 图灵工具`;
}
```

- [ ] **Step 3: 提交**

```bash
git add scripts/state.js scripts/router.js
git commit -m "feat: add state management and hash router"
```

---

### Task 3: 主入口和 HTML 结构

**文件:** 创建 `index.html`, `scripts/app.js`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图灵工具 - 在线图像处理</title>
  <link rel="stylesheet" href="styles/variables.css">
  <link rel="stylesheet" href="styles/base.css">
  <link rel="stylesheet" href="styles/layout.css">
  <link rel="stylesheet" href="styles/components.css">
</head>
<body>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-logo">图灵工具</div>
      <nav class="sidebar-nav">
        <a href="#/" class="nav-item active">控制台</a>
        <a href="#/format" class="nav-item">格式转换</a>
        <a href="#/compress" class="nav-item">图像压缩</a>
        <a href="#/crop" class="nav-item">图片裁切</a>
        <a href="#/resize" class="nav-item">尺寸调整</a>
        <a href="#/watermark" class="nav-item">水印处理</a>
        <a href="#/base64" class="nav-item">Base64</a>
        <a href="#/rotate" class="nav-item">图像旋转</a>
      </nav>
    </aside>

    <main class="main-content">
      <div class="canvas-area" id="canvasArea">
        <div class="empty-state" id="emptyState">
          <p>拖放图片到此处，或</p>
          <input type="file" id="fileInput" accept="image/*" style="display:none">
          <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">选择图片</button>
        </div>
        <div id="canvasWrapper" style="display:none; position:relative;">
          <canvas id="mainCanvas"></canvas>
          <div class="crop-overlay" id="cropOverlay" style="display:none;">
            <div class="crop-selection" id="cropSelection">
              <div class="resize-handle nw"></div>
              <div class="resize-handle ne"></div>
              <div class="resize-handle sw"></div>
              <div class="resize-handle se"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="tool-panel" id="toolPanel">
        <!-- 动态内容 -->
      </div>

      <div class="toolbar">
        <button class="btn btn-secondary" id="resetBtn">重置</button>
        <button class="btn btn-primary" id="exportBtn" disabled>导出图片</button>
      </div>
    </main>
  </div>

  <script type="module" src="scripts/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 app.js (第一部分：初始化和通用逻辑)**

```javascript
import { state, setState, getState, resetState } from './state.js';
import { initRouter } from './router.js';
import * as imageProcessor from './utils/imageProcessor.js';
import * as formatConverter from './utils/formatConverter.js';
import * as watermark from './utils/watermark.js';
import * as base64 from './utils/base64.js';
import { CropSelection } from './utils/cropSelection.js';

// DOM 元素
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const emptyState = document.getElementById('emptyState');
const canvasWrapper = document.getElementById('canvasWrapper');
const cropOverlay = document.getElementById('cropOverlay');
const cropSelection = document.getElementById('cropSelection');
const toolPanel = document.getElementById('toolPanel');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');

let cropSelectionHandler = null;

// 初始化
export function init() {
  initRouter();
  initEventListeners();
}

function initEventListeners() {
  // 文件选择
  fileInput.addEventListener('change', handleFileSelect);

  // 拖放
  const canvasArea = document.getElementById('canvasArea');
  canvasArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvasArea.classList.add('dragover');
  });
  canvasArea.addEventListener('dragleave', () => {
    canvasArea.classList.remove('dragover');
  });
  canvasArea.addEventListener('drop', handleDrop);

  // 导出
  exportBtn.addEventListener('click', handleExport);

  // 重置
  resetBtn.addEventListener('click', handleReset);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadImage(file);
}

function handleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  }
}

function loadImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    setState({
      originalImage: img,
      currentImage: img,
      originalSize: file.size
    });

    // 设置canvas
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // 显示canvas，隐藏空状态
    emptyState.style.display = 'none';
    canvasWrapper.style.display = 'block';
    exportBtn.disabled = false;

    // 初始化裁切选区
    initCropSelection();
  };

  img.src = url;
}

function handleExport() {
  const blob = imageProcessor.exportCanvas(canvas, state.format, state.quality);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `image.${formatConverter.getExtension(state.format)}`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleReset() {
  resetState();
  if (state.originalImage) {
    ctx.drawImage(state.originalImage, 0, 0);
  }
}

function initCropSelection() {
  if (cropSelectionHandler) {
    cropSelectionHandler.destroy();
  }
  cropSelectionHandler = new CropSelection(canvas, cropSelection, cropOverlay);
}

// 导出渲染函数供 router 使用
export { ctx, canvas, toolPanel, state, setState, cropSelectionHandler, cropOverlay, cropSelection };
```

- [ ] **Step 3: 提交**

```bash
git add index.html scripts/app.js
git commit -m "feat: add main entry HTML and app.js initialization"
```

---

### Task 4: 图像处理核心模块

**文件:** 创建 `scripts/utils/imageProcessor.js`

- [ ] **Step 1: 创建 imageProcessor.js**

```javascript
/**
 * 图像处理核心模块
 */

/**
 * 在 Canvas 上绘制图片
 */
export function drawImage(img, width = img.width, height = img.height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * 旋转图片
 */
export function rotate(img, degrees) {
  const isRotate = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
  const width = isRotate ? img.height : img.width;
  const height = isRotate ? img.width : img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.translate(width / 2, height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return { canvas, width, height };
}

/**
 * 裁切图片
 */
export function crop(img, x, y, w, h, originWidth, originHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const srcX = (x / originWidth) * img.width;
  const srcY = (y / originHeight) * img.height;
  const srcW = (w / originWidth) * img.width;
  const srcH = (h / originHeight) * img.height;

  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, w, h);
  return { canvas, width: w, height: h };
}

/**
 * 调整尺寸
 */
export function resize(img, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

/**
 * 压缩图片
 */
export function compress(img, quality, format) {
  return new Promise((resolve) => {
    const canvas = drawImage(img);
    canvas.toBlob(
      (blob) => resolve({ canvas, blob }),
      format,
      quality / 100
    );
  });
}

/**
 * 估算压缩后大小
 */
export function estimateCompressedSize(img, quality, format) {
  return new Promise((resolve) => {
    const canvas = drawImage(img);
    canvas.toBlob(
      (blob) => resolve(blob ? blob.size : 0),
      format,
      quality / 100
    );
  });
}

/**
 * 导出 Canvas
 */
export function exportCanvas(canvas, format, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), format, quality / 100);
  });
}

/**
 * 从 Canvas 加载 Image
 */
export function loadImageFromCanvas(canvas) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL();
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add scripts/utils/imageProcessor.js
git commit -m "feat: add imageProcessor core module"
```

---

### Task 5: 裁切选区交互

**文件:** 创建 `scripts/utils/cropSelection.js`

- [ ] **Step 1: 创建 cropSelection.js**

```javascript
/**
 * 裁切选区交互模块
 */

export class CropSelection {
  constructor(canvas, selectionEl, overlayEl) {
    this.canvas = canvas;
    this.selection = selectionEl;
    this.overlay = overlayEl;
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.startX = 0;
    this.startY = 0;
    this.startLeft = 0;
    this.startTop = 0;
    this.startWidth = 0;
    this.startHeight = 0;

    this.init();
    this.showDefault();
  }

  init() {
    this.selection.addEventListener('mousedown', this.onDragStart.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  showDefault() {
    const canvasRect = this.canvas.getBoundingClientRect();
    const padding = 50;
    const maxW = canvasRect.width - padding * 2;
    const maxH = canvasRect.height - padding * 2;
    const ratio = Math.min(maxW / this.canvas.width, maxH / this.canvas.height);
    const selW = this.canvas.width * ratio * 0.6;
    const selH = this.canvas.height * ratio * 0.6;
    const x = (canvasRect.width - selW) / 2;
    const y = (canvasRect.height - selH) / 2;

    this.show(x, y, selW, selH);
  }

  show(x, y, w, h) {
    this.selection.style.display = 'block';
    this.selection.style.left = x + 'px';
    this.selection.style.top = y + 'px';
    this.selection.style.width = w + 'px';
    this.selection.style.height = h + 'px';
    this.overlay.style.display = 'block';
  }

  hide() {
    this.selection.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  setShape(shape) {
    if (shape === 'circle') {
      this.selection.classList.add('circle');
    } else {
      this.selection.classList.remove('circle');
    }
  }

  onDragStart(e) {
    if (e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    const rect = this.selection.getBoundingClientRect();
    const overlayRect = this.overlay.getBoundingClientRect();
    this.startLeft = rect.left - overlayRect.left;
    this.startTop = rect.top - overlayRect.top;
  }

  onMouseMove(e) {
    if (this.isDragging) {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      let newLeft = this.startLeft + dx;
      let newTop = this.startTop + dy;

      const maxLeft = this.overlay.clientWidth - this.selection.clientWidth;
      const maxTop = this.overlay.clientHeight - this.selection.clientHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      this.selection.style.left = newLeft + 'px';
      this.selection.style.top = newTop + 'px';
    }

    if (this.isResizing) {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      let newWidth = this.startWidth;
      let newHeight = this.startHeight;
      const aspectRatio = this.startWidth / this.startHeight;

      switch (this.resizeHandle) {
        case 'se':
          newWidth = Math.max(50, this.startWidth + dx);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw':
          newWidth = Math.max(50, this.startWidth - dx);
          newHeight = newWidth / aspectRatio;
          this.selection.style.left = (this.startLeft + this.startWidth - newWidth) + 'px';
          break;
        case 'ne':
          newWidth = Math.max(50, this.startWidth + dx);
          newHeight = newWidth / aspectRatio;
          this.selection.style.top = (this.startTop + this.startHeight - newHeight) + 'px';
          break;
        case 'nw':
          newWidth = Math.max(50, this.startWidth - dx);
          newHeight = newWidth / aspectRatio;
          this.selection.style.left = (this.startLeft + this.startWidth - newWidth) + 'px';
          this.selection.style.top = (this.startTop + this.startHeight - newHeight) + 'px';
          break;
      }

      this.selection.style.width = newWidth + 'px';
      this.selection.style.height = newHeight + 'px';
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }

  getSelection() {
    const rect = this.selection.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    return {
      x: rect.left - canvasRect.left,
      y: rect.top - canvasRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  getCanvasSelection() {
    const sel = this.getSelection();
    const canvasRect = this.canvas.getBoundingClientRect();
    return {
      x: (sel.x / canvasRect.width) * this.canvas.width,
      y: (sel.y / canvasRect.height) * this.canvas.height,
      width: (sel.width / canvasRect.width) * this.canvas.width,
      height: (sel.height / canvasRect.height) * this.canvas.height
    };
  }

  destroy() {
    this.hide();
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add scripts/utils/cropSelection.js
git commit -m "feat: add cropSelection interaction module"
```

---

### Task 6: 各功能页面渲染

**文件:** 修改 `scripts/app.js`，添加各 Tab 面板内容

- [ ] **Step 1: 更新 app.js，添加 render 函数**

```javascript
// 各功能页面渲染
export function render(hash) {
  const { toolPanel, canvas, ctx, state, setState, cropSelectionHandler, cropOverlay } = getState();

  // 加载空状态或当前图片
  if (!state.currentImage) {
    emptyState.style.display = 'flex';
    canvasWrapper.style.display = 'none';
    toolPanel.innerHTML = '<p style="color:var(--color-secondary)">请先导入图片</p>';
    return;
  }

  emptyState.style.display = 'none';
  canvasWrapper.style.display = 'block';

  switch (hash) {
    case '#/':
      renderHome();
      break;
    case '#/format':
      renderFormat();
      break;
    case '#/compress':
      renderCompress();
      break;
    case '#/crop':
      renderCrop();
      break;
    case '#/resize':
      renderResize();
      break;
    case '#/watermark':
      renderWatermark();
      break;
    case '#/base64':
      renderBase64();
      break;
    case '#/rotate':
      renderRotate();
      break;
  }
}

function renderHome() {
  toolPanel.innerHTML = `
    <h3>控制台</h3>
    <p style="color:var(--color-secondary); margin-top:var(--space-md)">
      选择左侧工具开始处理图片
    </p>
  `;
}

function renderFormat() {
  toolPanel.innerHTML = `
    <h3>格式转换</h3>
    <div class="tool-group">
      <label>输出格式</label>
      <select class="input" id="formatSelect">
        <option value="image/jpeg" ${state.format === 'image/jpeg' ? 'selected' : ''}>JPEG</option>
        <option value="image/png" ${state.format === 'image/png' ? 'selected' : ''}>PNG</option>
        <option value="image/webp" ${state.format === 'image/webp' ? 'selected' : ''}>WebP</option>
      </select>
    </div>
    <div class="tool-group">
      <label>图片质量: <span id="qualityLabel">${state.quality}</span>%</label>
      <input type="range" class="slider" id="qualitySlider" min="1" max="100" value="${state.quality}">
    </div>
  `;

  document.getElementById('formatSelect').addEventListener('change', (e) => {
    setState({ format: e.target.value });
    if (e.target.value === 'image/png') {
      setState({ quality: 100 });
      document.getElementById('qualitySlider').value = 100;
      document.getElementById('qualityLabel').textContent = '100';
    }
  });

  document.getElementById('qualitySlider').addEventListener('input', (e) => {
    const quality = parseInt(e.target.value);
    setState({ quality });
    document.getElementById('qualityLabel').textContent = quality;
  });
}

function renderCompress() {
  toolPanel.innerHTML = `
    <h3>图像压缩</h3>
    <div class="tool-group">
      <label>压缩质量: <span id="compressLabel">${state.quality}</span>%</label>
      <input type="range" class="slider" id="compressSlider" min="1" max="100" value="${state.quality}">
    </div>
    <div class="card" style="margin-top:var(--space-md)">
      <div>原文件大小: <strong id="originalSize">-</strong></div>
      <div>预估大小: <strong id="estimatedSize">-</strong></div>
    </div>
  `;

  updateCompressPreview();

  document.getElementById('compressSlider').addEventListener('input', async (e) => {
    const quality = parseInt(e.target.value);
    setState({ quality });
    document.getElementById('compressLabel').textContent = quality;
    await updateCompressPreview();
  });
}

async function updateCompressPreview() {
  if (!state.currentImage) return;
  const estimated = await imageProcessor.estimateCompressedSize(state.currentImage, state.quality, state.format);
  document.getElementById('originalSize').textContent = formatSize(state.originalSize);
  document.getElementById('estimatedSize').textContent = formatSize(estimated);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function renderCrop() {
  cropOverlay.style.display = 'block';

  toolPanel.innerHTML = `
    <h3>图片裁切</h3>
    <div class="tool-group">
      <label>选区形状</label>
      <div class="shape-btns">
        <button class="shape-btn ${state.cropSelection.shape === 'rect' ? 'active' : ''}" data-shape="rect">矩形</button>
        <button class="shape-btn ${state.cropSelection.shape === 'circle' ? 'active' : ''}" data-shape="circle">圆形</button>
      </div>
    </div>
    <div class="tool-group">
      <label>选区信息</label>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-xs)">
        <input type="number" class="input" id="cropX" placeholder="X" value="0">
        <input type="number" class="input" id="cropY" placeholder="Y" value="0">
        <input type="number" class="input" id="cropW" placeholder="W" value="100">
        <input type="number" class="input" id="cropH" placeholder="H" value="100">
      </div>
    </div>
    <button class="btn btn-primary" id="applyCrop">应用裁切</button>
  `;

  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const shape = btn.dataset.shape;
      setState({ cropSelection: { ...state.cropSelection, shape } });
      cropSelectionHandler.setShape(shape);
      document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('applyCrop').addEventListener('click', async () => {
    const sel = cropSelectionHandler.getCanvasSelection();
    const result = imageProcessor.crop(
      state.currentImage,
      sel.x, sel.y, sel.width, sel.height,
      canvas.width, canvas.height
    );
    const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
    setState({ currentImage: newImg });
    canvas.width = result.width;
    canvas.height = result.height;
    ctx.drawImage(newImg, 0, 0);
    cropSelectionHandler.showDefault();
  });
}

function renderResize() {
  toolPanel.innerHTML = `
    <h3>尺寸调整</h3>
    <div class="tool-group">
      <label>宽度 (px)</label>
      <input type="number" class="input" id="resizeW" value="${state.resize.width}">
    </div>
    <div class="tool-group">
      <label>高度 (px)</label>
      <input type="number" class="input" id="resizeH" value="${state.resize.height}">
    </div>
    <div class="tool-group">
      <label class="checkbox-label">
        <input type="checkbox" id="aspectLock" ${state.resize.aspectLocked ? 'checked' : ''}>
        保持宽高比
      </label>
    </div>
    <button class="btn btn-primary" id="applyResize">应用调整</button>
  `;

  let aspectRatio = canvas.width / canvas.height;

  document.getElementById('aspectLock').addEventListener('change', (e) => {
    setState({ resize: { ...state.resize, aspectLocked: e.target.checked } });
    if (e.target.checked) {
      aspectRatio = canvas.width / canvas.height;
    }
  });

  document.getElementById('resizeW').addEventListener('input', (e) => {
    if (state.resize.aspectLocked) {
      const w = parseInt(e.target.value) || 0;
      document.getElementById('resizeH').value = Math.round(w / aspectRatio);
    }
  });

  document.getElementById('resizeH').addEventListener('input', (e) => {
    if (state.resize.aspectLocked) {
      const h = parseInt(e.target.value) || 0;
      document.getElementById('resizeW').value = Math.round(h * aspectRatio);
    }
  });

  document.getElementById('applyResize').addEventListener('click', async () => {
    const w = parseInt(document.getElementById('resizeW').value);
    const h = parseInt(document.getElementById('resizeH').value);
    const result = imageProcessor.resize(state.currentImage, w, h);
    const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
    setState({ currentImage: newImg, resize: { width: w, height: h, aspectLocked: state.resize.aspectLocked } });
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(newImg, 0, 0);
  });
}

function renderWatermark() {
  toolPanel.innerHTML = `
    <h3>水印处理</h3>
    <div class="tool-group">
      <label>水印类型</label>
      <div class="shape-btns">
        <button class="shape-btn ${state.watermark.type === 'text' ? 'active' : ''}" data-watermark="text">文字</button>
        <button class="shape-btn ${state.watermark.type === 'image' ? 'active' : ''}" data-watermark="image">图片</button>
      </div>
    </div>

    <div id="textWatermarkOpts">
      <div class="tool-group">
        <label>水印文字</label>
        <input type="text" class="input" id="watermarkText" value="${state.watermark.text}">
      </div>
      <div class="tool-group">
        <label>字体大小</label>
        <input type="number" class="input" id="watermarkSize" value="${state.watermark.fontSize}">
      </div>
      <div class="tool-group">
        <label>水印颜色</label>
        <input type="color" id="watermarkColor" value="${state.watermark.color}">
      </div>
    </div>

    <div id="imageWatermarkOpts" style="display:none">
      <div class="tool-group">
        <label>上传水印图片</label>
        <input type="file" class="input" id="watermarkImage" accept="image/*">
      </div>
    </div>

    <div class="tool-group">
      <label>透明度: <span id="alphaLabel">${state.watermark.alpha}</span>%</label>
      <input type="range" class="slider" id="watermarkAlpha" min="0" max="100" value="${state.watermark.alpha}">
    </div>

    <div class="tool-group">
      <label>水印位置</label>
      <div class="position-grid">
        ${['top-left','top-center','top-right','middle-left','middle-center','middle-right','bottom-left','bottom-center','bottom-right'].map(pos => `
          <button class="pos-btn ${state.watermark.position === pos ? 'active' : ''}" data-pos="${pos}">
            ${pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}
          </button>
        `).join('')}
      </div>
    </div>

    <button class="btn btn-primary" id="applyWatermark">添加水印</button>
  `;

  // 事件绑定...
  bindWatermarkEvents();
}

function bindWatermarkEvents() {
  document.querySelectorAll('.shape-btn[data-watermark]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.watermark;
      setState({ watermark: { ...state.watermark, type } });
      document.querySelectorAll('.shape-btn[data-watermark]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('textWatermarkOpts').style.display = type === 'text' ? 'block' : 'none';
      document.getElementById('imageWatermarkOpts').style.display = type === 'image' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ watermark: { ...state.watermark, position: btn.dataset.pos } });
      document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('watermarkAlpha').addEventListener('input', (e) => {
    document.getElementById('alphaLabel').textContent = e.target.value;
    setState({ watermark: { ...state.watermark, alpha: parseInt(e.target.value) } });
  });

  document.getElementById('applyWatermark').addEventListener('click', () => {
    // 水印应用逻辑
  });
}

function renderBase64() {
  toolPanel.innerHTML = `
    <h3>Base64 转换</h3>
    <div class="tool-group">
      <label>Base64 字符串</label>
      <textarea class="input" id="base64Input" rows="4" placeholder="粘贴 Base64 字符串或拖入图片"></textarea>
    </div>
    <div class="shape-btns">
      <button class="btn btn-secondary" id="encodeBase64">编码图片</button>
      <button class="btn btn-secondary" id="decodeBase64">解码 Base64</button>
    </div>
    <button class="btn btn-primary" id="copyBase64" style="margin-top:var(--space-sm)">复制 Base64</button>
  `;

  document.getElementById('encodeBase64').addEventListener('click', async () => {
    const blob = await imageProcessor.exportCanvas(canvas, state.format, state.quality);
    const base64Str = await base64.imageToBase64(blob);
    document.getElementById('base64Input').value = base64Str;
  });

  document.getElementById('decodeBase64').addEventListener('click', async () => {
    const base64Str = document.getElementById('base64Input').value.trim();
    if (!base64Str) return;
    const blob = await base64.base64ToImage(base64Str);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = async () => {
      setState({ currentImage: img, originalImage: img });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      emptyState.style.display = 'none';
      canvasWrapper.style.display = 'block';
      exportBtn.disabled = false;
    };
    img.src = url;
  });

  document.getElementById('copyBase64').addEventListener('click', async () => {
    const text = document.getElementById('base64Input').value;
    if (text) {
      await base64.copyToClipboard(text);
      alert('已复制到剪贴板');
    }
  });
}

function renderRotate() {
  toolPanel.innerHTML = `
    <h3>图像旋转</h3>
    <div style="display:flex; gap:var(--space-md); margin-top:var(--space-lg)">
      <button class="btn btn-secondary" id="rotateLeft" style="flex:1; flex-direction:column; padding:var(--space-lg)">
        <span style="font-size:2rem">↺</span>
        左旋 90°
      </button>
      <button class="btn btn-secondary" id="rotateRight" style="flex:1; flex-direction:column; padding:var(--space-lg)">
        <span style="font-size:2rem">↻</span>
        右旋 90°
      </button>
    </div>
  `;

  document.getElementById('rotateLeft').addEventListener('click', handleRotate.bind(null, -90));
  document.getElementById('rotateRight').addEventListener('click', handleRotate.bind(null, 90));
}

async function handleRotate(degrees) {
  const result = imageProcessor.rotate(state.currentImage, degrees);
  const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
  setState({ currentImage: newImg });
  canvas.width = result.width;
  canvas.height = result.height;
  ctx.drawImage(newImg, 0, 0);
}

// 初始化
init();
```

- [ ] **Step 2: 提交**

```bash
git add scripts/app.js
git commit -m "feat: add all feature page renders"
```

---

### Task 7: 辅助模块

**文件:** 创建 `scripts/utils/formatConverter.js`, `scripts/utils/watermark.js`, `scripts/utils/base64.js`

- [ ] **Step 1: 创建 formatConverter.js**

```javascript
export function convertFormat(canvas, format, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), format, quality / 100);
  });
}

export function getExtension(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return map[mimeType] || 'png';
}

export function getMimeType(format) {
  const map = {
    'jpeg': 'image/jpeg', 'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  return map[format.toLowerCase()] || 'image/png';
}
```

- [ ] **Step 2: 创建 watermark.js**

```javascript
export function addTextWatermark(canvas, text, fontSize, color, alpha, position) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const ctx = newCanvas.getContext('2d');

  ctx.drawImage(canvas, 0, 0);
  ctx.globalAlpha = alpha / 100;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';

  const pos = calculatePosition(ctx, canvas.width, canvas.height, text, fontSize, position);
  ctx.fillText(text, pos.x, pos.y);

  return newCanvas;
}

export function addImageWatermark(canvas, watermarkImg, alpha, position) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const ctx = newCanvas.getContext('2d');

  ctx.drawImage(canvas, 0, 0);

  const maxW = canvas.width * 0.3;
  const maxH = canvas.height * 0.3;
  const ratio = Math.min(maxW / watermarkImg.width, maxH / watermarkImg.height, 1);
  const wmW = watermarkImg.width * ratio;
  const wmH = watermarkImg.height * ratio;

  const pos = calculateImagePosition(ctx, canvas.width, canvas.height, wmW, wmH, position);

  ctx.globalAlpha = alpha / 100;
  ctx.drawImage(watermarkImg, pos.x, pos.y, wmW, wmH);

  return newCanvas;
}

function calculatePosition(ctx, canvasW, canvasH, text, fontSize, position) {
  const metrics = ctx.measureText(text);
  const padding = 20;
  const positions = {
    'top-left': { x: padding, y: padding + fontSize / 2 },
    'top-center': { x: (canvasW - metrics.width) / 2, y: padding + fontSize / 2 },
    'top-right': { x: canvasW - metrics.width - padding, y: padding + fontSize / 2 },
    'middle-left': { x: padding, y: canvasH / 2 },
    'middle-center': { x: (canvasW - metrics.width) / 2, y: canvasH / 2 },
    'middle-right': { x: canvasW - metrics.width - padding, y: canvasH / 2 },
    'bottom-left': { x: padding, y: canvasH - padding - fontSize / 2 },
    'bottom-center': { x: (canvasW - metrics.width) / 2, y: canvasH - padding - fontSize / 2 },
    'bottom-right': { x: canvasW - metrics.width - padding, y: canvasH - padding - fontSize / 2 }
  };
  return positions[position] || positions['bottom-right'];
}

function calculateImagePosition(ctx, canvasW, canvasH, wmW, wmH, position) {
  const padding = 20;
  const positions = {
    'top-left': { x: padding, y: padding },
    'top-center': { x: (canvasW - wmW) / 2, y: padding },
    'top-right': { x: canvasW - wmW - padding, y: padding },
    'middle-left': { x: padding, y: (canvasH - wmH) / 2 },
    'middle-center': { x: (canvasW - wmW) / 2, y: (canvasH - wmH) / 2 },
    'middle-right': { x: canvasW - wmW - padding, y: (canvasH - wmH) / 2 },
    'bottom-left': { x: padding, y: canvasH - wmH - padding },
    'bottom-center': { x: (canvasW - wmW) / 2, y: canvasH - wmH - padding },
    'bottom-right': { x: canvasW - wmW - padding, y: canvasH - wmH - padding }
  };
  return positions[position] || positions['bottom-right'];
}
```

- [ ] **Step 3: 创建 base64.js**

```javascript
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToImage(base64) {
  return new Promise((resolve, reject) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const byteString = atob(arr[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    resolve(new Blob([ab], { type: mime }));
  });
}

export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add scripts/utils/formatConverter.js scripts/utils/watermark.js scripts/utils/base64.js
git commit -m "feat: add formatConverter, watermark, and base64 modules"
```

---

### Task 8: 清理和测试验证

- [ ] **Step 1: 删除旧的不需要的文件**（如果有）

- [ ] **Step 2: 验证文件结构**

```bash
ls -la D:/Engineering/image-processing-tools/
ls -la D:/Engineering/image-processing-tools/styles/
ls -la D:/Engineering/image-processing-tools/scripts/
ls -la D:/Engineering/image-processing-tools/scripts/utils/
```

- [ ] **Step 3: 测试**

1. 在浏览器中打开 `D:\Engineering\image-processing-tools\index.html`
2. 测试路由切换
3. 导入图片测试各功能
4. 验证导出

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: complete Turing Tools image processing application"
```

---

## 验证清单

- [ ] CSS 设计系统完整（颜色、圆角、间距、阴影）
- [ ] 路由系统正常切换
- [ ] 图片导入（文件选择 + 拖放）
- [ ] 格式转换（ JPEG/PNG/WebP + 质量滑块）
- [ ] 图像压缩（质量滑块 + 预估大小）
- [ ] 图片裁切（矩形/圆形选区 + 拖动/缩放）
- [ ] 尺寸调整（宽高输入 + 等比例锁定）
- [ ] 水印处理（文字/图片 + 位置 + 透明度）
- [ ] Base64（编码/解码/复制）
- [ ] 图像旋转（左旋/右旋 90°）
- [ ] 导出功能正常
