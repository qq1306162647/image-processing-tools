import { state, setState, getState, resetState } from './state.js';
import { initRouter } from './router.js';
import * as imageProcessor from './utils/imageProcessor.js';
import * as formatConverter from './utils/formatConverter.js';
import * as watermark from './utils/watermark.js';
import * as base64 from './utils/base64.js';
import { CropSelection } from './utils/cropSelection.js';

// DOM 元素
const fileInput = document.getElementById('fileInput');
const toolContent = document.getElementById('toolContent');
const uploadBtn = document.getElementById('uploadBtn');

let currentCanvas = null;
let currentCtx = null;
let cropSelectionHandler = null;
let pendingRotation = 0;

// 初始化
export function init() {
  initRouter(render);
  initEventListeners();
}

function initEventListeners() {
  uploadBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', handleFileSelect);

  // 导航链接点击
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const route = item.getAttribute('data-route');
      if (route) {
        window.location.hash = route;
      }
    });
  });
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) loadImage(file);
}

function loadImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();

  // 从 file.type 获取原图格式，如果没有则根据扩展名判断
  let originalFormat = file.type || 'image/png';
  if (!originalFormat.startsWith('image/')) {
    originalFormat = 'image/png';
  }

  img.onload = () => {
    setState({
      originalImage: img,
      currentImage: img,
      originalSize: file.size,
      originalFormat: originalFormat,
      format: originalFormat  // 默认使用原图格式
    });

    // 重新渲染当前页面以显示图片
    render(window.location.hash || '#/');
  };

  img.onerror = () => {
    alert('图片加载失败，请尝试其他图片');
  };

  img.src = url;
  return img;
}

// ============ RENDER FUNCTIONS ============

export function render(hash) {
  // 根据路由渲染内容
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
    default:
      renderHome();
  }
}

function renderHome() {
  toolContent.innerHTML = `
    <div class="flex-1 p-md md:p-xl flex flex-col gap-xl overflow-y-auto">
      <!-- Tools Grid Section -->
      <section class="flex flex-col gap-lg">
        <div class="flex items-center justify-between">
          <h3 class="font-headline-md text-headline-md font-bold text-on-surface">所有工具</h3>
          <div class="flex items-center gap-xs text-primary cursor-pointer hover:underline">
            <span class="font-button-text text-button-text">查看使用文档</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md md:gap-lg">
          ${getToolCards()}
        </div>
      </section>
    </div>
  `;
}

function getToolCards() {
  const tools = [
    { icon: 'transform', title: '格式转换', desc: '在常见图像格式间进行高质量无损转换，支持批量处理。', href: '#/format' },
    { icon: 'crop', title: '图片裁切', desc: '自由裁剪图像区域，支持预设固定比例或自定义宽高比。', href: '#/crop' },
    { icon: 'aspect_ratio', title: '尺寸调整', desc: '精确调整图像的像素尺寸，或按百分比快速进行缩放。', href: '#/resize' },
    { icon: 'compress', title: '图片压缩', desc: '智能压缩算法，在保留视觉质量的同时大幅减小文件体积。', href: '#/compress' },
    { icon: 'branding_watermark', title: '水印工具', desc: '为图片添加自定义文本或图像防盗水印，保护版权安全。', href: '#/watermark' },
    { icon: 'code', title: 'Base64转换', desc: '快速将本地图像转换为Base64编码，或将编码还原为图像。', href: '#/base64' },
    { icon: 'rotate_right', title: '旋转工具', desc: '支持标准90度、180度翻转，以及自定义精确角度旋转。', href: '#/rotate' }
  ];

  return tools.map(tool => `
    <a href="${tool.href}" class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md hover:shadow-md hover:border-primary hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <div class="w-12 h-12 rounded-lg bg-surface flex items-center justify-center group-hover:bg-primary-container transition-colors duration-300">
        <span class="material-symbols-outlined text-primary group-hover:text-on-primary-container">${tool.icon}</span>
      </div>
      <div>
        <h4 class="font-button-text text-button-text font-bold text-on-surface mb-xs">${tool.title}</h4>
        <p class="font-body-md text-body-md text-on-surface-variant">${tool.desc}</p>
      </div>
    </a>
  `).join('');
}

function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  const selectFileBtn = document.getElementById('selectFileBtn');
  if (!dropzone) return;

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  });

  dropzone.addEventListener('click', () => {
    document.getElementById('fileInput')?.click();
  });

  selectFileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('fileInput')?.click();
  });
}

function renderFormat() {
  const img = getState('currentImage');
  toolContent.innerHTML = `
    <section class="flex-1 p-xl overflow-y-auto flex flex-col gap-lg">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">格式转换</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">支持批量上传，快速转换为目标格式，保持高质量输出。</p>
        </div>
      </div>
      ${state.currentImage ? `
      <!-- Image Preview -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex items-center justify-center min-h-[320px]">
        <img id="previewImage" src="${state.currentImage.src}" class="max-w-full max-h-[400px] object-contain shadow-md" alt="Preview"/>
      </div>
      ` : `
      <!-- Dropzone -->
      <div id="dropzone" class="w-full bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary hover:bg-surface transition-all duration-200 rounded-xl min-h-[320px] flex flex-col items-center justify-center p-xl cursor-pointer group dropzone">
        <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md group-hover:bg-primary-fixed transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" style="font-size: 32px;">upload_file</span>
        </div>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">点击或拖拽文件到此处</h3>
        <p class="font-body-md text-body-md text-on-surface-variant text-center max-w-sm mb-lg">
          支持 PNG, JPG, JPEG, WEBP, GIF 等主流图片格式。<br/>单次最多支持上传 50 个文件。
        </p>
        <button id="selectFileBtn" class="bg-surface text-primary border border-outline-variant px-lg py-sm rounded-lg font-button-text text-button-text hover:border-primary hover:bg-surface-container-lowest transition-colors shadow-sm">
          选择文件
        </button>
      </div>
      `}
    </section>
    <!-- Right: Properties Panel -->
    <aside class="w-full lg:w-[320px] bg-surface-container-lowest border-l border-outline-variant flex flex-col shrink-0 h-full overflow-y-auto">
      <div class="p-lg border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
        <h3 class="font-headline-md text-headline-md text-on-surface">转换设置</h3>
      </div>
      <div class="p-lg flex flex-col gap-xl flex-1">
        <!-- Setting Group: Target Format -->
        <div class="flex flex-col gap-sm">
          <label class="font-button-text text-button-text text-on-surface flex items-center justify-between" for="targetFormat">
            目标格式
            <span class="material-symbols-outlined text-on-surface-variant" style="font-size: 16px;" title="选择您希望将文件转换为的格式">info</span>
          </label>
          <div class="relative">
            <select class="w-full appearance-none bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg pl-md pr-10 py-[10px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow cursor-pointer" id="targetFormat">
              <option value="image/webp" ${state.format === 'image/webp' ? 'selected' : ''}>WEBP (推荐，高压缩比)</option>
              <option value="image/png" ${state.format === 'image/png' ? 'selected' : ''}>PNG (无损，支持透明)</option>
              <option value="image/jpeg" ${state.format === 'image/jpeg' ? 'selected' : ''}>JPG / JPEG (适合照片)</option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>
        <!-- Setting Group: Quality -->
        <div class="flex flex-col gap-sm">
          <div class="flex items-center justify-between">
            <label class="font-button-text text-button-text text-on-surface">输出质量</label>
            <span class="font-label-md text-label-md text-primary bg-primary-fixed px-2 py-0.5 rounded" id="qualityLabel">${state.quality}%</span>
          </div>
          <input class="w-full mt-2" id="qualitySlider" max="100" min="1" type="range" value="${state.quality}"/>
          <div class="flex justify-between font-label-md text-label-md text-on-surface-variant mt-1">
            <span>小体积</span>
            <span>高质量</span>
          </div>
        </div>
      </div>
      <!-- Sticky Action Area -->
      <div class="p-lg border-t border-outline-variant bg-surface-container-lowest mt-auto sticky bottom-0">
        <button class="w-full bg-primary text-on-primary font-button-text text-button-text py-[12px] rounded-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-sm" id="exportBtn">
          <span class="material-symbols-outlined" style="font-size: 20px;">play_arrow</span>
          开始转换
        </button>
      </div>
    </aside>
  `;

  setupDropzone();
  setupFormatPanel();
}

function setupFormatPanel() {
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityLabel = document.getElementById('qualityLabel');
  const exportBtn = document.getElementById('exportBtn');
  const formatSelect = document.getElementById('targetFormat');

  qualitySlider?.addEventListener('input', (e) => {
    const quality = parseInt(e.target.value);
    setState({ quality });
    if (qualityLabel) qualityLabel.textContent = `${quality}%`;
  });

  formatSelect?.addEventListener('change', (e) => {
    setState({ format: e.target.value });
  });

  exportBtn?.addEventListener('click', () => handleExport());
}

function renderCompress() {
  toolContent.innerHTML = `
    <section class="flex-1 md:p-xl flex flex-col lg:flex-row gap-lg">
      <!-- Comparison Canvas -->
      <div class="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
        <div class="h-12 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="font-label-md text-label-md text-on-surface">原图 (${formatSize(state.originalSize || 0)})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-error"></span>
            <span class="font-label-md text-label-md text-on-surface">压缩后 (预估: <span id="estimatedSize">-</span>)</span>
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center bg-checker p-xl">
          ${state.currentImage
            ? `<img id="previewImage" src="${state.currentImage.src}" class="max-w-full max-h-full object-contain shadow-md" alt="Preview"/>`
            : `<div class="flex flex-col items-center justify-center gap-md text-center">
                <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span class="material-symbols-outlined text-[32px] text-on-surface-variant">transform</span>
                </div>
                <p class="text-on-surface-variant mb-sm">请先上传图片</p>
                <button class="px-lg py-sm bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container transition-colors" onclick="document.getElementById('fileInput').click()">选择图片</button>
              </div>`
          }
        </div>
      </div>
      <!-- Properties Panel -->
      <div class="w-full lg:w-[320px] flex flex-col gap-4">
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
          <h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">tune</span>
            压缩设置
          </h3>
          <!-- Quality Slider -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="font-body-md text-body-md text-on-surface font-medium">压缩质量</label>
              <span class="font-body-md text-body-md text-primary font-bold" id="qualityValue">${state.quality}%</span>
            </div>
            <input class="w-full" id="compressSlider" max="100" min="1" type="range" value="${state.quality}"/>
            <div class="flex justify-between items-center mt-2 text-on-surface-variant font-label-md text-label-md">
              <span>文件更小</span>
              <span>画质更好</span>
            </div>
          </div>
        </div>
        <!-- Stats Card -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
          <h3 class="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">analytics</span>
            预估结果
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-outline-variant/50">
              <span class="font-body-md text-body-md text-on-surface-variant">原文件</span>
              <span class="font-body-md text-body-md text-on-surface font-semibold" id="originalSizeLabel">${formatSize(state.originalSize || 0)}</span>
            </div>
            <div class="flex justify-center text-outline">
              <span class="material-symbols-outlined">arrow_downward</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-secondary-container rounded-lg border border-secondary-fixed-dim">
              <span class="font-body-md text-body-md text-on-secondary-container font-medium">压缩后</span>
              <span class="font-body-md text-body-md text-primary font-bold text-lg" id="compressedSizeLabel">-</span>
            </div>
            <div class="flex justify-center mt-2">
              <span class="font-label-md text-label-md text-on-surface-variant" id="compressRatioLabel"></span>
            </div>
          </div>
        </div>
        <!-- Actions -->
        <div class="mt-auto pt-4 flex flex-col gap-3">
          <button class="w-full py-3 bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container transition-colors active:scale-[0.98] shadow-sm flex items-center justify-center gap-2" id="downloadBtn">
            <span class="material-symbols-outlined text-[20px]">download</span>
            下载图片
          </button>
        </div>
      </div>
    </section>
  `;

  setupCompressPanel();
}

