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
    this.currentStoreCategory = 'balls';
    this.currentLeaderboardFilter = 'money';
    this.currentTransferTier = 'all';

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

    // 12. Dünya Liderlik Tablosu Aç / Kapat
    const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    if (btnOpenLeaderboard && this.leaderboardModal) {
      btnOpenLeaderboard.addEventListener('click', () => {
        this.renderLeaderboard(this.currentLeaderboardFilter);
        this.leaderboardModal.classList.remove('hidden');
      });
    }
    if (btnCloseLeaderboard && this.leaderboardModal) {
      btnCloseLeaderboard.addEventListener('click', () => {
        this.leaderboardModal.classList.add('hidden');
      });
    }

    const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
    if (btnRefreshLeaderboard) {
      btnRefreshLeaderboard.addEventListener('click', () => {
        this.renderLeaderboard(this.currentLeaderboardFilter);
      });
    }

    // 13. Liderlik Tablosu Filtre Sekmeleri (Para, OVR, Hepsi)
    const lbTabs = document.querySelectorAll('.lb-tab-btn');
    lbTabs.forEach(tab => {
      tab.addEventListener('click', () => {
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
    btnNext.innerText = isSeasonEnd ? '🏆 SEZONU TAMAMLA & TRANSFER TEKLİFLERİNE GEÇ' : 'SONRAKİ MAÇA GEÇ ➔';

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

      card.innerHTML = `
        <div class="store-card-header">
          <div class="store-card-icon">${item.icon}</div>
          <span class="store-card-badge" style="background:${item.accentColor}22; color:${item.accentColor}; border:1px solid ${item.accentColor}55;">
            ${item.badge}
          </span>
        </div>
        <h4 class="store-card-title">${item.name}</h4>
        <p class="store-card-desc">${item.desc}</p>
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

      const userTag = entry.isUser ? '<span class="lb-user-badge">SEN</span>' : '';
      const realTag = entry.isRealPlayer 
        ? (!entry.isUser ? '<span class="lb-real-tag">🟢 CANLI OYUNCU</span>' : '')
        : '<span class="lb-bot-tag">🤖 LİG RAKİBİ</span>';

      row.innerHTML = `
        <div class="lb-col-rank">
          <span class="lb-rank-badge ${rankBadgeClass}">${rankDisplay}</span>
        </div>
        <div class="lb-col-player">
          <span class="lb-player-flag">${entry.country || '⚽'}</span>
          <div class="lb-player-names">
            <span class="lb-player-title">${entry.name} ${userTag} ${realTag}</span>
            <span class="lb-player-club">${entry.club}</span>
          </div>
        </div>
        <div class="lb-col-ovr">${entry.ovr}</div>
        <div class="lb-col-money">${moneyFormatted}</div>
        <div class="lb-col-score">${scoreDisplay}</div>
      `;

      listContainer.appendChild(row);
    });
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
}

window.uiManager = new UIManager();
