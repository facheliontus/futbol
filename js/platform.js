// ==========================================================
// PRO FOOTBALL HUB - PLATFORM UI VE YÖNETİM MOTORU (platform.js)
// ==========================================================

class PlatformManager {
  constructor() {
    this.currentView = 'home';
    this.activeMatchId = 'm1';
    this.activeLeagueId = 'super-lig';
    this.activeTeamId = 'galatasaray';
    this.activePlayerId = 'osimhen';
    this.activeMatchTab = 'general';
    this.activeTeamTab = 'overview';
    this.aiChatHistory = [];
    this.adminRole = 'admin'; // 'admin', 'editor'

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindGlobalSearch();
    this.bindAIAssistant();
    this.bindNotifications();
    this.bindAdminPanel();
    this.renderHome();
  }

  // GÖRÜNÜM DEĞİŞTİRİCİ (VIEW ROUTER)
  showView(viewName, param = null) {
    this.currentView = viewName;

    // Tüm platform view'larını gizle
    document.querySelectorAll('.platform-view').forEach(v => v.classList.remove('active'));

    // Aktif linki güncelle
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    const canvasContainer = document.getElementById('game-canvas-container');
    const hudOverlay = document.getElementById('hud-overlay');

    if (viewName === 'game') {
      // 3D Oyun Moduna Geçiş
      if (canvasContainer) canvasContainer.style.display = 'block';
      if (hudOverlay) hudOverlay.style.display = 'flex';
      document.getElementById('platform-main-container').style.display = 'none';
      const navbar = document.getElementById('platform-navbar');
      if (navbar) navbar.style.display = 'none';
      document.body.style.overflow = 'hidden';

      // 3D oyun pencere boyutunu güncelle
      if (window.gameInstance) {
        window.gameInstance.onResize();
      }

      // Aktif maç yoksa Galatasaray vs Fenerbahçe derbi maçını anında sahada başlat!
      if (!window.matchEngine?.isActive && param !== 'no-auto') {
        this.launchQuickDerbyMatch();
      }

      if (param === 'selector') {
        this.showGameModeSelector();
      }
      return;
    }

    // Platform Ekranlarına Geçiş
    if (canvasContainer) canvasContainer.style.display = 'none';
    if (hudOverlay) hudOverlay.style.display = 'none';
    document.getElementById('platform-main-container').style.display = 'block';
    const navbar = document.getElementById('platform-navbar');
    if (navbar) navbar.style.display = 'flex';
    document.body.style.overflow = 'auto';

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) targetEl.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sayfa renderları
    switch (viewName) {
      case 'home':
        this.renderHome();
        break;
      case 'live':
        this.renderLiveMatches();
        break;
      case 'match-center':
        if (param) this.activeMatchId = param;
        this.renderMatchCenter();
        break;
      case 'leagues':
        if (param) this.activeLeagueId = param;
        this.renderLeagues();
        break;
      case 'teams':
        if (param) this.activeTeamId = param;
        this.renderTeams();
        break;
      case 'players':
        if (param) this.activePlayerId = param;
        this.renderPlayers();
        break;
      case 'transfers':
        this.renderTransfers();
        break;
      case 'news':
        this.renderNews();
        break;
      case 'stats':
        this.renderStatsComparison();
        break;
      case 'profile':
        this.renderProfile();
        break;
      case 'admin':
        this.renderAdminPanel();
        break;
    }
  }

  // 1. ÜST NAVİGASYON BAĞLANTILARI
  bindNavigation() {
    document.querySelectorAll('.nav-link, .btn-switch-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        const param = e.currentTarget.dataset.param;
        if (view) this.showView(view, param);
      });
    });

    // Mobil Alt Navigasyon
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) this.showView(view);
      });
    });
  }

  // 2. ANA SAYFA RENDER (Canlı Maçlar, Bugünün Maçları, 3D Arena Banner)
  renderHome() {
    const liveMatches = window.dataService.getLiveMatches();
    const todayMatches = window.dataService.getTodayMatches();
    const news = window.dataService.news.slice(0, 3);
    const standings = window.dataService.getStandings('super-lig').slice(0, 5);

    // Canlı Maçlar Grid
    const liveContainer = document.getElementById('home-live-matches-grid');
    if (liveContainer) {
      liveContainer.innerHTML = liveMatches.map(m => `
        <div class="live-match-card glass-card" onclick="window.platformManager.showView('match-center', '${m.id}')">
          <div class="match-card-top">
            <span class="match-league-badge">${m.leagueName}</span>
            <span class="live-pulse-indicator"><span class="pulse-dot"></span> CANLI ${m.minute}</span>
          </div>
          <div class="match-card-teams">
            <div class="team-col home">
              <span class="team-avatar">${m.homeTeam.logo}</span>
              <span class="team-name">${m.homeTeam.name}</span>
            </div>
            <div class="score-col">
              <span class="big-score">${m.homeScore} - ${m.awayScore}</span>
              <span class="match-stadium">${m.broadcaster || 'Canlı Yayın'}</span>
            </div>
            <div class="team-col away">
              <span class="team-avatar">${m.awayTeam.logo}</span>
              <span class="team-name">${m.awayTeam.name}</span>
            </div>
          </div>
          <div class="match-card-bottom">
            <span>🏟️ ${m.stadium}</span>
            <button class="btn-micro-details">Maç Merkezi ➡️</button>
          </div>
        </div>
      `).join('');
    }

    // Bugünün Maçları Listesi
    const todayContainer = document.getElementById('home-today-matches-list');
    if (todayContainer) {
      todayContainer.innerHTML = window.dataService.matches.map(m => `
        <div class="today-match-row ${m.isLive ? 'is-live-row' : ''}" onclick="window.platformManager.showView('match-center', '${m.id}')">
          <div class="row-time">
            ${m.isLive ? `<span class="live-pill">CANLI ${m.minute}</span>` : `<span class="time-pill">${m.time}</span>`}
          </div>
          <div class="row-teams">
            <span class="row-team home"><span class="team-icon">${m.homeTeam.logo}</span> ${m.homeTeam.name}</span>
            <span class="row-score">${m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : 'vs'}</span>
            <span class="row-team away"><span class="team-icon">${m.awayTeam.logo}</span> ${m.awayTeam.name}</span>
          </div>
          <div class="row-meta">
            <span class="league-pill">${m.leagueName}</span>
            <span class="broadcaster-pill">${m.broadcaster || 'TRT'}</span>
          </div>
        </div>
      `).join('');
    }

    // Ana Sayfa Özet Puan Durumu
    const miniStandings = document.getElementById('home-mini-standings-body');
    if (miniStandings) {
      miniStandings.innerHTML = standings.map((s, idx) => `
        <tr class="standings-row ${idx === 0 ? 'top-team' : ''}" onclick="window.platformManager.showView('teams', '${s.teamId}')">
          <td><span class="rank-badge ${s.zone}">${s.rank}</span></td>
          <td class="team-td"><b>${s.name}</b></td>
          <td>${s.p}</td>
          <td>${s.w}</td>
          <td>${s.gd > 0 ? '+' + s.gd : s.gd}</td>
          <td><b>${s.pts}</b></td>
          <td>
            <div class="form-pills-mini">
              ${s.form.slice(-3).map(f => `<span class="mini-form-pill ${f}">${f}</span>`).join('')}
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Ana Sayfa Son Haberler
    const newsContainer = document.getElementById('home-news-grid');
    if (newsContainer) {
      newsContainer.innerHTML = news.map(n => `
        <div class="news-card glass-card" onclick="window.platformManager.showView('news')">
          <div class="news-img-box" style="background-image: url('${n.image}')">
            <span class="news-category-badge">${n.category}</span>
          </div>
          <div class="news-body">
            <span class="news-time">${n.badge} • ${n.time}</span>
            <h4>${n.title}</h4>
            <p>${n.summary}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. MAÇ MERKEZİ RENDER (Live Anlatım, 2D Saha Dizilişi, İstatistik Progress Bar, H2H)
  renderMatchCenter() {
    const match = window.dataService.getMatchById(this.activeMatchId);
    if (!match) return;

    // Header Bilgileri
    document.getElementById('mc-league-badge').innerText = match.leagueName;
    document.getElementById('mc-stadium-info').innerText = `🏟️ ${match.stadium} • ⏱️ ${match.date} ${match.time} • 👨‍⚖️ ${match.referee}`;
    document.getElementById('mc-home-name').innerText = match.homeTeam.name;
    document.getElementById('mc-home-logo').innerText = match.homeTeam.logo;
    document.getElementById('mc-away-name').innerText = match.awayTeam.name;
    document.getElementById('mc-away-logo').innerText = match.awayTeam.logo;
    document.getElementById('mc-score').innerText = match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'VS';
    document.getElementById('mc-minute-badge').innerText = match.isLive ? `CANLI ${match.minute}` : (match.status === 'FT' ? 'MAÇ BİTTİ' : 'BAŞLAMADI');

    // 2D Futbol Sahası Dizilişi
    this.renderPitchLineup(match);

    // Canlı Anlatım Timeline
    const commBox = document.getElementById('mc-commentary-timeline');
    if (commBox && match.commentary) {
      commBox.innerHTML = match.commentary.map(c => `
        <div class="commentary-item ${c.type}">
          <span class="comm-minute">${c.minute}</span>
          <div class="comm-text">${c.text}</div>
        </div>
      `).join('');
    }

    // Karşılaştırmalı İstatistik Progress Barları
    this.renderMatchStats(match);

    // H2H Geçmiş Maçlar
    const h2hBox = document.getElementById('mc-h2h-list');
    if (h2hBox && match.h2h) {
      h2hBox.innerHTML = match.h2h.map(h => `
        <div class="h2h-row">
          <span class="h2h-date">${h.date}</span>
          <span class="h2h-match">${h.home} <b>${h.score}</b> ${h.away}</span>
        </div>
      `).join('');
    }
  }

  renderPitchLineup(match) {
    const pitch = document.getElementById('tactical-pitch');
    if (!pitch || !match.lineups) return;

    const homeEleven = match.lineups.homeEleven || [];
    const awayEleven = match.lineups.awayEleven || [];

    // Gerçek Futbol Sahası Üzerine Oyuncu Noktaları
    pitch.innerHTML = `
      <div class="pitch-half home-half">
        ${homeEleven.map(p => `
          <div class="pitch-player home-player" style="left: ${p.x}%; top: ${p.y}%;" title="${p.name} (#${p.num})">
            <span class="player-num-circle">${p.num}</span>
            <span class="pitch-player-name">${p.name}</span>
          </div>
        `).join('')}
      </div>
      <div class="pitch-half away-half">
        ${awayEleven.map(p => `
          <div class="pitch-player away-player" style="left: ${p.x}%; bottom: ${p.y}%;" title="${p.name} (#${p.num})">
            <span class="player-num-circle">${p.num}</span>
            <span class="pitch-player-name">${p.name}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Formasyon ve Teknik Direktör Yazıları
    const infoBox = document.getElementById('mc-lineup-info');
    if (infoBox) {
      infoBox.innerHTML = `
        <div class="lineup-meta-col">
          <b>${match.homeTeam.name}:</b> ${match.lineups.homeFormation} (TD: ${match.lineups.homeCoach})
        </div>
        <div class="lineup-meta-col text-right">
          <b>${match.awayTeam.name}:</b> ${match.lineups.awayFormation} (TD: ${match.lineups.awayCoach})
        </div>
      `;
    }
  }

  renderMatchStats(match) {
    const statsContainer = document.getElementById('mc-stats-bars-container');
    if (!statsContainer || !match.stats) return;

    const s = match.stats;
    const statRows = [
      { label: 'Topa Sahip Olma (%)', val1: s.possession ? s.possession[0] : 50, val2: s.possession ? s.possession[1] : 50, isPct: true },
      { label: 'Toplam Şut', val1: s.shots ? s.shots[0] : 0, val2: s.shots ? s.shots[1] : 0 },
      { label: 'İsabetli Şut', val1: s.shotsOnTarget ? s.shotsOnTarget[0] : 0, val2: s.shotsOnTarget ? s.shotsOnTarget[1] : 0 },
      { label: 'Beklenen Gol (xG)', val1: s.xG ? s.xG[0] : 1.2, val2: s.xG ? s.xG[1] : 1.0 },
      { label: 'Korner', val1: s.corners ? s.corners[0] : 0, val2: s.corners ? s.corners[1] : 0 },
      { label: 'Faul', val1: s.fouls ? s.fouls[0] : 0, val2: s.fouls ? s.fouls[1] : 0 },
      { label: 'Sarı Kart', val1: s.yellowCards ? s.yellowCards[0] : 0, val2: s.yellowCards ? s.yellowCards[1] : 0 },
      { label: 'Pas İsabeti (%)', val1: s.passAcc ? s.passAcc[0] : 80, val2: s.passAcc ? s.passAcc[1] : 80, isPct: true }
    ];

    statsContainer.innerHTML = statRows.map(row => {
      const total = (Number(row.val1) + Number(row.val2)) || 1;
      const pct1 = Math.round((Number(row.val1) / total) * 100);
      const pct2 = 100 - pct1;

      return `
        <div class="stat-compare-row">
          <div class="stat-labels">
            <span class="stat-val-left"><b>${row.val1}</b></span>
            <span class="stat-title">${row.label}</span>
            <span class="stat-val-right"><b>${row.val2}</b></span>
          </div>
          <div class="stat-progress-track">
            <div class="progress-bar home-bar" style="width: ${pct1}%"></div>
            <div class="progress-bar away-bar" style="width: ${pct2}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. LİGLER VE PUAN DURUMU RENDER
  renderLeagues() {
    const leaguesNav = document.getElementById('leagues-selector-bar');
    if (leaguesNav) {
      leaguesNav.innerHTML = window.dataService.leagues.map(l => `
        <button class="league-tab-btn ${l.id === this.activeLeagueId ? 'active' : ''}" onclick="window.platformManager.switchLeague('${l.id}')">
          <span>${l.flag}</span> ${l.name}
        </button>
      `).join('');
    }

    const currentLeague = window.dataService.leagues.find(l => l.id === this.activeLeagueId) || window.dataService.leagues[0];
    document.getElementById('league-header-title').innerText = `${currentLeague.flag} ${currentLeague.name}`;
    document.getElementById('league-header-season').innerText = `Sezon: ${currentLeague.season} • ${currentLeague.country}`;

    const standings = window.dataService.getStandings(this.activeLeagueId);
    const tableBody = document.getElementById('league-full-standings-body');
    if (tableBody) {
      tableBody.innerHTML = standings.map(s => `
        <tr class="league-table-row ${s.zone}" onclick="window.platformManager.showView('teams', '${s.teamId}')">
          <td><span class="rank-indicator-cell ${s.zone}">${s.rank}</span></td>
          <td class="team-cell"><b>${s.name}</b></td>
          <td>${s.p}</td>
          <td>${s.w}</td>
          <td>${s.d}</td>
          <td>${s.l}</td>
          <td>${s.gf}</td>
          <td>${s.ga}</td>
          <td>${s.gd > 0 ? '+' + s.gd : s.gd}</td>
          <td><span class="pts-badge">${s.pts}</span></td>
          <td>
            <div class="form-indicators-wrap">
              ${s.form.map(f => `<span class="form-badge ${f}">${f}</span>`).join('')}
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Gol Krallığı Listesi
    const topScorers = document.getElementById('league-top-scorers');
    if (topScorers) {
      topScorers.innerHTML = window.dataService.players.slice(0, 4).map((p, idx) => `
        <div class="top-scorer-row" onclick="window.platformManager.showView('players', '${p.id}')">
          <span class="rank-num">#${idx + 1}</span>
          <div class="player-info-cell">
            <b>${p.name}</b>
            <small>${p.teamName} • ${p.pos}</small>
          </div>
          <div class="scorer-goals">
            <b>${p.goals} Gol</b>
            <small>${p.assists} Asist</small>
          </div>
        </div>
      `).join('');
    }
  }

  switchLeague(id) {
    this.activeLeagueId = id;
    this.renderLeagues();
  }

  // 5. TAKIM PROFİLİ RENDER
  renderTeams() {
    const team = window.dataService.getTeamById(this.activeTeamId);
    if (!team) return;

    document.getElementById('team-profile-name').innerText = team.name;
    document.getElementById('team-profile-logo').innerText = team.logo;
    document.getElementById('team-profile-meta').innerText = `${team.league} • 🏟️ ${team.stadium} • Kuruluş: ${team.founded} • TD: ${team.coach}`;

    // Takım İstatistik Kartları
    const statsGrid = document.getElementById('team-stats-overview-grid');
    if (statsGrid && team.stats) {
      statsGrid.innerHTML = `
        <div class="team-stat-box glass-card">
          <span class="ts-label">GALİBİYET ORANI</span>
          <span class="ts-value">%${team.stats.winRate}</span>
        </div>
        <div class="team-stat-box glass-card">
          <span class="ts-label">MAÇ BAŞI GOL</span>
          <span class="ts-value">${team.stats.avgGoals}</span>
        </div>
        <div class="team-stat-box glass-card">
          <span class="ts-label">YENİLEN GOL ORT.</span>
          <span class="ts-value">${team.stats.avgConceded}</span>
        </div>
        <div class="team-stat-box glass-card">
          <span class="ts-label">CLEAN SHEET</span>
          <span class="ts-value">${team.stats.cleanSheets} Maç</span>
        </div>
      `;
    }

    // Takım Kadrosu
    const squadList = document.getElementById('team-squad-list');
    if (squadList) {
      const teamPlayers = window.dataService.players.filter(p => p.teamId === team.id);
      squadList.innerHTML = teamPlayers.map(p => `
        <div class="squad-player-card glass-card" onclick="window.platformManager.showView('players', '${p.id}')">
          <span class="squad-p-avatar">${p.avatar}</span>
          <div class="squad-p-details">
            <b>${p.name} (#${p.num})</b>
            <span>${p.pos} • ${p.nation}</span>
          </div>
          <div class="squad-p-stats">
            <span>⚽ ${p.goals} Gol</span>
            <span>🎯 ${p.assists} Asist</span>
          </div>
        </div>
      `).join('');
    }
  }

  // 6. OYUNCU PROFİLİ RENDER
  renderPlayers() {
    const player = window.dataService.getPlayerById(this.activePlayerId);
    if (!player) return;

    document.getElementById('player-profile-name').innerText = player.name;
    document.getElementById('player-profile-avatar').innerText = player.avatar;
    document.getElementById('player-profile-meta').innerText = `${player.teamName} • #${player.num} • ${player.pos} • Yaş: ${player.age} • ${player.nation} • Piyasa Değeri: ${player.value}`;

    // Oyuncu İstatistik Kutucukları
    const pStats = document.getElementById('player-stats-grid');
    if (pStats) {
      pStats.innerHTML = `
        <div class="stat-card glass-card">
          <span class="sc-label">GOL</span>
          <span class="sc-value">${player.goals}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="sc-label">ASİST</span>
          <span class="sc-value">${player.assists}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="sc-label">MAÇ SAYISI</span>
          <span class="sc-value">${player.matches}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="sc-label">BEKLENEN GOL (xG)</span>
          <span class="sc-value">${player.xG}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="sc-label">ŞUT / MAÇ</span>
          <span class="sc-value">${player.shotsPerGame}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="sc-label">PAS İSABETİ</span>
          <span class="sc-value">%${player.passAcc}</span>
        </div>
      `;
    }

    // Oyuncu Yetenek Grafiği Barları (Radar Özeti)
    const radarContainer = document.getElementById('player-radar-bars');
    if (radarContainer && player.radar) {
      radarContainer.innerHTML = Object.entries(player.radar).map(([metric, val]) => `
        <div class="radar-metric-bar">
          <div class="rmb-header">
            <span class="metric-name">${metric.toUpperCase()}</span>
            <span class="metric-score">${val}</span>
          </div>
          <div class="rmb-track">
            <div class="rmb-fill" style="width: ${val}%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // 7. TRANSFER MERKEZİ RENDER
  renderTransfers() {
    const list = document.getElementById('transfers-timeline-list');
    if (list) {
      list.innerHTML = window.dataService.transfers.map(t => `
        <div class="transfer-timeline-item glass-card ${t.tier}">
          <div class="tti-header">
            <span class="tti-badge ${t.tier}">${t.type}</span>
            <span class="tti-date">⏱️ ${t.date}</span>
          </div>
          <div class="tti-main">
            <h3 class="tti-player">${t.player}</h3>
            <div class="tti-clubs">
              <span class="from-club">${t.fromClub}</span>
              <span class="arrow-icon">➡️</span>
              <span class="to-club">${t.toClub}</span>
            </div>
            <div class="tti-fee">Bonservis: <b>${t.fee}</b></div>
            <p class="tti-desc">${t.desc}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 8. FUTBOL HABERLERİ RENDER
  renderNews() {
    const container = document.getElementById('all-news-grid');
    if (container) {
      container.innerHTML = window.dataService.news.map(n => `
        <div class="full-news-card glass-card">
          <div class="fnc-img" style="background-image: url('${n.image}')">
            <span class="fnc-category">${n.category}</span>
          </div>
          <div class="fnc-content">
            <span class="fnc-badge">${n.badge} • ${n.time} • Kaynak: ${n.source}</span>
            <h2>${n.title}</h2>
            <p>${n.summary}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 9. OYUNCU KARŞILAŞTIRMA & İSTATİSTİK MERKEZİ
  renderStatsComparison() {
    const selectA = document.getElementById('compare-player-a-select');
    const selectB = document.getElementById('compare-player-b-select');

    if (selectA && selectB) {
      const optionsHtml = window.dataService.players.map(p => `
        <option value="${p.id}">${p.name} (${p.teamName})</option>
      `).join('');

      selectA.innerHTML = optionsHtml;
      selectB.innerHTML = optionsHtml;

      selectA.value = 'osimhen';
      selectB.value = 'dzeko';

      selectA.onchange = () => this.updateComparisonTable();
      selectB.onchange = () => this.updateComparisonTable();
    }

    this.updateComparisonTable();
  }

  updateComparisonTable() {
    const idA = document.getElementById('compare-player-a-select')?.value || 'osimhen';
    const idB = document.getElementById('compare-player-b-select')?.value || 'dzeko';

    const pA = window.dataService.getPlayerById(idA);
    const pB = window.dataService.getPlayerById(idB);

    const tableBody = document.getElementById('comparison-table-body');
    if (tableBody) {
      const metrics = [
        { label: 'Gol', valA: pA.goals, valB: pB.goals },
        { label: 'Asist', valA: pA.assists, valB: pB.assists },
        { label: 'Oynanan Maç', valA: pA.matches, valB: pB.matches },
        { label: 'Beklenen Gol (xG)', valA: pA.xG, valB: pB.xG },
        { label: 'Maç Başı Şut', valA: pA.shotsPerGame, valB: pB.shotsPerGame },
        { label: 'Pas İsabeti (%)', valA: pA.passAcc, valB: pB.passAcc },
        { label: 'Hız (Pace)', valA: pA.radar.pace, valB: pB.radar.pace },
        { label: 'Şut Gücü', valA: pA.radar.shooting, valB: pB.radar.shooting },
        { label: 'Fiziksel Güç', valA: pA.radar.physical, valB: pB.radar.physical }
      ];

      tableBody.innerHTML = metrics.map(m => {
        const higherA = Number(m.valA) > Number(m.valB);
        const higherB = Number(m.valB) > Number(m.valA);
        return `
          <tr class="comp-row">
            <td class="val-a ${higherA ? 'winner' : ''}">${m.valA}</td>
            <td class="metric-label"><b>${m.label}</b></td>
            <td class="val-b ${higherB ? 'winner' : ''}">${m.valB}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 10. GLOBAL ARAMA (CTRL+K)
  bindGlobalSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('search-results-box');

    // CTRL + K Kısayolu
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      if (e.key === 'Escape') {
        this.closeSearchModal();
      }
    });

    document.getElementById('btn-open-search')?.addEventListener('click', () => this.openSearchModal());
    document.getElementById('btn-close-search')?.addEventListener('click', () => this.closeSearchModal());

    input?.addEventListener('input', (e) => {
      const q = e.target.value;
      const res = window.dataService.search(q);

      if (!q.trim()) {
        resultsContainer.innerHTML = '<div class="search-empty">Aramak için kulüp, futbolcu veya lig adı yazın...</div>';
        return;
      }

      let html = '';

      if (res.teams.length > 0) {
        html += `<div class="search-section-title">🛡️ TAKIMLAR</div>`;
        html += res.teams.map(t => `
          <div class="search-item" onclick="window.platformManager.closeSearchModal(); window.platformManager.showView('teams', '${t.id}')">
            <span>${t.logo}</span> <b>${t.name}</b> <small>(${t.league})</small>
          </div>
        `).join('');
      }

      if (res.players.length > 0) {
        html += `<div class="search-section-title">👤 FUTBOLCULAR</div>`;
        html += res.players.map(p => `
          <div class="search-item" onclick="window.platformManager.closeSearchModal(); window.platformManager.showView('players', '${p.id}')">
            <span>${p.avatar}</span> <b>${p.name}</b> <small>(${p.teamName} • ${p.pos})</small>
          </div>
        `).join('');
      }

      if (res.matches.length > 0) {
        html += `<div class="search-section-title">⚡ MAÇLAR</div>`;
        html += res.matches.map(m => `
          <div class="search-item" onclick="window.platformManager.closeSearchModal(); window.platformManager.showView('match-center', '${m.id}')">
            <span>⚽</span> <b>${m.homeTeam.name} vs ${m.awayTeam.name}</b> <small>(${m.leagueName})</small>
          </div>
        `).join('');
      }

      resultsContainer.innerHTML = html || '<div class="search-empty">Eşleşen sonuç bulunamadı.</div>';
    });
  }

  openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
    }
  }

  closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) modal.style.display = 'none';
  }

  // 11. FUTBOL AI ASİSTANI
  bindAIAssistant() {
    const drawer = document.getElementById('ai-assistant-drawer');
    const input = document.getElementById('ai-chat-input');
    const chatBody = document.getElementById('ai-chat-messages');

    document.getElementById('btn-open-ai')?.addEventListener('click', () => {
      drawer.classList.toggle('open');
      if (drawer.classList.contains('open') && this.aiChatHistory.length === 0) {
        this.addAIMessage("Merhaba! Ben **FitBULLK Futbol Yapay Zeka Asistanıyım**. ⚽\nSüper Lig, Şampiyonlar Ligi, gol krallığı, form durumları veya transferler hakkında merak ettiğin her şeyi sorabilirsin!");
      }
    });

    document.getElementById('btn-close-ai')?.addEventListener('click', () => {
      drawer.classList.remove('open');
    });

    const sendMsg = () => {
      const text = input.value.trim();
      if (!text) return;

      this.addUserMessage(text);
      input.value = '';

      // AI Düşünme & Yanıtlama
      setTimeout(() => {
        const reply = window.dataService.askAI(text);
        this.addAIMessage(reply);
      }, 350);
    };

    document.getElementById('btn-send-ai-msg')?.addEventListener('click', sendMsg);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMsg();
    });
  }

  addUserMessage(text) {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return;
    const msg = document.createElement('div');
    msg.className = 'ai-msg user-msg';
    msg.innerText = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  addAIMessage(text) {
    const body = document.getElementById('ai-chat-messages');
    if (!body) return;
    const msg = document.createElement('div');
    msg.className = 'ai-msg bot-msg';
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    this.aiChatHistory.push(text);
  }

  // 12. BİLDİRİMLER
  bindNotifications() {
    document.getElementById('btn-open-notifications')?.addEventListener('click', () => {
      const panel = document.getElementById('notifications-dropdown');
      if (panel) panel.classList.toggle('open');
    });
  }

  // 13. ADMİN PANELİ
  bindAdminPanel() {
    // Maç Ekleme Formu
    document.getElementById('form-admin-add-match')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const home = document.getElementById('admin-home-name').value;
      const away = document.getElementById('admin-away-name').value;
      const league = document.getElementById('admin-league-name').value;
      const time = document.getElementById('admin-match-time').value || '20:00';

      const newM = {
        id: 'm_' + Date.now(),
        leagueId: 'super-lig',
        leagueName: league,
        status: 'UPCOMING',
        time: time,
        date: 'Bugün',
        homeTeam: { id: 'custom1', name: home, short: home.substring(0, 3).toUpperCase(), logo: '⚽', color: '#10b981' },
        awayTeam: { id: 'custom2', name: away, short: away.substring(0, 3).toUpperCase(), logo: '🛡️', color: '#00f2fe' },
        homeScore: null,
        awayScore: null,
        stadium: 'Stadyum',
        isLive: false
      };

      window.dataService.addMatch(newM);
      alert('Maç Başarıyla Eklendi!');
      this.renderHome();
    });

    // Haber Ekleme Formu
    document.getElementById('form-admin-add-news')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('admin-news-title').value;
      const category = document.getElementById('admin-news-cat').value;
      const summary = document.getElementById('admin-news-summary').value;

      const newNews = {
        id: 'n_' + Date.now(),
        category: category,
        badge: '⚡ FLAŞ HABER',
        title: title,
        summary: summary,
        source: 'FitBULLK Editor',
        time: 'Şimdi',
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'
      };

      window.dataService.addNews(newNews);
      alert('Haber Başarıyla Yayınlandı!');
      this.renderNews();
    });
  }

  renderAdminPanel() {
    document.getElementById('admin-current-role-badge').innerText = `Yetki: ${this.adminRole.toUpperCase()}`;
  }

  // CANLI MAÇLAR DİJİTAL TABLOSU
  renderLiveMatches() {
    const liveMatches = window.dataService.getLiveMatches();
    const container = document.getElementById('live-matches-full-grid');
    if (!container) return;

    if (liveMatches.length === 0) {
      container.innerHTML = '<div class="glass-card p-4 text-center">Şu an devam eden canlı maç bulunmuyor.</div>';
      return;
    }

    container.innerHTML = liveMatches.map(m => `
      <div class="live-match-card glass-card">
        <div class="match-card-top">
          <span class="match-league-badge">${m.leagueName}</span>
          <span class="live-pulse-indicator"><span class="pulse-dot"></span> CANLI ${m.minute}</span>
        </div>
        <div class="match-card-teams">
          <div class="team-col home">
            <span class="team-avatar">${m.homeTeam.logo}</span>
            <span class="team-name">${m.homeTeam.name}</span>
          </div>
          <div class="score-col">
            <span class="big-score">${m.homeScore} - ${m.awayScore}</span>
            <span class="match-stadium">${m.broadcaster || 'Canlı Yayın'}</span>
          </div>
          <div class="team-col away">
            <span class="team-avatar">${m.awayTeam.logo}</span>
            <span class="team-name">${m.awayTeam.name}</span>
          </div>
        </div>
        <div class="match-card-bottom" style="display:flex; justify-content:space-between; align-items:center;">
          <span>🏟️ ${m.stadium}</span>
          <div style="display:flex; gap:8px;">
            <button class="btn-micro-details" onclick="window.platformManager.showView('match-center', '${m.id}')">Detay ➡️</button>
            <button class="btn-primary-action" style="padding: 6px 14px; font-size: 0.85rem;" onclick="window.platformManager.playMatchById('${m.id}')">🎮 OYNA</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // PROFİL SAYFASI
  renderProfile() {
    const favTeamEl = document.getElementById('profile-fav-team');
    if (favTeamEl) {
      const favTeam = window.dataService.getTeamById('galatasaray');
      favTeamEl.innerText = `${favTeam ? favTeam.name : 'Galatasaray'} ${favTeam ? favTeam.logo : '🦁'}`;
    }
  }

  // OYUN MODLARI SEÇİCİ MODALI
  showGameModeSelector() {
    const modal = document.getElementById('game-modes-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      modal.classList.add('active');

      // Kariyer paneli render et
      if (window.careerManager) {
        window.careerManager.renderCareerHub();
      }

      modal.querySelectorAll('.gmode-tab').forEach(tab => {
        tab.onclick = (e) => {
          modal.querySelectorAll('.gmode-tab').forEach(t => t.classList.remove('active'));
          modal.querySelectorAll('.gmode-pane').forEach(p => p.classList.remove('active'));
          e.currentTarget.classList.add('active');
          const targetPane = document.getElementById(`gmode-pane-${e.currentTarget.dataset.gmode}`);
          if (targetPane) {
            targetPane.classList.add('active');
            if (e.currentTarget.dataset.gmode === 'career' && window.careerManager) {
              window.careerManager.renderCareerHub();
            }
          }
        };
      });
    }
  }

  // Hızlı Maç Panelinde Lig Değişimi Dinleyicisi
  onQuickMatchLeagueChange(leagueId) {
    const homeSelect = document.getElementById('select-home-team');
    const awaySelect = document.getElementById('select-away-team');
    if (!homeSelect || !awaySelect || !window.dataService) return;

    const teams = window.dataService.getTeamsByLeague(leagueId);
    if (!teams || teams.length === 0) return;

    const optionsHtml = teams.map(t => `<option value="${t.id}">${t.name} (${t.logo || '⚽'})</option>`).join('');

    homeSelect.innerHTML = optionsHtml;
    awaySelect.innerHTML = optionsHtml;

    if (teams.length >= 2) {
      homeSelect.value = teams[0].id;
      awaySelect.value = teams[1].id;
    }
  }

  closeGameModeSelector(skipLaunch = false) {
    const modal = document.getElementById('game-modes-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.add('hidden');
      modal.classList.remove('active');
    }
    if (!skipLaunch && !window.matchEngine?.isActive) {
      this.launchCustomQuickMatch();
    }
  }

  // 1. MAÇ MERKEZİNDEN AKTİF MAÇI OYNA
  playActiveMatch() {
    this.playMatchById(this.activeMatchId);
  }

  playMatchById(matchId) {
    const match = window.dataService.getMatchById(matchId);
    if (!match) return;

    const homeColor = match.homeTeam.name.includes('Galatasaray') ? 0xb81414 : 
                      match.homeTeam.name.includes('Fenerbahçe') ? 0x0c2461 : 
                      match.homeTeam.name.includes('Beşiktaş') ? 0x111111 : 0x27ae60;
    const awayColor = match.awayTeam.name.includes('Fenerbahçe') ? 0x0c2461 : 
                      match.awayTeam.name.includes('Galatasaray') ? 0xb81414 : 
                      match.awayTeam.name.includes('Beşiktaş') ? 0x111111 : 0xffffff;

    const homeData = {
      name: match.homeTeam.name,
      short: match.homeTeam.name.substring(0, 3).toUpperCase(),
      logo: match.homeTeam.logo,
      color: homeColor
    };
    const awayData = {
      name: match.awayTeam.name,
      short: match.awayTeam.name.substring(0, 3).toUpperCase(),
      logo: match.awayTeam.logo,
      color: awayColor
    };

    this.showView('game');
    this.closeGameModeSelector();
    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'quick', { duration: 180, difficulty: 'normal' });
    }
  }

  // 2. TAKIMLA OYNA
  playWithTeam(teamId) {
    const team = window.dataService.getTeamById(teamId);
    if (!team) return;

    const otherTeam = window.dataService.teams.find(t => t.id !== team.id) || { name: 'Fenerbahçe', logo: '🐦', colors: ['#0c2461'] };

    const homeData = {
      name: team.name,
      short: team.name.substring(0, 3).toUpperCase(),
      logo: team.logo,
      color: parseInt(team.colors[0].replace('#', '0x')) || 0xb81414
    };
    const awayData = {
      name: otherTeam.name,
      short: otherTeam.name.substring(0, 3).toUpperCase(),
      logo: otherTeam.logo,
      color: parseInt(otherTeam.colors[0].replace('#', '0x')) || 0x0c2461
    };

    this.showView('game');
    this.closeGameModeSelector();
    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'quick', { duration: 180, difficulty: 'normal' });
    }
  }

  // 3. OYUNCUYLA OYNA (Tek Oyuncu / Kariyer Odaklı)
  playWithPlayer(playerId) {
    const player = window.dataService.getPlayerById(playerId);
    if (!player) return;

    const team = window.dataService.getTeamById(player.teamId) || { name: player.teamName, logo: '⚽', colors: ['#b81414'] };
    const otherTeam = window.dataService.teams.find(t => t.id !== player.teamId) || { name: 'Fenerbahçe', logo: '🐦', colors: ['#0c2461'] };

    const homeData = {
      name: team.name,
      short: team.name.substring(0, 3).toUpperCase(),
      logo: team.logo,
      color: parseInt(team.colors[0].replace('#', '0x')) || 0xb81414
    };
    const awayData = {
      name: otherTeam.name,
      short: otherTeam.name.substring(0, 3).toUpperCase(),
      logo: otherTeam.logo,
      color: parseInt(otherTeam.colors[0].replace('#', '0x')) || 0x0c2461
    };

    this.showView('game');
    this.closeGameModeSelector();
    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'quick', { duration: 180, difficulty: 'normal' });
      if (window.matchEngine.homePlayers && window.matchEngine.homePlayers[window.matchEngine.activePlayerIndex]) {
        window.matchEngine.homePlayers[window.matchEngine.activePlayerIndex].name = player.name;
        window.matchEngine.homePlayers[window.matchEngine.activePlayerIndex].num = player.num;
      }
    }
  }

  // Hızlı Derbi Maçı Başlat (Galatasaray vs Fenerbahçe)
  launchQuickDerbyMatch() {
    const homeTeam = window.dataService.getTeamById('galatasaray') || { name: 'Galatasaray', logo: '🦁', colors: ['#b81414'] };
    const awayTeam = window.dataService.getTeamById('fenerbahce') || { name: 'Fenerbahçe', logo: '🐦', colors: ['#0c2461'] };

    const homeData = {
      name: homeTeam.name,
      short: 'GS',
      logo: homeTeam.logo,
      color: 0xb81414
    };
    const awayData = {
      name: awayTeam.name,
      short: 'FB',
      logo: awayTeam.logo,
      color: 0x0c2461
    };

    if (window.gameInstance && window.gameInstance.stadium && window.gameInstance.stadium.setWeather) {
      window.gameInstance.stadium.setWeather('night');
    }

    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'quick', { duration: 180, difficulty: 'normal' });
    }
  }

  // 4. KULLANICI ÖZEL HIZLI MAÇ BAŞLATMA
  launchCustomQuickMatch() {
    const homeSelect = document.getElementById('select-home-team');
    const awaySelect = document.getElementById('select-away-team');
    const durationSelect = document.getElementById('select-match-duration');
    const diffSelect = document.getElementById('select-match-difficulty');
    const weatherSelect = document.getElementById('select-match-weather');

    const homeId = homeSelect ? homeSelect.value : 'galatasaray';
    const awayId = awaySelect ? awaySelect.value : 'fenerbahce';
    const duration = durationSelect ? parseInt(durationSelect.value) : 180;
    const difficulty = diffSelect ? diffSelect.value : 'normal';
    const weather = weatherSelect ? weatherSelect.value : 'night';

    const homeTeam = window.dataService.getTeamById(homeId) || { name: 'Galatasaray', logo: '🦁', colors: ['#b81414'] };
    const awayTeam = window.dataService.getTeamById(awayId) || { name: 'Fenerbahçe', logo: '🐦', colors: ['#0c2461'] };

    const homeData = {
      name: homeTeam.name,
      short: homeTeam.name.substring(0, 3).toUpperCase(),
      logo: homeTeam.logo,
      color: parseInt(homeTeam.colors[0].replace('#', '0x')) || 0xb81414
    };
    const awayData = {
      name: awayTeam.name,
      short: awayTeam.name.substring(0, 3).toUpperCase(),
      logo: awayTeam.logo,
      color: parseInt(awayTeam.colors[0].replace('#', '0x')) || 0x0c2461
    };

    this.showView('game', 'no-auto');
    this.closeGameModeSelector(true);

    // Hava durumunu stadyuma uygula
    if (window.gameInstance && window.gameInstance.stadium && window.gameInstance.stadium.setWeather) {
      window.gameInstance.stadium.setWeather(weather);
    }

    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'quick', { duration, difficulty, weather });
    }
  }

  // 5. TURNUVA MODU MAÇI
  launchTournamentMatch() {
    const homeData = {
      name: 'Galatasaray SK',
      short: 'GS',
      logo: '🦁',
      color: 0xb81414
    };
    const awayData = {
      name: 'Fenerbahçe SK',
      short: 'FB',
      logo: '🐦',
      color: 0x0c2461
    };

    this.showView('game');
    this.closeGameModeSelector();

    if (window.matchEngine) {
      window.matchEngine.launchMatch(homeData, awayData, 'tournament', { duration: 180, difficulty: 'hard' });
      window.matchEngine.showMatchBanner("🏆 ÇEYREK FİNAL: GALATASARAY vs FENERBAHÇE");
    }
  }

  // 6. KARİYER MODU AKIŞI
  launchCareerFlow(isNew = false) {
    this.showGameModeSelector();
    const modal = document.getElementById('game-modes-modal');
    if (modal) {
      modal.querySelectorAll('.gmode-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.gmode-pane').forEach(p => p.classList.remove('active'));
      const careerTab = modal.querySelector('[data-gmode="career"]');
      const careerPane = document.getElementById('gmode-pane-career');
      if (careerTab) careerTab.classList.add('active');
      if (careerPane) careerPane.classList.add('active');
      if (window.careerManager) {
        if (isNew) {
          window.careerManager.promptChangeTeamModal();
        } else {
          window.careerManager.renderCareerHub();
        }
      }
    }
  }

  // 7. ANTRENMAN VE FRİKİK DRİLLLERİ
  launchTrainingDrill(drillType = 'freekick') {
    this.closeGameModeSelector();
    this.showView('game');
    if (window.matchEngine) {
      window.matchEngine.isActive = false;
    }
    if (window.gameInstance) {
      const g = window.gameInstance;
      if (drillType === 'freekick') {
        g.isDeadBallSetPiece = true;
        g.setupScenario({
          type: 'freekick',
          distance: 25,
          wall: 4,
          title: '25 Metre Serbest Vuruş (Frikik)',
          desc: 'Barajın üzerinden 90\'a falsolu şut çek! Falso için [Q] veya [E] tuşlarını kullan.'
        });
      } else if (drillType === 'penalty') {
        g.isDeadBallSetPiece = true;
        g.setupScenario({
          type: 'penalty',
          distance: 11,
          wall: 0,
          title: 'Penaltı Noktası (11 Metre)',
          desc: 'Köşelere sert ve net vuruş yap!'
        });
      } else {
        g.isDeadBallSetPiece = false;
        g.setupScenario({
          type: 'open_play',
          distance: 28,
          defenders: 2,
          title: 'Uzaktan Sert Şut Antrenmanı',
          desc: 'Ceza sahası dışından kaleciyi avla!'
        });
      }
    }
  }
}

// Global başlatıcı
document.addEventListener('DOMContentLoaded', () => {
  window.platformManager = new PlatformManager();
});
