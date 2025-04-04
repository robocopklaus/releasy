# Releasy

A GitHub Action that automatically creates and updates draft releases based on conventional commits.

## Features

- Automatically triggers on pushes to the main branch
- Analyzes commit messages to determine the next version bump (major, minor, or patch)
- Creates or updates draft GitHub releases with generated release notes
- Supports custom commit message patterns and release note templates
- Provides dry-run mode for testing

## Usage

```yaml
name: Release Draft

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to get full git history

      - name: Create Draft Release
        uses: your-org/releasy@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          tag_prefix: v
          # Optional inputs:
          # dry_run: false
          # release_notes_template: |
          #   ## Release {{version}}
          #   {{#each features}}
          #   - {{this.message}}
          #   {{/each}}
```

## Inputs

| Input                    | Description                                                 | Required | Default        |
| ------------------------ | ----------------------------------------------------------- | -------- | -------------- |
| `github_token`           | Token used for GitHub API authentication                    | Yes      | -              |
| `tag_prefix`             | The prefix for version tags                                 | No       | `v`            |
| `dry_run`                | Simulate the process without creating or updating a release | No       | `false`        |
| `release_notes_template` | Template to format the generated release notes              | No       | See action.yml |

## Outputs

| Output        | Description                        |
| ------------- | ---------------------------------- |
| `new_version` | The calculated new version         |
| `release_url` | URL of the created/updated release |
| `release_id`  | ID of the created/updated release  |

## Version Bumping Rules

- **Major**: When there is at least one commit with a breaking change
- **Minor**: When there is at least one feature commit and no breaking changes
- **Patch**: For commits that are fixes or non-feature updates

## Commit Message Format

The action follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `chore`: Changes to the build process or auxiliary tools
- `docs`: Documentation only changes
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests

Breaking changes should be indicated by:

1. Including `BREAKING CHANGE:` in the commit footer
2. Using `feat!` or `fix!` as the commit type

## License

MIT
