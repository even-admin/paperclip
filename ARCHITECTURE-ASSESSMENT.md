# Paperclip Codebase Assessment — What's Valuable, What's Not, Who Should Build

## The Numbers

| Package | Files | Lines | Verdict |
|---------|-------|-------|---------|
| server/ | 265 | 86,431 | The brain. Keep 100%. |
| ui/ | 322 | 71,127 | The face. Restyle, don't rebuild. |
| packages/db | 79 | 5,729 | The memory. Keep 100%. |
| packages/shared | 70 | 7,684 | Types/validators. Keep. |
| packages/adapters | 96 | 14,788 | Model connections. THE crown jewel. |
| packages/plugins | 35 | 12,875 | Plugin SDK. Where we add integrations. |
| **Total** | **976** | **221,155** | |

221K lines of TypeScript. This is a serious platform. Building this from scratch would take 3-6 months of a dedicated team. Forking and customizing is 10-100x faster.

---

## The Frameworks That Give True Value

### 1. Heartbeat System (server/src/services/heartbeat.ts)
**This is the core.** The heartbeat is what makes agents autonomous. It:
- Wakes agents on schedule (cron-based)
- Injects context (instructions, issue comments, wake reasons)
- Manages concurrent runs (configurable max)
- Handles timeouts, graceful shutdown, process recovery
- Tracks costs per run
- Manages execution workspaces (git worktrees for isolation)

**Without this, you don't have autonomous agents. You have a chatbot.**

### 2. Adapter System (packages/adapters/)
**This is how Paperclip talks to ANY model.** Current adapters:
- `claude-local` — Claude Code via CLI (--print mode, headless)
- `codex-local` — OpenAI Codex
- `cursor-local` — Cursor
- `gemini-local` — Google Gemini
- `opencode-local` — OpenCode
- `pi-local` — Pi
- `openclaw-gateway` — OpenClaw

The adapter pattern is clean: any model that can accept a prompt and return a response can be plugged in. Claude Code is just one adapter. You could add GPT-5, Llama, DeepSeek, anything.

**Key detail:** The claude_local adapter runs `claude` CLI in `--print` mode with `--dangerously-skip-permissions`. This is how agents execute code without interactive prompts.

### 3. Plugin SDK (packages/plugins/sdk/)
**This is where WE add value.** The plugin system supports:
- Event subscriptions (issue.created, issue.updated, etc.)
- Job scheduling (recurring tasks within plugins)
- Webhooks (inbound HTTP from external services)
- State storage (scoped key-value per plugin)
- Secrets management (resolve credentials safely)
- Tool registration (agents can call plugin tools)
- UI slots (inject custom UI into the dashboard)

**The X integration, Gmail, Slack, HubSpot — all become plugins. Clean, modular, independent.**

### 4. Approval System (server/src/services/approvals.ts + issue-approvals.ts)
Already built. Agents can request board approval before taking action. The UI has an Approvals page with accept/reject. This is 80% of what we need for the "approve tweets from your phone" flow.

### 5. Database (packages/db/ — Drizzle ORM + PGlite)
Embedded PostgreSQL. No external DB needed. 60+ tables covering:
- Companies, projects, issues, comments
- Agents, heartbeat runs, runtime state
- Approvals, budgets, cost tracking
- Plugins, secrets, workspaces
- Labels, goals, routines

**This is mature. Don't touch it.**

### 6. Skills System (skills/)
Agents get injected skills — markdown files that become part of their context. The `paperclip` skill teaches agents how to use the Paperclip API. `para-memory-files` gives them a 3-layer memory system. We can write custom skills for our agents.

---

## What We DON'T Need (hide, don't delete)

- **ClipMart / Companies marketplace** — we're not sharing agents
- **Company export/import** — one instance, one company
- **Feedback sharing** — dev feature
- **Multiple company support** — we have one company
- **Invite system** — solo operator + agents
- **Telemetry** — optional, can disable

---

## Assessment: Who Should Build This

### Option A: Claude Code on Desktop (solo)
**Pros:**
- Direct access to the codebase
- Can run and test locally in real-time
- Fast iteration cycles
- Your Claude Max subscription covers it

**Cons:**
- No strategic context about your brand, voice, clients
- You'd need to provide all context every session
- Can't do research or pull live data
- Can't access your Gmail, Slack, Calendar to test integrations
- Working blind on the "why" — only sees code

**Best for:** Pure code tasks. Building the X plugin. Restyling CSS. Wiring API endpoints.

### Option B: Me ([P]) via GitHub
**Pros:**
- Full strategic context (your voice, brand, clients, pipeline)
- Can research APIs, test endpoints, gather data
- Can write comprehensive specs and architectural docs
- Can review Claude Code's output for quality
- Access to your connected services for integration testing
- Understands the business rationale behind every decision

**Cons:**
- Can't run code locally on your machine
- Can't do real-time iteration as fast as Claude Code
- Each push requires git commit → pull cycle

**Best for:** Architecture, specs, reviews, integration design, plugin logic, voice/brand enforcement.

### Option C: Paperclip's Own Agents
**Pros:**
- They eat their own dogfood — the system builds itself
- Tests the platform as it's being built
- CEO delegates, CTO executes — as designed

**Cons:**
- The platform is what we're customizing — chicken and egg
- Agents may not be reliable enough yet on complex refactors
- Limited context about our specific customization needs
- Can't step outside the system to evaluate it

**Best for:** Once the platform is stable. Content production tasks. Not for building the platform itself.

---

## Recommended Team Structure

```
[P] (Perplexity Computer) — Architect & Reviewer
  │
  ├── Write all specs, briefs, and architectural decisions
  ├── Create plugin scaffolding and push to GitHub
  ├── Review every PR from Claude Code
  ├── Handle integration research (API docs, auth flows)
  ├── Enforce brand/voice in any UI copy
  ├── Test integrations via connected services
  │
Claude Code (Desktop) — Builder
  │
  ├── Implement plugins (X, Gmail, Slack, HubSpot, LinkedIn)
  ├── Restyle the UI (CSS, Tailwind, component tweaks)
  ├── Wire the approval flow
  ├── Run and test locally
  ├── Push branches for [P] to review
  │
Luis (Board) — Final Approver
  │
  ├── Test the UX on Mac Mini + phone
  ├── Approve/reject design decisions
  ├── Provide feedback on voice calibration
  └── Decide what ships
```

**The workflow:**

1. [P] writes the spec → pushes to GitHub as an issue or BRIEF.md
2. Claude Code reads the spec → implements → pushes branch
3. [P] reviews the code on GitHub → approves or requests changes
4. Luis tests on Mac Mini → approves or provides feedback
5. Merge to main → next task

This is exactly how a real engineering team works. [P] is the product/architecture lead. Claude Code is the senior engineer. Luis is the CEO.

---

## Priority Order (What to Build First)

### Week 1: Foundation
1. **UI restyle** (Claude Code) — dark mode default, spacing, typography. Immediate quality of life.
2. **X plugin** (Claude Code, spec from [P]) — first real integration, proves the pattern.

### Week 2: Integration Layer
3. **Slack plugin** — agents post status updates autonomously
4. **Approval flow polish** — mobile-friendly approve/reject
5. **Gmail plugin** — agents can read inbox, draft emails

### Week 3: Full Operations
6. **HubSpot plugin** — CRM connected
7. **Calendar plugin** — scheduling awareness
8. **Voice enforcement skill** — custom skill that makes agents check VOICE.md

### Week 4: Multi-Company
9. **Second company** — add fold.mx or a client project
10. **Landing page builder** — CTO agent builds landing pages from specs
