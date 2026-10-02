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
// MAĞAZA KATALOĞU (STORE CATALOG - DETAYLI STAT BOOSTLU EKİPMANLAR)
// Kramponlar, Maç Topları, Kaleci Eldivenleri, Özel İmaj ve VIP Formalar
// ==========================================================
const STORE_CATALOG = {
  balls: [
    {
      id: 'ball_pro',
      name: 'FIFA Quality Pro - Golden Panelli',
      price: 0,
      desc: 'Aerodinamik altın/cyan kıvrımlı panellere sahip resmi lig maç topu.',
      icon: '⚽',
      badge: 'STANDART',
      accentColor: '#ffd700',
      stats: { ballSpeed: 0, dipKnuckle: 0 }
    },
    {
      id: 'ball_classic',
      name: 'Klasik Deri Nostalji Topu (1970)',
      price: 25000,
      desc: '1970 Mexico tarzı elle dikilmiş gerçek deri retro futbol topu. Kararlı sekme sağlar.',
      icon: '⚽',
      badge: 'RETRO',
      accentColor: '#cbd5e1',
      stats: { ballSpeed: 5, dipKnuckle: 4 }
    },
    {
      id: 'ball_champions',
      name: 'UCL Yıldızlı Şampiyonlar Topu',
      price: 135000,
      desc: 'Devler ligi için özel aerodinamik dikişsiz termal paneller. Falsoyu mükemmel iletir.',
      icon: '⭐',
      badge: 'UCL',
      accentColor: '#38bdf8',
      stats: { ballSpeed: 12, dipKnuckle: 12, accuracy: 10 }
    },
    {
      id: 'ball_cyber',
      name: 'Cyberpunk Neon Matrix Topu',
      price: 280000,
      desc: 'Havada parıldayan neon pembe & camgöbeği ızgaralı hologramik maç topu.',
      icon: '🔮',
      badge: 'CYBER',
      accentColor: '#00f2fe',
      stats: { ballSpeed: 18, dipKnuckle: 20 }
    },
    {
      id: 'ball_lava',
      name: 'Alevli Volkanik Magma Topu',
      price: 850000,
      desc: 'Kor gibi parlayan volkanik lav desenli, havayı yırtan süpersonik şut topu.',
      icon: '🔥',
      badge: 'EFSANEVİ',
      accentColor: '#ff3366',
      stats: { ballSpeed: 25, dipKnuckle: 25, power: 12 }
    },
    {
      id: 'ball_gold',
      name: '24K Saf Altın Ballon d\'Or Topu',
      price: 2500000,
      desc: 'Tamamı 24 karat saf altın kaplama, dünya yıldızlarına özel paha biçilmez şaheser.',
      icon: '👑',
      badge: 'LUXURY',
      accentColor: '#f1c40f',
      stats: { ballSpeed: 32, dipKnuckle: 32, power: 20 }
    },
    {
      id: 'ball_galaxy',
      name: 'Kozmik Galaksi Sonsuzluk Topu',
      price: 6000000,
      desc: 'Yıldız tozu ve yerçekimi dalgası üreten uzay çağı prototip futbol topu.',
      icon: '🌌',
      badge: 'KOZMİK',
      accentColor: '#a855f7',
      stats: { ballSpeed: 42, dipKnuckle: 40, power: 28, accuracy: 25 }
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
      accentColor: '#94a3b8',
      stats: { power: 0, curve: 0, accuracy: 0 }
    },
    {
      id: 'boot_predator',
      name: 'Predator Strike Neon Kırmızı',
      price: 95000,
      desc: 'Kauçuk vuruş kanatları ile füze gibi sert şutlar ve ani çatala dalışlar.',
      icon: '⚡',
      badge: 'GÜÇ',
      accentColor: '#ff3366',
      stats: { power: 18, curve: 12, accuracy: 12 }
    },
    {
      id: 'boot_mercurial',
      name: 'Mercurial Trivela Cyan Edition',
      price: 350000,
      desc: 'Dış ayak vuruşlarında maksimum kamçı etkisi sağlayan aerodinamik saya.',
      icon: '🌪️',
      badge: 'TRİVELA',
      accentColor: '#00f2fe',
      stats: { power: 15, curve: 28, trivela: 28 }
    },
    {
      id: 'boot_hypervenom',
      name: 'Hypervenom Zehirli Yeşil V-Strike',
      price: 680000,
      desc: 'Ceza sahası canavarı forvetler için ölümcül bitiricilik ve yön değiştirme.',
      icon: '🐍',
      badge: 'BİTİRİCİ',
      accentColor: '#22c55e',
      stats: { power: 24, curve: 18, accuracy: 22 }
    },
    {
      id: 'boot_magista',
      name: 'Magista Opus Maestro Plase',
      price: 980000,
      desc: '90\'a kavisli plase bırakan oyun kuruculara özel 3D petek dokulu temas yüzeyi.',
      icon: '🎯',
      badge: 'MAESTRO',
      accentColor: '#06b6d4',
      stats: { power: 20, curve: 34, accuracy: 28 }
    },
    {
      id: 'boot_phantom',
      name: 'Phantom GX Altın Çivili Pro',
      price: 1250000,
      desc: 'Altın kaplama 8 çivi ve lazer kesim temas yüzeyi ile kusursuz vuruş stabilitesi.',
      icon: '🏆',
      badge: 'ELİT',
      accentColor: '#ffd700',
      stats: { power: 28, curve: 24, accuracy: 30 }
    },
    {
      id: 'boot_superfly',
      name: 'Mercurial Superfly 360 Karbon',
      price: 2400000,
      desc: 'Havacılık sınıfı karbon fiber taban plakası ve dinamik bilek çorabı.',
      icon: '🚀',
      badge: 'PRO+',
      accentColor: '#f97316',
      stats: { power: 34, curve: 32, trivela: 34 }
    },
    {
      id: 'boot_diamond',
      name: 'Diamond Elite Kristal Krampon',
      price: 4500000,
      desc: 'Elmas parıltılı sayası ve ultra hafif karbon fiber tabanlı lüks zirve model.',
      icon: '💎',
      badge: 'MİTİK',
      accentColor: '#a78bfa',
      stats: { power: 42, curve: 38, trivela: 40, accuracy: 38 }
    }
  ],
  gloves: [
    {
      id: 'gloves_standard',
      name: 'Temel Antrenman Eldiveni',
      price: 0,
      desc: 'Yeni başlayan kaleciler için standart sünger avuçlu eldiven.',
      icon: '🧤',
      badge: 'STANDART',
      accentColor: '#94a3b8',
      stats: { gkReflex: 0, gkReach: 0 }
    },
    {
      id: 'gloves_predator_pro',
      name: 'Predator Pro 4mm Contact Latex',
      price: 85000,
      desc: 'Topun avuçtan kaymasını engelleyen yüksek tutuşlu Alman temas lateksi.',
      icon: '🧤',
      badge: 'GÜÇLÜ',
      accentColor: '#ff3366',
      stats: { gkReflex: 16, gkReach: 14 }
    },
    {
      id: 'gloves_vapor_grip',
      name: 'Vapor Grip 3 All-Weather',
      price: 320000,
      desc: 'Yağmurda ve karda maksimum kavrama sağlayan kavisli parmak kesimi.',
      icon: '🧤',
      badge: 'KAVRAMA',
      accentColor: '#f97316',
      stats: { gkReflex: 24, gkReach: 20 }
    },
    {
      id: 'gloves_reusch_attrakt',
      name: 'Reusch Attrakt G3 Fusion Pro',
      price: 750000,
      desc: 'Sert şutları parmak uçlarıyla 90\'dan kornere çelen esnek kemikli teknoloji.',
      icon: '🧤',
      badge: 'BARAJ',
      accentColor: '#38bdf8',
      stats: { gkReflex: 30, gkReach: 26, gkParry: 24 }
    },
    {
      id: 'gloves_titan_gold',
      name: 'Titan Pro 24K Altın Dikişli',
      price: 1500000,
      desc: 'Özel titanyum parmak zırhı ve 24K altın dikişli devasa kanat açıklığı.',
      icon: '👑',
      badge: 'DEVLEŞEN',
      accentColor: '#f1c40f',
      stats: { gkReflex: 38, gkReach: 34, gkParry: 32 }
    },
    {
      id: 'gloves_cyber_reflex',
      name: 'Cyber 2050 Biyonik Refleks Zırhı',
      price: 3800000,
      desc: 'Yapay zeka güdümlü mikro servo motorlu ve nano-yapışkanlı gelecek çağı eldiveni.',
      icon: '🤖',
      badge: 'BİYONİK',
      accentColor: '#00ff88',
      stats: { gkReflex: 50, gkReach: 44, gkParry: 46 }
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
      accentColor: '#ffffff',
      stats: { charisma: 0 }
    },
    {
      id: 'hair_buzz',
      name: 'Modern Asker Traşı (Buzz Cut)',
      price: 15000,
      desc: 'Net, sert ve tavizsiz kısa saç stili.',
      icon: '💈',
      badge: 'POPÜLER',
      accentColor: '#64748b',
      stats: { charisma: 5 }
    },
    {
      id: 'hair_samurai',
      name: 'Samuray Topuz & Ninja Bandı',
      price: 75000,
      desc: 'Zlatan / Bale tarzı tepede toplanmış karizmatik samuray topuzu.',
      icon: '🥋',
      badge: 'ÖZEL',
      accentColor: '#e67e22',
      stats: { charisma: 14 }
    },
    {
      id: 'hair_platinum',
      name: 'Platin Sarı Boyalı Saç (Neymar Stili)',
      price: 220000,
      desc: 'Sahada anında fark edilen platin sarısı parlak yıldız stili.',
      icon: '✨',
      badge: 'YILDIZ',
      accentColor: '#fef08a',
      stats: { charisma: 22 }
    },
    {
      id: 'hair_dreads',
      name: 'Rasta Örgülü Sporcu Saçı',
      price: 450000,
      desc: 'Ronaldinho tarzı atletik bandana ve dinamik rasta örgüleri.',
      icon: '🦁',
      badge: 'SAMBA',
      accentColor: '#10b981',
      stats: { charisma: 28 }
    },
    {
      id: 'hair_afro',
      name: 'Kıvırcık Hacimli Efsane Afro',
      price: 650000,
      desc: '1980lerin ve Brezilya sambacılarının ikonik afro saç stili.',
      icon: '🌀',
      badge: 'KLASİK',
      accentColor: '#d97706',
      stats: { charisma: 32 }
    },
    {
      id: 'hair_goldcrown',
      name: 'Altın Taçlı Kral Saç Modeli',
      price: 2000000,
      desc: 'Kraliyet altın tacı ve altın parıltılı şampiyon saç tasarımı.',
      icon: '👑',
      badge: 'KRAL',
      accentColor: '#ffd700',
      stats: { charisma: 50, wageBonus: 20 }
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
      accentColor: '#38bdf8',
      stats: { wageBonus: 0, charisma: 0 }
    },
    {
      id: 'kit_blackgold',
      name: 'Gece Siyahı & Altın V-Yaka Özel Kit',
      price: 300000,
      desc: 'Mat siyah kumaş üzerine 24K altın yaldızlı sponsor ve numara detayları.',
      icon: '🖤',
      badge: 'VIP',
      accentColor: '#f1c40f',
      stats: { wageBonus: 18, charisma: 22 }
    },
    {
      id: 'kit_retro',
      name: '1990s Retro Nostalji Çubuklu Kit',
      price: 950000,
      desc: 'Futbolun altın çağının dikey nostaljik çizgileri ve vintage yaka.',
      icon: '⭐',
      badge: 'RETRO',
      accentColor: '#ec4899',
      stats: { wageBonus: 28, charisma: 30 }
    },
    {
      id: 'kit_cyber',
      name: 'Cyberpunk Hologram 2050 Kiti',
      price: 3000000,
      desc: 'Işık saçan dinamik devre hatlarına sahip geleceğin zırh forması.',
      icon: '🌌',
      badge: 'GELECEK',
      accentColor: '#00ff88',
      stats: { wageBonus: 45, charisma: 45 }
    },
    {
      id: 'kit_champions_gold',
      name: 'UEFA Şampiyonluk Zırh Forması',
      price: 5500000,
      desc: 'Saf altın yaldızlı Şampiyonlar Ligi armalı, kulüp yönetimini büyüleyen efsane forma.',
      icon: '🏆',
      badge: 'ŞAMPİYON',
      accentColor: '#ffd700',
      stats: { wageBonus: 65, charisma: 60 }
    }
  ]
};



