# Resume Platform — Shared Contracts

**Status:** Draft v0.1  
**Purpose:** Define the shared data and module boundaries implementation agents must follow.  
**Based on:** `docs/requirements.md` and `docs/architecture.md`.

This is an interface-level contract, not a finalized MongoDB schema or complete REST API specification. Details marked **Open** must be decided before the dependent implementation begins. Proposed conventions below are recommendations for the orchestrator to confirm.

---

## 1. Shared Rules

1. The structured resume document is the canonical source of truth. PDF is an import/export format, not the internal document format.
2. Resume content remains semantic when its visual order, position or formatting changes.
3. LinkedIn and GitHub adapters normalize source data before returning it to the application. Other modules must not depend on provider-specific response formats.
4. Imported information must retain provenance. Imported, user-entered, user-confirmed and AI-generated information must not be silently treated as equivalent.
5. AI output is a suggestion. Generating a suggestion must never modify a resume; only explicit user acceptance may apply it.
6. Every user's resumes, profile data and files must be isolated from other users.
7. Validate data at system boundaries: browser/API, external providers, PDF processing and LLM output.
8. Agents must not independently redefine shared types, field meanings or interfaces. Propose changes to the orchestrator.

### Recommended cross-cutting conventions

- Use stable, unique IDs for persisted entities and editable resume elements. Never use array positions or display names as IDs.
- Include a schema version in persisted structured documents so later changes can be managed deliberately.
- Use a consistent machine-readable timestamp format; **UTC is the proposed standard**.
- For authenticated requests, derive the acting user from the authenticated principal. Do not trust a client-supplied `owner_id` as proof of ownership.

The exact ID representation and timestamp serialization are **Open** until implementation conventions are confirmed.

## 2. `ResumeDocument`

### Purpose

Represents one saved resume variation. It must support blank/template creation, supported PDF reconstruction, semantic content, stable element IDs, formatting/layout metadata and independent recovery of multiple variations.

Only one resume is actively edited at a time in the initial product. Each saved variation remains a distinct document.

### Conceptual shape

Illustrative only; this is not the finalized schema:

```json
{
  "schema_version": "1",
  "id": "resume-id",
  "owner_id": "user-id",
  "name": "Software Engineer Resume",
  "content": {
    "sections": [
      {
        "id": "section-id",
        "type": "summary",
        "title": "Professional Summary",
        "elements": [
          {
            "id": "element-id",
            "type": "paragraph",
            "content": { "text": "Resume content goes here." },
            "formatting": {},
            "layout": {},
            "provenance": []
          }
        ]
      }
    ]
  },
  "presentation": {
    "page_size": "A4",
    "theme": {},
    "layout": {}
  },
  "created_at": "UTC timestamp",
  "updated_at": "UTC timestamp"
}
```

### Required capabilities

- Support semantic section types for summary, experience, education, projects, skills, certifications, achievements and custom sections.
- Do not assume every resume has every section or that every section has the same entry shape.
- Keep content, formatting and layout as distinct concerns:
  - **Content:** headings, paragraphs, bullets, dates, links and structured entry information.
  - **Formatting:** typography, emphasis, color, alignment and other supported text styling.
  - **Layout:** section order, spacing, positioning metadata and page settings.
- Preserve stable element IDs across normal edits and reordering.
- Store enough semantic and presentation information for the browser editor and PDF export pipeline to render the same document consistently.

**Open:** Exact field types, element kinds, formatting properties, layout coordinate model, page-break representation, reflow algorithm and element-locking behavior.

## 3. `ProfessionalProfile` and Provenance

### Purpose

Represents the user's normalized professional information, independently of any particular resume variation.

It must be able to represent:

- Basic profile and contact details.
- Experience and education.
- Projects.
- Skills and technologies.
- Certifications and achievements.
- Source records and provenance.

### Normalization rules

- Manual input, LinkedIn and GitHub data map into common application-level concepts.
- Provider-specific objects stay inside their adapter/source-record boundary.
- Missing information remains missing; do not invent values to complete a record.
- Conflicting values from different sources must not be silently merged into a verified fact.
- Users can manually add, edit and delete professional information.
- Imported information remains distinguishable from information reviewed or confirmed by the user.
- A GitHub repository can provide evidence for a project suggestion; it is not automatically a confirmed achievement, work experience or skill claim.

