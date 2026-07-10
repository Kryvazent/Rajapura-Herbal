# Rajapura Herbal

Rajapura Herbal is a full-stack web application for a Sri Lankan Ayurvedic herbal company. It includes a public website for products, services, store locations, and company information, plus a protected admin dashboard for managing catalogue content, stores, services, users, and product images.

Production site:

```text
https://www.rajapuraherbal.lk
```

## Features

- Public landing page, product catalogue, services, store locator, about page, and 404 page
- Protected admin panel with a hidden access path
- Admin product, store, service, and user management
- Product image uploads with UploadThing storage
- Product image cleanup when images/products are updated or deleted
- Optional product pricing with frontend display as `Contact for price`
- First-time admin guide/tour
- SEO metadata, sitemap, robots file, Open Graph, Twitter cards, and canonical URLs
- Security hardening with CORS allow-listing, rate limiting, Helmet, CSP, secure sessions, and input validation

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Axios
- Lucide React
- UploadThing React helpers

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- Express Session with Mongo session storage
- UploadThing
- Helmet
- Express Rate Limit
- Express Validator

## Project Structure

```text
.
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── index.js
│   ├── package.json
│   └── vercel.json
├── frontend
│   ├── public
│   ├── src
│   ├── index.html
│   ├── package.json
│   └── vercel.json
└── README.md
```

## Prerequisites

- Node.js 20 or newer recommended
- npm
- MongoDB Atlas or another MongoDB deployment
- UploadThing account and token

## Environment Variables

Do not commit real `.env` files. Use the example files as templates.

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
FRONTEND_URL=https://www.rajapuraherbal.lk,https://rajapura-herbal-frontend.vercel.app
MONGO_URL=<your-mongodb-connection-string>
SESSION_SECRET=<generate-a-long-random-session-secret>
NODE_ENV=production
UPLOADTHING_TOKEN=<your-uploadthing-token>
BODY_LIMIT=1mb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=10
CSP_CONNECT_SRC=https://www.rajapuraherbal.lk,https://rajapura-herbal-frontend.vercel.app
CSP_IMG_SRC=https://www.rajapuraherbal.lk,https://rajapura-herbal-frontend.vercel.app
```

For local development, `NODE_ENV` can be `development` and `FRONTEND_URL` can include `http://localhost:5173`.

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_BACKEND_URL=https://rajapura-herbal-production.up.railway.app
VITE_SITE_URL=https://www.rajapuraherbal.lk
```

For local development:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_SITE_URL=https://www.rajapuraherbal.lk
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Local Development

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

The backend usually runs at:

```text
http://localhost:3000
```

## Admin Access

The admin UI is intentionally not mounted at `/admin`.

Current admin entry path:

```text
/rh-admin-7q4m9x
```

Admin API routes still use `/admin/...` on the backend. Those routes are protected by session authentication and role checks.

## Available Scripts

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
npm run build
```

## Deployment

### Backend

The backend is configured for Node hosting and includes `backend/vercel.json`. It is also compatible with Railway-style hosting.

Required production environment variables:

- `FRONTEND_URL`
- `MONGO_URL`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `UPLOADTHING_TOKEN`

After changing environment variables, redeploy or restart the backend service.

### Frontend

The frontend is configured for Vercel in `frontend/vercel.json`.

Required production environment variables:

- `VITE_BACKEND_URL`
- `VITE_SITE_URL`

The frontend also serves:

- `/robots.txt`
- `/sitemap.xml`

## SEO

SEO support includes:

- Route-specific document titles
- Meta descriptions
- Canonical URLs
- Open Graph tags
- Twitter card tags
- `robots.txt`
- `sitemap.xml`

If the production domain changes, update:

- `frontend/.env.example`
- frontend deployment variable `VITE_SITE_URL`
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`

## Security

Implemented security controls include:

- CORS allow-listing through `FRONTEND_URL`
- Production requirement for `SESSION_SECRET`
- Secure session cookies in production
- Mongo-backed session storage
- Session regeneration after login
- Rate limiting for API and login routes
- Helmet security headers
- Content Security Policy
- Origin checks for state-changing requests
- Request body size limit
- Input validation on admin routes
- Admin role verification against the database
- Disabled user/session invalidation
- Product image upload role checks
- No admin routes in sitemap

Important security practices:

- Rotate any secret that has ever been shared outside the hosting provider.
- Never commit real `.env` files.
- Keep `FRONTEND_URL` updated with every allowed frontend origin.
- Keep `VITE_BACKEND_URL` updated with the active backend URL.
- Keep dependencies patched and run audits before deployment.

## Dependency Checks

Run audits:

```bash
cd backend
npm audit --omit=dev
```

```bash
cd frontend
npm audit --omit=dev
```

Build frontend:

```bash
cd frontend
npm run build
```

## Image Uploads

Product images are uploaded through UploadThing. The backend upload route checks that the current session belongs to an `ADMIN` or `STAFF` user. When product images are replaced or products are deleted, the old UploadThing image is cleaned up where possible.

## Notes

- The public navigation bar should remain unchanged unless intentionally requested.
- The admin path is hidden from sitemap and disallowed in robots.
- Product price can be empty; public pages show `Contact for price`.
- Product badge can be unset.

