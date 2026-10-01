// ==========================================================
// FUTBOL KARİYER & LİG SEZONU SİSTEMİ (career.js)
// ==========================================================

const CLUBS_DATABASE = {
  'galatasaray': {
    id: 'galatasaray',
    name: 'Galatasaray SK',
    short: 'GS',
    tier: 2,
    leagueId: 'super-lig',
    reputation: 85,
    colors: { primary: '#b81414', secondary: '#f39c12', text: '#ffffff' },
    league: 'Trendyol Süper Lig',
    budget: '€35M',
    badge: '🦁'
  },
  'fenerbahce': {
    id: 'fenerbahce',
    name: 'Fenerbahçe SK',
    short: 'FB',
    tier: 2,
    leagueId: 'super-lig',
    reputation: 84,
    colors: { primary: '#0c2461', secondary: '#f1c40f', text: '#ffffff' },
    league: 'Trendyol Süper Lig',
    budget: '€32M',
    badge: '🐦'
  },
  'besiktas': {
    id: 'besiktas',
    name: 'Beşiktaş JK',
    short: 'BJK',
    tier: 2,
    leagueId: 'super-lig',
    reputation: 81,
    colors: { primary: '#111111', secondary: '#ffffff', text: '#ffffff' },
    league: 'Trendyol Süper Lig',
    budget: '€25M',
    badge: '🦅'
  },
  'trabzonspor': {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    short: 'TS',
    tier: 2,
    leagueId: 'super-lig',
    reputation: 79,
    colors: { primary: '#800020', secondary: '#5dade2', text: '#ffffff' },
    league: 'Trendyol Süper Lig',
    budget: '€18M',
    badge: '⚡'
  },
  'realmadrid': {
    id: 'realmadrid',
    name: 'Real Madrid CF',
    short: 'RMA',
    tier: 3,
    leagueId: 'la-liga',
    reputation: 96,
    colors: { primary: '#f5f6fa', secondary: '#d4af37', text: '#1e272e' },
    league: 'La Liga EA Sports',
    budget: '€140M',
    badge: '👑'
  },
  'barcelona': {
    id: 'barcelona',
    name: 'FC Barcelona',
    short: 'BAR',
    tier: 3,
    leagueId: 'la-liga',
    reputation: 94,
    colors: { primary: '#a50044', secondary: '#004d98', text: '#ffffff' },
    league: 'La Liga EA Sports',
    budget: '€95M',
    badge: '🔵'
  },
  'mancity': {
    id: 'mancity',
    name: 'Manchester City',
    short: 'MCI',
    tier: 3,
    leagueId: 'premier-league',
    reputation: 95,
    colors: { primary: '#68c5db', secondary: '#0c2461', text: '#ffffff' },
    league: 'Premier League',
    budget: '€160M',
    badge: '🚢'
  },
  'arsenal': {
    id: 'arsenal',
    name: 'Arsenal FC',
    short: 'ARS',
    tier: 3,
    leagueId: 'premier-league',
    reputation: 92,
    colors: { primary: '#ef0107', secondary: '#ffffff', text: '#ffffff' },
    league: 'Premier League',
    budget: '€110M',
    badge: '💣'
  },
  'liverpool': {
    id: 'liverpool',
    name: 'Liverpool FC',
    short: 'LIV',
    tier: 3,
    leagueId: 'premier-league',
    reputation: 93,
    colors: { primary: '#c8102e', secondary: '#00b2a9', text: '#ffffff' },
    league: 'Premier League',
    budget: '€120M',
    badge: '🔴'
  },
  'bayern': {
    id: 'bayern',
    name: 'Bayern München',
    short: 'FCB',
    tier: 3,
    leagueId: 'bundesliga',
    reputation: 94,
    colors: { primary: '#dc052d', secondary: '#ffffff', text: '#ffffff' },
    league: 'Bundesliga',
    budget: '€130M',
    badge: '🔴'
  },
  'inter': {
    id: 'inter',
    name: 'Inter Milan',
    short: 'INT',
    tier: 3,
    leagueId: 'serie-a',
    reputation: 90,
    colors: { primary: '#0019a5', secondary: '#000000', text: '#ffffff' },
    league: 'Serie A Enilive',
    budget: '€70M',
    badge: '🐍'
  }
};

