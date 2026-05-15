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

// 导出渲染函数供 router 使用
export { ctx, canvas, toolPanel, state, setState, cropSelectionHandler, cropOverlay, cropSelectionEl };