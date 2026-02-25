# 貢獻指南

感謝您對背景去除工具項目的關注！我們歡迎各種形式的貢獻。

## 📋 目錄

- [行為準則](#行為準則)
- [如何貢獻](#如何貢獻)
- [開發流程](#開發流程)
- [代碼規範](#代碼規範)
- [提交訊息規範](#提交訊息規範)
- [問題報告](#問題報告)
- [功能建議](#功能建議)

## 行為準則

### 我們的承諾

為了營造開放和友善的環境，我們承諾讓每個人都能無障礙地參與我們的項目和社區。

### 我們的標準

**積極行為包括：**

- 使用友善和包容的語言
- 尊重不同的觀點和經驗
- 優雅地接受建設性批評
- 關注對社區最有利的事情
- 對其他社區成員表示同理心

**不可接受的行為包括：**

- 使用性化語言或圖像
- 惡意評論或人身攻擊
- 公開或私下騷擾
- 未經許可發布他人的私人信息
- 其他不道德或不專業的行為

## 如何貢獻

### 報告錯誤

在報告錯誤之前，請：

1. 檢查[現有問題](https://github.com/your-username/background-remover/issues)，避免重複
2. 確保使用最新版本
3. 檢查是否是瀏覽器兼容性問題

報告錯誤時，請包含：

- 清晰的標題和描述
- 重現步驟
- 預期行為和實際行為
- 截圖（如適用）
- 瀏覽器和版本信息
- 操作系統信息

### 建議新功能

功能建議應該：

- 清楚解釋功能的用途
- 說明為什麼這個功能有用
- 提供可能的實現方案（可選）

### 提交代碼

1. **Fork 倉庫**

   ```bash
   # 在 GitHub 上點擊 Fork 按鈕
   ```

2. **克隆您的 Fork**

   ```bash
   git clone https://github.com/your-username/background-remover.git
   cd background-remover
   ```

3. **創建分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **進行更改並提交**

   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

5. **推送到您的 Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **創建 Pull Request**
   - 在 GitHub 上打開 Pull Request
   - 填寫 PR 模板
   - 等待審核

## 開發流程

### 環境設置

```bash
# 克隆倉庫
git clone https://github.com/your-username/background-remover.git
cd background-remover

# 啟動開發服務器（使用 Node.js）
npm start

# 或使用 Python
python -m http.server 8000
```

### 項目結構

```
background-remover/
├── index.html              # 主 HTML 文件
├── css/
│   └── styles.css          # 樣式表
├── js/
│   ├── app.js              # 主應用入口
│   ├── core/               # 核心功能模塊
│   │   ├── BackgroundRemover.js
│   │   └── ImageProcessor.js
│   └── utils/              # 工具函數
│       └── ColorUtils.js
└── README.md
```

### 測試

在提交之前，請：

1. 在多個瀏覽器中測試（Chrome、Firefox、Safari、Edge）
2. 測試響應式設計（桌面、平板、手機）
3. 使用不同類型的圖像測試功能
4. 檢查控制台是否有錯誤

## 代碼規範

### JavaScript 規範

```javascript
/**
 * 函數應該有完整的 JSDoc 註解
 * @param {type} paramName - 參數說明
 * @returns {type} 返回值說明
 */
function exampleFunction(paramName) {
  // 使用 camelCase 命名變量
  const myVariable = "value";

  // 使用單引號
  const message = "Hello";

  // 使用 ES6+ 語法
  const arrow = () => console.log("Arrow function");

  // 適當的空格和縮進（2 空格）
  if (condition) {
    doSomething();
  }

  return result;
}

// 類使用 PascalCase
class MyClass {
  constructor() {
    this.property = value;
  }

  // 公共方法
  publicMethod() {
    // 實現
  }

  // 私有方法標記為 @private
  /**
   * @private
   */
  privateMethod() {
    // 實現
  }
}
```

### CSS 規範

```css
/**
 * CSS 類使用 kebab-case
 * 添加註解說明樣式用途
 */

/* ==================== 區塊標題 ==================== */

/**
 * 組件描述
 */
.component-name {
  /* 按邏輯分組屬性 */
  /* 佈局 */
  display: flex;
  flex-direction: column;

  /* 尺寸 */
  width: 100%;
  height: auto;

  /* 間距 */
  margin: 0;
  padding: 10px;

  /* 視覺效果 */
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
}
```

### HTML 規範

```html
<!-- 使用語義化標籤 -->
<header>
  <h1>標題</h1>
</header>

<main>
  <section class="content-section">
    <!-- 適當的縮進 -->
    <article>
      <h2>子標題</h2>
      <p>內容</p>
    </article>
  </section>
</main>

<footer>
  <p>版權信息</p>
</footer>

<!-- 使用有意義的 ID 和類名 -->
<button id="submitBtn" class="primary-button">提交</button>

<!-- 添加必要的無障礙屬性 -->
<img src="image.jpg" alt="圖片描述" />
<button aria-label="關閉">×</button>
```

## 提交訊息規範

使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 類型 (Type)

- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔變更
- `style`: 代碼格式（不影響代碼運行）
- `refactor`: 重構（既不是新功能也不是錯誤修復）
- `perf`: 性能優化
- `test`: 添加測試
- `chore`: 構建過程或輔助工具的變動

### 範例

```bash
feat(background-removal): 添加批量處理功能

- 支持一次處理多張圖片
- 添加進度條顯示
- 優化內存使用

Closes #123
```

```bash
fix(image-processor): 修復圖像縮放比例錯誤

修復當圖像寬高比極端時的縮放問題

Fixes #456
```

## 問題報告

### 錯誤報告模板

```markdown
## 問題描述

清楚簡潔地描述問題

## 重現步驟

1. 前往 '...'
2. 點擊 '....'
3. 滾動到 '....'
4. 看到錯誤

## 預期行為

描述您期望發生什麼

## 實際行為

描述實際發生了什麼

## 截圖

如果適用，添加截圖

## 環境

- OS: [例如 Windows 10]
- Browser: [例如 Chrome 96]
- Version: [例如 1.0.0]

## 附加信息

其他相關信息
```

## 功能建議

### 功能請求模板

```markdown
## 功能描述

清楚簡潔地描述您想要的功能

## 問題背景

這個功能解決了什麼問題？

## 建議的解決方案

描述您希望如何實現

## 替代方案

描述您考慮過的其他解決方案

## 附加信息

添加其他相關信息或截圖
```

## Pull Request 流程

1. **確保 PR 描述清晰**
   - 說明更改的內容
   - 引用相關 Issue
   - 列出測試情況

2. **代碼審查**
   - 代碼將被項目維護者審查
   - 可能需要進行修改
   - 保持耐心和開放態度

3. **合併**
   - 審查通過後，PR 將被合併
   - 您的貢獻將出現在下一個發布版本中

## 獲得幫助

如果您需要幫助：

- 查看 [README](README.md)
- 搜索[現有問題](https://github.com/your-username/background-remover/issues)
- 加入[討論](https://github.com/your-username/background-remover/discussions)

## 致謝

感謝所有為這個項目做出貢獻的人！

---

**再次感謝您的貢獻！** ❤️
