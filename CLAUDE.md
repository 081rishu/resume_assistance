# CLAUDE.md

## 1. Project Overview

This project is a browser-based, AI-assisted resume editor.

Users should be able to:
- Create resumes from scratch using templates.
- Upload existing PDFs and edit their content while preserving the original layout as closely as possible.
- Maintain multiple resume variations and edit one at a time.
- Import professional information from LinkedIn and GitHub.
- Manually add, edit and delete their professional information.
- Use an AI assistant to improve resume content through suggestions that require explicit user approval.

The product should prioritize usability, reliable document editing, professional presentation and trustworthy AI-generated content.

## 2. Source of Truth

Before implementing anything, consult:

- `docs/requirements.md` — product scope and functional requirements.
- `docs/architecture.md` — architecture, technical direction and design decisions.
- `docs/contracts.md` — shared interfaces and data contracts, once established.

These documents define the agreed project direction.

Rules:
- Do not silently contradict documented requirements or decisions.
- Do not treat proposed technologies as finalized selections.
- If requirements conflict or an important decision is missing, raise it with the orchestrator.
- Do not invent requirements or expand product scope without approval.
- Update documentation when approved decisions materially change.

## 3. Core Engineering Principles

- Prefer simple, maintainable and well-tested solutions.
- Avoid premature abstraction and unnecessary infrastructure.
- Start with a modular monolith rather than microservices.
- Keep the backend Python-first and use TypeScript for browser-facing functionality where appropriate.
- Preserve semantic resume data independently of its visual presentation.
- Treat the structured resume document as the source of truth, not the PDF.
- Keep integrations modular and replaceable.
- Validate external data before using or persisting it.
- Prefer deterministic logic for operations that require predictable results.
- Handle errors explicitly rather than silently ignoring them.

## 4. Product and Data Integrity

Resume content must remain trustworthy.

- Never fabricate qualifications, experience, skills, achievements or metrics.
- Preserve the distinction between user-provided information, imported information and AI-generated wording.
- Identify uncertain inferences and ask the user to verify them.
- AI suggestions must never modify a resume without explicit user approval.
- Preserve source information and provenance where applicable.
- Do not introduce job-description analysis or job-specific tailoring into the initial scope.

## 5. Architecture Boundaries

Keep responsibilities separated:

- **Frontend:** Resume editor, document rendering, user interactions and AI assistant interface.
- **Backend/API:** Authentication, application logic, resume management, AI orchestration and service integration.
- **Database:** Persistence, schemas, indexes and data access.
- **LinkedIn integration:** LinkedIn-specific extraction and normalization.
- **GitHub integration:** GitHub API integration and repository analysis.
- **PDF processing:** PDF extraction, reconstruction, import and export.

Integrations must return normalized data structures rather than exposing source-specific formats to unrelated modules.

Do not introduce direct cross-module dependencies without a clear reason.

## 6. Shared Contracts

Shared contracts define how independently developed modules communicate.

Examples include:
- Resume document structure.
- Normalized professional profile structure.
- Database-facing interfaces.
- REST API request and response formats.
- LinkedIn and GitHub integration outputs.
- PDF import/export interfaces.

Rules:
- Follow the agreed contracts in `docs/contracts.md`.
- Do not independently redefine shared schemas or interfaces.
- If a contract is insufficient, report the problem to the orchestrator with a proposed change.
- Obtain approval before changing a shared contract.
- Update dependent modules and tests when an approved contract changes.

## 7. Multi-Agent Development

The main Claude Code session acts as the orchestrator.

It is responsible for:
- Planning and task decomposition.
- Maintaining shared contracts.
- Assigning tasks and coordinating agents.
- Resolving conflicts and architectural questions.
- Reviewing integration results.
- Keeping implementation aligned with requirements.

Specialized agents:

### Implementation agents
1. Database Engineer
2. Backend/API Engineer
3. Frontend Engineer
4. LinkedIn Integration Engineer
5. GitHub Integration Engineer
6. PDF Engineer

Each implementation agent must:
- Work within its assigned responsibility.
- Respect shared contracts.
- Avoid modifying another agent's owned modules without approval.
- Keep changes focused on its assigned task.
- Report blockers and proposed contract changes to the orchestrator.

### Review agents
7. Contract Auditor
8. Code Reviewer

Review agents must independently inspect and report findings. They must not implement fixes or modify project files.

### Documentation agent
9. Documentation Engineer

The Documentation Engineer:
- Can inspect the entire codebase.
- Can create and edit documentation only inside `docs/`.
- Must document verified implementation and approved decisions.
- Must not modify source code or shared contracts.
- Must report missing information rather than inventing it.

## 8. Agent Coordination and Git

- Use separate Git worktrees for implementation agents working independently.
- Do not launch every agent simultaneously.
- Parallelize only tasks that have sufficiently clear boundaries and interfaces.
- Establish shared contracts before parallel implementation.
- Do not assume changes in one worktree automatically appear in another.
- The orchestrator is responsible for inspecting and integrating agent changes.
- Do not overwrite, discard or reset another agent's work without explicit coordination.
- Run relevant tests after integration.

## 9. Code Quality

All implementation work should follow these expectations:

- Use clear names and consistent project conventions.
- Keep functions and modules focused.
- Avoid unnecessary duplication.
- Validate inputs at system boundaries.
- Handle expected failure cases.
- Add tests for new functionality and important edge cases.
- Avoid unrelated refactoring.
- Do not introduce dependencies without justification.
- Never commit secrets, credentials or personal data.
- Do not claim tests passed unless they were actually executed.

## 10. Development Workflow

For each substantial task:

1. Inspect the relevant requirements, architecture, contracts and existing implementation.
2. Identify the responsible module and agent.
3. Confirm dependencies and interfaces.
4. Implement the smallest complete solution.
5. Run relevant tests and checks.
6. Request independent review when appropriate.
7. Resolve review findings.
8. Integrate changes through the orchestrator.
9. Update documentation when the implementation or an approved decision changes it.

If a task is ambiguous, stop and raise the ambiguity rather than making significant assumptions.

## 11. Scope Discipline

Do not introduce additional frameworks, databases, queues, microservices, agent frameworks, vector databases or infrastructure merely because they might be useful later.

Prefer the simplest approach that satisfies the current requirements.

The user is the final authority on product direction and significant architectural decisions.
