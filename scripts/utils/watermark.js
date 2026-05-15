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
