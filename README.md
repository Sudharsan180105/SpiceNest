# SpiceNest — Restaurant Management System

**Tagline: Taste Lives Here**

SpiceNest is a full-stack restaurant management and online food-ordering application designed to provide customers with a convenient dining experience while giving administrators the tools to manage restaurant operations efficiently.

The application combines a customer-facing restaurant website with an administrative portal for managing food items, categories, orders, customers, inventory, and reports.

## Project Overview

SpiceNest brings restaurant ordering and administration together in one application. Customers can explore the menu, authenticate, place orders, review order details, track order status, and access their order history. Administrators can manage the restaurant catalog, monitor orders, manage customers, and view operational information.

## Features

### Customer Website

- Restaurant homepage with branding and food imagery
- Food menu with categories and individual dish details
- Food catalog containing 50 dishes
- Customer registration and login
- Firebase Authentication integration
- Google sign-in support, where configured
- Shopping cart and checkout workflow
- Order placement and order details
- My Orders page with order tracking
- Order History for delivered and paid orders
- Customer profile and account-related functionality
- Contact and enquiry submission
- Customer access to administrator replies to enquiries

### Admin Portal

- Administrative dashboard
- Food and menu management
- Category management
- Order management and status updates
- Order history
- Customer management
- Inventory and reporting features
- Dashboard analytics
- Administrative settings

*Feature availability and behavior depend on the current implementation and configuration.*

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Frontend tooling | Vite |
| Backend | Node.js, Express.js |
| Database | Oracle Database |
| Oracle connectivity | `node-oracledb` |
| Authentication | Firebase Authentication |
| API architecture | REST API |
| API version prefix | `/api/v1` |
| Development tools | Visual Studio Code, Git, npm |
| Version control | Git and GitHub |

## Application Architecture

SpiceNest uses a frontend-backend-database architecture.

```text
Customer / Administrator
          |
          v
React Frontend (Vite)
          |
          v
Node.js + Express Backend
          |
          +---- Firebase Authentication
          |
          v
Oracle Database
          |
          v
Food Catalog, Customers,
Orders and Related Records
```

The React frontend provides the user interface. The Express backend handles API requests and application logic, validates access, and communicates with Oracle Database. Firebase Authentication is used to authenticate supported customer and administrator flows, with authorization enforced by the application backend.

## Project Structure

```text
SpiceNest/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── backgrounds/
│   │   │   ├── dishes/
│   │   │   └── logo/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── AdminPortal.jsx
│   │   ├── AdminPortal.css
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── adminAuth.js
│   ├── db.js
│   ├── firebaseAuth.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── migrations/
│       └── 001_core_schema.sql
├── .gitignore
├── README.md
└── ...
```

## Local Development Setup

### Prerequisites

Install and configure:

- Node.js and npm
- Oracle Database with an accessible application service
- Git
- A Firebase project configured for the authentication methods used by the application

### 1. Clone the repository

```bash
git clone https://github.com/Sudharsan180105/SpiceNest.git
cd SpiceNest
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal from the project root:

```bash
cd backend
npm install
```

### 4. Configure backend environment variables

Create `backend/.env` using `backend/.env.example` as a reference.

Configure the values required by your environment, including:

```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

ORACLE_USER=YOUR_SPICENEST_DB_USER
ORACLE_PASSWORD=YOUR_DATABASE_PASSWORD
ORACLE_CONNECT_STRING=localhost:1521/FREEPDB1
```

Replace the example values with your actual local configuration. Do not commit `backend/.env` to GitHub.

### 5. Configure Firebase

Configure the Firebase project and authentication settings required by the frontend and backend.

Keep Firebase Admin service-account credentials and other private keys outside the public repository. Frontend Firebase configuration must not contain server-side credentials.

### 6. Configure Oracle Database

Ensure Oracle Database is running and that the configured application account has the required permissions.

Review the SQL migration files under `database/migrations/` and apply the appropriate schema setup to your database before running the application. Back up existing data before making schema changes.

### 7. Start the backend

From the `backend` directory:

```bash
node index.js
```

The configured local backend runs at:

`http://localhost:5000`

Health-check endpoint:

`http://localhost:5000/api/v1/health`

### 8. Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

The Vite development server normally runs at:

`http://localhost:5173`

Use the address printed by Vite if it selects a different port.

## Database

Oracle Database stores the application's persistent restaurant data, including food catalog and order-related records.

Database migration scripts are maintained in:

`database/migrations/`

Use the SQL scripts and the actual application schema as the source of truth for table definitions. Configure the database connection through environment variables instead of hardcoding credentials.

## Security

- Keep database credentials and private keys out of source control.
- Use a dedicated Oracle application account with least-privilege permissions.
- Verify Firebase ID tokens on protected backend endpoints.
- Enforce customer ownership and administrator permissions on the server.
- Validate user input and API requests.
- Verify payment status on the server before marking an order as paid.
- Never store passwords or sensitive authentication tokens in public files.
- Configure Firebase API-key restrictions and appropriate Firebase security rules.
- Keep `.env`, service-account files, database backups, and other sensitive artifacts out of Git history.

## Current Repository

GitHub repository:

https://github.com/Sudharsan180105/SpiceNest

The repository contains the frontend, backend, Oracle migration script, food images, and project configuration files.

## Future Improvements

Potential improvements include:

- Production deployment of the frontend and backend
- Automated testing and continuous integration
- Expanded API and database documentation
- Production logging, monitoring, and error handling
- Improved accessibility and responsive design
- Additional payment-provider integration, if required
- Automated database backup and recovery procedures

## Author

**SUDHARSAN L S**

Full-Stack Development Project

**SpiceNest — Taste Lives Here**
