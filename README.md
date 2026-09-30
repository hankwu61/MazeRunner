# Maze Runner (3D Arcade Edition)

> 經典街機 · THREE.JS 沙丘迷宮重製版

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.180.0-black.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Maze Runner** 是一款基於 **Three.js** 打造的現代 3D 街機迷宮遊戲。將經典吃豆人（Pac-Man）的追逐玩法與荒漠遺跡風格融合，結合 3D 骨骼動畫、隨機生成的程序化迷宮、智慧幽靈 AI 以及即時合成音效，打造身歷其境的流暢街機體驗。

---

## 🎮 核心特色

- **立體沙丘與 3D 骨骼動畫**
  - 採用 Three.js 正交投影（Orthographic Camera）與自定義荒漠場景渲染。
  - 支援 glTF 角色模型載入（`SkeletonUtils` 複製骨骼動畫、`AnimationMixer` 平滑切換靜止與奔跑動作）。
- **程序化隨機迷宮生成**
  - 內建 4 種風格的迷宮演算法（曲折沙徑、縱橫古道、沙丘廣場、交錯迴廊）。
  - 保證 100% 道路全連通，並利用廣度優先搜尋（BFS）確保敵我出生點具備足夠安全距離。
  - 四大象限隨機投放能量補給箱。
- **經典幽靈行為 AI**
  - 4 隻特色敵方單位（紅/紫/青/橘），各自擁有獨立追蹤演算法：直接追逐、前置攔截、隨機徘徊、近距回防。
  - 取得能量箱後觸發「獵人模式」，敵方全員進入逃避藍化與閃爍狀態，可進行連續反擊連擊得分（200 / 400 / 800 / 1600 分）。
- **全平台靈活操作**
  - **鍵盤控制**：方向鍵 (`↑` `↓` `←` `→`) 或 `WASD`，`SPACE` 暫停/繼續，`Enter` 開始。
  - **觸控支援**：虛擬十字鍵與螢幕滑動手勢（Swipe）。
- **零依賴輕量架構**
  - 純原生 ES Modules 實現遊戲邏輯與狀態機。
  - Web Audio API 即時振盪器音效（無須額外音檔）。
  - LocalStorage 自動記錄並保存歷史最高分數。
  - 內建 Model Context 協議工具（`get_game_status`），便於 AI 代理程式讀取遊戲即時數據。

---

## 🕹️ 遊戲操作與規則

### 操作方式

| 操作 | 鍵盤 | 觸控 / 滑鼠 |
| :--- | :--- | :--- |
| **移動角色** | `W` `A` `S` `D` 或 `↑` `←` `↓` `→` | 點擊虛擬方向鍵 / 螢幕滑動手勢 |
| **暫停 / 繼續** | `Space` 空白鍵 | 點擊側邊欄「暫停」按鈕 |
| **開始 / 重新** | `Enter` 鍵 | 點擊畫面中央或側邊欄按鈕 |
| **開關音效** | — | 點擊頂部「音效 開/關」按鈕 |

### 計分與機制

- **一般豆子**：`+10 分`，吃完場上所有豆子即可通關晉級下一關。
- **能量補給箱**：`+50 分`，進入 7 秒獵人模式，幽靈變為逃跑狀態。
- **消滅幽靈**：獵人模式下碰撞幽靈可得分，連續擊殺依序獲得 `200`、`400`、`800`、`1600` 分。
- **初始生命**：共有 3 條生命；失去生命時保留當前迷宮與豆子進度，並提供 2 秒無敵保護時間。

---

## 📁 專案目錄結構

```text
PACMAN/
├── 3dlib/                     # 3D 原始模型資源
│   ├── ashe-animated.glb      # 玩家獵人 3D 動畫模型
│   └── red-melee-animated.glb # 敵方單位 3D 動畫模型
├── dist/                      # 前端靜態發行資源
│   ├── index.html             # 遊戲主頁面
│   ├── style.css              # 街機風格樣式（Glassmorphism、響應式佈局）
│   ├── game.js                # 遊戲主流程、WebGL 渲染與事件綁定
│   ├── engine.js              # 核心遊戲狀態機、碰撞偵測與 AI 邏輯
│   ├── maze.js                # 程序化迷宮生成器與連通度計算
│   ├── desert.js              # 3D 荒漠場景、沙丘幾何與地面生成
│   ├── characters.js          # 模型載入、材質配置與動作更新
│   ├── models/                # 運行時模型
│   └── vendor/                # Three.js 及其載入器工具
├── test/
│   └── game.test.mjs          # Node.js 原生測試（迷宮驗證、遊戲規則、AI 行為）
├── server.mjs                 # 輕量級原生靜態檔案 HTTP 伺服器
├── package.json               # 專案設定與 NPM 腳本
└── README.md                  # 專案說明文件
```

---

## 🚀 快速上手

### 1. 環境需求

- [Node.js](https://nodejs.org/) **18.0.0** 或以上版本
- 支援 WebGL 2 的現代瀏覽器（Chrome, Edge, Firefox, Safari 等）

### 2. 安裝步驟

複製專案並安裝依賴（主要為 `three`）：

```bash
npm install
```

### 3. 啟動本地伺服器

執行專案自帶的靜態伺服器：

```bash
npm run dev
```

啟動後，使用瀏覽器打開：
👉 **http://127.0.0.1:5173**

---

## 🧪 自動化測試

專案使用 Node.js 原生測試模組（`node:test`），涵蓋迷宮連通性、生成樣式、角色移動與碰撞、分數與關卡循環等邏輯驗證：

```bash
npm test
```

測試重點包含：
- 連續生成 400 次隨機迷宮皆 100% 道路全通且敵我生成點安全距離合規。
- 角色網格移動與轉向判定。
- 獵人模式吃幽靈送回出生點與重生邏輯。
- 通關後關卡遞增與新迷宮佈局重建。

---

## 🛠️ 技術棧

- **核心技術**：JavaScript (ES Modules)、HTML5、CSS3
- **3D 引擎**：[Three.js (v0.180.0)](https://threejs.org/)
- **模型格式**：glTF / GLB (骨骼動畫、標準 PBR 材質)
- **測試框架**：Node.js Built-in Test Runner (`node:test`, `node:assert/strict`)
- **服務端**：Node.js 原生 `node:http`

---

## 📄 授權條款

本專案採 MIT License 授權。
