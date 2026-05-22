# To-YongXin.github.io

给 YongXin 的故事网站（GitHub Pages）。

## 本地测试
python3 -m http.server 8080
访问：http://localhost:8080

## 目录结构

```
├── index.html              # 首页（3D 爱心 + 密码入口）
├── menu.html               # 章节目录（由 chapters.json 自动生成）
├── assets/
│   ├── css/                # 样式（home / chapter / menu）
│   ├── js/                 # 脚本（home / chapter / particles / menu）
│   ├── lib/                # three.min.js
│   └── audio/              # 多章共用的背景音乐
├── chapters/
│   ├── chapters.json       # 目录配置（新增章节必改）
│   ├── 01-story-begin/     # 第一章
│   │   ├── index.html
│   │   └── media/          # 本章专属媒体（可选）
│   ├── …
│   └── _template/          # 新章节模板
└── page2.html … page6.html # 旧链接重定向（兼容书签）
```

## 新增一章

1. 复制 `chapters/_template/` 为 `chapters/06-章节英文名/`
2. 把图片、视频、音乐放进该目录的 `media/`
3. 编辑 `index.html` 里的文字与媒体路径（使用 `media/xxx.jpg`）
4. 在 `chapters/chapters.json` 追加一条，并同步 `menu.html` 里 `<script id="chapters-data">` 中的 JSON（两者保持一致）
5. 推送后 GitHub Pages 会自动更新

> 用浏览器直接双击打开 HTML（`file://`）时无法 `fetch` 读文件，目录数据已内嵌在 `menu.html` 中。推荐本地预览：`python3 -m http.server 8080`

## 粒子效果

在章节 `<body>` 上设置 `data-particle`：

| 值 | 效果 |
|---|---|
| `firefly-states` | 多阶段萤火虫（第一章） |
| `bubble` | 气泡上浮 |
| `warm-rain` | 暖色细雨 |
| `petal` | 樱花花瓣 |
| `spark` | 粉色流光 |

## 本地预览

```bash
cd /path/to/To-YongXin.github.io
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```
