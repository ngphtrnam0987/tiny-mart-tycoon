# 🏪 Tiny Mart Tycoon

An adorable, cozy 2D top-down shop management and idle tycoon simulator built with **React**, **TypeScript (strict)**, **Vite**, **Tailwind CSS v4**, **HTML5 Canvas 2D**, and **Zustand**.

Start with a humble $200 startup fund, stock shelves with treats and drinks, serve eager neighborhood customers, hire friendly staff to automate operations, and scale your mini-mart into an autonomous supermarket empire!

---

## ✨ Features

- **Cute 2D Top-Down Canvas World**:
  - Custom 60 FPS HTML5 Canvas engine with depth layering and cozy pastel graphics.
  - Interactive mart shelves with dynamic visual stock meters and pulsing out-of-stock badges.
  - Animated customer sprites with distinct outfits, walking bob animations, and expressive thought bubbles.
  - Clickable register counter with electric speed-boost effects and floating financial text particles.
- **Deep Customer AI**:
  - Full deterministic state machine: `ENTERING` ➔ `SHOPPING` ➔ `QUEUING` ➔ `PAYING` ➔ `LEAVING`.
  - Realistic waypoint movement, shopping list desires, shelf interaction, checkout queueing, and dissatisfaction handling.
- **Three-Tier Staff Automation**:
  - **Alex (Cashier)**: Automates barcode scanning at the register. Each upgrade boosts checkout throughput.
  - **Sam (Stocker)**: Inspects shelf inventories and automatically restocks low shelves (<40%) using store cash.
  - **Taylor (Manager)**: Boosts morale, raises speed for all staff by +25%, and drives higher customer foot traffic.
- **Facility & Business Upgrades**:
  - 7 scalable upgrade paths: Shelf Capacity, Laser Barcode Scanner, Neon Store Signboard, Heavy Duty Trolleys, Staff Lounge, Wholesale Supplier Deals, and Building Expansion.
- **Sound Financial & Offline Engine**:
  - Mathematically sound financial model distinguishing **Gross Revenue**, **Cost of Goods Sold (COGS)**, **Payroll Salaries**, and **Net Profit**.
  - Up to 4 hours of offline idle progress simulation with a comprehensive "Welcome Back, Boss!" summary modal.
  - Built-in protection against NaN, Infinity, negative funds, and data corruption.
- **Procedural Web Audio API Sound & Music**:
  - 100% royalty-free procedural audio synthesizer: cash register cha-chings, restock pops, level-up fanfares, and an optional cozy 8-bar lofi chiptune background music loop.
- **Robust Persistence & Versioning**:
  - Schema v1 with automated background saving, exportable/importable base64 save codes, and a safe reset modal.
- **Extensive Test Coverage**:
  - 30 unit tests using Vitest covering economy formulas, customer AI states, staff automation, offline progress, and save migration.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Vite 8** | Next-generation frontend tooling and rapid HMR build |
| **React 19** | Component-based UI for management HUD and control panels |
| **TypeScript (Strict)** | Strict type checking with `verbatimModuleSyntax` |
| **Tailwind CSS v4** | Modern utility-first styling with `@tailwindcss/vite` |
| **Zustand 5** | Lightweight state management decoupling game simulation from React renders |
| **HTML5 Canvas 2D** | High-performance 2D world renderer with custom pixel-art stylings |
| **Lucide Icons** | Clean iconography for retail operations and panels |
| **Web Audio API** | Zero-dependency procedural sound effects and cozy background melodies |
| **Vitest 5** | High-speed unit testing suite |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended, tested on Node v26)
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tiny-mart-tycoon.git

# Navigate into the project folder
cd tiny-mart-tycoon

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Running Unit Tests

```bash
# Run all Vitest unit tests
npm run test
```

### Running Linter

```bash
# Run oxlint for code quality
npm run lint
```

### Production Build

```bash
# Compile TypeScript and bundle production assets
npm run build
```

Production output is compiled into the `dist/` directory.

---

## 🕹️ How to Play

1. **Initial Setup**: You begin Day 1 with **$200**. Open the **Products** tab or click the **Snacks** shelf on the canvas map to purchase initial stock.
2. **First Sale**: Watch customers enter through the sliding doors, grab snacks, and queue up at the checkout register.
3. **Speed Boost**: Click the checkout register on the map to manually accelerate scanning.
4. **Hiring Staff**:
   - Hire **Alex (Cashier)** to automate transactions.
   - Hire **Sam (Stocker)** so shelves restock themselves automatically while you manage higher-level strategy.
5. **Reinvesting Profits**:
   - Upgrade shelf capacities so you don't run out during rush hours.
   - Invest in wholesale contracts to increase profit margins.
   - Unlock premium aisles: **Fresh Fruits**, **Warm Bakery**, and **Gadgets & Tech**.
6. **Milestones & Goals**: Check the **Goals** tab to claim bonus cash and store XP upon completing retail milestones.

---

## ☁️ Deployment on Cloudflare Pages

This project builds pure static assets compatible with Cloudflare Pages:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment**: Node.js 18+

### Connecting via GitHub Git Integration (Recommended):
1. In the Cloudflare dashboard, go to **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Select repository `tiny-mart-tycoon` and branch `main`.
3. Set Framework preset to **Vite** (Build command: `npm run build`, Build output directory: `dist`).
4. Click **Save and Deploy**. Each push to `main` will automatically trigger a new deployment.

---

## 🗺️ Roadmap & Future Expansions

- [ ] **Multiple Store Branches**: Open specialized locations (Bakery Café, Electronics Emporium).
- [ ] **Decorations & Customization**: Place floor plants, neon signs, and customized floor tiles.
- [ ] **Dynamic Customer Types**: VIP customers with large shopping carts and express-lane shoppers.
- [ ] **Supply Chain Contracts**: Daily special promotions and fluctuating wholesale prices.
- [ ] **Prestige System**: Sell the mart franchise for Golden Registers and permanent multiplier badges.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
