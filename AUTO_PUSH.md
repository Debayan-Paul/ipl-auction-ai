# Automatic GitHub push

This repository is configured to push `origin/HEAD` after every local commit.

The tracked hook is `.githooks/post-commit`. The local repository is configured to use that directory through:

```bash
npm run setup:git-hooks
```

The hook requires GitHub authentication to already work on the machine. If a push fails, the commit remains local and Git will display the error.

For a one-command commit-and-push, use:

```bash
npm run deploy
```

Git pushes commits, not individual unsaved file changes. Review changes before committing because every commit will be sent to GitHub automatically.
