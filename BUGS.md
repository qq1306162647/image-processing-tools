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
  - 之前的预估使用简单比例计算 `originalSize * qualityPercent`，但这不考虑格式转换的影响
  - 不同格式（JPEG/PNG/WebP）压缩效率差异很大
  - Canvas toBlob 实际压缩效果远好于简单比例估算
  - **关键问题**：PNG 是无损格式，`quality` 参数对 PNG 无效，Canvas 重新编码 PNG 会丢失原始优化导致文件变大
- **解决方案**:
  - 使用 Canvas 真实压缩来获取准确的预估大小
  - 添加压缩率显示（节省 XX% 或增大 XX%）
  - 添加颜色提示：压缩后比原图大时显示红色，节省时显示蓝色
  - **PNG 格式特殊处理**：检测到 PNG 格式时提示"PNG 无损格式，无法压缩"
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
- **重要修复**：使用 Canvas 真实压缩替代简单比例估算，解决预估大小与实际下载大小差异大的问题

## 关键文件

- `index.html` - 自定义 HTML 模板，包含 SEO 配置和 AdSense
- `scripts/app.js` - 主应用逻辑，包含各工具页面渲染
- `scripts/state.js` - 状态管理
- `scripts/utils/imageProcessor.js` - 图像处理核心模块
- `scripts/utils/formatConverter.js` - 格式转换
- `scripts/utils/base64.js` - Base64 编解码
- `scripts/utils/watermark.js` - 水印处理
- `scripts/utils/cropSelection.js` - 裁剪选区交互