function setupCompressPanel() {
  const compressSlider = document.getElementById('compressSlider');
  const qualityValue = document.getElementById('qualityValue');
  const downloadBtn = document.getElementById('downloadBtn');
  let debounceTimer = null;

  compressSlider?.addEventListener('input', async (e) => {
    const quality = parseInt(e.target.value);
    setState({ quality });
    qualityValue.textContent = `${quality}%`;

    // 防抖：停止拖动 200ms 后再计算
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateCompressPreview();
    }, 200);
  });

  downloadBtn?.addEventListener('click', () => {
    handleExport('image/jpeg');
  });

  updateCompressPreview();
}

async function updateCompressPreview() {
  const img = getState('currentImage');
  if (!img) return;

  const originalSize = state.originalSize || 0;
  if (originalSize === 0) return;

  // 对原图进行真实压缩来获取准确大小
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', state.quality / 100);
  });

  if (!blob) return;

  const estimatedSize = blob.size;

  const compressedLabel = document.getElementById('compressedSizeLabel');
  if (compressedLabel) {
    compressedLabel.textContent = formatSize(estimatedSize);

    if (estimatedSize > originalSize) {
      compressedLabel.classList.remove('text-primary');
      compressedLabel.classList.add('text-error');
    } else {
      compressedLabel.classList.remove('text-error');
      compressedLabel.classList.add('text-primary');
    }
  }

  const ratioLabel = document.getElementById('compressRatioLabel');
  if (ratioLabel) {
    const savedPercent = Math.round((1 - estimatedSize / originalSize) * 100);
    if (savedPercent > 0) {
      ratioLabel.textContent = `节省 ${savedPercent}%`;
      ratioLabel.classList.remove('text-error');
      ratioLabel.classList.add('text-primary');
    } else if (savedPercent < 0) {
      ratioLabel.textContent = `增大 ${Math.abs(savedPercent)}%`;
      ratioLabel.classList.remove('text-primary');
      ratioLabel.classList.add('text-error');
    } else {
      ratioLabel.textContent = '大小相同';
      ratioLabel.classList.remove('text-error', 'text-primary');
    }
  }
}

function renderCrop() {
  const hasImage = !!state.currentImage;
  const imageSrc = hasImage ? state.currentImage.src : '';
  const currentShape = state.cropSelection?.shape || 'rect';
  const isCircle = currentShape === 'circle';

  toolContent.innerHTML = `
    <section class="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <!-- Canvas Area -->
      <div class="flex-1 flex items-center justify-center p-lg md:p-xl overflow-auto min-h-[500px]" id="cropArea">
        <div id="cropWrapper" class="relative inline-block rounded-xl border border-outline-variant shadow-sm bg-checker" style="display: ${hasImage ? 'inline-block' : 'none'};">
          <!-- 图像容器 -->
          <div id="imageContainer" class="relative inline-block">
            <img id="cropImage" src="${imageSrc}" class="block max-w-full max-h-[calc(100vh-200px)] object-contain" alt="Crop">
            <!-- SVG 蒙版层 - 用于圆形选区 -->
            <svg id="maskSvg" class="absolute inset-0 pointer-events-none z-10" style="display: none;">
              <defs>
                <mask id="cropMask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                  <circle id="maskCircle" cx="0" cy="0" r="0" fill="black"/>
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#cropMask)"/>
            </svg>
            <!-- 四DIV蒙版层 - 用于矩形选区 -->
            <div id="maskTop" class="absolute pointer-events-none bg-black/50 z-10" style=""></div>
            <div id="maskBottom" class="absolute pointer-events-none bg-black/50 z-10" style=""></div>
            <div id="maskLeft" class="absolute pointer-events-none bg-black/50 z-10" style=""></div>
            <div id="maskRight" class="absolute pointer-events-none bg-black/50 z-10" style=""></div>
            <!-- Selection box - transparent background, shows clear image -->
            <div id="selectionBox" class="absolute border-2 border-dashed border-white cursor-move bg-transparent z-20 ${isCircle ? 'circle' : ''}" style="display: ${hasImage ? 'block' : 'none'};">
              <div class="resize-handle nw"></div>
              <div class="resize-handle n"></div>
              <div class="resize-handle ne"></div>
              <div class="resize-handle e"></div>
              <div class="resize-handle se"></div>
              <div class="resize-handle s"></div>
              <div class="resize-handle sw"></div>
              <div class="resize-handle w"></div>
            </div>
          </div>
        </div>
        <!-- Empty state -->
        <div id="emptyState" class="flex flex-col items-center justify-center gap-md text-center" style="display: ${hasImage ? 'none' : 'flex'};">
          <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
            <span class="material-symbols-outlined text-[32px] text-on-surface-variant">crop</span>
          </div>
          <p class="text-on-surface-variant">请先上传图片</p>
          <button class="px-lg py-sm bg-primary text-on-primary rounded-lg font-button-text text-button-text" onclick="document.getElementById('fileInput').click()">选择图片</button>
        </div>
      </div>
      <!-- Settings Panel -->
      <div class="w-full lg:w-[320px] bg-surface-container-lowest border-l border-outline-variant flex flex-col shrink-0 h-full overflow-y-auto">
        <div class="p-lg border-b border-outline-variant">
          <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">裁剪设置</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">调整图片的裁剪区域与尺寸</p>
        </div>
        <div class="p-lg flex flex-col gap-lg flex-1">
          <!-- Crop Shape -->
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-sm">裁剪形状</label>
            <div class="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant" id="shapeBtns">
              <button id="rectShapeBtn" class="flex-1 py-sm rounded-md font-body-md text-body-md flex items-center justify-center gap-xs transition-colors ${!isCircle ? 'bg-surface-container-lowest shadow-sm text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px]">crop_square</span>
                矩形
              </button>
              <button id="circleShapeBtn" class="flex-1 py-sm rounded-md font-body-md text-body-md flex items-center justify-center gap-xs transition-colors ${isCircle ? 'bg-surface-container-lowest shadow-sm text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}">
                <span class="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
                圆形
              </button>
            </div>
          </div>
          <!-- Aspect Ratio -->
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-sm">纵横比</label>
            <div class="grid grid-cols-3 gap-sm" id="aspectBtns">
              <button class="aspect-btn py-sm border-2 border-primary bg-primary-fixed text-primary rounded-lg font-body-md text-body-md font-medium active" data-ratio="free">自由</button>
              <button class="aspect-btn py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" data-ratio="1:1">1:1</button>
              <button class="aspect-btn py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" data-ratio="4:3">4:3</button>
              <button class="aspect-btn py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" data-ratio="16:9">16:9</button>
              <button class="aspect-btn py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" data-ratio="3:2">3:2</button>
              <button class="aspect-btn py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" data-ratio="2:3">2:3</button>
            </div>
          </div>
          <!-- Manual Size Input -->
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-sm">裁剪尺寸 (px)</label>
            <div class="flex items-center gap-sm">
              <div class="flex-1 relative">
                <span class="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">宽</span>
                <input class="w-full h-[40px] pl-lg pr-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-right" type="number" id="cropW" value="${state.currentImage?.width || 800}"/>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant text-[16px]">close</span>
              <div class="flex-1 relative">
                <span class="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">高</span>
                <input class="w-full h-[40px] pl-lg pr-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-right" type="number" id="cropH" value="${state.currentImage?.height || 600}"/>
              </div>
            </div>
          </div>
          <!-- 裁切结果预览 -->
          <div id="cropPreviewSection" style="display: none;">
            <label class="block font-label-md text-label-md text-on-surface mb-sm">裁切结果</label>
            <div class="border border-outline-variant rounded-lg overflow-hidden bg-checker cursor-pointer hover:opacity-90 transition-opacity" id="cropPreviewContainer">
              <img id="cropPreviewImage" src="" class="block max-w-full h-auto" alt="Crop Preview">
            </div>
            <button class="w-full mt-sm h-[40px] bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-xs" id="downloadCropBtn">
              <span class="material-symbols-outlined text-[18px]">download</span>
              下载图像
            </button>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="p-lg border-t border-outline-variant mt-auto flex gap-md bg-surface-container-lowest">
          <button class="flex-1 h-[40px] bg-surface-container-lowest border border-outline-variant text-primary rounded-lg font-button-text text-button-text hover:bg-surface-container-low transition-colors" id="resetCropBtn">重置</button>
          <button class="flex-1 h-[40px] bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container active:scale-[0.98] transition-all" id="applyCropBtn">应用裁剪</button>
        </div>
      </div>
    </section>
    <!-- Image Preview Modal -->
    <div id="imagePreviewModal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-xl" style="display: none;">
      <div class="relative max-w-full max-h-full">
        <img id="previewModalImage" src="" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="Preview">
        <button id="closePreviewBtn" class="absolute -top-sm -right-sm w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-lg">
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>
    </div>
    <!-- Zoom Controls -->
    <div class="fixed bottom-xl left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-outline-variant rounded-full px-md py-sm flex items-center gap-md shadow-lg" style="display: ${state.currentImage ? 'flex' : 'none'};" id="zoomControls">
      <button class="text-on-surface-variant hover:text-primary transition-colors" id="zoomOutBtn"><span class="material-symbols-outlined text-[20px]">remove</span></button>
      <span class="font-label-md text-label-md text-on-surface min-w-[48px] text-center" id="zoomLevelLabel">100%</span>
      <button class="text-on-surface-variant hover:text-primary transition-colors" id="zoomInBtn"><span class="material-symbols-outlined text-[20px]">add</span></button>
      <div class="w-px h-4 bg-outline-variant"></div>
      <button class="text-on-surface-variant hover:text-primary transition-colors" id="zoomFitBtn"><span class="material-symbols-outlined text-[20px]">fit_screen</span></button>
    </div>
  `;

  setupCropPanel();
}

