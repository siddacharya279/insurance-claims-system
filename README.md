You're right. For GitHub, keep it concise.

````markdown
# Insurance Claims System

A full-stack electronic insurance claims processing system that digitizes the insurance claim lifecycle from submission to settlement.

## Features

- JWT authentication & role-based authorization
- Policy & coverage management
- Claim submission and lifecycle management
- Case manager & surveyor assignment
- Survey and claim adjudication
- Workshop & appointment management
- Rental vehicle eligibility and selection
- Vehicle repair tracking
- Online payment processing
- Notifications
- Claim document management
- Audit logging
- Reporting & analytics
- Health and database readiness checks
- Swagger / OpenAPI documentation

## Claim Flow

```text
Claim Submission
      ↓
Case Assignment
      ↓
Survey
      ↓
Adjudication
      ↓
Workshop
      ↓
Repair
      ↓
Payment
      ↓
Claim Closed
````

## Tech Stack

* **Backend:** NestJS, TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT
* **API Docs:** Swagger / OpenAPI

## Project Structure

```text
insurance-claims-system/
├── backend/
├── web/
└── mobile/
```

## Getting Started

### Backend

```bash
cd backend
npm install
```

Configure `.env`:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database>
JWT_SECRET=<strong-secret>
PORT=3000
```

Setup the database:

```bash
npx prisma migrate reset
```

Start the server:

```bash
npm run start:dev
```

API:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api
```

## Development

The backend currently contains the core claims-processing workflow. Web and mobile applications are being developed against the same API platform.

## License

Personal development project.
