# 任务管理看板

基于 Vue 3 + Vite 构建的纯前端任务管理看板，支持任务拖拽流转、星标与紧急标记、分类管理、多主题切换和本地数据持久化，无需后端即可直接运行。

## 功能特性

- 三列看板：待办、进行中、已完成，支持双向拖拽流转
- 任务标记：星标标记重要任务，紧急标记红色高亮
- 分类管理：新增任务时可选择或输入分类，自动补全已有分类
- 多主题：亮色、暗色、多彩三套主题，支持悬停预览与一键切换
- 趣味反馈：操作时随机展示鼓励文案，任务完成时触发 Canvas 粒子动画
- 数据持久化：所有操作自动写入 localStorage，刷新不丢失
- 响应式布局：桌面端三列横排，移动端纵向堆叠

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 4 |
| 测试 | Vitest + jsdom + @vue/test-utils |
| 存储 | localStorage |

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:8085

## 可用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm test         # 运行单元测试
```

## 项目结构

```
src/
├── components/     # 看板列、任务卡片、弹窗、主题选择等组件
├── composables/    # 看板状态、Toast、主题、涟漪等组合式函数
├── config/         # 主题色板与提示文案
├── styles/         # CSS 变量
└── utils/          # 存储、时间格式化、CSS 变量工具
tests/              # 单元测试
```

## 测试

共 4 个测试文件、64 个用例，覆盖存储工具、任务卡片、看板列与新增任务弹窗。

```bash
npm test
```