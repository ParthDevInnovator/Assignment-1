# 🌟 Store Rating Platform - Full-Stack Application

A comprehensive, role-based web application that allows users to discover registered stores and submit 1–5 star ratings, with dedicated dashboards for **System Administrators**, **Store Owners**, and **Normal Users**.

---

## 🛠️ Tech Stack

- **Backend**: Express.js with TypeScript, Zod schema validation, JWT auth, and bcryptjs password encryption.
- **Database**: PostgreSQL (Docker containerized) managed via **Prisma ORM** with relational integrity, composite unique constraints (`[userId, storeId]`), and SQL index optimizations.
- **Frontend**: React.js with TypeScript (Vite bundler), TailwindCSS, and Lucide React icons.

---

## 🔑 Demo Accounts & Credentials

The login page provides 1-click **Quick Test Account** buttons to instantly populate credentials:

| Role | Email | Password | Name (Length: 20-60 chars) |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Password@123` | System Super Administrator |
| **Store Owner** | `owner.robert@storerating.com` | `Password@123` | Robert Johnson Store Manager |
| **Store Owner** | `owner.eleanor@storerating.com` | `Password@123` | Eleanor Vance Store Curator |
| **Normal User** | `user.chris@storerating.com` | `Password@123` | Christopher Nolan Reviewer |
| **Normal User** | `user.sam@storerating.com` | `Password@123` | Samantha Carter Reviewer |

---

## 🚀 Getting Started

### 1. Database (PostgreSQL via Docker)
A `docker-compose.yml` is provided at the root:
```bash
docker compose up -d
```
- Port: `5433:5432`
- Database: `store_rating_db`

### 2. Backend Server
```bash
cd backend
npm install
npm run db:push     # Synchronizes Prisma models with PostgreSQL
npm run db:seed     # Seeds initial admin, store owners, normal users, and stores
npm run dev         # Launches Express API on http://localhost:5000
```

### 3. Frontend Application
```bash
cd frontend
npm install
npm run dev         # Launches Vite React development server on http://localhost:3000
```

---

## 📋 Features by Role

### 1. System Administrator
- **Analytics Metrics**: Real-time counter cards showing **Total Users**, **Total Stores**, and **Total Submitted Ratings**.
- **User Management**:
  - Add new users (Admin, Normal User, or Store Owner) with strict validation.
  - View all users with column-level sorting (Name, Email, Address, Role).
  - Search/filter users by Name, Email, Address, and Role.
  - Store Owners display their store's overall rating directly in the table.
- **Store Management**:
  - Add new stores and assign eligible Store Owners.
  - View all registered stores with column-level sorting (Name, Email, Address, Rating).
  - Search stores by Name, Email, and Address.

### 2. Normal User
- **Self Registration**: Signup form with real-time character counters and validation feedback.
- **Store Discovery**: Browse all registered stores with live search (by Name and Address) and sorting.
- **Ratings**:
  - View overall community rating (e.g. `4.7 ★`) and total review count.
  - View your own submitted rating.
  - Interactive rating modal to submit or update rating (1 to 5 stars) with live recalculation.
- **Account Security**: Update password modal with old password check and complexity enforcement.

### 3. Store Owner
- **Store Performance**: Average rating display, total review counts, and 5-star to 1-star visual breakdown bars.
- **Customer Feedback Log**: View all users who rated their store with reviewer Name, Email, Address, Rating given, and timestamp.
- **Table Sorting**: Sort feedback by Customer Name, Rating score, or Date.
- **Account Security**: Update password modal.

---

## 🛡️ Form Validation Rules

All validations are enforced both client-side and server-side via Zod:

| Field | Rule | Validation Criteria |
| :--- | :--- | :--- |
| **Name** | Min 20, Max 60 characters | `len >= 20 && len <= 60` |
| **Address** | Max 400 characters | `len > 0 && len <= 400` |
| **Password** | 8 to 16 characters | Must contain $\ge 1$ uppercase letter and $\ge 1$ special symbol |
| **Email** | Standard RFC 5322 format | Valid email structure |
| **Rating** | Integer 1 to 5 | `1 <= score <= 5` |
