# 陈利行 · 产品作品集

个人求职作品集网站。纯静态 HTML + CSS，**没有构建步骤**——改完文件存盘，刷新浏览器就能看到。

## 页面

| 文件 | 页面 |
|---|---|
| `index.html` | 首页：两个独立定义的 AI 产品 |
| `gloss.html` | Gloss 深度案例（9 章） |
| `feynman.html` | 费曼学习助手案例（6 章） |
| `about.html` | 关于与时间线 |

## 怎么改文案

见 [`改文案指南.md`](./改文案指南.md)。要点：

1. 用记事本或 VS Code 打开 `.html` 文件，**不要用 Word / WPS**
2. 每个文件顶部都有一段「✏️ 改文案指南」注释，列了该页所有可改位置和搜索关键词
3. 只改中文，不要动 `< >` `" "` 和 `class="..."` 里的内容

## 本地预览

双击 `index.html` 用浏览器打开即可。

## 部署

托管在 Vercel。推送到 `main` 分支后自动重新部署。

## 目录

```
.
├── index.html          首页
├── gloss.html          Gloss 案例
├── feynman.html        费曼案例
├── about.html          关于
├── vercel.json         Vercel 配置（cleanUrls）
├── 改文案指南.md        改文案操作手册
└── assets/
    ├── style.css       全部样式
    └── img/            图片（大部分为 WebP，整站约 828KB）
```
