#!/usr/bin/env node
"use strict";

/**
 * Documentation Engineer write guard.
 *
 * This is used by the Documentation Engineer's agent-scoped PreToolUse hook.
 * It allows Edit/Write only when the resolved target is inside the active
 * checkout's docs/ directory. It blocks on missing or ambiguous path data.
 *
 * Requires Node.js. No third-party packages are used.
 */

const fs = require("node:fs");
const path = require("node:path");

function block(reason) {
  process.stderr.write(`Documentation Engineer write blocked: ${reason}\n`);
  process.exit(2);
}

function isWithinDirectory(directory, target) {
  const relative = path.relative(directory, target);

  // A file must be below docs/, not the docs directory itself.
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function isDirectory(candidate) {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function findProjectRoot(startDirectory) {
  // The project root is the nearest ancestor holding BOTH CLAUDE.md and docs/.
  // Walking upward from the hook input's cwd keeps this correct from the
  // repository root, docs/, .claude/ and any nested directory, and inside a
  // Claude Code worktree, where CLAUDE_PROJECT_DIR still points at the
  // original checkout and would resolve docs/ in the wrong tree.
  let current = path.resolve(startDirectory);

  for (;;) {
    if (
      isFile(path.join(current, "CLAUDE.md")) &&
      isDirectory(path.join(current, "docs"))
    ) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error(
        "could not locate a project root containing both CLAUDE.md and a docs/ directory."
      );
    }

    current = parent;
  }
}

function resolveExistingTarget(targetPath) {
  // Resolve the real path when the target already exists. This catches a
  // target file that is itself a symlink to a location outside docs/.
  if (fs.existsSync(targetPath)) {
    return fs.realpathSync(targetPath);
  }

  // For a new file, walk upward to the nearest existing ancestor, resolve
  // that ancestor (catching symlinked parent directories), then append the
  // not-yet-created path components.
  let ancestor = targetPath;
  const missingParts = [];

  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);

    if (parent === ancestor) {
      throw new Error("Could not resolve the target path.");
    }

    missingParts.unshift(path.basename(ancestor));
    ancestor = parent;
  }

  return path.join(fs.realpathSync(ancestor), ...missingParts);
}

function main() {
  let event;

  try {
    const rawInput = fs.readFileSync(0, "utf8");
    event = JSON.parse(rawInput);
  } catch {
    block("hook input was missing or was not valid JSON.");
  }

  const toolName = event && event.tool_name;
  if (toolName !== "Edit" && toolName !== "Write") {
    // The frontmatter matcher should call this only for Edit or Write.
    // Fail closed if the hook is accidentally attached to another tool.
    block("this guard only accepts Edit and Write tool calls.");
  }

  const toolInput = event && event.tool_input;
  const targetValue = toolInput && toolInput.file_path;

  if (typeof targetValue !== "string" || targetValue.trim() === "") {
    block("the target file path was missing.");
  }

  // Claude Code supplies an absolute file_path for Write and Edit. The hook
  // input's cwd identifies the active checkout, which is the worktree when the
  // agent runs under worktree isolation, so it is the primary resolver here.
  const workingDirectory =
    typeof event.cwd === "string" && event.cwd.trim() !== ""
      ? event.cwd
      : process.cwd();

  let projectRoot;
  let docsDirectory;
  let requestedTarget;
  let realDocsDirectory;
  let realTarget;

  try {
    projectRoot = findProjectRoot(workingDirectory);
    docsDirectory = path.join(projectRoot, "docs");
    realDocsDirectory = fs.realpathSync(docsDirectory);

    // Absolute paths remain absolute. Relative paths are resolved against
    // the active checkout as a defensive fallback.
    requestedTarget = path.isAbsolute(targetValue)
      ? path.normalize(targetValue)
      : path.resolve(projectRoot, targetValue);

    realTarget = resolveExistingTarget(requestedTarget);
  } catch (error) {
    block(error && error.message ? error.message : "could not safely resolve the target path.");
  }

  if (!isWithinDirectory(realDocsDirectory, realTarget)) {
    block(`target is outside docs/: ${targetValue}`);
  }

  process.exit(0);
}

main();
