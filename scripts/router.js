// 路由模块 - 不再导入 app.js，避免循环依赖

const routes = {
  '#/': { title: '图灵工具' },
  '#/format': { title: '格式转换' },
  '#/compress': { title: '图像压缩' },
  '#/crop': { title: '图片裁切' },
  '#/resize': { title: '尺寸调整' },
  '#/watermark': { title: '水印处理' },
  '#/base64': { title: 'Base64' },
  '#/rotate': { title: '图像旋转' }
};

let renderCallback = null;

export function initRouter(renderFn) {
  renderCallback = renderFn;
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const routeInfo = routes[hash] || routes['#/'];

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(item => {
    const itemRoute = item.getAttribute('data-route');
    const isActive = itemRoute === hash;
    item.classList.toggle('active', isActive);
    if (isActive) {
      item.style.backgroundColor = '#dbe1ff';
      item.style.color = '#004ac6';
      item.style.fontWeight = '600';
    } else {
      item.style.backgroundColor = '';
      item.style.color = '';
      item.style.fontWeight = '';
    }
  });

  // 调用渲染函数
  if (renderCallback) {
    renderCallback(hash);
  }

  // 更新标题
  document.title = `${routeInfo.title} - 图灵工具`;
}
