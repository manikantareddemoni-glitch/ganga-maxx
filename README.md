# Ganga Maxx Credit Account Statement & Aging Report System

Production-style B2B credit management dashboard for Ganga Maxx Marketplace.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios, Socket.IO client
- Backend: Node.js, Express.js, JWT authentication, Socket.IO
- Database: MySQL

## Folder Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── data
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── lib
│   │   ├── pages
│   │   └── styles
│   └── ...
├── database
│   ├── schema.sql
│   └── seed.sql
└── server
    ├── src
    │   ├── config
    │   ├── middleware
    │   ├── routes
    │   ├── services
    │   └── socket
    └── ...
```

## Setup

### 1. Database

Create a MySQL database and run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p ganga_maxx_credit < database/seed.sql
```

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Default API: `http://localhost:5000`

Demo user:

- Email: `admin@gangamaxx.com`
- Password: `Admin@123`

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Default app: `http://localhost:5173`

## Notes

- The frontend includes premium SaaS styling, light/dark theme, responsive navigation, animated KPIs, charts, tables, modals, skeleton loaders, and Socket.IO notifications.
- The backend exposes JWT-protected APIs for dashboard, customers, ledger, statements, aging, notifications, and settings.
- Socket.IO broadcasts business events such as customer creation, invoice updates, payments, and overdue changes.

## Internship Submission Checklist

Use this section for report, PPT, GitHub, deployment, and demo video preparation.

### Functional Testing

- Login with valid and invalid credentials.
- Create, edit, search, filter, paginate, and block a customer.
- Verify dashboard KPIs: total customers, outstanding amount, overdue amount, pending invoices, and today collections.
- Verify credit ledger rows show debit, credit, and running balance.
- Generate an account statement for a customer and date range.
- Print the statement or save it as PDF from the browser print dialog.
- Export account statement CSV.
- Verify aging buckets: Current, 0-30 Days, 31-60 Days, 61-90 Days, and 90+ Days.
- Confirm days overdue, priority badges, and collection follow-up actions are visible.
- Export aging report CSV.
- Trigger a new payment/customer API action and confirm Socket.IO notifications update the dashboard.

### API Testing

Recommended Postman flow:

1. `POST /api/auth/login`
2. Copy the returned JWT token.
3. Add `Authorization: Bearer <token>` to protected requests.
4. Test:
   - `GET /api/dashboard`
   - `GET /api/customers`
   - `POST /api/customers`
   - `GET /api/reports/ledger/:customerId`
   - `GET /api/reports/statement/:customerId`
   - `GET /api/reports/aging`
   - `POST /api/payments`

### Deployment Notes

- Frontend can be deployed to Vercel, Netlify, or any static hosting after `npm run build`.
- Backend can be deployed to Render, Railway, AWS EC2, or a Node.js VPS.
- MySQL can run on Railway MySQL, PlanetScale-compatible MySQL, AWS RDS, or a local server.
- Set production environment variables:
  - `JWT_SECRET`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `CLIENT_ORIGIN`
  - `VITE_API_URL`
  - `VITE_SOCKET_URL`

### Demo Video Flow

1. Show login and theme switching.
2. Explain dashboard KPIs and real-time notification area.
3. Open the collection follow-up panel and explain priority handling.
4. Add or edit a customer.
5. Show ledger debit, credit, and running balance.
6. Generate and print/export account statement.
7. Open aging report and explain days overdue and buckets.
8. Export aging CSV.
9. Briefly show MySQL tables and Express API routes.