function setupCropPanel() {
  const rectShapeBtn = document.getElementById('rectShapeBtn');
  const circleShapeBtn = document.getElementById('circleShapeBtn');
  const aspectBtns = document.querySelectorAll('#aspectBtns button');
  const applyCropBtn = document.getElementById('applyCropBtn');
  const resetCropBtn = document.getElementById('resetCropBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomFitBtn = document.getElementById('zoomFitBtn');
  const zoomLevelLabel = document.getElementById('zoomLevelLabel');
  const zoomControls = document.getElementById('zoomControls');
  const cropImage = document.getElementById('cropImage');
  const selectionBox = document.getElementById('selectionBox');
  const cropWrapper = document.getElementById('cropWrapper');
  const emptyState = document.getElementById('emptyState');
  const imageContainer = document.getElementById('imageContainer');
  const cropPreviewSection = document.getElementById('cropPreviewSection');
  const cropPreviewImage = document.getElementById('cropPreviewImage');
  const downloadCropBtn = document.getElementById('downloadCropBtn');
  const imagePreviewModal = document.getElementById('imagePreviewModal');
  const previewModalImage = document.getElementById('previewModalImage');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  const cropPreviewContainer = document.getElementById('cropPreviewContainer');

  let zoomLevel = 100;
  let isDragging = false;
  let isResizing = false;
  let resizeHandle = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startWidth = 0;
  let startHeight = 0;
  let croppedImageData = null;

  // 初始化裁剪框
  if (state.currentImage && selectionBox && cropImage) {
    // 显示图片容器
    cropWrapper.style.display = 'inline-block';
    cropImage.style.display = 'block';
    if (zoomControls) zoomControls.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    // 等待图片加载完成后计算选区位置
    const initOnLoad = () => {
      // 先显示 selectionBox（初始尺寸为0）
      selectionBox.style.display = 'block';
      selectionBox.style.width = '1px';
      selectionBox.style.height = '1px';

      // 强制重排
      selectionBox.offsetHeight;

      // 然后设置正确的尺寸和位置
      initSelectionBox();
    };

    if (cropImage.complete && cropImage.naturalWidth > 0) {
      setTimeout(initOnLoad, 0);
    } else {
      cropImage.onload = initOnLoad;
    }
  }

  function initSelectionBox() {
    if (!selectionBox || !cropImage || !imageContainer) return;

    // 等待 DOM 更新
    requestAnimationFrame(() => {
      const imgRect = cropImage.getBoundingClientRect();
      const containerRect = imageContainer.getBoundingClientRect();

      // 计算图片在容器中的偏移
      const offsetX = imgRect.left - containerRect.left;
      const offsetY = imgRect.top - containerRect.top;

      // 计算选区尺寸（取图片尺寸的60%，最大300px）
      const selW = Math.min(imgRect.width * 0.6, 300);
      const selH = Math.min(imgRect.height * 0.6, 300);
      const selX = offsetX + (imgRect.width - selW) / 2;
      const selY = offsetY + (imgRect.height - selH) / 2;

      selectionBox.style.left = selX + 'px';
      selectionBox.style.top = selY + 'px';
      selectionBox.style.width = selW + 'px';
      selectionBox.style.height = selH + 'px';

      // 应用当前形状
      updateCropOverlay();
      // 更新蒙版
      updateMask();
    });
  }

  function updateCropOverlay() {
    if (!selectionBox) return;
    const shape = state.cropSelection?.shape || 'rect';
    if (shape === 'circle') {
      selectionBox.classList.add('circle');
      // 保持正方形
      const size = Math.min(selectionBox.offsetWidth, selectionBox.offsetHeight);
      selectionBox.style.width = size + 'px';
      selectionBox.style.height = size + 'px';
    } else {
      selectionBox.classList.remove('circle');
    }
  }

  // 更新蒙版层
  function updateMask() {
    const maskSvg = document.getElementById('maskSvg');
    const maskCircle = document.getElementById('maskCircle');
    const maskTop = document.getElementById('maskTop');
    const maskBottom = document.getElementById('maskBottom');
    const maskLeft = document.getElementById('maskLeft');
    const maskRight = document.getElementById('maskRight');
    if (!selectionBox || !imageContainer || !cropImage) return;

    const selRect = selectionBox.getBoundingClientRect();
    const imgRect = cropImage.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();
    const shape = state.cropSelection?.shape || 'rect';

    // 计算图片在容器中的偏移
    const imgOffsetX = imgRect.left - containerRect.left;
    const imgOffsetY = imgRect.top - containerRect.top;

    // 计算选区相对于图片的位置
    const selLeft = selRect.left - imgRect.left;
    const selTop = selRect.top - imgRect.top;
    const selRight = selLeft + selRect.width;
    const selBottom = selTop + selRect.height;

    if (shape === 'circle') {
      // 圆形选区：使用 SVG mask
      const selCenterX = selLeft + selRect.width / 2;
      const selCenterY = selTop + selRect.height / 2;
      const selRadius = Math.max(selRect.width, selRect.height) / 2;

      // 隐藏四个 DIV 蒙版
      maskTop.style.display = 'none';
      maskBottom.style.display = 'none';
      maskLeft.style.display = 'none';
      maskRight.style.display = 'none';

      // 显示并更新 SVG 蒙版
      if (maskSvg) {
        maskSvg.style.display = 'block';
        maskSvg.style.left = imgOffsetX + 'px';
        maskSvg.style.top = imgOffsetY + 'px';
        maskSvg.style.width = imgRect.width + 'px';
        maskSvg.style.height = imgRect.height + 'px';
        if (maskCircle) {
          maskCircle.setAttribute('cx', selCenterX);
          maskCircle.setAttribute('cy', selCenterY);
          maskCircle.setAttribute('r', selRadius);
        }
      }
    } else {
      // 矩形选区：使用四个 DIV 蒙版
      // 隐藏 SVG 蒙版
      if (maskSvg) maskSvg.style.display = 'none';

      // 顶部：从 (0,0) 到 (imgWidth, selTop)
      maskTop.style.left = imgOffsetX + 'px';
      maskTop.style.top = imgOffsetY + 'px';
      maskTop.style.width = imgRect.width + 'px';
      maskTop.style.height = selTop + 'px';
      maskTop.style.display = 'block';

      // 底部：从 (0, selBottom) 到 (imgWidth, imgHeight)
      maskBottom.style.left = imgOffsetX + 'px';
      maskBottom.style.top = (imgOffsetY + selBottom) + 'px';
      maskBottom.style.width = imgRect.width + 'px';
      maskBottom.style.height = (imgRect.height - selBottom) + 'px';
      maskBottom.style.display = 'block';

      // 左侧：在顶部和底部之间
      maskLeft.style.left = imgOffsetX + 'px';
      maskLeft.style.top = (imgOffsetY + selTop) + 'px';
      maskLeft.style.width = selLeft + 'px';
      maskLeft.style.height = (selBottom - selTop) + 'px';
      maskLeft.style.display = 'block';

      // 右侧：在顶部和底部之间
      maskRight.style.left = (imgOffsetX + selRight) + 'px';
      maskRight.style.top = (imgOffsetY + selTop) + 'px';
      maskRight.style.width = (imgRect.width - selRight) + 'px';
      maskRight.style.height = (selBottom - selTop) + 'px';
      maskRight.style.display = 'block';
    }
  }

  function updateZoom() {
    if (cropImage) {
      cropImage.style.transform = `scale(${zoomLevel / 100})`;
      // 缩放后更新蒙版位置
      setTimeout(updateMask, 0);
    }
    if (zoomLevelLabel) {
      zoomLevelLabel.textContent = `${zoomLevel}%`;
    }
  }

  zoomInBtn?.addEventListener('click', () => {
    zoomLevel = Math.min(200, zoomLevel + 25);
    updateZoom();
  });

  zoomOutBtn?.addEventListener('click', () => {
    zoomLevel = Math.max(25, zoomLevel - 25);
    updateZoom();
  });

  zoomFitBtn?.addEventListener('click', () => {
    zoomLevel = 100;
    updateZoom();
  });

  // 拖动选区
  selectionBox?.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = selectionBox.offsetLeft;
    startTop = selectionBox.offsetTop;
  });

  // 调整大小
  document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      resizeHandle = e.target.className.split(' ')[1];
      startX = e.clientX;
      startY = e.clientY;
      startLeft = selectionBox.offsetLeft;
      startTop = selectionBox.offsetTop;
      startWidth = selectionBox.offsetWidth;
      startHeight = selectionBox.offsetHeight;
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;

      const maxLeft = imageContainer.clientWidth - selectionBox.offsetWidth;
      const maxTop = imageContainer.clientHeight - selectionBox.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      selectionBox.style.left = newLeft + 'px';
      selectionBox.style.top = newTop + 'px';

      updateMask();
    }

    if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft;
      let newTop = startTop;
      let newWidth = startWidth;
      let newHeight = startHeight;
      const minSize = 50;
      const shape = state.cropSelection?.shape || 'rect';

      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(minSize, startWidth + dx);
          newHeight = Math.max(minSize, startHeight + dy);
          break;
        case 'sw':
          newWidth = Math.max(minSize, startWidth - dx);
          newHeight = Math.max(minSize, startHeight + dy);
          newLeft = startLeft + startWidth - newWidth;
          break;
        case 'ne':
          newWidth = Math.max(minSize, startWidth + dx);
          newHeight = Math.max(minSize, startHeight - dy);
          newTop = startTop + startHeight - newHeight;
          break;
        case 'nw':
          newWidth = Math.max(minSize, startWidth - dx);
          newHeight = Math.max(minSize, startHeight - dy);
          newLeft = startLeft + startWidth - newWidth;
          newTop = startTop + startHeight - newHeight;
          break;
        case 'n':
          newHeight = Math.max(minSize, startHeight - dy);
          newTop = startTop + startHeight - newHeight;
          break;
        case 's':
          newHeight = Math.max(minSize, startHeight + dy);
          break;
        case 'e':
          newWidth = Math.max(minSize, startWidth + dx);
          break;
        case 'w':
          newWidth = Math.max(minSize, startWidth - dx);
          newLeft = startLeft + startWidth - newWidth;
          break;
      }

      if (shape === 'circle') {
        const size = Math.min(newWidth, newHeight);
        newWidth = size;
        newHeight = size;
      }

      selectionBox.style.width = newWidth + 'px';
      selectionBox.style.height = newHeight + 'px';
      selectionBox.style.left = newLeft + 'px';
      selectionBox.style.top = newTop + 'px';

      updateCropOverlay();
      updateMask();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    resizeHandle = null;
  });

  // 矩形形状按钮
  rectShapeBtn?.addEventListener('click', () => {
    rectShapeBtn.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary', 'font-medium');
    rectShapeBtn.classList.remove('text-on-surface-variant');
    if (circleShapeBtn) {
      circleShapeBtn.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary', 'font-medium');
      circleShapeBtn.classList.add('text-on-surface-variant');
    }

    setState({ cropSelection: { ...state.cropSelection, shape: 'rect' } });
    updateCropOverlay();
    updateMask();
  });

  // 圆形形状按钮
  circleShapeBtn?.addEventListener('click', () => {
    circleShapeBtn.classList.add('bg-surface-container-lowest', 'shadow-sm', 'text-primary', 'font-medium');
    circleShapeBtn.classList.remove('text-on-surface-variant');
    if (rectShapeBtn) {
      rectShapeBtn.classList.remove('bg-surface-container-lowest', 'shadow-sm', 'text-primary', 'font-medium');
      rectShapeBtn.classList.add('text-on-surface-variant');
    }

    setState({ cropSelection: { ...state.cropSelection, shape: 'circle' } });
    updateCropOverlay();
    updateMask();
  });

  aspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 更新按钮样式
      aspectBtns.forEach(b => {
        b.classList.remove('border-2', 'border-primary', 'bg-primary-fixed', 'text-primary', 'active');
        b.classList.add('border', 'border-outline-variant', 'text-on-surface-variant');
      });
      btn.classList.remove('border', 'border-outline-variant', 'text-on-surface-variant');
      btn.classList.add('border-2', 'border-primary', 'bg-primary-fixed', 'text-primary', 'active');

      // 根据比例调整选区框
      const ratio = btn.dataset.ratio;
      const imgRect = cropImage.getBoundingClientRect();
      let newWidth, newHeight;

      // 计算最大可用选区尺寸（图片的80%）
      const maxW = imgRect.width * 0.8;
      const maxH = imgRect.height * 0.8;

      switch (ratio) {
        case '1:1':
          newWidth = Math.min(maxW, maxH);
          newHeight = newWidth;
          break;
        case '4:3':
          newHeight = Math.min(maxH, maxW * 3 / 4);
          newWidth = newHeight * 4 / 3;
          break;
        case '16:9':
          newHeight = Math.min(maxH, maxW * 9 / 16);
          newWidth = newHeight * 16 / 9;
          break;
        case '3:2':
          newHeight = Math.min(maxH, maxW * 2 / 3);
          newWidth = newHeight * 3 / 2;
          break;
        case '2:3':
          newWidth = Math.min(maxW, maxH * 2 / 3);
          newHeight = newWidth * 3 / 2;
          break;
        default: // free
          newWidth = maxW;
          newHeight = maxH;
      }

      // 居中显示选区框
      const selX = (imgRect.width - newWidth) / 2;
      const selY = (imgRect.height - newHeight) / 2;

      selectionBox.style.left = selX + 'px';
      selectionBox.style.top = selY + 'px';
      selectionBox.style.width = newWidth + 'px';
      selectionBox.style.height = newHeight + 'px';

      // 如果是圆形，保持正方形
      if (state.cropSelection?.shape === 'circle') {
        const size = Math.min(newWidth, newHeight);
        selectionBox.style.width = size + 'px';
        selectionBox.style.height = size + 'px';
      }

      updateMask();
    });
  });

  applyCropBtn?.addEventListener('click', handleApplyCrop);
  resetCropBtn?.addEventListener('click', () => {
    if (state.originalImage) {
      setState({ currentImage: state.originalImage });
    }
    // 重置裁切选择状态但保持形状
    setState({ cropSelection: { ...state.cropSelection, x: 0, y: 0, width: 100, height: 100 } });
    // 隐藏预览区域
    if (cropPreviewSection) cropPreviewSection.style.display = 'none';
    croppedImageData = null;
    render('#/crop');
  });

  // 预览弹窗
  cropPreviewContainer?.addEventListener('click', () => {
    const data = croppedImageData || window._croppedImageData;
    if (previewModalImage && data) {
      previewModalImage.src = data;
      if (imagePreviewModal) imagePreviewModal.style.display = 'flex';
    }
  });

  closePreviewBtn?.addEventListener('click', () => {
    if (imagePreviewModal) imagePreviewModal.style.display = 'none';
  });

  imagePreviewModal?.addEventListener('click', (e) => {
    if (e.target === imagePreviewModal) {
      imagePreviewModal.style.display = 'none';
    }
  });

  // 下载裁切图像
  downloadCropBtn?.addEventListener('click', () => {
    const data = croppedImageData || window._croppedImageData;
    if (!data) return;

    const link = document.createElement('a');
    link.download = `cropped_image_${Date.now()}.png`;
    link.href = data;
    link.click();
  });
}

