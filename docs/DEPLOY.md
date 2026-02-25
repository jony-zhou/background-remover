# 🚀 GitHub 部署指南

本指南將幫助您將背景去除工具項目部署到 GitHub，並使用 GitHub Pages 提供在線訪問。

## 📋 目錄

- [準備工作](#準備工作)
- [創建 GitHub 倉庫](#創建-github-倉庫)
- [推送代碼到 GitHub](#推送代碼到-github)
- [配置 GitHub Pages](#配置-github-pages)
- [自定義域名（可選）](#自定義域名可選)
- [持續更新](#持續更新)

## 準備工作

### 1. 安裝 Git

如果尚未安裝 Git：

**Windows:**

- 下載並安裝 [Git for Windows](https://git-scm.com/download/win)

**macOS:**

```bash
brew install git
```

**Linux:**

```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

### 2. 配置 Git

```bash
# 設置用戶名
git config --global user.name "Your Name"

# 設置郵箱
git config --global user.email "your.email@example.com"

# 驗證配置
git config --list
```

### 3. 註冊 GitHub 賬號

如果還沒有 GitHub 賬號，請訪問 [github.com](https://github.com) 註冊。

## 創建 GitHub 倉庫

### 方法一：在 GitHub 網站創建

1. **登錄 GitHub**  
   訪問 [github.com](https://github.com) 並登錄

2. **創建新倉庫**
   - 點擊右上角的 "+" 按鈕
   - 選擇 "New repository"

3. **填寫倉庫信息**
   - **Repository name**: `background-remover`
   - **Description**: `一個強大且易用的基於瀏覽器的背景去除工具`
   - **公開/私有**: 選擇 Public（公開）
   - **不要**勾選 "Initialize this repository with a README"（我們已有 README）
   - 點擊 "Create repository"

## 推送代碼到 GitHub

### 1. 初始化本地倉庫（如果尚未初始化）

```bash
# 進入項目目錄
cd d:\yueting.zhou\Project\background-remover

# 初始化 Git 倉庫
git init

# 添加所有文件
git add .

# 創建初始提交
git commit -m "feat: 初始化項目 - 完整的背景去除工具"
```

### 2. 連接遠程倉庫

```bash
# 添加遠程倉庫（替換 YOUR-USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR-USERNAME/background-remover.git

# 驗證遠程倉庫
git remote -v
```

### 3. 推送代碼

```bash
# 推送到 GitHub（首次推送）
git push -u origin main

# 如果您的默認分支是 master，使用：
# git push -u origin master
```

如果遇到身份驗證問題：

- GitHub 已不再支持密碼認證
- 需要使用 [Personal Access Token](https://github.com/settings/tokens) 或 SSH 密鑰

### 創建 Personal Access Token

1. 訪問 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 點擊 "Generate new token (classic)"
3. 選擇範圍：`repo` (完整權限)
4. 生成並複製 Token
5. 在推送時使用 Token 作為密碼

## 配置 GitHub Pages

### 方法一：使用 main 分支

1. **進入倉庫設置**  
   在 GitHub 倉庫頁面，點擊 "Settings"

2. **找到 Pages 設置**  
   在左側菜單中找到 "Pages"

3. **配置 Source**
   - Source: 選擇 "Deploy from a branch"
   - Branch: 選擇 `main` 和 `/ (root)`
   - 點擊 "Save"

4. **等待部署**  
   GitHub 將自動部署您的網站，通常需要 1-2 分鐘

5. **訪問網站**  
   部署完成後，您的網站將可以在以下地址訪問：
   ```
   https://YOUR-USERNAME.github.io/background-remover/
   ```

### 方法二：使用 gh-pages 分支（推薦）

1. **安裝 gh-pages 工具**（可選）

   ```bash
   npm install -g gh-pages
   ```

2. **創建部署腳本**  
   在 `package.json` 中添加：

   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d ."
     }
   }
   ```

3. **部署**

   ```bash
   npm run deploy
   ```

4. **配置 GitHub Pages**
   - 在倉庫 Settings → Pages
   - Branch 選擇 `gh-pages`

## 驗證部署

訪問您的網站：

```
https://YOUR-USERNAME.github.io/background-remover/
```

檢查：

- [ ] 頁面能正常加載
- [ ] 可以上傳圖片
- [ ] 背景去除功能正常
- [ ] 可以下載結果

## 自定義域名（可選）

如果您有自己的域名：

### 1. 配置 DNS

在您的域名提供商處添加 DNS 記錄：

**A 記錄**（如果使用頂級域名）：

```
@    A    185.199.108.153
@    A    185.199.109.153
@    A    185.199.110.153
@    A    185.199.111.153
```

**CNAME 記錄**（如果使用子域名）：

```
www    CNAME    YOUR-USERNAME.github.io
```

### 2. 在 GitHub 中配置

1. 在倉庫 Settings → Pages
2. 在 "Custom domain" 中輸入您的域名
3. 勾選 "Enforce HTTPS"
4. 點擊 "Save"

### 3. 創建 CNAME 文件

在項目根目錄創建 `CNAME` 文件：

```
yourdomain.com
```

提交並推送：

```bash
git add CNAME
git commit -m "chore: 添加自定義域名"
git push
```

## 持續更新

### 日常開發流程

1. **修改代碼**

   ```bash
   # 查看更改
   git status
   ```

2. **暫存更改**

   ```bash
   # 暫存所有更改
   git add .

   # 或暫存特定文件
   git add file1.js file2.css
   ```

3. **提交更改**

   ```bash
   # 使用規範的提交訊息
   git commit -m "feat: 添加批量處理功能"
   git commit -m "fix: 修復圖像縮放問題"
   git commit -m "docs: 更新 README"
   ```

4. **推送到 GitHub**

   ```bash
   git push origin main
   ```

5. **GitHub Pages 自動更新**
   推送後，GitHub Pages 會自動重新部署（通常 1-2 分鐘）

### 查看提交歷史

```bash
# 查看提交日誌
git log --oneline

# 查看圖形化日誌
git log --graph --oneline --all
```

### 撤銷更改

```bash
# 撤銷未暫存的更改
git checkout -- file.js

# 撤銷已暫存的更改
git reset HEAD file.js

# 撤銷最後一次提交（保留更改）
git reset --soft HEAD~1

# 回退到特定提交
git reset --hard commit-hash
```

## 協作開發

### 1. Fork 工作流

**其他開發者**：

```bash
# Fork 倉庫（在 GitHub 網站上點擊 Fork）

# 克隆 Fork 的倉庫
git clone https://github.com/THEIR-USERNAME/background-remover.git

# 創建功能分支
git checkout -b feature/new-feature

# 進行更改並提交
git add .
git commit -m "feat: 添加新功能"

# 推送到 Fork
git push origin feature/new-feature

# 在 GitHub 上創建 Pull Request
```

**項目維護者**：

- 審查 Pull Request
- 合併或請求修改
- 合併後自動部署

### 2. 分支策略

```bash
# 創建功能分支
git checkout -b feature/batch-processing

# 開發完成後合併回 main
git checkout main
git merge feature/batch-processing

# 刪除已合併的分支
git branch -d feature/batch-processing
```

## GitHub Actions 自動化（高級）

創建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

這將在每次推送到 main 分支時自動部署。

## 監控和分析

### GitHub Insights

查看倉庫統計：

- 訪問者數量
- 克隆次數
- 流行的內容
- 流量來源

位置：倉庫 → Insights

### 添加 Google Analytics（可選）

在 `index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

## 故障排除

### 問題 1: 推送被拒絕

```bash
# 錯誤：Updates were rejected because the remote contains work that you do not have locally

# 解決：先拉取遠程更改
git pull origin main --rebase
git push origin main
```

### 問題 2: GitHub Pages 未更新

- 檢查 Actions 標籤頁是否有構建錯誤
- 清除瀏覽器緩存
- 等待 5-10 分鐘再試
- 檢查 Settings → Pages 設置是否正確

### 問題 3: ES6 模塊在 GitHub Pages 上不工作

確保：

- 文件路徑正確
- MIME 類型正確（GitHub Pages 自動處理）
- 使用相對路徑，不是絕對路徑

### 問題 4: 合併衝突

```bash
# 查看衝突文件
git status

# 手動解決衝突後
git add resolved-file.js
git commit -m "fix: 解決合併衝突"
```

## 安全最佳實踐

### 1. 保護敏感信息

- ✅ 使用 `.gitignore` 排除敏感文件
- ✅ 不要提交 API 密鑰或憑證
- ✅ 使用環境變量存儲機密信息

### 2. 代碼審查

- 審查所有 Pull Request
- 使用分支保護規則
- 要求至少一個審查才能合併

### 3. 依賴安全

```bash
# 如果有 npm 依賴，定期檢查漏洞
npm audit

# 修復漏洞
npm audit fix
```

## 有用的 Git 命令

```bash
# 查看遠程倉庫信息
git remote -v

# 查看分支
git branch -a

# 切換分支
git checkout branch-name

# 創建並切換分支
git checkout -b new-branch

# 刪除分支
git branch -d branch-name

# 查看更改
git diff

# 暫存部分更改
git add -p

# 修改最後一次提交訊息
git commit --amend

# 查看某個文件的歷史
git log -- path/to/file

# 恢復已刪除的文件
git checkout HEAD -- deleted-file.js
```

## 資源鏈接

- [GitHub 文檔](https://docs.github.com/)
- [GitHub Pages 文檔](https://docs.github.com/pages)
- [Git 教程](https://git-scm.com/book/zh-tw/v2)
- [Pro Git 書籍（中文）](https://git-scm.com/book/zh-tw/v2)

## 獲得幫助

遇到問題？

- 📖 查看 [GitHub 社區論壇](https://github.community/)
- 💬 在項目中創建 [Issue](https://github.com/YOUR-USERNAME/background-remover/issues)
- 📧 聯繫 GitHub 支持

---

**恭喜！您的項目已成功部署到 GitHub！** 🎉

記得定期更新和維護您的倉庫，保持代碼整潔和文檔最新。
