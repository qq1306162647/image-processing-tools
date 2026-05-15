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