async function handleApplyCrop() {
  const img = getState('currentImage');
  const selectionBox = document.getElementById('selectionBox');
  const cropImage = document.getElementById('cropImage');

  if (!img || !selectionBox || !cropImage) {
    alert('请先上传图片');
    return;
  }

  const shape = state.cropSelection?.shape || 'rect';
  const currentShape = shape; // 保持当前形状状态

  // 获取选区相对于显示图片的位置
  const selRect = selectionBox.getBoundingClientRect();
  const imgRect = cropImage.getBoundingClientRect();

  // 计算缩放比例（因为图片可能被 CSS 缩放了）
  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;

  // 计算在原始图片上的裁切区域
  let cropX = Math.max(0, (selRect.left - imgRect.left) * scaleX);
  let cropY = Math.max(0, (selRect.top - imgRect.top) * scaleY);
  let cropW = selRect.width * scaleX;
  let cropH = selRect.height * scaleY;

  // 确保不超出原始图片边界
  cropX = Math.min(cropX, img.naturalWidth - cropW);
  cropY = Math.min(cropY, img.naturalHeight - cropH);
  cropW = Math.min(cropW, img.naturalWidth - cropX);
  cropH = Math.min(cropH, img.naturalHeight - cropY);

  const result = imageProcessor.crop(img, cropX, cropY, cropW, cropH, img.naturalWidth, img.naturalHeight, shape);
  const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);

  // 获取裁切后的图像数据URL用于预览和下载
  const canvas = result.canvas;
  const croppedDataUrl = canvas.toDataURL('image/png');

  // 更新状态但保持形状
  setState({
    currentImage: newImg,
    cropSelection: {
      ...state.cropSelection,
      shape: currentShape // 保持形状不变
    }
  });

  // 重新渲染并显示预览
  render('#/crop');

  // 显示预览区域
  setTimeout(() => {
    const cropPreviewSection = document.getElementById('cropPreviewSection');
    const cropPreviewImage = document.getElementById('cropPreviewImage');
    if (cropPreviewSection && cropPreviewImage) {
      cropPreviewImage.src = croppedDataUrl;
      cropPreviewSection.style.display = 'block';
      // 存储裁切数据供下载使用
      window._croppedImageData = croppedDataUrl;
    }
  }, 100);
}

function renderResize() {
  toolContent.innerHTML = `
    <section class="flex-1 flex gap-xl p-xl overflow-hidden">
      <!-- Canvas / Preview Area -->
      <section class="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden relative">
        <div class="h-12 border-b border-outline-variant flex items-center px-md justify-between bg-surface">
          <span class="font-label-md text-label-md text-on-surface-variant" id="fileNameLabel">原始文件</span>
          <div class="flex items-center gap-xs">
            <button class="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">zoom_out</span></button>
            <span class="font-label-md text-label-md text-on-surface w-12 text-center">45%</span>
            <button class="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">zoom_in</span></button>
            <div class="w-px h-4 bg-outline-variant mx-1"></div>
            <button class="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">fit_screen</span></button>
          </div>
        </div>
        <div class="flex-1 overflow-auto bg-checker flex items-center justify-center p-xl relative">
          ${state.currentImage
            ? `<img id="resizeImage" src="${state.currentImage.src}" class="max-w-full max-h-full object-contain shadow-md border border-outline-variant" alt="Preview"/>`
            : `<div class="flex flex-col items-center justify-center gap-md text-center">
                <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span class="material-symbols-outlined text-[32px] text-on-surface-variant">aspect_ratio</span>
                </div>
                <p class="text-on-surface-variant mb-sm">请先上传图片</p>
                <button class="px-lg py-sm bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container transition-colors" onclick="document.getElementById('fileInput').click()">选择图片</button>
              </div>`
          }
        </div>
      </section>
      <!-- Control Panel -->
      <aside class="w-[340px] flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex-shrink-0">
        <div class="p-lg border-b border-outline-variant bg-surface">
          <h2 class="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">aspect_ratio</span>
            尺寸调整参数
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1" id="currentSizeLabel">当前尺寸: ${state.currentImage?.width || 0} x ${state.currentImage?.height || 0}</p>
        </div>
        <div class="flex-1 overflow-y-auto p-lg flex flex-col gap-xl">
          <!-- Dimension Inputs -->
          <div class="flex flex-col gap-md">
            <div class="flex justify-between items-center mb-1">
              <label class="font-label-md text-label-md text-on-surface-variant font-bold">按像素或百分比</label>
              <select class="h-8 pl-2 pr-8 py-0 text-body-md border-transparent bg-surface-container rounded-md focus:border-primary focus:ring-0">
                <option>像素 (px)</option>
                <option>百分比 (%)</option>
              </select>
            </div>
            <div class="flex items-center gap-sm">
              <div class="flex flex-col gap-xs flex-1">
                <label class="font-label-md text-label-md text-on-surface-variant">宽度</label>
                <input class="w-full h-10 px-md border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface bg-surface shadow-sm transition-all" type="number" id="resizeW" value="${state.currentImage?.width || 1920}"/>
              </div>
              <div class="flex flex-col items-center justify-end h-full pt-6">
                <button class="w-8 h-8 rounded flex items-center justify-center transition-colors group" id="aspectLockBtn" title="锁定宽高比" style="background-color: rgba(180, 197, 255, 0.3); color: #004ac6;">
                  <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform" id="aspectLockIcon">link</span>
                </button>
                <span class="text-[10px] mt-xs font-label-md" id="aspectLockLabel" style="color: #004ac6;">已锁定</span>
              </div>
              <div class="flex flex-col gap-xs flex-1">
                <label class="font-label-md text-label-md text-on-surface-variant">高度</label>
                <input class="w-full h-10 px-md border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface bg-surface shadow-sm transition-all" type="number" id="resizeH" value="${state.currentImage?.height || 1280}"/>
              </div>
            </div>
          </div>
          <hr class="border-outline-variant"/>
          <!-- Presets Bento Grid -->
          <div class="flex flex-col gap-sm">
            <label class="font-label-md text-label-md text-on-surface-variant font-bold">常用预设尺寸</label>
            <div class="grid grid-cols-2 gap-sm" id="presetBtns">
              <button class="flex flex-col items-start p-sm border border-outline-variant rounded-lg hover:border-primary hover:bg-primary-fixed/20 hover:text-primary transition-all text-on-surface bg-surface group" data-w="1920" data-h="1080">
                <span class="font-button-text text-button-text group-hover:text-primary">1080p (FHD)</span>
                <span class="text-[11px] text-on-surface-variant mt-1 group-hover:text-primary/70">1920 x 1080</span>
              </button>
              <button class="flex flex-col items-start p-sm border border-outline-variant rounded-lg hover:border-primary hover:bg-primary-fixed/20 hover:text-primary transition-all text-on-surface bg-surface group" data-w="1280" data-h="720">
                <span class="font-button-text text-button-text group-hover:text-primary">720p (HD)</span>
                <span class="text-[11px] text-on-surface-variant mt-1 group-hover:text-primary/70">1280 x 720</span>
              </button>
              <button class="flex flex-col items-start p-sm border border-outline-variant rounded-lg hover:border-primary hover:bg-primary-fixed/20 hover:text-primary transition-all text-on-surface bg-surface group" data-w="3840" data-h="2160">
                <span class="font-button-text text-button-text group-hover:text-primary">4K (UHD)</span>
                <span class="text-[11px] text-on-surface-variant mt-1 group-hover:text-primary/70">3840 x 2160</span>
              </button>
              <button class="flex flex-col items-start p-sm border border-outline-variant rounded-lg hover:border-primary hover:bg-primary-fixed/20 hover:text-primary transition-all text-on-surface bg-surface group" data-w="1080" data-h="1080">
                <span class="font-button-text text-button-text group-hover:text-primary">Instagram 正方形</span>
                <span class="text-[11px] text-on-surface-variant mt-1 group-hover:text-primary/70">1080 x 1080</span>
              </button>
            </div>
          </div>
        </div>
        <!-- Action Footer -->
        <div class="p-lg border-t border-outline-variant bg-surface flex gap-md">
          <button class="flex-1 py-2 border border-outline-variant text-on-surface font-button-text text-button-text rounded-lg hover:bg-surface-container-high transition-colors active:scale-[0.98]" id="resetResizeBtn">
            重置
          </button>
          <button class="flex-1 py-2 bg-primary text-on-primary font-button-text text-button-text rounded-lg hover:bg-on-primary-fixed-variant transition-colors active:scale-[0.98] shadow-sm flex items-center justify-center gap-1" id="applyResizeBtn">
            <span class="material-symbols-outlined text-[18px]">check</span>
            应用更改
          </button>
          <button class="flex-1 py-2 bg-surface-container-low border border-outline-variant text-primary font-button-text text-button-text rounded-lg hover:bg-surface-container-high transition-colors active:scale-[0.98] flex items-center justify-center gap-1" id="downloadResizeBtn">
            <span class="material-symbols-outlined text-[18px]">download</span>
            下载
          </button>
        </div>
      </aside>
    </section>
  `;

  setupResizePanel();
}

