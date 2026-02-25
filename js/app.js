import ImageProcessor from "./core/ImageProcessor.js";
import BackgroundRemover from "./core/BackgroundRemover.js";
import ColorUtils from "./utils/ColorUtils.js";

/**
 * UI 控制器類
 * @description 管理用戶界面的事件處理和狀態更新
 * @class UIController
 */
class UIController {
  /**
   * 構造函數
   * @description 初始化 UI 控制器並設置所有必要的引用
   */
  constructor() {
    // DOM 元素引用
    this.elements = this.initializeElements();

    // 創建圖像處理器實例
    this.originalProcessor = new ImageProcessor(this.elements.originalCanvas);
    this.resultProcessor = new ImageProcessor(this.elements.resultCanvas);

    // 創建背景去除器實例
    this.backgroundRemover = new BackgroundRemover(this.originalProcessor);

    // 綁定事件處理器
    this.bindEvents();

    // 初始化 UI 狀態
    this.updateButtonStates();
  }

  /**
   * 初始化 DOM 元素引用
   * @returns {Object} 包含所有必要 DOM 元素的對象
   * @private
   */
  initializeElements() {
    return {
      fileInput: document.getElementById("fileInput"),
      originalCanvas: document.getElementById("originalCanvas"),
      resultCanvas: document.getElementById("resultCanvas"),

      // 滑桿控件
      toleranceSlider: document.getElementById("tolerance"),
      toleranceValue: document.getElementById("toleranceValue"),
      smoothingSlider: document.getElementById("smoothing"),
      smoothingValue: document.getElementById("smoothingValue"),
      featherSlider: document.getElementById("feather"),
      featherValue: document.getElementById("featherValue"),

      // 顏色替換控件
      replaceColorCheckbox: document.getElementById("replaceColor"),
      fromColorPicker: document.getElementById("fromColor"),
      toColorPicker: document.getElementById("toColor"),
      colorToleranceSlider: document.getElementById("colorTolerance"),
      colorToleranceValue: document.getElementById("colorToleranceValue"),

      // 按鈕
      resetBtn: document.getElementById("resetBtn"),
      downloadBtn: document.getElementById("downloadBtn"),
    };
  }

  /**
   * 綁定所有事件處理器
   * @private
   */
  bindEvents() {
    // 文件上傳事件
    this.elements.fileInput.addEventListener("change", (e) =>
      this.handleFileUpload(e),
    );

    // 滑桿值變化事件
    this.elements.toleranceSlider.addEventListener("input", () => {
      this.updateSliderValue("tolerance");
    });

    this.elements.smoothingSlider.addEventListener("input", () => {
      this.updateSliderValue("smoothing");
    });

    this.elements.featherSlider.addEventListener("input", () => {
      this.updateSliderValue("feather");
    });

    this.elements.colorToleranceSlider.addEventListener("input", () => {
      this.updateSliderValue("colorTolerance");
    });

    // 畫布點擊事件
    this.elements.originalCanvas.addEventListener("click", (e) => {
      this.handleCanvasClick(e);
    });

    // 按鈕點擊事件
    this.elements.resetBtn.addEventListener("click", () => this.handleReset());
    this.elements.downloadBtn.addEventListener("click", () =>
      this.handleDownload(),
    );
  }

  /**
   * 處理文件上傳
   * @param {Event} e - 文件輸入變化事件
   * @private
   */
  handleFileUpload(e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // 驗證文件類型
    if (!file.type.startsWith("image/")) {
      alert("請選擇有效的圖像文件！");
      return;
    }

    // 讀取文件
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        this.loadImage(img);
      };

      img.onerror = () => {
        alert("圖像加載失敗，請嘗試其他文件。");
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      alert("文件讀取失敗，請重試。");
    };

