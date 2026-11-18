# Ajaia Docs — Submission Guide

## 1. Project Overview

**Project:** Ajaia Docs  
**Category:** AI-Native Full Stack Development Assignment  
**Application Type:** Collaborative document editor

Ajaia Docs is a lightweight, Google Docs-inspired document editor built with Next.js, TypeScript, TipTap, Prisma, and PostgreSQL.

The application allows users to create, edit, organize, import, and share documents. It includes authentication, role-based access control, automatic saving, and document collaboration through shared access.

## 2. Implemented Features

| Feature | Status |
|---|---|
| Demo-user authentication | Implemented |
| Session-based authentication using JWT | Implemented |
| Document creation | Implemented |
| Document listing and dashboard | Implemented |
| Rich-text editing with TipTap | Implemented |
| Headings, bold, italic, underline | Implemented |
| Bulleted and numbered lists | Implemented |
| Automatic document saving | Implemented |
| Document title editing | Implemented |
| Document sharing by email | Implemented |
| Viewer and Editor permissions | Implemented |
| Collaborator management | Implemented |
| Revoke document access | Implemented |
| TXT, Markdown, and DOCX import | Implemented |
| Permission-related automated tests | Implemented |
| Real-time simultaneous editing | Not implemented |
| Production deployment | Pending |

## 3. Technology Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Rich-text editor:** TipTap
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 6
- **Authentication:** JWT sessions using `jose`
- **Validation:** Zod
- **DOCX processing:** Mammoth
- **Testing:** Vitest

## 4. Local Setup Instructions

### Prerequisites

- Node.js and npm
- PostgreSQL database or Supabase project
- Git

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ajaia-docs
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="YOUR_SUPABASE_SESSION_POOLER_CONNECTION_STRING"
SESSION_SECRET="YOUR_GENERATED_SECRET"
```

Do not commit `.env` or expose database credentials.

### Database setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

For a fresh local development database where migrations need to be created, use:

```bash
npx prisma migrate dev
```

Seed the demo accounts if the database has not already been seeded:

```bash
npx prisma db seed
```

### Run the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Demo Accounts

The application includes the following seeded demo users:

| Name | Email |
|---|---|
| Alex Morgan | alex@ajaia.demo |
| Jordan Lee | jordan@ajaia.demo |
| Taylor Smith | taylor@ajaia.demo |

Use the demo account selector on the login screen.

## 6. Automated Testing

The project uses Vitest for permission logic testing.

Run:

```bash
npm test
```

The current permission test suite covers:

1. Owners can edit documents.
2. Editors can edit documents.
3. Viewers cannot edit documents.
4. Owners can share documents.
5. Editors cannot share documents.
6. Viewers cannot share documents.

**Latest recorded test result:** 1 test file passed, 6 tests passed.

## 7. API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Authenticate a demo user |
| `/api/auth/logout` | POST | End the current session |
| `/api/auth/me` | GET | Retrieve the current user |
| `/api/documents` | GET | List accessible documents |
| `/api/documents` | POST | Create a document |
| `/api/documents/[id]` | GET | Retrieve a document |
| `/api/documents/[id]` | PATCH | Update document content or title |
| `/api/documents/[id]` | DELETE | Delete an owned document |
| `/api/documents/[id]/shares` | GET | Retrieve sharing information |
| `/api/documents/[id]/shares` | POST | Invite a collaborator or update their role |
| `/api/documents/[id]/shares` | DELETE | Revoke collaborator access |
| `/api/documents/import` | POST | Import a supported document |

## 8. Permission Model

Ajaia Docs uses three access levels:

- **Owner:** Full document control, including editing, sharing, and deletion.
- **Editor:** Can view and modify document content.
- **Viewer:** Can view the document but cannot modify it.

Access is validated on the server through authenticated API requests rather than relying only on frontend restrictions.

## 9. Deployment Checklist

Complete these steps before submitting the project:

- [ ] Push the final source code to GitHub.
- [ ] Verify `.env` is excluded from Git.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Configure the production Supabase database.
- [ ] Add `DATABASE_URL` and `SESSION_SECRET` to Vercel environment variables.
- [ ] Apply production migrations.
- [ ] Seed demo accounts if required.
- [ ] Deploy the application to Vercel.
- [ ] Test login and logout on the deployed URL.
- [ ] Test document creation and automatic saving.
- [ ] Test sharing with Editor and Viewer accounts.
- [ ] Test document import.
- [ ] Verify that unauthorized users cannot edit or access restricted documents.
- [ ] Record the project walkthrough.
- [ ] Add the GitHub repository, deployed URL, and walkthrough link to the final submission.

## 10. Submission Links

Complete the following fields once deployment and recording are finished.

- **GitHub Repository:** `<ADD_GITHUB_URL>`
- **Live Application:** `<ADD_VERCEL_DEPLOYMENT_URL>`
- **Walkthrough Video:** `<ADD_VIDEO_URL>`

## 11. Known Limitations

The current implementation supports document sharing and role-based access, but does not provide live simultaneous editing or real-time cursor synchronization.

The application currently uses demo-user authentication rather than a complete public registration and password-management workflow.

These limitations can be addressed in future iterations.

## 12. Conclusion

Ajaia Docs demonstrates full-stack application development through a document management workflow involving authentication, database persistence, rich-text editing, document sharing, role-based permissions, file importing, and automated testing.

The project was developed with an emphasis on maintainable architecture, server-side permission enforcement, and a functional end-to-end user experience.

---

**Project:** Ajaia Docs  
**Developer:** Abhishree Bhardwaj  
**Repository:** `<YOUR_GITHUB_REPOSITORY_URL>`