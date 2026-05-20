---
name: 图灵工具 (Turing Tools)
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 260px
  header-height: 64px
  gutter: 16px
---

## 品牌与风格 (Brand & Style)

该设计系统旨在为“图灵工具”打造一个专业、高效且值得信赖的在线图像处理平台。设计语言深受现代 SaaS 平台（如 Adobe Express）的启发，强调**极简主义**与**功能性**，确保用户能够专注于创作任务而非复杂的界面逻辑。

**核心特质：**
*   **专业精准：** 界面整洁，减少视觉噪音，体现工具的生产力属性。
*   **直观易用：** 逻辑清晰的层次结构，降低用户的认知负荷。
*   **现代科技：** 结合动态感与结构美学，营造可靠的科技氛围。

本系统采用**企业级现代风格 (Corporate / Modern)**，通过适度的空间感、考究的排版以及精致的几何轮廓，构建出一个工业标准的工具箱体验。

## 色彩体系 (Colors)

色彩配置以“科技蓝”为核心，辅以理性的灰色阶，构建出冷静且专注的工作环境。

*   **品牌主色 (Primary):** `#2563eb`。用于核心操作、进度指示及关键交互，传递专业与效率。
*   **辅助色 (Secondary):** 采用中性的蓝灰色调，用于次要功能及非核心 UI 元素。
*   **中性色 (Neutral):** 背景使用极其浅淡的灰色（如 `#f8fafc`），边框统一采用 `#e5e7eb`，确保界面层次分明且不干扰图像本身的色彩。
*   **反馈色 (Feedback):** 包含成功、警告及错误状态色，用于即时处理结果通知和校验反馈。

## 字体排版 (Typography)

本设计系统选用 **Inter** 作为基础英文字体，并针对中文环境进行优化适配。在实现时，应优先调用系统预置的无衬线中文字体（如苹方、微软雅黑），以确保字符渲染的清晰度与可读性。

**应用原则：**
*   **层次感：** 通过字重与字号的明显差异区分标题、正文与标签。
*   **可读性：** 正文保持适当的行高 (1.5x)，在处理复杂工具参数时提供舒适的阅读体验。
*   **功能性：** 标签与按钮文字采用更高的字重，确保在紧凑布局中依然具备引导力。

## 布局与间距 (Layout & Spacing)

采用**混合布局模型**。侧边栏 (Side Navigation) 固定宽度，而中央工作区 (Canvas Area) 则采用流体布局，以最大化利用不同尺寸的屏幕空间。

**布局规范：**
*   **侧边导航：** 宽度固定为 260px，承载工具切换与全局设置。
*   **中心画布：** 拥有宽敞的边距 (Padding: 32px)，确保在处理图像时视觉不受干扰。
*   **属性面板：** 位于右侧或底部，采用 16px 的间距单元，保持参数排列的整齐。
*   **响应式策略：** 
    *   **Desktop:** 侧边栏常驻。
    *   **Tablet:** 侧边栏可收缩为图标模式。
    *   **Mobile:** 顶部导航替代侧边栏，工作区全屏显示。

## 层级与深度 (Elevation & Depth)

该设计系统通过**环境阴影 (Ambient Shadows)** 与**层级叠加 (Tonal Layers)** 来传达空间感。

*   **表面层级：**
    *   底座层：主背景，使用 `#f8fafc`。
    *   容器层：白色背景 (`#ffffff`)，用于卡片、面板及画布容器。
*   **投影规范：**
    *   **低海拔：** 用于浮动菜单或轻微升起的卡片，使用极细微的模糊效果 (4px blur, 5% opacity black)。
    *   **高海拔：** 用于模态对话框 (Modal)，使用更深、更扩散的阴影，增强视觉隔离感。
*   **边线处理：** 弱化投影，强化边框。所有容器默认配备 `1px` 实线边框，颜色统一为 `#e5e7eb`，以维持设计的“工业精准感”。

## 形状语言 (Shapes)

形状语言趋向于**稳重且友好**。

*   **基础圆角：** 大多数 UI 元素（如输入框、小按钮、标签）采用 `0.5rem (8px)` 圆角。
*   **容器圆角：** 较大的容器、卡片及弹窗采用 `1rem (16px)` 圆角。
*   **特殊形状：** 进度条和状态标签可采用全圆角 (Pill-shaped)，以增加界面的视觉变化。

这种中等程度的圆角处理在“严谨的生产力工具”与“现代用户体验”之间取得了完美的平衡。

## 组件规范 (Components)

基于上述原则，组件设计应遵循以下准则：

*   **按钮 (Buttons):** 
    *   *Primary:* 品牌蓝背景，白色文字，带有 8px 圆角。
    *   *Secondary:* 白色背景，蓝色文字，`#e5e7eb` 边框。
    *   状态变化：Hover 时颜色加深 10%，Active 时略微缩小 (0.98x scaling)。
*   **输入框 (Input Fields):** 高度统一（如 40px），背景为白色，激活时边框变为品牌蓝并伴有微弱的外发光。
*   **工具栏 (Toolbars):** 采用紧凑布局，图标与文字结合，使用分隔线区分功能组。
*   **卡片 (Cards):** 白色底色，`1px` 浅灰色边框，鼠标悬停时展示极其细微的投影。
*   **属性滑块 (Sliders):** 轨道使用浅灰色，滑块手柄使用品牌蓝，确保在调整图像参数（如亮度、对比度）时具备极佳的触感反馈。
*   **空状态 (Empty States):** 使用简洁的线框图标辅以温和的灰色文字引导用户上传图片。