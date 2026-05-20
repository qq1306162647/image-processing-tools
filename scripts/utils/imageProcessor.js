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
export function crop(img, x, y, w, h, originWidth, originHeight, shape = 'rect') {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // 使用 naturalWidth/naturalHeight 来计算，因为 img.width/height 可能是 CSS 显示尺寸
  const srcX = (x / originWidth) * img.naturalWidth;
  const srcY = (y / originHeight) * img.naturalHeight;
  const srcW = (w / originWidth) * img.naturalWidth;
  const srcH = (h / originHeight) * img.naturalHeight;

  if (shape === 'circle') {
    // 圆形裁剪 - 使用路径裁剪
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, w, h);
  }

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
 * 返回预估大小和压缩率信息
 */
export function estimateCompressedSize(img, quality, format) {
  return new Promise((resolve) => {
    const canvas = drawImage(img);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve({ size: 0, ratio: 0 });
          return;
        }
        // 估算未压缩的大小作为参考
        const uncompressedSize = img.naturalWidth * img.naturalHeight * 4; // RGBA
        const ratio = Math.max(0, Math.min(1, blob.size / uncompressedSize));
        resolve({ size: blob.size, ratio });
      },
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
