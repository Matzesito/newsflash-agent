# newsflash-agent

Dieses Repo existiert nur zu einem Zweck: eine tägliche, automatisierte
Ausführung des `daily-news-briefing`-Subagenten (Tagesnews-Überblick,
Politik/Wirtschaft/Gesellschaft, national + international).

## Ablauf bei jeder automatisierten Ausführung

1. Nutze den `daily-news-briefing`-Subagenten
   (`.claude/agents/daily-news-briefing.md`), um den aktuellen Tages-
   News-Abriss zu recherchieren.
2. Trage das Ergebnis **oben** in `newsflash-log.md` ein, mit dem aktuellen
   Datum als Überschrift (neueste Einträge zuerst, ältere darunter stehen
   lassen).
3. Committe die Änderung an `newsflash-log.md` mit einer kurzen, aussage-
   kräftigen Commit-Message (z.B. "Newsflash 2026-09-05") und pushe sie.

Kein anderer Code, keine anderen Dateien in diesem Repo — bewusst minimal.
