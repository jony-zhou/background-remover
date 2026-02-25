/**
 * 顏色工具類
 * @description 提供顏色轉換和比較的工具方法
 * @class ColorUtils
 */
class ColorUtils {
  /**
   * 將十六進制顏色轉換為 RGB 對象
   * @param {string} hex - 十六進制顏色值 (例如: #FF5733)
   * @returns {Object|null} RGB 對象 {r, g, b} 或 null（如果格式無效）
   * @example
   * ColorUtils.hexToRgb('#FF5733') // 返回 {r: 255, g: 87, b: 51}
   */
  static hexToRgb(hex) {
    // 使用正則表達式匹配十六進制顏色格式
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
      return null;
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * 計算兩個顏色之間的感知差異
   * @description 使用加權歐氏距離，考慮人眼對綠色更敏感的特性
   * @param {number} r1 - 第一個顏色的紅色分量 (0-255)
   * @param {number} g1 - 第一個顏色的綠色分量 (0-255)
   * @param {number} b1 - 第一個顏色的藍色分量 (0-255)
   * @param {number} r2 - 第二個顏色的紅色分量 (0-255)
   * @param {number} g2 - 第二個顏色的綠色分量 (0-255)
   * @param {number} b2 - 第二個顏色的藍色分量 (0-255)
   * @returns {number} 顏色差異值，值越小表示顏色越相似
   */
  static calculateColorDistance(r1, g1, b1, r2, g2, b2) {
    // 使用加權歐氏距離公式
    // 權重基於人眼對不同顏色通道的敏感度
    // 綠色: 0.59, 紅色: 0.30, 藍色: 0.11
    return Math.sqrt(
      Math.pow(r1 - r2, 2) * 0.3 +
        Math.pow(g1 - g2, 2) * 0.59 +
        Math.pow(b1 - b2, 2) * 0.11,
    );
  }

  /**
   * 檢查顏色是否在容差範圍內匹配
   * @param {number} r1 - 第一個顏色的紅色分量
   * @param {number} g1 - 第一個顏色的綠色分量
   * @param {number} b1 - 第一個顏色的藍色分量
   * @param {number} r2 - 第二個顏色的紅色分量
   * @param {number} g2 - 第二個顏色的綠色分量
   * @param {number} b2 - 第二個顏色的藍色分量
   * @param {number} tolerance - 容差值 (0-100)
   * @returns {boolean} 如果顏色匹配返回 true，否則返回 false
   */
  static isColorMatch(r1, g1, b1, r2, g2, b2, tolerance) {
    const distance = this.calculateColorDistance(r1, g1, b1, r2, g2, b2);
    // 乘以 2.5 是為了將 0-100 的容差值映射到更合適的範圍
    return distance <= tolerance * 2.5;
  }

  /**
   * 驗證 RGB 值是否有效
   * @param {number} r - 紅色分量
   * @param {number} g - 綠色分量
   * @param {number} b - 藍色分量
   * @returns {boolean} 如果所有值都在 0-255 範圍內返回 true
   */
  static isValidRgb(r, g, b) {
    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
  }
}

// 導出類以供其他模組使用
export default ColorUtils;
