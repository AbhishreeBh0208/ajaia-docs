# Ajaia Docs — System Architecture

## 1. Overview

Ajaia Docs is a full-stack collaborative document management application built using Next.js, TypeScript, TipTap, Prisma ORM, and PostgreSQL.

The application follows a layered architecture in which the frontend communicates with backend API routes, which handle authentication, validation, authorization, and database operations.

The primary architectural objectives are:

- Provide a responsive document editing experience.
- Support persistent document storage.
- Enable controlled document sharing.
- Enforce role-based access control.
- Support importing existing text-based documents.
- Maintain a modular and maintainable application structure.

## 2. High-Level Architecture

The application consists of five logical layers:

1. Presentation Layer
2. Application and API Layer
3. Authentication and Authorization Layer
4. Data Access Layer
5. Database Layer

### Architecture Diagram

```text
                  CLIENT / BROWSER
                         |
                         v
               NEXT.JS APP ROUTER
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Dashboard      Document        Login
                      Editor
          |              |
          +--------------+
                         |
                         v
                  NEXT.JS API ROUTES
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
    Authentication   Validation    Authorization
          |              |              |
          +--------------+--------------+
                         |
                         v
                    PRISMA ORM
                         |
                         v
                   POSTGRESQL
```

## 3. Technology Architecture

| Component | Technology | Responsibility |
|---|---|---|
| Frontend framework | Next.js | Application routing and rendering |
| UI library | React | Interactive user interfaces |
| Programming language | TypeScript | Type safety |
| Styling | Tailwind CSS | Responsive styling |
| Rich-text editor | TipTap | Document editing |
| Backend | Next.js API Routes | Server-side application logic |
| ORM | Prisma | Database access |
| Database | PostgreSQL | Persistent storage |
| Authentication | jose | JWT session handling |
| Validation | Zod | Request validation |
| DOCX processing | Mammoth | Word document text extraction |
| Testing | Vitest | Automated unit testing |

## 4. Application Components

### 4.1 Authentication Module

The authentication module manages user sessions and protects application resources.

Responsibilities:

- Authenticate users through the login endpoint.
- Generate signed JWT session tokens.
- Store session tokens in HTTP-only cookies.
- Retrieve the currently authenticated user.
- Destroy sessions during logout.

The authentication implementation is located in:

`src/lib/auth.ts`

The application uses the `jose` library for JWT operations.

#### Authentication Flow

```text
User submits login credentials
            |
            v
POST /api/auth/login
            |
            v
Validate user account
            |
            v
Generate signed JWT
            |
            v
Set HTTP-only session cookie
            |
            v
User accesses protected routes
            |
            v
Verify session and retrieve user
```

The application also provides demo account switching for evaluation purposes.

### 4.2 Dashboard Module

The dashboard provides the main document management interface.

Responsibilities:

- Display documents owned by the current user.
- Display documents shared with the current user.
- Search documents by title.
- Filter documents by ownership and recent activity.
- Create new documents.
- Import external documents.
- Switch between demonstration accounts.
- Log out users.

The dashboard is implemented using:

- `src/app/dashboard/page.tsx`
- `src/components/dashboard/dashboard-client.tsx`

### 4.3 Document Editor Module

The document editor is implemented using TipTap, a headless rich-text editing framework.

Responsibilities:

- Display document content.
- Support rich-text formatting.
- Update document titles.
- Automatically save changes.
- Enforce read-only behavior for viewers.
- Provide document sharing controls to owners.

Supported formatting operations:

- Paragraphs
- Heading 1
- Heading 2
- Bold
- Italic
- Underline
- Bulleted lists
- Numbered lists

#### Autosave Workflow

The editor monitors document title and content changes.

```text
User edits document
        |
        v
React state updated
        |
        v
Debounce timer (800 ms)
        |
        v
PATCH /api/documents/[id]
        |
        v
Server authorization check
        |
        v
Prisma document update
        |
        v
PostgreSQL persistence
        |
        v
Saved status displayed
```

The debounce mechanism reduces unnecessary API requests while the user is actively typing.

### 4.4 Document Sharing Module

The sharing module enables document owners to collaborate with other registered users.

Responsibilities:

- Retrieve existing collaborators.
- Invite users through email addresses.
- Assign Editor or Viewer roles.
- Update collaborator permissions.
- Revoke document access.

The sharing interface is implemented inside the document editor, while the server-side operations are handled by:

`src/app/api/documents/[id]/shares/route.ts`

#### Sharing Workflow

