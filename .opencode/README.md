# OpenCode Configuration

> Configuration for [OpenCode](https://opencode.ai) AI coding assistant.
> Official docs: https://opencode.ai/docs

## Directory Structure

```
.opencode/
├── agent/                 # Standalone markdown agents (auto-loaded)
│   └── devops.md         # CI/CD and deployment expert
├── plugin/                # Plugins for extending OpenCode
│   └── env-protection.js  # Blocks access to .env files
├── prompts/               # Prompt files referenced by opencode.jsonc
│   ├── build.md          # Build agent prompt
│   ├── plan.md           # Planning agent prompt
│   ├── architect.md      # Architecture agent prompt
│   ├── reviewer.md       # Code review agent prompt
│   ├── implement.md      # Implementation agent prompt
│   └── ask-user.md       # Guidelines for asking user questions
├── AGENTS.md              # Project context for all agents
├── opencode.jsonc         # Main configuration
└── README.md              # This file
```

## Quick Start

| Task            | How                                  |
| --------------- | ------------------------------------ |
| Switch agents   | Press `Tab`                          |
| Run command     | Type `/test`, `/build`, `/i18n`, etc.|
| Invoke subagent | Type `@devops help with deployment`  |
| Switch model    | Type `/models`                       |

## Deep vs Fast Mode

Press `Tab` to cycle through agents with different reasoning modes:

```
build-max → build → build-fast → plan-max → architect-max → review-max → implement-max
    │          │         │           │            │              │             │
    └─ 128K    └─ 64K    └─ fast     └─ 128K      └─ 128K        └─ 128K       └─ 128K
```

### Model Aliases

| Alias         | Extended Thinking | Best For                               |
| ------------- | ----------------- | -------------------------------------- |
| `opus-max`    | 128K tokens       | Hardest problems, complex architecture |
| `opus-deep`   | 64K tokens        | Complex tasks, debugging               |
| `opus-fast`   | None              | Quick iterations, simple changes       |
| `sonnet`      | 32K tokens        | Fast exploration                       |
| `sonnet-fast` | None              | Ultra-fast iterations (cheapest)       |

> Docs: https://opencode.ai/docs/models

## Agents

### Primary Agents (Tab to switch)

| Agent           | Model       | Description                                |
| --------------- | ----------- | ------------------------------------------ |
| `build-max`     | opus-max    | Maximum reasoning (128K thinking tokens)   |
| `build`         | opus-deep   | Standard development with extended thinking|
| `build-fast`    | opus-fast   | Quick iterations without extended thinking |
| `plan-max`      | opus-max    | Deep planning and analysis (read-only)     |
| `architect-max` | opus-max    | System design and documentation            |
| `review-max`    | opus-max    | Code review (security, performance, a11y)  |
| `implement-max` | opus-max    | Targeted fixes after review/debug          |

### Subagents (@mention to invoke)

| Agent      | Description                          |
| ---------- | ------------------------------------ |
| `@explore` | Fast codebase exploration (Sonnet)   |
| `@general` | General research and multi-step tasks|
| `@devops`  | CI/CD, Docker, deployment            |

> Docs: https://opencode.ai/docs/agents

## Custom Commands

| Command      | Description                    |
| ------------ | ------------------------------ |
| `/test`      | Run all tests                  |
| `/test-e2e`  | Run Playwright E2E tests       |
| `/typecheck` | Run TypeScript type checking   |
| `/build`     | Run production build           |
| `/i18n`      | Extract and check translations |
| `/review`    | Review recent code changes     |

> Docs: https://opencode.ai/docs/commands

## Permissions

Three permission levels: `"allow"` | `"ask"` | `"deny"`

### Bash Permissions (glob patterns)

```jsonc
"permission": {
  "bash": {
    "yarn *": "allow",           // Package manager
    "git status": "allow",       // Read git state
    "git diff*": "allow",        // View changes
    "git push*": "ask",          // Require confirmation
    "rm *": "ask",               // Destructive operations
    "cat .env*": "deny",         // Block secrets
    "*": "ask"                   // Default for unmatched
  }
}
```

> Docs: https://opencode.ai/docs/permissions

## Files Reference

| File                       | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `opencode.jsonc`           | Main config (models, agents, permissions, commands) |
| `AGENTS.md`                | Project context loaded for all agents               |
| `prompts/*.md`             | System prompts referenced by agents in config       |
| `agent/*.md`               | Standalone agent definitions (auto-loaded)          |
| `plugin/env-protection.js` | Security plugin to block .env file access           |

## Security

### .env File Protection

The `plugin/env-protection.js` plugin prevents OpenCode from reading `.env` files:

- Blocks `read` tool from accessing any file with `.env` in the path
- Blocks bash commands like `cat .env`, `head .env`, etc.
- Throws descriptive error directing to `.env.example` instead

> Docs: https://opencode.ai/docs/plugins/#env-protection

---

**Official Documentation:** https://opencode.ai/docs
