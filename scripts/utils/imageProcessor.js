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
