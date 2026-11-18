# Ajaia Docs — AI Development Workflow

## 1. Introduction

Ajaia Docs was developed using an AI-assisted engineering workflow in which AI tools were used to accelerate implementation, explore technical approaches, troubleshoot issues, and improve development efficiency.

The development process combined AI-assisted problem solving with manual implementation, code inspection, debugging, and testing.

AI was treated as a development assistant rather than an autonomous replacement for engineering decisions.

The primary objectives of this workflow were:

- Accelerate development within the assignment time constraints.
- Explore implementation approaches for full-stack features.
- Improve code quality and maintainability.
- Identify and resolve development errors.
- Validate application behavior through manual and automated testing.

## 2. AI-Assisted Development Approach

The development workflow followed an iterative process:

```text
       Define Feature Requirement
                 |
                 v
        Analyze Technical Approach
                 |
                 v
        AI-Assisted Implementation
                 |
                 v
          Integrate Into Project
                 |
                 v
          Run and Debug Locally
                 |
                 v
          Validate Functionality
                 |
                 v
          Refine Implementation
```

Each feature was implemented and evaluated independently before proceeding to the next development milestone.

## 3. Areas Where AI Assistance Was Used

### 3.1 Project Architecture and Planning

AI assistance was used to explore the application structure and identify the responsibilities of individual components.

This included planning:

- Next.js App Router organization.
- Frontend and backend responsibilities.
- Database models and relationships.
- Authentication and authorization flow.
- API endpoint structure.
- Document editing and persistence.
- Document sharing and import workflows.

The resulting architecture was reviewed and adapted to the existing project structure.

### 3.2 Frontend Development

AI assistance supported the implementation and refinement of React and Next.js components.

Areas included:

- Dashboard layout and navigation.
- Document editor interface.
- TipTap toolbar integration.
- Document sharing dialog.
- Collaborator management.
- File import controls.
- Loading and error states.

Generated implementation suggestions were integrated into the project and checked against the existing component behavior.

### 3.3 Backend Development

AI assistance was used to develop and refine Next.js API route handlers.

This included:

- Authentication endpoints.
- Document creation and retrieval.
- Document updates and deletion.
- Sharing and permission management.
- File import processing.
- Request validation and error handling.

Special attention was given to server-side authorization, ensuring that access restrictions were not dependent only on frontend controls.

### 3.4 Database Design

AI assistance supported the design and review of the Prisma data model.

The main entities were:

- User
- Document
- DocumentShare

The implementation uses PostgreSQL for persistent storage and Prisma ORM for database operations.

The schema and relationships were reviewed during implementation to support document ownership and collaborator access.

### 3.5 Debugging and Troubleshooting

AI assistance was particularly useful during environment setup and integration debugging.

Issues encountered included:

- Prisma Client generation and Windows file-locking errors.
- PostgreSQL connection configuration.
- Next.js Cache Components compatibility.
- Route-handler configuration issues.
- TypeScript type mismatches involving Prisma JSON fields.
- Vitest and ES module configuration compatibility.

The debugging process involved examining terminal errors, identifying the underlying issue, applying targeted changes, and rerunning the relevant commands.

## 4. Feature-Specific AI Assistance

### Document Editing

AI assistance supported the integration of TipTap with React and the implementation of:

- Rich-text formatting.
- Heading controls.
- Lists.
- Automatic saving.
- Document title updates.

The editor was manually tested to verify that formatting actions worked and document changes persisted.

### Document Sharing

AI assistance supported the development of the collaborator management workflow.

This included:

- Retrieving collaborators.
- Inviting registered users.
- Assigning Editor and Viewer roles.
- Updating existing permissions.
- Revoking access.

The resulting functionality was tested using the seeded demonstration accounts.

### Document Import

AI assistance supported the implementation of the file-import pipeline.

Supported formats:

- TXT
- Markdown
- DOCX

The workflow uses Mammoth for DOCX text extraction and converts imported content into TipTap-compatible JSON.

Import validation includes file-extension checks, empty-file checks, and a 5 MB file-size limit.

## 5. Human Review and Engineering Decisions

AI-generated suggestions were not accepted without evaluation.

The development process involved manually reviewing:

- Component integration.
- API request and response handling.
- Authentication behavior.
- Permission enforcement.
- Database operations.
- Error handling.
- TypeScript compatibility.

Engineering decisions were made based on the existing application architecture, assignment scope, implementation complexity, and available development time.

The developer remained responsible for integrating, running, debugging, and validating the application.

## 6. Testing and Validation

AI-assisted implementation was followed by manual and automated validation.

### Manual Validation

The following workflows were tested:

- Demo account authentication.
- Document creation.
- Document editing.
- Rich-text formatting.
- Automatic saving.
- Document sharing.
- Permission updates.
- Access revocation.
- TXT, Markdown, and DOCX importing.

### Automated Testing

Vitest was used to test the document permission utility functions.

Current automated test results:

| Test | Result |
|---|---|
| Owner can edit | Passed |
| Editor can edit | Passed |
| Viewer cannot edit | Passed |
| Owner can share | Passed |
| Editor cannot share | Passed |
| Viewer cannot share | Passed |

**Total: 6 automated tests passing.**

Command used:

```bash
npm test
```

## 7. Tools Used

| Tool | Purpose |
|---|---|
| ChatGPT | Architecture exploration, implementation assistance, debugging, and documentation |
| Visual Studio Code | Development environment and code editing |
| Next.js | Full-stack application framework |
| TypeScript | Application implementation |
| Prisma | Database access and schema management |
| PostgreSQL / Supabase | Persistent data storage |
| TipTap | Rich-text editing |
| Vitest | Automated testing |
| Git and GitHub | Source control and project management |

## 8. Development Principles

The AI-assisted workflow followed these principles:

**Incremental implementation:** Features were implemented in manageable stages rather than generating the entire application at once.

**Context-aware integration:** Existing code and project structure were considered before modifying components.

**Error-driven debugging:** Terminal errors and application behavior were used to guide troubleshooting.

**Human validation:** Generated code was integrated and tested in the local development environment.

**Security awareness:** Authentication and document authorization were treated as backend responsibilities.

**Transparency:** AI assistance was used to support development, while implementation decisions and validation remained the developer's responsibility.

## 9. Limitations and Future Improvements

The current workflow and application have several opportunities for improvement:

- Expand automated tests to cover API integration and file-import validation.
- Introduce end-to-end browser testing.
- Add static analysis and automated code-quality checks to the development pipeline.
- Implement real-time collaborative editing.
- Improve document import fidelity.
- Add automated security testing.
- Introduce continuous integration and deployment checks.

## 10. Conclusion

AI-assisted development helped accelerate the implementation of Ajaia Docs across frontend development, backend engineering, database integration, debugging, and documentation.

The project demonstrates an iterative engineering workflow in which AI assistance is combined with developer judgment, direct code integration, manual verification, and automated testing.

The goal was not simply to generate code quickly, but to use AI effectively while maintaining an understanding of the application's architecture, behavior, and technical decisions.

---

**Project:** Ajaia Docs  
**Development Approach:** AI-Assisted Full-Stack Engineering  
**Primary Stack:** Next.js, TypeScript, TipTap, Prisma, PostgreSQL  
**Testing Framework:** Vitest