function setupResizePanel() {
  const resizeW = document.getElementById('resizeW');
  const resizeH = document.getElementById('resizeH');
  const aspectLockBtn = document.getElementById('aspectLockBtn');
  const presetBtns = document.querySelectorAll('#presetBtns button');
  const applyResizeBtn = document.getElementById('applyResizeBtn');
  const resetResizeBtn = document.getElementById('resetResizeBtn');
  const downloadResizeBtn = document.getElementById('downloadResizeBtn');

  let aspectLocked = true;
  let aspectRatio = (state.currentImage?.width || 1920) / (state.currentImage?.height || 1080);

  aspectLockBtn?.addEventListener('click', () => {
    aspectLocked = !aspectLocked;
    const aspectLockIcon = document.getElementById('aspectLockIcon');
    const aspectLockLabel = document.getElementById('aspectLockLabel');

    if (aspectLocked) {
      aspectLockBtn.style.backgroundColor = 'rgba(180, 197, 255, 0.3)';
      aspectLockBtn.style.color = '#004ac6';
      if (aspectLockIcon) aspectLockIcon.textContent = 'link';
      if (aspectLockLabel) {
        aspectLockLabel.textContent = '已锁定';
        aspectLockLabel.style.color = '#004ac6';
      }
    } else {
      aspectLockBtn.style.backgroundColor = 'rgba(248, 113, 113, 0.2)';
      aspectLockBtn.style.color = '#dc2626';
      if (aspectLockIcon) aspectLockIcon.textContent = 'link_off';
      if (aspectLockLabel) {
        aspectLockLabel.textContent = '已解锁';
        aspectLockLabel.style.color = '#dc2626';
      }
    }
  });

  resizeW?.addEventListener('input', () => {
    if (aspectLocked && resizeH) {
      const w = parseInt(resizeW.value) || 0;
      resizeH.value = Math.round(w / aspectRatio);
    }
  });

  resizeH?.addEventListener('input', () => {
    if (aspectLocked && resizeW) {
      const h = parseInt(resizeH.value) || 0;
      resizeW.value = Math.round(h * aspectRatio);
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const w = parseInt(btn.dataset.w);
      const h = parseInt(btn.dataset.h);
      if (resizeW) resizeW.value = w;
      if (resizeH) resizeH.value = h;
      aspectRatio = w / h;
    });
  });

  applyResizeBtn?.addEventListener('click', handleApplyResize);
  resetResizeBtn?.addEventListener('click', () => {
    if (state.originalImage) {
      setState({ currentImage: state.originalImage });
    }
    render('#/resize');
  });
  downloadResizeBtn?.addEventListener('click', () => {
    const img = getState('currentImage');
    if (!img) return;

    // 创建 Canvas 来获取数据 URL
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const link = document.createElement('a');
    link.download = `resized_image_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

async function handleApplyResize() {
  const img = getState('currentImage');
  if (!img) return;

  const w = parseInt(document.getElementById('resizeW')?.value) || img.width;
  const h = parseInt(document.getElementById('resizeH')?.value) || img.height;

  const result = imageProcessor.resize(img, w, h);
  const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
  setState({ currentImage: newImg });
  render('#/resize');
}

function renderWatermark() {
  const wm = state.watermark;
  toolContent.innerHTML = `
    <section class="flex-1 flex min-w-0">
      <!-- Canvas Container (Left) -->
      <section class="flex-1 p-xl overflow-auto flex items-center justify-center bg-surface relative">
        <div id="watermarkImageContainer" class="relative shadow-md rounded-lg overflow-hidden border border-outline-variant bg-checker flex items-center justify-center" style="min-width: 200px; min-height: 200px;">
          ${state.currentImage
            ? `<img id="watermarkImage" src="${state.currentImage.src}" class="block max-w-full max-h-[70vh] object-contain" alt="Working Image"/>`
            : `<div class="flex flex-col items-center justify-center gap-md text-center p-xl">
                <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span class="material-symbols-outlined text-[32px] text-on-surface-variant">branding_watermark</span>
                </div>
                <p class="text-on-surface-variant mb-sm">请先上传图片</p>
                <button class="px-lg py-sm bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container transition-colors" onclick="document.getElementById('fileInput').click()">选择图片</button>
              </div>`
          }
          <!-- Watermark Element (draggable) -->
          <div id="watermarkElement" class="absolute cursor-move select-none ${wm.type === 'text' ? '' : 'hidden'}" style="
            ${wm.type === 'text' ? `
              color: ${wm.color};
              opacity: ${wm.alpha / 100};
              font-size: ${wm.fontSize}px;
              left: ${wm.x}px;
              top: ${wm.y}px;
            ` : ''}
          ">
            ${wm.type === 'text' ? wm.text : ''}
          </div>
          <!-- Watermark Image Element -->
          <img id="watermarkImageElement" class="absolute cursor-move ${wm.type === 'image' ? '' : 'hidden'}" style="
            ${wm.type === 'image' ? `
              left: ${wm.x}px;
              top: ${wm.y}px;
              width: ${wm.imageWidth || 100}px;
              opacity: ${wm.alpha / 100};
            ` : ''}
          " src="${wm.imageData || ''}" alt="Watermark"/>
        </div>
      </section>
      <!-- Properties Panel (Right) -->
      <aside class="w-[320px] bg-surface-container-lowest border-l border-outline-variant flex flex-col flex-shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20 overflow-y-auto">
        <!-- Panel Header / Tabs -->
        <div class="flex border-b border-outline-variant pt-md px-md">
          <button class="flex-1 pb-sm text-primary font-bold border-b-2 border-primary text-center font-button-text text-button-text transition-colors" id="textTab">文字水印</button>
          <button class="flex-1 pb-sm text-on-surface-variant hover:text-on-surface text-center font-button-text text-button-text transition-colors" id="imageTab">图片水印</button>
        </div>
        <!-- Panel Content Area -->
        <div class="flex-1 overflow-y-auto p-md flex flex-col gap-lg">
          <!-- Text Content Input -->
          <div class="flex flex-col gap-sm" id="textWatermarkOpts">
            <div class="flex flex-col gap-sm">
              <label class="font-label-md text-label-md text-on-surface font-medium">水印内容</label>
              <textarea class="w-full h-[80px] bg-surface resize-none border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="输入你想添加的水印文字..." id="watermarkText">${wm.text}</textarea>
            </div>
            <div class="w-full h-[1px] bg-surface-container-high"></div>
            <!-- Text Appearance Section -->
            <div class="flex flex-col gap-md">
              <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">文字样式</h3>
              <!-- Font Size Slider -->
              <div class="flex flex-col gap-sm">
                <div class="flex justify-between items-center">
                  <label class="font-label-md text-label-md text-on-surface">字号大小</label>
                  <span class="font-label-md text-label-md text-primary bg-primary-fixed rounded px-2 py-0.5" id="fontSizeLabel">${wm.fontSize}px</span>
                </div>
                <input class="w-full" id="fontSizeSlider" max="120" min="10" type="range" value="${wm.fontSize}"/>
              </div>
              <!-- Color -->
              <div class="flex flex-col gap-xs">
                <label class="font-label-md text-label-md text-on-surface">颜色</label>
                <input type="color" id="watermarkColor" value="${wm.color}" class="w-full h-10 px-4 py-1 border border-outline-variant rounded-lg cursor-pointer"/>
              </div>
            </div>
          </div>
          <!-- Image Watermark Options (Hidden by default) -->
          <div class="flex flex-col gap-sm hidden" id="imageWatermarkOpts">
            <label class="font-label-md text-label-md text-on-surface">上传水印图片</label>
            <div class="relative">
              <input type="file" class="hidden" id="watermarkImageInput" accept="image/*"/>
              <label for="watermarkImageInput" class="flex items-center gap-sm w-full px-md py-sm bg-surface border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary hover:bg-surface-container-lowest transition-all group">
                <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
                  <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add_photo_alternate</span>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors" id="watermarkImageName">${wm.imageData ? '已选择图片' : '点击上传图片'}</p>
                  <p class="font-label-md text-label-md text-on-surface-variant">支持 PNG, JPG, WEBP</p>
                </div>
              </label>
            </div>
            <div class="flex flex-col gap-sm">
              <div class="flex justify-between items-center">
                <label class="font-label-md text-label-md text-on-surface">水印宽度</label>
                <span class="font-label-md text-label-md text-primary bg-primary-fixed rounded px-2 py-0.5" id="imageWidthLabel">${wm.imageWidth || 100}px</span>
              </div>
              <input class="w-full" id="imageWidthSlider" max="500" min="20" type="range" value="${wm.imageWidth || 100}"/>
            </div>
          </div>
          <div class="w-full h-[1px] bg-surface-container-high"></div>
          <!-- Common Settings (Opacity - shared by both text and image) -->
          <div class="flex flex-col gap-md">
            <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">透明度</h3>
            <div class="flex flex-col gap-sm">
              <div class="flex justify-between items-center">
                <label class="font-label-md text-label-md text-on-surface">水印透明度</label>
                <span class="font-label-md text-label-md text-primary bg-primary-fixed rounded px-2 py-0.5" id="opacityLabel">${wm.alpha}%</span>
              </div>
              <input class="w-full" id="opacitySlider" max="100" min="0" type="range" value="${wm.alpha}"/>
            </div>
          </div>
          <div class="w-full h-[1px] bg-surface-container-high"></div>
          <!-- Layout / Position Section -->
          <div class="flex flex-col gap-md">
            <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">位置与布局</h3>
            <div class="flex items-center justify-between gap-md">
              <button id="resetPositionBtn" class="px-md py-sm bg-surface border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-on-surface font-button-text text-button-text">
                重置位置
              </button>
              <p class="text-body-md text-on-surface-variant text-sm">或直接拖动水印</p>
            </div>
            <!-- 9-Grid Position Selector -->
            <div class="flex flex-col gap-xs items-center">
              <label class="font-label-md text-label-md text-on-surface self-start">九宫格位置</label>
              <div class="grid grid-cols-3 gap-1 p-1 bg-surface border border-outline-variant rounded-lg w-[120px] h-[120px]" id="positionGrid">
                ${getPositionGrid(wm.position)}
              </div>
            </div>
          </div>
        </div>
        <!-- Panel Footer / Actions -->
        <div class="p-md border-t border-outline-variant bg-surface-container-lowest flex gap-sm">
          <button class="flex-1 py-sm px-md bg-surface text-on-surface font-button-text text-button-text border border-outline-variant rounded-lg hover:bg-surface-container-highest transition-colors active:scale-[0.98]" id="resetWatermarkBtn">重置</button>
          <button class="flex-[2] py-sm px-md bg-primary text-on-primary font-button-text text-button-text rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm flex items-center justify-center gap-xs" id="applyWatermarkBtn">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            应用水印
          </button>
        </div>
      </aside>
    </section>
  `;

  setupWatermarkPanel();
}

function getPositionGrid(currentPos) {
  const positions = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];
  return positions.map(pos => `
    <button class="pos-btn w-8 h-8 bg-surface-container-lowest border border-outline-variant rounded-md hover:bg-surface-container-highest transition-colors ${currentPos === pos ? 'bg-primary border-primary' : ''}" data-pos="${pos}"></button>
  `).join('');
}

function setupWatermarkPanel() {
  const textTab = document.getElementById('textTab');
  const imageTab = document.getElementById('imageTab');
  const textOpts = document.getElementById('textWatermarkOpts');
  const imageOpts = document.getElementById('imageWatermarkOpts');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeLabel = document.getElementById('fontSizeLabel');
  const opacitySlider = document.getElementById('opacitySlider');
  const opacityLabel = document.getElementById('opacityLabel');
  const watermarkColor = document.getElementById('watermarkColor');
  const watermarkText = document.getElementById('watermarkText');
  const imageWidthSlider = document.getElementById('imageWidthSlider');
  const imageWidthLabel = document.getElementById('imageWidthLabel');
  const watermarkImageInput = document.getElementById('watermarkImageInput');
  const positionBtns = document.querySelectorAll('.pos-btn');
  const applyWatermarkBtn = document.getElementById('applyWatermarkBtn');
  const resetWatermarkBtn = document.getElementById('resetWatermarkBtn');
  const resetPositionBtn = document.getElementById('resetPositionBtn');
  const watermarkElement = document.getElementById('watermarkElement');
  const watermarkImageElement = document.getElementById('watermarkImageElement');
  const watermarkImageContainer = document.getElementById('watermarkImageContainer');

  // Tab switching
  textTab?.addEventListener('click', () => {
    textTab.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
    imageTab.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
    textOpts?.classList.remove('hidden');
    imageOpts?.classList.add('hidden');
    setState({ watermark: { ...state.watermark, type: 'text' } });
    updateWatermarkUI();
  });

  imageTab?.addEventListener('click', () => {
    imageTab.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
    textTab.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
    imageOpts?.classList.remove('hidden');
    textOpts?.classList.add('hidden');
    setState({ watermark: { ...state.watermark, type: 'image' } });
    updateWatermarkUI();
  });

  // Font size
  fontSizeSlider?.addEventListener('input', (e) => {
    const fontSize = parseInt(e.target.value);
    setState({ watermark: { ...state.watermark, fontSize } });
    if (fontSizeLabel) fontSizeLabel.textContent = `${fontSize}px`;
    updateWatermarkUI();
  });

  // Opacity
  opacitySlider?.addEventListener('input', (e) => {
    const alpha = parseInt(e.target.value);
    setState({ watermark: { ...state.watermark, alpha } });
    if (opacityLabel) opacityLabel.textContent = `${alpha}%`;
    updateWatermarkUI();
  });

  // Color
  watermarkColor?.addEventListener('input', (e) => {
    setState({ watermark: { ...state.watermark, color: e.target.value } });
    updateWatermarkUI();
  });

  // Text
  watermarkText?.addEventListener('input', (e) => {
    setState({ watermark: { ...state.watermark, text: e.target.value } });
    updateWatermarkUI();
  });

  // Image width
  imageWidthSlider?.addEventListener('input', (e) => {
    const imageWidth = parseInt(e.target.value);
    setState({ watermark: { ...state.watermark, imageWidth } });
    if (imageWidthLabel) imageWidthLabel.textContent = `${imageWidth}px`;
    updateWatermarkUI();
  });

  // Image upload
  watermarkImageInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const watermarkImageName = document.getElementById('watermarkImageName');
      if (watermarkImageName) {
        watermarkImageName.textContent = file.name;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setState({ watermark: { ...state.watermark, imageData: ev.target?.result } });
        updateWatermarkUI();
      };
      reader.readAsDataURL(file);
    }
  });

  // Position buttons (9-grid)
  positionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      positionBtns.forEach(b => {
        b.classList.remove('bg-primary', 'border-primary');
        b.classList.add('bg-surface-container-lowest', 'border-outline-variant');
      });
      btn.classList.add('bg-primary', 'border-primary');
      btn.classList.remove('bg-surface-container-lowest', 'border-outline-variant');

      const pos = btn.dataset.pos;
      const wm = state.watermark;
      const container = watermarkImageContainer;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const padding = 20;

        // Use estimated watermark dimensions from state
        const wmWidth = wm.type === 'text' ? Math.max(100, wm.text.length * wm.fontSize * 0.6) : (wm.imageWidth || 100);
        const wmHeight = wm.type === 'text' ? wm.fontSize : ((wm.imageWidth || 100) * 0.6);

        let x, y;
        if (pos.includes('left')) x = padding;
        else if (pos.includes('right')) x = containerRect.width - wmWidth - padding;
        else x = (containerRect.width - wmWidth) / 2;

        if (pos.includes('top')) y = padding;
        else if (pos.includes('bottom')) y = containerRect.height - wmHeight - padding;
        else y = (containerRect.height - wmHeight) / 2;

        setState({ watermark: { ...state.watermark, position: pos, x, y } });
        updateWatermarkUI();
      }
    });
  });

  // Reset position button
  resetPositionBtn?.addEventListener('click', () => {
    setState({ watermark: { ...state.watermark, x: 20, y: 20 } });
    updateWatermarkUI();
  });

  // Drag functionality
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const startDrag = (e) => {
    const target = e.target;
    // Use contains() to handle clicks on child elements (like text nodes)
    if (watermarkElement && watermarkElement.contains(target)) {
      isDragging = true;
      const rect = watermarkElement.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    } else if (watermarkImageElement && watermarkImageElement.contains(target)) {
      isDragging = true;
      const rect = watermarkImageElement.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    }
  };

  const doDrag = (e) => {
    if (!isDragging) return;
    const container = watermarkImageContainer;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const wm = state.watermark;
    const wmWidth = wm.type === 'text' ? 100 : (wm.imageWidth || 100);
    const wmHeight = wm.type === 'text' ? wm.fontSize : ((wm.imageWidth || 100) * 0.5);

    let newX = e.clientX - containerRect.left - dragOffsetX;
    let newY = e.clientY - containerRect.top - dragOffsetY;

    // Constrain to container bounds (keep watermark fully inside)
    newX = Math.max(0, Math.min(newX, containerRect.width - wmWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - wmHeight));

    setState({ watermark: { ...state.watermark, x: newX, y: newY } });
    updateWatermarkUI();
  };

  const stopDrag = () => {
    isDragging = false;
  };

  watermarkElement?.addEventListener('mousedown', startDrag);
  watermarkImageElement?.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);

  // Touch support
  watermarkElement?.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag({ clientX: touch.clientX, clientY: touch.clientY, target: watermarkElement });
  });
  watermarkImageElement?.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag({ clientX: touch.clientX, clientY: touch.clientY, target: watermarkImageElement });
  });
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    doDrag({ clientX: touch.clientX, clientY: touch.clientY });
  });
  document.addEventListener('touchend', stopDrag);

  applyWatermarkBtn?.addEventListener('click', handleApplyWatermark);
  resetWatermarkBtn?.addEventListener('click', () => {
    setState({
      watermark: {
        type: 'text',
        text: '水印',
        fontSize: 24,
        color: '#ffffff',
        alpha: 50,
        position: 'bottom-right',
        image: null,
        imageData: null,
        imageWidth: 100,
        x: 20,
        y: 20
      }
    });
    render('#/watermark');
  });
}

function updateWatermarkUI() {
  const wm = state.watermark;
  const watermarkElement = document.getElementById('watermarkElement');
  const watermarkImageElement = document.getElementById('watermarkImageElement');

  if (watermarkElement) {
    if (wm.type === 'text') {
      watermarkElement.textContent = wm.text;
      watermarkElement.style.color = wm.color;
      watermarkElement.style.opacity = wm.alpha / 100;
      watermarkElement.style.fontSize = `${wm.fontSize}px`;
      watermarkElement.style.left = `${wm.x}px`;
      watermarkElement.style.top = `${wm.y}px`;
      watermarkElement.style.display = 'block';
      watermarkElement.style.position = 'absolute';
      watermarkElement.style.cursor = 'move';
      watermarkElement.style.userSelect = 'none';
    } else {
      watermarkElement.style.display = 'none';
    }
  }

  if (watermarkImageElement) {
    if (wm.type === 'image' && wm.imageData) {
      watermarkImageElement.src = wm.imageData;
      watermarkImageElement.style.opacity = wm.alpha / 100;
      watermarkImageElement.style.width = `${wm.imageWidth || 100}px`;
      watermarkImageElement.style.height = 'auto';
      watermarkImageElement.style.left = `${wm.x}px`;
      watermarkImageElement.style.top = `${wm.y}px`;
      watermarkImageElement.style.display = 'block';
      watermarkImageElement.style.position = 'absolute';
      watermarkImageElement.style.cursor = 'move';
      watermarkImageElement.style.userSelect = 'none';
    } else {
      watermarkImageElement.style.display = 'none';
    }
  }
}

async function handleApplyWatermark() {
  await handleExport();
}

function renderBase64() {
  toolContent.innerHTML = `
    <main class="flex-1 p-md md:p-xl w-full max-w-[1440px] mx-auto flex flex-col gap-lg">
      <!-- Page Header -->
      <div class="flex flex-col gap-xs mb-sm">
        <h2 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Base64 图片转换</h2>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          在本地快速将图片文件转换为 Base64 字符串，或将 Base64 代码还原为图片进行预览。所有处理均在浏览器端完成，安全无风险。
        </p>
      </div>
      <!-- Two Column Layout Container -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-lg flex-1 min-h-[500px]">
        <!-- Left Column: Image Area -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg flex flex-col gap-md relative overflow-hidden group">
          <div class="flex justify-between items-center pb-sm border-b border-surface-container-highest">
            <h3 class="font-headline-md text-[18px] text-on-surface flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary">image</span>
              图片预览 / 上传
            </h3>
            <div class="flex gap-sm">
              <button class="px-md py-sm bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-button-text text-button-text rounded-lg transition-colors flex items-center gap-xs" id="downloadBase64Btn">
                <span class="material-symbols-outlined text-[18px]">download</span>
                下载图片
              </button>
              <button class="px-md py-sm bg-primary text-on-primary font-button-text text-button-text rounded-lg hover:bg-surface-tint transition-colors shadow-sm flex items-center gap-xs" id="uploadBase64Btn">
                <span class="material-symbols-outlined text-[18px]">upload</span>
                选择图片
              </button>
            </div>
          </div>
          <!-- Upload Dropzone / Preview Area -->
          <div id="base64Dropzone" class="flex-1 border-2 border-dashed border-outline-variant rounded-lg bg-surface flex flex-col items-center justify-center p-xl text-center hover:border-primary hover:bg-surface-container-lowest transition-all cursor-pointer relative group-hover:border-primary-fixed-dim dropzone">
            ${state.currentImage ? `<img src="${state.currentImage.src}" class="max-w-full max-h-full object-contain" alt="Preview"/>` : `
            <div class="flex flex-col items-center gap-sm text-on-surface-variant">
              <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-sm">
                <span class="material-symbols-outlined text-[32px] text-outline">add_photo_alternate</span>
              </div>
              <p class="font-body-lg text-body-lg text-on-surface font-medium">点击或拖拽图片至此处</p>
              <p class="font-body-md text-body-md text-outline">支持 JPG, PNG, WEBP, SVG 格式 (最大 5MB)</p>
            </div>
            `}
          </div>
          <div class="font-label-md text-label-md text-outline flex justify-between">
            <span id="imageSizeLabel">尺寸: ${state.currentImage ? `${state.currentImage.width} x ${state.currentImage.height}` : '-'}</span>
            <span id="imageFileSizeLabel">大小: ${state.originalSize ? formatSize(state.originalSize) : '-'}</span>
          </div>
        </div>
        <!-- Right Column: Base64 Text Area -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg flex flex-col gap-md">
          <div class="flex justify-between items-center pb-sm border-b border-surface-container-highest">
            <h3 class="font-headline-md text-[18px] text-on-surface flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary">data_object</span>
              Base64 编码
            </h3>
            <div class="flex gap-sm">
              <button class="p-sm text-on-surface-variant hover:bg-surface-container hover:text-error rounded-md transition-colors" title="清空内容" id="clearBase64Btn">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <!-- Textarea Container -->
          <div class="flex-1 relative flex flex-col">
            <textarea class="flex-1 w-full resize-none p-md bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" placeholder="在此处粘贴 Base64 代码以生成图片，或在此处查看生成的 Base64 编码..." id="base64Textarea"></textarea>
            <!-- Format Options -->
            <div class="absolute top-sm right-sm flex gap-xs">
              <div class="flex items-center gap-xs bg-surface-container-lowest px-sm py-xs rounded border border-outline-variant text-label-md text-on-surface-variant">
                <input checked="" class="rounded border-outline-variant text-primary focus:ring-primary" id="prefixCheck" type="checkbox"/>
                <label class="cursor-pointer" for="prefixCheck">包含 Data URI</label>
              </div>
            </div>
          </div>
          <!-- Action Bar -->
          <div class="flex justify-between pt-sm gap-sm">
            <button class="px-lg py-sm bg-surface border border-outline-variant text-primary font-button-text text-button-text rounded-lg hover:bg-surface-container transition-colors flex items-center gap-sm" id="encodeBase64Btn">
              <span class="material-symbols-outlined">refresh</span>
              重新编码
            </button>
            <div class="flex gap-sm">
              <button class="px-lg py-sm bg-surface border border-outline-variant text-primary font-button-text text-button-text rounded-lg hover:bg-surface-container transition-colors flex items-center gap-sm" id="decodeBase64Btn">
                <span class="material-symbols-outlined">play_arrow</span>
                解码
              </button>
              <button class="px-lg py-sm bg-primary text-on-primary font-button-text text-button-text rounded-lg hover:bg-surface-tint transition-colors shadow-sm flex items-center gap-sm active:scale-[0.98]" id="copyBase64Btn">
                <span class="material-symbols-outlined">content_copy</span>
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  setupBase64Panel();
}

function setupBase64Panel() {
  const uploadBase64Btn = document.getElementById('uploadBase64Btn');
  const downloadBase64Btn = document.getElementById('downloadBase64Btn');
  const copyBase64Btn = document.getElementById('copyBase64Btn');
  const decodeBase64Btn = document.getElementById('decodeBase64Btn');
  const encodeBase64Btn = document.getElementById('encodeBase64Btn');
  const clearBase64Btn = document.getElementById('clearBase64Btn');
  const base64Textarea = document.getElementById('base64Textarea');
  const base64Dropzone = document.getElementById('base64Dropzone');
  const prefixCheck = document.getElementById('prefixCheck');

  uploadBase64Btn?.addEventListener('click', () => fileInput?.click());

  downloadBase64Btn?.addEventListener('click', handleExport);

  copyBase64Btn?.addEventListener('click', async () => {
    const text = base64Textarea?.value;
    if (text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          alert('已复制到剪贴板');
        } else {
          // Fallback for non-secure contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('已复制到剪贴板');
        }
      } catch (e) {
        console.error('Copy failed:', e);
        alert('复制失败，请手动复制');
      }
    }
  });

  // 重新编码按钮
  encodeBase64Btn?.addEventListener('click', () => {
    if (!state.currentImage) {
      alert('请先上传图片');
      return;
    }
    encodeImageToBase64();
  });

  decodeBase64Btn?.addEventListener('click', async () => {
    const base64Str = base64Textarea?.value.trim();
    if (!base64Str) return;
    try {
      // base64ToImage 现在可以自动识别是否带 Data URI 前缀
      const blob = await base64.base64ToImage(base64Str);
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        setState({ currentImage: img, originalImage: img });
        render('#/base64');
      };
      img.src = url;
    } catch (err) {
      alert('Base64解码失败，请检查输入是否正确');
    }
  });

  clearBase64Btn?.addEventListener('click', () => {
    if (base64Textarea) base64Textarea.value = '';
  });

  base64Dropzone?.addEventListener('click', () => fileInput?.click());

  base64Dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    base64Dropzone.classList.add('dragover');
  });

  base64Dropzone?.addEventListener('dragleave', () => {
    base64Dropzone.classList.remove('dragover');
  });

  base64Dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    base64Dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  });

  // 如果有图片，自动编码
  if (state.currentImage) {
    encodeImageToBase64();
  }
}

