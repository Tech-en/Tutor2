# TutorHub — Frontend Package

## Quick Start

1. Place the `frontend/` folder inside your project root alongside the `backend/` folder.
2. Start the backend server (`npm start` in the backend folder — defaults to `http://localhost:5000`).
3. Open `dashboard.html` in a browser, or serve with any static file server:

```bash
# Using Node http-server (install once: npm install -g http-server)
cd frontend
http-server . -p 3000

# Using Python
cd frontend
python3 -m http.server 3000
```

Then visit: `http://localhost:3000/dashboard.html`

---

## File Structure

```
frontend/
├── dashboard.html          # Main SPA — home, pricing, order, nursing, store, my orders
├── login.html              # Login page
├── register.html           # Registration page
│
├── js/
│   ├── apiService.js       # Core fetch wrapper + token management  ← load FIRST
│   ├── auth.js             # Login / register / logout logic         ← load SECOND
│   ├── orders.js           # Order management helpers                ← load THIRD
│   ├── payments.js         # Payment processing + card validation    ← load FOURTH
│   └── main.js             # Dashboard initialisation + AppState     ← load LAST
│
├── css/
│   └── (styles are embedded in each HTML file — no external CSS required)
│
└── assets/
    ├── images/
    │   └── default-avatar.png   # Fallback profile picture (SVG)
    └── icons/
        └── (add custom icons here)
```

---

## Script Load Order

All three HTML files load scripts in this order. **Do not reorder.**

```html
<script src="js/apiService.js" defer></script>
<script src="js/auth.js"       defer></script>
<script src="js/orders.js"     defer></script>
<script src="js/payments.js"   defer></script>
<script src="js/main.js"       defer></script>
```

> `login.html` and `register.html` only need `apiService.js` + `auth.js` (no defer, loaded synchronously).

---

## Backend Configuration

The API base URL is set in `js/apiService.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api/v1',
  TIMEOUT:  30000
};
```

Change `BASE_URL` to match your deployed backend URL before going live.

---

## Authentication Flow

| Page | Behaviour |
|------|-----------|
| `login.html` | Redirects to `dashboard.html` if already authenticated |
| `register.html` | Redirects to `dashboard.html` if already authenticated |
| `dashboard.html` | Works for guests (limited) and authenticated users (full) |

JWT token is stored in `localStorage` under the key `token`.  
User object is stored under the key `user`.

---

## Pages in dashboard.html

| Nav Tab | Page ID | Description |
|---------|---------|-------------|
| Home | `#home` | Landing with features + testimonials |
| Pricing | `#pricing` | Three-tier pricing cards |
| Order Now | `#order` | Assignment submission form |
| How It Works | `#how-it-works` | 4-step process + guarantees |
| Nursing & Health | `#nursing-health` | NCLEX, HESI, exam help, reading materials |
| Study Store | `#study-store` | Digital materials marketplace + admin upload |
| My Orders | `#my-orders` | Order history (localStorage + backend) |

---

## Status of JS Modules

| File | Status |
|------|--------|
| `apiService.js` | ✅ Complete — all endpoints wired |
| `auth.js` | ✅ Complete — login, register, logout, guards |
| `orders.js` | ⚙️ Stub — safe to load, backend wiring pending |
| `payments.js` | ✅ Validation complete — Luhn, expiry, card type |
| `main.js` | ⚙️ Stub — AppState defined, init hooks ready |

---

## Known Limitations

- `orders.js`, `main.js` — stub implementations; extend for full dashboard stats
- `assets/images/default-avatar.png` — SVG placeholder; replace with real image
- Study Store file downloads — backend upload route (`POST /api/v1/store/materials`) not yet implemented
- Mobile nav hamburger menu — implemented; test on real device for touch behaviour