```text
Document owner opens Share dialog
              |
              v
GET /api/documents/[id]/shares
              |
              v
Display current collaborators
              |
              v
Owner enters email and role
              |
              v
POST /api/documents/[id]/shares
              |
              v
Verify owner authorization
              |
              v
Find registered user
              |
              v
Create or update DocumentShare
              |
              v
Refresh collaborator list
```

Access revocation uses the DELETE endpoint and removes the corresponding document-user sharing relationship.

## 5. Authorization Architecture

Ajaia Docs implements role-based access control at the document level.

Three access roles are supported:

### Owner

The owner is the user who created the document.

Permissions:

- View document.
- Edit document.
- Rename document.
- Share document.
- Change collaborator roles.
- Revoke collaborator access.
- Delete document.

### Editor

An editor receives access through a document-sharing relationship.

Permissions:

- View document.
- Edit document.
- Rename document.

Restrictions:

- Cannot share the document.
- Cannot manage collaborators.
- Cannot delete the document.

### Viewer

A viewer receives read-only access.

Permissions:

- View document.

Restrictions:

- Cannot edit document content.
- Cannot rename the document.
- Cannot share the document.
- Cannot manage collaborators.
- Cannot delete the document.

### Permission Matrix

| Operation | Owner | Editor | Viewer |
|---|---|---|---|
| View | Yes | Yes | Yes |
| Edit content | Yes | Yes | No |
| Rename | Yes | Yes | No |
| Share | Yes | No | No |
| Manage collaborators | Yes | No | No |
| Delete | Yes | No | No |

### Authorization Implementation

The permission logic is maintained in:

`src/lib/permissions.ts`

The application uses:

- `getDocumentAccess()` to retrieve a document and the current user's access role.
- `canEdit()` to determine whether the user can modify a document.
- `canShare()` to determine whether the user can manage document sharing.

Authorization checks are performed server-side. Frontend restrictions are supplementary and are not treated as the security boundary.

## 6. Database Architecture

PostgreSQL is used as the persistent database, with Prisma ORM providing type-safe access.

The application uses three primary models.

### 6.1 User

Stores user account information.

| Field | Description |
|---|---|
| id | Unique user identifier |
| name | User's display name |
| email | User's email address |
| createdAt | Account creation timestamp |

Relationships:

- One user can own multiple documents.
- One user can receive access to multiple shared documents.

### 6.2 Document

Stores document information.

| Field | Description |
|---|---|
| id | Unique document identifier |
| title | Document title |
| content | TipTap JSON document content |
| ownerId | Identifier of the document owner |
| createdAt | Document creation timestamp |
| updatedAt | Last update timestamp |

Relationships:

- Each document belongs to one owner.
- Each document can have multiple sharing relationships.

The content field stores structured JSON rather than plain text, allowing the editor to preserve its supported formatting.

### 6.3 DocumentShare

Represents the relationship between a user and a shared document.

| Field | Description |
|---|---|
| id | Unique sharing record identifier |
| documentId | Referenced document |
| userId | Referenced user |
| role | VIEWER or EDITOR |
| createdAt | Sharing creation timestamp |

The document-user combination is unique, preventing duplicate sharing records for the same user and document.

### 6.4 ShareRole

The application defines two sharing roles through a Prisma enum:

- `VIEWER`
- `EDITOR`

Document ownership is represented through the `Document.ownerId` field rather than a separate sharing role.

### Entity Relationship Diagram

```text
             USER
       +---------------+
       | id            |
       | name          |
       | email         |
       | createdAt     |
       +---------------+
          |         |
          |         |
     owns |         | receives
          |         |
          v         v
      DOCUMENT   DOCUMENT_SHARE
    +-----------+ +----------------+
    | id        | | id             |
    | title     | | documentId     |
    | content   | | userId         |
    | ownerId   | | role           |
    | createdAt | | createdAt      |
    | updatedAt | +----------------+
    +-----------+         |
          ^               |
          +---------------+
```

## 7. API Architecture

The backend is implemented through Next.js Route Handlers.

### 7.1 Authentication Endpoints

| Method | Endpoint | Responsibility |
|---|---|---|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Retrieve current user |

### 7.2 Document Endpoints