// ==========================================================
// ANTİ-HİLE VE VERİ BÜTÜNLÜĞÜ MOTORU (ANTI-CHEAT ENGINE)
// İncele (DevTools / Console / LocalStorage) Manipülasyon Koruması
// ==========================================================
class AntiCheatEngine {
  static SECRET_SALT = 'fc_pro_2026_quaresma_trivela_#992';

  // HMAC tarzı tuzlanmış kriptografik imza üretimi
  static computeSignature(player, matchIdx, season) {
    if (!player) return '';
    const mVal = Number(player._rawMoney !== undefined ? player._rawMoney : player.money) || 0;
    const raw = `${player.id || ''}_${player.name || ''}_${player.overall || 75}_${mVal}_${player.wage || 15000}_${matchIdx || 0}_${season || 1}_${player.totalCareerGoals || 0}_${player.totalCareerSaves || 0}_${this.SECRET_SALT}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul ? Math.imul(hash, 0x01000193) : ((hash * 0x01000193) & 0xffffffff);
    }
    return (hash >>> 0).toString(16);
  }

  // Matematiksel olarak kazanılabilecek azami meşru bakiye tavanı
  static getMaxLegitimateMoney(player, matchIdx, season) {
    const totalMatches = Math.max(0, ((season || 1) - 1) * 6 + (matchIdx || 0));
    const maxStarting = 660000;
    const maxMatchEarnings = 600000; // En üst lig haftalık maaş + gol primi + MOTM
    const maxGoals = (player && player.totalCareerGoals) || 0;
    const maxSaves = (player && player.totalCareerSaves) || 0;
    return maxStarting + (totalMatches * maxMatchEarnings) + (maxGoals * 20000) + (maxSaves * 10000) + 500000;
  }

  // Hileli değerleri tespit et ve meşru sınıra geri çek
  static sanitizeAndVerify(player, matchIdx, season, savedSig) {
    if (!player) return false;
    let tampered = false;
    const maxAllowed = this.getMaxLegitimateMoney(player, matchIdx, season);
    let currentMoney = Number(player._rawMoney !== undefined ? player._rawMoney : player.money) || 0;

    // 1. Sayısal kontrol
    if (isNaN(currentMoney) || !isFinite(currentMoney) || currentMoney < 0) {
      currentMoney = 50000;
      tampered = true;
    }

    // 2. Matematiksel tavan aşımı kontrolü (Arkadaşın inceleden 999999999 yapması durumunda anında yakalar!)
    if (currentMoney > maxAllowed || currentMoney > 150000000) {
      console.warn(`[ANTI-CHEAT GÜVENLİK] Hileli bakiye (€${currentMoney.toLocaleString()}) tespit edildi! Meşru tavan (€${maxAllowed.toLocaleString()}) değerine sıfırlandı.`);
      currentMoney = maxAllowed;
      tampered = true;
    }

    // 3. İmza kontrolü (LocalStorage manipülasyonu)
    if (savedSig) {
      const expectedSig = this.computeSignature(player, matchIdx, season);
      if (savedSig !== expectedSig) {
        console.warn(`[ANTI-CHEAT GÜVENLİK] Veri imzası uyuşmazlığı tespit edildi! Kayıt dosyası dışarıdan değiştirilmiş.`);
        tampered = true;
        currentMoney = Math.min(currentMoney, maxAllowed);
      }
    }

    // 4. Yetenek OVR kontrolü
    if (player.overall > 99 || player.overall < 60) {
      player.overall = 75;
      tampered = true;
    }

    if (player._rawMoney !== undefined) {
      player._rawMoney = currentMoney;
    } else {
      player.money = currentMoney;
    }

    return tampered;
  }
}

class CareerManager {
  constructor() {
    this.player = null;
    this.season = 1;
    this.currentMatchIndex = 0;
    this.matchesPerSeason = 6;
    this.currentMatch = null;
    this._inLegitTransaction = false;
    this.firebaseDbUrl = 'https://futbol-62e5b-default-rtdb.firebaseio.com';
    this.cloudLeaderboardId = 'ff808181a09d98f701a0fbb2a1f55f53';
    this.cachedCloudPlayers = [];
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
    this.initFirebaseLiveStream();
  }

  // Canlı Firebase Akışı (F5 basmadan diğer oyuncuların puanlarını anında gösterir)
  initFirebaseLiveStream() {
    if (typeof window === 'undefined' || !window.EventSource) return;
    try {
      const streamUrl = `${this.firebaseDbUrl}/leaderboard.json`;
      const sse = new EventSource(streamUrl);
      sse.addEventListener('put', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.data && typeof parsed.data === 'object') {
            const list = Object.values(parsed.data).filter(p => p && p.isRealPlayer !== false);
            if (list.length > 0) {
              this.cachedCloudPlayers = list;
              if (window.uiManager && window.uiManager.leaderboardModal && !window.uiManager.leaderboardModal.classList.contains('hidden')) {
                window.uiManager.renderLeaderboard(window.uiManager.currentLeaderboardFilter || 'money');
              }
            }
          }
        } catch (err) {}
      });
    } catch (err) {}
  }

  hasSavedProfile() {
    return localStorage.getItem('fc_career_player') !== null;
  }

  createProfile(name, position, jerseyNumber, startingClubId = 'anadolu', preferredFoot = 'R') {
    const club = CLUBS_DATABASE[startingClubId] || CLUBS_DATABASE['anadolu'];
    const startingWage = (club.tier === 1) ? 15000 : (club.tier === 2 ? 65000 : 220000);
    const startingMoney = startingWage * 3; // Başlangıç birikimi

    this.player = {
      id: 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36),
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
      purchasedItems: ['ball_pro', 'boot_copa', 'hair_fade', 'kit_club', 'gloves_standard'],
      equippedBall: 'ball_pro',
      equippedBoot: 'boot_copa',
      equippedHair: 'hair_fade',
      equippedKit: 'kit_club',
      equippedGloves: 'gloves_standard',
      trophies: []
    };
    this.season = 1;
    this.currentMatchIndex = 0;
    this.resetSeasonStats();
    this._attachSecurityWatchdog();
    this.saveProfile();
    this.syncWithGlobalCloud();
  }

  setPreferredFoot(foot) {
    if (!this.player) return;
    this.player.preferredFoot = (foot === 'L' ? 'L' : 'R');
    this.saveProfile();
  }

  // Konsol ve incele üzerinden money manipülasyonunu engelleyen bekçi
  _attachSecurityWatchdog() {
    if (!this.player) return;
    const self = this;
    const rawVal = Number(this.player._rawMoney !== undefined ? this.player._rawMoney : this.player.money) || 0;
    this.player._rawMoney = rawVal;

    try {
      delete this.player.money;
    } catch (e) {}

    Object.defineProperty(this.player, 'money', {
      get() {
        return self.player._rawMoney;
      },
      set(val) {
        if (!self._inLegitTransaction) {
          console.error('[SECURITY ANTI-CHEAT] "İncele" veya F12 konsol üzerinden hileli para değiştirme engellendi!');
          if (window.uiManager && typeof window.uiManager.showSecurityToast === 'function') {
            window.uiManager.showSecurityToast('🛡️ HİLE ENGELİ: "İncele" veya konsol ile sınırsız para hilesi yapılamaz!');
          }
          return;
        }
        if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < 0) return;
        const maxLegit = AntiCheatEngine.getMaxLegitimateMoney(self.player, self.currentMatchIndex, self.season);
        self.player._rawMoney = Math.min(Math.round(val), maxLegit);
      },
      enumerable: true,
      configurable: false
    });
  }

  // Meşru oyun içi kazanç/harcama işlemlerini onaylayan sarmalayıcı
  _executeTransaction(action) {
    this._inLegitTransaction = true;
    try {
      action();
    } finally {
      this._inLegitTransaction = false;
    }
  }

  loadProfile() {
    try {
      const data = localStorage.getItem('fc_career_player');
      if (data) {
        this.player = JSON.parse(data);
        if (!this.player.id) {
          this.player.id = 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
        }
        if (!this.player.preferredFoot) this.player.preferredFoot = 'R';
        if (this.player.money === undefined) this.player.money = 50000;
        if (!this.player.purchasedItems) this.player.purchasedItems = ['ball_pro', 'boot_copa', 'hair_fade', 'kit_club', 'gloves_standard'];
        if (!this.player.purchasedItems.includes('gloves_standard')) this.player.purchasedItems.push('gloves_standard');
        if (!this.player.equippedBall) this.player.equippedBall = 'ball_pro';
        if (!this.player.equippedBoot) this.player.equippedBoot = 'boot_copa';
        if (!this.player.equippedHair) this.player.equippedHair = 'hair_fade';
        if (!this.player.equippedKit) this.player.equippedKit = 'kit_club';
        if (!this.player.equippedGloves) this.player.equippedGloves = 'gloves_standard';

        this.season = parseInt(localStorage.getItem('fc_career_season')) || 1;
        this.currentMatchIndex = parseInt(localStorage.getItem('fc_career_match_idx')) || 0;
        const stats = localStorage.getItem('fc_career_season_stats');
        if (stats) this.seasonStats = JSON.parse(stats);

        // Anti-Cheat & İncele Manipülasyon Doğrulaması
        const savedSig = localStorage.getItem('fc_career_sig');
        const wasTampered = AntiCheatEngine.sanitizeAndVerify(this.player, this.currentMatchIndex, this.season, savedSig);
        if (wasTampered) {
          console.warn('[SECURITY] Hileli profil tespit edildi ve düzeltildi!');
          this.saveProfile();
          setTimeout(() => {
            if (window.uiManager && typeof window.uiManager.showSecurityToast === 'function') {
              window.uiManager.showSecurityToast('🛡️ Hileli bakiye meşru seviyeye çekildi ve kayıt dosyası korumaya alındı!');
            }
          }, 1200);
        }

        // Eski bot önbelleğini temizle (Yalnızca gerçek oyuncular kalır)
        try {
          localStorage.removeItem('fc_cached_cloud_players');
          this.cachedCloudPlayers = [];
        } catch (e) {}

        this._attachSecurityWatchdog();
        this.syncWithGlobalCloud();
      }
    } catch (e) {
      console.warn("Kayıt yüklenemedi:", e);
    }
  }

  saveProfile() {
    if (!this.player) return;
    AntiCheatEngine.sanitizeAndVerify(this.player, this.currentMatchIndex, this.season);

    // Güvenlik imzası oluştur ve kaydet
    const sig = AntiCheatEngine.computeSignature(this.player, this.currentMatchIndex, this.season);
    localStorage.setItem('fc_career_sig', sig);

    localStorage.setItem('fc_career_player', JSON.stringify({
      ...this.player,
      money: this.player._rawMoney !== undefined ? this.player._rawMoney : this.player.money
    }));
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
  // TURNUVA MAÇI SENARYOLARI OLUŞTUR
  // ==========================================================
  generateTournamentMatch(homeName, awayName, stageTitle) {
    let scenarios = [];
    if (this.player && this.player.position === 'GK') {
      const pool = [
        { type: 'penalty', title: `${stageTitle} - Kritik Penaltı!`, distance: 11, spotX: 0, wall: 0, desc: 'Turnuva kader anı! [A/D] ile yere atla veya [A/D + Space] ile 90\'a uzan!' },
        { type: 'freekick', title: `${stageTitle} - Baraj Üstü Frikik`, distance: 22, spotX: -4.5, wall: 4, desc: 'Kritik dakikalar! Barajın üstünden süzülen topu 90\'dan çıkar!' },
        { type: 'freekick', title: `${stageTitle} - 26 Metre Sert Şut`, distance: 26, spotX: 5.5, wall: 4, desc: 'Rakip yıldız sağdan köşeye sert vuruyor! Zamanlamayı ayarla ve tokatla!' },
        { type: 'penalty', title: `${stageTitle} - Seri Penaltı Kurtarışı!`, distance: 11, spotX: 0, wall: 0, desc: 'Büyük kupaya giden yolda son penaltı! Devleş ve kurtar!' }
      ];
      scenarios = pool;
    } else {
      const pool = [
        { type: 'freekick', title: `${stageTitle} - 20 Metre Ceza Yayı Karşıdan`, distance: 20, spotX: 0, wall: 4, desc: 'Harika bir frikik fırsatı! Barajı aşırtıp 90\'a as!' },
        { type: 'freekick', title: `${stageTitle} - 24 Metre Sol Çapraz`, distance: 24, spotX: -6.0, wall: 4, desc: 'Sol çaprazdan ters köşeye öldürücü kavis gönder!' },
        { type: 'freekick', title: `${stageTitle} - 28 Metre Füze Şut`, distance: 28, spotX: 3.5, wall: 5, desc: 'Uzak mesafe! Mermi hızında bir vuruşla kaleciyi çaresiz bırak!' },
        { type: 'penalty', title: `${stageTitle} - Tarihi Penaltı Vuruşu!`, distance: 11, spotX: 0, wall: 0, desc: 'Kupanın kaderi bu vuruşa bağlı! Çatala mermiyi gönder!' }
      ];
      scenarios = pool;
    }

    const targetAwayGoals = Math.floor(Math.random() * 2);

    this.currentMatch = {
      isTournament: true,
      stageTitle: stageTitle,
      matchNumber: stageTitle,
      homeTeam: homeName,
      awayTeam: awayName,
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

  // ==========================================================
  // MAÇ SONU: MAAŞ, PRİMLER VE KAZANÇ HESAPLAMA
  // ==========================================================
  finishMatch(isTournament = false) {
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
    const isPayday = isTournament ? false : ((this.currentMatchIndex % 2 === 1) || (this.currentMatchIndex + 1 >= this.matchesPerSeason));
    const weeklyWage = this.player.wage || 25000;
    const baseWage = isPayday ? weeklyWage : 0;

    // Kuşanılan formadan gelen maaş prim çarpanı
    const bonusStats = this.getPlayerBonusStats();
    const wageMultiplier = 1 + ((bonusStats.wageBonus || 0) / 100);

    const goalBonus = this.currentMatch.goalsThisMatch * (isTournament ? 25000 : 15000);
    const saveBonus = this.currentMatch.savesThisMatch * (isTournament ? 20000 : 12000);
    const winBonus = isWin ? (isTournament ? 75000 : 35000) : (isDraw ? 15000 : 0);
    const cleanSheetBonus = (awayScore === 0) ? (isTournament ? 50000 : 30000) : 0;
    const motmBonus = (matchRating >= 8.5) ? (isTournament ? 40000 : 25000) : 0;

    const baseEarned = baseWage + goalBonus + saveBonus + winBonus + cleanSheetBonus + motmBonus;
    const totalEarnedThisMatch = Math.round(baseEarned * wageMultiplier);
    this._executeTransaction(() => {
      this.player.money += totalEarnedThisMatch;
    });

    const summary = {
      isTournament: isTournament,
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

    if (!isTournament) {
      this.currentMatchIndex++;
    }
    this.saveProfile();
    this.syncWithGlobalCloud();

    const isSeasonEnd = !isTournament && (this.currentMatchIndex >= this.matchesPerSeason);
    return { summary, isSeasonEnd };
  }

  // ==========================================================
  // OYUNCUNUN TÜM KUŞANDIĞI EKİPMANLARIN BONUS STATLARINI HESAPLA
  // ==========================================================
  getPlayerBonusStats() {
    const stats = {
      shotPower: 0,
      curve: 0,
      trivela: 0,
      accuracy: 0,
      ballSpeed: 0,
      dipKnuckle: 0,
      gkReflex: 0,
      gkReach: 0,
      gkParry: 0,
      wageBonus: 0,
      charisma: 0
    };
    if (!this.player) return stats;

    const equipped = [
      { cat: 'balls', id: this.player.equippedBall },
      { cat: 'boots', id: this.player.equippedBoot },
      { cat: 'gloves', id: this.player.equippedGloves },
      { cat: 'hairs', id: this.player.equippedHair },
      { cat: 'kits', id: this.player.equippedKit }
    ];

    equipped.forEach(itemInfo => {
      if (!itemInfo.id) return;
      const list = STORE_CATALOG[itemInfo.cat] || [];
      const item = list.find(it => it.id === itemInfo.id);
      if (item && item.stats) {
        for (const [k, v] of Object.entries(item.stats)) {
          if (stats[k] !== undefined) {
            stats[k] += v;
          } else {
            stats[k] = v;
          }
        }
      }
    });

    return stats;
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

    // Satın Al (Anti-cheat korumalı işlem)
    this._executeTransaction(() => {
      this.player.money -= item.price;
    });
    this.player.purchasedItems.push(itemId);
    this.equipItem(category, itemId);
    this.saveProfile();
    this.syncWithGlobalCloud();

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
    else if (category === 'gloves') this.player.equippedGloves = itemId;

    this.saveProfile();
    return true;
  }

  // ==========================================================
  // GERÇEK BULUT LİDERLİK TABLOSU SENKRONİZASYONU (GLOBAL CLOUD SYNC)
  // Sitedeki gerçek oyuncuları birleştirir, botları geriye atar!
  // ==========================================================
  async syncWithGlobalCloud() {
    if (!this.player) return;
    try {
      const payload = {
        id: this.player.id,
        name: this.player.name,
        club: this.getCurrentClub().name,
        ovr: this.player.overall,
        money: this.player.money,
        matches: (this.season - 1) * this.matchesPerSeason + this.currentMatchIndex,
        goals: this.player.totalCareerGoals || 0,
        saves: this.player.totalCareerSaves || 0,
        position: this.player.position,
        country: '🇹🇷',
        lastSeen: Date.now(),
        isRealPlayer: true
      };

      // 0. Firebase Realtime Database Entegrasyonu (Token gerektirmez!)
      if (this.firebaseDbUrl) {
        try {
          const fbRes = await fetch(`${this.firebaseDbUrl}/leaderboard/${payload.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);

          if (fbRes && fbRes.ok) {
            // Firebase'e başarıyla yazıldı!
            console.log('[FIREBASE] Oyuncu profili Firebase Realtime Database ile eşitlendi.');
            return;
          }
        } catch (e) {}
      }

      // 1. Vercel Serverless API dene
      let res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: payload })
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json && Array.isArray(json.players)) {
          this.cachedCloudPlayers = json.players;
          try {
            localStorage.setItem('fc_cached_cloud_players', JSON.stringify(json.players));
          } catch (e) {}
        }
        return;
      }

      // 2. Doğrudan genel bulut nesnesine senkronize et (Cloud fallback)
      const cloudUrl = `https://api.restful-api.dev/objects/${this.cloudLeaderboardId}`;
      const cloudRes = await fetch(cloudUrl);
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        let players = (cloudData.data && Array.isArray(cloudData.data.players)) ? cloudData.data.players : [];

        // Kesinlikle botları ve sahteleri temizle (Yalnızca gerçek insanlar!)
        players = players.filter(p => p && p.isRealPlayer !== false && !String(p.id).startsWith('bot_'));

        const idx = players.findIndex(p => p.id === payload.id || p.name === payload.name);
        if (idx >= 0) {
          players[idx] = { ...players[idx], ...payload };
        } else {
          players.push(payload);
        }

        // Hileli kayıtları sınırla
        players = players.filter(p => p.money <= 200000000 && p.ovr <= 99);

        await fetch(cloudUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'PRO_FOOTBALL_3D_GLOBAL_LEADERBOARD',
            data: {
              version: 2,
              lastUpdated: Date.now(),
              players: players
            }
          })
        });

        this.cachedCloudPlayers = players;
        try {
          localStorage.setItem('fc_cached_cloud_players', JSON.stringify(players));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Bulut senkronizasyonu hatası:', err);
    }
  }

  async fetchGlobalLeaderboard(filter = 'money') {
    // 1. Önce güncel profilimizi buluta yaz
    await this.syncWithGlobalCloud();

    let cloudPlayers = [];
    try {
      // 0. Firebase Realtime Database üzerinden oku
      if (this.firebaseDbUrl) {
        try {
          const fbRes = await fetch(`${this.firebaseDbUrl}/leaderboard.json?t=${Date.now()}`).catch(() => null);
          if (fbRes && fbRes.ok) {
            const fbObj = await fbRes.json();
            if (fbObj && typeof fbObj === 'object') {
              cloudPlayers = Object.values(fbObj).filter(p => p && p.isRealPlayer !== false);
            }
          }
        } catch (e) {}
      }

      // 1. Vercel API üzerinden oku (Firebase boşsa veya yoksa)
      if (cloudPlayers.length === 0) {
        let res = await fetch('/api/leaderboard').catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.players)) {
            cloudPlayers = json.players.filter(p => p && p.isRealPlayer !== false && !String(p.id).startsWith('bot_'));
          }
        }
      }

      // 2. Doğrudan genel bulut nesnesinden oku (Son fallback)
      if (cloudPlayers.length === 0) {
        const cloudRes = await fetch(`https://api.restful-api.dev/objects/${this.cloudLeaderboardId}?t=${Date.now()}`).catch(() => null);
        if (cloudRes && cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.data && Array.isArray(cloudData.data.players)) {
            cloudPlayers = cloudData.data.players.filter(p => p && p.isRealPlayer !== false && !String(p.id).startsWith('bot_'));
          }
        }
      }
    } catch (e) {
      console.warn("Bulut liderlik okuma hatası:", e);
    }

    if (cloudPlayers.length > 0) {
      this.cachedCloudPlayers = cloudPlayers;
      try {
        localStorage.setItem('fc_cached_cloud_players', JSON.stringify(cloudPlayers));
      } catch (e) {}
    } else {
      const localCached = localStorage.getItem('fc_cached_cloud_players');
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          this.cachedCloudPlayers = (Array.isArray(parsed) ? parsed : []).filter(p => p && p.isRealPlayer !== false && !String(p.id).startsWith('bot_'));
        } catch (e) {}
      }
    }

    return this.getLeaderboard(filter);
  }

  // ==========================================================
  // LİDERLİK TABLOSU (LEADERBOARD: YALNIZCA GERÇEK OYUNCULAR)
  // Sıfır Bot! Oyunu 2 kişi oynadıysa tam 2 kişi görünür!
  // ==========================================================
  getLeaderboard(filter = 'money') {
    let userEntry = null;
    if (this.player) {
      const club = this.getCurrentClub();
      userEntry = {
        id: this.player.id,
        name: `${this.player.name} (SEN)`,
        club: club ? club.name : 'Süper Lig',
        ovr: this.player.overall || 75,
        money: this.player.money || 0,
        country: '🇹🇷',
        isUser: true,
        isRealPlayer: true
      };
    } else {
      userEntry = {
        id: 'guest_user',
        name: 'Yıldız Adayı (SEN)',
        club: 'Süper Lig',
        ovr: 75,
        money: 50000,
        country: '🇹🇷',
        isUser: true,
        isRealPlayer: true
      };
    }

    // 2. Buluttan veya WebRTC'den gelen diğer GERÇEK oyuncular (Asla bot yok!)
    const currentId = this.player ? this.player.id : 'guest_user';
    const currentName = this.player ? this.player.name : 'Yıldız Adayı';
    const otherRealPlayers = (this.cachedCloudPlayers || [])
      .filter(p => p && p.id !== currentId && p.name !== currentName && p.isRealPlayer !== false && !String(p.id).startsWith('bot_'))
      .map(p => ({
        ...p,
        isUser: false,
        isRealPlayer: true
      }));

    // 3. Birleştir: YALNIZCA GERÇEK OYUNCULAR!
    let combinedList = [userEntry, ...otherRealPlayers];

    // Sıralama
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

  // WebRTC P2P üzerinden gelen gerçek arkadaş verisini liderliğe ekle
  addOrUpdateOnlinePeer(peerProfile) {
    if (!peerProfile || !peerProfile.name) return;
    if (this.player && (peerProfile.id === this.player.id || peerProfile.name === this.player.name)) return;

    if (!this.cachedCloudPlayers) this.cachedCloudPlayers = [];
    const cleanPeer = {
      id: peerProfile.id || 'peer_' + Date.now(),
      name: peerProfile.name,
      club: peerProfile.club || 'Sarı Kanarya SK',
      ovr: Math.max(60, Math.min(99, parseInt(peerProfile.ovr) || 75)),
      money: Math.max(0, parseInt(peerProfile.money) || 50000),
      country: '🇹🇷',
      isRealPlayer: true,
      lastSeen: Date.now()
    };

    const idx = this.cachedCloudPlayers.findIndex(p => p.id === cleanPeer.id || p.name === cleanPeer.name);
    if (idx >= 0) {
      this.cachedCloudPlayers[idx] = cleanPeer;
    } else {
      this.cachedCloudPlayers.push(cleanPeer);
    }

    try {
      localStorage.setItem('fc_cached_cloud_players', JSON.stringify(this.cachedCloudPlayers));
    } catch (e) {}

    this.syncWithGlobalCloud();
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

  // ==========================================================
  // KUPA VE TURNUVA SİSTEMİ (DATA-DRIVEN TOURNAMENT ENGINE)
  // ==========================================================
  initTournament(tournId = 'world_cup') {
    const config = TOURNAMENTS_CONFIG[tournId] || TOURNAMENTS_CONFIG['world_cup'];
    const currentClub = this.getCurrentClub();

    // Takımları oluştur
    const teams = config.teams.map(t => {
      if (t.id === 'my_club') {
        return {
          ...t,
          name: currentClub.name,
          flag: currentClub.badge,
          ovr: this.player ? this.player.overall : 78
        };
      }
      return { ...t };
    });

    const standings = teams.map(t => ({
      ...t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0
    }));

    this.activeTournament = {
      id: config.id,
      name: config.name,
      badge: config.badge,
      type: config.type,
      groupName: config.groupName,
      stages: config.stages,
      currentStageIdx: 0,
      teams: teams,
      standings: standings,
      prizeMoney: config.prizeMoney,
      trophyId: config.trophyId,
      trophyName: config.trophyName,
      status: 'in_progress', // 'in_progress', 'won', 'eliminated'
      knockoutTree: [
        { stage: 'Çeyrek Final', userMatch: { home: teams[0].name, away: 'Hollanda 🇳🇱', played: false, winner: null } },
        { stage: 'Yarı Final', userMatch: { home: teams[0].name, away: 'Fransa 🇫🇷', played: false, winner: null } },
        { stage: 'BÜYÜK FİNAL', userMatch: { home: teams[0].name, away: 'Brezilya 🇧🇷', played: false, winner: null } }
      ]
    };

    this.saveTournament();
    return this.activeTournament;
  }

  saveTournament() {
    if (this.activeTournament) {
      try {
        localStorage.setItem('fc_active_tournament', JSON.stringify(this.activeTournament));
      } catch (e) {}
    }
  }

  loadTournament() {
    try {
      const data = localStorage.getItem('fc_active_tournament');
      if (data) {
        this.activeTournament = JSON.parse(data);
      }
    } catch (e) {}
    if (!this.activeTournament) {
      this.initTournament('world_cup');
    }
    return this.activeTournament;
  }

  getTournamentData() {
    if (!this.activeTournament) {
      this.loadTournament();
    }
    // Sıralama: En yüksek Puan, ardından Averaj
    this.activeTournament.standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    return this.activeTournament;
  }

  recordTournamentMatchResult(myScore, oppScore) {
    if (!this.activeTournament) this.initTournament('world_cup');
    const tourn = this.activeTournament;
    const stageIdx = tourn.currentStageIdx;
    const isWin = myScore > oppScore;
    const isDraw = myScore === oppScore;

    if (stageIdx < 3) {
      // Grup Aşaması Maçı
      const userTeam = tourn.standings.find(t => t.isUserTeam) || tourn.standings[0];
      const otherTeams = tourn.standings.filter(t => !t.isUserTeam);
      const currentOpp = otherTeams[stageIdx] || otherTeams[0];

      // Kullanıcı skorunu işle
      userTeam.played++;
      userTeam.gf += myScore;
      userTeam.ga += oppScore;
      userTeam.gd = userTeam.gf - userTeam.ga;
      if (isWin) { userTeam.won++; userTeam.pts += 3; }
      else if (isDraw) { userTeam.drawn++; userTeam.pts += 1; }
      else { userTeam.lost++; }

      // Rakip skoru işle
      currentOpp.played++;
      currentOpp.gf += oppScore;
      currentOpp.ga += myScore;
      currentOpp.gd = currentOpp.gf - currentOpp.ga;
      if (isWin) { currentOpp.lost++; }
      else if (isDraw) { currentOpp.drawn++; currentOpp.pts += 1; }
      else { currentOpp.won++; currentOpp.pts += 3; }

      // Gruptaki diğer maçın simülasyonu
      const remaining = otherTeams.filter(t => t.id !== currentOpp.id);
      if (remaining.length >= 2) {
        const s1 = Math.floor(Math.random() * 3);
        const s2 = Math.floor(Math.random() * 3);
        remaining[0].played++; remaining[0].gf += s1; remaining[0].ga += s2; remaining[0].gd = remaining[0].gf - remaining[0].ga;
        remaining[1].played++; remaining[1].gf += s2; remaining[1].ga += s1; remaining[1].gd = remaining[1].gf - remaining[1].ga;
        if (s1 > s2) remaining[0].pts += 3;
        else if (s1 === s2) { remaining[0].pts += 1; remaining[1].pts += 1; }
        else remaining[1].pts += 3;
      }

      tourn.currentStageIdx++;
      if (tourn.currentStageIdx === 3) {
        // Grup bitti! İlk 2'ye girdi mi kontrol et
        tourn.standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd);
        const rank = tourn.standings.findIndex(t => t.isUserTeam);
        if (rank > 1) {
          tourn.status = 'eliminated';
          this.saveTournament();
          return { status: 'eliminated', msg: 'Gruptan çıkamadın! Turnuvaya veda ettin.' };
        }
      }
      this.saveTournament();
      return { status: 'advanced_group', currentStage: tourn.stages[tourn.currentStageIdx] };
    } else {
      // Eleme Turları (Knockout: Çeyrek / Yarı / Final)
      const knockoutIdx = stageIdx - 3;
      if (!isWin) {
        tourn.status = 'eliminated';
        this.saveTournament();
        return { status: 'eliminated', msg: 'Eleme turunda mağlup olarak elendin!' };
      }

      if (tourn.knockoutTree[knockoutIdx]) {
        tourn.knockoutTree[knockoutIdx].userMatch.played = true;
        tourn.knockoutTree[knockoutIdx].userMatch.winner = tourn.knockoutTree[knockoutIdx].userMatch.home;
      }

      tourn.currentStageIdx++;
      if (tourn.currentStageIdx >= tourn.stages.length) {
        // ŞAMPİYON OLUNDU! KUPA KALDIRILDI!
        tourn.status = 'won';
        if (this.player) {
          if (!this.player.trophies) this.player.trophies = [];
          if (!this.player.trophies.includes(tourn.trophyId)) {
            this.player.trophies.push(tourn.trophyId);
          }
          this._executeTransaction(() => {
            this.player.money += tourn.prizeMoney;
          });
        }
        if (window.gameSound) window.gameSound.playTrophyFanfare();
        this.saveProfile();
        this.saveTournament();
        this.syncWithGlobalCloud();
        return {
          status: 'champion',
          trophyName: tourn.trophyName,
          prize: tourn.prizeMoney,
          msg: `🏆 ŞAMPİYON! ${tourn.trophyName} KUPASINI MÜZENE GÖTÜRDÜN VE €${tourn.prizeMoney.toLocaleString('tr-TR')} KAZANDIN!`
        };
      }

      this.saveTournament();
      return { status: 'advanced_knockout', currentStage: tourn.stages[tourn.currentStageIdx] };
    }
  }
}

