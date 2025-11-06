// === 新增響應式和選單狀態變數 ===
let isMobile = false; // 追蹤是否為行動裝置寬度
let menuOpen = false; // 追蹤行動選單是否展開 (行動模式下才有用)
let mobileMenuWidth; // 行動版選單展開時的寬度
let currentMenuX = 0; // 用於控制行動選單的動畫位置

const BREAKPOINT = 768; // 定義行動裝置和桌機的寬度臨界點
const HAMBURGER_SIZE = 40; // 漢堡圖示的尺寸

let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];

let menuItems = ["第一單元作品", "第一單元講義", "測驗系統", "返回首頁"];
let menuWidth, menuHeight, menuItemHeight;

let iframe;
let animating = false;
let hoverIndex = -1;  // 🔴 滑鼠移過的項目
let activeIndex = -1; // 🔴 點擊選取的項目
let showBackground = true;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id('p5-canvas');
  rectMode(CENTER);
  textAlign(LEFT, CENTER); // 設定文字水平靠左，垂直居中
  textSize(20);
  objs.push(new DynamicShape());

  menuHeight = height;
  menuItemHeight = menuHeight / menuItems.length;
  
  checkBreakpoint(); // 首次執行檢查
}

function draw() {
  background(255);

  // === 背景圖形 ===
  if (showBackground) {
    for (let i of objs) i.run();

    let speedFactor = map(mouseX, 0, width, 5, 40);
    if (frameCount % int(random([speedFactor, speedFactor + 10])) == 0) {
      let addNum = int(random(1, 10));
      for (let i = 0; i < addNum; i++) objs.push(new DynamicShape());
    }
    objs = objs.filter(o => !o.isDead);
  }

  // === 根據模式繪製選單或漢堡圖示 ===
  if (isMobile) {
    // 🔴 行動裝置模式
    drawMobileMenu(mobileMenuWidth); // 處理動畫和平移
    drawHamburger();               // 繪製漢堡圖示 (固定在右上角)
  } else {
    // 💻 桌面版模式
    drawMenu(menuWidth); // 繪製固定選單
  }
}

// === 響應式檢查和變數設定 ===
function checkBreakpoint() {
  if (width <= BREAKPOINT) {
    isMobile = true;
    mobileMenuWidth = width * 0.7; // 行動版選單展開時佔 70% 寬度
    menuWidth = 0; // 行動版預設隱藏選單，佔用寬度為 0
    // 根據選單是否打開，設定動畫的起始位置
    currentMenuX = menuOpen ? 0 : -mobileMenuWidth; 
  } else {
    isMobile = false;
    menuOpen = false; // 桌機版強制關閉行動選單狀態
    menuWidth = width / 7; // 桌機版固定寬度
    currentMenuX = 0; // 桌機版沒有動畫偏移
  }

  // 調整 iframe 的起始位置和尺寸
  let currentIframeX = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  let currentIframeW = width - currentIframeX;

  if (iframe) {
    iframe.position(currentIframeX, 0);
    iframe.size(currentIframeW, height);
  }
}

// === 繪製漢堡圖示 (行動版右上角) ===
function drawHamburger() {
  push();
  let x = width - HAMBURGER_SIZE / 2 - 15; // 靠近右上角
  let y = HAMBURGER_SIZE / 2 + 15;
  let lineLength = HAMBURGER_SIZE * 0.6;
  let lineWeight = 3;
  let spacing = HAMBURGER_SIZE * 0.2;

  translate(x, y);
  stroke(0);
  strokeWeight(lineWeight);
  noFill();
  circle(0, 0, HAMBURGER_SIZE); // 繪製外框 (可選)

  if (!menuOpen) {
    // 繪製漢堡圖示 (三條線)
    line(-lineLength / 2, -spacing, lineLength / 2, -spacing);
    line(-lineLength / 2, 0, lineLength / 2, 0);
    line(-lineLength / 2, spacing, lineLength / 2, spacing);
  } else {
    // 繪製叉叉圖示 (X)
    rotate(PI / 4);
    line(-lineLength / 2, 0, lineLength / 2, 0);
    rotate(PI / 2);
    line(-lineLength / 2, 0, lineLength / 2, 0);
  }

  pop();
}