async function encodeImageToBase64() {
  const img = getState('currentImage');
  if (!img) return;

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const blob = await imageProcessor.exportCanvas(canvas, state.format, state.quality);
  const base64Str = await base64.imageToBase64(blob);
  const textarea = document.getElementById('base64Textarea');
  const prefixCheck = document.getElementById('prefixCheck');

  if (textarea) {
    // 根据 prefixCheck 决定是否包含 Data URI 前缀
    if (prefixCheck?.checked) {
      textarea.value = base64Str; // 包含前缀
    } else {
      // 只保存纯 Base64 部分
      const pureBase64 = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
      textarea.value = pureBase64;
    }
  }
}

function renderRotate() {
  toolContent.innerHTML = `
    <main class="flex-1 overflow-hidden p-md md:p-xl flex flex-col md:flex-row gap-md md:gap-xl">
      <!-- Central Canvas Area -->
      <section class="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative min-h-[400px]">
        <!-- Canvas Toolbar -->
        <div class="h-12 border-b border-outline-variant flex items-center px-md justify-between bg-surface-bright">
          <div class="flex items-center gap-sm text-on-surface-variant">
            <span class="font-label-md text-label-md px-sm py-xs bg-surface-container-highest rounded text-on-surface" id="rotateFileName">${state.currentImage ? '已选择图片' : '未选择图片'}</span>
            <span class="font-label-md text-label-md opacity-70" id="rotateFileSize">${state.currentImage ? `${state.currentImage.width} x ${state.currentImage.height} px` : '-'}</span>
          </div>
          <div class="flex items-center gap-xs">
            <button class="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-md transition-colors"><span class="material-symbols-outlined text-[20px]">zoom_out</span></button>
            <span class="font-label-md text-label-md w-12 text-center text-on-surface">Fit</span>
            <button class="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-md transition-colors"><span class="material-symbols-outlined text-[20px]">zoom_in</span></button>
          </div>
        </div>
        <!-- Interactive Preview -->
        <div class="flex-1 bg-[#f0f2f5] relative overflow-hidden flex items-center justify-center p-xl" style="background-image: radial-gradient(#d8dadc 1px, transparent 0); background-size: 20px 20px;">
          <div class="relative transition-transform duration-300 ease-out flex items-center justify-center group" id="rotatePreview" style="transform: rotate(${pendingRotation}deg);">
            ${state.currentImage
              ? `<img src="${state.currentImage.src}" class="max-w-[80%] max-h-[80%] object-contain shadow-lg" alt="Preview"/>`
              : `<div class="flex flex-col items-center justify-center gap-md text-center">
                  <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span class="material-symbols-outlined text-[32px] text-on-surface-variant">rotate_right</span>
                  </div>
                  <p class="text-on-surface-variant mb-sm">请先上传图片</p>
                  <button class="px-lg py-sm bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary-container transition-colors" onclick="document.getElementById('fileInput').click()">选择图片</button>
                </div>`
            }
          </div>
          <!-- HUD Overlay for Angle -->
          <div class="absolute top-md right-md bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface px-sm py-xs rounded font-label-md text-label-md shadow-md">
            当前角度: <span class="font-bold text-primary-fixed-dim" id="pendingAngleDisplay">${pendingRotation}°</span>
          </div>
        </div>
      </section>
      <!-- Control Panel (Right Side) -->
      <aside class="w-full md:w-[320px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col shrink-0">
        <!-- Panel Header -->
        <div class="p-md md:p-lg border-b border-outline-variant bg-surface-bright rounded-t-xl">
          <h2 class="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
            <span class="material-symbols-outlined text-primary text-[24px]">rotate_right</span>
            旋转设置
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-xs">调整图像的方向和精确角度以对齐地平线。</p>
        </div>
        <!-- Panel Body -->
        <div class="p-md md:p-lg flex-1 overflow-y-auto flex flex-col gap-lg">
          <!-- Quick Rotate (90 Degrees) -->
          <div class="flex flex-col gap-sm">
            <label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
              <div class="w-1 h-3 bg-primary rounded-full"></div>
              快捷旋转
            </label>
            <div class="grid grid-cols-2 gap-md">
              <button class="flex flex-col items-center justify-center py-md px-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-primary hover:bg-surface-container-high hover:border-primary/50 active:scale-[0.98] transition-all group shadow-sm hover:shadow" id="rotateLeftBtn">
                <span class="material-symbols-outlined text-[28px] mb-xs group-hover:-rotate-90 transition-transform duration-300">rotate_left</span>
                <span class="font-button-text text-button-text text-on-surface group-hover:text-primary transition-colors">左旋 90°</span>
              </button>
              <button class="flex flex-col items-center justify-center py-md px-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-primary hover:bg-surface-container-high hover:border-primary/50 active:scale-[0.98] transition-all group shadow-sm hover:shadow" id="rotateRightBtn">
                <span class="material-symbols-outlined text-[28px] mb-xs group-hover:rotate-90 transition-transform duration-300">rotate_right</span>
                <span class="font-button-text text-button-text text-on-surface group-hover:text-primary transition-colors">右旋 90°</span>
              </button>
            </div>
          </div>
          <!-- Fine-tune Angle -->
          <div class="flex flex-col gap-sm">
            <div class="flex justify-between items-center mb-xs">
              <label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
                <div class="w-1 h-3 bg-primary rounded-full"></div>
                微调角度
              </label>
              <div class="flex items-center bg-surface-container-lowest border border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-md overflow-hidden transition-all shadow-sm h-8">
                <input class="w-14 h-full text-center bg-transparent border-none focus:ring-0 font-body-md text-on-surface p-0 m-0" max="45" min="-45" type="number" value="${pendingRotation}" id="angleInput"/>
                <span class="px-sm text-on-surface-variant bg-surface-container-high h-full flex items-center border-l border-outline-variant font-label-md text-label-md select-none">°</span>
              </div>
            </div>
            <!-- Custom Slider -->
            <div class="flex items-center gap-md mt-xs py-xs">
              <button class="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors" id="angleMinusBtn">
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <input class="flex-1" max="45" min="-45" type="range" value="${pendingRotation}" id="angleSlider"/>
              <button class="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors" id="anglePlusBtn">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
            <div class="flex justify-between text-on-surface-variant/70 font-label-md text-[10px] mt-xs">
              <span>-45°</span>
              <span>0°</span>
              <span>+45°</span>
            </div>
          </div>
          <!-- Download Button -->
          <button class="w-full py-[10px] px-md bg-surface text-primary border border-outline-variant rounded-lg font-button-text text-button-text hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-xs" id="downloadRotateBtn">
            <span class="material-symbols-outlined text-[18px]">download</span>
            下载
          </button>
        </div>
        <!-- Panel Footer Actions -->
        <div class="p-md md:p-lg border-t border-outline-variant bg-surface-container-lowest rounded-b-xl flex gap-md">
          <button class="flex-1 py-[10px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-primary font-button-text text-button-text hover:bg-surface-container-high active:scale-[0.98] transition-all" id="resetRotateBtn">
            重置
          </button>
          <button class="flex-[2] py-[10px] px-md bg-primary border border-transparent rounded-lg text-on-primary font-button-text text-button-text hover:bg-primary/90 hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-xs" id="applyRotateBtn">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            应用更改
          </button>
        </div>
      </aside>
    </main>
  `;

  setupRotatePanel();
}