| Method | Endpoint | Responsibility |
|---|---|---|
| GET | `/api/documents` | Retrieve accessible documents |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/[id]` | Retrieve individual document |
| PATCH | `/api/documents/[id]` | Update title or content |
| DELETE | `/api/documents/[id]` | Delete owned document |

### 7.3 Sharing Endpoints

| Method | Endpoint | Responsibility |
|---|---|---|
| GET | `/api/documents/[id]/shares` | Retrieve collaborators |
| POST | `/api/documents/[id]/shares` | Invite or update collaborator |
| DELETE | `/api/documents/[id]/shares` | Revoke collaborator access |

### 7.4 Import Endpoint

| Method | Endpoint | Responsibility |
|---|---|---|
| POST | `/api/documents/import` | Import TXT, MD, or DOCX documents |

The import endpoint uses multipart form data and creates a new document associated with the authenticated user.

## 8. Document Import Architecture

The import functionality supports three file formats:

- Plain Text (`.txt`)
- Markdown (`.md`)
- Microsoft Word (`.docx`)

### Import Processing Pipeline

```text
User selects a file
        |
        v
Upload using FormData
        |
        v
POST /api/documents/import
        |
        v
Authenticate current user
        |
        v
Validate extension and size
        |
        v
Extract file contents
        |
        +----------------------+
        |          |           |
        v          v           v
       TXT        MD          DOCX
        |          |           |
        v          v           v
   Plain Text  Markdown    Mammoth
    Parsing    Parsing    Extraction
        |          |           |
        +----------+-----------+
                   |
                   v
          TipTap JSON Conversion
                   |
                   v
          Create Document Record
                   |
                   v
             PostgreSQL
                   |
                   v
          Redirect to Editor
```

The import endpoint enforces a maximum file size of 5 MB.

Markdown parsing supports basic headings, paragraphs, and ordered and unordered lists.

DOCX processing uses Mammoth to extract readable text. Advanced Word formatting and embedded media are outside the current implementation scope.

## 9. Data Persistence and Autosave

The application uses Prisma Client to interact with PostgreSQL.

Document content is stored as structured JSON compatible with TipTap.

The editor uses a debounce interval of 800 milliseconds before sending update requests.

This approach provides:

- Persistent document content.
- Reduced API request frequency during typing.
- Automatic title updates.
- Consistent server-side authorization before persistence.

The database remains the source of truth for saved documents.

## 10. Testing Architecture

Vitest is used for automated testing.

The current test suite is located at:

`tests/permissions.test.ts`

It validates the permission utility functions.

### Current Test Coverage

| Test Case | Expected Result |
|---|---|
| Owner can edit | Pass |
| Editor can edit | Pass |
| Viewer cannot edit | Pass |
| Owner can share | Pass |
| Editor cannot share | Pass |
| Viewer cannot share | Pass |

Run tests using:

```bash
npm test
```

Current verified result: 6 tests passing.

The current suite focuses on authorization utility logic. API integration tests, import validation tests, and end-to-end browser tests are potential future extensions.

## 11. Security Considerations

The application incorporates several security-oriented design decisions:

- HTTP-only cookies for session token storage.
- Signed JWT session tokens.
- Server-side authentication checks.
- Server-side document authorization.
- Owner-only sharing management.
- Viewer restrictions enforced through API checks.
- File extension and size validation during import.
- Database-level unique constraints for document-sharing relationships.
- Environment variables for sensitive configuration.

### Production Considerations

Before public production use, additional hardening is recommended:

- Replace demo account switching with production-grade authentication.
- Add rate limiting to authentication and upload endpoints.
- Add stronger file-content and archive validation.
- Implement CSRF protections appropriate to the deployment model.
- Add session expiration and revocation policies.
- Validate imported content recursively before rendering.
- Add comprehensive integration and security tests.

## 12. Deployment Architecture

The intended deployment architecture uses:

| Service | Responsibility |
|---|---|
| Vercel | Next.js application hosting |
| Supabase | Managed PostgreSQL database |
| Prisma | Database access and migrations |

Production environment variables must be configured through the deployment platform rather than committed to source control.

The production database schema should be updated using:

```bash
npx prisma migrate deploy
```

A successful production build can be checked locally using:

```bash
npm run build
```

## 13. Current Scope and Future Enhancements

The current implementation provides document creation, editing, sharing, role-based authorization, automatic saving, and document importing.

Potential future enhancements include:

- Real-time multi-user editing.
- Live collaborator presence.
- Document version history.
- Comments and annotations.
- PDF and DOCX export.
- Richer Word document formatting preservation.
- Folder-based document organization.
- Advanced search and document discovery.
- Expanded automated integration testing.

## 14. Conclusion

Ajaia Docs demonstrates a full-stack document editing and collaboration architecture built around Next.js, TipTap, Prisma, and PostgreSQL.

The system combines a structured rich-text editing experience with persistent storage, authenticated access, document-level permissions, and file importing.

Its modular architecture provides a foundation for extending the application with real-time collaboration, document versioning, and additional productivity features.

---

**Project:** Ajaia Docs  
**Architecture:** Full-Stack Next.js Application  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Testing:** Vitest