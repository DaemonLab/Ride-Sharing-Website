---
name: understand-anything
description: >-
  Deep codebase comprehension and architectural analysis skill. Use this skill when asked to explain, analyze, map dependencies, understand system architecture, trace data flows, or perform comprehensive code auditing across any repository.
---

# Understand Anything — Code Comprehension Skill

This skill provides a systematic, multi-dimensional methodology for understanding any codebase quickly, accurately, and thoroughly.

---

## Analysis Methodology

When invoked with `/understand` or when performing broad architectural analysis, follow these 5 pillars:

### 1. Structural Mapping
- Map the high-level project layout (root directories, core entry points, modules, build tools, package declarations).
- Identify framework primitives (e.g., Express/Next.js/React, Prisma/ORM, Socket.IO, State management).
- Classify files into functional layers: Presentation, API/Route, Business/Domain, Data Access, Infrastructure.

### 2. Contract & Schema Inspection
- Inspect authoritative source schemas first (`schema.prisma`, `openapi.yaml`, interface definitions, types).
- Verify type relationships, database keys, indices, and foreign key relations.
- Audit API boundary contracts between client payloads and server request handlers.

### 3. Data Flow Tracing
- Trace end-to-end user actions from UI trigger -> HTTP API / Socket event -> Middleware -> Controller -> Model / DB -> Response.
- Identify state mutations, session handling, authentication guards, and transaction boundaries.

### 4. Code Quality & Gap Auditing
- Identify dead code, parallel duplicate implementations (`.js` vs `.ts` stubs), broken import chains.
- Detect missing error handling, unhandled edge cases, or broken start/build scripts.
- Audit test suites for coverage, environment configuration, and test isolation.

### 5. Synthesis & Actionable Planning
- Produce concise, clear architectural summaries with mermaid flow diagrams where beneficial.
- Categorize findings into:
  - **Core Strengths**: Clean abstractions already in place.
  - **Critical Deficiencies**: Broken scripts, vulnerabilities, contract mismatches.
  - **Recommended Migration Plan**: Prioritized step-by-step resolution strategy.

---

## Execution Checklist

- [ ] Read entry points (`index.ts`, `server.ts`, `app.ts`, `main.tsx`).
- [ ] Inspect package configuration (`package.json`, `tsconfig.json`, build manifests).
- [ ] Inspect database schema (`schema.prisma`, SQL migrations, ORM models).
- [ ] Map API routes and Socket event handlers.
- [ ] Synthesize findings into clear Markdown artifacts.
