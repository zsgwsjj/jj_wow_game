# 部署与分享

这个项目是**纯静态前端**：没有后端、没有构建步骤，`index.html` 直接打开就能玩。  
因此任何支持静态文件托管的服务都可以，关键只是把文件放到 HTTPS 上。

## 已经准备好的发布包

```text
dist/                         # 可直接拖到静态托管平台
release/rift-expedition.zip   # 根目录含 index.html，适合 itch.io / Netlify Drop
```

重新生成：

```bash
python3 tools/package_release.py
```

本地验证：

```bash
python3 -m http.server 8788 --directory dist
# 打开 http://127.0.0.1:8788/
```

---

## 国内访问优先

先说结论：**没有“免费 + 无需备案 + 国内稳定”的完美方案**。如果只选一个给国内朋友试玩，推荐：

> **腾讯云 CloudBase 静态网站托管（先用默认域名）**

它有国内节点、HTTPS、上传即用，不需要自己先备案域名，适合快速分享。缺点是默认域名属于共享测试域名，长期正式使用仍建议绑定自己的已备案域名。

### 最快路径

1. 注册并实名认证腾讯云
2. 进入 [云开发 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
3. 创建一个按量计费环境
4. 打开 **静态网站托管**
5. 把 `dist` 里的**内容**上传到根目录，确保根目录直接有 `index.html`
6. 控制台会给出 `https://<环境ID>.tcloudbaseapp.com` 默认域名
7. 把链接发给朋友

命令行方式：

```bash
npm i -g @cloudbase/cli
tcb login
tcb hosting deploy dist -e <环境ID>
```

> 不同版本 CLI 命令可能略有差异；控制台手动上传最稳。

### 有已备案域名时

如果长期分享、希望国内速度稳定，优先：

- **腾讯云 COS + CDN**
- **阿里云 OSS + CDN**

把 `dist` 上传到存储桶，开启静态网站托管，再绑定已备案域名和国内 CDN。这是国内访问最稳的方案，但需要域名和 ICP 备案。

### 没有备案域名，但想自定义域名

可以选**香港轻量应用服务器**，用 Nginx 托管 `dist`：

- 不需要 ICP 备案
- 国内访问通常比 Netlify / Vercel 稳定
- 但速度和线路仍受运营商、地区影响，不如国内 CDN
- 需要自己维护服务器和 HTTPS

### 不推荐作为国内主链接

以下服务在国外很好用，但国内访问不保证，晚高峰容易慢或间歇性打不开：

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- itch.io
- Surge.sh

可以拿来做海外备用入口，但不建议作为给国内朋友的主要分享链接。

---

## 方案对比

| 方案 | 耗时 | 是否需要账号 | 链接 | 适合 |
| --- | --- | --- | --- | --- |
| **Netlify Drop** | 约 1 分钟 | 领取站点时需要 | `xxx.netlify.app` | 最快拿到固定分享链接 |
| **Cloudflare Pages** | 约 2 分钟 | 需要 | `xxx.pages.dev` | 国内访问相对稳、长期更新 |
| **GitHub Pages** | 约 5 分钟 | 需要 | `name.github.io/repo` | 代码和页面一起维护 |
| **Surge.sh** | 约 1 分钟 | 首次要邮箱 | `xxx.surge.sh` | 命令行一键部署 |
| **itch.io** | 约 5 分钟 | 需要 | `xxx.itch.io/game` | 游戏主页、全屏试玩、朋友反馈 |
| **Cloudflare Quick Tunnel** | 约 30 秒 | 不需要 | 临时 `*.trycloudflare.com` | 本机开着时临时给朋友试 |

---

## 推荐 1：Netlify Drop（最省事）

1. 打开 <https://app.netlify.com/drop>
2. 把整个 `dist` 文件夹拖进去，或拖 `release/rift-expedition.zip`
3. 等待上传完成，得到 `https://随机名.netlify.app`
4. 登录 Netlify 领取站点，可改子域名，例如 `rift-expedition.netlify.app`
5. 把链接发给朋友即可

以后更新：重新运行 `python3 tools/package_release.py`，再把新 `dist` 拖一次，或在站点后台重新部署。

---

## 推荐 2：Cloudflare Pages（长期稳定）

网页操作：

1. 登录 Cloudflare Dashboard
2. **Workers & Pages → Create → Pages → Upload assets**
3. 上传 `dist`
4. 得到 `https://项目名.pages.dev`

或者用命令行：

```bash
npx wrangler pages deploy dist --project-name rift-expedition
```

首次会要求登录 Cloudflare。之后每次更新重新运行：

```bash
python3 tools/package_release.py
npx wrangler pages deploy dist --project-name rift-expedition
```

---

## 推荐 3：GitHub Pages（有仓库时）

如果还没建仓库：

```bash
git init
git add .
git commit -m "deploy rift expedition"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后在 GitHub 仓库：

1. **Settings → Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选 `main`，目录选 `/ (root)`
4. 保存后访问 `https://<用户名>.github.io/<仓库名>/`

项目内部路径都是相对路径，放在子目录下也能正常工作。

---

## 推荐 4：Surge.sh（一条命令）

```bash
npx surge dist rift-expedition.surge.sh
```

首次会要求邮箱和密码。之后更新：

```bash
python3 tools/package_release.py
npx surge dist rift-expedition.surge.sh
```

---

## 推荐 5：itch.io（最适合给朋友“玩游戏”）

1. 新建项目，Kind of project 选 **HTML**
2. 上传 `release/rift-expedition.zip`
3. 勾选 **This file will be played in the browser**
4. Embed options 里建议：
   - Viewport：`1440 × 900`
   - 勾选 **Fullscreen button**
5. 保存并发布，把 `itch.io` 游戏页链接发给朋友

这个项目包含本地字体、图片和音频，全部打进 zip 后不需要额外 CDN。

---

## 临时方案：Cloudflare Quick Tunnel

只适合“我现在电脑开着，朋友马上试一下”：

```bash
# 先启动本地静态服务器
python3 -m http.server 8777 --bind 127.0.0.1

# 另开终端
cloudflared tunnel --url http://127.0.0.1:8777
```

终端会输出一个 `https://随机.trycloudflare.com` 链接。  
**电脑关机或关闭命令后链接失效**，不适合长期分享。

没有 `cloudflared` 时先安装：

```bash
brew install cloudflared
```

---

## 部署注意

- 必须通过 **HTTPS** 访问，避免朋友浏览器限制音频自动播放或剪贴板等能力。
- 游戏没有后端，存档在浏览器 `localStorage`，不同域名/子域名各自独立。
- 静态托管不需要 Node、不需要安装依赖、不需要构建。
- 若更新后朋友仍看到旧界面，让其强制刷新：`Cmd + Shift + R` / `Ctrl + F5`。
- 分享前建议先在手机或窄窗口测试一次；游戏主要面向键鼠，移动端只做提示。
