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
    id: 'serie-a',
    name: 'Serie A Enilive',
    country: 'İtalya',
    flag: '🇮🇹',
    logo: '🇮🇹',
    season: '2025/2026',
    teamsCount: 20
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Almanya',
    flag: '🇩🇪',
    logo: '⚽',
    season: '2025/2026',
    teamsCount: 18
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    country: 'Avrupa',
    flag: '🇪🇺',
    logo: '⭐',
    season: '2025/2026',
    teamsCount: 36
  }
];

const DEFAULT_STANDINGS = {
  'super-lig': [
    { rank: 1, teamId: 'galatasaray', name: 'Galatasaray', p: 26, w: 22, d: 3, l: 1, gf: 68, ga: 21, gd: 47, pts: 69, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 2, teamId: 'fenerbahce', name: 'Fenerbahçe', p: 26, w: 20, d: 4, l: 2, gf: 63, ga: 22, gd: 41, pts: 64, form: ['W', 'W', 'L', 'W', 'W'], zone: 'ucl-qual' },
    { rank: 3, teamId: 'besiktas', name: 'Beşiktaş', p: 26, w: 16, d: 5, l: 5, gf: 49, ga: 28, gd: 21, pts: 53, form: ['D', 'W', 'W', 'W', 'L'], zone: 'uel' },
    { rank: 4, teamId: 'trabzonspor', name: 'Trabzonspor', p: 26, w: 14, d: 6, l: 6, gf: 45, ga: 31, gd: 14, pts: 48, form: ['W', 'D', 'W', 'L', 'W'], zone: 'uecl' },
    { rank: 5, teamId: 'basaksehir', name: 'RAMS Başakşehir', p: 26, w: 12, d: 7, l: 7, gf: 41, ga: 33, gd: 8, pts: 43, form: ['W', 'L', 'D', 'W', 'D'], zone: 'mid' },
    { rank: 6, teamId: 'samsunspor', name: 'Samsunspor', p: 26, w: 12, d: 6, l: 8, gf: 37, ga: 32, gd: 5, pts: 42, form: ['L', 'W', 'W', 'D', 'L'], zone: 'mid' }
  ],
  'premier-league': [
    { rank: 1, teamId: 'liverpool', name: 'Liverpool FC', p: 27, w: 20, d: 4, l: 3, gf: 64, ga: 25, gd: 39, pts: 64, form: ['W', 'W', 'W', 'W', 'D'], zone: 'ucl' },
    { rank: 2, teamId: 'arsenal', name: 'Arsenal FC', p: 27, w: 17, d: 7, l: 3, gf: 56, ga: 22, gd: 34, pts: 58, form: ['W', 'D', 'W', 'W', 'W'], zone: 'ucl' },
    { rank: 3, teamId: 'mancity', name: 'Manchester City', p: 27, w: 16, d: 6, l: 5, gf: 58, ga: 31, gd: 27, pts: 54, form: ['W', 'L', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 4, teamId: 'chelsea', name: 'Chelsea FC', p: 27, w: 14, d: 7, l: 6, gf: 52, ga: 36, gd: 16, pts: 49, form: ['D', 'W', 'L', 'W', 'W'], zone: 'ucl' },
    { rank: 5, teamId: 'manunited', name: 'Manchester United', p: 27, w: 13, d: 6, l: 8, gf: 46, ga: 38, gd: 8, pts: 45, form: ['W', 'W', 'L', 'D', 'W'], zone: 'uel' }
  ],
  'la-liga': [
    { rank: 1, teamId: 'realmadrid', name: 'Real Madrid CF', p: 27, w: 21, d: 4, l: 2, gf: 66, ga: 20, gd: 46, pts: 67, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 2, teamId: 'barcelona', name: 'FC Barcelona', p: 27, w: 19, d: 5, l: 3, gf: 71, ga: 26, gd: 45, pts: 62, form: ['W', 'W', 'D', 'W', 'W'], zone: 'ucl' },
    { rank: 3, teamId: 'atletico', name: 'Atlético de Madrid', p: 27, w: 16, d: 8, l: 3, gf: 48, ga: 19, gd: 29, pts: 56, form: ['W', 'D', 'W', 'W', 'D'], zone: 'ucl' }
  ],
  'serie-a': [
    { rank: 1, teamId: 'inter', name: 'Inter Milan', p: 27, w: 19, d: 5, l: 3, gf: 63, ga: 22, gd: 41, pts: 62, form: ['W', 'W', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 2, teamId: 'juventus', name: 'Juventus FC', p: 27, w: 15, d: 10, l: 2, gf: 47, ga: 21, gd: 26, pts: 55, form: ['D', 'W', 'W', 'D', 'W'], zone: 'ucl' },
    { rank: 3, teamId: 'milan', name: 'AC Milan', p: 27, w: 15, d: 7, l: 5, gf: 50, ga: 32, gd: 18, pts: 52, form: ['W', 'L', 'W', 'W', 'D'], zone: 'ucl' }
  ],
  'bundesliga': [
    { rank: 1, teamId: 'bayern', name: 'Bayern München', p: 25, w: 18, d: 4, l: 3, gf: 69, ga: 24, gd: 45, pts: 58, form: ['W', 'W', 'W', 'L', 'W'], zone: 'ucl' },
    { rank: 2, teamId: 'leverkusen', name: 'Bayer Leverkusen', p: 25, w: 16, d: 6, l: 3, gf: 57, ga: 28, gd: 29, pts: 54, form: ['W', 'D', 'W', 'W', 'D'], zone: 'ucl' },
    { rank: 3, teamId: 'dortmund', name: 'Borussia Dortmund', p: 25, w: 14, d: 5, l: 6, gf: 49, ga: 33, gd: 16, pts: 47, form: ['L', 'W', 'W', 'D', 'W'], zone: 'ucl' }
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
  // --- TRENDYOL SÜPER LİG ---
  {
    id: 'galatasaray',
    name: 'Galatasaray SK',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: 'RAMS Park (52.280)',
    founded: 1905,
    colors: ['#b81414', '#f39c12'],
    coach: 'Okan Buruk',
    logo: '🦁',
    rating: 85,
    stats: { played: 26, winRate: 85, avgGoals: 2.62, avgConceded: 0.81, cleanSheets: 13, form: ['W', 'W', 'W', 'D', 'W'] }
  },
  {
    id: 'fenerbahce',
    name: 'Fenerbahçe SK',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: 'Ülker Stadyumu (47.834)',
    founded: 1907,
    colors: ['#0c2461', '#f1c40f'],
    coach: 'José Mourinho',
    logo: '🐦',
    rating: 84,
    stats: { played: 26, winRate: 77, avgGoals: 2.42, avgConceded: 0.85, cleanSheets: 12, form: ['W', 'W', 'L', 'W', 'W'] }
  },
  {
    id: 'besiktas',
    name: 'Beşiktaş JK',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: 'Tüpraş Stadyumu (42.590)',
    founded: 1903,
    colors: ['#111111', '#ffffff'],
    coach: 'Ole Gunnar Solskjaer',
    logo: '🦅',
    rating: 81,
    stats: { played: 26, winRate: 62, avgGoals: 1.88, avgConceded: 1.07, cleanSheets: 10, form: ['D', 'W', 'W', 'W', 'L'] }
  },
  {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: 'Papara Park (40.782)',
    founded: 1967,
    colors: ['#800020', '#5dade2'],
    coach: 'Şenol Güneş',
    logo: '⚡',
    rating: 79,
    stats: { played: 26, winRate: 54, avgGoals: 1.73, avgConceded: 1.19, cleanSheets: 8, form: ['W', 'D', 'W', 'L', 'W'] }
  },
  {
    id: 'basaksehir',
    name: 'RAMS Başakşehir',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: 'Fatih Terim Stadı (17.156)',
    founded: 1990,
    colors: ['#e67e22', '#1c2833'],
    coach: 'Çağdaş Atan',
    logo: '🦉',
    rating: 77,
    stats: { played: 26, winRate: 46, avgGoals: 1.57, avgConceded: 1.26, cleanSheets: 7, form: ['W', 'L', 'D', 'W', 'D'] }
  },
  {
    id: 'samsunspor',
    name: 'Samsunspor',
    league: 'Trendyol Süper Lig',
    leagueId: 'super-lig',
    stadium: '19 Mayıs Stadyumu (33.919)',
    founded: 1965,
    colors: ['#c0392b', '#ffffff'],
    coach: 'Thomas Reis',
    logo: '🔴',
    rating: 76,
    stats: { played: 26, winRate: 46, avgGoals: 1.42, avgConceded: 1.23, cleanSheets: 6, form: ['L', 'W', 'W', 'D', 'L'] }
  },

  // --- PREMIER LEAGUE ---
  {
    id: 'mancity',
    name: 'Manchester City',
    league: 'Premier League',
    leagueId: 'premier-league',
    stadium: 'Etihad Stadium (53.400)',
    founded: 1880,
    colors: ['#68c5db', '#0c2461'],
    coach: 'Pep Guardiola',
    logo: '🚢',
    rating: 91,
    stats: { played: 27, winRate: 72, avgGoals: 2.48, avgConceded: 0.96, cleanSheets: 13, form: ['W', 'L', 'W', 'D', 'W'] }
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    league: 'Premier League',
    leagueId: 'premier-league',
    stadium: 'Emirates Stadium (60.704)',
    founded: 1886,
    colors: ['#ef0107', '#ffffff'],
    coach: 'Mikel Arteta',
    logo: '💣',
    rating: 89,
    stats: { played: 27, winRate: 74, avgGoals: 2.37, avgConceded: 0.81, cleanSheets: 14, form: ['W', 'D', 'W', 'W', 'W'] }
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    league: 'Premier League',
    leagueId: 'premier-league',
    stadium: 'Anfield (61.276)',
    founded: 1892,
    colors: ['#c8102e', '#00b2a9'],
    coach: 'Arne Slot',
    logo: '🔴',
    rating: 90,
    stats: { played: 27, winRate: 78, avgGoals: 2.52, avgConceded: 0.89, cleanSheets: 15, form: ['W', 'W', 'W', 'W', 'D'] }
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    league: 'Premier League',
    leagueId: 'premier-league',
    stadium: 'Stamford Bridge (40.341)',
    founded: 1905,
    colors: ['#034694', '#ffffff'],
    coach: 'Enzo Maresca',
    logo: '🦁',
    rating: 85,
    stats: { played: 27, winRate: 59, avgGoals: 1.93, avgConceded: 1.33, cleanSheets: 9, form: ['D', 'W', 'L', 'W', 'W'] }
  },
  {
    id: 'manunited',
    name: 'Manchester United',
    league: 'Premier League',
    leagueId: 'premier-league',
    stadium: 'Old Trafford (74.310)',
    founded: 1878,
    colors: ['#da291c', '#000000'],
    coach: 'Rúben Amorim',
    logo: '😈',
    rating: 84,
    stats: { played: 27, winRate: 52, avgGoals: 1.70, avgConceded: 1.41, cleanSheets: 8, form: ['W', 'W', 'L', 'D', 'W'] }
  },

  // --- LA LIGA ---
  {
    id: 'realmadrid',
    name: 'Real Madrid CF',
    league: 'La Liga EA Sports',
    leagueId: 'la-liga',
    stadium: 'Santiago Bernabéu (84.744)',
    founded: 1902,
    colors: ['#f5f6fa', '#d4af37'],
    coach: 'Carlo Ancelotti',
    logo: '👑',
    rating: 93,
    stats: { played: 27, winRate: 78, avgGoals: 2.45, avgConceded: 0.74, cleanSheets: 15, form: ['W', 'W', 'W', 'D', 'W'] }
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    league: 'La Liga EA Sports',
    leagueId: 'la-liga',
    stadium: 'Camp Nou (99.354)',
    founded: 1899,
    colors: ['#a50044', '#004d98'],
    coach: 'Hansi Flick',
    logo: '🔵',
    rating: 90,
    stats: { played: 27, winRate: 74, avgGoals: 2.63, avgConceded: 0.96, cleanSheets: 13, form: ['W', 'W', 'D', 'W', 'W'] }
  },
  {
    id: 'atletico',
    name: 'Atlético de Madrid',
    league: 'La Liga EA Sports',
    leagueId: 'la-liga',
    stadium: 'Civitas Metropolitano (70.460)',
    founded: 1903,
    colors: ['#cb3524', '#ffffff'],
    coach: 'Diego Simeone',
    logo: '🔴',
    rating: 87,
    stats: { played: 27, winRate: 67, avgGoals: 1.78, avgConceded: 0.70, cleanSheets: 14, form: ['W', 'D', 'W', 'W', 'D'] }
  },

  // --- SERIE A ---
  {
    id: 'inter',
    name: 'Inter Milan',
    league: 'Serie A Enilive',
    leagueId: 'serie-a',
    stadium: 'San Siro (75.923)',
    founded: 1908,
    colors: ['#0019a5', '#000000'],
    coach: 'Simone Inzaghi',
    logo: '🐍',
    rating: 88,
    stats: { played: 27, winRate: 70, avgGoals: 2.33, avgConceded: 0.81, cleanSheets: 14, form: ['W', 'W', 'W', 'D', 'W'] }
  },
  {
    id: 'milan',
    name: 'AC Milan',
    league: 'Serie A Enilive',
    leagueId: 'serie-a',
    stadium: 'San Siro (75.923)',
    founded: 1899,
    colors: ['#fb090b', '#000000'],
    coach: 'Paulo Fonseca',
    logo: '🔴',
    rating: 85,
    stats: { played: 27, winRate: 59, avgGoals: 1.85, avgConceded: 1.18, cleanSheets: 11, form: ['W', 'L', 'W', 'W', 'D'] }
  },
  {
    id: 'juventus',
    name: 'Juventus FC',
    league: 'Serie A Enilive',
    leagueId: 'serie-a',
    stadium: 'Allianz Stadium (41.507)',
    founded: 1897,
    colors: ['#000000', '#ffffff'],
    coach: 'Thiago Motta',
    logo: '🦓',
    rating: 86,
    stats: { played: 27, winRate: 63, avgGoals: 1.74, avgConceded: 0.77, cleanSheets: 15, form: ['D', 'W', 'W', 'D', 'W'] }
  },

  // --- BUNDESLIGA ---
  {
    id: 'bayern',
    name: 'Bayern München',
    league: 'Bundesliga',
    leagueId: 'bundesliga',
    stadium: 'Allianz Arena (75.024)',
    founded: 1900,
    colors: ['#dc052d', '#ffffff'],
    coach: 'Vincent Kompany',
    logo: '🔴',
    rating: 91,
    stats: { played: 25, winRate: 76, avgGoals: 2.76, avgConceded: 0.96, cleanSheets: 12, form: ['W', 'W', 'W', 'L', 'W'] }
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    league: 'Bundesliga',
    leagueId: 'bundesliga',
    stadium: 'Signal Iduna Park (81.365)',
    founded: 1909,
    colors: ['#fde100', '#000000'],
    coach: 'Nuri Şahin',
    logo: '🐝',
    rating: 85,
    stats: { played: 25, winRate: 60, avgGoals: 1.96, avgConceded: 1.32, cleanSheets: 9, form: ['L', 'W', 'W', 'D', 'W'] }
  },
  {
    id: 'leverkusen',
    name: 'Bayer Leverkusen',
    league: 'Bundesliga',
    leagueId: 'bundesliga',
    stadium: 'BayArena (30.210)',
    founded: 1904,
    colors: ['#e32221', '#000000'],
    coach: 'Xabi Alonso',
    logo: '🦁',
    rating: 88,
    stats: { played: 25, winRate: 68, avgGoals: 2.28, avgConceded: 1.12, cleanSheets: 10, form: ['W', 'D', 'W', 'W', 'D'] }
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

  getTeamsByLeague(leagueId = 'all') {
    if (!leagueId || leagueId === 'all') return this.teams;
    return this.teams.filter(t => t.leagueId === leagueId);
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
