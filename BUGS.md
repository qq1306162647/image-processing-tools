# 项目问题记录

## 已知问题

### 1. Tailwind CSS CDN 配置顺序
- **问题**: Tailwind CDN 脚本需要在 `tailwind.config` 全局对象之后加载
- **解决方案**: 在 `app.html` 中先定义 config，再用单独的 script 标签加载 CDN
- **状态**: ✅ 已修复 - 创建 `src/app.html` 自定义模板

### 2. Material Symbols 字体
- **问题**: 本地字体文件下载失败（GitHub raw 返回 HTML）
- **解决方案**: 使用 Google Fonts CDN
- **状态**: ✅ 已修复

### 3. Nuxt 4 兼容性
- **问题**: 使用了 Nuxt 4 (nuxt@^4.4.5)
- **注意**: compatibilityDate 设置为 '2024-11-01'
- **状态**: ✅ 已记录

### 4. PostCSS 配置 (Tailwind v4)
- **问题**: Tailwind v4 需要 `@tailwindcss/postcss` 包
- **当前方案**: 使用 CDN 方式
- **状态**: ✅ 已记录

### 5. 图片压缩预估大小不准确
- **问题**:
  - 设置 100% 质量时预估大小比原图大
  - 设置 10% 质量时预估大小也可能比原图大
- **原因**:
  - 比较基准不一致：originalSize 是上传文件大小（可能是不同格式），而压缩后是当前格式
  - 格式转换可能导致大小变化（如 JPEG 转 PNG 无损会变大）
  - 低质量压缩对复杂图像效果可能不如预期
- **解决方案**:
  - 添加压缩率显示（节省 XX% 或增大 XX%）
  - 添加颜色提示：压缩后比原图大时显示红色
- **状态**: ✅ 已修复

## 修复历史

### 2026-05-15
- 创建 `src/app.html` 自定义 HTML 模板
- Tailwind config 在 CDN 脚本之前定义
- 使用 Google Fonts CDN 加载 Inter 和 Material Symbols

### 2026-05-21
- 修复图片压缩预估大小显示问题
- 添加压缩率百分比显示
- 添加颜色提示（红色表示增大，蓝色表示节省）
- 修改 `estimateCompressedSize` 返回压缩率信息
- 更新压缩设置面板显示压缩效果

## 关键文件

- `index.html` - 自定义 HTML 模板，包含 SEO 配置和 AdSense
- `scripts/app.js` - 主应用逻辑，包含各工具页面渲染
- `scripts/state.js` - 状态管理
- `scripts/utils/imageProcessor.js` - 图像处理核心模块
- `scripts/utils/formatConverter.js` - 格式转换
- `scripts/utils/base64.js` - Base64 编解码
- `scripts/utils/watermark.js` - 水印处理
- `scripts/utils/cropSelection.js` - 裁剪选区交互
