// ==========================================================
// FUTBOL VERİ SERVİSİ & PLATFORM VERİ TABANI (dataService.js)
// ==========================================================

const DEFAULT_LEAGUES = [
  {
    id: 'super-lig',
    name: 'Trendyol Süper Lig',
    country: 'Türkiye',
    flag: '🇹🇷',
    logo: '🏆',
    season: '2025/2026',
    teamsCount: 19
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'İngiltere',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    logo: '🦁',
    season: '2025/2026',
    teamsCount: 20
  },
  {
    id: 'la-liga',
    name: 'La Liga EA Sports',
    country: 'İspanya',
    flag: '🇪🇸',
    logo: '👑',
    season: '2025/2026',
    teamsCount: 20
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    country: 'Avrupa',
    flag: '🇪🇺',
    logo: '⭐',
    season: '2025/2026',
    teamsCount: 36
  },
  {
    id: 'serie-a',
    name: 'Serie A Enilive',
    country: 'İtalya',
    flag: '🇮🇹',
    logo: '🇮🇹',
    season: '2025/2026',
    teamsCount: 20
  }
];

const DEFAULT_STANDINGS = {
  'super-lig': [
    { rank: 1, teamId: 'galatasaray', name: 'Galatasaray', p: 26, w: 22, d: 3, l: 1, gf: 68, ga: 21, gd: 47, pts: 69, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 2, teamId: 'fenerbahce', name: 'Fenerbahçe', p: 26, w: 20, d: 4, l: 2, gf: 63, ga: 22, gd: 41, pts: 64, form: ['W', 'W', 'L', 'W', 'W'], zone: 'ucl-qual' },
    { rank: 3, teamId: 'besiktas', name: 'Beşiktaş', p: 26, w: 16, d: 5, l: 5, gf: 49, ga: 28, gd: 21, pts: 53, form: ['D', 'W', 'W', 'W', 'L'], zone: 'uel' },
    { rank: 4, teamId: 'trabzonspor', name: 'Trabzonspor', p: 26, w: 14, d: 6, l: 6, gf: 45, ga: 31, gd: 14, pts: 48, form: ['W', 'D', 'W', 'L', 'W'], zone: 'uecl' },
    { rank: 5, teamId: 'basaksehir', name: 'RAMS Başakşehir', p: 26, w: 12, d: 7, l: 7, gf: 41, ga: 33, gd: 8, pts: 43, form: ['W', 'L', 'D', 'W', 'D'], zone: 'mid' },
    { rank: 6, teamId: 'samsunspor', name: 'Samsunspor', p: 26, w: 12, d: 6, l: 8, gf: 37, ga: 32, gd: 5, pts: 42, form: ['L', 'W', 'W', 'D', 'L'], zone: 'mid' },
    { rank: 7, teamId: 'eyupspor', name: 'Eyüpspor', p: 26, w: 11, d: 6, l: 9, gf: 38, ga: 35, gd: 3, pts: 39, form: ['D', 'L', 'W', 'W', 'D'], zone: 'mid' },
    { rank: 8, teamId: 'kasimpasa', name: 'Kasımpaşa', p: 26, w: 9, d: 8, l: 9, gf: 40, ga: 43, gd: -3, pts: 35, form: ['W', 'D', 'L', 'L', 'W'], zone: 'mid' },
    { rank: 16, teamId: 'bodrum-fk', name: 'Bodrum FK', p: 26, w: 6, d: 6, l: 14, gf: 22, ga: 38, gd: -16, pts: 24, form: ['L', 'L', 'D', 'W', 'L'], zone: 'relegation' },
    { rank: 17, teamId: 'hatayspor', name: 'Hatayspor', p: 26, w: 4, d: 8, l: 14, gf: 24, ga: 44, gd: -20, pts: 20, form: ['L', 'D', 'L', 'L', 'D'], zone: 'relegation' },
    { rank: 18, teamId: 'adana-demirspor', name: 'Adana Demirspor', p: 26, w: 2, d: 5, l: 19, gf: 18, ga: 58, gd: -40, pts: 11, form: ['L', 'L', 'L', 'D', 'L'], zone: 'relegation' }
  ],
  'premier-league': [
    { rank: 1, teamId: 'liverpool', name: 'Liverpool FC', p: 27, w: 20, d: 4, l: 3, gf: 64, ga: 25, gd: 39, pts: 64, form: ['W', 'W', 'W', 'W', 'D'], zone: 'ucl' },
    { rank: 2, teamId: 'arsenal', name: 'Arsenal FC', p: 27, w: 17, d: 7, l: 3, gf: 56, ga: 22, gd: 34, pts: 58, form: ['W', 'D', 'W', 'W', 'W'], zone: 'ucl' },
    { rank: 3, teamId: 'mancity', name: 'Manchester City', p: 27, w: 16, d: 6, l: 5, gf: 58, ga: 31, gd: 27, pts: 54, form: ['W', 'L', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 4, teamId: 'chelsea', name: 'Chelsea FC', p: 27, w: 14, d: 7, l: 6, gf: 52, ga: 36, gd: 16, pts: 49, form: ['D', 'W', 'L', 'W', 'W'], zone: 'ucl' }
  ]
};

const DEFAULT_MATCHES = [
  {
    id: 'm1',
    leagueId: 'super-lig',
    leagueName: 'Trendyol Süper Lig',
    status: 'LIVE',
    minute: '72\'',
    time: '20:00',
    date: 'Bugün',
    homeTeam: { id: 'galatasaray', name: 'Galatasaray', short: 'GS', logo: '🦁', color: '#b81414' },
    awayTeam: { id: 'fenerbahce', name: 'Fenerbahçe', short: 'FB', logo: '🐦', color: '#0c2461' },
    homeScore: 2,
    awayScore: 1,
    stadium: 'RAMS Park, İstanbul',
    referee: 'Halil Umut Meler',
    broadcaster: 'beIN Sports 1 HD',
    isLive: true,
    hasStream: true,
    stats: {
      possession: [56, 44],
      shots: [14, 9],
      shotsOnTarget: [6, 4],
      corners: [7, 3],
      fouls: [11, 14],
      yellowCards: [2, 3],
      redCards: [0, 0],
      passes: [442, 351],
      passAcc: [84, 78],
      xG: [1.84, 1.12]
    },
    commentary: [
      { minute: "71'", type: 'yellow', text: '🟨 Sarı Kart: Fred (Fenerbahçe) orta sahada yaptığı sert faul sonrası kart gördü.' },
      { minute: "64'", type: 'goal', text: '⚽ GOOOOL! Victor Osimhen! Ceza sahasında harika yükseldi, kafayla topu 90\'a astı! Galatasaray 2-1 öne geçti!' },
      { minute: "52'", type: 'var', text: '📺 VAR İncelemesi: Pozisyonda ofsayt tespit edilmedi, gol kararı geçerli.' },
      { minute: "41'", type: 'goal', text: '⚽ GOOOOL! Edin Džeko! Ceza sahası ön çizgisinden sol ayakla köşeye plaseyi bıraktı! Durum 1-1!' },
      { minute: "19'", type: 'goal', text: '⚽ GOOOOL! Mauro Icardi! Sağ kanattan yapılan ortayı gelişine voleyle ağlara gönderdi! Galatasaray 1-0 önde!' }
    ],
    lineups: {
      homeFormation: '4-2-3-1',
      awayFormation: '4-3-3',
      homeCoach: 'Okan Buruk',
      awayCoach: 'José Mourinho',
      homeEleven: [
        { num: 1, name: 'Muslera', pos: 'GK', x: 50, y: 8 },
        { num: 23, name: 'Kaan', pos: 'RB', x: 84, y: 24 },
        { num: 6, name: 'Davinson', pos: 'CB', x: 62, y: 22 },
        { num: 42, name: 'Abdülkerim', pos: 'CB', x: 38, y: 22 },
        { num: 4, name: 'Jakobs', pos: 'LB', x: 16, y: 24 },
        { num: 34, name: 'Torreira', pos: 'DM', x: 38, y: 44 },
        { num: 20, name: 'Sara', pos: 'DM', x: 62, y: 44 },
        { num: 53, name: 'Barış Alper', pos: 'RW', x: 82, y: 64 },
        { num: 10, name: 'Mertens', pos: 'AM', x: 50, y: 66 },
        { num: 7, name: 'Sallai', pos: 'LW', x: 18, y: 64 },
        { num: 45, name: 'Osimhen', pos: 'ST', x: 50, y: 86 }
      ],
      awayEleven: [
        { num: 40, name: 'Livaković', pos: 'GK', x: 50, y: 8 },
        { num: 16, name: 'Mert Müldür', pos: 'RB', x: 84, y: 24 },
        { num: 50, name: 'Becão', pos: 'CB', x: 62, y: 22 },
        { num: 6, name: 'Djiku', pos: 'CB', x: 38, y: 22 },
        { num: 24, name: 'Oosterwolde', pos: 'LB', x: 16, y: 24 },
        { num: 5, name: 'İsmail', pos: 'CM', x: 35, y: 44 },
        { num: 34, name: 'Amrabat', pos: 'DM', x: 50, y: 40 },
        { num: 13, name: 'Fred', pos: 'CM', x: 65, y: 44 },
        { num: 10, name: 'Tadić', pos: 'RW', x: 80, y: 66 },
        { num: 9, name: 'Džeko', pos: 'ST', x: 50, y: 86 },
        { num: 97, name: 'Saint-Maximin', pos: 'LW', x: 20, y: 66 }
      ]
    },
    h2h: [
      { date: '21.09.2024', home: 'Fenerbahçe', away: 'Galatasaray', score: '1 - 3' },
      { date: '19.05.2024', home: 'Galatasaray', away: 'Fenerbahçe', score: '0 - 1' },
      { date: '24.12.2023', home: 'Fenerbahçe', away: 'Galatasaray', score: '0 - 0' },
      { date: '04.06.2023', home: 'Galatasaray', away: 'Fenerbahçe', score: '3 - 0' }
    ]
  },
  {
    id: 'm2',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    status: 'LIVE',
    minute: '84\'',
    time: '19:30',
    date: 'Bugün',
    homeTeam: { id: 'mancity', name: 'Manchester City', short: 'MCI', logo: '🚢', color: '#68c5db' },
    awayTeam: { id: 'arsenal', name: 'Arsenal FC', short: 'ARS', logo: '🔴', color: '#ef0107' },
    homeScore: 1,
    awayScore: 1,
    stadium: 'Etihad Stadium, Manchester',
    referee: 'Michael Oliver',
    broadcaster: 'beIN Sports 3 HD',
    isLive: true,
    stats: {
      possession: [62, 38],
      shots: [17, 8],
      shotsOnTarget: [7, 3],
      corners: [9, 2],
      fouls: [8, 12],
      yellowCards: [1, 2],
      redCards: [0, 0],
      passes: [590, 310],
      passAcc: [89, 81],
      xG: [2.15, 0.94]
    }
  },
  {
    id: 'm3',
    leagueId: 'super-lig',
    leagueName: 'Trendyol Süper Lig',
    status: 'FT',
    minute: 'Bitti',
    time: '17:00',
    date: 'Bugün',
    homeTeam: { id: 'besiktas', name: 'Beşiktaş', short: 'BJK', logo: '🦅', color: '#111111' },
    awayTeam: { id: 'trabzonspor', name: 'Trabzonspor', short: 'TS', logo: '⚡', color: '#800020' },
    homeScore: 2,
    awayScore: 0,
    stadium: 'Tüpraş Stadyumu, İstanbul',
    referee: 'Ali Şansalan',
    broadcaster: 'beIN Sports 1 HD',
    isLive: false,
    motm: 'Rafa Silva (Beşiktaş) - 8.9 Puan',
    stats: {
      possession: [54, 46],
      shots: [15, 11],
      shotsOnTarget: [6, 2],
      corners: [6, 4],
      fouls: [13, 15],
      yellowCards: [3, 2],
      redCards: [0, 0]
    }
  },
  {
    id: 'm4',
    leagueId: 'champions-league',
    leagueName: 'UEFA Champions League',
    status: 'UPCOMING',
    minute: 'Yarın',
    time: '23:00',
    date: 'Yarın',
    homeTeam: { id: 'realmadrid', name: 'Real Madrid', short: 'RMA', logo: '👑', color: '#f5f6fa' },
    awayTeam: { id: 'bayern', name: 'Bayern München', short: 'FCB', logo: '🔴', color: '#eb2f06' },
    homeScore: null,
    awayScore: null,
    stadium: 'Santiago Bernabéu, Madrid',
    referee: 'Szymon Marciniak',
    broadcaster: 'TRT 1 & Tabii',
    isLive: false
  }
];

const DEFAULT_TEAMS = [
  {
    id: 'galatasaray',
    name: 'Galatasaray SK',
    league: 'Trendyol Süper Lig',
    stadium: 'RAMS Park (52.280)',
    founded: 1905,
    colors: ['#b81414', '#f39c12'],
    coach: 'Okan Buruk',
    logo: '🦁',
    rating: 84,
    stats: { played: 26, winRate: 85, avgGoals: 2.62, avgConceded: 0.81, cleanSheets: 13, form: ['W', 'W', 'W', 'D', 'W'] }
  },
  {
    id: 'fenerbahce',
    name: 'Fenerbahçe SK',
    league: 'Trendyol Süper Lig',
    stadium: 'Ülker Stadyumu (47.834)',
    founded: 1907,
    colors: ['#0c2461', '#f1c40f'],
    coach: 'José Mourinho',
    logo: '🐦',
    rating: 83,
    stats: { played: 26, winRate: 77, avgGoals: 2.42, avgConceded: 0.85, cleanSheets: 12, form: ['W', 'W', 'L', 'W', 'W'] }
  },
  {
    id: 'besiktas',
    name: 'Beşiktaş JK',
    league: 'Trendyol Süper Lig',
    stadium: 'Tüpraş Stadyumu (42.590)',
    founded: 1903,
    colors: ['#111111', '#ffffff'],
    coach: 'Serdar Topraktepe',
    logo: '🦅',
    rating: 80,
    stats: { played: 26, winRate: 62, avgGoals: 1.88, avgConceded: 1.07, cleanSheets: 10, form: ['D', 'W', 'W', 'W', 'L'] }
  },
  {
    id: 'realmadrid',
    name: 'Real Madrid CF',
    league: 'La Liga / UEFA Champions League',
    stadium: 'Santiago Bernabéu (84.744)',
    founded: 1902,
    colors: ['#f5f6fa', '#d4af37'],
    coach: 'Carlo Ancelotti',
    logo: '👑',
    rating: 92,
    stats: { played: 28, winRate: 79, avgGoals: 2.45, avgConceded: 0.82, cleanSheets: 14, form: ['W', 'W', 'W', 'D', 'W'] }
  }
];

const DEFAULT_PLAYERS = [
  {
    id: 'osimhen',
    name: 'Victor Osimhen',
    teamId: 'galatasaray',
    teamName: 'Galatasaray',
    pos: 'Santrfor (ST)',
    num: 45,
    age: 26,
    nation: 'Nijerya 🇳🇬',
    value: '€75M',
    avatar: '⚡',
    matches: 22,
    goals: 18,
    assists: 5,
    minutes: 1840,
    shotsPerGame: 3.8,
    passAcc: 74,
    xG: 16.4,
    radar: { pace: 91, shooting: 88, passing: 68, dribbling: 82, defending: 42, physical: 89 }
  },
  {
    id: 'icardi',
    name: 'Mauro Icardi',
    teamId: 'galatasaray',
    teamName: 'Galatasaray',
    pos: 'Santrfor (ST)',
    num: 9,
    age: 32,
    nation: 'Arjantin 🇦🇷',
    value: '€15M',
    avatar: '🎯',
    matches: 19,
    goals: 14,
    assists: 3,
    minutes: 1420,
    shotsPerGame: 3.2,
    passAcc: 79,
    xG: 12.8,
    radar: { pace: 76, shooting: 92, passing: 77, dribbling: 81, defending: 36, physical: 78 }
  },
  {
    id: 'dzeko',
    name: 'Edin Džeko',
    teamId: 'fenerbahce',
    teamName: 'Fenerbahçe',
    pos: 'Santrfor (ST)',
    num: 9,
    age: 39,
    nation: 'Bosna Hersek 🇧🇦',
    value: '€2.5M',
    avatar: '🏹',
    matches: 25,
    goals: 16,
    assists: 4,
    minutes: 1690,
    shotsPerGame: 3.1,
    passAcc: 78,
    xG: 14.1,
    radar: { pace: 65, shooting: 89, passing: 79, dribbling: 76, defending: 40, physical: 84 }
  },
  {
    id: 'tadic',
    name: 'Dušan Tadić',
    teamId: 'fenerbahce',
    teamName: 'Fenerbahçe',
    pos: 'Sol Kanat / Forvet Arkası',
    num: 10,
    age: 36,
    nation: 'Sırbistan 🇷🇸',
    value: '€3.2M',
    avatar: '🎩',
    matches: 26,
    goals: 9,
    assists: 12,
    minutes: 2150,
    shotsPerGame: 2.1,
    passAcc: 84,
    xG: 7.2,
    radar: { pace: 70, shooting: 82, passing: 91, dribbling: 86, defending: 44, physical: 74 }
  },
  {
    id: 'haaland',
    name: 'Erling Haaland',
    teamId: 'mancity',
    teamName: 'Manchester City',
    pos: 'Santrfor (ST)',
    num: 9,
    age: 24,
    nation: 'Norveç 🇳🇴',
    value: '€200M',
    avatar: '🤖',
    matches: 26,
    goals: 24,
    assists: 3,
    minutes: 2280,
    shotsPerGame: 4.2,
    passAcc: 76,
    xG: 22.8,
    radar: { pace: 89, shooting: 94, passing: 66, dribbling: 80, defending: 45, physical: 90 }
  },
  {
    id: 'mbappe',
    name: 'Kylian Mbappé',
    teamId: 'realmadrid',
    teamName: 'Real Madrid',
    pos: 'Sol Kanat / Forvet',
    num: 9,
    age: 26,
    nation: 'Fransa 🇫🇷',
    value: '€180M',
    avatar: '⚡',
    matches: 25,
    goals: 20,
    assists: 6,
    minutes: 2100,
    shotsPerGame: 4.5,
    passAcc: 82,
    xG: 18.9,
    radar: { pace: 97, shooting: 91, passing: 81, dribbling: 93, defending: 36, physical: 79 }
  }
];

const DEFAULT_TRANSFERS = [
  {
    id: 't1',
    player: 'Victor Osimhen',
    fromClub: 'Napoli 🇮🇹',
    toClub: 'Galatasaray 🇹🇷',
    fee: 'Kiralık (€10M Maaş)',
    type: 'Kiralık (Resmi)',
    date: 'Bugün',
    tier: 'confirmed',
    desc: 'Dünya çapında forvet Victor Osimhen sarı-kırmızılı formayı giyerek Süper Lig\'e damga vuruyor.'
  },
  {
    id: 't2',
    player: 'Sofyan Amrabat',
    fromClub: 'Fiorentina 🇮🇹',
    toClub: 'Fenerbahçe 🇹🇷',
    fee: '€13M (Satın Alma Ops.)',
    type: 'Transfer (Resmi)',
    date: 'Dün',
    tier: 'confirmed',
    desc: 'Faslı yıldız orta saha José Mourinho\'nun liderliğinde orta alanda kilit role büründü.'
  },
  {
    id: 't3',
    player: 'Kylian Mbappé',
    fromClub: 'Paris Saint-Germain 🇫🇷',
    toClub: 'Real Madrid 🇪🇸',
    fee: 'Bedelsiz (Serbest)',
    type: 'Yüzyılın İmzası',
    date: 'Bu Sezon',
    tier: 'confirmed',
    desc: 'Fransız süperstar Santiago Bernabéu\'da efsanevi beyaz formayı sırtına geçirdi.'
  },
  {
    id: 't4',
    player: 'Florian Wirtz',
    fromClub: 'Bayer Leverkusen 🇩🇪',
    toClub: 'Manchester City / Real Madrid',
    fee: '€120M (Tahmini)',
    type: 'Söylenti',
    date: '3 Saat Önce',
    tier: 'rumor',
    desc: 'Avrupa devleri genç Alman maestroyu kadrosuna katmak için kıyasıya rekabet ediyor.'
  }
];

const DEFAULT_NEWS = [
  {
    id: 'n1',
    category: 'Süper Lig',
    badge: '🦁 DERBİ HEYECANI',
    title: 'Nefes Kesen Derbide Son Dakikalar! RAMS Park Ayakta',
    summary: 'Süper Lig\'in zirvesini yakından ilgilendiren dev derbide Galatasaray ile Fenerbahçe müthiş bir tempo sergiliyor.',
    source: 'FitBULLK Haber',
    time: '15 dk önce',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'n2',
    category: 'Avrupa',
    badge: '⭐ ŞAMPİYONLAR LİGİ',
    title: 'Devler Ligi Çeyrek Final Eşleşmeleri Belli Oldu',
    summary: 'Yeni formatıyla heyecan fırtınası estiren UEFA Şampiyonlar Ligi\'nde kuralar çekildi. Real Madrid ile Bayern eşleşti.',
    source: 'UEFA Resmi',
    time: '2 saat önce',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'n3',
    category: 'Transfer',
    badge: '🔥 SICAK GELİŞME',
    title: 'Avrupa Devlerinden Türk Yıldızlarına Kanca',
    summary: 'Süper Lig\'in yükselen değerleri için Premier Lig ve Serie A kulüpleri scoutlarını İstanbul\'a gönderdi.',
    source: 'Transfermarkt',
    time: '4 saat önce',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'
  }
];

class DataService {
  constructor() {
    this.leagues = DEFAULT_LEAGUES;
    this.standings = this.load('fb_standings', DEFAULT_STANDINGS);
    this.matches = this.load('fb_matches', DEFAULT_MATCHES);
    this.teams = this.load('fb_teams', DEFAULT_TEAMS);
    this.players = this.load('fb_players', DEFAULT_PLAYERS);
    this.transfers = this.load('fb_transfers', DEFAULT_TRANSFERS);
    this.news = this.load('fb_news', DEFAULT_NEWS);
    this.favorites = this.load('fb_favorites', { teams: ['galatasaray'], players: ['osimhen'], leagues: ['super-lig'] });
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }

  // Arama Metodu (CTRL+K Global Search)
  search(query) {
    if (!query || query.trim().length === 0) return { teams: [], players: [], matches: [], leagues: [] };
    const q = query.toLowerCase().trim();

    const teams = this.teams.filter(t => t.name.toLowerCase().includes(q) || t.league.toLowerCase().includes(q));
    const players = this.players.filter(p => p.name.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q));
    const leagues = this.leagues.filter(l => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q));
    const matches = this.matches.filter(m => 
      m.homeTeam.name.toLowerCase().includes(q) || 
      m.awayTeam.name.toLowerCase().includes(q) || 
      m.leagueName.toLowerCase().includes(q)
    );

    return { teams, players, leagues, matches };
  }

  getLiveMatches() {
    return this.matches.filter(m => m.isLive);
  }

  getTodayMatches() {
    return this.matches.filter(m => m.date === 'Bugün');
  }

  getMatchById(id) {
    return this.matches.find(m => m.id === id) || this.matches[0];
  }

  getStandings(leagueId = 'super-lig') {
    return this.standings[leagueId] || this.standings['super-lig'];
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id) || this.players[0];
  }

  getTeamById(id) {
    return this.teams.find(t => t.id === id) || this.teams[0];
  }

  toggleFavorite(type, id) {
    if (!this.favorites[type]) this.favorites[type] = [];
    const idx = this.favorites[type].indexOf(id);
    if (idx >= 0) {
      this.favorites[type].splice(idx, 1);
    } else {
      this.favorites[type].push(id);
    }
    this.save('fb_favorites', this.favorites);
    return this.favorites[type].includes(id);
  }

  isFavorite(type, id) {
    return this.favorites[type] && this.favorites[type].includes(id);
  }

  // Admin: Maç Ekle / Güncelle
  addMatch(newMatch) {
    this.matches.unshift(newMatch);
    this.save('fb_matches', this.matches);
  }

  // Admin: Haber Ekle
  addNews(newsItem) {
    this.news.unshift(newsItem);
    this.save('fb_news', this.news);
  }

  // Admin: Transfer Ekle
  addTransfer(transferItem) {
    this.transfers.unshift(transferItem);
    this.save('fb_transfers', this.transfers);
  }

  // FUTBOL AI ASİSTANI SORU CEVAP MOTORU
  askAI(question) {
    const q = (question || '').toLowerCase().trim();
    if (!q) return "Merhaba! Ben FitBULLK Futbol Yapay Zeka Asistanıyım. Süper Lig, Premier League, maçlar, oyuncu istatistikleri veya transferler hakkında ne öğrenmek istersin?";

    // 1. Zirve / Form / Liderlik Sorusu
    if (q.includes('lider') || q.includes('birinci') || q.includes('zirve') || q.includes('en formda')) {
      const s = this.getStandings('super-lig');
      const leader = s[0];
      return `📊 **Trendyol Süper Lig Lideri:** **${leader.name}**!\n- **Puan:** ${leader.pts} Puan (${leader.p} maçta ${leader.w} galibiyet)\n- **Averaj:** +${leader.gd} (${leader.gf} gol attı, ${leader.ga} gol yedi)\n- **Son 5 Maç Formu:** ${leader.form.join(' - ')}`;
    }

    // 2. Galatasaray Sorusu
    if (q.includes('galatasaray') || q.includes('cimbom')) {
      const gs = this.getTeamById('galatasaray');
      const m = this.matches.find(match => match.homeTeam.id === 'galatasaray' || match.awayTeam.id === 'galatasaray');
      return `🦁 **Galatasaray SK Durum Raporu:**\n- **Lig Sırası:** 1. Sıra (69 Puan)\n- **Teknik Direktör:** ${gs.coach}\n- **Galibiyet Oranı:** %${gs.stats.winRate}\n- **Aktif Maç:** ${m ? `${m.homeTeam.name} ${m.homeScore ?? ''} - ${m.awayScore ?? ''} ${m.awayTeam.name} (${m.minute})` : 'Maç programı hazır'}\n- **Yıldız Golcüler:** Victor Osimhen (18 gol), Mauro Icardi (14 gol)`;
    }

    // 3. Fenerbahçe Sorusu
    if (q.includes('fenerbahçe') || q.includes('fenerbahce') || q.includes('fener')) {
      const fb = this.getTeamById('fenerbahce');
      return `🐦 **Fenerbahçe SK Durum Raporu:**\n- **Lig Sırası:** 2. Sıra (64 Puan)\n- **Teknik Direktör:** ${fb.coach}\n- **Galibiyet Oranı:** %${fb.stats.winRate}\n- **En Çok Katkı Verenler:** Edin Džeko (16 gol), Dušan Tadić (9 gol, 12 asist)`;
    }

    // 4. Osimhen veya Icardi Sorusu
    if (q.includes('osimhen') || q.includes('icardi') || q.includes('gol kral')) {
      return `⚽ **Süper Lig Gol Krallığı & Forvet Raporu:**\n- **1. Victor Osimhen (Galatasaray):** 22 maçta **18 Gol, 5 Asist** (Maç başı 3.8 şut, xG: 16.4)\n- **2. Edin Džeko (Fenerbahçe):** 25 maçta **16 Gol, 4 Asist**\n- **3. Mauro Icardi (Galatasaray):** 19 maçta **14 Gol, 3 Asist**\n- **4. Ciro Immobile (Beşiktaş):** 21 maçta **13 Gol**`;
    }

    // 5. Mbappé veya Haaland Sorusu
    if (q.includes('mbappe') || q.includes('haaland') || q.includes('real madrid') || q.includes('city')) {
      return `🌟 **Dünya Devleri Gol Performansları:**\n- **Erling Haaland (Man City):** 26 maçta **24 Gol, 3 Asist** (xG: 22.8)\n- **Kylian Mbappé (Real Madrid):** 25 maçta **20 Gol, 6 Asist** (Hız: 97, Şut: 91)`;
    }

    // 6. Transfer Sorusu
    if (q.includes('transfer') || q.includes('imza') || q.includes('söylenti')) {
      const t = this.transfers[0];
      const r = this.transfers.find(item => item.tier === 'rumor') || this.transfers[1];
      return `🔄 **Son Transfer Bülteni:**\n- **Resmi:** ${t.player} (${t.fromClub} ➡️ ${t.toClub}) - ${t.fee}\n- **Günün Söylentisi:** ${r.player} (${r.fromClub} ➡️ ${r.toClub}) - ${r.fee}`;
    }

    // Genel Akıllı Yanıt
    return `⚽ **FitBULLK Futbol Veri Raporu:** Sorunuz incelendi. Şu anda Trendyol Süper Lig'de Galatasaray 69 puanla lider, Fenerbahçe 64 puanla ikinci sırada. Canlı maç merkezimizden Rams Park'taki derbinin dakika dakika canlı anlatımını, formasyonları ve şut istatistiklerini takip edebilirsiniz!`;
  }
}

window.dataService = new DataService();
