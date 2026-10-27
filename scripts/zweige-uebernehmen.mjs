// Absicherung: Legt die Cloud-Routine ihren Newsflash auf einem Nebenzweig
// (claude/…) statt auf main ab (passiert, wenn in claude.ai das Pushen auf
// main nicht erlaubt ist — 26./27.10.2026), übernimmt dieses Skript die
// fehlenden Tages-Einträge aus newsflash-log.md nach main und löscht den
// Zweig danach. Läuft auf dem Hub-Server per newsflash-zweige.timer.
// Aufruf im Repo-Klon:  node scripts/zweige-uebernehmen.mjs
// Ausgabe: Anzahl übernommener Einträge; Commit/Push macht das Shell-Skript.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });

// "## JJJJ-MM-TT"-Abschnitte einer Log-Datei → Map datum → Text
function abschnitte(text) {
  const t = text.replace(/\r\n/g, '\n');
  const map = new Map();
  const re = /^## (\d{4}-\d{2}-\d{2})[^\n]*\n/gm;
  const treffer = [...t.matchAll(re)];
  treffer.forEach((m, i) => {
    const ende = i + 1 < treffer.length ? treffer[i + 1].index : t.length;
    map.set(m[1], t.slice(m.index, ende).replace(/\n*$/, '\n\n'));
  });
  return { map, kopf: treffer.length ? t.slice(0, treffer[0].index) : t };
}

const zweige = git('branch', '-r', '--format=%(refname:short)')
  .split('\n').map(s => s.trim()).filter(s => s.startsWith('origin/claude/'));

const log = abschnitte(fs.readFileSync('newsflash-log.md', 'utf8'));
let neu = 0;
const erledigt = [];
for (const zweig of zweige) {
  let inhalt;
  try { inhalt = git('show', `${zweig}:newsflash-log.md`); } catch { continue; }
  for (const [datum, text] of abschnitte(inhalt).map) {
    if (!log.map.has(datum)) { log.map.set(datum, text); neu++; console.log(`übernommen: ${datum} aus ${zweig}`); }
  }
  erledigt.push(zweig.replace(/^origin\//, ''));
}

if (neu) {
  const sortiert = [...log.map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([, t]) => t);
  fs.writeFileSync('newsflash-log.md', log.kopf + sortiert.join('').replace(/\n+$/, '\n'));
}
// Liste der abgearbeiteten Zweige für das Shell-Skript (zum Löschen nach dem Push)
fs.writeFileSync('.zweige-erledigt', erledigt.join('\n'));
console.log(`${neu} Eintrag/Einträge übernommen, ${erledigt.length} Zweig(e) geprüft`);
