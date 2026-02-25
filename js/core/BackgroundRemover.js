import ColorUtils from "../utils/ColorUtils.js";

/**
 * 背景去除器類
 * @description 負責背景去除、顏色替換和圖像處理的核心邏輯
 * @class BackgroundRemover
 */
class BackgroundRemover {
  /**
   * 構造函數
   * @param {ImageProcessor} imageProcessor - 圖像處理器實例
   */
  constructor(imageProcessor) {
    this.imageProcessor = imageProcessor;
  }

  /**
   * 執行背景去除
   * @param {number} clickX - 點擊的 X 座標
   * @param {number} clickY - 點擊的 Y 座標
   * @param {Object} options - 處理選項
   * @param {number} options.tolerance - 容差值 (0-100)
   * @param {number} options.smoothing - 平滑迭代次數
   * @param {number} options.feather - 羽化半徑
   * @returns {ImageData|null} 處理後的圖像數據
   */
  removeBackground(clickX, clickY, options) {
    const { tolerance, smoothing, feather } = options;

    // 獲取原始圖像數據
    const sourceData = this.imageProcessor.getImageData();
    if (!sourceData) {
      return null;
    }

    // 獲取點擊位置的目標顏色
    const targetColor = this.imageProcessor.getPixelColor(clickX, clickY);
    if (!targetColor) {
      return null;
    }

    const { width, height } = this.imageProcessor.getDimensions();

    // 創建背景遮罩
    const mask = this.createBackgroundMask(
      sourceData.data,
      width,
      height,
      clickX,
      clickY,
      targetColor,
      tolerance,
    );

    // 應用平滑處理
    if (smoothing > 0) {
      this.applySmoothingToMask(mask, width, height, smoothing);
    }

    // 創建結果圖像並應用遮罩
    const resultData = this.applyMaskToImage(
      sourceData.data,
      mask,
      width,
      height,
      feather,
    );

    // 創建並返回結果圖像數據
    const resultImageData = this.imageProcessor.createImageData();
    resultImageData.data.set(resultData);

    return resultImageData;
  }

  /**
   * 使用洪水填充算法創建背景遮罩
   * @description 從點擊位置開始，標記所有相似顏色的像素
   * @param {Uint8ClampedArray} data - 圖像數據數組
   * @param {number} width - 圖像寬度
   * @param {number} height - 圖像高度
   * @param {number} startX - 起始 X 座標
   * @param {number} startY - 起始 Y 座標
   * @param {Object} targetColor - 目標顏色 {r, g, b}
   * @param {number} tolerance - 容差值
   * @returns {Uint8Array} 遮罩數組 (1 表示背景，0 表示前景)
   */
  createBackgroundMask(
    data,
    width,
    height,
    startX,
    startY,
    targetColor,
    tolerance,
  ) {
    // 初始化遮罩和訪問記錄
    const mask = new Uint8Array(width * height);
    const visited = new Set();
    const stack = [[startX, startY]];

    // 洪水填充算法
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      // 檢查邊界和是否已訪問
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      // 獲取當前像素顏色
      const pixelIndex = (y * width + x) * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];

      // 檢查顏色是否匹配
      if (
        ColorUtils.isColorMatch(
          r,
          g,
          b,
          targetColor.r,
          targetColor.g,
          targetColor.b,
          tolerance,
        )
      ) {
        visited.add(key);
        mask[y * width + x] = 1;

        // 將相鄰像素加入堆疊（4-連通）
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    return mask;
  }

  /**
   * 對遮罩應用平滑處理
   * @description 使用 3x3 平均濾波器多次迭代來平滑遮罩邊緣
   * @param {Uint8Array} mask - 遮罩數組
   * @param {number} width - 圖像寬度
   * @param {number} height - 圖像高度
   * @param {number} iterations - 迭代次數
   */
  applySmoothingToMask(mask, width, height, iterations) {
    for (let iter = 0; iter < iterations; iter++) {
      const newMask = new Uint8Array(mask);

      // 對內部像素應用 3x3 核心
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const index = y * width + x;
          let sum = 0;
          let count = 0;

          // 計算 3x3 鄰域的平均值
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ni = (y + dy) * width + (x + dx);
              sum += mask[ni];
              count++;
            }
          }

