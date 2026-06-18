# Codex CLI Development Server Setup

## Purpose

This document explains how to prepare an optional Ubuntu cloud development server for CBM Trade OS work with Codex CLI and `tmux`.

This server is a development execution environment, not production. It must not store production secrets unless explicitly approved and protected. It must not directly modify production data.

## Recommended Server Specs

Minimum:

- 2 CPU cores
- 4 GB RAM
- 40 GB disk

Recommended:

- 2 CPU cores / 8 GB RAM for normal Codex CLI work
- 4 CPU cores / 8 GB RAM for heavier test runs or browser preview
- Ubuntu 22.04 LTS or Ubuntu 24.04 LTS

## Base System Setup

Update the server:

```bash
sudo apt update
sudo apt upgrade -y
```

Install basic tools:

```bash
sudo apt install -y git curl ca-certificates build-essential tmux unzip
```

## Install Node.js

Recommended: install an active LTS Node.js version through the official NodeSource setup script or another approved official method.

Example placeholder:

```bash
# Choose the approved Node.js LTS version before running.
# Example only:
# curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
# sudo apt install -y nodejs
```

Verify:

```bash
node --version
npm --version
```

## Codex CLI Installation Placeholder

Install Codex CLI using the current official installation method from OpenAI / Codex documentation.

Placeholder:

```bash
# Follow the official Codex CLI install command here.
# Do not paste production API keys into shell history.
# Use secure secret management when available.
```

Verify:

```bash
codex --version
```

## tmux Workflow

Create a long-running Codex session:

```bash
tmux new -s codex
```

Detach without stopping Codex:

```text
Ctrl+B then D
```

Reattach later:

```bash
tmux attach -t codex
```

List sessions:

```bash
tmux ls
```

Stop a session only when work is complete:

```bash
tmux kill-session -t codex
```

## Clone The Project

Create a workspace:

```bash
mkdir -p ~/work
cd ~/work
```

Clone from GitHub:

```bash
git clone <github-repo-url> cbm-trade-os
cd cbm-trade-os
```

Check current branch:

```bash
git status --short
git branch --show-current
```

Create a task branch:

```bash
git checkout -b codex/<task-id-short-title>
```

## Install Project Dependencies

Only install dependencies when the repository already defines them and the task allows setup:

```bash
npm install
```

Do not add dependencies unless the task explicitly approves it.

## Run Project Checks

Use the project's existing commands:

```bash
npm test
```

For static UI preview, use a temporary local server:

```bash
python3 -m http.server 4191 --bind 0.0.0.0
```

Then open:

```text
http://<server-ip>:4191/admin/ui-foundation/index.html?trial=1
```

Only expose preview ports to trusted IPs. Do not expose admin previews publicly without access controls.

## Development Server Safety Rules

This server must not:

- be treated as production
- store unprotected production secrets
- run production migrations
- modify production Supabase data directly
- send real customer messages
- execute approval, quote, PI, order, payment, production, or shipment actions
- delete real customer files

Use this server for branch-based development, testing, browser preview, and Review Package creation.

## Recommended Daily Workflow

1. Pull latest `main`.
2. Create a new `codex/...` branch.
3. Run Codex CLI inside `tmux`.
4. Let Codex edit only approved files.
5. Run tests or preview checks.
6. Commit to the branch.
7. Push and open a PR.
8. Produce a Review Package.
9. Paul and ChatGPT review before merge.
