# 陈利行 · 产品作品集

个人求职作品集网站。纯静态 HTML + CSS，**没有构建步骤**——改完文件存盘，刷新浏览器就能看到。

## 页面

| 文件 | 页面 |
|---|---|
| `index.html` | 首页：封面 + 项目索引（01 Gloss / 02 Feynman）+ 时间线 + 其他能力 |
| `gloss.html` | Gloss 深度案例（10 章） |
| `feynman.html` | 费曼学习助手案例（5 章） |

> 2026-09-24 删掉了首页的「关于」区和 `about.html` 跳转页——「关于」的内容本来就已并进首页其他区，
> 而那一区本身没有承担信息（学历信息未在站内出现，是有意为之）。
> 导航栏同步减为三项：首页 / Gloss / Feynman。

> 2026-09-23 全站换成 `design-explorations/merged*` 那一版设计（暖墨深色 + 羊皮纸纸色 + 墨绿强调色）。
> **FamCal 没进首页索引**（只在时间线里有一条）——它的详情页还没做，所以整张卡先不放；
> 卡片 + 事项上下文模型的代码原样留在 `index.html` 的 git 历史里（提交 `0bb852c`）。

## 怎么改文案

见 [`改文案指南.md`](./改文案指南.md)。要点：

1. 用记事本或 VS Code 打开 `.html` 文件，**不要用 Word / WPS**
2. 每个文件顶部都有一段「✏️ 改文案指南」注释，列了该页所有可改位置和搜索关键词
3. 只改中文，不要动 `< >` `" "` 和 `class="..."` 里的内容

## 本地预览

双击 `index.html` 用浏览器打开即可。

## 部署

两条线，各管一件事：

| 地址 | 平台 | 怎么更新 |
|---|---|---|
| `clara-lixing.kicp.fun`（简历用这个） | 花生壳 Drop | agent 跑发布命令 → **用户去控制台重绑域名**（Drop 不支持原地更新） |
| `clara-lixing.vercel.app`（备用） | Vercel | `git push` 到 main 自动部署（国内被 DNS 投毒，打不开） |

## 目录

```
.
├── index.html          首页
├── gloss.html          Gloss 案例
├── feynman.html        费曼案例
├── vercel.json         Vercel 配置（cleanUrls）
├── 改文案指南.md        改文案操作手册
├── 改图片指南.md        换图操作手册
├── 图片工具.html        零依赖的换图工具（双击即用，已 gitignore，不进仓库）
├── design-explorations/  改版设计稿（已 gitignore，不发布）
└── assets/
    ├── merged.css      全部样式（站点唯一样式表）
    ├── zoom.js         Gloss 案例页的「点图放大」（截图、规格图、浏览器窗口图）
    ├── fonts/          本地托管的 Space Grotesk / IBM Plex Mono（latin 子集，约 52KB，OFL 许可见 LICENSE.txt）。
    │                   全站不再引用任何外部 CDN——国内访问不会被 jsDelivr 卡住
    ├── style.css       旧版样式，已不再被任何页面引用
    ├── favicon.svg     浏览器标签页图标
    ├── apple-touch-icon.png  手机收藏到桌面时的图标（180×180，由 favicon.svg 渲染）
    ├── og.png          链接分享预览图（1200×630）。是一张**静态图**：改了首页主标题或项目名，要找 agent 重新生成
    └── img/            图片（WebP）
```

## 自检

交付前跑一遍：

1. **资源完整性 + 标签闭合**：用正则抓每页的 `src` / `href` / `url()`，比对磁盘文件是否存在；再数一遍成对容器标签（`section` `div` `figure` …）的开闭数量。
2. **多断点溢出检查**：1440 / 1024 / 768 / 390 四档。判据用「元素右边界 > `clientWidth`」，**不要用 `scrollWidth`**——本站 `html{overflow-x:clip}` 会把溢出夹掉，`scrollWidth` 永远等于 `clientWidth`。`filmstrip`、`table-wrap` 这类 `overflow-x:auto` 容器内部的超出是正常的，要单独归类。
3. **窄屏必须用 iframe 宿主页**（`<iframe style="width:390px">`）模拟：`--window-size=390` 在 Windows 上实际渲染成 504px。

本机没有 agent-browser，用系统 Chrome 无头模式：`--headless=new --screenshot`，每次换一个全新的 `--user-data-dir`（传 Windows 风格路径），否则会命中旧 CSS 缓存。