function setupRotatePanel() {
  const rotateLeftBtn = document.getElementById('rotateLeftBtn');
  const rotateRightBtn = document.getElementById('rotateRightBtn');
  const angleSlider = document.getElementById('angleSlider');
  const angleInput = document.getElementById('angleInput');
  const angleMinusBtn = document.getElementById('angleMinusBtn');
  const anglePlusBtn = document.getElementById('anglePlusBtn');
  const resetRotateBtn = document.getElementById('resetRotateBtn');
  const applyRotateBtn = document.getElementById('applyRotateBtn');
  const pendingAngleDisplay = document.getElementById('pendingAngleDisplay');
  const rotatePreview = document.getElementById('rotatePreview');

  rotateLeftBtn?.addEventListener('click', () => {
    pendingRotation -= 90;
    if (pendingRotation <= -360) pendingRotation += 360;
    updateRotateUI();
  });

  rotateRightBtn?.addEventListener('click', () => {
    pendingRotation += 90;
    if (pendingRotation >= 360) pendingRotation -= 360;
    updateRotateUI();
  });

  angleSlider?.addEventListener('input', (e) => {
    pendingRotation = parseInt(e.target.value);
    updateRotateUI();
  });

  angleInput?.addEventListener('input', (e) => {
    pendingRotation = parseInt(e.target.value) || 0;
    updateRotateUI();
  });

  angleMinusBtn?.addEventListener('click', () => {
    pendingRotation = Math.max(-45, pendingRotation - 1);
    updateRotateUI();
  });

  anglePlusBtn?.addEventListener('click', () => {
    pendingRotation = Math.min(45, pendingRotation + 1);
    updateRotateUI();
  });

  resetRotateBtn?.addEventListener('click', () => {
    pendingRotation = 0;
    updateRotateUI();
  });

  applyRotateBtn?.addEventListener('click', handleApplyRotate);

  // Download button
  const downloadRotateBtn = document.getElementById('downloadRotateBtn');
  downloadRotateBtn?.addEventListener('click', () => {
    const img = getState('currentImage');
    if (!img) {
      alert('请先上传图片');
      return;
    }

    // 如果有未应用的旋转，先应用
    if (pendingRotation !== 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 计算旋转后的尺寸
      const rad = pendingRotation * Math.PI / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      if (pendingRotation === 90 || pendingRotation === -90 || pendingRotation === 270 || pendingRotation === -270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const link = document.createElement('a');
      link.download = `rotated_${formatTimestamp()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      // 没有旋转，直接导出当前图片
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `rotated_${formatTimestamp()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  });
}

function updateRotateUI() {
  const angleSlider = document.getElementById('angleSlider');
  const angleInput = document.getElementById('angleInput');
  const pendingAngleDisplay = document.getElementById('pendingAngleDisplay');
  const rotatePreview = document.getElementById('rotatePreview');

  if (angleSlider) angleSlider.value = pendingRotation;
  if (angleInput) angleInput.value = pendingRotation;
  if (pendingAngleDisplay) pendingAngleDisplay.textContent = `${pendingRotation}°`;
  if (rotatePreview) rotatePreview.style.transform = `rotate(${pendingRotation}deg)`;
}

async function handleApplyRotate() {
  const img = getState('currentImage');
  if (!img || pendingRotation === 0) return;

  const result = imageProcessor.rotate(img, pendingRotation);
  const newImg = await imageProcessor.loadImageFromCanvas(result.canvas);
  setState({ currentImage: newImg });
  pendingRotation = 0;
  updateRotateUI();
  render('#/rotate');
}

async function handleExport(exportFormat) {
  const img = getState('currentImage');
  if (!img) {
    alert('请先上传图片');
    return;
  }

  // 如果没有指定格式，使用全局 format；否则使用指定格式
  // 确保 format 是有效的 MIME 类型字符串
  let format = exportFormat || state.format;
  if (!format || typeof format !== 'string' || !format.includes('/')) {
    format = 'image/jpeg';
  }

  // 显示加载蒙版
  const loadingMask = document.createElement('div');
  loadingMask.id = 'loadingMask';
  loadingMask.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  loadingMask.innerHTML = `
    <div class="bg-surface rounded-xl p-xl flex flex-col items-center gap-md shadow-lg">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="font-body-md text-body-md text-on-surface">正在应用水印...</p>
    </div>
  `;
  document.body.appendChild(loadingMask);

  try {
    let exportCanvas = document.createElement('canvas');
    exportCanvas.width = img.width;
    exportCanvas.height = img.height;
    const ctx = exportCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 应用水印
    const wm = state.watermark;

    if (wm.type === 'text' && wm.text) {
      ctx.globalAlpha = wm.alpha / 100;
      ctx.fillStyle = wm.color;
      ctx.font = `${wm.fontSize}px Inter, sans-serif`;

      // 水印坐标是相对于容器的，需要转换为原图坐标
      const container = document.getElementById('watermarkImageContainer');
      const wmImg = document.getElementById('watermarkImage');
      let x = wm.x;
      let y = wm.y;

      if (container && wmImg) {
        const containerRect = container.getBoundingClientRect();
        const imgRect = wmImg.getBoundingClientRect();

        // 计算图片在容器中的实际位置和尺寸
        const imgLeft = imgRect.left - containerRect.left;
        const imgTop = imgRect.top - containerRect.top;
        const imgWidth = imgRect.width;
        const imgHeight = imgRect.height;

        // 水印位置减去图片偏移，得到相对于图片的位置
        const relativeX = x - imgLeft;
        const relativeY = y - imgTop;

        // 转换为原图坐标
        const finalX = (relativeX / imgWidth) * img.width;
        const finalY = (relativeY / imgHeight) * img.height;

        console.log('Watermark transform:', {
          wmX: x, wmY: y,
          imgLeft, imgTop,
          imgWidth, imgHeight,
          relativeX, relativeY,
          finalX, finalY,
          imgW: img.width, imgH: img.height
        });

        x = finalX;
        y = finalY;
      }

      // 如果位置无效，使用默认值
      if (!x || !y || isNaN(x) || isNaN(y) || x < 0 || y < 0) {
        x = 20;
        y = img.height - wm.fontSize - 20;
      }

      ctx.fillText(wm.text, x, y);
      ctx.globalAlpha = 1;
    }

    if (wm.type === 'image' && wm.imageData) {
      ctx.globalAlpha = wm.alpha / 100;
      const watermarkImg = new Image();
      watermarkImg.src = wm.imageData;
      await new Promise((resolve) => {
        watermarkImg.onload = resolve;
      });

      const wmWidth = wm.imageWidth || 100;
      const wmHeight = (watermarkImg.height / watermarkImg.width) * wmWidth;

      // 水印坐标是相对于容器的，需要转换为原图坐标
      const container = document.getElementById('watermarkImageContainer');
      const wmImgEl = document.getElementById('watermarkImage');
      let x = wm.x;
      let y = wm.y;

      if (container && wmImgEl) {
        const containerRect = container.getBoundingClientRect();
        const imgRect = wmImgEl.getBoundingClientRect();

        const imgLeft = imgRect.left - containerRect.left;
        const imgTop = imgRect.top - containerRect.top;
        const imgDisplayWidth = imgRect.width;
        const imgDisplayHeight = imgRect.height;

        const relativeX = x - imgLeft;
        const relativeY = y - imgTop;

        x = (relativeX / imgDisplayWidth) * img.width;
        y = (relativeY / imgDisplayHeight) * img.height;
      }

      // 如果位置无效，使用默认值
      if (x === undefined || x === null || isNaN(x) || x < 0) x = 20;
      if (y === undefined || y === null || isNaN(y) || y < 0) y = 20;

      ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
      ctx.globalAlpha = 1;
    }

    // 获取导出的 blob
    // PNG 是无损格式，quality 参数无效，不需要传 quality
    const isPng = format === 'image/png';
    const blob = await new Promise((resolve) => {
      exportCanvas.toBlob(resolve, format, isPng ? undefined : state.quality / 100);
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked_${formatTimestamp()}.${format.split('/')[1]}`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    loadingMask.remove();
  }
}

function formatSize(bytes) {
  if (!bytes || bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

init();