class CareerManager {
  constructor() {
    this.leagueId = 'super-lig';
    this.myTeamId = 'galatasaray';
    this.rivalTeamId = 'fenerbahce';
    this.currentWeek = 1;
    this.totalWeeks = 10;
    this.standings = [];
    this.history = [];

    // Profil uyumluluğu
    this.player = null;
    this.season = 1;
    this.currentMatchIndex = 0;
    this.matchesPerSeason = 6;
    this.seasonStats = { matches: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, totalRating: 0 };

    this.loadLeagueSeason();
  }

  // ==========================================
  // LİG & SEZON YÖNETİMİ
  // ==========================================

  startLeagueSeason(leagueId = 'super-lig', myTeamId = 'galatasaray', rivalTeamId = null) {
    this.leagueId = leagueId;
    this.myTeamId = myTeamId;
    this.currentWeek = 1;
    this.totalWeeks = 10;
    this.history = [];

    // Ligdeki takımları çek ve puan tablosu oluştur
    const leagueTeams = window.dataService ? window.dataService.getTeamsByLeague(leagueId) : [];
    const validTeams = (leagueTeams && leagueTeams.length >= 2)
      ? leagueTeams
      : (window.dataService ? window.dataService.teams.slice(0, 6) : []);

    // Takımların başlangıç tablosu
    this.standings = validTeams.map((t, idx) => ({
      rank: idx + 1,
      teamId: t.id,
      name: t.name,
      logo: t.logo || '⚽',
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
      form: []
    }));

    // İlk rakibi seç (benim takımımdan farklı olan)
    const opponents = validTeams.filter(t => t.id !== myTeamId);
    this.rivalTeamId = rivalTeamId || (opponents.length > 0 ? opponents[0].id : 'fenerbahce');

    this.saveLeagueSeason();
    this.renderCareerHub();
  }

  loadLeagueSeason() {
    try {
      const data = localStorage.getItem('fc_arcade_career_season');
      if (data) {
        const parsed = JSON.parse(data);
        this.leagueId = parsed.leagueId || 'super-lig';
        this.myTeamId = parsed.myTeamId || 'galatasaray';
        this.rivalTeamId = parsed.rivalTeamId || 'fenerbahce';
        this.currentWeek = parsed.currentWeek || 1;
        this.totalWeeks = parsed.totalWeeks || 10;
        this.standings = parsed.standings || [];
        this.history = parsed.history || [];
      } else {
        this.startLeagueSeason('super-lig', 'galatasaray', 'fenerbahce');
      }
    } catch (e) {
      console.warn("Kariyer sezonu yüklenemedi, sıfırlanıyor:", e);
      this.startLeagueSeason('super-lig', 'galatasaray', 'fenerbahce');
    }
  }

  saveLeagueSeason() {
    try {
      const payload = {
        leagueId: this.leagueId,
        myTeamId: this.myTeamId,
        rivalTeamId: this.rivalTeamId,
        currentWeek: this.currentWeek,
        totalWeeks: this.totalWeeks,
        standings: this.standings,
        history: this.history
      };
      localStorage.setItem('fc_arcade_career_season', JSON.stringify(payload));
    } catch (e) {
      console.warn("Kariyer sezonu kaydedilemedi:", e);
    }
  }

  setRival(newRivalId) {
    if (!newRivalId || newRivalId === this.myTeamId) return;
    this.rivalTeamId = newRivalId;
    this.saveLeagueSeason();
    this.renderCareerHub();
  }

  setLeagueAndTeam(leagueId, teamId) {
    this.startLeagueSeason(leagueId, teamId);
  }

  // ==========================================
  // HAFTANIN MAÇINI 3D OLARAK BAŞLAT
  // ==========================================