### Provenance must answer

- Source: manual input, LinkedIn, GitHub, PDF import or AI-assisted wording.
- Source record/import reference, where applicable.
- Whether the user has reviewed or confirmed the information.
- Import or generation time, where relevant.

**Open:** Exact field names, source/verification enums, conflict-resolution rules and merge behavior.

## 4. Source Integration Contract

LinkedIn and GitHub are separate adapters. Both return data usable by the common profile-management layer.

### Common import result

At the logical level, an import result contains:

- Source/provider identifier.
- Import status.
- Normalized profile records and/or source records.
- Provenance for returned records.
- Warnings, skipped information and errors, where relevant.
- A reference to the import operation for later inspection.

Slow imports may run asynchronously. **Open:** Exact status lifecycle, retries and queue mechanism.

### LinkedIn adapter

- Initial direction: a manually run Python Playwright script, using a reliable and permitted access method.
- Extract available professional profile information and map it into the common profile contract.
- Do not own the database schema, REST API, authentication or resume editing.
- Do not bypass access controls or report unavailable information as successfully imported.

### GitHub adapter

- Use the GitHub API.
- Return available profile information and repository context useful for project analysis, such as repository identity, description, topics and languages.
- Preserve source context for repository-derived technologies and claims. Do not automatically label them user-confirmed skills or achievements.
- Do not own the database schema, REST API, authentication or resume editing.

Both adapters return normalized results; the backend/profile layer handles application workflows and persistence.

## 5. AI Suggestion Contract

### Initial suggestion types

- Professional summary creation or rewriting.
- Project-description bullets based on GitHub repository context.
- Potentially relevant technologies that may be missing from a resume.
- Improvements to existing resume content.

Job-description analysis and job-specific tailoring are outside the initial scope.

### Suggestion result

Conceptually, a suggestion contains:

- Suggestion ID and target resume ID.
- Target element ID, when it applies to an existing element.
- Suggestion type and proposed text/structured content.
- Brief rationale, where useful.
- Supporting source references, where available.
- Uncertainty or user-verification indication.
- Review status.

### Apply/reject rules

- Generation does not mutate the resume.
- The user can review, edit, accept or reject each suggestion.
- Only explicit acceptance applies suggested content.
- Applying a suggestion goes through the backend resume-management workflow, including validation, ownership checks and persistence.
- Rejection does not alter the resume.
- Never fabricate qualifications, experience, skills, achievements or metrics. Do not present uncertain inference as established fact.

**Open:** Exact suggestion schema, review-state enum, LLM output schema and model metadata.

## 6. PDF Import/Export Contract

### Import boundary

```text
Uploaded PDF
    -> text/layout extraction
    -> resume structure reconstruction
    -> ResumeDocument
    -> browser editor for user correction
```

The importer should preserve available text, section order, hierarchy, alignment, spacing, fonts and other supported layout details as closely as practical. It must report reconstruction warnings or unsupported content rather than silently discarding important information.

Initial supported target: simple, single-column, text-based resumes similar to the supplied one-page reference. Scanned/image-only PDFs, complex multi-column layouts and resumes with intricate graphics are outside the initial scope.

### Export boundary

The exporter receives a `ResumeDocument` and produces a PDF. Browser preview and exported PDF must use the same underlying document model and remain visually consistent. Target page size is A4.

The PDF module owns extraction, reconstruction and PDF generation. It does not own the canonical resume schema, accounts, MongoDB persistence or browser editor. It must consume/produce the agreed `ResumeDocument`, not create a separate resume format.

**Open:** Parsing/reconstruction libraries, supported formatting subset, rendering implementation and exact import/export payloads.

## 7. REST API Contract

The backend exposes application capabilities through APIs consumed by the frontend. Resource areas in scope:

- Authentication: registration, login and logout.
- Resume management: create, retrieve, update, save and manage resume variations.
- Professional profile: retrieve and manage normalized user information.
- Profile imports: initiate or inspect LinkedIn/GitHub imports.
- PDF: initiate import and request export.
- AI assistant: request suggestions and accept/reject suggestions.

### API rules

- Use structured request/response data and validate requests at the API boundary.
- Protected endpoints require authentication.
- Derive the acting user from the authenticated principal and check ownership for each user-owned resource.
- Keep API payloads independent of MongoDB's internal representation.
- Do not expose secrets, password hashes, provider credentials or internal stack traces.
- Return errors that allow the frontend to distinguish validation, authentication/authorization, missing-resource, conflict and unexpected server failures.

Illustrative error shape only; exact fields and status codes remain open:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The supplied resume data is invalid.",
    "details": []
  }
}
```

**Open:** Endpoint paths, HTTP methods, exact payloads, response envelopes, status codes and session/token implementation.

These API details must be agreed before frontend and backend agents implement the same workflow in parallel.

## 8. Persistence and Module Ownership

Initial logical MongoDB data areas:

- `users`: account and authentication data.
- `resumes`: structured resume content, layout metadata and resume metadata.
- `professional_profiles`: normalized professional information.
- `profile_imports`: source, import history and processing status.

PDF binaries and other uploaded/exported files use file/object storage rather than being embedded as large binary values in MongoDB.

The database layer owns MongoDB-specific schemas, indexes and persistence operations. **Proposed boundary:** other modules use defined backend/data-access interfaces rather than independently querying collections or duplicating persistence logic.

Multiple resume variations must remain independently recoverable. **Open:** Whether this uses separate documents, revision snapshots or another persistence strategy.

| Module | Owns | Interface responsibility |
|---|---|---|
| Frontend | Editor UI, browser interactions, document preview and AI suggestion review | Consumes backend APIs and resume/suggestion data |
| Backend/API | Application workflows, authentication, authorization, resume/profile services and AI orchestration | Coordinates modules through agreed interfaces |
| Database | MongoDB schemas, indexes and persistence | Persists application entities through backend/data-access interfaces |
| LinkedIn integration | LinkedIn-specific retrieval and normalization | Returns normalized profile/import data |
| GitHub integration | GitHub API retrieval and repository normalization | Returns normalized profile and repository context |
| PDF processing | PDF extraction, reconstruction and export | Converts between PDF files and `ResumeDocument` |
| Contract Auditor | Independent contract-compatibility review | Reports inconsistencies; does not edit or implement |
| Code Reviewer | Independent implementation/quality review | Reports findings; does not edit or implement |
| Documentation Engineer | Documentation inside `docs/` | Documents verified changes and approved decisions; does not modify source code or redefine contracts |

The orchestrator owns approval of changes to shared contracts. Agents may propose changes, but must not independently redefine interfaces used by other modules.

## 9. Contract Change Process

1. An agent identifies a limitation or incompatibility and reports the affected contract, reason and proposed change to the orchestrator.
2. The orchestrator checks dependent modules and involves the user when the change affects a significant product or architectural decision.
3. Once approved, update this document and identify affected implementations/tests.
4. Update dependent modules and tests together.
5. Update documentation to reflect the approved contract and verified implementation.

Do not silently change shared types, field meanings, API payloads or persistence assumptions.

## 10. Open Decisions Summary

The following remain undecided and must not be treated as settled by agents:

- Exact `ResumeDocument` and `ProfessionalProfile` schemas and field types.
- Element kinds, formatting properties, layout coordinates, reflow, pagination and locking behavior.
- Resume variation and revision-history persistence strategy.
- Import conflict resolution, provenance fields and verification states.
- Detailed LinkedIn/GitHub payloads and import lifecycle.
- REST endpoint paths, methods, payloads, response/status conventions and authentication mechanism.
- PDF libraries and supported formatting subset.
- File/object storage provider and file-reference format.
- Background job lifecycle, retries and queue technology.
- LLM provider/model, suggestion schema and structured-output validation.

Resolve decisions incrementally, before the dependent implementation begins. Do not finalize unrelated details merely to make this document appear complete.