    reader.readAsDataURL(file);
  }

  /**
   * 加載圖像到畫布
   * @param {HTMLImageElement} img - 要加載的圖像元素
   * @private
   */
  loadImage(img) {
    // 加載到原始畫布
    const dimensions = this.originalProcessor.loadImage(img);

    // 同步結果畫布的尺寸
    this.elements.resultCanvas.width = dimensions.width;
    this.elements.resultCanvas.height = dimensions.height;

    // 複製到結果畫布
    const resultCtx = this.elements.resultCanvas.getContext("2d");
    resultCtx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    // 更新 UI 狀態
    this.updateButtonStates();
  }

  /**
   * 處理畫布點擊事件
   * @description 計算點擊位置並執行背景去除
   * @param {MouseEvent} e - 滑鼠點擊事件
   * @private
   */
  handleCanvasClick(e) {
    if (!this.originalProcessor.hasImage()) {
      return;
    }

    // 計算畫布座標
    const rect = this.elements.originalCanvas.getBoundingClientRect();
    const x = Math.floor(
      ((e.clientX - rect.left) * this.elements.originalCanvas.width) /
        rect.width,
    );
    const y = Math.floor(
      ((e.clientY - rect.top) * this.elements.originalCanvas.height) /
        rect.height,
    );

    // 執行背景去除
    this.performBackgroundRemoval(x, y);
  }

  /**
   * 執行背景去除操作
   * @param {number} x - 點擊的 X 座標
   * @param {number} y - 點擊的 Y 座標
   * @private
   */
  performBackgroundRemoval(x, y) {
    // 獲取處理選項
    const options = {
      tolerance: parseInt(this.elements.toleranceSlider.value),
      smoothing: parseInt(this.elements.smoothingSlider.value),
      feather: parseInt(this.elements.featherSlider.value),
    };

    // 執行背景去除
    const resultImageData = this.backgroundRemover.removeBackground(
      x,
      y,
      options,
    );

    if (!resultImageData) {
      alert("處理失敗，請重試。");
      return;
    }

    // 應用顏色替換（如果啟用）
    if (this.elements.replaceColorCheckbox.checked) {
      this.applyColorReplacement(resultImageData);
    }

    // 繪製結果
    const resultCtx = this.elements.resultCanvas.getContext("2d");
    resultCtx.putImageData(resultImageData, 0, 0);
  }

  /**
   * 應用顏色替換
   * @param {ImageData} imageData - 要處理的圖像數據
   * @private
   */
  applyColorReplacement(imageData) {
    const fromColor = ColorUtils.hexToRgb(this.elements.fromColorPicker.value);
    const toColor = ColorUtils.hexToRgb(this.elements.toColorPicker.value);
    const tolerance = parseInt(this.elements.colorToleranceSlider.value);

    if (!fromColor || !toColor) {
      console.error("顏色格式無效");
      return;
    }

    this.backgroundRemover.replaceColor(
      imageData,
      fromColor,
      toColor,
      tolerance,
    );
  }

  /**
   * 處理重置按鈕點擊
   * @private
   */
  handleReset() {
    // 重置原始畫布
    const resetSuccess = this.originalProcessor.reset();

    if (!resetSuccess) {
      return;
    }

    // 獲取原始圖像數據
    const imageData = this.originalProcessor.getImageData();

    // 應用顏色替換（如果啟用）
    if (this.elements.replaceColorCheckbox.checked && imageData) {
      this.applyColorReplacement(imageData);
    }

    // 繪製到結果畫布
    const resultCtx = this.elements.resultCanvas.getContext("2d");
    if (imageData) {
      resultCtx.putImageData(imageData, 0, 0);
    }
  }

  /**
   * 處理下載按鈕點擊
   * @private
   */
  handleDownload() {
    // 獲取結果畫布的 Data URL
    const dataURL = this.elements.resultCanvas.toDataURL("image/png");

    // 創建下載鏈接
    const link = document.createElement("a");
    link.download = `removed-background-${Date.now()}.png`;
    link.href = dataURL;

    // 觸發下載
    link.click();
  }

  /**
   * 更新滑桿顯示值
   * @param {string} sliderName - 滑桿名稱
   * @private
   */
  updateSliderValue(sliderName) {
    const slider = this.elements[`${sliderName}Slider`];
    const valueDisplay = this.elements[`${sliderName}Value`];

    if (slider && valueDisplay) {
      valueDisplay.textContent = slider.value;
    }
  }

  /**
   * 更新按鈕啟用/禁用狀態
   * @private
   */
  updateButtonStates() {
    const hasImage = this.originalProcessor.hasImage();

    this.elements.resetBtn.disabled = !hasImage;
    this.elements.downloadBtn.disabled = !hasImage;
  }
}

// 當 DOM 加載完成時初始化應用
document.addEventListener("DOMContentLoaded", () => {
  // 創建 UI 控制器實例
  new UIController();

  console.log("背景去除工具已初始化");
});

// 導出類以供測試使用
export default UIController;
