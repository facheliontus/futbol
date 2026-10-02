// ==========================================================
// FUTBOL KARİYER, EKONOMİ, MAĞAZA VE LİDERLİK SİSTEMİ (career.js)
// ==========================================================

const CLUBS_DATABASE = {
  // ==========================================================
  // 1. LİG KULÜPLERİ (Tier 1)
  // ==========================================================
  'anadolu': {
    id: 'anadolu',
    name: 'Anadolu Kaplanları FK',
    short: 'AKF',
    tier: 1,
    reputation: 60,
    colors: { primary: '#e67e22', secondary: '#2c3e50', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.2M',
    badge: '🐅'
  },
  'marmara': {
    id: 'marmara',
    name: 'Marmara Fırtınası SK',
    short: 'MFR',
    tier: 1,
    reputation: 62,
    colors: { primary: '#2980b9', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.5M',
    badge: '⚡'
  },
  'ege': {
    id: 'ege',
    name: 'Ege Yıldızları',
    short: 'EYL',
    tier: 1,
    reputation: 64,
    colors: { primary: '#27ae60', secondary: '#2c3e50', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.8M',
    badge: '⭐'
  },
  'genclerbirligi': {
    id: 'genclerbirligi',
    name: 'Başkent Kırmızı Kara',
    short: 'BKK',
    tier: 1,
    reputation: 68,
    colors: { primary: '#c0392b', secondary: '#111111', text: '#ffffff' },
    league: '1. Lig',
    budget: '€2.5M',
    badge: '🔴'
  },
  'sakaryaspor': {
    id: 'sakaryaspor',
    name: 'Sakarya Yeşil Siyah',
    short: 'SYS',
    tier: 1,
    reputation: 67,
    colors: { primary: '#16a085', secondary: '#111111', text: '#ffffff' },
    league: '1. Lig',
    budget: '€2.2M',
    badge: '🟢'
  },
  'kocaelispor': {
    id: 'kocaelispor',
    name: 'Körfez Yeşil Siyah',
    short: 'KYS',
    tier: 1,
    reputation: 68,
    colors: { primary: '#27ae60', secondary: '#111111', text: '#ffffff' },
    league: '1. Lig',
    budget: '€2.8M',
    badge: '🌲'
  },
  'bandirmaspor': {
    id: 'bandirmaspor',
    name: 'Bandırma Bordo Beyaz',
    short: 'BBB',
    tier: 1,
    reputation: 65,
    colors: { primary: '#8e44ad', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.9M',
    badge: '🟣'
  },
  'corumfk': {
    id: 'corumfk',
    name: 'İç Anadolu Kırmızı Siyah',
    short: 'AKS',
    tier: 1,
    reputation: 63,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.7M',
    badge: '🛡️'
  },
  'amedspor': {
    id: 'amedspor',
    name: 'Güneydoğu Yeşil Kırmızı',
    short: 'GYK',
    tier: 1,
    reputation: 66,
    colors: { primary: '#27ae60', secondary: '#c0392b', text: '#ffffff' },
    league: '1. Lig',
    budget: '€2.1M',
    badge: '🦅'
  },
  'boluspor': {
    id: 'boluspor',
    name: 'Köroğlu Kırmızı Beyaz',
    short: 'KKB',
    tier: 1,
    reputation: 63,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.6M',
    badge: '🔴'
  },
  'umraniyespor': {
    id: 'umraniyespor',
    name: 'Ümraniye Kırmızı Beyaz',
    short: 'UKB',
    tier: 1,
    reputation: 62,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€1.5M',
    badge: '⚪'
  },
  'igdirfk': {
    id: 'igdirfk',
    name: 'Aras Yeşil Beyaz',
    short: 'AYB',
    tier: 1,
    reputation: 64,
    colors: { primary: '#27ae60', secondary: '#ffffff', text: '#ffffff' },
    league: '1. Lig',
    budget: '€2.3M',
    badge: '⛰️'
  },

  // ==========================================================
  // SÜPER LİG KULÜPLERİ (Tier 2 - Nostaljik Parodi İsimler)
  // ==========================================================
  'galatasaray': {
    id: 'galatasaray',
    name: 'Sarı Kırmızı Aslanlar',
    short: 'SKA',
    tier: 2,
    reputation: 84,
    colors: { primary: '#b81414', secondary: '#f39c12', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€45M',
    badge: '🦁'
  },
  'fenerbahce': {
    id: 'fenerbahce',
    name: 'Sarı Kanarya SK',
    short: 'SKS',
    tier: 2,
    reputation: 84,
    colors: { primary: '#0c2461', secondary: '#f1c40f', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€44M',
    badge: '🐦'
  },
  'besiktas': {
    id: 'besiktas',
    name: 'Kara Kartal JK',
    short: 'KKJ',
    tier: 2,
    reputation: 82,
    colors: { primary: '#111111', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€35M',
    badge: '🦅'
  },
  'trabzonspor': {
    id: 'trabzonspor',
    name: 'Karadeniz Fırtınası',
    short: 'KDF',
    tier: 2,
    reputation: 80,
    colors: { primary: '#6e1d24', secondary: '#0984e3', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€28M',
    badge: '🌊'
  },
  'basaksehir': {
    id: 'basaksehir',
    name: 'Turuncu Bozkır FK',
    short: 'TBF',
    tier: 2,
    reputation: 77,
    colors: { primary: '#e67e22', secondary: '#0c2461', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€20M',
    badge: '🦉'
  },
  'samsunspor': {
    id: 'samsunspor',
    name: 'Kırmızı Şimşekler',
    short: 'KSM',
    tier: 2,
    reputation: 76,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€18M',
    badge: '🔴'
  },
  'goztepe': {
    id: 'goztepe',
    name: 'Göztepe Sahil SK',
    short: 'GSS',
    tier: 2,
    reputation: 76,
    colors: { primary: '#f1c40f', secondary: '#c0392b', text: '#111111' },
    league: 'Süper Lig',
    budget: '€17M',
    badge: '⚓'
  },
  'eyupspor': {
    id: 'eyupspor',
    name: 'Eflatun Şövalyeler',
    short: 'EFS',
    tier: 2,
    reputation: 75,
    colors: { primary: '#6c5ce7', secondary: '#f1c40f', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€16M',
    badge: '💜'
  },
  'antalyaspor': {
    id: 'antalyaspor',
    name: 'Akdeniz Akrepleri',
    short: 'AKA',
    tier: 2,
    reputation: 74,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€14M',
    badge: '🦂'
  },
  'sivasspor': {
    id: 'sivasspor',
    name: 'Yiğidolar Kırmızı Beyaz',
    short: 'YKB',
    tier: 2,
    reputation: 73,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€12M',
    badge: '⚔️'
  },
  'kasimpasa': {
    id: 'kasimpasa',
    name: 'Haliç Lacivert Beyaz',
    short: 'HLB',
    tier: 2,
    reputation: 73,
    colors: { primary: '#0984e3', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€13M',
    badge: '⚓'
  },
  'konyaspor': {
    id: 'konyaspor',
    name: 'Yeşil Kartallar SK',
    short: 'YKS',
    tier: 2,
    reputation: 73,
    colors: { primary: '#27ae60', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€13M',
    badge: '🦅'
  },
  'rizespor': {
    id: 'rizespor',
    name: 'Çayeli Yeşil Mavi',
    short: 'CYM',
    tier: 2,
    reputation: 73,
    colors: { primary: '#27ae60', secondary: '#0984e3', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€12M',
    badge: '🍵'
  },
  'gaziantepfk': {
    id: 'gaziantepfk',
    name: 'Kırmızı Şahinler FK',
    short: 'KSF',
    tier: 2,
    reputation: 72,
    colors: { primary: '#c0392b', secondary: '#111111', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€11M',
    badge: '🦅'
  },
  'alanyaspor': {
    id: 'alanyaspor',
    name: 'Güney Turuncu Yeşil',
    short: 'GTY',
    tier: 2,
    reputation: 72,
    colors: { primary: '#e67e22', secondary: '#27ae60', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€11M',
    badge: '🏰'
  },
  'kayserispor': {
    id: 'kayserispor',
    name: 'Erciyes Sarı Kırmızı',
    short: 'ESK',
    tier: 2,
    reputation: 71,
    colors: { primary: '#f1c40f', secondary: '#c0392b', text: '#111111' },
    league: 'Süper Lig',
    budget: '€10M',
    badge: '🏔️'
  },
  'bodrumfk': {
    id: 'bodrumfk',
    name: 'Mavi Körfez FK',
    short: 'MKF',
    tier: 2,
    reputation: 70,
    colors: { primary: '#27ae60', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€9M',
    badge: '⛵'
  },
  'hatayspor': {
    id: 'hatayspor',
    name: 'Asi Nehri Bordo Beyaz',
    short: 'ANB',
    tier: 2,
    reputation: 70,
    colors: { primary: '#8b0000', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€9M',
    badge: '🌿'
  },
  'adanademirspor': {
    id: 'adanademirspor',
    name: 'Mavi Şimşekler ADS',
    short: 'MSD',
    tier: 2,
    reputation: 71,
    colors: { primary: '#0984e3', secondary: '#0c2461', text: '#ffffff' },
    league: 'Süper Lig',
    budget: '€10M',
    badge: '⚡'
  },

  // ==========================================================
  // AVRUPA & DÜNYA DEVLERİ (Tier 3 - PES Klasik Lisanssız İsimler)
  // ==========================================================
  'realmadrid': {
    id: 'realmadrid',
    name: 'Chamartin B (Madrid Beyaz)',
    short: 'CHM',
    tier: 3,
    reputation: 96,
    colors: { primary: '#f5f6fa', secondary: '#d4af37', text: '#1e272e' },
    league: 'Avrupa Ligi',
    budget: '€140M',
    badge: '👑'
  },
  'mancity': {
    id: 'mancity',
    name: 'Man Blue (Mavi Gökler)',
    short: 'MNB',
    tier: 3,
    reputation: 95,
    colors: { primary: '#68c5db', secondary: '#0c2461', text: '#ffffff' },
    league: 'İngiltere Ligi',
    budget: '€160M',
    badge: '🚢'
  },
  'bayern': {
    id: 'bayern',
    name: 'Bavyera Kırmızı (Isar FC)',
    short: 'BVR',
    tier: 3,
    reputation: 94,
    colors: { primary: '#eb2f06', secondary: '#0c2461', text: '#ffffff' },
    league: 'Almanya Ligi',
    budget: '€120M',
    badge: '🔴'
  },
  'arsenal': {
    id: 'arsenal',
    name: 'Kuzey Londra Topçuları',
    short: 'KLT',
    tier: 3,
    reputation: 93,
    colors: { primary: '#e55039', secondary: '#ffffff', text: '#ffffff' },
    league: 'İngiltere Ligi',
    budget: '€110M',
    badge: '💣'
  },
  'barcelona': {
    id: 'barcelona',
    name: 'Katalonya Blaugrana',
    short: 'KTB',
    tier: 3,
    reputation: 94,
    colors: { primary: '#0984e3', secondary: '#b81414', text: '#ffffff' },
    league: 'İspanya Ligi',
    budget: '€115M',
    badge: '🔵'
  },
  'liverpool': {
    id: 'liverpool',
    name: 'Merseyside Red (Liman Kırmızıları)',
    short: 'MSR',
    tier: 3,
    reputation: 93,
    colors: { primary: '#c0392b', secondary: '#f1c40f', text: '#ffffff' },
    league: 'İngiltere Ligi',
    budget: '€115M',
    badge: '🔴'
  },
  'psg': {
    id: 'psg',
    name: 'Paris Başkent Lacivert',
    short: 'PBL',
    tier: 3,
    reputation: 92,
    colors: { primary: '#0c2461', secondary: '#c0392b', text: '#ffffff' },
    league: 'Fransa Ligi',
    budget: '€130M',
    badge: '🗼'
  },
  'inter': {
    id: 'inter',
    name: 'Lombardia Mavi Siyah',
    short: 'LMS',
    tier: 3,
    reputation: 91,
    colors: { primary: '#0984e3', secondary: '#111111', text: '#ffffff' },
    league: 'İtalya Ligi',
    budget: '€90M',
    badge: '🐍'
  },
  'juventus': {
    id: 'juventus',
    name: 'Piemonte Siyah Beyaz (PM Black White)',
    short: 'PMB',
    tier: 3,
    reputation: 90,
    colors: { primary: '#111111', secondary: '#ffffff', text: '#ffffff' },
    league: 'İtalya Ligi',
    budget: '€85M',
    badge: '🦓'
  },
  'leverkusen': {
    id: 'leverkusen',
    name: 'Ren Kırmızı Siyah',
    short: 'RKS',
    tier: 3,
    reputation: 90,
    colors: { primary: '#c0392b', secondary: '#111111', text: '#ffffff' },
    league: 'Almanya Ligi',
    budget: '€85M',
    badge: '🦁'
  },
  'atletico': {
    id: 'atletico',
    name: 'Manzanares Kırmızı Beyaz',
    short: 'MZB',
    tier: 3,
    reputation: 89,
    colors: { primary: '#c0392b', secondary: '#0984e3', text: '#ffffff' },
    league: 'İspanya Ligi',
    budget: '€80M',
    badge: '🐻'
  }
};

// ==========================================================
// MAĞAZA KATALOĞU (STORE CATALOG - HIGH TICKET SALARY ITEMS)
// ==========================================================
const STORE_CATALOG = {
  balls: [
    {
      id: 'ball_pro',
      name: 'FIFA Quality Pro - Golden Panelli',
      price: 0,
      desc: 'Aerodinamik altın/cyan kıvrımlı panellere sahip resmi maç topu.',
      icon: '⚽',
      badge: 'STANDART',
      accentColor: '#ffd700'
    },
    {
      id: 'ball_classic',
      name: 'Klasik Deri Nostalji Topu',
      price: 25000,
      desc: '1970 Mexico tarzı elle dikilmiş gerçek deri retro futbol topu.',
      icon: '⚽',
      badge: 'RETRO',
      accentColor: '#cbd5e1'
    },
    {
      id: 'ball_cyber',
      name: 'Cyberpunk Neon Matrix Topu',
      price: 280000,
      desc: 'Havada parıldayan neon pembe & camgöbeği ızgaralı hologramik maç topu.',
      icon: '🔮',
      badge: 'CYBER',
      accentColor: '#00f2fe'
    },
    {
      id: 'ball_lava',
      name: 'Alevli Volkanik Magma Topu',
      price: 850000,
      desc: 'Kor gibi parlayan volkanik lav desenli, havayı yakan özel şut topu.',
      icon: '🔥',
      badge: 'EFSANEVİ',
      accentColor: '#ff3366'
    },
    {
      id: 'ball_gold',
      name: '24K Saf Altın Ballon d\'Or Topu',
      price: 2500000,
      desc: 'Tamamı 24 karat saf altın kaplama, dünya yıldızlarına özel şaheser.',
      icon: '👑',
      badge: 'LUXURY',
      accentColor: '#f1c40f'
    }
  ],
  boots: [
    {
      id: 'boot_copa',
      name: 'Copa Pure Klasik Deri',
      price: 0,
      desc: 'Geleneksel siyah dana derisi ve konforlu çivili krampon.',
      icon: '👟',
      badge: 'STANDART',
      accentColor: '#94a3b8'
    },
    {
      id: 'boot_predator',
      name: 'Predator Strike Neon Kırmızı',
      price: 95000,
      desc: 'Falsolu plase ve füze vuruşlar için kauçuk falso panelleri.',
      icon: '⚡',
      badge: 'GÜÇ',
      accentColor: '#ff3366'
    },
    {
      id: 'boot_mercurial',
      name: 'Mercurial Trivela Cyan Edition',
      price: 350000,
      desc: 'Dış ayak vuruşlarında maksimum kamçı etkisi sağlayan aerodinamik saya.',
      icon: '🌪️',
      badge: 'TRİVELA',
      accentColor: '#00f2fe'
    },
    {
      id: 'boot_phantom',
      name: 'Phantom GX Altın Çivili Pro',
      price: 1250000,
      desc: 'Altın kaplama 8 çivi ve lazer kesim temas yüzeyi ile kusursuz vuruş.',
      icon: '🏆',
      badge: 'ELİT',
      accentColor: '#ffd700'
    },
    {
      id: 'boot_diamond',
      name: 'Diamond Elite Kristal Krampon',
      price: 4500000,
      desc: 'Elmas parıltılı sayası ve ultra hafif karbon fiber tabanlı lüks model.',
      icon: '💎',
      badge: 'MİTİK',
      accentColor: '#a78bfa'
    }
  ],
  hairs: [
    {
      id: 'hair_fade',
      name: 'Klasik Fade & Atletik Bandana',
      price: 0,
      desc: 'Modern sporcu saç kesimi ve teri tutan beyaz kafa bandı.',
      icon: '✂️',
      badge: 'STANDART',
      accentColor: '#ffffff'
    },
    {
      id: 'hair_buzz',
      name: 'Modern Asker Traşı (Buzz Cut)',
      price: 15000,
      desc: 'Net, sert ve tavizsiz kısa saç stili.',
      icon: '💈',
      badge: 'POPÜLER',
      accentColor: '#64748b'
    },
    {
      id: 'hair_samurai',
      name: 'Samuray Topuz & Ninja Bandı',
      price: 75000,
      desc: 'Zlatan / Bale tarzı tepede toplanmış karizmatik topuz.',
      icon: '🥋',
      badge: 'ÖZEL',
      accentColor: '#e67e22'
    },
    {
      id: 'hair_platinum',
      name: 'Platin Sarı Boyalı Saç (Neymar Stili)',
      price: 220000,
      desc: 'Sahada anında fark edilen platin sarısı parlak stil.',
      icon: '✨',
      badge: 'YILDIZ',
      accentColor: '#fef08a'
    },
    {
      id: 'hair_afro',
      name: 'Kıvırcık Hacimli Efsane Afro',
      price: 650000,
      desc: '1980lerin ve Brezilya sambacılarının ikonik afro saç stili.',
      icon: '🌀',
      badge: 'KLASİK',
      accentColor: '#d97706'
    },
    {
      id: 'hair_goldcrown',
      name: 'Altın Taçlı Kral Saç Modeli',
      price: 2000000,
      desc: 'Kraliyet altın tacı ve altın parıltılı şampiyon saç tasarımı.',
      icon: '👑',
      badge: 'KRAL',
      accentColor: '#ffd700'
    }
  ],
  kits: [
    {
      id: 'kit_club',
      name: 'Kulüp Resmi Maç Forması',
      price: 0,
      desc: 'Mevcut kulübünün orijinal renkleri ve arması.',
      icon: '👕',
      badge: 'RESMÎ',
      accentColor: '#38bdf8'
    },
    {
      id: 'kit_blackgold',
      name: 'Gece Siyahı & Altın V-Yaka Özel Kit',
      price: 300000,
      desc: 'Mat siyah kumaş üzerine 24K altın yaldızlı sponsor ve numara detayları.',
      icon: '🖤',
      badge: 'VIP',
      accentColor: '#f1c40f'
    },
    {
      id: 'kit_retro',
      name: '1990s Retro Nostalji Çubuklu Kit',
      price: 950000,
      desc: 'Futbolun altın çağının dikey nostaljik çizgileri ve vintage yaka.',
      icon: '⭐',
      badge: 'RETRO',
      accentColor: '#ec4899'
    },
    {
      id: 'kit_cyber',
      name: 'Cyberpunk Hologram 2050 Kiti',
      price: 3000000,
      desc: 'Işık saçan dinamik devre hatlarına sahip geleceğin zırh forması.',
      icon: '🌌',
      badge: 'GELECEK',
      accentColor: '#00ff88'
    }
  ]
};

// ==========================================================
// OYUNCU TOPLULUĞU LİDERLİK TABLOSU VERİLERİ (ONLINE SITE PLAYERS)
// ==========================================================
const BASE_LEADERBOARD = [
  { name: 'TrivelaMaster_99', club: 'Chamartin B (Madrid Beyaz)', ovr: 89, money: 34500000, country: '🇹🇷', isIcon: false },
  { name: 'KadıköyBoğası_FB', club: 'Sarı Kanarya SK', ovr: 88, money: 29800000, country: '🇹🇷', isIcon: false },
  { name: 'AslanYürek_GS', club: 'Sarı Kırmızı Aslanlar', ovr: 88, money: 28500000, country: '🇹🇷', isIcon: false },
  { name: 'PanterKaleci_34', club: 'Kara Kartal JK', ovr: 87, money: 24200000, country: '🇹🇷', isIcon: false },
  { name: 'FalsoKralı_Arda', club: 'Chamartin B (Madrid Beyaz)', ovr: 86, money: 21500000, country: '🇹🇷', isIcon: false },
  { name: 'KuzeyRüzgarı_61', club: 'Karadeniz Fırtınası', ovr: 85, money: 18400000, country: '🇹🇷', isIcon: false },
  { name: 'SniperKemal_10', club: 'Man Blue (Mavi Gökler)', ovr: 85, money: 17200000, country: '🇹🇷', isIcon: false },
  { name: 'BuzAdam_90', club: 'Bavyera Kırmızı (Isar FC)', ovr: 84, money: 15600000, country: '🇹🇷', isIcon: false },
  { name: 'GöztepeTayfa_35', club: 'Göztepe Sahil SK', ovr: 83, money: 12800000, country: '🇹🇷', isIcon: false },
  { name: 'GeceKartalı_06', club: 'Başkent Kırmızı Kara', ovr: 82, money: 9500000, country: '🇹🇷', isIcon: false },
  { name: 'Rövaşata_Emre', club: 'Katalonya Blaugrana', ovr: 81, money: 8200000, country: '🇹🇷', isIcon: false },
  { name: 'ÇölFırtınası_ADS', club: 'Mavi Şimşekler ADS', ovr: 80, money: 6700000, country: '🇹🇷', isIcon: false }
];

class CareerManager {
  constructor() {
    this.player = null;
    this.season = 1;
    this.currentMatchIndex = 0;
    this.matchesPerSeason = 6;
    this.currentMatch = null;
    this.seasonStats = {
      matches: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      cleanSheets: 0,
      totalRating: 0
    };
    this.history = [];
    this.loadProfile();
  }

  hasSavedProfile() {
    return localStorage.getItem('fc_career_player') !== null;
  }

  createProfile(name, position, jerseyNumber, startingClubId = 'anadolu', preferredFoot = 'R') {
    const club = CLUBS_DATABASE[startingClubId] || CLUBS_DATABASE['anadolu'];
    const startingWage = (club.tier === 1) ? 15000 : (club.tier === 2 ? 65000 : 220000);
    const startingMoney = startingWage * 3; // Başlangıç birikimi

    this.player = {
      name: name.trim() || 'Yıldız Oyuncu',
      position: position, // 'ST' (Forvet), 'GK' (Kaleci), 'CAM' (Orta Saha)
      preferredFoot: preferredFoot || 'R', // 'R' (Sağ Ayak), 'L' (Sol Ayak)
      jerseyNumber: parseInt(jerseyNumber) || 10,
      clubId: club.id,
      overall: position === 'GK' ? 74 : 76,
      marketValue: 1500000,
      money: startingMoney,
      wage: startingWage,
      totalCareerGoals: 0,
      totalCareerSaves: 0,
      purchasedItems: ['ball_pro', 'boot_copa', 'hair_fade', 'kit_club'],
      equippedBall: 'ball_pro',
      equippedBoot: 'boot_copa',
      equippedHair: 'hair_fade',
      equippedKit: 'kit_club',
      trophies: []
    };
    this.season = 1;
    this.currentMatchIndex = 0;
    this.resetSeasonStats();
    this.saveProfile();
  }

  setPreferredFoot(foot) {
    if (!this.player) return;
    this.player.preferredFoot = (foot === 'L' ? 'L' : 'R');
    this.saveProfile();
  }

  loadProfile() {
    try {
      const data = localStorage.getItem('fc_career_player');
      if (data) {
        this.player = JSON.parse(data);
        if (!this.player.preferredFoot) this.player.preferredFoot = 'R';
        if (this.player.money === undefined) this.player.money = 50000;
        if (!this.player.purchasedItems) this.player.purchasedItems = ['ball_pro', 'boot_copa', 'hair_fade', 'kit_club'];
        if (!this.player.equippedBall) this.player.equippedBall = 'ball_pro';
        if (!this.player.equippedBoot) this.player.equippedBoot = 'boot_copa';
        if (!this.player.equippedHair) this.player.equippedHair = 'hair_fade';
        if (!this.player.equippedKit) this.player.equippedKit = 'kit_club';

        this.season = parseInt(localStorage.getItem('fc_career_season')) || 1;
        this.currentMatchIndex = parseInt(localStorage.getItem('fc_career_match_idx')) || 0;
        const stats = localStorage.getItem('fc_career_season_stats');
        if (stats) this.seasonStats = JSON.parse(stats);
      }
    } catch (e) {
      console.warn("Kayıt yüklenemedi:", e);
    }
  }

  saveProfile() {
    if (!this.player) return;
    localStorage.setItem('fc_career_player', JSON.stringify(this.player));
    localStorage.setItem('fc_career_season', this.season.toString());
    localStorage.setItem('fc_career_match_idx', this.currentMatchIndex.toString());
    localStorage.setItem('fc_career_season_stats', JSON.stringify(this.seasonStats));
  }

  resetSeasonStats() {
    this.seasonStats = {
      matches: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      cleanSheets: 0,
      totalRating: 0
    };
  }

  getCurrentClub() {
    if (!this.player) return CLUBS_DATABASE['anadolu'];
    return CLUBS_DATABASE[this.player.clubId] || CLUBS_DATABASE['anadolu'];
  }

  // ==========================================================
  // GERÇEKÇİ LİG EŞLEŞTİRMESİ & SENARYO OLUŞTURMA
  // ==========================================================
  generateNextMatch() {
    const club = this.getCurrentClub();
    const matchNum = this.currentMatchIndex + 1;

    // YALNIZCA OYUNCUNUN BULUNDUĞU LİGİN TAKIMLARINI SEÇ:
    const leagueRivals = Object.values(CLUBS_DATABASE).filter(c => c.tier === club.tier && c.id !== club.id);
    let chosenRival;
    if (leagueRivals.length > 0) {
      const rivalIdx = (this.season * 5 + matchNum) % leagueRivals.length;
      chosenRival = leagueRivals[rivalIdx];
    } else {
      chosenRival = { name: 'Rakip FK', badge: '🛡️', colors: { primary: '#34495e' } };
    }

    // Rakibin bu maçta atacağı gol hedefi (Biz de gol yiyelim mantığı: 0, 1 veya 2 gol)
    const targetAwayGoals = (club.tier === 1) ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3);

    let scenarios = [];
    if (this.player.position === 'GK') {
      // Kaleci Senaryoları
      const pool = [
        { type: 'penalty', title: '90. Dakika Penaltı Kurtarışı!', distance: 11, spotX: 0, wall: 0, desc: 'Rakip forvet topun başında! [A/D] ile yere atla veya [A/D + Space] ile 90\'a uç!' },
        { type: 'freekick', title: '21 Metre Sol Çapraz Frikik', distance: 21, spotX: -5.0, wall: 4, desc: 'Sol çaprazdan baraj üstü tehlikeli falso! Köşeyi kapat ve devleş!' },
        { type: 'freekick', title: '24 Metre Sağ Çapraz (Beckham Kavis)', distance: 24, spotX: 6.2, wall: 4, desc: 'Sağdan kalenin 90\'ına sert kavis geliyor! [D + Space] ile uç!' },
        { type: 'freekick', title: '28 Metre Roberto Carlos Roketi!', distance: 28, spotX: -8.5, wall: 5, desc: 'Çok sert mermi gibi geliyor! Zamanlamanı iyi ayarla ve çel!' },
        { type: 'freekick', title: '18 Metre Ceza Yayı Karşıdan Frikik', distance: 18, spotX: 0, wall: 4, desc: 'Çok yakın mesafe! Barajın üstünden düşen topu üst direkte tokatla!' },
        { type: 'penalty', title: 'Kupa Maçı Penaltı Düellosu', distance: 11, spotX: 0, wall: 0, desc: 'Baskı altında soğukkanlı kal! Doğru köşeye uzan!' },
        { type: 'freekick', title: '19 Metre Dar Açı Frikik', distance: 19, spotX: 7.8, wall: 3, desc: 'Dar açıdan doğrudan kaleye sert vuruş geliyor! Direk dibini koru!' },
        { type: 'freekick', title: '30 Metre Knuckleball / Bomba Şut', distance: 30, spotX: 2.0, wall: 5, desc: 'Havada yön değiştiren mermi! Reflekslerini konuştur!' }
      ];
      scenarios = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    } else {
      // Forvet ve Orta Saha Senaryoları
      const pool = [
        { type: 'penalty', title: 'Hakem Penaltı Noktasını Gösterdi!', distance: 11, spotX: 0, wall: 0, desc: 'Soğukkanlı kal, kaleciyi ters köşeye yatır veya 90\'a as!' },
        { type: 'freekick', title: '17 Metre Ceza Sahası Çizgisi Frikik', distance: 17, spotX: -3.5, wall: 3, desc: 'Ceza yayı önü çok yakın mesafe! Barajın üstünden köşeye bırak!' },
        { type: 'freekick', title: '20 Metre Ceza Yayı Karşıdan Vuruş', distance: 20, spotX: 0, wall: 4, desc: 'Tam karşıdan net bir frikik fırsatı! Barajı aşırtıp köşeye tak!' },
        { type: 'freekick', title: '22 Metre Sol Çapraz Serbest Vuruş', distance: 22, spotX: -5.5, wall: 4, desc: 'Sol çaprazdan sağ köşeye nefis bir plase veya sert falso gönder!' },
        { type: 'freekick', title: '24 Metre Sağ Çapraz (Trivela & Kavis)', distance: 24, spotX: 6.2, wall: 4, desc: 'Sağ çaprazdan dış ayak trivelayla [G] veya falsolu kaleciyi çaresiz bırak!' },
        { type: 'freekick', title: '28 Metre Roberto Carlos Füzesi!', distance: 28, spotX: -8.5, wall: 5, desc: 'Sol açık açıdan barajın dışından ters kavisle 90\'a roket yolla!' },
        { type: 'freekick', title: '30 Metre Uzak Mesafe Bomba Şut', distance: 30, spotX: 2.0, wall: 5, desc: 'Çok uzak mesafe! Maksimum güçle tavana veya direk dibine sert şut çıkar!' },
        { type: 'freekick', title: '19 Metre Dar Açı Frikik', distance: 19, spotX: 7.8, wall: 3, desc: 'Sağ dar açıdan ön direğe sert veya uzak direğin 90\'ına aşırtma vur!' },
        { type: 'freekick', title: '90+3 Son Dakika Galibiyet Frikiki', distance: 26, spotX: -4.0, wall: 4, desc: 'Tüm stat nefesini tuttu! Barajın üstünden köşeye falsola ve maçı bitir!' },
        { type: 'penalty', title: 'Kupa Finali Seri Penaltı', distance: 11, spotX: 0, wall: 0, desc: 'Tarihi an! Çatala mermiyi gönder ve kupayı getir!' }
      ];
      scenarios = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    this.currentMatch = {
      matchNumber: matchNum,
      homeTeam: club.name,
      awayTeam: chosenRival.name,
      awayClub: chosenRival,
      scenarios: scenarios,
      currentScenarioIdx: 0,
      goalsThisMatch: 0,
      assistsThisMatch: 0,
      savesThisMatch: 0,
      matchScoreHome: 0,
      matchScoreAway: 0,
      targetAwayGoals: targetAwayGoals,
      awayGoalsConceded: 0
    };

    return this.currentMatch;
  }

  recordScenarioSuccess(type) {
    if (!this.currentMatch) return;
    if (type === 'goal') {
      this.currentMatch.goalsThisMatch++;
      this.currentMatch.matchScoreHome++;
      this.seasonStats.goals++;
      if (this.player) this.player.totalCareerGoals++;
    } else if (type === 'save') {
      this.currentMatch.savesThisMatch++;
      this.seasonStats.saves++;
      if (this.player) this.player.totalCareerSaves++;
    } else if (type === 'assist') {
      this.currentMatch.assistsThisMatch++;
      this.seasonStats.assists++;
    }
  }

  // RAKİP KONTRA ATAKLA GOL ATMA SİMÜLASYONU ("Biz de gol yiyelim")
  triggerOpponentGoalCheck() {
    if (!this.currentMatch) return null;
    if (this.currentMatch.awayGoalsConceded < this.currentMatch.targetAwayGoals) {
      this.currentMatch.matchScoreAway++;
      this.currentMatch.awayGoalsConceded++;
      return {
        conceded: true,
        rival: this.currentMatch.awayTeam,
        homeScore: this.currentMatch.matchScoreHome,
        awayScore: this.currentMatch.matchScoreAway
      };
    }
    return null;
  }

  // ==========================================================
  // MAÇ SONU: MAAŞ, PRİMLER VE KAZANÇ HESAPLAMA
  // ==========================================================
  finishMatch() {
    if (!this.currentMatch) return null;
    this.seasonStats.matches++;

    // Rakibin kalan hedef gollerini ekle
    while (this.currentMatch.awayGoalsConceded < this.currentMatch.targetAwayGoals) {
      this.currentMatch.matchScoreAway++;
      this.currentMatch.awayGoalsConceded++;
    }

    const homeScore = this.currentMatch.matchScoreHome;
    const awayScore = this.currentMatch.matchScoreAway;
    const isWin = homeScore > awayScore;
    const isDraw = homeScore === awayScore;

    // Maç puanı hesapla (5.0 - 10.0 arası)
    let matchRating = 6.0;
    if (this.player.position === 'GK') {
      matchRating += (this.currentMatch.savesThisMatch * 1.3);
      if (awayScore === 0) matchRating += 1.2;
    } else {
      matchRating += (this.currentMatch.goalsThisMatch * 1.2) + (this.currentMatch.assistsThisMatch * 0.7);
      if (isWin) matchRating += 0.6;
    }
    matchRating = Math.min(10.0, Math.max(5.0, Number(matchRating.toFixed(1))));
    this.seasonStats.totalRating += matchRating;

    // OVR Gelişimi
    if (matchRating >= 8.2) {
      this.player.overall = Math.min(99, this.player.overall + 1);
      this.player.marketValue += Math.round(this.player.marketValue * 0.12);
    }

    // ========================================================
    // MAAŞ & PRİM KAZANÇLARI (HAFTALIK MAAŞ SİSTEMİ)
    // ========================================================
    // Her maç performans primi alınır; tam haftalık maaş ise 2 maçta bir (haftalık periyotta) yatar!
    const isPayday = (this.currentMatchIndex % 2 === 1) || (this.currentMatchIndex + 1 >= this.matchesPerSeason);
    const weeklyWage = this.player.wage || 25000;
    const baseWage = isPayday ? weeklyWage : 0;

    const goalBonus = this.currentMatch.goalsThisMatch * 15000;
    const saveBonus = this.currentMatch.savesThisMatch * 12000;
    const winBonus = isWin ? 35000 : (isDraw ? 10000 : 0);
    const cleanSheetBonus = (awayScore === 0) ? 30000 : 0;
    const motmBonus = (matchRating >= 8.5) ? 25000 : 0;

    const totalEarnedThisMatch = baseWage + goalBonus + saveBonus + winBonus + cleanSheetBonus + motmBonus;
    this.player.money += totalEarnedThisMatch;

    const summary = {
      matchNum: this.currentMatch.matchNumber,
      homeTeam: this.currentMatch.homeTeam,
      awayTeam: this.currentMatch.awayTeam,
      homeScore: homeScore,
      awayScore: awayScore,
      goals: this.currentMatch.goalsThisMatch,
      saves: this.currentMatch.savesThisMatch,
      rating: matchRating,
      motm: matchRating >= 8.5,
      isWin: isWin,
      isDraw: isDraw,
      earnings: {
        baseWage,
        weeklyWage,
        isPayday,
        goalBonus,
        saveBonus,
        winBonus,
        cleanSheetBonus,
        motmBonus,
        totalEarned: totalEarnedThisMatch,
        currentWallet: this.player.money
      }
    };

    this.currentMatchIndex++;
    this.saveProfile();

    const isSeasonEnd = this.currentMatchIndex >= this.matchesPerSeason;
    return { summary, isSeasonEnd };
  }

  // ==========================================================
  // MAĞAZA VE EKİPMAN İŞLEMLERİ (SHOP SYSTEM)
  // ==========================================================
  getStoreCatalog() {
    return STORE_CATALOG;
  }

  buyItem(category, itemId) {
    if (!this.player) return { success: false, msg: 'Oyuncu bulunamadı.' };
    const items = STORE_CATALOG[category] || [];
    const item = items.find(it => it.id === itemId);
    if (!item) return { success: false, msg: 'Ürün bulunamadı.' };

    if (this.player.purchasedItems.includes(itemId)) {
      this.equipItem(category, itemId);
      return { success: true, msg: `${item.name} kuşanıldı!`, equipped: true };
    }

    if (this.player.money < item.price) {
      const diff = item.price - this.player.money;
      return {
        success: false,
        msg: `Yetersiz bakiye! Bu ürünü almak için €${diff.toLocaleString('tr-TR')} daha maaş biriktirmelisin.`
      };
    }

    // Satın Al
    this.player.money -= item.price;
    this.player.purchasedItems.push(itemId);
    this.equipItem(category, itemId);
    this.saveProfile();

    return {
      success: true,
      msg: `Tebrikler! ${item.name} satın alındı ve kuşanıldı!`,
      equipped: true,
      newWallet: this.player.money
    };
  }

  equipItem(category, itemId) {
    if (!this.player) return false;
    if (!this.player.purchasedItems.includes(itemId)) return false;

    if (category === 'balls') this.player.equippedBall = itemId;
    else if (category === 'boots') this.player.equippedBoot = itemId;
    else if (category === 'hairs') this.player.equippedHair = itemId;
    else if (category === 'kits') this.player.equippedKit = itemId;

    this.saveProfile();
    return true;
  }

  // ==========================================================
  // LİDERLİK TABLOSU (LEADERBOARD: EN ÇOK PARA, EN ÇOK OVERALL, HEPSİ)
  // ==========================================================
  getLeaderboard(filter = 'money') {
    if (!this.player) return [];
    const club = this.getCurrentClub();

    // Kullanıcının oyuncusunu ekle
    const userEntry = {
      name: `${this.player.name} (SEN)`,
      club: club.name,
      ovr: this.player.overall,
      money: this.player.money,
      country: '🇹🇷',
      isUser: true
    };

    const combinedList = [...BASE_LEADERBOARD, userEntry];

    if (filter === 'money') {
      // En Çok Para (En zengin futbolcular)
      combinedList.sort((a, b) => b.money - a.money);
    } else if (filter === 'ovr') {
      // En Yüksek Overall
      combinedList.sort((a, b) => b.ovr - a.ovr || b.money - a.money);
    } else {
      // HEPSİ: Hem Overall hem Para birleşik puanı (Composite Score)
      combinedList.sort((a, b) => {
        const scoreA = (a.ovr * 1500000) + a.money;
        const scoreB = (b.ovr * 1500000) + b.money;
        return scoreB - scoreA;
      });
    }

    return combinedList.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
  }

  // ==========================================================
  // SEZON BİTTİĞİNDE TRANSFER TEKLİFLERİ ÜRET (LİGLERE GÖRE)
  // ==========================================================
  generateTransferOffers() {
    const avgRating = this.seasonStats.matches > 0 
      ? (this.seasonStats.totalRating / this.seasonStats.matches).toFixed(1)
      : 7.2;

    const currentClub = this.getCurrentClub();
    const offers = [];

    // 1. Mevcut Kulüpten Sözleşme Yenileme Teklifi
    const renewalWage = Math.round(this.player.wage * (avgRating >= 7.5 ? 1.45 : 1.15));
    offers.push({
      club: currentClub,
      type: 'renewal',
      headline: `${currentClub.name} Sözleşme Uzatmak İstiyor!`,
      weeklyWage: renewalWage,
      status: `Mevcut Kulübün (${currentClub.league})`,
      promise: 'Takım Kaptanı & 10 Numara Liderlik',
      desc: 'Kulüp performansından son derece memnun. Maaşına sağlam zam yaparak seni takımda tutmak istiyor.'
    });

    // 2. Dış Kulüplerden Transfer Teklifleri
    const availableClubs = Object.values(CLUBS_DATABASE).filter(c => c.id !== currentClub.id);

    // Eğer 1. Ligdeyse ve başarılıysa Süper Lig devleri ister!
    // Eğer Süper Ligdeyse ve harikaysa Avrupa Devleri (Real, City, Bayern) kapıyı çalar!
    let targetClubs = [];
    if (currentClub.tier === 1) {
      if (avgRating >= 7.2) {
        // Süper Lig teklifleri
        targetClubs = availableClubs.filter(c => c.tier === 2);
      } else {
        // 1. Lig diğer iddialı takımlar
        targetClubs = availableClubs.filter(c => c.tier === 1);
      }
    } else if (currentClub.tier === 2) {
      if (avgRating >= 8.2 && this.player.overall >= 80) {
        // Avrupa Şampiyonlar Ligi devleri
        targetClubs = availableClubs.filter(c => c.tier === 3);
      } else {
        // Diğer Süper Lig büyükleri
        targetClubs = availableClubs.filter(c => c.tier === 2);
      }
    } else {
      // Avrupa Devi
      targetClubs = availableClubs.filter(c => c.tier === 3);
    }

    // Karıştır ve 4 farklı takımdan teklif çıkar
    const shuffled = targetClubs.sort(() => 0.5 - Math.random()).slice(0, 4);

    shuffled.forEach(club => {
      let offeredWage = Math.round(this.player.wage * (1.3 + Math.random() * 0.5));
      if (club.tier === 3) offeredWage = Math.max(offeredWage, 220000);
      else if (club.tier === 2) offeredWage = Math.max(offeredWage, 65000);

      offers.push({
        club: club,
        type: 'transfer',
        headline: `${club.name} Dev Bonservisle Kapıyı Çaldı!`,
        weeklyWage: offeredWage,
        status: `${club.league}`,
        promise: this.player.position === 'GK' ? '1 Numaralı Eldiven & Kupa Hedefi' : 'İlk 11 Garantisi & Şampiyonluk',
        desc: `${club.name} teknik heyeti ve yönetimi seni kadrosuna katmak için her türlü fedakarlığa hazır!`
      });
    });

    return {
      avgRating,
      stats: { ...this.seasonStats },
      offers
    };
  }

  // ==========================================================
  // İSTEDİĞİ KULÜPLE ANLAŞMA & TRANSFER TALEBİ SİSTEMİ
  // ==========================================================
  getAllClubsForTransfer() {
    if (!this.player) return [];
    const currentClub = this.getCurrentClub();
    const ovr = this.player.overall;

    return Object.values(CLUBS_DATABASE).map(club => {
      let minOvrNeeded = 60;
      if (club.tier === 1) {
        minOvrNeeded = club.reputation >= 66 ? 68 : 64;
      } else if (club.tier === 2) {
        minOvrNeeded = club.reputation >= 80 ? 79 : (club.reputation >= 75 ? 74 : 71);
      } else {
        // Avrupa Devleri
        minOvrNeeded = club.reputation >= 94 ? 88 : 84;
      }

      let offeredWage = Math.round((club.reputation * 1000) * (club.tier === 3 ? 2.5 : (club.tier === 2 ? 1.2 : 0.4)));

      const isCurrent = (club.id === currentClub.id);
      const isEligible = (ovr >= minOvrNeeded);
      const ovrDiff = minOvrNeeded - ovr;

      return {
        ...club,
        minOvrNeeded,
        offeredWage,
        isCurrent,
        isEligible,
        ovrDiff
      };
    });
  }

  requestTransferToClub(targetClubId) {
    if (!this.player) return { success: false, msg: 'Oyuncu profili bulunamadı.' };
    const club = CLUBS_DATABASE[targetClubId];
    if (!club) return { success: false, msg: 'Kulüp bulunamadı.' };
    if (club.id === this.player.clubId) {
      return { success: false, msg: 'Zaten bu kulüpte forma giyiyorsun!' };
    }

    const clubsList = this.getAllClubsForTransfer();
    const clubInfo = clubsList.find(c => c.id === targetClubId);

    if (!clubInfo || !clubInfo.isEligible) {
      const neededOvr = clubInfo ? clubInfo.minOvrNeeded : 75;
      const diff = clubInfo ? clubInfo.ovrDiff : 5;
      return {
        success: false,
        neededOvr: neededOvr,
        msg: `${club.badge} ${club.name} Menajeri: "Yeteneğin dikkat çekici ancak kulübümüzün seviyesi için en az ${neededOvr} OVR olmalısın! (${diff} OVR daha gelişmelisin)"`
      };
    }

    // Transfer kabul edildi!
    this.acceptTransfer(club.id, clubInfo.offeredWage);
    return {
      success: true,
      club: club,
      wage: clubInfo.offeredWage,
      msg: `👑 ANLAŞMA SAĞLANDI! ${club.badge} ${club.name} ile haftalık €${clubInfo.offeredWage.toLocaleString('tr-TR')} bedelle resmi sözleşme imzaladın!`
    };
  }

  acceptTransfer(clubId, newWage) {
    if (!this.player) return;
    const oldClub = this.getCurrentClub();
    this.player.clubId = clubId;
    if (newWage) this.player.wage = newWage;

    this.history.push({
      season: this.season,
      club: oldClub.name,
      stats: { ...this.seasonStats }
    });

    this.season++;
    this.currentMatchIndex = 0;
    this.resetSeasonStats();
    this.saveProfile();
  }
}

window.careerManager = new CareerManager();
