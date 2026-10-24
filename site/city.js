// The city — every fact that makes this calendar Kona's rather than
// another town's, in one place (2026-10-24: built on the Bend site's
// pattern). The browser (filter.js, app.js) and the build (scripts/*.mjs)
// both read it; nothing else names a venue or a team. The shared files
// (app.js, filter.js, styles.css bar its --v-* hues, scripts/*.mjs bar
// fetch-events.mjs and sources.mjs) are lqa-events' own, byte for byte —
// see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. The Kona coast has no club of its own on
  // any feed (UH Hilo's Vulcans play across the island and Ticketmaster lists
  // nothing of theirs), so these are the state's programs — the University
  // of Hawaiʻi at Mānoa, two hundred miles away on Oʻahu — as a
  // Teams-view-only list: their grounds are not venues here and there is no
  // `inject` (the Port Angeles pattern). Per team:
  //   re        the title match; venue the home building; sport keys the
  //             strip icon and the game clock; colors [primary, accent];
  //   espn      ESPN's sport/league/team id — the university is id 62 in
  //             every college league, so the season, the form block and news
  //             all come from there (schedules.mjs)
  //   club      the program's name on Ticketmaster; wiki the article; opens
  //             when the season usually starts
  var UH_LOGO = 'https://a.espncdn.com/i/teamlogos/ncaa/500/62.png';
  var TEAMS = [
    { slug: 'football', label: 'Warriors Football', name: 'Hawaii Rainbow Warriors', abbr: 'HAW', re: /rainbow warriors football|hawai.i (rainbow warriors )?football/i, sport: 'football', venue: 'Ching Athletics Complex', colors: ['#024731', '#a7a9ac'],
      espn: { sport: 'football', league: 'college-football', id: '62' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: UH_LOGO, schedule: 'https://hawaiiathletics.com/sports/football/schedule',
      club: 'Hawaii Rainbow Warriors Football', opens: 'late August', wiki: { title: 'Hawaii Rainbow Warriors football', startYear: true } },
    { slug: 'basketball', label: 'Warriors Basketball', name: 'Hawaii Rainbow Warriors', abbr: 'HAW', re: /rainbow warriors men'?s basketball|rainbow warriors basketball/i, sport: 'basketball', venue: 'Stan Sheriff Center', colors: ['#024731', '#000000'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '62' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: UH_LOGO, schedule: 'https://hawaiiathletics.com/sports/mens-basketball/schedule',
      club: 'Hawaii Rainbow Warriors Mens Basketball', opens: 'early November', wiki: { title: "Hawaii Rainbow Warriors men's basketball", startYear: true } },
    { slug: 'volleyball', label: 'Wahine Volleyball', name: 'Hawaii Rainbow Wahine', abbr: 'HAW', re: /women'?s volleyball|rainbow wahine volleyball/i, sport: 'volleyball', venue: 'Stan Sheriff Center', colors: ['#024731', '#ffffff'],
      espn: { sport: 'volleyball', league: 'womens-college-volleyball', id: '62' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: UH_LOGO, schedule: 'https://hawaiiathletics.com/sports/womens-volleyball/schedule',
      club: 'Hawaii Rainbow Warriors Womens Volleyball', opens: 'late August', wiki: { title: 'Hawaii Rainbow Wahine volleyball', startYear: true } },
  ];

  // The venues, one record each, by size. Per venue:
  //   capacity how many people the place holds
  //   area     absent = Kona proper (Kailua-Kona to Kainaliu, the national
  //            parks of the Kona coast); 'town' = Kohala, Waimea and
  //            Honokaʻa, the panel's second group — the Waikoloa resorts,
  //            Kawaihae, the Kahilu in Waimea and the People's Theatre
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page; several ids comma-joined read as
  //            one). exclude drops the parking, suites, tours and bundles;
  //            secondary: true makes the listing a second source behind the
  //            room's own calendar (the Eugene pattern)
  //   alias    the other spellings the feeds use for it, folded to this name
  //   feed     the room's own calendar, read by scripts/feeds.mjs; the
  //            Kings' Shops' EyeOn calendar and the Kona Coffee Cultural
  //            Festival's own calendar page are parsed in fetch-events.mjs
  //   festival a festival's days are one series (the shared filter puts the
  //            room in the panel's Festivals group)
  // Scouted and left out (README "Sources scouted"): Hilo's rooms (the
  // Palace Theater, UH Hilo's Performing Arts Center, the East Hawaiʻi
  // Cultural Center — ninety minutes across the saddle), Kona Brewing (its
  // event list is drawn by script), Gertrude's Jazz Bar (site gone), the
  // Blue Dragon (no feed), Huliheʻe Palace, the Kona Historical Society,
  // the Donkey Mill Art Center, the Outrigger Kona's ballroom (aggregators
  // only), Hawaiʻi Volcanoes (the east side) and the Ironman (one day a year).
  var TM_EXCLUDE = /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass|all[- ]session|mini[- ]plan|lawn chair|cabana/i;
  var VENUES = { // geo: [lat, lon] puts the room on the Map view (site/local-map.js); Nominatim once at build time, four placed by hand
    // --- Kona: the Palani Road grounds, the Kainaliu playhouse, the parks, the festival ---
    'KBXtreme': { // the bowling-and-arcade complex on Palani Road whose lot stages the touring reggae and island acts (See Tickets box office; Ticketmaster's two ids watched)
      geo: [19.644, -155.988], // Palani Road at Kona Commons (placed by hand — the street number does not geocode)
      capacity: 3300,
      type: 'concert',
      cssVar: '--v-kbx',
      color: '#86c8ea',
      url: 'https://www.kbxtreme.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.kbxtreme.com&sz=128',
      tm: { id: 'KovZpabZHe,Z7r9jZaAdi', match: '', fallbackUrl: 'https://www.kbxtreme.com/', exclude: TM_EXCLUDE },
      alias: /kbxtreme|kbx ?treme|kona bowl/i,
    },
    'Kona Coffee Cultural Festival': { // ten November days of farm tours, tastings, the parade and the Miss Kona Coffee pageant across the district — its calendar page (fetch-events.mjs parseKccf), each day a row
      geo: [19.63691, -155.99259], // Hale Hālāwai on Aliʻi Drive, the festival's village hub
      capacity: 5000,
      festival: true,
      type: 'community',
      cssVar: '--v-coffeefest',
      color: '#eac886',
      url: 'https://konacoffeefest.com/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=konacoffeefest.com&sz=128',
      alias: /kona coffee (cultural )?fest/i,
    },
    'Aloha Theatre': { // the 1932 plantation-era playhouse in Kainaliu, the Aloha Performing Arts Company's stage — its Ludus box office
      geo: [19.53309, -155.92728],
      capacity: 350,
      type: 'arts',
      cssVar: '--v-aloha',
      color: '#ea8686',
      url: 'https://www.apachawaii.org/',
      icon: 'https://www.google.com/s2/favicons?domain=www.apachawaii.org&sz=128',
      feed: { kind: 'ludus', url: 'https://thealohatheatre.ludus.com/index.php', drop: /^auditions?\b|^volunteer|^workshop|season (pass|ticket)|gift certificate|^class(es)?\b|camp\b/i },
      alias: /aloha theat|aloha performing arts|\bapac\b/i,
    },
    'Puʻuhonua o Hōnaunau National Historical Park': { // the place of refuge south of Kealakekua Bay — its ranger talks and cultural festival (the NPS events API; the daily craft demonstrations left out)
      geo: [19.42239, -155.90943],
      capacity: 300,
      type: 'community',
      cssVar: '--v-puuhonua',
      color: '#86ea86',
      url: 'https://www.nps.gov/puho/planyourvisit/calendar.htm',
      icon: 'https://www.google.com/s2/favicons?domain=www.nps.gov&sz=128',
      feed: { kind: 'nps', url: 'https://developer.nps.gov/api/v1/events?parkCode=puho', drop: /ulana|hana lei|lomilomi|kāpala|kapala/i }, // the first build read 0 rows with `demonstration` in this list — loosened; the data.gov DEMO_KEY was rate-limited before the row could be checked
      alias: /pu.uhonua|h[oō]naunau/i,
    },
    'Kaloko-Honokōhau National Historical Park': { // the fishponds and petroglyphs north of Kailua — ranger-led walks (the NPS events API)
      geo: [19.68182, -156.02709],
      capacity: 200,
      type: 'community',
      cssVar: '--v-kaloko',
      color: '#86eac8',
      url: 'https://www.nps.gov/kaho/planyourvisit/calendar.htm',
      icon: 'https://www.google.com/s2/favicons?domain=www.nps.gov&sz=128',
      feed: { kind: 'nps', url: 'https://developer.nps.gov/api/v1/events?parkCode=kaho' },
      alias: /kaloko|honok[oō]hau/i,
    },
    // --- Kohala, Waimea and Honokaʻa ---
    'Waikoloa Bowl at Queens’ Gardens': { // the resort's outdoor amphitheatre, lawn seating for the touring concerts (Ticketmaster)
      geo: [19.9135, -155.8812], // the lawn on the MarketPlace's mauka side (by hand)
      capacity: 3000,
      type: 'concert',
      area: 'town',
      cssVar: '--v-bowl',
      color: '#c886ea',
      url: 'https://www.waikoloabeachresort.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.waikoloabeachresort.com&sz=128',
      tm: { id: 'KovZpZA1AJeA', match: '', fallbackUrl: 'https://www.waikoloabeachresort.com/events/', exclude: TM_EXCLUDE },
      alias: /waikoloa bowl|queen.?s.? gardens/i,
    },
    'Hilton Waikoloa Village': { // the 62-acre resort — its Palace Lawn concerts and ballroom shows (Ticketmaster, both ids)
      geo: [19.92459, -155.88893],
      capacity: 2000,
      type: 'concert',
      area: 'town',
      cssVar: '--v-hilton',
      color: '#8696ea',
      url: 'https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/',
      icon: 'https://www.google.com/s2/favicons?domain=www.hilton.com&sz=128',
      tm: { id: 'KovZpZAdlE7A,KovZpZA7velA', match: '', fallbackUrl: 'https://www.hilton.com/en/hotels/koahwhh-hilton-waikoloa-village/', exclude: TM_EXCLUDE },
      alias: /hilton waikoloa|palace lawn/i,
    },
    'Queens’ MarketPlace': { // the Waikoloa Beach Resort's shopping village — hula and music on the Coronation Pavilion (The Events Calendar REST; the lessons, run clubs and markets left out)
      geo: [19.91418, -155.88011],
      capacity: 1000,
      type: 'community',
      area: 'town',
      cssVar: '--v-queens',
      color: '#ea86d9',
      url: 'https://www.queensmarketplace.com/qmp-events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.queensmarketplace.com&sz=128',
      feed: { kind: 'tribe', url: 'https://www.queensmarketplace.com/wp-json/tribe/events/v1/events', maxRepeat: 60, drop: /ukulele lesson|run club|photos with santa|closet|resale|m[āa]keke|market\b/i },
      alias: /queen.?s.? marketplace|coronation pavilion/i,
    },
    'Kings’ Shops': { // the resort's other shopping centre — cultural demonstrations, the Fires of Polynesia and concerts on the lawn (its EyeOn calendar, fetch-events.mjs kingsShops)
      geo: [19.9172, -155.8818], // across Waikoloa Beach Drive from the MarketPlace (by hand)
      capacity: 800,
      type: 'community',
      area: 'town',
      cssVar: '--v-kings',
      color: '#eaa786',
      url: 'https://kingsshops.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=kingsshops.com&sz=128',
      alias: /king.?s.? shops/i,
    },
    'Kahilu Theatre': { // Waimea's 490-seat performing-arts hall — its own season page (`cards`) leads, Ticketmaster second
      geo: [20.01912, -155.66737],
      capacity: 490,
      type: 'arts',
      area: 'town',
      cssVar: '--v-kahilu',
      color: '#eae186',
      url: 'https://kahilu.org/shows/',
      icon: 'https://www.google.com/s2/favicons?domain=kahilu.org&sz=128',
      tm: { id: 'KovZ917AVeR,Z7r9jZakx8', match: '', fallbackUrl: 'https://kahilu.org/shows/', exclude: TM_EXCLUDE, secondary: true },
      feed: { kind: 'cards', url: 'https://kahilu.org/shows/', item: '<div class="jet-listing-grid__item', title: /(?=[\s\S]*?href="(https:\/\/kahilu\.org\/events\/[^"]+)")[\s\S]*?(?:<h2[^>]*>|jet-listing-dynamic-field__content"\s*>(?!Presented By))([^<]+)</, when: /__content"\s*>((?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4})<(?:[\s\S]*?__content"\s*>(\d{1,2}:\d{2}\s*[ap]m)<)?/i, drop: /gift card|rental|membership|donat|all access pass/i }, // the name sits before the link in each card, so the link is read ahead; the featured cards (an h2 name, a "Presented By" line, start and end dates, then the clock) are the only ones with a clock — fetch-events.mjs keeps the timed row over the grid's
      alias: /kahilu/i,
    },
    'Honokaʻa People’s Theatre': { // the 1930 plantation-town movie house on Māmane Street, 525 seats — its shows link to Eventbrite (`linked`)
      geo: [20.0787, -155.4665], // Mamane Street, Honokaʻa town (by hand)
      capacity: 525,
      type: 'concert',
      area: 'town',
      cssVar: '--v-honokaa',
      color: '#eab386',
      url: 'https://www.honokaapeople.com/now-playing',
      icon: 'https://www.google.com/s2/favicons?domain=www.honokaapeople.com&sz=128',
      feed: { kind: 'linked', url: 'https://www.honokaapeople.com/now-playing', match: /\/event-details\//, at: /honoka/i },
      alias: /honoka.a people|people.?s theat/i,
    },
    'Puʻukoholā Heiau National Historic Site': { // Kamehameha's temple above Kawaihae harbour — the August cultural festival and ranger programmes (the NPS events API)
      geo: [20.02802, -155.82112],
      capacity: 300,
      type: 'community',
      area: 'town',
      cssVar: '--v-puukohola',
      color: '#a7ea86',
      url: 'https://www.nps.gov/puhe/planyourvisit/calendar.htm',
      icon: 'https://www.google.com/s2/favicons?domain=www.nps.gov&sz=128',
      feed: { kind: 'nps', url: 'https://developer.nps.gov/api/v1/events?parkCode=puhe' },
      alias: /pu.ukohol[aā]|kawaihae/i,
    },
  };

  // City-wide feeds (scripts/feeds.mjs): none — every listing is read by room
  var FEEDS = [];

  // The usual view: every room on
  var DEFAULT_ON = ['KBXtreme', 'Kona Coffee Cultural Festival', 'Aloha Theatre', 'Puʻuhonua o Hōnaunau National Historical Park', 'Kaloko-Honokōhau National Historical Park', 'Waikoloa Bowl at Queens’ Gardens', 'Hilton Waikoloa Village', 'Queens’ MarketPlace', 'Kings’ Shops', 'Kahilu Theatre', 'Honokaʻa People’s Theatre', 'Puʻukoholā Heiau National Historic Site'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — KBXtreme, the Waikoloa Bowl, the Hilton lawn, the People’s Theatre in Honokaʻa' },
    { key: 'sports', label: 'Sports', title: 'The Rainbow Warriors and Wahine, in the Teams view' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Aloha Theatre in Kainaliu and the Kahilu in Waimea — plays, dance, comedy, the touring shows' },
    { key: 'community', label: 'Community', title: 'The coffee festival, the national parks’ programmes, hula and music at the Waikoloa shops' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 23 slots from the first build: 5 base-36 digits.
  var CODE_LENGTH = 5;
  var REGISTRY = [
    ['venue', 'KBXtreme'], ['venue', 'Kona Coffee Cultural Festival'], ['venue', 'Aloha Theatre'], ['venue', 'Puʻuhonua o Hōnaunau National Historical Park'], ['venue', 'Kaloko-Honokōhau National Historical Park'], ['venue', 'Waikoloa Bowl at Queens’ Gardens'], ['venue', 'Hilton Waikoloa Village'], ['venue', 'Queens’ MarketPlace'], ['venue', 'Kings’ Shops'], ['venue', 'Kahilu Theatre'], ['venue', 'Honokaʻa People’s Theatre'], ['venue', 'Puʻukoholā Heiau National Historic Site'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'football'], ['team', 'basketball'], ['team', 'volleyball'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Hawaii', // the board drops it from the clubs' names
    presetDefault: 'Every room — KBXtreme, the Aloha Theatre, the coffee festival and the Kona coast parks, the Waikoloa resorts and shops, the Kahilu in Waimea, the People’s Theatre in Honokaʻa and Puʻukoholā — every team and type',
    presetNeighborhood: 'Kona proper only — KBXtreme, the Aloha Theatre, the Kona Coffee Cultural Festival, Puʻuhonua o Hōnaunau and Kaloko-Honokōhau',
    presetBig: 'Only the places that hold 2,000 or more — KBXtreme, the Waikoloa Bowl, the Hilton Waikoloa Village and the coffee festival',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Kona proper only.', big: 'Showing the big rooms only — KBXtreme, the Waikoloa Bowl, the Hilton lawn and the coffee festival.' },
  };

  // Hawaiʻi's public holidays (app.js holidaysFor reads this instead of its
  // Seattle list): the federal set without Columbus Day and Juneteenth, which
  // the state does not observe, plus its own three — Prince Kūhiō Day, King
  // Kamehameha I Day and Statehood Day — and Good Friday.
  function nthWeekday(y, month, weekday, n) { var d = new Date(y, month, 1); while (d.getDay() !== weekday) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; }
  function lastMonday(y, month) { var d = new Date(y, month + 1, 0); while (d.getDay() !== 1) d.setDate(d.getDate() - 1); return d; }
  function easter(y) { // Gregorian computus (Meeus/Jones/Butcher)
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  var HOLIDAYS = function (y) {
    var gf = easter(y); gf.setDate(gf.getDate() - 2);
    return [
      [new Date(y, 0, 1), "New Year's Day"],
      [nthWeekday(y, 0, 1, 3), 'Martin Luther King Jr. Day'],
      [nthWeekday(y, 1, 1, 3), "Presidents' Day"],
      [new Date(y, 2, 26), 'Prince Kūhiō Day'],
      [gf, 'Good Friday'],
      [lastMonday(y, 4), 'Memorial Day'],
      [new Date(y, 5, 11), 'King Kamehameha I Day'],
      [new Date(y, 6, 4), 'Independence Day'],
      [nthWeekday(y, 7, 5, 3), 'Statehood Day'],
      [nthWeekday(y, 8, 1, 1), 'Labor Day'],
      [new Date(y, 10, 11), 'Veterans Day'],
      [nthWeekday(y, 10, 4, 4), 'Thanksgiving'],
      [new Date(y, 11, 25), 'Christmas Day'],
    ];
  };

  global.LQACity = {
    key: 'kona',
    name: 'Kona',
    site: 'https://kona.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; kona-events/1.0; +https://kona.here.events/)',
    tz: 'Pacific/Honolulu', tzName: 'Hawaii', // the city's time zone (no daylight time): the ICS feed's TZID, the game clocks, the poster's footer
    state: 'Hawaii', stateOutline: null, // no state drawing (the masthead's state strip went away 2026-10-13)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Kona Events', short: 'Kona Events', teams: 'Hawaiʻi teams — every season', prodid: '-//here.events//kona-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events in Kona\, HI — KBXtreme\, the Aloha Theatre\, the Kona Coffee Cultural Festival\, the national parks of the Kona coast\, the Waikoloa resorts and shops\, the Kahilu Theatre in Waimea and the People\'s Theatre in Honokaʻa' },
    teams: TEAMS,
    // the Map view (site/local-map.js, the Map stop): the ground scripts/build-local-map.mjs draws into site/local-map.json
    // — the island's outline from Natural Earth (public domain), Maui and Kahoʻolawe faint beside it — with a pin on every
    // room above that carries geo: [lat, lon]. Steve, 2026-10-24 ("local map view for event locations"); shared with lqa and
    // Seattle the same day, the ground read once at build time, never on the page.
    map: {
      kind: 'island',
      country: 'USA',
      land: [[19.6, -155.5]], // a point on each ring to draw as land
      far: [[20.8, -156.3], [20.55, -156.6]], // the neighbours, faint
      labels: [ // the places a visitor steers by; anchor: which side of the dot the name sits
        { name: 'Kailua-Kona', lat: 19.64, lon: -155.996, anchor: 'end' },
        { name: 'Captain Cook', lat: 19.497, lon: -155.918, anchor: 'end' },
        { name: 'Hawi', lat: 20.241, lon: -155.834, anchor: 'start' },
        { name: 'Waimea', lat: 20.023, lon: -155.668, anchor: 'start', dy: 14 },
        { name: 'Honokaʻa', lat: 20.08, lon: -155.467, anchor: 'start', dy: -6 },
        { name: 'Hilo', lat: 19.724, lon: -155.087, anchor: 'start' },
        { name: 'Pāhoa', lat: 19.494, lon: -154.944, anchor: 'start' },
        { name: 'Volcano', lat: 19.44, lon: -155.233, anchor: 'start' },
        { name: 'Nāʻālehu', lat: 19.065, lon: -155.586, anchor: 'start' },
        { name: 'Kona Airport (KOA)', lat: 19.739, lon: -156.045, anchor: 'end' },
        { name: 'Mauna Kea', lat: 19.821, lon: -155.468, kind: 'peak' },
        { name: 'Mauna Loa', lat: 19.475, lon: -155.608, kind: 'peak' },
        { name: 'Hualālai', lat: 19.689, lon: -155.864, kind: 'peak' },
      ],
    },
    venues: VENUES,
    feeds: FEEDS,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room (or pinned to one); fetch-events.mjs drops anything that arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
    holidays: HOLIDAYS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
