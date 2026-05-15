import { render } from './app.js';

const routes = {
  '#/': { title: '图灵工具', render },
  '#/format': { title: '格式转换', render },
  '#/compress': { title: '图像压缩', render },
  '#/crop': { title: '图片裁切', render },
  '#/resize': { title: '尺寸调整', render },
  '#/watermark': { title: '水印处理', render },
  '#/base64': { title: 'Base64', render },
  '#/rotate': { title: '图像旋转', render }
};

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const route = routes[hash] || routes['#/'];

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === hash);
  });

  // 调用渲染函数
  if (route.render) {
    route.render(hash);
  }

  // 更新标题
  document.title = `${route.title} - 图灵工具`;
}