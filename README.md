# pnpm-pre-commit

A [pre-commit](https://pre-commit.com/) hook for [pnpm](https://pnpm.io/).

## Using pnpm with pre-commit

To ensure the lockfile is up-to-date when `package.json` or workspace files change:

```yaml
- repo: https://github.com/mmstroik/pnpm-pre-commit
  # pnpm version.
  rev: v10.15.1
  hooks:
    # Update the pnpm lockfile
    - id: pnpm-lock
```

To install/synchronize your dependencies upon branch checkout, pull or rebase:

```yaml
default_install_hook_types:
  - post-checkout
  - post-merge
  - post-rewrite
repos:
  - repo: https://github.com/mmstroik/pnpm-pre-commit
    # pnpm version.
    rev: v10.15.1
    hooks:
      - id: pnpm-install
```

If you want to run hooks on pre-push instead of pre-commit (to speed up commits):

```yaml
default_install_hook_types: [pre-push]

repos:
  - repo: https://github.com/mmstroik/pnpm-pre-commit
    # pnpm version.
    rev: v10.15.1
    hooks:
      - id: pnpm-lock
        stages: [pre-push]
```

To run a hook on a specific workspace within a monorepo:

```yaml
- repo: https://github.com/mmstroik/pnpm-pre-commit
  # pnpm version.
  rev: v10.15.1
  hooks:
    - id: pnpm-lock
      # Change <path/to/workspace> to your relative path
      files: <path/to/workspace>/(package\.json|pnpm-lock\.yaml)
      args: ["--filter=<path/to/workspace>"]
```

```

```
