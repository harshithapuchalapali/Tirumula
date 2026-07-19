# Tirumula Dairy — Full-Stack Dairy Management

A dark-mode web app for a dairy shop with a **public product catalog** and an **admin POS/inventory panel**.

## Tech Stack

- **Supabase** — database & REST API
- **jsPDF + autoTable** — PDF bill generation
- **Google Fonts (Inter) + Font Awesome** — UI

## Project Structure

```
├── index.html          → Public user catalog (landing page)
├── admin.html          → Admin panel (POS, inventory, stats)
├── user.html           → Duplicate of user catalog
├── style.css           → All styles (Deep Ocean dark theme)
├── supabase-setup.sql  → Supabase schema
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
- Category filter, sort (price/name/stock), search
- Detail modal on "View details"
- Admin login via password modal

### Admin Panel (`admin.html`)
- **Dashboard stats** — today's revenue, products sold, top product
- **Product table** — CRUD (add/edit/delete) with image upload
- **Today's Sales drawer** — all products with quantity inputs (min 0, max stock), instant grand total
- **PDF bill** — autoTable with columns: Product, Opening Stock, Sold, Closing Stock, Price, Total
- **Stock auto-update** — Supabase stock decremented on bill generation

## Setup

1. Create a Supabase project
2. Run `supabase-setup.sql` in Supabase SQL Editor
3. Update the Supabase URL & anon key in `data/productRepo.js` (also `ui/shared.js` if used)
4. Serve with any static server (e.g. `npx serve .`, VS Code Live Server)

## Admin Access

- Password: `password123` (hardcoded in `ui/shared.js`)
- Set `localStorage.td_admin` flag on successful login
- No Supabase Auth — purely frontend gate

## Design

**Deep Ocean dark mode:**
- Primary teal: `#4A9BAD`
- Background: `#0F1A1D`
- Text: `#E0EEF0`
- Card surface: `#172226`

## Notes

- PDF uses `Rs.` (Helvetica doesn't support ₹)
- Sales tracked via `localStorage.td_sales` (JSON array, auto-cleaned after 7 days)
- Favicon: inline SVG milk emoji data URI
- Address: Beside PR Club, Muthyalapeta, Gudur — 524101
