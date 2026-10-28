# SpiceNest

**Tagline:** Taste Lives Here

SpiceNest is a restaurant web application designed to provide customers with a convenient food-ordering experience and administrators with tools to manage restaurant operations.

## Project Status

Current milestone: M02.3 — Project Structure and Foundation

- [x] Requirements baseline approved
- [x] Development environment inspected
- [x] Project folder structure created and verified
- [x] Root `.gitignore` created
- [ ] Frontend application implementation
- [ ] Backend API implementation
- [ ] Oracle application schema
- [ ] Authentication and authorization
- [ ] Ordering and payment workflows
- [ ] Testing and deployment

The project is under development. Items are marked complete only when their implementation and verification are confirmed.

## Technology Stack

| Component | Planned technology |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Frontend development server | Vite |
| Backend | Node.js, Express |
| Database | Oracle Database Free |
| Oracle driver | `node-oracledb` |
| Code editor | Visual Studio Code |
| Version control | Git |

## Local Development Architecture

The planned local development setup uses:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API prefix: `/api/v1`
- Oracle service: `FREEPDB1`, on port `1521`

Vite will serve the frontend and proxy API requests to Express. Express will handle application logic and communicate with Oracle.

These are planned settings; the application has not yet been implemented.

## Project Structure

```text
SpiceNest/
├── frontend/
│   ├── public/images/
│   │   ├── logo/
│   │   ├── backgrounds/
│   │   └── dishes/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── auth/
│       │   ├── customer/
│       │   └── admin/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       └── styles/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── database/
│   └── tests/
├── database/
│   ├── migrations/
│   ├── seed/
│   └── documentation/
├── docs/
│   ├── architecture/
│   ├── api/
│   └── deployment/
├── .gitignore
└── README.md
```

## Security Guidelines

- Keep real credentials and secrets in local environment files.
- Never commit real `.env` files or passwords to Git.
- Never expose Oracle credentials in frontend code.
- Use a dedicated, least-privilege Oracle application account instead of `SYSTEM`.
- Enforce customer and administrator permissions on the backend.
- Verify payment status on the server before treating an order as paid.

## Catalog Requirements

SpiceNest must preserve the original 50 dish names and their matching images. The image directory has been located at:

`C:\Users\GOD\Downloads\dishes`

The images still need visual verification and mapping to the final Oracle catalog.

## Development Principles

1. Implement and verify one step at a time.
2. Preserve the approved requirements and existing project assets.
3. Test each component before integrating dependent features.
4. Use free tools and services where practical.
5. Do not activate paid services without explicit approval.
6. Exclude secrets, generated files, and local database backups from GitHub.

## Documentation

Additional documentation will be added as implementation progresses:

- `docs/architecture/` — System architecture
- `docs/api/` — API contracts and endpoint documentation
- `docs/deployment/` — Deployment instructions and release checklist
- `database/documentation/` — Oracle schema and database procedures

## Current Setup

The local workspace, Node.js, npm, Git, and the Oracle SQL Developer connection have been checked. The SpiceNest application, dedicated Oracle application schema, and API endpoints have not yet been created.
