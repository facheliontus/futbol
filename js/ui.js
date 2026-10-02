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
    this.transferHubModal = document.getElementById('transfer-hub-modal');
    this.signingModal = document.getElementById('signing-modal');
    this.storeModal = document.getElementById('store-modal');
    this.leaderboardModal = document.getElementById('leaderboard-modal');
    this.tournamentModal = document.getElementById('tournament-modal');
    this.currentStoreCategory = 'balls';
    this.currentLeaderboardFilter = 'money';
    this.currentTransferTier = 'all';
    this.currentTournamentType = 'world_cup';

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
        const footSelect = document.getElementById('select-preferred-foot');
        const preferredFoot = footSelect ? footSelect.value : 'R';
        const num = parseInt(document.getElementById('input-jersey-num').value) || 10;
        const clubId = document.getElementById('select-starting-club').value || 'anadolu';

        this.career.createProfile(name, pos, num, clubId, preferredFoot);
        if (this.game) {
          this.game.currentFoot = preferredFoot;
        }
        this.setupModal.classList.add('hidden');

        if (window.gameSound) window.gameSound.playWhistle(true);
        this.updatePlayerHUD();
        this.startNextMatch();
      });
    }

    const btnCloseSetup = document.getElementById('btn-close-setup');
    if (btnCloseSetup && this.setupModal) {
      btnCloseSetup.addEventListener('click', () => {
        this.setupModal.classList.add('hidden');
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
        const pNameInput = document.getElementById('input-online-player-name');
        if (pNameInput && !pNameInput.value.trim() && this.career && this.career.player) {
          pNameInput.value = this.career.player.name || '';
        }
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

    // 9. Online Odaya Katıl Butonu & Enter Tuşu Desteği
    const inputJoinCode = document.getElementById('input-join-room-code');
    const btnJoinRoom = document.getElementById('btn-join-room-action');

    if (inputJoinCode) {
      inputJoinCode.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      });
      inputJoinCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (btnJoinRoom) btnJoinRoom.click();
        }
      });
    }

    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const pName = document.getElementById('input-online-player-name').value || 'Misafir';
        const code = (inputJoinCode ? inputJoinCode.value : '').trim().toUpperCase();
        if (window.onlineManager) {
          window.onlineManager.joinRoom(code, pName);
        }
      });
    }

    // 10. Kariyer Mağazası Aç / Kapat
    const btnOpenStore = document.getElementById('btn-open-store');
    const btnCloseStore = document.getElementById('btn-close-store');
    if (btnOpenStore && this.storeModal) {
      btnOpenStore.addEventListener('click', () => {
        this.renderStore(this.currentStoreCategory);
        this.storeModal.classList.remove('hidden');
      });
    }
    if (btnCloseStore && this.storeModal) {
      btnCloseStore.addEventListener('click', () => {
        this.storeModal.classList.add('hidden');
      });
    }

    // 11. Mağaza Kategori Sekmeleri
    const storeTabs = document.querySelectorAll('.store-tab-btn');
    storeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        storeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentStoreCategory = tab.dataset.category;
        this.renderStore(this.currentStoreCategory);
      });
    });

    // 12. Dünya Liderlik Tablosu Aç / Kapat (Mouse, Dokunmatik & [L] Tuşu)
    const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');

    const openLeaderboardModal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!this.leaderboardModal) return;
      this.leaderboardModal.classList.remove('hidden');
      this.renderLeaderboard(this.currentLeaderboardFilter);
    };

    const closeLeaderboardModal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!this.leaderboardModal) return;
      this.leaderboardModal.classList.add('hidden');
    };

    const toggleLeaderboardModal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!this.leaderboardModal) return;
      if (this.leaderboardModal.classList.contains('hidden')) {
        openLeaderboardModal(e);
      } else {
        closeLeaderboardModal(e);
      }
    };

    if (btnOpenLeaderboard && this.leaderboardModal) {
      btnOpenLeaderboard.addEventListener('click', (e) => {
        openLeaderboardModal(e);
      });
    }

    if (btnCloseLeaderboard && this.leaderboardModal) {
      btnCloseLeaderboard.addEventListener('click', (e) => {
        e.stopPropagation();
        this.leaderboardModal.classList.add('hidden');
      });
    }

    const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
    if (btnRefreshLeaderboard) {
      btnRefreshLeaderboard.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderLeaderboard(this.currentLeaderboardFilter);
      });
    }

    // 13. Liderlik Tablosu Filtre Sekmeleri (Para, OVR, Hepsi)
    const lbTabs = document.querySelectorAll('.lb-tab-btn');
    lbTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        lbTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentLeaderboardFilter = tab.dataset.filter;
        this.renderLeaderboard(this.currentLeaderboardFilter);
      });
    });

    // 14. Transfer Masası / İstenen Kulüple Görüşme Aç / Kapat
    const btnOpenTransfers = document.getElementById('btn-open-transfers');
    const btnCloseTransferHub = document.getElementById('btn-close-transfer-hub');
    if (btnOpenTransfers && this.transferHubModal) {
      btnOpenTransfers.addEventListener('click', () => {
        this.renderTransferHub(this.currentTransferTier);
        this.transferHubModal.classList.remove('hidden');
      });
    }
    if (btnCloseTransferHub && this.transferHubModal) {
      btnCloseTransferHub.addEventListener('click', () => {
        this.transferHubModal.classList.add('hidden');
      });
    }

    // Global Klavye Kısayolları (Tüm PC, Mac ve Tarayıcılarda Garantili Erişim)
    window.addEventListener('keydown', (e) => {
      // Eğer bir input veya select alanında yazı yazılıyorsa kısayolları engelle
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // [L] -> Liderlik Tablosu
      if (e.code === 'KeyL' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleLeaderboardModal();
      }
      // [M] -> Mağaza
      else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (this.storeModal) {
          if (this.storeModal.classList.contains('hidden')) {
            this.renderStore(this.currentStoreCategory);
            this.storeModal.classList.remove('hidden');
          } else {
            this.storeModal.classList.add('hidden');
          }
        }
      }
      // [H] -> Transfer Masası
      else if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (this.transferHubModal) {
          if (this.transferHubModal.classList.contains('hidden')) {
            this.renderTransferHub(this.currentTransferTier);
            this.transferHubModal.classList.remove('hidden');
          } else {
            this.transferHubModal.classList.add('hidden');
          }
        }
      }
      // [K] -> Turnuva & Kupa Ekranı
      else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (this.tournamentModal) {
          if (this.tournamentModal.classList.contains('hidden')) {
            this.renderTournament(this.currentTournamentType);
            this.tournamentModal.classList.remove('hidden');
          } else {
            this.tournamentModal.classList.add('hidden');
          }
        }
      }
      // [Escape] -> Açık olan tüm modalları kapat
      else if (e.code === 'Escape' || e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });

    // Transfer Masası Lig Filtre Sekmeleri
    const thTabs = document.querySelectorAll('.th-tab-btn');
    thTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        thTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTransferTier = tab.dataset.tier;
        this.renderTransferHub(this.currentTransferTier);
      });
    });

    // Turnuva Modal Aç / Kapat & Sekmeler
    const btnOpenTourn = document.getElementById('btn-open-tournament');
    const btnCloseTourn = document.getElementById('btn-close-tournament');

    if (btnOpenTourn && this.tournamentModal) {
      btnOpenTourn.addEventListener('click', () => {
        this.renderTournament(this.currentTournamentType);
        this.tournamentModal.classList.remove('hidden');
      });
    }

    if (btnCloseTourn && this.tournamentModal) {
      btnCloseTourn.addEventListener('click', () => {
        this.tournamentModal.classList.add('hidden');
      });
    }

    const tournTabs = document.querySelectorAll('.tourn-tab-btn');
    tournTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tournTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTournamentType = tab.dataset.tourn;
        this.renderTournament(this.currentTournamentType);
      });
    });
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

    // Cüzdan Bakiyesi
    const walletEl = document.getElementById('hud-wallet-balance');
    if (walletEl) {
      walletEl.innerText = '€' + (p.money || 0).toLocaleString('tr-TR');
    }

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

    // Detaylı Kazanç ve Maaş Gösterimi
    if (summary.earnings) {
      const e = summary.earnings;
      const elWage = document.getElementById('sum-earn-wage');
      if (elWage) {
        if (e.isPayday) {
          elWage.innerHTML = `€${(e.baseWage || 0).toLocaleString('tr-TR')} <span style="font-size:0.75rem; color:#00ff88; font-weight:700;">(Haftalık Bordro 💰)</span>`;
        } else {
          elWage.innerHTML = `€0 <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">(Hafta İçi - Maaş Gününe 1 Maç Kaldı 📅)</span>`;
        }
      }
      const elPerf = document.getElementById('sum-earn-perf');
      if (elPerf) elPerf.innerText = '+€' + ((e.goalBonus || 0) + (e.saveBonus || 0)).toLocaleString('tr-TR');
      const elWin = document.getElementById('sum-earn-win');
      if (elWin) elWin.innerText = '+€' + ((e.winBonus || 0) + (e.cleanSheetBonus || 0) + (e.motmBonus || 0)).toLocaleString('tr-TR');
      const elTotal = document.getElementById('sum-earn-total');
      if (elTotal) elTotal.innerText = '+€' + (e.totalEarned || 0).toLocaleString('tr-TR');
      const elWallet = document.getElementById('sum-current-wallet');
      if (elWallet) elWallet.innerText = '€' + (e.currentWallet || 0).toLocaleString('tr-TR');
    }

    this.updatePlayerHUD();

    const btnNext = document.getElementById('btn-next-match');
    if (summary.isTournament) {
      btnNext.innerText = '🏆 TURNUVA EKRANINA DÖN ➔';
      btnNext.onclick = () => {
        this.matchSummaryModal.classList.add('hidden');
        if (this.tournamentModal) {
          this.tournamentModal.classList.remove('hidden');
          this.renderTournament(this.currentTournamentType);
        }
      };
      if (summary.tournResult && summary.tournResult.msg) {
        setTimeout(() => alert(summary.tournResult.msg), 400);
      }
    } else {
      btnNext.innerText = isSeasonEnd ? '🏆 SEZONU TAMAMLA & TRANSFER TEKLİFLERİNE GEÇ' : 'SONRAKİ MAÇA GEÇ ➔';
      btnNext.onclick = () => {
        this.matchSummaryModal.classList.add('hidden');
        if (this.isPendingSeasonEnd) {
          this.isPendingSeasonEnd = false;
          this.game.onSeasonFinished();
        } else {
          this.startNextMatch();
        }
      };
    }

    this.matchSummaryModal.classList.remove('hidden');
  }

  // MAĞAZA ÜRÜNLERİNİ LİSTELE & SATIN ALMA / KUŞANMA YÖNETİMİ
  renderStore(category = 'balls') {
    const p = this.career.player;
    if (!p) return;

    // Güncel bakiye göstergeleri
    const formattedWallet = '€' + (p.money || 0).toLocaleString('tr-TR');
    const storeWalletEl = document.getElementById('store-wallet-display');
    if (storeWalletEl) storeWalletEl.innerText = formattedWallet;
    const hudWalletEl = document.getElementById('hud-wallet-balance');
    if (hudWalletEl) hudWalletEl.innerText = formattedWallet;

    const grid = document.getElementById('store-items-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const catalog = this.career.getStoreCatalog();
    const items = catalog[category] || [];

    items.forEach(item => {
      const isOwned = p.purchasedItems && p.purchasedItems.includes(item.id);
      let isEquipped = false;
      if (category === 'balls') isEquipped = (p.equippedBall === item.id);
      else if (category === 'boots') isEquipped = (p.equippedBoot === item.id);
      else if (category === 'hairs') isEquipped = (p.equippedHair === item.id);
      else if (category === 'kits') isEquipped = (p.equippedKit === item.id);
      else if (category === 'gloves') isEquipped = (p.equippedGloves === item.id);

      const card = document.createElement('div');
      card.className = 'store-card';
      if (isEquipped) card.classList.add('equipped');
      else if (isOwned) card.classList.add('owned');

      const priceDisplay = item.price === 0 
        ? '<span class="store-card-price free">BAŞLANGIÇ</span>' 
        : `<span class="store-card-price">€${item.price.toLocaleString('tr-TR')}</span>`;

      let actionBtnHtml = '';
      if (isEquipped) {
        actionBtnHtml = `<button class="btn-store-action active-equipped" disabled>✓ KUŞANILDI</button>`;
      } else if (isOwned) {
        actionBtnHtml = `<button class="btn-store-action equip" data-cat="${category}" data-id="${item.id}">KUŞAN</button>`;
      } else {
        const canAfford = p.money >= item.price;
        actionBtnHtml = `<button class="btn-store-action buy" data-cat="${category}" data-id="${item.id}" ${canAfford ? '' : 'style="opacity:0.75;"'}>
          🛒 SATIN AL
        </button>`;
      }

      // Stat Boost Hapları
      let statsPillsHtml = '';
      if (item.stats) {
        const pills = [];
        if (item.stats.power) pills.push(`<span class="store-stat-pill power">⚡ +${item.stats.power} ŞUT GÜCÜ</span>`);
        if (item.stats.curve) pills.push(`<span class="store-stat-pill curve">🌪️ +${item.stats.curve} FALSO</span>`);
        if (item.stats.trivela) pills.push(`<span class="store-stat-pill trivela">🌀 +${item.stats.trivela} TRİVELA</span>`);
        if (item.stats.accuracy) pills.push(`<span class="store-stat-pill accuracy">🎯 +${item.stats.accuracy} İSABET</span>`);
        if (item.stats.ballSpeed) pills.push(`<span class="store-stat-pill speed">🚀 +${item.stats.ballSpeed} TOP HIZI</span>`);
        if (item.stats.dipKnuckle) pills.push(`<span class="store-stat-pill knuckle">💥 +${item.stats.dipKnuckle} KNUCKLE</span>`);
        if (item.stats.gkReflex) pills.push(`<span class="store-stat-pill reflex">🧤 +${item.stats.gkReflex} REFLEKS</span>`);
        if (item.stats.gkReach) pills.push(`<span class="store-stat-pill reach">🦅 +${item.stats.gkReach} KANAT AÇIKLIĞI</span>`);
        if (item.stats.gkParry) pills.push(`<span class="store-stat-pill parry">🛡️ +${item.stats.gkParry} ÇELME</span>`);
        if (item.stats.wageBonus) pills.push(`<span class="store-stat-pill wage">💰 +%${item.stats.wageBonus} MAAŞ PRİMİ</span>`);
        if (item.stats.charisma) pills.push(`<span class="store-stat-pill charisma">👑 +${item.stats.charisma} PRESTİJ</span>`);
        if (pills.length > 0) {
          statsPillsHtml = `<div class="store-card-stats-box">${pills.join('')}</div>`;
        }
      }

      card.innerHTML = `
        <div class="store-card-header">
          <div class="store-card-icon">${item.icon}</div>
          <span class="store-card-badge" style="background:${item.accentColor}22; color:${item.accentColor}; border:1px solid ${item.accentColor}55;">
            ${item.badge}
          </span>
        </div>
        <h4 class="store-card-title">${item.name}</h4>
        <p class="store-card-desc">${item.desc}</p>
        ${statsPillsHtml}
        <div class="store-card-footer">
          ${priceDisplay}
          ${actionBtnHtml}
        </div>
      `;

      // Buton aksiyonu
      const btnAction = card.querySelector('.btn-store-action');
      if (btnAction && !isEquipped) {
        btnAction.addEventListener('click', (e) => {
          e.stopPropagation();
          const res = this.career.buyItem(category, item.id);
          if (res.success) {
            if (window.gameSound) {
              window.gameSound.playGoalCheer();
            }
            this.updatePlayerHUD();
            if (this.game && typeof this.game.applyCosmetics === 'function') {
              this.game.applyCosmetics();
            }
            this.renderStore(category);
          } else {
            alert(res.msg);
          }
        });
      }

      grid.appendChild(card);
    });
  }

  // DÜNYA LİDERLİK TABLOSUNU LİSTELE (PARA / OVERALL / HEPSİ)
  renderLeaderboard(filter = 'money') {
    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;

    const headerScoreEl = document.getElementById('lb-header-score');
    if (headerScoreEl) {
      if (filter === 'money') headerScoreEl.innerText = 'BİRİKMİŞ SERVET';
      else if (filter === 'ovr') headerScoreEl.innerText = 'YETENEK OVR';
      else headerScoreEl.innerText = 'BİRLEŞİK PUAN';
    }

    // 1. Anında gösterim (Cache / Yerel kayıtlar - UI asla donmaz)
    const cachedData = this.career.getLeaderboard(filter);
    this._renderLeaderboardRows(cachedData, filter);

    // 2. Canlı Bulut Senkronizasyonu (Gerçek oyuncular anında çekilir)
    const statusEl = document.getElementById('lb-live-status');
    if (statusEl) {
      statusEl.innerHTML = '<span class="lb-live-dot" style="background:#f1c40f; box-shadow:0 0 10px #f1c40f;"></span> BULUT VERİSİ ÇEKİLİYOR...';
    }

    this.career.fetchGlobalLeaderboard(filter).then(freshData => {
      if (freshData && this.currentLeaderboardFilter === filter) {
        this._renderLeaderboardRows(freshData, filter);
        if (statusEl) {
          statusEl.innerHTML = '<span class="lb-live-dot"></span> CANLI BULUT VERİSİ (GERÇEK OYUNCULAR)';
        }
      }
    }).catch(e => {
      console.warn("Liderlik canlı veri alınamadı:", e);
      if (statusEl) {
        statusEl.innerHTML = '<span class="lb-live-dot" style="background:#38bdf8;"></span> YEREL / ÇEVRİMDIŞI MOD';
      }
    });
  }

  _renderLeaderboardRows(leaderboardData, filter) {
    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (!leaderboardData || leaderboardData.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">⚽</div>
          <div style="font-weight: 800; font-size: 1.05rem; color: #f8fafc;">Henüz kayıtlı başka oyuncu yok</div>
          <div style="font-size: 0.85rem; margin-top: 0.3rem;">Oyuna ilk başlayan sensin! Arkadaşına linki at, anında buraya gelsin!</div>
        </div>
      `;
      return;
    }

    leaderboardData.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'lb-row';
      if (entry.isUser) row.classList.add('user-row');

      let rankDisplay = `#${entry.rank}`;
      let rankBadgeClass = '';
      if (entry.rank === 1) { rankDisplay = '🥇 1'; rankBadgeClass = 'lb-rank-1'; }
      else if (entry.rank === 2) { rankDisplay = '🥈 2'; rankBadgeClass = 'lb-rank-2'; }
      else if (entry.rank === 3) { rankDisplay = '🥉 3'; rankBadgeClass = 'lb-rank-3'; }

      const moneyFormatted = entry.money >= 1000000
        ? `€${(entry.money / 1000000).toFixed(1)}M`
        : `€${entry.money.toLocaleString('tr-TR')}`;

      let scoreDisplay = '';
      if (filter === 'money') {
        scoreDisplay = moneyFormatted;
      } else if (filter === 'ovr') {
        scoreDisplay = `${entry.ovr} OVR`;
      } else {
        const compositeScore = Math.round(((entry.ovr * 1500000) + entry.money) / 1000000);
        scoreDisplay = `⭐ ${compositeScore}P`;
      }

      const userTag = entry.isUser ? '<span class="lb-user-badge">SEN</span>' : '<span class="lb-real-tag">🟢 CANLI OYUNCU</span>';

      row.innerHTML = `
        <div class="lb-col-rank">
          <span class="lb-rank-badge ${rankBadgeClass}">${rankDisplay}</span>
        </div>
        <div class="lb-col-player">
          <span class="lb-player-flag">${entry.country || '⚽'}</span>
          <div class="lb-player-names">
            <span class="lb-player-title">${entry.name} ${userTag}</span>
            <span class="lb-player-club">${entry.club}</span>
          </div>
        </div>
        <div class="lb-col-ovr">${entry.ovr}</div>
        <div class="lb-col-money">${moneyFormatted}</div>
        <div class="lb-col-score">${scoreDisplay}</div>
      `;

      listContainer.appendChild(row);
    });

    // Gerçek oyuncu sayısı bilgilendirme bandı
    const infoStrip = document.createElement('div');
    infoStrip.style.cssText = 'text-align: center; padding: 0.8rem 1rem; color: #94a3b8; font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 0.4rem;';
    infoStrip.innerHTML = `👥 <b>Sitede oynayan toplam ${leaderboardData.length} gerçek oyuncu listelenmektedir.</b> (Sıfır bot)`;
    listContainer.appendChild(infoStrip);
  }

  // ANTİ-HİLE VE GÜVENLİK TOAST BİLDİRİMİ
  showSecurityToast(message) {
    const existing = document.querySelector('.security-alert-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'security-alert-toast';
    toast.innerHTML = `
      <span style="font-size:1.5rem;">🛡️</span>
      <div>
        <div style="color:#fef08a; font-size:0.75rem; font-weight:900; letter-spacing:0.5px; margin-bottom:2px;">GÜVENLİK & ANTİ-HİLE</div>
        <div style="font-size:0.85rem; line-height:1.2;">${message}</div>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
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

  // ==========================================================
  // TRANSFER MASASI (İSTEDİĞİ KULÜPLE ANLAŞMA VE TRANSFER GÖRÜŞMESİ)
  // ==========================================================
  renderTransferHub(tierFilter = 'all') {
    const grid = document.getElementById('transfer-hub-clubs-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const clubs = this.career.getAllClubsForTransfer();
    const filteredClubs = tierFilter === 'all' 
      ? clubs 
      : clubs.filter(c => String(c.tier) === String(tierFilter));

    filteredClubs.forEach(club => {
      const card = document.createElement('div');
      card.className = 'club-card';
      if (club.isCurrent) card.classList.add('current');
      else if (!club.isEligible) card.classList.add('locked');

      let actionBtnHtml = '';
      if (club.isCurrent) {
        actionBtnHtml = `<button class="btn-club-action current" disabled>MEVCUT KULÜBÜN</button>`;
      } else if (club.isEligible) {
        actionBtnHtml = `<button class="btn-club-action sign" data-club="${club.id}">✍️ ANLAŞMA SAĞLA & İMZALA</button>`;
      } else {
        actionBtnHtml = `<button class="btn-club-action locked" disabled>🔒 ${club.minOvrNeeded} OVR GEREKLİ (+${club.ovrDiff})</button>`;
      }

      card.innerHTML = `
        <div class="club-card-header">
          <div class="club-card-badge">${club.badge}</div>
          <div class="club-card-info">
            <h4 class="club-card-name">${club.name}</h4>
            <span class="club-card-league">${club.league}</span>
          </div>
          <span class="club-tier-badge tier-${club.tier}">
            ${club.tier === 3 ? '👑 AVRUPA DEVİ' : (club.tier === 2 ? '⚡ SÜPER LİG' : '🟢 1. LİG')}
          </span>
        </div>
        <div class="club-card-body">
          <div class="club-stat-row">
            <span>Kulüp İtibarı:</span>
            <b>⭐ ${club.reputation} / 100</b>
          </div>
          <div class="club-stat-row">
            <span>Gereken Asgari OVR:</span>
            <b style="color:${club.isEligible ? '#00ff88' : '#e74c3c'}">${club.minOvrNeeded} OVR</b>
          </div>
          <div class="club-stat-row">
            <span>Teklif Edilen Haftalık Maaş:</span>
            <b style="color:#00f2fe">€${club.offeredWage.toLocaleString('tr-TR')}</b>
          </div>
        </div>
        <div class="club-card-footer">
          ${actionBtnHtml}
        </div>
      `;

      const btnSign = card.querySelector('.btn-club-action.sign');
      if (btnSign) {
        btnSign.addEventListener('click', (e) => {
          e.stopPropagation();
          const res = this.career.requestTransferToClub(club.id);
          if (res.success) {
            this.transferHubModal.classList.add('hidden');
            const signModal = this.signingModal;
            const p = this.career.player;
            document.getElementById('sign-title').innerText = `${club.badge} ${club.name} İLE ANLAŞMA SAĞLANDI!`;
            document.getElementById('sign-player-name').innerText = p.name;
            document.getElementById('sign-jersey-num').innerText = '#' + p.jerseyNumber;
            document.getElementById('sign-wage-text').innerText = `Haftalık €${club.offeredWage.toLocaleString('tr-TR')} ile resmi sözleşme imzalandı!`;

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
          } else {
            alert(res.msg);
          }
        });
      }

      grid.appendChild(card);
    });
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

  // ==========================================================
  // TURNUVA VE KUPA MODU (DÜNYA KUPASI & DEVLER LİGİ & MÜZE)
  // ==========================================================
  renderTournament(tournType = 'world_cup') {
    const container = document.getElementById('tourn-content-view');
    if (!container) return;
    container.innerHTML = '';

    const titleEl = document.getElementById('tourn-title-text');
    const badgeEl = document.getElementById('tourn-status-badge');

    // 1. KUPA DOLABI (MÜZE) GÖRÜNÜMÜ
    if (tournType === 'cabinet') {
      if (titleEl) titleEl.innerText = '🏛️ KULÜP KUPA DOLABI & MÜZE';
      if (badgeEl) {
        badgeEl.innerText = '🌟 KAZANILAN ZAFERLER';
        badgeEl.style.borderColor = '#ffd700';
        badgeEl.style.color = '#ffd700';
      }

      const grid = document.createElement('div');
      grid.className = 'trophy-cabinet-grid';

      const allTrophies = [
        { id: 'trophy_world_cup', name: 'FIFA Altın Dünya Kupası', icon: '🏆', desc: '2026 Dünya Kupası Şampiyonu! Dünyanın zirvesindesin.', reward: '€25.000.000' },
        { id: 'trophy_ucl', name: 'UEFA Devler Ligi Kupası', icon: '⭐', desc: 'Avrupa Şampiyonu! Kıtanın en büyük kulüplerini dize getirdin.', reward: '€18.000.000' },
        { id: 'trophy_superlig', name: 'Süper Lig Şampiyonluk Kupası', icon: '🥇', desc: 'Lig Maratonu Şampiyonluğu!', reward: '€10.000.000' },
        { id: 'trophy_golden_boot', name: 'Avrupa Altın Ayakkabı', icon: '👟', desc: 'Sezonun Gol Kralı! Kaleleri fethettin.', reward: '€5.000.000' }
      ];

      const userTrophies = (this.career.player && this.career.player.trophies) ? this.career.player.trophies : [];

      allTrophies.forEach(t => {
        const isUnlocked = userTrophies.includes(t.id);
        const card = document.createElement('div');
        card.className = `trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="trophy-icon">${t.icon}</div>
          <div class="trophy-title">${t.name}</div>
          <div class="trophy-desc">${t.desc}</div>
          <div class="trophy-reward-badge">${isUnlocked ? '🏆 KAZANILDI' : '🔒 KİLİTLİ'} (${t.reward})</div>
        `;
        grid.appendChild(card);
      });

      container.appendChild(grid);
      return;
    }

    // 2. TURNUVA AŞAMASI (DÜNYA KUPASI VEYA ŞAMPİYONLAR LİGİ)
    let tourn = this.career.activeTournament;
    if (!tourn || tourn.id !== tournType) {
      tourn = this.career.loadTournament(tournType);
    }

    if (titleEl) titleEl.innerText = `${tourn.badge || '🏆'} ${tourn.name}`;
    if (badgeEl) {
      if (tourn.status === 'won') {
        badgeEl.innerText = '🏆 ŞAMPİYON! KUPA MÜZEDE';
        badgeEl.style.borderColor = '#00ff88';
        badgeEl.style.color = '#00ff88';
      } else if (tourn.status === 'eliminated') {
        badgeEl.innerText = '❌ TURNUVAYA VEDA EDİLDİ';
        badgeEl.style.borderColor = '#ff3366';
        badgeEl.style.color = '#ff3366';
      } else {
        badgeEl.innerText = `⚔️ ${tourn.stages[tourn.currentStageIdx]} (${tourn.currentStageIdx + 1}/${tourn.stages.length})`;
        badgeEl.style.borderColor = '#ffd700';
        badgeEl.style.color = '#ffd700';
      }
    }

    // A) Grup Puan Tablosu
    const tableTitle = document.createElement('div');
    tableTitle.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
    tableTitle.innerHTML = `
      <h3 style="font-size:1.05rem; color:#ffd700; margin:0; font-weight:800;">📊 ${tourn.groupName || 'Grup Aşaması'} Puan Tablosu</h3>
      <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">(İlk 2 sıradaki takım eleme turlarına çıkar)</span>
    `;
    container.appendChild(tableTitle);

    const tableWrapper = document.createElement('div');
    tableWrapper.style.overflowX = 'auto';

    let tableHtml = `
      <table class="tourn-table">
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:left;">Takım</th>
            <th>OVR</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>AG</th>
            <th>YG</th>
            <th>AV</th>
            <th style="color:#ffd700;">PTS</th>
          </tr>
        </thead>
        <tbody>
    `;

    tourn.standings.forEach((team, idx) => {
      const isUser = !!team.isUserTeam || team.id === 'my_club';
      const isTop2 = idx < 2;
      tableHtml += `
        <tr class="${isUser ? 'user-row' : ''} ${isTop2 ? 'advancing' : ''}">
          <td style="font-weight:800;">${idx + 1}</td>
          <td style="text-align:left; font-weight:700;">${team.flag || '🏳️'} ${team.name} ${isUser ? '<span style="font-size:0.7rem; color:#00ff88; margin-left:4px;">(SEN)</span>' : ''}</td>
          <td><span style="background:rgba(255,255,255,0.1); padding:0.15rem 0.4rem; border-radius:6px; font-size:0.75rem;">${team.ovr || 80}</span></td>
          <td>${team.played}</td>
          <td>${team.won}</td>
          <td>${team.drawn}</td>
          <td>${team.lost}</td>
          <td>${team.gf}</td>
          <td>${team.ga}</td>
          <td>${team.gd > 0 ? '+' + team.gd : team.gd}</td>
          <td style="font-weight:900; color:#ffd700; font-size:0.95rem;">${team.pts}</td>
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;
    tableWrapper.innerHTML = tableHtml;
    container.appendChild(tableWrapper);

    // B) Eleme Ağacı (Knockout Bracket)
    const bracketTitle = document.createElement('h3');
    bracketTitle.style.cssText = 'font-size:1.05rem; color:#ffd700; margin:0.5rem 0 0 0; font-weight:800;';
    bracketTitle.innerText = '⚔️ ELEME TURLARI & FİNAL YOLU';
    container.appendChild(bracketTitle);

    const bracketGrid = document.createElement('div');
    bracketGrid.className = 'tourn-bracket-grid';

    (tourn.knockoutTree || []).forEach((ko, koIdx) => {
      const stageGlobalIdx = 3 + koIdx;
      const isCurrentStage = (tourn.currentStageIdx === stageGlobalIdx && tourn.status === 'in_progress');
      const isPlayed = tourn.currentStageIdx > stageGlobalIdx || (tourn.status === 'won' && ko.userMatch.played);

      const bCard = document.createElement('div');
      bCard.className = `tourn-bracket-card ${isCurrentStage ? 'current' : ''}`;
      bCard.innerHTML = `
        <div class="tourn-bracket-stage">${ko.stage}</div>
        <div class="tourn-bracket-teams">
          <span>${ko.userMatch.home}</span>
          <span style="color:#ffd700; font-weight:900;">VS</span>
          <span>${ko.userMatch.away}</span>
        </div>
        <div class="tourn-bracket-status" style="color: ${isPlayed ? '#00ff88' : (isCurrentStage ? '#ffd700' : '#94a3b8')};">
          ${isPlayed ? '✅ KAZANILDI' : (isCurrentStage ? '🔥 ŞU ANKİ TUR' : '⏳ BEKLENİYOR')}
        </div>
      `;
      bracketGrid.appendChild(bCard);
    });
    container.appendChild(bracketGrid);

    // C) Maç Başlatma / Aksiyon Kartı
    const actionCard = document.createElement('div');
    actionCard.style.cssText = 'background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(241, 196, 15, 0.3); border-radius: 12px; padding: 1.2rem; text-align: center; margin-top: 0.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.8rem;';

    if (tourn.status === 'won') {
      actionCard.innerHTML = `
        <div style="font-size: 2.5rem;">🏆</div>
        <div style="font-size: 1.25rem; font-weight: 900; color: #ffd700;">ŞAMPİYONLUK KUPASI MÜZENİ SÜSLÜYOR!</div>
        <div style="font-size: 0.9rem; color: #cbd5e1;">Bu prestijli turnuvayı şampiyon olarak tamamlayarak tarihe geçtin.</div>
        <button id="btn-restart-tournament" class="btn-primary" style="background: linear-gradient(135deg, #00f2fe, #4facfe); max-width: 320px;">
          🔄 TURNUVAYI YENİDEN BAŞLAT
        </button>
      `;
    } else if (tourn.status === 'eliminated') {
      actionCard.innerHTML = `
        <div style="font-size: 2.5rem;">💔</div>
        <div style="font-size: 1.25rem; font-weight: 900; color: #ff3366;">TURNUVADAN ELENDİNİZ</div>
        <div style="font-size: 0.9rem; color: #cbd5e1;">Mücadele takdire şayandı. Yeni bir turnuva başlatıp kupaya koş!</div>
        <button id="btn-restart-tournament" class="btn-primary" style="background: linear-gradient(135deg, #ff416c, #ff4b2b); max-width: 320px;">
          🔄 YENİ TURNUVA BAŞLAT
        </button>
      `;
    } else {
      const currentStageName = tourn.stages[tourn.currentStageIdx] || 'Turnuva Maçı';
      let oppTeamName = 'Brezilya 🇧🇷';
      if (tourn.currentStageIdx < 3) {
        const others = tourn.teams.filter(t => !t.isUserTeam && t.id !== 'my_club');
        const opp = others[tourn.currentStageIdx] || others[0];
        oppTeamName = `${opp.name} ${opp.flag || ''}`;
      } else {
        const koMatch = tourn.knockoutTree[tourn.currentStageIdx - 3];
        oppTeamName = koMatch ? koMatch.userMatch.away : 'Dünya Karması 🌍';
      }

      actionCard.innerHTML = `
        <div style="font-size: 0.85rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">SIRADAKİ EŞLEŞME</div>
        <div style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">
          ${tourn.teams.find(t => t.isUserTeam || t.id === 'my_club')?.name || 'Takımın'} 
          <span style="color: #ffd700; margin: 0 0.5rem;">VS</span> 
          ${oppTeamName}
        </div>
        <div style="font-size: 0.85rem; color: #00ff88; font-weight: 700;">🎯 Aşama: ${currentStageName}</div>
        <button id="btn-start-tourn-action" class="btn-primary" style="background: linear-gradient(135deg, #f1c40f, #e67e22); font-size: 1.1rem; padding: 0.85rem 2rem; max-width: 360px; box-shadow: 0 0 20px rgba(241, 196, 15, 0.4);">
          ⚽ ${currentStageName.toUpperCase()} MAÇINA BAŞLA
        </button>
      `;
    }

    container.appendChild(actionCard);

    // Buton Dinleyicileri
    const btnRestart = document.getElementById('btn-restart-tournament');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.career.initTournament(tournType);
        this.renderTournament(tournType);
      });
    }

    const btnStartAction = document.getElementById('btn-start-tourn-action');
    if (btnStartAction) {
      btnStartAction.addEventListener('click', () => {
        this.tournamentModal.classList.add('hidden');
        let oppTeamName = 'Brezilya 🇧🇷';
        if (tourn.currentStageIdx < 3) {
          const others = tourn.teams.filter(t => !t.isUserTeam && t.id !== 'my_club');
          const opp = others[tourn.currentStageIdx] || others[0];
          oppTeamName = `${opp.name} ${opp.flag || ''}`;
        } else {
          const koMatch = tourn.knockoutTree[tourn.currentStageIdx - 3];
          oppTeamName = koMatch ? koMatch.userMatch.away : 'Dünya Karması 🌍';
        }
        const stageTitle = tourn.stages[tourn.currentStageIdx] || 'Turnuva Maçı';
        if (this.game && this.game.startTournamentMatch) {
          this.game.startTournamentMatch(oppTeamName, stageTitle);
        }
      });
    }
  }
}

window.uiManager = new UIManager();
