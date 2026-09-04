# newsflash-agent

Kleines, dediziertes Repo für die automatisierte, tägliche Ausführung
des `daily-news-briefing`-Subagenten über eine claude.ai-Routine (`RemoteTrigger`).

- `.claude/agents/daily-news-briefing.md` — die Subagent-Definition (Recherche-Logik)
- `CLAUDE.md` — Anweisung an die Routine, was bei jeder Ausführung zu tun ist
- `newsflash-log.md` — Ergebnis-Log, wird bei jedem Lauf per Commit ergänzt

Hintergrund/Doku im Obsidian-Vault: `Ressourcen/Agents/daily-news-briefing.md`.