  playCurrentMatch() {
    if (!window.dataService) return;

    const myTeam = window.dataService.getTeamById(this.myTeamId);
    const rivalTeam = window.dataService.getTeamById(this.rivalTeamId);

    if (!myTeam || !rivalTeam) {
      alert("Takım bilgileri bulunamadı!");
      return;
    }

    const homeData = {
      name: myTeam.name,
      short: myTeam.name.substring(0, 3).toUpperCase(),
      logo: myTeam.logo,
      color: parseInt(myTeam.colors[0].replace('#', '0x')) || 0xb81414
    };

    const awayData = {
      name: rivalTeam.name,
      short: rivalTeam.name.substring(0, 3).toUpperCase(),
      logo: rivalTeam.logo,
      color: parseInt(rivalTeam.colors[0].replace('#', '0x')) || 0x0c2461
    };

    // Modal'ı kapat ve 3D maçı aç
    if (window.platformManager) {
      window.platformManager.closeGameModeSelector(true);
      window.platformManager.showView('game', 'no-auto');
    }

    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'career', { duration: 180, difficulty: 'normal' });
      window.matchEngine.showMatchBanner(`⭐ ${this.currentWeek}. HAFTA: ${myTeam.name} vs ${rivalTeam.name}`);
    }
  }

  // ==========================================
  // 3D MAÇ BİTTİĞİNDE TETİKLENEN METOD
  // ==========================================

  onArcadeMatchEnded(userScore, rivalScore, homeTeam, awayTeam) {
    // 1. Kullanıcı takımı ve rakip takımı bul
    const myRow = this.standings.find(s => s.teamId === this.myTeamId);
    const rivalRow = this.standings.find(s => s.teamId === this.rivalTeamId);

    if (myRow) {
      myRow.p += 1;
      myRow.gf += userScore;
      myRow.ga += rivalScore;
      myRow.gd = myRow.gf - myRow.ga;

      if (userScore > rivalScore) {
        myRow.w += 1;
        myRow.pts += 3;
        myRow.form.unshift('W');
      } else if (userScore === rivalScore) {
        myRow.d += 1;
        myRow.pts += 1;
        myRow.form.unshift('D');
      } else {
        myRow.l += 1;
        myRow.form.unshift('L');
      }
      if (myRow.form.length > 5) myRow.form.pop();
    }

    if (rivalRow) {
      rivalRow.p += 1;
      rivalRow.gf += rivalScore;
      rivalRow.ga += userScore;
      rivalRow.gd = rivalRow.gf - rivalRow.ga;

      if (rivalScore > userScore) {
        rivalRow.w += 1;
        rivalRow.pts += 3;
        rivalRow.form.unshift('W');
      } else if (rivalScore === userScore) {
        rivalRow.d += 1;
        rivalRow.pts += 1;
        rivalRow.form.unshift('D');
      } else {
        rivalRow.l += 1;
        rivalRow.form.unshift('L');
      }
      if (rivalRow.form.length > 5) rivalRow.form.pop();
    }

    // 2. Ligdeki diğer takımların maçlarını simüle et
    const otherTeams = this.standings.filter(s => s.teamId !== this.myTeamId && s.teamId !== this.rivalTeamId);
    for (let i = 0; i < otherTeams.length; i += 2) {
      const t1 = otherTeams[i];
      const t2 = otherTeams[i + 1];
      if (t1 && t2) {
        const s1 = Math.floor(Math.random() * 4);
        const s2 = Math.floor(Math.random() * 3);
        t1.p++; t2.p++;
        t1.gf += s1; t1.ga += s2; t1.gd = t1.gf - t1.ga;
        t2.gf += s2; t2.ga += s1; t2.gd = t2.gf - t2.ga;

        if (s1 > s2) {
          t1.w++; t1.pts += 3; t1.form.unshift('W');
          t2.l++; t2.form.unshift('L');
        } else if (s1 === s2) {
          t1.d++; t1.pts += 1; t1.form.unshift('D');
          t2.d++; t2.pts += 1; t2.form.unshift('D');
        } else {
          t2.w++; t2.pts += 3; t2.form.unshift('W');
          t1.l++; t1.form.unshift('L');
        }
        if (t1.form.length > 5) t1.form.pop();
        if (t2.form.length > 5) t2.form.pop();
      } else if (t1) {
        // Tek takım kaldıysa bay geçti veya rastgele maç
        t1.p++;
        const won = Math.random() > 0.4;
        if (won) { t1.w++; t1.pts += 3; t1.gf += 2; t1.ga += 1; t1.form.unshift('W'); }
        else { t1.d++; t1.pts += 1; t1.gf += 1; t1.ga += 1; t1.form.unshift('D'); }
        t1.gd = t1.gf - t1.ga;
        if (t1.form.length > 5) t1.form.pop();
      }
    }

    // 3. Sıralamayı Puan, Averaj ve Atılan Gol bazında güncelle
    this.standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    this.standings.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    // 4. Maç geçmişine ekle
    this.history.unshift({
      week: this.currentWeek,
      home: homeTeam.name,
      away: awayTeam.name,
      score: `${userScore} - ${rivalScore}`,
      result: userScore > rivalScore ? 'Galibiyet (+3)' : (userScore === rivalScore ? 'Beraberlik (+1)' : 'Mağlubiyet (0)')
    });

    // 5. Bir sonraki haftaya geç ve sıradaki rakibi belirle
    this.currentWeek++;
    const leagueTeams = window.dataService ? window.dataService.getTeamsByLeague(this.leagueId) : [];
    const opponents = leagueTeams.filter(t => t.id !== this.myTeamId);
    if (opponents.length > 0) {
      const nextIdx = (this.currentWeek - 1) % opponents.length;
      this.rivalTeamId = opponents[nextIdx].id;
    }

    this.saveLeagueSeason();
    this.renderCareerHub();
  }

  // ==========================================
  // KARİYER ARAYÜZÜ (CAREER HUB UI)
  // ==========================================

  renderCareerHub() {
    const container = document.getElementById('career-hub-container');
    if (!container) return;

    const myTeam = window.dataService ? window.dataService.getTeamById(this.myTeamId) : { name: 'Galatasaray SK', logo: '🦁' };
    const rivalTeam = window.dataService ? window.dataService.getTeamById(this.rivalTeamId) : { name: 'Fenerbahçe SK', logo: '🐦' };
    const league = window.dataService ? window.dataService.leagues.find(l => l.id === this.leagueId) : { name: 'Trendyol Süper Lig', flag: '🇹🇷' };
    const leagueTeams = window.dataService ? window.dataService.getTeamsByLeague(this.leagueId) : [];
    const opponentOptions = leagueTeams.filter(t => t.id !== this.myTeamId);

    const isSeasonFinished = this.currentWeek > this.totalWeeks;
    const myRank = this.standings.find(s => s.teamId === this.myTeamId)?.rank || 1;

    let html = `
      <div class="career-hub-wrapper">
        <!-- 1. ÜST PANEL: LİG VE KULÜP SEÇİMİ -->
        <div class="career-top-bar glass-card p-3 mb-3" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:2.4rem;">${myTeam.logo || '🦁'}</div>
            <div>
              <h3 style="margin:0; font-size:1.35rem; color:#fff;">${myTeam.name}</h3>
              <span style="color:#00f2fe; font-size:0.9rem; font-weight:600;">${league ? league.flag : '🇹🇷'} ${league ? league.name : 'Süper Lig'} • Sezon 1 • Lig Sırası: #${myRank}</span>
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <button class="btn-micro-details" onclick="window.careerManager.promptChangeTeamModal()" style="padding:8px 14px; font-size:0.88rem; background:rgba(255,255,255,0.08); border-radius:8px; color:#fff; border:1px solid rgba(255,255,255,0.2); cursor:pointer;">
              🔄 Lig / Takım Değiştir
            </button>
            <button class="btn-micro-details" onclick="window.careerManager.resetCareerSeason()" style="padding:8px 14px; font-size:0.88rem; background:rgba(231,76,60,0.15); border-radius:8px; color:#ff7675; border:1px solid rgba(231,76,60,0.4); cursor:pointer;">
              ⚠️ Sıfırla
            </button>
          </div>
        </div>

        <!-- 2. SIRADAKİ MAÇ KARTI (FIXTURE CARD) -->
        <div class="career-fixture-card glass-card p-4 mb-3" style="background:linear-gradient(135deg, rgba(20,25,45,0.85), rgba(10,15,30,0.95)); border:1px solid rgba(0,242,254,0.3); border-radius:14px; text-align:center;">
          ${isSeasonFinished ? `
            <div style="padding:20px;">
              <h2 style="color:#ffd700; font-size:2rem; margin-bottom:8px;">🏆 SEZON TAMAMLANDI!</h2>
              <p style="font-size:1.1rem; color:#ddd;">${myRank === 1 ? '🎉 TEBRİKLER! LİGİ ŞAMPİYON OLARAK BİTİRDİNİZ! 🏆' : `Sezonu #${myRank}. sırada tamamladınız.`}</p>
              <button class="btn-primary-action btn-large" style="margin-top:15px; padding:12px 28px;" onclick="window.careerManager.startLeagueSeason('${this.leagueId}', '${this.myTeamId}')">
                🔄 YENİ SEZONA BAŞLA!
              </button>
            </div>
          ` : `
            <div style="display:inline-block; padding:4px 14px; border-radius:20px; background:rgba(0,242,254,0.15); color:#00f2fe; font-weight:bold; font-size:0.85rem; margin-bottom:14px;">
              ⚽ HAFTA ${this.currentWeek} / ${this.totalWeeks} • SIRADAKİ RESMİ LİG MAÇI
            </div>

            <div style="display:flex; justify-content:center; align-items:center; gap:25px; margin-bottom:16px;">
              <div style="flex:1; text-align:right;">
                <span style="font-size:2.8rem; display:block;">${myTeam.logo || '🦁'}</span>
                <b style="font-size:1.25rem; color:#fff;">${myTeam.name}</b>
                <span style="display:block; color:#aaa; font-size:0.85rem;">EV SAHİBİ (SEN)</span>
              </div>

              <div style="font-size:1.8rem; font-weight:900; color:#ffd700; background:rgba(0,0,0,0.4); padding:8px 16px; border-radius:10px; border:1px solid rgba(255,215,0,0.3);">
                VS
              </div>

              <div style="flex:1; text-align:left;">
                <span style="font-size:2.8rem; display:block;">${rivalTeam.logo || '🐦'}</span>
                <b style="font-size:1.25rem; color:#fff;">${rivalTeam.name}</b>
                <span style="display:block; color:#aaa; font-size:0.85rem;">DEPLASMAN (RAKİP AI)</span>
              </div>
            </div>

            <!-- Rakip Değiştirme Seçeneği -->
            <div style="margin-bottom:16px; display:flex; justify-content:center; align-items:center; gap:10px;">
              <label style="color:#aaa; font-size:0.88rem;">🎯 Rakip Takımı Değiştir:</label>
              <select class="form-select" style="max-width:260px; padding:6px 12px; font-size:0.88rem; background:#111827; color:#fff; border:1px solid #374151; border-radius:6px;" onchange="window.careerManager.setRival(this.value)">
                ${opponentOptions.map(t => `
                  <option value="${t.id}" ${t.id === this.rivalTeamId ? 'selected' : ''}>${t.logo} ${t.name}</option>
                `).join('')}
              </select>
            </div>

            <button class="btn-primary-action btn-large w-full" style="padding:14px 20px; font-size:1.2rem; font-weight:800; letter-spacing:1px; background:linear-gradient(90deg, #f39c12, #e74c3c); box-shadow:0 0 25px rgba(243,156,18,0.5); border:none; border-radius:10px; cursor:pointer;" onclick="window.careerManager.playCurrentMatch()">
              ⚽ HAFTANIN MAÇINA ÇIK (3D ARCADE OYNA)!
            </button>
          `}
        </div>

        <!-- 3. CANLI PUAN TABLOSU (STANDINGS) -->
        <div class="career-standings-card glass-card p-3" style="background:rgba(15,20,35,0.7); border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
            <h4 style="margin:0; font-size:1.1rem; color:#fff;">📊 CANLI LİG PUAN DURUMU</h4>
            <span style="font-size:0.85rem; color:#aaa;">${league ? league.name : 'Lig Sezonu'}</span>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:center; font-size:0.9rem;">
              <thead>
                <tr style="color:#aaa; border-bottom:1px solid rgba(255,255,255,0.1); height:32px;">
                  <th style="width:40px;">#</th>
                  <th style="text-align:left; padding-left:8px;">Takım</th>
                  <th>O</th>
                  <th>G</th>
                  <th>B</th>
                  <th>M</th>
                  <th>AG</th>
                  <th>YG</th>
                  <th>AV</th>
                  <th style="color:#ffd700; font-weight:bold;">P</th>
                  <th>Form</th>
                </tr>
              </thead>
              <tbody>
                ${this.standings.map(s => {
                  const isMyTeam = s.teamId === this.myTeamId;
                  const rowBg = isMyTeam ? 'rgba(0, 242, 254, 0.15)' : 'transparent';
                  const rowBorder = isMyTeam ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.05)';
                  return `
                    <tr style="height:36px; background:${rowBg}; border-bottom:${rowBorder}; font-weight:${isMyTeam ? '700' : 'normal'};">
                      <td style="color:${s.rank <= 2 ? '#ffd700' : '#fff'};">${s.rank}</td>
                      <td style="text-align:left; padding-left:8px; color:${isMyTeam ? '#00f2fe' : '#fff'};">
                        ${s.logo} ${s.name} ${isMyTeam ? '<span style="font-size:0.75rem; background:#00f2fe; color:#000; padding:1px 6px; border-radius:10px; margin-left:4px;">SEN</span>' : ''}
                      </td>
                      <td>${s.p}</td>
                      <td>${s.w}</td>
                      <td>${s.d}</td>
                      <td>${s.l}</td>
                      <td>${s.gf}</td>
                      <td>${s.ga}</td>
                      <td>${s.gd > 0 ? '+' + s.gd : s.gd}</td>
                      <td style="color:#ffd700; font-weight:900; font-size:1.05rem;">${s.pts}</td>
                      <td style="font-size:0.75rem;">
                        ${(s.form || []).map(f => {
                          const c = f === 'W' ? '#2ecc71' : (f === 'D' ? '#f39c12' : '#e74c3c');
                          return `<span style="background:${c}; color:#fff; padding:2px 5px; border-radius:4px; margin:0 1px;">${f}</span>`;
                        }).join('')}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. LİG VE TAKIM DEĞİŞTİRME MODALI (POPUP) -->
        <div id="career-team-picker-modal" class="modal-overlay hidden" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center;">
          <div class="glass-card p-4" style="background:#111827; border:1px solid #374151; border-radius:12px; max-width:480px; width:90%; color:#fff;">
            <h3 style="margin-top:0; color:#ffd700;">⭐ YENİ KARİYER SEZONU OLUŞTUR</h3>
            <p style="color:#aaa; font-size:0.9rem;">Yönetmek istediğin ligi ve kulübü seçerek yeni sezona başla!</p>

            <div class="form-group mb-3">
              <label style="display:block; margin-bottom:6px; color:#ddd;">🌍 Lig Seç:</label>
              <select id="modal-select-career-league" class="form-select w-full" style="width:100%; padding:8px 12px; background:#1f2937; color:#fff; border:1px solid #4b5563; border-radius:6px;" onchange="window.careerManager.onModalLeagueChanged(this.value)">
                ${(window.dataService?.leagues || []).map(l => `
                  <option value="${l.id}" ${l.id === this.leagueId ? 'selected' : ''}>${l.flag || '⚽'} ${l.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group mb-4">
              <label style="display:block; margin-bottom:6px; color:#ddd;">🛡️ Kulübünü Seç:</label>
              <select id="modal-select-career-team" class="form-select w-full" style="width:100%; padding:8px 12px; background:#1f2937; color:#fff; border:1px solid #4b5563; border-radius:6px;">
                <!-- Dinamik Doldurulur -->
              </select>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button class="btn-micro-details" style="padding:8px 16px; background:#374151; color:#fff; border-radius:6px; border:none; cursor:pointer;" onclick="document.getElementById('career-team-picker-modal').style.display='none'">İptal</button>
              <button class="btn-primary-action" style="padding:8px 18px; border-radius:6px; cursor:pointer;" onclick="window.careerManager.confirmNewSeason()">🚀 SEZONU BAŞLAT</button>
            </div>
          </div>
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  promptChangeTeamModal() {
    const modal = document.getElementById('career-team-picker-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.onModalLeagueChanged(this.leagueId);
    }
  }

  onModalLeagueChanged(leagueId) {
    const teamSelect = document.getElementById('modal-select-career-team');
    if (!teamSelect || !window.dataService) return;

    const teams = window.dataService.getTeamsByLeague(leagueId);
    teamSelect.innerHTML = teams.map(t => `
      <option value="${t.id}" ${t.id === this.myTeamId ? 'selected' : ''}>${t.logo || '⚽'} ${t.name}</option>
    `).join('');
  }

  confirmNewSeason() {
    const leagueSelect = document.getElementById('modal-select-career-league');
    const teamSelect = document.getElementById('modal-select-career-team');

    const leagueId = leagueSelect ? leagueSelect.value : 'super-lig';
    const teamId = teamSelect ? teamSelect.value : 'galatasaray';

    const modal = document.getElementById('career-team-picker-modal');
    if (modal) modal.style.display = 'none';

    this.startLeagueSeason(leagueId, teamId);
  }

  resetCareerSeason() {
    if (confirm("Kariyer sezonunu sıfırlamak ve 1. haftadan yeniden başlamak istediğine emin misin?")) {
      this.startLeagueSeason(this.leagueId, this.myTeamId);
    }
  }

  // Profil uyumluluğu için
  hasSavedProfile() { return true; }
  getCurrentClub() {
    const team = window.dataService?.getTeamById(this.myTeamId);
    return team || CLUBS_DATABASE['galatasaray'];
  }
}

// Global örnek oluşturucu
window.careerManager = new CareerManager();
