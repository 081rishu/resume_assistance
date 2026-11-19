# Resume Platform --- Initial Product Decisions

## Product

An AI-powered, browser-based resume editor. Users can create resumes
from scratch or upload an existing PDF, edit it interactively, use AI
suggestions, and export the result as a PDF.

## Editing experience

-   Editing should be simple and intuitive in the browser.
-   Target interaction: select and edit text, add/delete content or
    sections, and reposition elements.
-   PDFs are an import/export format, not the canonical editing format.
-   Maintain an internal structured resume representation and render it
    in the browser.
-   Prioritize predictable, accurate PDF output. Start with controlled
    templates if unrestricted PDF reconstruction is unreliable.

## Resume creation and versions

-   Support both creating a resume from scratch and importing an
    existing PDF.
-   Users may save multiple resume variations (for example, general,
    AI/ML, or backend versions).
-   Only one resume is actively edited at a time.

## User data and sources

-   Initial external sources: LinkedIn and GitHub.
-   LinkedIn: begin with a manually run Playwright script; later replace
    it with an official API or another reliable, permitted method.
-   Keep data ingestion replaceable: the rest of the application
    consumes a standardized profile-data structure, regardless of
    source.
-   Store imported profile data.
-   Users can manually add or correct any information, including
    education, experience, certifications, achievements, and missing
    fields.

## AI assistant

The assistant uses the user's available professional context to: -
Suggest or rewrite the professional summary. - Analyze project
links/repositories and suggest 3--5 resume bullets per project. -
Identify relevant technologies/tech stacks that may be missing from the
resume. - Help improve clarity and resume quality.

AI output must be presented for user review and confirmation before
being inserted. Users can edit suggestions before accepting them.

## Content quality and trust

-   Never fabricate experience, skills, achievements, or metrics.
-   Distinguish user-provided/imported facts from AI-generated wording
    and unverified inferences.
-   Do not add technologies based only on popularity or weak evidence;
    ask the user to verify uncertain suggestions.
-   Avoid keyword stuffing and unnecessary jargon.
-   Follow good resume-writing and ATS practices.

## Initial scope exclusions

-   No job-description analysis or job-specific resume tailoring for the
    initial version.
-   No need for multiple simultaneous editing sessions.
-   Hooks are not currently required; reconsider only if a concrete need
    emerges.

## Development approach

-   Use Claude Code with multiple agents to develop the project.
-   Finalize requirements and project architecture before defining
    `CLAUDE.md`, custom agents, or skills.
-   Use Git branches/worktrees to isolate agents' work and reduce
    conflicts.
-   Decide agent responsibilities, file ownership, interfaces, and
    integration approach during architecture planning.
-   Keep the initial implementation practical; introduce additional
    orchestration or automation only when justified.