// ==========================================================
// KUPA VE TURNUVA MİMARİSİ (TOURNAMENTS CONFIG DATABASE)
// ==========================================================
const TOURNAMENTS_CONFIG = {
  world_cup: {
    id: 'world_cup',
    name: '2026 DÜNYA KUPASI',
    badge: '🏆',
    type: 'international',
    groupName: 'Grup J',
    teams: [
      { id: 'turkey', name: 'Türkiye', flag: '🇹🇷', ovr: 82, isUserTeam: true },
      { id: 'brazil', name: 'Brezilya', flag: '🇧🇷', ovr: 88 },
      { id: 'morocco', name: 'Fas', flag: '🇲🇦', ovr: 81 },
      { id: 'japan', name: 'Japonya', flag: '🇯🇵', ovr: 79 }
    ],
    stages: ['Grup Maçı 1', 'Grup Maçı 2', 'Grup Maçı 3', 'Çeyrek Final', 'Yarı Final', 'BÜYÜK FİNAL'],
    prizeMoney: 25000000,
    trophyId: 'trophy_world_cup',
    trophyName: 'FIFA Altın Dünya Kupası'
  },
  champions_league: {
    id: 'champions_league',
    name: 'UEFA DEVLER LİGİ',
    badge: '⭐',
    type: 'club',
    groupName: 'Grup H',
    teams: [
      { id: 'my_club', name: 'Kulübün', flag: '🦁', ovr: 80, isUserTeam: true },
      { id: 'realmadrid', name: 'Chamartin B (Madrid)', flag: '👑', ovr: 96 },
      { id: 'mancity', name: 'Man Blue (Mavi Gökler)', flag: '🚢', ovr: 95 },
      { id: 'juventus', name: 'Piemonte Siyah Beyaz', flag: '🦓', ovr: 90 }
    ],
    stages: ['Grup Maçı 1', 'Grup Maçı 2', 'Grup Maçı 3', 'Yarı Final', 'DEVLER LİGİ FİNALİ'],
    prizeMoney: 18000000,
    trophyId: 'trophy_ucl',
    trophyName: 'UEFA Devler Ligi Kupası'
  }
};

window.careerManager = new CareerManager();
