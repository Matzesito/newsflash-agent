# newsflash-agent

Dieses Repo existiert nur zu einem Zweck: eine tägliche, automatisierte
Ausführung des `daily-news-briefing`-Subagenten (Tagesnews-Überblick,
Politik/Wirtschaft/Gesellschaft, national + international).

## Ablauf bei jeder automatisierten Ausführung

1. Lies `feeds.md` (Feed-Schnappschuss, jeden Morgen von der GitHub Action
   `.github/workflows/feeds.yml` erzeugt — Schlagzeilen der letzten 36 h aus
   Tagesschau, DLF, FAZ, Spiegel, Zeit, NZZ, BBC, Guardian). Prüfe die
   Zeile "Erstellt:" — stammt sie nicht von heute, im Transparenzhinweis
   vermerken. Lies außerdem den obersten (neuesten) Eintrag in
   `newsflash-log.md`.
   Rufe dann den `daily-news-briefing`-Subagenten
   (`.claude/agents/daily-news-briefing.md`) auf und gib ihm im Prompt den
   **kompletten Inhalt von `feeds.md`** sowie die Themen des vorherigen
   Newsflash mit (der Subagent kann keine Dateien lesen und die
   Nachrichtenseiten nicht selbst abrufen).
2. Trage das Ergebnis **oben** in `newsflash-log.md` ein, mit dem aktuellen
   Datum als Überschrift (neueste Einträge zuerst, ältere darunter stehen
   lassen).
3. Committe die Änderung an `newsflash-log.md` mit einer kurzen, aussage-
   kräftigen Commit-Message (z.B. "Newsflash 2026-09-05") und pushe sie.

Bewusst minimal: außer dem Log nur der Feed-Sammler (`scripts/feeds-sammeln.mjs`,
`.github/workflows/feeds.yml`, Ergebnis `feeds.md`). `feeds.md` nicht von
Hand ändern und nicht mitcommitten.
