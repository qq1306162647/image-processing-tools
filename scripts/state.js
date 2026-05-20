// 状态管理
export const state = {
  currentRoute: '#/',
  originalImage: null,
  currentImage: null,
  canvas: null,
  format: 'image/webp',
  quality: 90,
  originalFormat: 'image/png',  // 原图格式，压缩时保持原格式
  convertToWebp: false,  // PNG 图片是否转换为 WebP 压缩
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
    image: null,
    imageData: null,
    imageWidth: 100,
    x: 20,
    y: 20
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
    // 对于简单的顶层属性，直接赋值
    for (const k in key) {
      state[k] = key[k];
    }
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