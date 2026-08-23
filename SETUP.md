# Santa Claus — Setup guide

This project needs a few free accounts before it's fully functional. Everything is wired to
environment variables — copy `.env.example` to `.env` and fill these in (using `.env` rather than
`.env.local` so the Prisma CLI picks it up too, not just Next.js).

## 1. Database — Neon Postgres

1. Create a free project at https://console.neon.tech
2. In the Neon dashboard, copy the **pooled connection string** → `DATABASE_URL`
3. Copy the **direct (unpooled) connection string** → `DIRECT_URL` (used only by `prisma migrate`)
4. Push the schema: `npm run db:push`
5. (Optional) Seed sample categories/products, plus a ready-to-use admin login
   (`admin@gmail.com` / `12345` — change this password after first login in production):
   `npm run db:seed`

Note: Neon gives you two connection strings — one with `-pooler` in the hostname (use for
`DATABASE_URL`) and a direct one without it (use for `DIRECT_URL`). Using the pooled string for
both works for this app, but the direct one is more reliable for `prisma db push` / `migrate`.

## 2. Auth secret

Generate a random secret for `BETTER_AUTH_SECRET`, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` should be `http://localhost:3000` locally and your
production URL (e.g. `https://your-app.vercel.app`) once deployed.

## 3. Google login

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and the same with
   your production domain once deployed)
4. Copy the Client ID / Secret → `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

Email/password login works out of the box with no extra setup, and does **not** require email
verification (disabled intentionally per project requirements).

## 4. Cloudinary (image upload)

1. Create a free account at https://cloudinary.com
2. From the dashboard, copy Cloud name / API key / API secret →
   `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`

Admins can upload product/category images either from their device or by pasting an image URL —
both go through `/api/upload`, which pushes the image to Cloudinary.

## 5. Upstash Redis (rate limiting)

1. Create a free database at https://console.upstash.com (choose "Redis")
2. Copy the REST URL / REST token → `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

Without these set, rate limiting "fails open" (requests are allowed) so local dev still works —
but you should set them before going to production.

## 6. Admin access

Set `ADMIN_EMAILS` to a comma-separated list of emails that should be promoted to `ADMIN` the
moment they sign up or log in (via Google or email/password). E.g.:

```
ADMIN_EMAILS="you@example.com,partner@example.com"
```

Admins can access `/admin` to manage categories, products, and orders (Pending → Confirmed →
Given to rider → Delivered), and set the store's bKash receiving number shown to customers at
checkout.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel
2. Add all the environment variables above in the Vercel project settings
3. Update `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and the Google OAuth redirect URI to your
   production domain
4. Vercel runs `npm run build`, which runs `prisma generate` first automatically

No payment gateway is integrated — checkout collects the customer's bKash sender number and
transaction ID as manual payment proof (delivery charge only; product cost is cash on delivery),
which admins verify from the dashboard.
