# Resume Platform --- Product Requirements (Draft)

## 1. Product

A browser-based, AI-assisted resume editor. Users can create resumes
from scratch or upload an existing PDF, edit it in the browser, and
export the result as a PDF.

## 2. Resume creation and management

-   Support both blank/template-based creation and PDF upload.
-   Users can save multiple resume versions/variations.
-   Only one resume is actively edited at a time.
-   Initial templates should provide predictable, consistent rendering.

## 3. Browser editor

-   Simple, intuitive in-browser editing.
-   Edit text and common resume elements; add, delete, reorder and
    reposition sections or entries.
-   Preview changes before export.
-   Keep browser preview and exported PDF visually consistent.

## 4. PDF import and scope

-   Uploaded resumes should retain their original layout rather than
    being automatically remapped to a platform template.
-   Initial target: simple, single-column, text-based resumes similar to
    the supplied one-page reference resume.
-   Preserve layout and styling as closely as possible, including
    section order, alignment, spacing, fonts and hierarchy.
-   Support editable headings, paragraphs, bullets, dates and common
    resume entries.
-   Initial exclusions: scanned/image-only PDFs, complex multi-column
    layouts and resumes with intricate graphics.
-   PDF is an import/export format; use a structured internal resume
    representation for editing.

## 5. Accounts and authentication

-   Traditional username/password registration and login.
-   Logout.
-   Secure password hashing and authenticated access.
-   Keep each user's resumes and professional data isolated.

## 6. Professional profile data

-   Initial sources: LinkedIn and GitHub.
-   LinkedIn ingestion initially uses a manually run Playwright script;
    later replace it with an official API or another reliable, permitted
    method.
-   Keep ingestion replaceable: all sources map into a standardized
    profile-data structure.
-   Store imported data.
-   Users can manually add, edit or delete information, including
    experience, education, projects, skills, certifications and
    achievements.

## 7. AI assistant

Use the user's available professional context to: - Suggest or rewrite
the professional summary. - Analyze GitHub projects/repositories and
suggest 3--5 project-description bullets. - Identify relevant
technologies that may be missing from the resume. - Suggest improvements
to existing resume content.

AI suggestions must be shown to the user for review. Users can edit,
accept or reject them; nothing is inserted without confirmation.

## 8. Content quality and trust

-   Do not fabricate experience, skills, achievements or metrics.
-   Distinguish source/user-provided facts from generated wording and
    uncertain inferences.
-   Ask the user to verify uncertain technology or skill suggestions.
-   Avoid keyword stuffing and unnecessary jargon.
-   Follow good resume-writing and ATS practices.

## 9. Initial scope exclusions

-   No job-description analysis or job-specific resume tailoring.
-   No anonymous/IP-based identity; use username/password accounts.
-   No simultaneous editing of multiple resumes.
-   No hooks planned initially; revisit only if a concrete need arises.

## 10. Development approach

-   Develop using Claude Code with multiple agents.
-   Finalize requirements and architecture before defining `CLAUDE.md`,
    custom agents and skills.
-   Use Git branches/worktrees to isolate agent work and reduce
    conflicts.
-   Define agent responsibilities, file ownership, interfaces and
    integration during architecture planning.
-   Introduce orchestration and automation only when justified.

## 11. Reference

The supplied one-page resume PDF is the initial import/editing test
case. Its simple, single-column, text-heavy structure defines the first
supported layout target.

## 12. Next step

Finalize remaining functional and non-functional requirements, then
design the system architecture. Technology choices and the Claude Code
agent setup follow architecture decisions.
