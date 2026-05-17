# 图灵工具

一款免费、安全、高效的在线图像处理工具。无需安装下载，打开浏览器即可使用，所有图片处理均在本地完成，保护您的隐私安全。

[在线访问](https://image.safedebug.com) · [功能介绍](#功能介绍)

---

## 功能介绍

### 1. 格式转换
支持 JPEG、PNG、WebP 等常见图片格式之间的相互转换，可调节输出质量。

- 拖拽或点击上传图片
- 选择目标格式（WebP/PNG/JPG）
- 滑块调节输出质量
- 一键转换并下载

### 2. 图片裁剪
支持矩形和圆形裁剪选框，可自由调整裁剪区域和比例。

- 矩形裁剪：自定义宽高比（1:1、4:3、16:9 等）
- 圆形裁剪：生成圆形头像裁剪效果
- 拖拽调整裁剪框大小和位置
- 缩放预览裁剪效果
- 应用裁剪后支持预览和下载

### 3. 尺寸调整
精确调整图片的像素尺寸，支持预设常用尺寸和自定义输入。

- 输入目标宽度和高度
- 锁定/解锁宽高比
- 预设尺寸：1080p、720p、4K、Instagram 正方形等
- 实时预览调整效果

### 4. 图片压缩
智能压缩算法，在保持视觉质量的同时减小文件体积。

- 滑块调节压缩质量
- 实时预估压缩后大小
- 原图与压缩后对比显示
- 一键下载压缩结果

### 5. 水印工具
为图片添加文字或图片水印，支持自由拖拽定位。

**文字水印：**
- 自定义水印文字内容
- 调节字体大小
- 选择水印颜色
- 调整透明度

**图片水印：**
- 上传 PNG/JPG 图片作为水印
- 调节水印宽度
- 调整透明度

**定位功能：**
- 九宫格快速定位（9个预设位置）
- 自由拖拽水印到任意位置
- 水印自动保持在图片边界内

### 6. Base64 转换
图片与 Base64 字符串之间的编码解码工具。

- 图片转 Base64 编码
- Base64 字符串解码为图片
- 支持/不含 Data URI 前缀切换
- 一键复制编码结果
- 拖拽上传图片

### 7. 旋转工具
图片旋转和翻转工具，支持精确角度调整。

- 快捷旋转：左旋 90° / 右旋 90°
- 精细旋转：-45° 到 +45° 角度微调
- 滑块和输入框双重控制
- 实时预览旋转效果
- 下载旋转后的图片

---

## 技术特点

### 安全隐私
- **本地处理**：所有图片处理在浏览器本地完成，不上传到服务器
- **无数据收集**：不追踪、不存储任何用户图片数据
- **离线可用**：加载后可在无网络环境下使用大部分功能

### 轻量高效
- **零构建**：无需 npm install、webpack、vite 等构建工具
- **CDN 加速**：使用 Tailwind CSS CDN，全球极速加载
- **原生性能**：基于 Canvas API，执行效率高

### 响应式设计
- 完美适配桌面端、平板端、移动端
- 简洁直观的用户界面
- 流畅的交互动效

---

## 快速开始

### 直接使用（推荐）

1. 下载或克隆本项目
2. 双击打开 `index.html` 文件
3. 开始使用！

### 使用本地服务器

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

### 部署到服务器

将项目文件夹完整上传到任意 Web 服务器（nginx、Apache）或静态托管平台即可：

- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS

---

## 目录结构

```
image-processing-tools/
├── index.html              # 主入口页面
├── README.md               # 项目说明文档
├── package.json            # Node.js 依赖配置
├── styles/
│   └── app.css            # 应用样式文件
├── fonts/                  # 字体资源
│   └── MaterialSymbols/    # Material Icons 字体
├── scripts/
│   ├── app.js             # 主应用逻辑
│   ├── router.js          # 路由管理
│   ├── state.js           # 状态管理
│   └── utils/
│       ├── imageProcessor.js   # 图像处理核心
│       ├── formatConverter.js  # 格式转换
│       ├── watermark.js       # 水印处理
│       ├── base64.js          # Base64 编解码
│       └── cropSelection.js    # 裁剪选区交互
└── .htaccess              # Apache 配置文件
```

---

## 开发指南

### 环境要求
- 现代浏览器（Chrome、Firefox、Safari、Edge 最新版）
- 无需 Node.js 运行环境（纯 CDN 版本）

### 修改配置

**Tailwind CSS 配置** 在 `index.html` 中：
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        "primary": "#004ac6",  // 修改主题色
        // ...
      }
    }
  }
}
```

**状态管理** 在 `scripts/state.js` 中：
```javascript
export const state = {
  originalImage: null,    // 原始图片
  currentImage: null,       // 当前处理图片
  format: 'image/webp',   // 输出格式
  quality: 90,             // 输出质量
  watermark: {            // 水印配置
    type: 'text',
    text: '水印',
    fontSize: 24,
    // ...
  }
}
```

### 添加新工具页面

1. 在 `scripts/app.js` 添加渲染函数：
```javascript
function renderNewTool() {
  toolContent.innerHTML = `
    <section class="flex-1 p-xl">
      <!-- 页面内容 -->
    </section>
  `;
  setupNewToolPanel();
}
```

2. 在 `render()` 函数中添加路由：
```javascript
switch (hash) {
  case '#/newtool':
    renderNewTool();
    break;
  // ...
}
```

3. 在 `index.html` 侧边栏添加导航链接

---

## 浏览器支持

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| 移动浏览器 | iOS Safari 14+, Android Chrome 90+ |

---

## 常见问题

**Q: 图片处理会上传到服务器吗？**

A: 不会。所有图片处理均在浏览器本地通过 Canvas API 完成，不会上传到任何服务器。

**Q: 支持哪些图片格式？**

A: 支持 JPEG、PNG、WebP、GIF（静态）、SVG 等常见格式。输出支持 JPEG、PNG、WebP。

**Q: 处理大图片会卡顿吗？**

A: 对于一般图片（< 20MB）处理都很流畅。超大图片可能会导致浏览器内存占用较高，建议分批处理。

**Q: 如何保存处理后的图片？**

A: 点击各工具页面的"下载"按钮即可保存到本地。文件名格式为 `功能_时间戳.png`。

**Q: 水印位置如何调整？**

A: 有两种方式：1) 点击九宫格按钮快速定位；2) 直接拖拽水印到任意位置。

---

## 更新日志

### v1.0.0 (2026-05)
- 初始版本发布
- 支持 7 大核心功能：格式转换、图片裁剪、尺寸调整、图片压缩、水印工具、Base64 转换、旋转工具
- 响应式设计，支持移动端
- SEO 优化配置

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

本项目基于 MIT 许可证开源，欢迎免费使用于个人和商业项目。

---

## 联系方式

- 项目官网：https://image.safedebug.com
- 问题反馈：1306162647@qq.com

---

<p align="center">
  <strong>图灵工具</strong> - 让图像处理更简单
</p>
