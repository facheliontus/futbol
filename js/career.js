// ==========================================================
// FUTBOL KARİYER & TRANSFER SİSTEMİ (career.js)
// ==========================================================

const CLUBS_DATABASE = {
  // Başlangıç Kulüpleri (Tier 1)
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

  // Süper Lig & Avrupa Ligleri (Tier 2)
  'galatasaray': {
    id: 'galatasaray',
    name: 'Galatasaray SK',
    short: 'GS',
    tier: 2,
    reputation: 82,
    colors: { primary: '#b81414', secondary: '#f39c12', text: '#ffffff' },
    league: 'Süper Lig / Avrupa',
    budget: '€25M',
    badge: '🦁'
  },
  'fenerbahce': {
    id: 'fenerbahce',
    name: 'Fenerbahçe SK',
    short: 'FB',
    tier: 2,
    reputation: 82,
    colors: { primary: '#0c2461', secondary: '#f1c40f', text: '#ffffff' },
    league: 'Süper Lig / Avrupa',
    budget: '€24M',
    badge: '🐦'
  },
  'besiktas': {
    id: 'besiktas',
    name: 'Beşiktaş JK',
    short: 'BJK',
    tier: 2,
    reputation: 80,
    colors: { primary: '#111111', secondary: '#ffffff', text: '#ffffff' },
    league: 'Süper Lig / Avrupa',
    budget: '€20M',
    badge: '🦅'
  },
  'ajax': {
    id: 'ajax',
    name: 'Ajax Amsterdam',
    short: 'AJX',
    tier: 2,
    reputation: 81,
    colors: { primary: '#c0392b', secondary: '#ffffff', text: '#ffffff' },
    league: 'Eredivisie / Avrupa',
    budget: '€30M',
    badge: '🛡️'
  },

  // Dünya Devleri (Tier 3)
  'realmadrid': {
    id: 'realmadrid',
    name: 'Real Madrid CF',
    short: 'RMA',
    tier: 3,
    reputation: 96,
    colors: { primary: '#f5f6fa', secondary: '#d4af37', text: '#1e272e' },
    league: 'La Liga / Şampiyonlar Ligi',
    budget: '€120M',
    badge: '👑'
  },
  'mancity': {
    id: 'mancity',
    name: 'Manchester City',
    short: 'MCI',
    tier: 3,
    reputation: 95,
    colors: { primary: '#68c5db', secondary: '#0c2461', text: '#ffffff' },
    league: 'Premier League',
    budget: '€150M',
    badge: '🚢'
  },
  'bayern': {
    id: 'bayern',
    name: 'Bayern München',
    short: 'FCB',
    tier: 3,
    reputation: 94,
    colors: { primary: '#eb2f06', secondary: '#0c2461', text: '#ffffff' },
    league: 'Bundesliga',
    budget: '€110M',
    badge: '🔴'
  },
  'arsenal': {
    id: 'arsenal',
    name: 'Arsenal FC',
    short: 'ARS',
    tier: 3,
    reputation: 92,
    colors: { primary: '#e55039', secondary: '#ffffff', text: '#ffffff' },
    league: 'Premier League',
    budget: '€95M',
    badge: '💣'
  }
};

