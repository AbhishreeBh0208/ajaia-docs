# Ajaia Docs

**A lightweight, collaborative document editor inspired by Google Docs.**

Ajaia Docs is a full-stack document management and editing application that allows users to create, edit, import, and share documents with controlled access permissions. It provides a clean writing experience with rich-text formatting, automatic saving, and role-based collaboration.

## Features

### 1. Document Management
- Create new documents.
- Edit document titles and content.
- Automatically save document changes.
- View owned and shared documents.
- Search documents by title.
- Browse recent documents.

### 2. Rich Text Editor
Built using TipTap, the editor supports:
- Paragraph formatting.
- Heading 1 and Heading 2.
- Bold, italic, and underline.
- Bulleted lists.
- Numbered lists.
- Editable document content.

### 3. Document Sharing
- Share documents with registered users through their email addresses.
- Assign Editor or Viewer permissions.
- Update collaborator permissions.
- Revoke document access.
- Display existing collaborators and their access levels.

### 4. Role-Based Access Control

Ajaia Docs implements three document access roles:

| Role | View | Edit | Share | Delete |
|---|---|---|---|---|
| Owner | Yes | Yes | Yes | Yes |
| Editor | Yes | Yes | No | No |
| Viewer | Yes | No | No | No |

Document permissions are enforced through server-side API authorization checks.

### 5. Document Import
Users can import existing documents in the following formats:

- `.txt` – Plain text documents.
- `.md` – Markdown documents.
- `.docx` – Microsoft Word documents.

Imported documents are converted into TipTap-compatible JSON and stored as new editable documents.

**Import limitations:** DOCX imports currently preserve extracted text and paragraph breaks rather than advanced Word formatting, tables, or embedded images. The maximum supported file size is 5 MB.

### 6. Authentication
- Session-based authentication using JWT.
- HTTP-only session cookies.
- Authenticated document access.
- Demo account switching for evaluation.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Rich Text Editor | TipTap |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | jose, JWT, HTTP-only cookies |
| Validation | Zod |
| DOCX Processing | Mammoth |
| Testing | Vitest |
| Deployment | Vercel and Supabase |

## Application Architecture

Ajaia Docs follows a full-stack architecture using Next.js App Router.

```text
                 User Interface
                       |
                       v
              Next.js App Router
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Dashboard    Document     Import
                     Editor       API
          |            |            |
          +------------+------------+
                       |
                       v
                  API Routes
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Authentication Permissions  Validation
          |            |            |
          +------------+------------+
                       |
                       v
                  Prisma ORM
                       |
                       v
                 PostgreSQL
```

### Database Models

The application uses three primary database models:

**User**
- Stores user identity and account information.
- Maintains relationships with owned documents and shared documents.

**Document**
- Stores document title and TipTap JSON content.
- Tracks ownership and timestamps.
- Supports document retrieval and updates.

**DocumentShare**
- Connects users with shared documents.
- Stores the assigned access role.
- Enforces unique document-user relationships.

The `ShareRole` enum defines `VIEWER` and `EDITOR`. Document ownership is represented separately through the document's `ownerId`.

## Project Structure

```text
ajaia-docs/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── documents/
│   │   │       ├── route.ts
│   │   │       ├── import/
│   │   │       └── [id]/
│   │   │           └── shares/
│   │   ├── dashboard/
│   │   ├── document/
│   │   └── login/
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   └── editor/
│   │
│   └── lib/
│       ├── auth.ts
│       ├── permissions.ts
│       └── prisma.ts
│
├── tests/
│   └── permissions.test.ts
│
├── vitest.config.mts
├── prisma.config.ts
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL database (local or hosted)
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ajaia-docs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
DATABASE_URL="your_postgresql_connection_string"
SESSION_SECRET="your_secure_random_secret"
```

- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: A secure random secret used for signing authentication sessions.

Do not commit `.env` or expose production credentials.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npx prisma db seed
```

The seed script creates the demo accounts used for application evaluation.

### 7. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

## Demo Accounts

The application includes three seeded demo users:

| Name | Email |
|---|---|
| Alex Morgan | alex@ajaia.demo |
| Jordan Lee | jordan@ajaia.demo |
| Taylor Smith | taylor@ajaia.demo |

Use the demo account selector on the login/dashboard interface to switch between accounts.

These are development and evaluation accounts, not production authentication credentials.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a demo user |
| POST | `/api/auth/logout` | End the current session |
| GET | `/api/auth/me` | Retrieve the current user |
| GET | `/api/documents` | Retrieve accessible documents |
| POST | `/api/documents` | Create a document |
| GET | `/api/documents/[id]` | Retrieve a document |
| PATCH | `/api/documents/[id]` | Update document title or content |
| DELETE | `/api/documents/[id]` | Delete an owned document |
| GET | `/api/documents/[id]/shares` | Retrieve sharing information |
| POST | `/api/documents/[id]/shares` | Invite users or update permissions |
| DELETE | `/api/documents/[id]/shares` | Revoke collaborator access |
| POST | `/api/documents/import` | Import a TXT, MD, or DOCX file |

All document and sharing endpoints require an authenticated session. Authorization is checked on the server.

## Testing

Ajaia Docs uses Vitest for automated testing.

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Current automated tests cover:

- Owner editing permissions.
- Editor editing permissions.
- Viewer editing restrictions.
- Owner sharing permissions.
- Editor sharing restrictions.
- Viewer sharing restrictions.

### Current Test Results

**6 tests passing**

## Production Build

To verify that the application compiles for production:

```bash
npm run build
```

To start the production server after a successful build:

```bash
npm run start
```

## Design and Engineering Decisions

- **Next.js App Router:** Provides the application structure, server-rendered pages, and API endpoints in one framework.
- **TipTap:** Provides a flexible, extensible rich-text editing experience with structured JSON document content.
- **Prisma:** Simplifies database operations and provides type-safe database access.
- **PostgreSQL:** Provides persistent relational storage for users, documents, and sharing relationships.
- **JWT sessions:** Enable authenticated requests using HTTP-only cookies.
- **Server-side authorization:** Prevents unauthorized users from modifying or accessing documents.
- **Vitest:** Provides a lightweight automated testing framework for permission logic.

## Current Scope and Limitations

- Real-time simultaneous editing and live cursor synchronization are not implemented.
- Users must already have an account to receive document access.
- DOCX importing currently extracts text rather than reproducing the full Word layout.
- TXT and Markdown importing support basic paragraph and list formatting.
- The current demo account switching mechanism is intended for evaluation and should be replaced with a production-grade authentication and account-management flow before public release.

## Future Improvements

- Real-time collaboration using WebSockets or Yjs.
- Version history and document restoration.
- Richer DOCX formatting preservation.
- Document folders and organization.
- Production-grade registration and authentication.
- Comments and collaborative annotations.
- Export documents to PDF and DOCX.
- Advanced document search.

## Author

**Abhishree Bhardwaj**

Full-Stack Developer | B.Tech Information Technology

Ajaia Docs — Full-Stack Development Assignment

---

*Built with Next.js, TypeScript, TipTap, Prisma, and PostgreSQL.*