          // 如果平均值超過 0.5，設為背景
          newMask[index] = sum / count > 0.5 ? 1 : 0;
        }
      }

      mask.set(newMask);
    }
  }

  /**
   * 計算像素到遮罩邊緣的距離
   * @description 用於羽化效果，計算最近的非遮罩像素距離
   * @param {Uint8Array} mask - 遮罩數組
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} width - 圖像寬度
   * @param {number} height - 圖像高度
   * @param {number} maxDistance - 最大搜索距離
   * @returns {number} 到邊緣的距離
   */
  getEdgeDistance(mask, x, y, width, height, maxDistance) {
    const maskIndex = y * width + x;

    // 如果不在遮罩內，返回最大距離
    if (!mask[maskIndex]) {
      return maxDistance;
    }

    let minDistance = maxDistance;

    // 在指定半徑內搜索非遮罩像素
    for (let dy = -maxDistance; dy <= maxDistance; dy++) {
      for (let dx = -maxDistance; dx <= maxDistance; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        // 檢查邊界
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIndex = ny * width + nx;

          // 如果找到非遮罩像素，計算距離
          if (!mask[nIndex]) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            minDistance = Math.min(minDistance, distance);
          }
        }
      }
    }

    return minDistance;
  }

  /**
   * 應用遮罩到圖像並處理透明度
   * @param {Uint8ClampedArray} sourceData - 原始圖像數據
   * @param {Uint8Array} mask - 背景遮罩
   * @param {number} width - 圖像寬度
   * @param {number} height - 圖像高度
   * @param {number} feather - 羽化半徑
   * @returns {Uint8ClampedArray} 處理後的數據
   */
  applyMaskToImage(sourceData, mask, width, height, feather) {
    const resultData = new Uint8ClampedArray(sourceData.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dataIndex = (y * width + x) * 4;
        const maskIndex = y * width + x;

        // 複製 RGB 值
        resultData[dataIndex] = sourceData[dataIndex]; // R
        resultData[dataIndex + 1] = sourceData[dataIndex + 1]; // G
        resultData[dataIndex + 2] = sourceData[dataIndex + 2]; // B

        // 處理 Alpha 通道
        if (mask[maskIndex]) {
          // 如果是背景像素，應用羽化
          if (feather > 0) {
            const edgeDistance = this.getEdgeDistance(
              mask,
              x,
              y,
              width,
              height,
              feather,
            );
            const alpha = Math.max(0, 1 - edgeDistance / feather);
            resultData[dataIndex + 3] = Math.floor(
              sourceData[dataIndex + 3] * alpha,
            );
          } else {
            // 完全透明
            resultData[dataIndex + 3] = 0;
          }
        } else {
          // 保留原始 Alpha 值
          resultData[dataIndex + 3] = sourceData[dataIndex + 3];
        }
      }
    }

    return resultData;
  }

  /**
   * 對圖像應用顏色替換
   * @param {ImageData} imageData - 要處理的圖像數據
   * @param {Object} fromColor - 來源顏色 {r, g, b}
   * @param {Object} toColor - 目標顏色 {r, g, b}
   * @param {number} tolerance - 容差值
   * @returns {ImageData} 處理後的圖像數據
   */
  replaceColor(imageData, fromColor, toColor, tolerance) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // 跳過透明像素
      if (data[i + 3] === 0) {
        continue;
      }

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 檢查顏色是否匹配
      if (
        ColorUtils.isColorMatch(
          r,
          g,
          b,
          fromColor.r,
          fromColor.g,
          fromColor.b,
          tolerance,
        )
      ) {
        // 替換為新顏色
        data[i] = toColor.r;
        data[i + 1] = toColor.g;
        data[i + 2] = toColor.b;
      }
    }

    return imageData;
  }
}

// 導出類以供其他模組使用
export default BackgroundRemover;
