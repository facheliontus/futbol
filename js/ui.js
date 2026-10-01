// ==========================================================
// ARAYÜZ VE KARİYER EKRANLARI YÖNETİCİSİ (ui.js)
// ==========================================================

class UIManager {
  constructor() {
    this.game = null;
    this.career = window.careerManager;

    this.setupModal = document.getElementById('setup-modal');
    this.matchSummaryModal = document.getElementById('match-summary-modal');
    this.transferModal = document.getElementById('transfer-modal');
    this.signingModal = document.getElementById('signing-modal');

    this.initEvents();
  }

  setGame(gameInstance) {
    this.game = gameInstance;
    this.checkInitialState();
  }

  checkInitialState() {
    if (this.career.hasSavedProfile() && this.career.player) {
      // Zaten kayıtlı kariyer var, direkt maça başla
      this.setupModal.classList.add('hidden');
      this.updatePlayerHUD();
      this.startNextMatch();
    } else {
      // Yeni kariyer başlatma ekranı
      this.setupModal.classList.remove('hidden');
    }
  }

  initEvents() {
    // 1. Mevki Seçim Kartları
    const posCards = document.querySelectorAll('.pos-card');
    posCards.forEach(card => {
      card.addEventListener('click', () => {
        posCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // 2. Kariyere Başla Butonu
    const btnStart = document.getElementById('btn-start-career');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const name = document.getElementById('input-player-name').value || 'Yıldız Oyuncu';
        const selectedCard = document.querySelector('.pos-card.selected');
        const pos = selectedCard ? selectedCard.dataset.pos : 'ST';
        const num = parseInt(document.getElementById('input-jersey-num').value) || 10;
        const clubId = document.getElementById('select-starting-club').value || 'anadolu';

        this.career.createProfile(name, pos, num, clubId);
        this.setupModal.classList.add('hidden');

        if (window.gameSound) window.gameSound.playWhistle(true);
        this.updatePlayerHUD();
        this.startNextMatch();
      });
    }

    // 3. Maç Sonu: Sonraki Maç / Sezon Sonu Butonu
    const btnNextMatch = document.getElementById('btn-next-match');
    if (btnNextMatch) {
      btnNextMatch.addEventListener('click', () => {
        this.matchSummaryModal.classList.add('hidden');
        if (this.isPendingSeasonEnd) {
          this.isPendingSeasonEnd = false;
          this.game.onSeasonFinished();
        } else {
          this.startNextMatch();
        }
      });
    }

    // 4. Ses Aç / Kapa Butonu
    const btnMute = document.getElementById('btn-sound-toggle');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = window.gameSound.toggleMute();
        btnMute.innerText = isMuted ? '🔇' : '🔊';
      });
    }

    // 5. Yeni Kariyer Butonu
    const btnNewCareer = document.getElementById('btn-new-career');
    if (btnNewCareer) {
      btnNewCareer.addEventListener('click', () => {
        this.setupModal.classList.remove('hidden');
      });
    }

    // 6. Online Modal Aç / Kapat
    const btnOpenOnline = document.getElementById('btn-open-online');
    const onlineModal = document.getElementById('online-modal');
    const btnCloseOnline = document.getElementById('btn-close-online-modal');

    if (btnOpenOnline && onlineModal) {
      btnOpenOnline.addEventListener('click', () => {
        onlineModal.classList.remove('hidden');
      });
    }

    if (btnCloseOnline && onlineModal) {
      btnCloseOnline.addEventListener('click', () => {
        onlineModal.classList.add('hidden');
      });
    }

    // 7. Online Sekme Geçişleri
    const tabCreate = document.getElementById('tab-btn-create');
    const tabJoin = document.getElementById('tab-btn-join');
    const contentCreate = document.getElementById('tab-content-create');
    const contentJoin = document.getElementById('tab-content-join');

    if (tabCreate && tabJoin) {
      tabCreate.addEventListener('click', () => {
        tabCreate.classList.add('active');
        tabJoin.classList.remove('active');
        contentCreate.classList.add('active');
        contentJoin.classList.remove('active');
      });

      tabJoin.addEventListener('click', () => {
        tabJoin.classList.add('active');
        tabCreate.classList.remove('active');
        contentJoin.classList.add('active');
        contentCreate.classList.remove('active');
      });
    }

    // 7.5 Online Oyun Modu Seçimi (1v1 vs 2 Kişilik Eşli Hücum)
    const modeCards = document.querySelectorAll('.online-mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const mode = card.getAttribute('data-mode');
        if (window.onlineManager) {
          window.onlineManager.gameMode = mode;
        }
      });
    });

    // 7.6 Online Oyun Sırasında Canlı Mod Değiştirme Butonu (Üst HUD Bar)
    const btnOnlineModeToggle = document.getElementById('btn-online-mode-toggle');
    if (btnOnlineModeToggle) {
      btnOnlineModeToggle.addEventListener('click', () => {
        if (window.onlineManager) {
          window.onlineManager.toggleGameMode();
        }
      });
    }

    // 7.7 Host Bekleme Ekranında Mod Değiştirme Butonu
    const btnHostToggleMode = document.getElementById('btn-host-toggle-mode');
    if (btnHostToggleMode) {
      btnHostToggleMode.addEventListener('click', () => {
        if (window.onlineManager) {
          window.onlineManager.toggleHostLobbyMode();
        }
      });
    }

    // 8. Online Oda Kur Butonu
    const btnCreateRoom = document.getElementById('btn-create-room-action');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const pName = document.getElementById('input-online-player-name').value || 'Ev Sahibi';
        if (window.onlineManager) {
          window.onlineManager.createRoom(pName);
        }
      });
    }

    // 9. Online Odaya Katıl Butonu
    const btnJoinRoom = document.getElementById('btn-join-room-action');
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const pName = document.getElementById('input-online-player-name').value || 'Misafir';
        const code = document.getElementById('input-join-room-code').value || '';
        if (window.onlineManager) {
          window.onlineManager.joinRoom(code, pName);
        }
      });
    }
  }

  // OYUNCU BİLGİ KARTINI GÜNCELLE
  updatePlayerHUD() {
    const p = this.career.player;
    if (!p) return;
    const club = this.career.getCurrentClub();

    document.getElementById('hud-player-name').innerText = p.name;
    document.getElementById('hud-player-pos').innerText = p.position === 'GK' ? '🧤 KALECİ (GK)' : (p.position === 'CAM' ? '🎯 10 NUMARA (CAM)' : '⚡ FORVET (ST)');
    document.getElementById('hud-jersey-badge').innerText = '#' + p.jerseyNumber;
    document.getElementById('hud-club-name').innerText = club.badge + ' ' + club.name;
    document.getElementById('hud-player-ovr').innerText = p.overall;
    document.getElementById('hud-season-badge').innerText = `SEZON ${this.career.season} - MAÇ ${this.career.currentMatchIndex + 1}/${this.career.matchesPerSeason}`;

    // Kaleci / Forvet ipuçlarını mevkine göre özelleştir
    const hintEl = document.getElementById('hud-control-hint');
    if (hintEl) {
      if (p.position === 'GK') {
        hintEl.innerHTML = `🧤 <b>KALECİ MODU:</b> Fareyi sağa/sola oynatarak açıyı kapat | Tıkla veya [Space / A - D] ile uçarak kurtar!`;
      } else {
        hintEl.innerHTML = `⚽ <b>ŞUT & FALSO:</b> Fareyle basılı tutup yukarı/geriye çek ve kavisle bırak! 90'a aşır! | [R] Tekrar Vur`;
      }
    }
  }

  // SONRAKİ MAÇI YÜKLE VE BAŞLAT
  startNextMatch() {
    const match = this.career.generateNextMatch();
    this.updatePlayerHUD();

    // Üst Skorboard Bilgileri
    document.getElementById('hud-team-home').innerText = match.homeTeam;
    document.getElementById('hud-team-away').innerText = match.awayTeam;
    document.getElementById('hud-score-display').innerText = '0 - 0';

    if (window.gameSound) window.gameSound.playWhistle(false);

    // İlk Senaryoyu Başlat
    const firstScenario = match.scenarios[0];
    this.game.setupScenario(firstScenario);
  }

  // MAÇ SONU RAPORUNU GÖSTER
  showMatchSummaryModal(summary, isSeasonEnd) {
    this.isPendingSeasonEnd = isSeasonEnd;

    document.getElementById('sum-home-team').innerText = summary.homeTeam;
    document.getElementById('sum-away-team').innerText = summary.awayTeam;
    document.getElementById('sum-score').innerText = `${summary.homeScore} - ${summary.awayScore}`;
    document.getElementById('sum-rating').innerText = summary.rating.toFixed(1);
    
    const p = this.career.player;
    if (p.position === 'GK') {
      document.getElementById('sum-stat-title').innerText = 'Kurtarışlar:';
      document.getElementById('sum-stat-val').innerText = summary.saves;
    } else {
      document.getElementById('sum-stat-title').innerText = 'Attığın Goller:';
      document.getElementById('sum-stat-val').innerText = summary.goals;
    }

    const motmBadge = document.getElementById('sum-motm-badge');
    motmBadge.style.display = summary.motm ? 'inline-block' : 'none';

    const btnNext = document.getElementById('btn-next-match');
    btnNext.innerText = isSeasonEnd ? '🏆 SEZONU TAMAMLA & TRANSFER TEKLİFLERİNE GEÇ' : 'SONRAKİ MAÇA GEÇ ➔';

    this.matchSummaryModal.classList.remove('hidden');
  }

  // TRANSFER PAZARI VE KULÜP TEKLİFLERİNİ GÖSTER
  showTransferMarketModal(transferData) {
    const { avgRating, stats, offers } = transferData;
    const p = this.career.player;

    document.getElementById('tr-season-goals').innerText = p.position === 'GK' ? `${stats.saves} Kurtarış` : `${stats.goals} Gol`;
    document.getElementById('tr-season-rating').innerText = avgRating;
    document.getElementById('tr-market-value').innerText = '€' + (p.marketValue / 1000000).toFixed(1) + 'M';

    const container = document.getElementById('transfer-cards-list');
    container.innerHTML = '';

    offers.forEach(offer => {
      const card = document.createElement('div');
      card.className = 'transfer-offer-card';
      if (offer.club.tier === 3) card.classList.add('elite-tier');

      card.innerHTML = `
        <div class="tr-card-header">
          <span class="tr-badge">${offer.club.badge}</span>
          <div class="tr-club-info">
            <h3 class="tr-club-name">${offer.club.name}</h3>
            <span class="tr-league">${offer.status}</span>
          </div>
          <div class="tr-tier-badge">${offer.club.tier === 3 ? '⭐ DÜNYA DEVİ' : (offer.club.tier === 2 ? '🔥 SÜPER LİG' : '🟢 1. LİG')}</div>
        </div>

        <div class="tr-card-body">
          <h4 class="tr-headline">"${offer.headline}"</h4>
          <p class="tr-desc">${offer.desc}</p>
          <div class="tr-perks">
            <div class="tr-perk-item">
              <span class="tr-perk-label">Haftalık Maaş:</span>
              <span class="tr-perk-value">€${offer.weeklyWage.toLocaleString()}</span>
            </div>
            <div class="tr-perk-item">
              <span class="tr-perk-label">Kulüp Vaadi:</span>
              <span class="tr-perk-value">${offer.promise}</span>
            </div>
          </div>
        </div>

        <button class="btn-sign-contract" data-club="${offer.club.id}" data-wage="${offer.weeklyWage}">
          ✍️ TEKLİFİ KABUL ET & İMZALA
        </button>
      `;

      const btnSign = card.querySelector('.btn-sign-contract');
      btnSign.addEventListener('click', () => {
        this.executeTransferSigning(offer);
      });

      container.appendChild(card);
    });

    this.transferModal.classList.remove('hidden');
  }

  // TRANSFER İMZA TÖRENİ
  executeTransferSigning(offer) {
    this.transferModal.classList.add('hidden');

    const p = this.career.player;
    this.career.acceptTransfer(offer.club.id, offer.weeklyWage);

    // İmza Töreni Ekranı
    const signModal = this.signingModal;
    document.getElementById('sign-title').innerText = `${offer.club.badge} ${offer.club.name} RESMİ SÖZLEŞMEYİ İMZALADI!`;
    document.getElementById('sign-player-name').innerText = p.name;
    document.getElementById('sign-jersey-num').innerText = '#' + p.jerseyNumber;
    document.getElementById('sign-wage-text').innerText = `Haftalık €${offer.weeklyWage.toLocaleString()} ile anlaşıldı!`;

    signModal.classList.remove('hidden');

    if (window.gameSound) {
      window.gameSound.playGoalCheer();
      window.gameSound.playWhistle(true);
    }

    const btnNewSeason = document.getElementById('btn-start-new-season');
    btnNewSeason.onclick = () => {
      signModal.classList.add('hidden');
      this.updatePlayerHUD();
      this.startNextMatch();
    };

    this.launchConfetti();
  }

  // KONFETİ PATLAMASI KUTLAMASI
  launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const particles = [];
    const colors = ['#f1c40f', '#e74c3c', '#00f2fe', '#00ff88', '#9b59b6', '#ffffff'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 7 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }

    let frame = 0;
    const anim = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Yerçekimi
        p.rotation += p.vRot;
        if (frame > 40) p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive && frame < 180) {
        requestAnimationFrame(anim);
      } else {
        canvas.remove();
      }
    };
    requestAnimationFrame(anim);
  }
}

window.uiManager = new UIManager();
