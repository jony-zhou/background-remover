/**
 * 圖像處理器類
 * @description 負責圖像的加載、縮放和基本處理操作
 * @class ImageProcessor
 */
class ImageProcessor {
  /**
   * 構造函數
   * @param {HTMLCanvasElement} canvas - 用於繪製的畫布元素
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.originalImageData = null;
    this.currentImage = null;
  }

  /**
   * 加載圖像到畫布
   * @param {HTMLImageElement} img - 要加載的圖像元素
   * @param {number} maxWidth - 最大寬度限制
   * @param {number} maxHeight - 最大高度限制
   * @returns {Object} 包含實際寬度和高度的對象
   */
  loadImage(img, maxWidth = 350, maxHeight = 350) {
    this.currentImage = img;

    // 計算縮放後的尺寸
    const dimensions = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight,
    );

    // 設置畫布尺寸
    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // 繪製圖像到畫布
    this.ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    // 保存原始圖像數據
    this.originalImageData = this.ctx.getImageData(
      0,
      0,
      dimensions.width,
      dimensions.height,
    );

    return dimensions;
  }

  /**
   * 計算適應容器的圖像尺寸
   * @description 保持圖像寬高比，確保不超過最大限制
   * @param {number} width - 原始寬度
   * @param {number} height - 原始高度
   * @param {number} maxWidth - 最大寬度
   * @param {number} maxHeight - 最大高度
   * @returns {Object} 包含計算後的寬度和高度
   */
  calculateDimensions(width, height, maxWidth, maxHeight) {
    let newWidth = width;
    let newHeight = height;

    // 如果圖像超過最大尺寸，按比例縮放
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      newWidth = Math.floor(width * ratio);
      newHeight = Math.floor(height * ratio);
    }

    return { width: newWidth, height: newHeight };
  }

  /**
   * 重置畫布為原始圖像
   * @returns {boolean} 成功返回 true，失敗返回 false
   */
  reset() {
    if (!this.currentImage || !this.canvas.width) {
      return false;
    }

    this.ctx.drawImage(
      this.currentImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );

    return true;
  }

  /**
   * 獲取指定位置的像素顏色
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @returns {Object|null} RGB 顏色對象 {r, g, b} 或 null
   */
  getPixelColor(x, y) {
    if (!this.originalImageData) {
      return null;
    }

    const { width } = this.canvas;
    const index = (y * width + x) * 4;
    const data = this.originalImageData.data;

    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };
  }

  /**
   * 獲取當前畫布的圖像數據
   * @returns {ImageData|null} 圖像數據或 null
   */
  getImageData() {
    if (!this.canvas.width || !this.canvas.height) {
      return null;
    }

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 將圖像數據繪製到畫布
   * @param {ImageData} imageData - 要繪製的圖像數據
   */
  putImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 創建新的空白圖像數據
   * @returns {ImageData} 新的圖像數據對象
   */
  createImageData() {
    return this.ctx.createImageData(this.canvas.width, this.canvas.height);
  }

  /**
   * 將畫布內容導出為 Data URL
   * @param {string} format - 圖像格式 (預設: 'image/png')
   * @param {number} quality - 圖像質量 (0-1，僅用於 jpeg)
   * @returns {string} Data URL 字符串
   */
  toDataURL(format = "image/png", quality = 1.0) {
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * 獲取畫布尺寸
   * @returns {Object} 包含寬度和高度的對象
   */
  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * 檢查是否已加載圖像
   * @returns {boolean} 已加載返回 true
   */
  hasImage() {
    return this.originalImageData !== null;
  }

  /**
   * 清空畫布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.originalImageData = null;
    this.currentImage = null;
  }
}

// 導出類以供其他模組使用
export default ImageProcessor;