const RIVAL_NAMES = [
  'Kuzey Yıldızı', 'Boğaziçi FK', 'Toros Gücü', 'Karadeniz Fırtınası',
  'Göztepe', 'Başakşehir', 'Sevilla', 'Napoli', 'Borussia Dortmund',
  'Inter Milan', 'Juventus', 'Liverpool', 'Barcelona'
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

  createProfile(name, position, jerseyNumber, startingClubId = 'anadolu') {
    const club = CLUBS_DATABASE[startingClubId] || CLUBS_DATABASE['anadolu'];
    this.player = {
      name: name.trim() || 'Yıldız Oyuncu',
      position: position, // 'ST' (Forvet), 'GK' (Kaleci), 'CAM' (Orta Saha)
      jerseyNumber: parseInt(jerseyNumber) || 10,
      clubId: club.id,
      overall: position === 'GK' ? 73 : 75,
      marketValue: 1200000, // €1.2M
      wage: 5000, // haftalık €5,000
      totalCareerGoals: 0,
      totalCareerSaves: 0,
      trophies: []
    };
    this.season = 1;
    this.currentMatchIndex = 0;
    this.resetSeasonStats();
    this.saveProfile();
  }

  loadProfile() {
    try {
      const data = localStorage.getItem('fc_career_player');
      if (data) {
        this.player = JSON.parse(data);
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

  // Sezon Maçını Oluştur
  generateNextMatch() {
    const club = this.getCurrentClub();
    const matchNum = this.currentMatchIndex + 1;
    let rivalName = RIVAL_NAMES[(this.season * 3 + matchNum) % RIVAL_NAMES.length];
    
    // Final maçı ise dev rakip
    if (matchNum === this.matchesPerSeason) {
      rivalName = club.tier === 3 ? 'Barcelona FC (Şampiyonlar Ligi Finali)' : 'Fenerbahçe SK (Kupa Finali)';
    }

    // Maç senaryosu türleri: 'freekick', 'penalty', 'pass_shoot'
    let scenarios = [];
    if (this.player.position === 'GK') {
      // Kaleci senaryoları: Rakip frikik ve penaltıları kurtarma
      scenarios = [
        { type: 'penalty', title: '90. Dakika Penaltı Kurtarışı!', distance: 11, desc: 'Rakip forvet topun başında. Köşeyi doğru tahmin et ve kurtar!' },
        { type: 'freekick', title: 'Kritik Baraj Üstü Frikik', distance: 23, desc: 'Ceza yayından tehlikeli frikik. Uç ve köşeden çıkar!' },
        { type: 'freekick', title: 'Uzaktan 90\'a Falsolu Şut', distance: 28, desc: 'Çaprazdan sert falso geliyor. Kaleyi savun!' },
        { type: 'penalty', title: 'Kupa Maçı Penaltı Düellosu', distance: 11, desc: 'Soğukkanlı kal, topa doğru hamle yap!' }
      ];
    } else {
      // Forvet ve Orta Saha Senaryoları (Dinamik Açık Oyun, Pres Yapan Stoperler & Frikikler)
      const pool = [
        { type: 'open_play', title: 'Hızlı Kontratak & Defansı Çalımla', distance: 29, desc: 'Stoperler üstüne koşuyor! [E/V] ile çalım at veya sıyrıl, golü yaz!' },
        { type: 'box_attack', title: 'Ceza Sahasına Akın & 1v2 Hücum', distance: 24, desc: 'Defanslar sert pres yapıyor! Çalım at veya faul alıp serbest vuruş kazan!' },
        { type: 'dribble_shoot', title: 'Birebir Çalımlama & 90\'a Füze', distance: 22, desc: 'Rakip stoperi terse yatırıp sıyrıl, kalecinin uzanamayacağı köşeye vur!' },
        { type: 'freekick', title: '24 Metre Serbest Vuruş', distance: 24, desc: 'Barajın üstünden kalenin 90\'ına falsolu şut çek!' },
        { type: 'counter_attack', title: 'Akan Oyunda Şık Plase', distance: 27, desc: 'Pres yapan defansları ekarte et, kaleciyle karşı karşıya bitir!' },
        { type: 'penalty', title: 'Hakem Penaltı Noktasını Gösterdi!', distance: 11, desc: 'Kaleciyi ters köşeye yatır veya çatala gönder!' },
        { type: 'freekick', title: '90+3 Son Dakika Frikik', distance: 27, desc: 'Şampiyonluk bu vuruşa bağlı! Kalecinin uzanamayacağı köşeye falsola!' }
      ];
      // Karışık 4 senaryo seç (Açık oyun ağırlıklı)
      scenarios = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    this.currentMatch = {
      matchNumber: matchNum,
      homeTeam: club.name,
      awayTeam: rivalName,
      scenarios: scenarios,
      currentScenarioIdx: 0,
      goalsThisMatch: 0,
      assistsThisMatch: 0,
      savesThisMatch: 0,
      matchScoreHome: 0,
      matchScoreAway: 0
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

  finishMatch() {
    if (!this.currentMatch) return null;
    this.seasonStats.matches++;

    // Maç puanı hesapla (6.0 - 10.0 arası)
    let matchRating = 6.2;
    if (this.player.position === 'GK') {
      matchRating += (this.currentMatch.savesThisMatch * 1.2);
    } else {
      matchRating += (this.currentMatch.goalsThisMatch * 1.1) + (this.currentMatch.assistsThisMatch * 0.7);
    }
    matchRating = Math.min(10.0, Math.max(5.0, Number(matchRating.toFixed(1))));

    this.seasonStats.totalRating += matchRating;

    // Oyuncu OVR ve Piyasa Değeri Gelişimi
    if (matchRating >= 8.0) {
      this.player.overall = Math.min(99, this.player.overall + 1);
      this.player.marketValue += Math.round(this.player.marketValue * 0.15);
    }

    const summary = {
      matchNum: this.currentMatch.matchNumber,
      homeTeam: this.currentMatch.homeTeam,
      awayTeam: this.currentMatch.awayTeam,
      homeScore: this.currentMatch.matchScoreHome,
      awayScore: this.currentMatch.matchScoreAway,
      goals: this.currentMatch.goalsThisMatch,
      saves: this.currentMatch.savesThisMatch,
      rating: matchRating,
      motm: matchRating >= 8.5
    };

    this.currentMatchIndex++;
    this.saveProfile();

    const isSeasonEnd = this.currentMatchIndex >= this.matchesPerSeason;
    return { summary, isSeasonEnd };
  }

  // SEZON BİTTİĞİNDE TRANSFER TEKLİFLERİ ÜRET
  generateTransferOffers() {
    const avgRating = this.seasonStats.matches > 0 
      ? (this.seasonStats.totalRating / this.seasonStats.matches).toFixed(1)
      : 7.0;

    const currentClub = this.getCurrentClub();
    const offers = [];

    // Mevcut Kulüpten Sözleşme Yenileme Teklifi (Her zaman gelir)
    const renewalWage = Math.round(this.player.wage * (avgRating >= 7.5 ? 1.4 : 1.1));
    offers.push({
      club: currentClub,
      type: 'renewal',
      headline: `${currentClub.name} Sözleşme Uzatmak İstiyor!`,
      weeklyWage: renewalWage,
      status: 'Mevcut Kulübün',
      promise: 'Takım Kaptanı & Değişilmez İlk 11',
      desc: 'Kulüp performansından çok memnun, maaşına zam yaparak seni takımda tutmak istiyor.'
    });

    // Başarıya Göre Dış Teklifler
    const allClubs = Object.values(CLUBS_DATABASE).filter(c => c.id !== currentClub.id);

    // Eğer ortalama puan 8.5+ ise Tier 3 (Real Madrid, City, Bayern vb.) teklif yapar
    // Eğer 7.2+ ise Tier 2 (GS, FB, BJK, Ajax) teklif yapar
    allClubs.forEach(club => {
      let shouldOffer = false;
      let weeklyWage = 0;

      if (club.tier === 3 && avgRating >= 8.3 && this.player.overall >= 78) {
        shouldOffer = true;
        weeklyWage = Math.round(180000 + (this.player.overall * 1500));
      } else if (club.tier === 2 && avgRating >= 7.0) {
        shouldOffer = true;
        weeklyWage = Math.round(35000 + (this.player.overall * 600));
      } else if (club.tier === 1 && avgRating < 7.0) {
        shouldOffer = true;
        weeklyWage = Math.round(8000 + (this.player.overall * 100));
      }

      if (shouldOffer) {
        offers.push({
          club: club,
          type: 'transfer',
          headline: `${club.name} Dev Transfer Teklifi Yaptı!`,
          weeklyWage: weeklyWage,
          status: `${club.league}`,
          promise: this.player.position === 'GK' ? '1 Numaralı Eldiven & Kupa Hedefi' : 'Hücum Hattı Lideri & 10 Numara',
          desc: `${club.name} scoutları sezon boyunca seni izledi. Seni transfer etmek için dev bonservis ödemeye hazırlar!`
        });
      }
    });

    // En az 3 cazip teklif garanti olsun
    if (offers.length < 3) {
      const fallbackClubs = allClubs.filter(c => !offers.some(o => o.club.id === c.id));
      if (fallbackClubs.length > 0) {
        const fc = fallbackClubs[0];
        offers.push({
          club: fc,
          type: 'transfer',
          headline: `${fc.name} Resmî Masaya Oturdu!`,
          weeklyWage: Math.round(this.player.wage * 1.3),
          status: `${fc.league}`,
          promise: 'İlk 11 Garantisi',
          desc: 'Gelecek sezon iddialı bir kadro kurmak istiyorlar.'
        });
      }
    }

    return {
      avgRating,
      stats: { ...this.seasonStats },
      offers
    };
  }

  // Kulüp Transferini Kabul Et
  acceptTransfer(clubId, newWage) {
    if (!this.player) return;
    const oldClub = this.getCurrentClub();
    this.player.clubId = clubId;
    if (newWage) this.player.wage = newWage;

    // Sezonu bir artır, maç sayacını sıfırla
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
