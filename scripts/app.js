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
const cropSelectionEl = document.getElementById('cropSelection');
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
  cropSelectionHandler = new CropSelection(canvas, cropSelectionEl, cropOverlay);
}

// ============ RENDER FUNCTIONS ============

// 各功能页面渲染
export function render(hash) {
  // Load empty state or current image
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
      <input type="number" class="input" id="resizeW" value="${canvas.width}">
    </div>
    <div class="tool-group">
      <label>高度 (px)</label>
      <input type="number" class="input" id="resizeH" value="${canvas.height}">
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

    <div id="textWatermarkOpts" style="${state.watermark.type !== 'text' ? 'display:none' : ''}">
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

    <div id="imageWatermarkOpts" style="${state.watermark.type !== 'image' ? 'display:none' : ''}">
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

  bindWatermarkEvents();
}

function bindWatermarkEvents() {
  let watermarkImg = null;

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

  document.getElementById('watermarkImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => { watermarkImg = img; };
      img.src = URL.createObjectURL(file);
    }
  });

  document.getElementById('applyWatermark').addEventListener('click', async () => {
    let newCanvas;
    if (state.watermark.type === 'text') {
      const text = document.getElementById('watermarkText').value;
      const fontSize = parseInt(document.getElementById('watermarkSize').value) || 24;
      const color = document.getElementById('watermarkColor').value;
      newCanvas = watermark.addTextWatermark(canvas, text, fontSize, color, state.watermark.alpha, state.watermark.position);
    } else if (watermarkImg) {
      newCanvas = watermark.addImageWatermark(canvas, watermarkImg, state.watermark.alpha, state.watermark.position);
    } else {
      alert('请先上传水印图片');
      return;
    }
    const newImg = await imageProcessor.loadImageFromCanvas(newCanvas);
    setState({ currentImage: newImg });
    canvas.width = newCanvas.width;
    canvas.height = newCanvas.height;
    ctx.drawImage(newImg, 0, 0);
  });
}

function renderBase64() {
  toolPanel.innerHTML = `
    <h3>Base64 转换</h3>
    <div class="tool-group">
      <label>Base64 字符串</label>
      <textarea class="input" id="base64Input" rows="4" placeholder="粘贴 Base64 字符串"></textarea>
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
    try {
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
    } catch (err) {
      alert('Base64解码失败，请检查输入是否正确');
    }
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

  document.getElementById('rotateLeft').addEventListener('click', () => handleRotate(-90));
  document.getElementById('rotateRight').addEventListener('click', () => handleRotate(90));
}

async function handleRotate(degrees) {
  const result = imageProcessor.rotate(state.currentImage, degrees);
  const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
  setState({ currentImage: newImg });
  canvas.width = result.width;
  canvas.height = result.height;
  ctx.drawImage(newImg, 0, 0);
}

// 导出渲染函数供 router 使用
export { ctx, canvas, toolPanel, state, setState, cropSelectionHandler, cropOverlay, cropSelectionEl };