// === 左側選單內容繪製 (通用函式 - **已修正文字位置**) ===
function drawMenu(currentWidth) {
  push();
  noStroke();
  fill(255, 255, 153, 200); // 鵝黃色 + 透明度
  rectMode(CORNER);
  rect(0, 0, currentWidth, menuHeight);

  // --- 選單項目繪製 ---
  textSize(22);
  menuItemHeight = menuHeight / menuItems.length;
  
  // 設置文字對齊方式，確保垂直置中
  textAlign(LEFT, CENTER); 

  for (let i = 0; i < menuItems.length; i++) {
    // 每個選單項目的 Y 座標頂點
    let itemTopY = i * menuItemHeight; 
    // 文字的 Y 座標是該項目的中點 (確保垂直居中)
    let textY = itemTopY + menuItemHeight / 2;

    // 🟥 顯示紅色條件：滑過或被點選
    if (i === hoverIndex || i === activeIndex) {
      fill('#ff0000');
    } else {
      fill('#000000');
    }

    // 保持水平左側 10px 的間距
    text(menuItems[i], 10, textY);
  }
  pop();
}

// === 行動選單滑入/滑出動畫 (使用 currentMenuX 實現平滑) ===
function drawMobileMenu(targetWidth) {
  // 1. 處理選單滑出/滑入動畫
  let targetX = menuOpen ? 0 : -targetWidth; // 目標 X 座標：展開為 0，收合為 -targetWidth
  
  // 使用 lerp 進行平滑移動，實現「平滑的動畫效果」
  currentMenuX = lerp(currentMenuX, targetX, 0.2); 

  // 2. 繪製選單
  push();
  translate(currentMenuX, 0); // 將整個選單圖層平移
  drawMenu(targetWidth); // 繪製選單內容
  pop();

  // 3. 調整 iframe 位置以配合選單 (如果有 iframe)
  if (iframe) {
    let iframeX = currentMenuX + targetWidth; // iframe 應該在選單右側
    iframe.position(iframeX, 0);
    iframe.size(width - iframeX, height);
  }
}


// === 滑鼠移動：偵測 hover (包含響應式邏輯) ===
function mouseMoved() {
  let currentActiveMenuWidth = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  
  // 檢查滑鼠是否在選單區域內 (考慮行動選單的 X 軸偏移)
  if (mouseX < currentActiveMenuWidth) {
    // 確保只在選單實際顯示的區域內才觸發 hover
    if ((isMobile && menuOpen && mouseX >= currentMenuX) || !isMobile) {
        hoverIndex = floor(mouseY / menuItemHeight);
    } else {
        hoverIndex = -1;
    }
  } else {
    hoverIndex = -1;
  }
}

// === 滑鼠點擊 (包含響應式邏輯) ===
function mousePressed() {
  // 1. 漢堡圖示點擊 (僅在行動模式下)
  if (isMobile) {
    // 檢查點擊是否在漢堡圖示的可點擊區域 (右上角)
    if (mouseX > width - HAMBURGER_SIZE - 15 && mouseY < HAMBURGER_SIZE + 15) {
      menuOpen = !menuOpen; // 切換選單狀態
      return; // 點擊到漢堡圖示後，不再檢查選單點擊
    }
  }

  // 2. 選單項目點擊
  let currentActiveMenuWidth = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  
  // 判斷是否在選單寬度範圍內
  if (mouseX < currentActiveMenuWidth && !animating) {
    // 確保在行動模式下，選單關閉時點擊左側是無效的
    if (isMobile && !menuOpen) return; 

    let clickedIndex = floor(mouseY / menuItemHeight);
    
    activeIndex = clickedIndex;
    showBackground = false; // 點選後隱藏背景

    if (clickedIndex === 0) {
      fadeIframeTo("https://ygao32958-cmd.github.io/20251014/");
    } else if (clickedIndex === 1) {
      fadeIframeTo("https://hackmd.io/@VrbvM8VNTM25jIpeWHaoww/B1OltOk3gx");
    } else if (clickedIndex === 2) {
      fadeIframeTo("https://ygao32958-cmd.github.io/2025-11-4-001/");
    } else if (clickedIndex === 3) {
      fadeIframeOut();
      showBackground = true; // 回首頁 → 顯示背景
      activeIndex = -1;
    }
    
    // 行動裝置點擊項目後，收合選單
    if(isMobile) {
        // 使用 setTimeout 稍微延遲收合，讓使用者感覺到點擊了
        setTimeout(() => {
            menuOpen = false;
        }, 100);
    }
  }
}

