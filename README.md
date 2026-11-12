# hammockSkills

*[Español](README.es.md)*

Skills and plugins for Claude Code made and used every day by the Hammock AI crew. Each skill comes in English (`SKILL.md`, the one Claude Code loads) and Spanish (`SKILL.es.md`, reference).

Hammock AI's idea is simple: help people get their time back, all from a hammock. We use these skills in our own work first. When one works, we share it here.

| Skill | What it does |
|---|---|
| `hammockai-daily-plan` | Opens the day's coordinating session ("The Bridge"): reads your board and the notes each session left, asks what you already did, and proposes 3 tasks for today, your own pending tasks first. |
| `hammockai-session-close` | Closes a work session from the notes written during it (not from memory), asks you one question, checks that what is marked done really exists, and leaves the board and a short log ready for tomorrow. |
| `hammockai-skill-builder` | Turns a task you repeat into a skill: interviews you, writes a draft, tests it and reviews it with you. Based on Anthropic's `skill-creator` (Apache-2.0). |
| `hammockai-web-design` | Designs or redesigns a small business site: visual direction, palette with measured contrast, typography, layout and accessibility. Based on Anthropic's `frontend-design` (Apache-2.0). |

## How to use them
1. Copy the skill folder (for example `skills/hammockai-daily-plan/`) into `.claude/skills/` in your project.
2. In Claude Code, type `/hammockai-daily-plan` (each skill runs only when you call it).
3. Adapt them. They are written for our crew: "the Captain" is you, and some steps call our own agents (Security, Guardian, The Professor) and folders: a board in `prompts/tablero.md`, session notes in `prompts/handoff/`, logs in `bitacora/sesiones/`, a notebook in `cuaderno/`, drafts in `crew-borradores/`. Change those paths to yours, or remove the steps you don't need.

**What each one touches**
- `hammockai-daily-plan` reads; it only writes the day's note (`prompts/handoff/bridge.md`) and marks on the board what you confirm as done.
- `hammockai-session-close` **writes** the board, the session log, `cuaderno/` and Claude Code's memory folder (`~/.claude/projects/…/memory/`, outside your project). It also asks your other open Claude Code sessions for a short status (SendMessage); with no parallel sessions it skips that step. Read each step before approving a write.
- `hammockai-skill-builder` assumes `crew-borradores/` and `docs-oficiales/`.
- `hammockai-web-design` takes screenshots with Edge on Windows; on Mac or Linux change the executable. The command asks for your permission.

Every skill carries our built-in rules: nothing invented (unknowns are marked), no personal data where it doesn't belong, no surprises (it doesn't send, publish or spend without asking), and the person always decides.

## Plugins
| Plugin | What it does |
|---|---|
| `hammock-guards` | A **usage panel** next to the chat ("USO - HAMMOCK AI"): how much of your 5-hour and weekly limits you have used, how full this conversation is, what each open Claude Code tab and each helper agent is doing, and a warning when more than 2 are working at once. At 90 % of a limit it asks for an orderly close. If your project has a `prompts/handoff/` folder, like the one `hammockai-daily-plan` sets up, it also reminds Claude to keep the session notes there up to date and asks you to run `/hammockai-session-close` (included in this repo). |

**Install** (Claude Code 2.1.275 or later):
```
/plugin install hammock-guards --marketplace hammockai/hammockSkills
```
In the VS Code extension, where `/plugin` is not available, run it from a terminal:
```
claude plugin marketplace add hammockai/hammockSkills
claude plugin install hammock-guards@hammock-skills
```

**Good to know**
- The panel and its messages are in Spanish.
- Every figure comes from Claude Code itself (`/usage`, `/context`, `/cost`); nothing is estimated. The dollar amount is what the session would cost on the API, not what you pay on a subscription.
- To see your other tabs, each tab writes a small file about itself in `~/.claude/hammock-usage/` (or `$CLAUDE_CONFIG_DIR/hammock-usage/`): the session id, the tab title (the one you set with /rename, or the automatic one Claude Code writes from your conversation, which may name a client or project), usage figures and a technical mark of where the title came from; never the text of your conversation. The files are reused, not deleted on their own. Only tabs with the plugin show up.
- For the "Al mando" row (who leads the tab) it reads only the first heading of your main agent (`.claude/agents/<agent>.md`, named in your settings) or of your `CLAUDE.md`. Nothing leaves your computer.
- Before recording your screen, type `/uso grabar`: tab, folder, task, file and connector names are hidden. `/uso normal` turns it off.
- It uses Claude Code's plugin hooks, an early-access feature that may change between versions.
- The idea for the agent list and the token count came from [mod-roadmap-monitor](https://github.com/jlefernandez/mod-roadmap-monitor) by jlefernandez. Our code is written from scratch; none of his is copied.

## Where they come from
We build them in the open: the whole journey, mistakes included, is in our [GitHub](https://github.com/hammockai). The story behind them and what we do lives at **[hammockai.site](https://hammockai.site)**.

## License
Apache-2.0 (see `LICENSE` and each skill's `NOTICE.md`). You can use, change and share them, also commercially, keeping the notice and marking what you changed. The names *Hammock AI* and *Hammock Crew* and the logo are not licensed.
