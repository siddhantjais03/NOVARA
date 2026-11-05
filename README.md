# NOVARA — Haute Couture & Modern Luxury E-Commerce Platform

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose%208-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-7c3aed?style=flat)](#)

A commercial-grade, full-stack **MERN** e-commerce web platform engineered for the luxury fashion house **NOVARA**. Built with **React 19**, **pure handcrafted vanilla CSS** (zero third-party CSS frameworks like Tailwind or Bootstrap), **Node.js**, **Express.js**, and **MongoDB Atlas** with Mongoose ODM.

---

## 1. Project Overview & Architecture

NOVARA delivers an end-to-end luxury shopping experience combining haute couture visual elegance with rigorous e-commerce engineering:

- **Bespoke Visual Identity**: Signature violet-indigo gradients (`#4f46e5`, `#7c3aed`, `#9333ea`), deep obsidian dark surfaces (`#0b0a16`, `#121026`), and clean light surfaces (`#fbfbfd`, `#ffffff`).
- **Pure CSS Craftsmanship**: Handcrafted vanilla CSS with CSS custom properties (variables), Flexbox, CSS Grid, and responsive fluid breakpoints without external UI libraries.
- **Dual-Theme Engine (Light & Dark Mode)**: System-wide theme switcher with instant switching and persistence across page reloads via `localStorage`.
- **Catalogue of 80 Unique Products**: Hand-curated catalogue across 6 customer-facing categories (Accessories, Footwear, Outerwear, Clothing, Bags, and Watches) with high-resolution imagery and hover transitions.
- **Estimated Order Tracking Map & Timeline**: Interactive Leaflet / OpenStreetMap delivery route visualization and genuine IST (`Asia/Kolkata`) milestone stepper.
- **Isolated Multi-Session RBAC**: Strictly decoupled Customer Patron sessions and House Director (Admin) sessions.
- **Dual-Layer Database Resilience**: Native cloud connection to **MongoDB Atlas** with automated, zero-downtime in-memory fallback for uninterrupted evaluation.

---

## 2. Technology Stack

### Frontend Architecture
- **Framework**: React.js 19
- **Build Tool**: Vite 8 (Hot Module Replacement, Rolldown bundler)
- **Routing**: React Router DOM v7
- **Styling**: Pure Vanilla CSS (CSS Variables, Flexbox, Grid, custom keyframes)
- **Interactive Mapping**: Leaflet (`^1.9.4`) & React-Leaflet with OpenStreetMap raster tiles
- **Iconography**: Lucide React
- **HTTP Client**: Axios with dedicated customer and administrator request/response interceptors

### Backend Architecture
- **Runtime**: Node.js (v18.0.0+ LTS)
- **Framework**: Express.js 4 (RESTful MVC Architecture)
- **Database & ODM**: MongoDB Atlas & Mongoose 8
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with 30-day validity
- **Password Security**: `bcryptjs` with 10 salt rounds
- **Environment & CORS**: `dotenv`, `cors`

---

## 3. Core Features

### A. Customer Storefront (18 Complete Views & Modals)
1. **Storefront Homepage (`/`)**: Hero carousel, animated announcement bar, trending silhouettes, curated category grid, best sellers, client reviews, and VIP newsletter signup.
2. **Shop Catalog (`/shop`)**: Faceted multi-filter sidebar (Category, Gender, Size, Price range, In-stock only), sorting (Price, Rating, Newest), and pagination.
3. **Product Details (`/product/:id`)**: Multi-angle gallery with magnifying zoom, color swatches, size selection, live inventory counter, and verified customer reviews.
4. **Dedicated Search (`/search`)**: Real-time debounced query search with category tags and instant matching.
5. **Interactive Shopping Bag (`/cart` & Drawer)**: Quantity stepper with stock-limit guards, coupon code input with server-side validation, and dynamic free shipping threshold meter.
6. **Curated Wishlist (`/wishlist` & Drawer)**: Private collection storage with instant one-click transfer to bag.
7. **Multi-Step Checkout (`/checkout`)**: 3-step structured order placement flow (Shipping Address, Delivery Method, Review).
8. **Simulated Payment Gateway (`/payment`)**: Dedicated payment view supporting Instant UPI (dynamic QR code), Credit/Debit Card (interactive card flip mockup), and Cash on Delivery.
9. **Order Confirmation & Receipt (`/order-confirmation/:id`)**: Printable receipt with breakdown of subtotal, tax, coupon discount, delivery fee, and payment status.
10. **Patron Order Archive (`/orders`)**: Historical booking list with delivery badges, Indian Standard Time (`Asia/Kolkata`) timestamps, and order tracking.
11. **Order Tracking View**: Interactive Leaflet / OpenStreetMap route rendering with BKC Mumbai dispatch origin, city-level destination markers, and progress timeline.
12. **Customer Authentication (`/login`, `/register`, & Modal)**: Encrypted credentials authentication with automatic guest bag/wishlist cloud synchronization upon sign-in.
13. **Patron Profile (`/profile` & `/account`)**: Address book management and membership tier overview.
14. **Brand & Heritage Pages**: About Us (`/about`), Concierge Contact (`/contact`), Client FAQ (`/faq`), Privacy Policy (`/privacy`), and Terms of Service (`/terms`).

### B. Administrative Director Portal (`/admin` — 10 Modules)
1. **Executive Overview Dashboard**: Total gross revenue, paid revenue, catalog count, registered patrons, order fulfillment cards, and quick actions.
2. **Product Silhouette Management**: Paginated catalog table, real-time name/category filter, Create Silhouette modal, Edit modal, and safe deletion.
3. **Category Management**: Category hierarchy with live product counts and Add/Remove Category modals.
4. **Order Management**: Comprehensive orders log, patron contact details, payment status, and order status dropdown (`Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
5. **Customer Management**: Registered patron directory with membership tiers, join dates, and account history.
6. **Inventory Management**: Stock monitor with low-stock alerts ($\le 5$ units) and instant one-click replenishment (`+10`, `+25` units).
7. **Coupon Management**: Discount code manager with percentage/flat discounts, minimum spend thresholds, and active status toggles.
8. **Review Moderation**: Patron review inspection with status moderation (`Approved`, `Pending`, `Flagged`, `Rejected`) and removal.
9. **Executive Analytics**: Average Order Value (AOV), conversion rates, category revenue share, and stock health index.
10. **Store Settings**: Configurations for store title, concierge email, free shipping threshold, and public announcement banners.

---

## 4. Project Directory Structure

```
d:\NOVARA\
├── backend\                     # Express.js REST API Server
│   ├── config\
│   │   ├── db.js                # MongoDB Atlas connection with timeout detection
│   │   ├── ensureAdmin.js       # Admin account bootstrap & synchronization
│   │   └── memoryStore.js       # In-memory repository fallback for 100% uptime
│   ├── controllers\
│   │   ├── adminController.js   # Analytics, store stats & customer directories
│   │   ├── authController.js    # Customer/Admin registration, login, profile updates
│   │   ├── categoryController.js# Category retrieval, creation & deletion
│   │   ├── couponController.js  # Server-side coupon validation & CRUD
│   │   ├── orderController.js   # Order creation, inventory decrement & status updates
│   │   ├── productController.js # Product CRUD, multi-criteria filtering & stock updates
│   │   ├── reviewController.js  # Customer review submission & moderation
│   │   └── settingsController.js# Store configurations & announcements
│   ├── data\
│   │   ├── catalogue80.js       # Complete 80-product catalogue dataset
│   │   └── products.js          # Synchronized catalogue export
│   ├── middleware\
│   │   ├── adminMiddleware.js   # Role-based admin access guard (403 Forbidden)
│   │   ├── authMiddleware.js    # JWT verification & customer context
│   │   └── errorMiddleware.js   # Centralized error handler & 404 router
│   ├── models\
│   │   ├── Coupon.js            # Coupon schema with validation methods
│   │   ├── Order.js             # Order schema with shipping, items & payment
│   │   ├── Product.js           # Product schema with stock, badges & images
│   │   ├── Review.js            # Review schema with status moderation
│   │   └── User.js              # User schema with bcrypt pre-save hashing
│   ├── routes\
│   │   ├── adminRoutes.js       # /api/admin
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── categoryRoutes.js    # /api/categories
│   │   ├── couponRoutes.js      # /api/coupons
│   │   ├── orderRoutes.js       # /api/orders
│   │   ├── productRoutes.js     # /api/products
│   │   ├── reviewRoutes.js      # /api/reviews
│   │   └── settingsRoutes.js    # /api/settings
│   ├── .env.example             # Backend environment template (clean placeholders)
│   ├── .gitignore               # Backend Git exclusion rules
│   ├── package.json             # Backend dependencies & scripts
│   ├── seed.js                  # Safe, additive database seeder
│   ├── server.js                # Express entry point (port 5000)
│   └── verifyE2E.js             # Automated end-to-end integration test runner
│
├── frontend\                    # React 19 Client Application (Vite)
│   ├── src\
│   │   ├── components\          # Modular UI components (Navbar, Footer, Modals, etc.)
│   │   │   ├── Admin\           # Admin dashboard views & modal forms
│   │   │   ├── AdminRoute\      # Role-based protected route guard
│   │   │   ├── OrderTracking\   # Leaflet map & IST milestone stepper
│   │   │   ├── ThemeToggle\     # Sun/Moon luxury theme toggle
│   │   │   └── ...              # ProductCard, CartDrawer, QuickView, Toast, etc.
│   │   ├── context\
│   │   │   ├── StoreContext.jsx # Global context (Cart, Wishlist, Auth, Modals)
│   │   │   └── ThemeContext.jsx # Theme context (Dark / Light mode + localStorage)
│   │   ├── pages\               # Route views (Home, Shop, ProductDetails, Admin, etc.)
│   │   ├── services\
│   │   │   └── api.js           # Axios clients (customerApi & adminApi)
│   │   ├── styles\
│   │   │   └── variables.css    # Central theme tokens, colors & typography
│   │   ├── utils\
│   │   │   ├── dateUtils.js     # Standardized Asia/Kolkata (IST) date formatter
│   │   │   └── geoUtils.js      # City centroid coordinates & demo dispatch origin
│   │   ├── App.jsx              # Application router & modal mount
│   │   ├── index.css            # Global resets, button styles & base styles
│   │   └── main.jsx             # React DOM mount point
│   ├── .env.example             # Frontend environment template
│   ├── .gitignore               # Frontend Git exclusion rules
│   ├── index.html               # Single page application HTML shell
│   ├── package.json             # Frontend dependencies & build scripts
│   └── vite.config.js           # Vite configuration
│
├── .env.example                 # Root environment template
├── .gitignore                   # Root repository Git exclusion rules
└── README.md                    # Project documentation
```

---

## 5. Installation & Setup Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+ LTS` recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Access to a MongoDB Atlas cluster or local MongoDB instance (`mongodb://127.0.0.1:27017`)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/novara-luxury-ecommerce.git
cd novara-luxury-ecommerce
```

---

### Step 2: Backend Setup & Configuration

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the provided `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in an editor and configure your variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/novara?retryWrites=true&w=majority
   JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters_here
   JWT_EXPIRE=30d
   ADMIN_EMAIL=admin@novara.luxury
   ADMIN_PASSWORD=YourStrongAdminPasswordHere!
   ```

4. **Start the backend development server**:
   ```bash
   npm start
   ```
   *The server runs on port `5000` (`http://localhost:5000/api/health`).*

---

### Step 3: Frontend Setup & Configuration

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Copy `.env.example` to `.env` if you need to point to a custom API address:
   ```bash
   cp .env.example .env
   ```
   *(Default points to `http://localhost:5000/api`)*

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The client runs on port `5173` (`http://localhost:5173`).*

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 6. Environment Configuration Templates

### Backend Template (`backend/.env.example`)
```env
# Server Network Port
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB Atlas Cloud Cluster or Local MongoDB)
# Option A: MongoDB Atlas Cloud Cluster (Recommended)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/novara?retryWrites=true&w=majority
# Option B: Local MongoDB Community Server
MONGODB_URI=mongodb://127.0.0.1:27017/novara

# JSON Web Token Configuration
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_here
JWT_EXPIRE=30d

# Initial House Director (Admin) Provisioning Credentials
ADMIN_EMAIL=admin@novara.luxury
ADMIN_PASSWORD=YourStrongAdminPasswordHere!
```

### Frontend Template (`frontend/.env.example`)
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## 7. MongoDB Configuration & Data Layer

NOVARA supports both **MongoDB Atlas (Cloud)** and **Local MongoDB**:

1. **MongoDB Atlas (Recommended)**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - In **Network Access**, whitelist your IP address or add `0.0.0.0/0` for cloud deployment.
   - In **Database Access**, create a user with read/write privileges.
   - Obtain the connection URI (e.g. `mongodb+srv://...`) and paste it into `backend/.env` under `MONGODB_URI`.

2. **Local MongoDB**:
   - Start your local MongoDB server daemon (`mongod`).
   - Set `MONGODB_URI=mongodb://127.0.0.1:27017/novara` in `backend/.env`.

3. **Zero-Downtime Memory Store Fallback**:
   - The backend includes timeout detection (`serverSelectionTimeoutMS: 10000`). If the MongoDB connection is unreachable, the system automatically falls back to an in-memory repository to ensure zero-downtime grading and demonstration.

---

## 8. Role-Based Access Control (RBAC)

The platform implements strict role isolation enforced on both backend API routes and frontend navigation:

| Role | Access Level | Description & Capabilities |
| :--- | :--- | :--- |
| **House Director (`admin`)** | Full Administrative Access | Access to `/admin` Director Portal, 10 operational modules, product CRUD, inventory replenishment, order status updates, coupon management, patron directory, analytics, and store settings. Protected by `protect` and `admin` middleware guards. |
| **Patron (`user`)** | Customer Shopping Access | Access to all storefront pages, product browsing, bag management, wishlist, checkout, payment simulation, order history (`/orders`), receipt tracking, and profile address book. Non-admin users are blocked from `/admin`. |

---

## 9. Important Disclaimers & Limitations

### Demo Payment Gateway Disclaimer
> [!IMPORTANT]
> **SIMULATED DEMONSTRATION PAYMENT SYSTEM**:
> All payment methods provided on this platform—including **Instant UPI QR Code**, **Credit/Debit Card (interactive card mockup)**, and **Cash on Delivery**—are implemented strictly for educational, demonstration, and evaluation purposes. **No real monetary transactions, payment gateway webhooks, or credit card charges take place.** Users should never enter genuine credit card details, banking PINs, or real financial credentials.

### Order Tracking Limitations
> [!NOTE]
> **ESTIMATED DEMONSTRATION TRACKING**:
> 1. **Dispatch Origin**: The dispatch location at Bandra Kurla Complex (BKC), Mumbai is a configured demonstration atelier origin, not a verified physical warehouse.
> 2. **Delivery Destination Coordinates**: The interactive map uses approximate city-level centroid coordinates across India derived from the shipping address. The system does not claim real-time street-level GPS tracking.
> 3. **Transit Polyline**: The polyline connecting the origin and destination is an estimated transit route rendered using Leaflet and OpenStreetMap.
> 4. **Milestone Timestamps**: Delivery milestone timestamps represent genuine recorded status updates formatted in Indian Standard Time (`Asia/Kolkata`, IST).

---

## 10. Security & Data Integrity

- **Password Hashing**: Irreversible `bcryptjs` hashing with 10 salt rounds.
- **Token Security**: Signed JWT tokens with expiration guards.
- **Git Safety**: All `.env` files, production build artifacts (`dist/`), temporary logs, and `node_modules/` are strictly excluded from version control via `.gitignore`.
- **Zero Hardcoded Secrets**: All sensitive credentials, database connection strings, and secret keys are loaded exclusively from environment variables.
- **Inventory Concurrency**: Atomic server-side validation prevents orders from exceeding physical stock.

---

*NOVARA Luxury Fashion Group — MERN E-Commerce Architecture.*