// === iframe 控制 (保持不變) ===
function fadeIframeTo(url) {
  animating = true;
  let currentIframeX = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  let currentIframeW = width - currentIframeX;

  if (!iframe) {
    iframe = createElement("iframe");
    iframe.position(currentIframeX, 0);
    iframe.size(currentIframeW, height);
    iframe.style("border", "none");
    iframe.style("opacity", "0");
    iframe.attribute("src", url);
    iframe.show();
    fadeIn(iframe, 500, () => (animating = false));
  } else {
    fadeOut(iframe, 500, () => {
      iframe.attribute("src", url);
      iframe.position(currentIframeX, 0); // 更新位置
      iframe.size(currentIframeW, height); // 更新大小
      fadeIn(iframe, 500, () => (animating = false));
    });
  }
}

function fadeIframeOut() {
  if (iframe) {
    animating = true;
    fadeOut(iframe, 500, () => {
      iframe.remove();
      iframe = null;
      animating = false;
    });
  }
}

function fadeIn(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "1");
  setTimeout(callback, duration);
}

function fadeOut(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "0");
  setTimeout(callback, duration);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  menuHeight = height;
  menuItemHeight = menuHeight / menuItems.length;
  
  checkBreakpoint(); // 重新計算所有尺寸和模式
}

// === easing function (保持不變) ===
function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

// === 動態圖形類別 (保持不變) ===
class DynamicShape {
  constructor() {
    this.x = random(0.25, 0.75) * width;
    this.y = random(0.25, 0.75) * height;
    this.reductionRatio = 1;
    this.shapeType = int(random(4));
    this.animationType = 0;
    this.maxActionPoints = int(random(2, 5));
    this.actionPoints = this.maxActionPoints;
    this.elapsedT = 0;
    this.size = 0;
    this.sizeMax = width * random(0.01, 0.05);
    this.fromSize = 0;
    this.init();
    this.isDead = false;
    this.clr = random(colors);
    this.changeShape = true;
    this.ang = int(random(2)) * PI * 0.25;
    this.lineSW = 0;
  }

  show() {
    push();
    translate(this.x, this.y);
    if (this.animationType == 1) scale(1, this.reductionRatio);
    if (this.animationType == 2) scale(this.reductionRatio, 1);
    fill(this.clr);
    stroke(this.clr);
    strokeWeight(this.size * 0.05);
    if (this.shapeType == 0) {
      noStroke();
      circle(0, 0, this.size);
    } else if (this.shapeType == 1) {
      noFill();
      circle(0, 0, this.size);
    } else if (this.shapeType == 2) {
      noStroke();
      rect(0, 0, this.size, this.size);
    } else if (this.shapeType == 3) {
      noFill();
      rect(0, 0, this.size * 0.9, this.size * 0.9);
    }
    pop();
    strokeWeight(this.lineSW);
    stroke(this.clr);
    line(this.x, this.y, this.fromX, this.fromY);
  }

  move() {
    let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
    if (0 < this.elapsedT && this.elapsedT < this.duration) {
      if (this.actionPoints == this.maxActionPoints) {
        this.size = lerp(0, this.sizeMax, n);
      } else if (this.actionPoints > 0) {
        if (this.animationType == 0) {
          this.size = lerp(this.fromSize, this.toSize, n);
        } else if (this.animationType == 1) {
          this.x = lerp(this.fromX, this.toX, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        } else if (this.animationType == 2) {
          this.y = lerp(this.fromY, this.toY, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        }
        this.reductionRatio = lerp(1, 0.3, sin(n * PI));
      } else {
        this.size = lerp(this.fromSize, 0, n);
      }
    }

    this.elapsedT++;
    if (this.elapsedT > this.duration) {
      this.actionPoints--;
      this.init();
    }
    if (this.actionPoints < 0) {
      this.isDead = true;
    }
  }

  run() {
    this.show();
    this.move();
  }

  init() {
    this.elapsedT = 0;
    this.fromSize = this.size;
    this.toSize = this.sizeMax * random(0.5, 1.5);
    this.fromX = this.x;
    this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
    this.fromY = this.y;
    this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
    this.animationType = int(random(3));
    this.duration = random(20, 50);
  }
}
































