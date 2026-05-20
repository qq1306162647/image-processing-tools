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
    this.isCircle = false;

    this.init();
    this.showDefault();
  }

  init() {
    // 添加8个调整手柄
    this.selection.innerHTML = `
      <div class="resize-handle nw"></div>
      <div class="resize-handle n"></div>
      <div class="resize-handle ne"></div>
      <div class="resize-handle e"></div>
      <div class="resize-handle se"></div>
      <div class="resize-handle s"></div>
      <div class="resize-handle sw"></div>
      <div class="resize-handle w"></div>
    `;

    // 拖动整个选区
    this.selection.addEventListener('mousedown', this.onDragStart.bind(this));

    // 调整大小手柄
    this.selection.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', this.onResizeStart.bind(this));
    });

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
      this.isCircle = true;
      this.selection.classList.add('circle');
      const size = Math.min(this.selection.offsetWidth, this.selection.offsetHeight);
      const currentLeft = parseFloat(this.selection.style.left);
      const currentTop = parseFloat(this.selection.style.top);
      const diff = this.selection.offsetWidth - size;
      this.selection.style.width = size + 'px';
      this.selection.style.height = size + 'px';
      this.selection.style.left = (currentLeft + diff / 2) + 'px';
      this.selection.style.top = (currentTop + diff / 2) + 'px';
    } else {
      this.isCircle = false;
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

  onResizeStart(e) {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    this.resizeHandle = e.target.className.split(' ')[1]; // 获取方向 (nw, n, ne, e, se, s, sw, w)
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startLeft = parseFloat(this.selection.style.left);
    this.startTop = parseFloat(this.selection.style.top);
    this.startWidth = this.selection.offsetWidth;
    this.startHeight = this.selection.offsetHeight;
  }

  onMouseMove(e) {
    if (this.isDragging) {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      let newLeft = this.startLeft + dx;
      let newTop = this.startTop + dy;

      const maxLeft = this.overlay.clientWidth - this.selection.offsetWidth;
      const maxTop = this.overlay.clientHeight - this.selection.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      this.selection.style.left = newLeft + 'px';
      this.selection.style.top = newTop + 'px';
    }

    if (this.isResizing) {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      let newLeft = this.startLeft;
      let newTop = this.startTop;
      let newWidth = this.startWidth;
      let newHeight = this.startHeight;
      const minSize = 50;

      const aspectRatio = this.startWidth / this.startHeight;

      switch (this.resizeHandle) {
        case 'se':
          newWidth = Math.max(minSize, this.startWidth + dx);
          newHeight = this.isCircle ? newWidth : Math.max(minSize, this.startHeight + dy);
          break;
        case 'sw':
          newWidth = Math.max(minSize, this.startWidth - dx);
          newHeight = this.isCircle ? newWidth : Math.max(minSize, this.startHeight + dy);
          newLeft = this.startLeft + this.startWidth - newWidth;
          break;
        case 'ne':
          newWidth = Math.max(minSize, this.startWidth + dx);
          newHeight = this.isCircle ? newWidth : Math.max(minSize, this.startHeight - dy);
          newTop = this.startTop + this.startHeight - newHeight;
          break;
        case 'nw':
          newWidth = Math.max(minSize, this.startWidth - dx);
          newHeight = this.isCircle ? newWidth : Math.max(minSize, this.startHeight - dy);
          newLeft = this.startLeft + this.startWidth - newWidth;
          newTop = this.startTop + this.startHeight - newHeight;
          break;
        case 'n':
          newHeight = Math.max(minSize, this.startHeight - dy);
          newTop = this.startTop + this.startHeight - newHeight;
          break;
        case 's':
          newHeight = Math.max(minSize, this.startHeight + dy);
          break;
        case 'e':
          newWidth = Math.max(minSize, this.startWidth + dx);
          break;
        case 'w':
          newWidth = Math.max(minSize, this.startWidth - dx);
          newLeft = this.startLeft + this.startWidth - newWidth;
          break;
      }

      if (this.isCircle) {
        const size = Math.min(newWidth, newHeight);
        newWidth = size;
        newHeight = size;
      }

      this.selection.style.width = newWidth + 'px';
      this.selection.style.height = newHeight + 'px';
      this.selection.style.left = newLeft + 'px';
      this.selection.style.top = newTop + 'px';
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
