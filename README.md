# Tirumula Dairy — Full-Stack POS & Inventory Management System

A web app for a dairy shop with a **public product catalog** and an **admin POS/inventory panel**.
Demo : https://tirumula.pages.dev/

## Tech Stack

- **Supabase** — database & REST API
- **jsPDF + autoTable** — PDF bill generation
- **Google Fonts (Inter) + Font Awesome** — UI

## Project Structure

```
├── index.html          → Public user catalog (landing page)
├── admin.html          → Admin panel (POS, inventory, stats)
├── style.css           → All styles
├── supabase-setup.sql  → Supabase schema
├── README.md
│
├── domain/             → Pure business logic (no DOM, no Supabase)
│   ├── product.js      → Product entity with stockStatus/stockLabel
│   └── stockService.js → Filter, sort, search helpers
│
├── data/
│   └── productRepo.js  → Supabase CRUD operations
│
└── ui/                 → DOM interaction
    ├── shared.js       → Toast, password modal, admin gate, logout
    ├── userPage.js     → User catalog render, filter, detail modal
    └── adminPage.js    → Admin CRUD table, POS drawer, stats, PDF
```

## Pages

### Public Catalog (`index.html`)
- Product grid with images, prices, stock status dots
- Category filter, sort (price/stock), search
- Detail modal on "View details"
- Admin login via password modal

### Admin Panel (`admin.html`)
- **Dashboard stats** — today's revenue, products sold, top product (latest bill only)
- **Product table** — CRUD (add/edit/delete) with image upload, Enter key saves
- **Today's Sales drawer** — all products with quantity inputs (min 0, max stock), instant grand total, stock shown below name
- **PDF bill** — autoTable with columns: Product, Opening Stock, Sold, Closing Stock, Price, Total
- **Stock auto-update** — Supabase stock decremented on bill generation

## Setup

1. Create a Supabase project
2. Run `supabase-setup.sql` in Supabase SQL Editor (creates products + admins table)
3. Update the Supabase URL & anon key in `data/productRepo.js`
4. Serve with any static server (e.g. `npx serve .`, VS Code Live Server)

## Admin Access

- Password: `password123`
- Stored as SHA-256 hash in `admins` Supabase table
- Login hashes input via Web Crypto API and compares against stored hash
- Password never appears in frontend source code

## Design

**Light theme:**
- Primary teal: `#4A9BAD`
- Background: `#F5F7F8`
- Cards: `#FFFFFF`
- Text: `#1A2B2E`

