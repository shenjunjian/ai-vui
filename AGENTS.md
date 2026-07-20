## 项目介绍

该项目是一个基于 Vue3 的前端组件库，它的目标是

- 将 CSS 场景化来复用重复的 CSS 代码, 请参阅 `./rules/css.md`
- Vue 组件有统一的组件结构，使用状态驱动, 请参阅 `./rules/vue-component.md`
- 公共逻辑抽取到 hooks 目录，尽量复用它们。
- 尽量使用最前沿的浏览器 API， CSS特性， 比如 dialog, popover API，不考虑向下兼容。

## 目录结构

- apps/site 组件官网，组件开发时的示例代码网页
- packages/scene-theme 与框架无关的 css 库，基于场景实现(暂时不用，待未来启用)
- packages/rfcs 组件库的设计规范
- packages/vai 组件库
- scripts/ 公共脚本

## 开发规范

- 设计为先，所有组件在 `./packages/rfcs` 目录, 请参阅 `./rules/rfcs.md`
- 公共逻辑必须有测试
- 当提出修改时，要同步修改rfcs， vai的组件源码和测试，补充site示例

## 全局命令

当前工程使用 `vp create vite:monorepo`创建的，vp文档在`node_modules/vite-plus/docs` 或者在线地址： https://viteplus.dev/guide/，本项目支持 `vp`的全部命令。

以下为本仓库增加的命令：

```
# 添加一个组件
vp create add-component -- --rawName button  --directory  vai/src/components/button
```
