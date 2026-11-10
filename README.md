# JetVau Aerospace web

Three apps in one repository, deployed together as one Vercel project with [services](https://vercel.com/docs/services):

| Folder | What it is | Public path |
| --- | --- | --- |
| `frontend/` | Next.js 14 public site | `/` |
| `backend/` | Express + MongoDB API, Razorpay payments | `/api/*` |
| `admin/` | Vite + React admin panel | `/admin/*` |

Routing lives in [`vercel.json`](vercel.json). The frontend reaches the backend server-side (for `sitemap.xml`) through a service binding that injects `BACKEND_URL`. Browser code calls `/api` on the same domain.

## Environment variables

Set these in the Vercel project settings.

| Variable | Required | Used by |
| --- | --- | --- |
| `MONGODB_URI` | yes | backend |
| `JWT_SECRET` | yes, a long random string | backend |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | for payments | backend |
| `RAZORPAY_WEBHOOK_SECRET` | recommended, see below | backend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | for enrollment emails | backend |
| `NEXT_PUBLIC_SITE_URL` | no, defaults to `https://jetvau.com` | frontend metadata, sitemap |

`FRONTEND_URL` / `ADMIN_URL` (CORS) and `NEXT_PUBLIC_API_URL` / `VITE_API_URL` are only needed for local development when the apps run on different ports. MongoDB Atlas must allow connections from Vercel (Network Access).

## Razorpay webhook

The browser confirms each payment with `/api/payments/verify`, but if the user closes the tab right after paying, that call never happens. The webhook confirms those payments too, and captures payments that were only authorized (uncaptured payments are refunded by Razorpay).

In the Razorpay dashboard, go to Settings → Webhooks → Add new webhook:

- URL: `https://<your-domain>/api/payments/webhook`
- Secret: a long random string; set the same value as `RAZORPAY_WEBHOOK_SECRET` in Vercel
- Events: `payment.authorized`, `payment.captured`, `order.paid`

If a user pays twice for the same course (two checkout tabs), the second payment is logged as a warning in the backend logs and has to be refunded from the Razorpay dashboard.

## Creating the first admin

There is no public endpoint for this. From `backend/`, with `MONGODB_URI` in `backend/.env`:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
```

Running it again for an existing email promotes that account to admin and resets its password.

## Local development

Run everything together on one origin with `vercel dev`, or run each app on its own:

```bash
cd backend && npm install && npm run dev      # http://localhost:5000
cd frontend && npm install && npm run dev     # http://localhost:3000, set NEXT_PUBLIC_API_URL=http://localhost:5000/api
cd admin && npm install && npm run dev        # http://localhost:5173/admin/, set VITE_API_URL=http://localhost:5000/api
```

## Images still to add

The design has photo slots that load these files if present: `frontend/public/images/hero-drone.jpg`, `why-us.jpg` and `about.jpg`.
