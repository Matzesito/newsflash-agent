// Sammelt die Schlagzeilen der letzten 36 Stunden aus festen RSS-Feeds und
// schreibt sie nach feeds.md. Grund: Das Abrufwerkzeug des Agenten (WebFetch)
// ist für alle großen Nachrichtenseiten gesperrt; die GitHub Action ruft die
// Feeds stattdessen ganz normal ab, der Agent liest nur noch diese Datei.
// Aufruf: node scripts/feeds-sammeln.mjs   (Node >= 18, keine Abhängigkeiten)
import fs from 'node:fs';

const FEEDS = [
  { name: 'Tagesschau', url: 'https://www.tagesschau.de/index~rss2.xml' },
  { name: 'Deutschlandfunk', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss' },
  { name: 'FAZ', url: 'https://www.faz.net/rss/aktuell/' },
  { name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  { name: 'Zeit', url: 'https://newsfeed.zeit.de/index' },
  { name: 'NZZ', url: 'https://www.nzz.ch/recent.rss' },
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
];
const FENSTER_STUNDEN = 36;
const MAX_PRO_FEED = 25;
const TEASER_MAX = 240;

function entities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ').trim();
}
function feld(item, tag) {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? entities(m[1]) : '';
}

async function holen(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (newsflash-agent feed snapshot)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const grenze = Date.now() - FENSTER_STUNDEN * 3600 * 1000;
  const items = [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)].map(m => m[0]);
  return items
    .map(it => {
      const datum = new Date(feld(it, 'pubDate') || feld(it, 'updated') || feld(it, 'dc:date'));
      let teaser = feld(it, 'description') || feld(it, 'summary');
      if (teaser.length > TEASER_MAX) teaser = teaser.slice(0, TEASER_MAX).replace(/\s+\S*$/, '') + ' …';
      return { titel: feld(it, 'title'), teaser, datum };
    })
    .filter(x => x.titel && !isNaN(x.datum) && x.datum.getTime() >= grenze)
    .sort((a, b) => b.datum - a.datum)
    .slice(0, MAX_PRO_FEED);
}

function zeit(d) {
  return d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const jetzt = new Date();
const teile = [
  '# Feed-Schnappschuss',
  '',
  `Erstellt: ${zeit(jetzt)} (Europe/Berlin) · Meldungen der letzten ${FENSTER_STUNDEN} Stunden, je Quelle max. ${MAX_PRO_FEED}, neueste zuerst.`,
  'Automatisch erzeugt von .github/workflows/feeds.yml — nicht von Hand bearbeiten.',
  '',
];
const status = [];
for (const feed of FEEDS) {
  try {
    const items = await holen(feed);
    status.push(`${feed.name}: ${items.length}`);
    teile.push(`## ${feed.name}`, '');
    if (!items.length) teile.push('(keine Meldungen im Zeitfenster)', '');
    for (const it of items) {
      teile.push(`- [${zeit(it.datum)}] **${it.titel}**${it.teaser && it.teaser !== it.titel ? ' — ' + it.teaser : ''}`);
    }
    teile.push('');
  } catch (e) {
    status.push(`${feed.name}: FEHLER (${e.message})`);
    teile.push(`## ${feed.name}`, '', `(Abruf fehlgeschlagen: ${e.message})`, '');
  }
}
teile.splice(4, 0, `Status: ${status.join(' · ')}`);
fs.writeFileSync('feeds.md', teile.join('\n'));
console.log(status.join('\n'));
