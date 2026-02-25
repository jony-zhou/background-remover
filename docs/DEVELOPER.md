# 開發者文檔

本文檔提供背景去除工具的詳細技術說明，幫助開發者理解代碼結構和實現原理。

## 📑 目錄

- [架構概覽](#架構概覽)
- [核心模塊](#核心模塊)
- [算法詳解](#算法詳解)
- [API 參考](#api-參考)
- [性能優化](#性能優化)
- [擴展指南](#擴展指南)

## 架構概覽

### 設計模式

本項目採用以下設計模式：

#### 1. 單一職責原則 (SRP)

每個類負責單一功能：

- `ImageProcessor`: 圖像加載和基本操作
- `BackgroundRemover`: 背景去除算法
- `ColorUtils`: 顏色計算工具
- `UIController`: UI 事件處理

#### 2. 模塊化架構

```
┌─────────────────────────────────────┐
│         UIController                │  ← 用戶界面層
│  (事件處理、狀態管理、UI更新)         │
└────────────┬────────────────────────┘
             │
             ├──→ ImageProcessor       ← 圖像處理層
             │    (加載、縮放、導出)
             │
             └──→ BackgroundRemover    ← 算法層
                  ├─→ ColorUtils       ← 工具層
                  └─→ 洪水填充算法
```

### 數據流

```
用戶上傳圖片
    ↓
ImageProcessor 加載並縮放
    ↓
用戶點擊背景
    ↓
獲取點擊位置像素顏色
    ↓
BackgroundRemover 執行洪水填充
    ↓
創建背景遮罩
    ↓
應用平滑和羽化
    ↓
生成透明背景圖像
    ↓
顯示結果並允許下載
```

## 核心模塊

### 1. ColorUtils (顏色工具類)

**職責**: 提供顏色轉換和比較功能

#### 關鍵方法

```javascript
// 十六進制轉 RGB
static hexToRgb(hex)
// 輸入: '#FF5733'
// 輸出: {r: 255, g: 87, b: 51}

// 計算顏色距離（感知加權）
static calculateColorDistance(r1, g1, b1, r2, g2, b2)
// 使用加權歐氏距離，考慮人眼對綠色更敏感

// 檢查顏色是否匹配
static isColorMatch(r1, g1, b1, r2, g2, b2, tolerance)
// 返回 true/false
```

#### 顏色距離公式

```javascript
distance = √(ΔR² × 0.3 + ΔG² × 0.59 + ΔB² × 0.11)
```

權重說明：

- **綠色 (0.59)**: 人眼最敏感
- **紅色 (0.30)**: 中等敏感
- **藍色 (0.11)**: 最不敏感

### 2. ImageProcessor (圖像處理器)

**職責**: 處理圖像加載、縮放和基本操作

#### 主要屬性

```javascript
this.canvas; // Canvas DOM 元素
this.ctx; // 2D 渲染上下文
this.originalImageData; // 原始圖像數據
this.currentImage; // 當前圖像元素
```

#### 關鍵方法

```javascript
// 加載圖像到畫布
loadImage(img, maxWidth, maxHeight);
// - 計算適當的縮放比例
// - 保持寬高比
// - 保存原始圖像數據

// 計算適應容器的尺寸
calculateDimensions(width, height, maxWidth, maxHeight);
// - 如果超過最大值，按比例縮放
// - 返回 {width, height}

// 獲取像素顏色
getPixelColor(x, y);
// - 返回 {r, g, b}

// 導出為 Data URL
toDataURL(format, quality);
// - 支持 PNG、JPEG 等格式
```

### 3. BackgroundRemover (背景去除器)

**職責**: 實現背景去除的核心算法

#### 主要流程

```javascript
removeBackground(clickX, clickY, options) {
  // 1. 獲取點擊位置的顏色
  const targetColor = getPixelColor(clickX, clickY)

  // 2. 創建背景遮罩（洪水填充）
  const mask = createBackgroundMask(...)

  // 3. 應用平滑處理
  if (smoothing > 0) {
    applySmoothingToMask(mask, ...)
  }

  // 4. 應用遮罩並處理透明度
  const result = applyMaskToImage(...)

  return result
}
```

#### 關鍵算法

##### A. 洪水填充 (Flood Fill)

```javascript
createBackgroundMask(data, width, height, startX, startY, targetColor, tolerance) {
  const mask = new Uint8Array(width * height)
  const visited = new Set()
  const stack = [[startX, startY]]

  while (stack.length > 0) {
    const [x, y] = stack.pop()

    // 邊界檢查
    if (越界 || 已訪問) continue

    // 獲取當前像素顏色
    const currentColor = getPixelColor(x, y)

    // 顏色匹配檢查
    if (colorMatch(currentColor, targetColor, tolerance)) {
      visited.add([x, y])
      mask[y * width + x] = 1

      // 添加四個相鄰像素
      stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1])
    }
  }

  return mask
}
```

時間複雜度: O(n)，其中 n 是圖像像素數  
空間複雜度: O(n)，用於存儲遮罩和訪問記錄

##### B. 邊緣平滑

```javascript
applySmoothingToMask(mask, width, height, iterations) {
  for (let iter = 0; iter < iterations; iter++) {
    const newMask = [...mask]

    // 對每個像素應用 3×3 平均濾波器
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0

        // 計算 3×3 鄰域的平均值
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += mask[(y + dy) * width + (x + dx)]
          }
        }

        // 閾值化：> 0.5 的設為 1（背景）
        newMask[y * width + x] = (sum / 9) > 0.5 ? 1 : 0
      }
    }

    mask = newMask
  }
}
```

##### C. 邊緣羽化

```javascript
getEdgeDistance(mask, x, y, width, height, maxDistance) {
  // 如果不在遮罩內，返回最大距離
  if (!mask[y * width + x]) return maxDistance

  let minDistance = maxDistance

  // 在半徑範圍內搜索最近的非遮罩像素
  for (let dy = -maxDistance; dy <= maxDistance; dy++) {
    for (let dx = -maxDistance; dx <= maxDistance; dx++) {
      const nx = x + dx
      const ny = y + dy

      if (邊界內 && !mask[ny * width + nx]) {
        const distance = √(dx² + dy²)
        minDistance = min(minDistance, distance)
      }
    }
  }

  return minDistance
}
```

羽化 Alpha 值計算：

```javascript
alpha = max(0, 1 - edgeDistance / featherRadius);
```

### 4. UIController (UI 控制器)

**職責**: 管理用戶界面和事件處理

#### 事件處理流程

```javascript
文件上傳
  → handleFileUpload()
    → FileReader.readAsDataURL()
      → Image.onload
        → loadImage()
          → ImageProcessor.loadImage()
            → 更新 UI 狀態

畫布點擊
  → handleCanvasClick()
    → 計算畫布座標
      → performBackgroundRemoval()
        → BackgroundRemover.removeBackground()
          → 應用顏色替換（如果啟用）
            → 繪製結果

下載按鈕
  → handleDownload()
    → canvas.toDataURL('image/png')
      → 創建下載連結
        → 觸發下載
```

## 算法詳解

### 洪水填充算法優化

#### 1. 使用迭代而非遞歸

**原因**: 避免調用堆疊溢出

```javascript
// ❌ 遞歸方式（可能堆疊溢出）
function floodFillRecursive(x, y) {
  if (shouldFill(x, y)) {
    fill(x, y);
    floodFillRecursive(x + 1, y);
    floodFillRecursive(x - 1, y);
    floodFillRecursive(x, y + 1);
    floodFillRecursive(x, y - 1);
  }
}

// ✅ 迭代方式（使用堆疊）
function floodFillIterative(startX, startY) {
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();

    if (shouldFill(x, y)) {
      fill(x, y);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }
}
```

#### 2. 使用 Set 追蹤已訪問像素

```javascript
const visited = new Set();
const key = `${x},${y}`;

if (!visited.has(key)) {
  visited.add(key);
  // 處理像素
}
```

時間複雜度: O(1) 查找和插入

#### 3. 4-連通 vs 8-連通

```javascript
// 4-連通（當前使用）
stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);

// 8-連通（可選，包含對角線）
stack.push(
  [x + 1, y],
  [x - 1, y],
  [x, y + 1],
  [x, y - 1], // 四個方向
  [x + 1, y + 1],
  [x - 1, y - 1],
  [x + 1, y - 1],
  [x - 1, y + 1], // 四個對角
);
```

### 顏色匹配優化

#### 感知加權距離

人眼對不同顏色的敏感度不同：

```javascript
// 簡單歐氏距離（不準確）
distance = √(ΔR² + ΔG² + ΔB²)

// 感知加權距離（更準確）
distance = √(ΔR² × 0.3 + ΔG² × 0.59 + ΔB² × 0.11)
```

#### 容差映射

```javascript
// 用戶輸入: 0-100
// 實際距離閾值: tolerance × 2.5

if (colorDistance <= tolerance × 2.5) {
  // 顏色匹配
}
```

## API 參考

### ColorUtils

```javascript
/**
 * 十六進制轉 RGB
 * @param {string} hex - 格式: '#RRGGBB'
 * @returns {Object|null} {r, g, b} 或 null
 */
ColorUtils.hexToRgb(hex);

/**
 * 計算顏色距離
 * @param {number} r1, g1, b1 - 第一個顏色 (0-255)
 * @param {number} r2, g2, b2 - 第二個顏色 (0-255)
 * @returns {number} 距離值
 */
ColorUtils.calculateColorDistance(r1, g1, b1, r2, g2, b2);

/**
 * 檢查顏色是否匹配
 * @param {number} r1, g1, b1 - 第一個顏色
 * @param {number} r2, g2, b2 - 第二個顏色
 * @param {number} tolerance - 容差 (0-100)
 * @returns {boolean}
 */
ColorUtils.isColorMatch(r1, g1, b1, r2, g2, b2, tolerance);
```

### ImageProcessor

```javascript
/**
 * 加載圖像
 * @param {HTMLImageElement} img - 圖像元素
 * @param {number} maxWidth - 最大寬度（默認 350）
 * @param {number} maxHeight - 最大高度（默認 350）
 * @returns {Object} {width, height}
 */
imageProcessor.loadImage(img, maxWidth, maxHeight);

/**
 * 獲取像素顏色
 * @param {number} x - X 座標
 * @param {number} y - Y 座標
 * @returns {Object|null} {r, g, b} 或 null
 */
imageProcessor.getPixelColor(x, y);

/**
 * 導出圖像
 * @param {string} format - 格式（默認 'image/png'）
 * @param {number} quality - 質量 (0-1)
 * @returns {string} Data URL
 */
imageProcessor.toDataURL(format, quality);
```

### BackgroundRemover

```javascript
/**
 * 移除背景
 * @param {number} clickX - 點擊 X 座標
 * @param {number} clickY - 點擊 Y 座標
 * @param {Object} options - 選項
 * @param {number} options.tolerance - 容差 (0-100)
 * @param {number} options.smoothing - 平滑迭代次數 (0-10)
 * @param {number} options.feather - 羽化半徑 (0-5)
 * @returns {ImageData|null} 處理後的圖像數據
 */
backgroundRemover.removeBackground(clickX, clickY, options);

/**
 * 替換顏色
 * @param {ImageData} imageData - 圖像數據
 * @param {Object} fromColor - 來源顏色 {r, g, b}
 * @param {Object} toColor - 目標顏色 {r, g, b}
 * @param {number} tolerance - 容差
 * @returns {ImageData} 處理後的圖像數據
 */
backgroundRemover.replaceColor(imageData, fromColor, toColor, tolerance);
```

## 性能優化

### 1. 圖像尺寸限制

```javascript
// 自動縮放大圖像
const maxWidth = 350;
const maxHeight = 350;

if (width > maxWidth || height > maxHeight) {
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  width *= ratio;
  height *= ratio;
}
```

**原因**: 減少像素處理量，提升響應速度

### 2. Typed Arrays

```javascript
// ✅ 使用 Typed Arrays（更快）
const mask = new Uint8Array(width * height);
const imageData = new Uint8ClampedArray(width * height * 4);

// ❌ 普通數組（較慢）
const mask = new Array(width * height);
```

**優勢**:

- 固定類型，無需類型檢查
- 連續內存，緩存友好
- 比普通數組快 2-3 倍

### 3. 避免重複計算

```javascript
// ✅ 預計算索引
const index = (y * width + x) * 4;

// ❌ 重複計算
data[(y * width + x) * 4] = r;
data[(y * width + x) * 4 + 1] = g;
data[(y * width + x) * 4 + 2] = b;
data[(y * width + x) * 4 + 3] = a;
```

### 4. 邊緣羽化優化

```javascript
// 只在需要時計算邊緣距離
if (feather > 0 && mask[index]) {
  const distance = getEdgeDistance(...)
  alpha = max(0, 1 - distance / feather)
}
```

## 擴展指南

### 添加新的處理算法

1. **在 BackgroundRemover 中添加方法**

```javascript
class BackgroundRemover {
  // 現有方法...

  /**
   * 新的處理方法
   * @param {ImageData} imageData - 圖像數據
   * @param {Object} options - 選項
   * @returns {ImageData} 處理結果
   */
  newProcessingMethod(imageData, options) {
    // 實現算法
    return processedData;
  }
}
```

2. **在 UIController 中添加控件**

```javascript
// HTML
<button id="newFeatureBtn">新功能</button>;

// JavaScript
this.elements.newFeatureBtn = document.getElementById("newFeatureBtn");
this.elements.newFeatureBtn.addEventListener("click", () => {
  this.handleNewFeature();
});
```

3. **更新文檔**

- 在 README.md 中添加功能說明
- 更新此文檔的 API 參考部分

### 添加新的工具類

1. **創建新文件**

```javascript
// js/utils/NewUtils.js

/**
 * 新工具類
 * @class NewUtils
 */
class NewUtils {
  /**
   * 工具方法
   */
  static utilityMethod() {
    // 實現
  }
}

export default NewUtils;
```

2. **導入並使用**

```javascript
// 在需要的文件中
import NewUtils from "./utils/NewUtils.js";

// 使用
NewUtils.utilityMethod();
```

## 調試技巧

### 1. 可視化遮罩

```javascript
// 將遮罩轉換為可視圖像
function visualizeMask(mask, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < mask.length; i++) {
    const value = mask[i] * 255;
    imageData.data[i * 4] = value;
    imageData.data[i * 4 + 1] = value;
    imageData.data[i * 4 + 2] = value;
    imageData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  document.body.appendChild(canvas);
}
```

### 2. 性能分析

```javascript
console.time("removeBackground");
const result = backgroundRemover.removeBackground(x, y, options);
console.timeEnd("removeBackground");
```

### 3. 記錄像素值

```javascript
console.log("Clicked pixel:", {
  x,
  y,
  r: data[index],
  g: data[index + 1],
  b: data[index + 2],
  a: data[index + 3],
});
```

## 常見問題

### Q: 為什麼使用 4-連通而不是 8-連通？

A: 4-連通更保守，避免通過對角線「洩漏」到前景區域。如果需要更激進的填充，可以改用 8-連通。

### Q: 容差值如何選擇？

A:

- **純色背景**: 10-30
- **漸變背景**: 30-50
- **複雜背景**: 50-70

### Q: 如何處理大圖像？

A: 當前實現會自動縮放到 350×350。如需處理更大圖像：

1. 增加 `maxWidth` 和 `maxHeight`
2. 考慮使用 Web Workers 進行後台處理
3. 添加進度指示器

## 其他資源

- [Canvas API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ImageData 參考](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
- [洪水填充算法](https://en.wikipedia.org/wiki/Flood_fill)
- [顏色理論](https://en.wikipedia.org/wiki/Color_difference)

---

**更新日期**: 2026-02-25  
**版本**: 1.0.0
