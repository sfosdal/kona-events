# Kona Events

Event feed and calendar for the Kona coast of Hawaiʻi: KBXtreme's concert lot
on Palani Road, the Aloha Theatre in Kainaliu, the Kona Coffee Cultural
Festival's ten November days and the ranger programmes at Puʻuhonua o Hōnaunau
and Kaloko-Honokōhau, with the Waikoloa resorts (the Waikoloa Bowl, the Hilton
Waikoloa Village, Queens' MarketPlace, the Kings' Shops), Puʻukoholā Heiau at
Kawaihae, the Kahilu Theatre in Waimea and the Honokaʻa People's Theatre as
the "Kohala, Waimea & Honokaʻa" group — and the University of Hawaiʻi's
Rainbow Warriors (football, basketball) and Rainbow Wahine volleyball in a
Teams view.

To be published at **https://kona.here.events/** (GitHub Pages, built by the
Actions workflow once a day at noon Hawaiʻi time).

Built 2026-10-24 on the family's city pattern (template: bend-events).
Everything that makes this Kona's is `site/city.js` (every team, venue, type,
default, share-code registry, holiday and string), `site/index.html`,
`scripts/fetch-events.mjs` (its source list and two parsers of its own),
`site/embed.js`, `outlook.json`, `scripts/data/postseason.json`,
`channels.json`, the manifest and icons. Everything else — `app.js`,
`filter.js`, `styles.css` bar its `--v-*` hue lines, the shared
`scripts/*.mjs` and their tests — is lqa-events' own, byte for byte, copied in
by `sync-shared.sh` from the lqa-events project.

## Sources

- **Ticketmaster Discovery API** — the few rooms Ticketmaster lists here, each
  by its venue id (every page; KBXtreme, the Hilton and the Kahilu read two
  ids apiece). Parking, suites, tours, VIP upgrades and season bundles are
  dropped per room (`tm.exclude`). Church events are left out (`isChurch`).
- **Aloha Theatre** (Kainaliu) — the Aloha Performing Arts Company's Ludus box
  office (`scripts/feeds.mjs` kind `ludus`, fetched through
  `scripts/cffi-fetch.py` because Ludus's edge refuses Node).
- **Kahilu Theatre** (Waimea) — its own season page (kind `cards`), with
  Ticketmaster as a secondary source that fills only the dates the page lacks
  (`tm.secondary`; the page prints no clocks, so the clash check here is by
  date, not by minute).
- **Queens' MarketPlace** (Waikoloa) — its Events Calendar REST feed (kind
  `tribe`; the lessons, run clubs and markets dropped).
- **Kings' Shops** (Waikoloa) — its EyeOn calendar: the page's nonce, then the
  plugin's admin-ajax events call, recurrences expanded from each item's
  RRULE (`fetch-events.mjs` `kingsShops`).
- **Honokaʻa People's Theatre** — its Now Playing page, each show's Eventbrite
  page read as schema.org (kind `linked`).
- **The national parks** — the NPS events API for Puʻuhonua o Hōnaunau
  (`puho`, the daily craft demonstrations dropped), Kaloko-Honokōhau (`kaho`)
  and Puʻukoholā Heiau (`puhe`) (kind `nps`).
- **Kona Coffee Cultural Festival** — its calendar page, one row per event per
  day with the clock and the location (`fetch-events.mjs` `parseKccf`); a
  festival venue, so its days are one series.
- **Seasons** — ESPN for the Rainbow Warriors and Wahine (Teams view only:
  their grounds are on Oʻahu).

A row that arrives under a venue `city.js` does not name is dropped and
counted in the build log (there is no grounds venue here).

## Build

```
cp .env.example .env   # TICKETMASTER_API_KEY=… (a free Discovery key)
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # writes site/events.json, the .ics feeds, teams.json
node --test scripts/*.test.mjs
python3 -m http.server 8000 --directory site
```

`ALLOW_NO_ARCHIVE=1` is only for the first build, before the `events-archive`
branch exists; in CI the workflow sets it as a repository variable until the
first run has pushed the archive, then it is deleted.

## Sister sites

lqa-events (Seattle Center) is the source of truth for the shared files. See
its README for the pipeline, the share codes and the Teams view.
