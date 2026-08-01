import QRCodeStyling from 'qr-code-styling';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  registerSW({ immediate: true });
}

// ============================================
// PayQR Studio — Offline-First Payment Platform
// Main Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ---- DOM References: Main Form & QR Display ----
  const nameInput = document.getElementById('nameInput');
  const upiInput = document.getElementById('upiInput');
  const amountInput = document.getElementById('amountInput');
  const noteInput = document.getElementById('noteInput');
  const generateBtn = document.getElementById('generateBtn');
  const generateBtnText = document.getElementById('generateBtnText');
  const qrForm = document.getElementById('qrForm');
  const qrSection = document.getElementById('qrSection');
  const qrContainer = document.getElementById('qrContainer');
  const qrInner = document.getElementById('qrInner');
  const qrNameLabel = document.getElementById('qrNameLabel');
  const qrUpiLabel = document.getElementById('qrUpiLabel');
  const qrCardAmount = document.getElementById('qrCardAmount');
  const qrCardNote = document.getElementById('qrCardNote');
  const qrAmountText = document.getElementById('qrAmountText');
  const qrPayeeText = document.getElementById('qrPayeeText');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnText = document.getElementById('downloadBtnText');
  const saveProfileCheck = document.getElementById('saveProfileCheck');

  // ---- DOM References: Top Navigation & Switcher ----
  const activeProfileBtn = document.getElementById('activeProfileBtn');
  const activeProfileLabel = document.getElementById('activeProfileLabel');
  const btnOpenLedger = document.getElementById('btnOpenLedger');
  const btnOpenProfileManager = document.getElementById('btnOpenProfileManager');
  const btnOpenBackup = document.getElementById('btnOpenBackup');

  // ---- DOM References: Itemized Billing & Autocomplete ----
  const toggleItemizedBtn = document.getElementById('toggleItemizedBtn');
  const toggleItemizedIcon = document.getElementById('toggleItemizedIcon');
  const itemizedSection = document.getElementById('itemizedSection');
  const itemRowsContainer = document.getElementById('itemRowsContainer');
  const addItemRowBtn = document.getElementById('addItemRowBtn');
  const clearItemsBtn = document.getElementById('clearItemsBtn');
  const computedTotalText = document.getElementById('computedTotalText');
  const amountLockHint = document.getElementById('amountLockHint');
  const autocompleteMenu = document.getElementById('autocompleteMenu');
  const autocompleteList = document.getElementById('autocompleteList');

  // ---- DOM References: Modals & Dialogs ----
  const onboardingModal = document.getElementById('onboardingModal');
  const onboardingForm = document.getElementById('onboardingForm');
  const onboardLabel = document.getElementById('onboardLabel');
  const onboardName = document.getElementById('onboardName');
  const onboardUpi = document.getElementById('onboardUpi');
  const onboardSwatches = document.getElementById('onboardSwatches');
  const onboardLogoInput = document.getElementById('onboardLogoInput');

  const profileManagerModal = document.getElementById('profileManagerModal');
  const profilesList = document.getElementById('profilesList');
  const btnCreateNewProfile = document.getElementById('btnCreateNewProfile');
  const profileEditForm = document.getElementById('profileEditForm');
  const profId = document.getElementById('profId');
  const profLabel = document.getElementById('profLabel');
  const profName = document.getElementById('profName');
  const profUpi = document.getElementById('profUpi');
  const profEditSwatches = document.getElementById('profEditSwatches');
  const profThemeHex = document.getElementById('profThemeHex');
  const profLogoInput = document.getElementById('profLogoInput');
  const profLogoPreview = document.getElementById('profLogoPreview');
  const profLogoPlaceholder = document.getElementById('profLogoPlaceholder');
  const btnRemoveLogo = document.getElementById('btnRemoveLogo');
  const btnDeleteProf = document.getElementById('btnDeleteProf');
  const catalogProfileBadge = document.getElementById('catalogProfileBadge');
  const addItemForm = document.getElementById('addItemForm');
  const catNewName = document.getElementById('catNewName');
  const catNewPrice = document.getElementById('catNewPrice');
  const catalogList = document.getElementById('catalogList');

  const ledgerModal = document.getElementById('ledgerModal');
  const dailyRevenueText = document.getElementById('dailyRevenueText');
  const allTimeRevenueText = document.getElementById('allTimeRevenueText');
  const totalBillsCount = document.getElementById('totalBillsCount');
  const ledgerSearchInput = document.getElementById('ledgerSearchInput');
  const btnClearAllLedger = document.getElementById('btnClearAllLedger');
  const ledgerList = document.getElementById('ledgerList');
  const ledgerEmptyState = document.getElementById('ledgerEmptyState');

  const backupModal = document.getElementById('backupModal');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const btnUploadJson = document.getElementById('btnUploadJson');
  const btnExportCsv = document.getElementById('btnExportCsv');

  // ---- State Machine ----
  let currentQR = null;
  let currentData = { items: [] };
  let itemizedRows = []; // Array of { id, name, qty, price }
  let activeAutocompleteRowId = null;

  // ---- Constants ----
  const STATE_KEY = 'payqr_platform_state';
  const LEGACY_KEY = 'payqr_profile';
  const UPI_REGEX = /^[\w.\-]+@[\w.\-]+$/;
  const MAX_LEDGER_ENTRIES = 350;

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  const safeText = (value, fallback = '', maxLength = 500) => {
    if (typeof value !== 'string') return fallback;
    return value.slice(0, maxLength);
  };

  const safeAmount = (value, fallback = 0) => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 && amount <= 500000 ? amount : fallback;
  };

  const safeThemeColor = (value) => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#00B86B';
  const safeLogoDataUri = (value) => /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(value || '') ? value : null;

  const normalizePlatformState = (rawState) => {
    const rawProfiles = Array.isArray(rawState?.profiles) ? rawState.profiles : [];
    const usedIds = new Set();
    const profiles = rawProfiles.map((rawProfile, index) => {
      if (!rawProfile || typeof rawProfile !== 'object') return null;
      const name = safeText(rawProfile.name, '', 120).trim();
      const upiId = safeText(rawProfile.upiId, '', 160).trim().toLowerCase();
      if (!name || !UPI_REGEX.test(upiId)) return null;

      let id = safeText(rawProfile.id, `prof_restored_${index}`, 120).trim() || `prof_restored_${index}`;
      while (usedIds.has(id)) id = `${id}_${index}`;
      usedIds.add(id);

      const catalog = {};
      if (rawProfile.catalog && typeof rawProfile.catalog === 'object' && !Array.isArray(rawProfile.catalog)) {
        Object.entries(rawProfile.catalog).slice(0, 500).forEach(([rawName, rawItem]) => {
          const itemName = safeText(rawName, '', 120).trim();
          if (itemName) catalog[itemName] = {
            price: safeAmount(rawItem?.price),
            count: Math.max(0, Math.floor(safeAmount(rawItem?.count)))
          };
        });
      }

      return {
        id,
        label: safeText(rawProfile.label, 'Store Checkout', 120).trim() || 'Store Checkout',
        name,
        upiId,
        themeColor: safeThemeColor(rawProfile.themeColor),
        logoDataUri: safeLogoDataUri(rawProfile.logoDataUri),
        catalog
      };
    }).filter(Boolean);

    const profileIds = new Set(profiles.map(profile => profile.id));
    const ledger = (Array.isArray(rawState?.ledger) ? rawState.ledger : []).slice(0, MAX_LEDGER_ENTRIES).map((entry, index) => {
      const items = (Array.isArray(entry?.items) ? entry.items : []).slice(0, 100).map(item => ({
        name: safeText(item?.name, 'Item', 120).trim() || 'Item',
        qty: Math.max(1, Math.floor(safeAmount(item?.qty, 1))),
        price: safeAmount(item?.price)
      }));
      return {
        id: safeText(entry?.id, `inv_restored_${index}`, 120),
        timestamp: Number.isFinite(Number(entry?.timestamp)) ? Number(entry.timestamp) : Date.now(),
        profileId: safeText(entry?.profileId, '', 120),
        profileName: safeText(entry?.profileName, 'Store Checkout', 120),
        payeeName: safeText(entry?.payeeName, '', 120),
        upiId: safeText(entry?.upiId, '', 160),
        amount: safeAmount(entry?.amount),
        note: safeText(entry?.note, '', 500),
        items
      };
    });

    const requestedActiveId = safeText(rawState?.activeProfileId, '', 120);
    return {
      activeProfileId: profileIds.has(requestedActiveId) ? requestedActiveId : (profiles[0]?.id || 'prof_init'),
      profiles,
      ledger
    };
  };

  const defaultPlatformState = {
    activeProfileId: 'prof_init',
    profiles: [],
    ledger: []
  };

  let platformState = JSON.parse(JSON.stringify(defaultPlatformState));

  // ============================================
  // Image Canvas Compression Helper
  // ============================================
  const compressImageToDataURL = (file, maxDim = 180) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return resolve(null);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', 0.85));
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // ============================================
  // Platform Storage & Migration Engine
  // ============================================

  const savePlatformState = () => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(platformState));
    } catch (e) {
      console.warn('Failed to save platform state to localStorage (likely quota exceeded):', e);
    }
  };

  const loadPlatformState = () => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.profiles)) {
          platformState = normalizePlatformState(parsed);
        }
      } else {
        // Check for backwards-compatible legacy migration
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          try {
            const oldProf = JSON.parse(legacy);
            if (oldProf.name && oldProf.upiId) {
              const defaultId = 'prof_' + Date.now();
              platformState.activeProfileId = defaultId;
              platformState.profiles = [{
                id: defaultId,
                label: 'Main Profile',
                name: oldProf.name,
                upiId: oldProf.upiId,
                themeColor: '#00B86B',
                logoDataUri: null,
                catalog: {}
              }];
              savePlatformState();
              localStorage.removeItem(LEGACY_KEY);
            }
          } catch (e) {
            console.warn('Error parsing legacy profile during migration:', e);
          }
        }
      }
    } catch (e) {
      console.warn('Error loading platform state:', e);
    }

    // Check if zero profiles exist -> Trigger First-Time Onboarding
    if (!platformState.profiles || platformState.profiles.length === 0) {
      openModal(onboardingModal);
    } else {
      applyActiveProfileToUI();
    }
  };

  const getActiveProfile = () => {
    if (!platformState.profiles.length) return null;
    return platformState.profiles.find(p => p.id === platformState.activeProfileId) || platformState.profiles[0];
  };

  const applyActiveProfileToUI = () => {
    const prof = getActiveProfile();
    if (!prof) return;

    platformState.activeProfileId = prof.id;
    if (activeProfileLabel) activeProfileLabel.textContent = prof.label || 'Store Checkout';
    if (nameInput) nameInput.value = prof.name || '';
    if (upiInput) upiInput.value = prof.upiId || '';
    if (saveProfileCheck) saveProfileCheck.checked = true;

    // Update Active Account Banner Card on Main Form
    const aabName = document.getElementById('aabNameDisplay');
    const aabUpi = document.getElementById('aabUpiDisplay');
    const aabTag = document.getElementById('aabTagDisplay');
    const aabAvatar = document.getElementById('aabAvatarDisplay');
    if (aabName) aabName.textContent = prof.name || 'Merchant Account';
    if (aabUpi) aabUpi.textContent = prof.upiId || 'upi@bank';
    if (aabTag) aabTag.textContent = prof.label || 'Active';
    if (aabAvatar) {
      const logoDataUri = safeLogoDataUri(prof.logoDataUri);
      if (logoDataUri) {
        aabAvatar.innerHTML = `<img src="${escapeHTML(logoDataUri)}" alt="Logo">`;
      } else {
        aabAvatar.innerHTML = '🏦';
      }
    }

    // Apply curated CSS theme custom property
    const color = prof.themeColor || '#00B86B';
    document.documentElement.style.setProperty('--accent', color);
  };

  // ============================================
  // Toast Notification Helper
  // ============================================
  let toastTimer = null;
  const showToast = (message) => {
    const toast = document.getElementById('payqrToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove('hidden', 'fadeOut');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('fadeOut');
      setTimeout(() => toast.classList.add('hidden'), 260);
    }, 3200);
  };

  // ============================================
  // Animated Modal Architecture Helpers
  // ============================================
  const openModal = (modalEl) => {
    if (!modalEl) return;
    const card = modalEl.querySelector('.modal-card');
    if (card) card.classList.remove('animate-out');
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modalEl) => {
    if (!modalEl || modalEl.classList.contains('hidden')) return;
    document.body.style.overflow = '';
    const card = modalEl.querySelector('.modal-card');
    if (card) {
      card.classList.add('animate-out');
      setTimeout(() => {
        modalEl.classList.add('hidden');
        card.classList.remove('animate-out');
      }, 160);
    } else {
      modalEl.classList.add('hidden');
    }
  };

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop && backdrop.id !== 'onboardingModal') {
        closeModal(backdrop);
      }
    });
  });

  // Tab switching inside modals
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.modal-card');
      parent.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
      parent.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetEl = parent.querySelector(`#${targetId}`);
      if (targetEl) targetEl.classList.remove('hidden');
    });
  });

  // Swatch selection helper
  const setupSwatchPicker = (container) => {
    if (!container) return;
    container.querySelectorAll('.theme-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        container.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.getAttribute('data-color');
        const hexInput = container.querySelector('.color-picker-input');
        if (hexInput && color) hexInput.value = color;
      });
    });
  };

  setupSwatchPicker(onboardSwatches);
  setupSwatchPicker(profEditSwatches);

  if (profThemeHex) {
    profThemeHex.addEventListener('input', () => {
      if (profEditSwatches) {
        profEditSwatches.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
      }
    });
  }

  // ============================================
  // Onboarding Setup Workflow
  // ============================================
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const label = onboardLabel.value.trim() || 'Store Checkout';
      const name = onboardName.value.trim();
      const upi = onboardUpi.value.trim().toLowerCase();

      if (!name || !upi || !UPI_REGEX.test(upi)) {
        alert('Please provide a valid Payee Name and UPI ID (e.g., name@paytm or phone@upi).');
        return;
      }

      let chosenColor = '#00B86B';
      const activeSwatch = onboardSwatches.querySelector('.theme-swatch.active');
      if (activeSwatch) chosenColor = activeSwatch.getAttribute('data-color');

      let logoData = null;
      if (onboardLogoInput.files && onboardLogoInput.files[0]) {
        logoData = await compressImageToDataURL(onboardLogoInput.files[0], 180);
      }

      const profId = 'prof_' + Date.now();
      const newProf = {
        id: profId,
        label: label,
        name: name,
        upiId: upi,
        themeColor: chosenColor,
        logoDataUri: logoData,
        catalog: {}
      };

      platformState.profiles.push(newProf);
      platformState.activeProfileId = profId;
      savePlatformState();
      applyActiveProfileToUI();
      closeModal(onboardingModal);
      showToast('🚀 Studio launched with ' + label + ' profile!');
    });
  }

  // ============================================
  // Profile Manager & Smart Catalog Logic
  // ============================================
  const renderProfilesList = () => {
    if (!profilesList) return;
    profilesList.innerHTML = '';

    platformState.profiles.forEach(prof => {
      const li = document.createElement('li');
      li.className = `profile-list-item ${prof.id === platformState.activeProfileId ? 'selected' : ''}`;
      li.innerHTML = `
        <div class="pli-info">
          <span class="pli-label">
            <span class="profile-dot" style="background-color: ${safeThemeColor(prof.themeColor)}; box-shadow: 0 0 6px ${safeThemeColor(prof.themeColor)};"></span>
            ${escapeHTML(prof.label || 'Unnamed Profile')}
          </span>
          <span class="pli-upi">${escapeHTML(prof.name)} (${escapeHTML(prof.upiId)})</span>
        </div>
      `;
      li.addEventListener('click', () => loadProfileIntoEditor(prof));
      profilesList.appendChild(li);
    });
  };

  const loadProfileIntoEditor = (prof) => {
    profId.value = prof ? prof.id : '';
    profLabel.value = prof ? prof.label : 'Store Checkout';
    profName.value = prof ? prof.name : '';
    profUpi.value = prof ? prof.upiId : '';
    
    document.getElementById('profileEditTitle').textContent = prof ? `Edit Profile: ${prof.label}` : 'Create Brand New Profile';

    // Reset swatches
    const color = prof ? (prof.themeColor || '#00B86B') : '#00B86B';
    if (profThemeHex) profThemeHex.value = color;
    if (profEditSwatches) {
      let matched = false;
      profEditSwatches.querySelectorAll('.theme-swatch').forEach(s => {
        if (s.getAttribute('data-color').toLowerCase() === color.toLowerCase()) {
          s.classList.add('active');
          matched = true;
        } else {
          s.classList.remove('active');
        }
      });
    }

    // Logo display
    if (prof && prof.logoDataUri) {
      profLogoPreview.src = prof.logoDataUri;
      profLogoPreview.classList.remove('hidden');
      profLogoPlaceholder.classList.add('hidden');
      btnRemoveLogo.classList.remove('hidden');
    } else {
      profLogoPreview.src = '';
      profLogoPreview.classList.add('hidden');
      profLogoPlaceholder.classList.remove('hidden');
      btnRemoveLogo.classList.add('hidden');
    }
    if (profLogoInput) profLogoInput.value = '';

    // Delete button visibility
    if (prof && platformState.profiles.length > 1) {
      btnDeleteProf.classList.remove('hidden');
    } else {
      btnDeleteProf.classList.add('hidden');
    }

    // Also load catalog for this profile
    if (prof) {
      catalogProfileBadge.textContent = prof.label;
      renderCatalogList(prof);
    }
  };

  if (btnCreateNewProfile) {
    btnCreateNewProfile.addEventListener('click', () => {
      loadProfileIntoEditor(null);
      profLabel.focus();
    });
  }

  if (btnRemoveLogo) {
    btnRemoveLogo.addEventListener('click', () => {
      profLogoPreview.src = '';
      profLogoPreview.classList.add('hidden');
      profLogoPlaceholder.classList.remove('hidden');
      btnRemoveLogo.classList.add('hidden');
      if (profLogoInput) profLogoInput.value = '';
    });
  }

  if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const label = profLabel.value.trim() || 'Store Checkout';
      const name = profName.value.trim();
      const upi = profUpi.value.trim().toLowerCase();

      if (!name || !upi || !UPI_REGEX.test(upi)) {
        alert('Please enter a valid Payee Name and UPI ID.');
        return;
      }

      let color = profThemeHex ? profThemeHex.value : '#00B86B';
      if (profEditSwatches) {
        const activeSwatch = profEditSwatches.querySelector('.theme-swatch.active');
        if (activeSwatch) color = activeSwatch.getAttribute('data-color');
      }

      // Check logo modification
      let logoData = null;
      if (profLogoPreview && !profLogoPreview.classList.contains('hidden')) {
        logoData = profLogoPreview.src;
      }
      if (profLogoInput && profLogoInput.files && profLogoInput.files[0]) {
        logoData = await compressImageToDataURL(profLogoInput.files[0], 180);
      }

      const currentId = profId.value;
      if (currentId) {
        // Update existing profile
        const idx = platformState.profiles.findIndex(p => p.id === currentId);
        if (idx !== -1) {
          platformState.profiles[idx].label = label;
          platformState.profiles[idx].name = name;
          platformState.profiles[idx].upiId = upi;
          platformState.profiles[idx].themeColor = color;
          platformState.profiles[idx].logoDataUri = logoData;
          if (!platformState.profiles[idx].catalog) platformState.profiles[idx].catalog = {};
        }
        if (platformState.activeProfileId === currentId) {
          applyActiveProfileToUI();
        }
      } else {
        // Create brand new profile
        const newId = 'prof_' + Date.now();
        const newProf = {
          id: newId,
          label: label,
          name: name,
          upiId: upi,
          themeColor: color,
          logoDataUri: logoData,
          catalog: {}
        };
        platformState.profiles.push(newProf);
        platformState.activeProfileId = newId;
        applyActiveProfileToUI();
      }

      savePlatformState();
      renderProfilesList();
      showToast('✓ Profile settings saved successfully!');
    });
  }

  if (btnDeleteProf) {
    btnDeleteProf.addEventListener('click', () => {
      const delId = profId.value;
      if (!delId || platformState.profiles.length <= 1) return;
      if (confirm('Are you certain you want to delete this profile?')) {
        platformState.profiles = platformState.profiles.filter(p => p.id !== delId);
        if (platformState.activeProfileId === delId) {
          platformState.activeProfileId = platformState.profiles[0].id;
          applyActiveProfileToUI();
        }
        savePlatformState();
        renderProfilesList();
        loadProfileIntoEditor(getActiveProfile());
      }
    });
  }

  // --- Smart Catalog Management ---
  const renderCatalogList = (prof) => {
    if (!catalogList || !prof || !prof.catalog) return;
    catalogList.innerHTML = '';

    const keys = Object.keys(prof.catalog);
    if (keys.length === 0) {
      catalogList.innerHTML = `<li class="empty-state-msg">No items remembered yet for this profile. Items will learn automatically when generating bills!</li>`;
      return;
    }

    keys.forEach(key => {
      const itemData = prof.catalog[key];
      const li = document.createElement('li');
      li.className = 'catalog-item-row';
      li.innerHTML = `
        <span class="cat-item-name">${escapeHTML(key)}</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn-add-to-bill" title="Add directly to current itemized bill">➕ Add</button>
          <input type="number" class="cat-price-edit" value="${safeAmount(itemData.price)}" min="0">
          <button type="button" class="btn-delete-small">🗑️</button>
        </div>
      `;

      // Add directly to current bill
      const addBtn = li.querySelector('.btn-add-to-bill');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const isHidden = itemizedSection && itemizedSection.classList.contains('hidden');
          if (isHidden) {
            itemizedSection.classList.remove('hidden');
            if (toggleItemizedBtn) toggleItemizedBtn.classList.add('active');
            if (toggleItemizedIcon) toggleItemizedIcon.textContent = '–';
          }
          itemizedRows.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: key,
            qty: 1,
            price: itemData.price || 0
          });
          if (typeof renderItemRows === 'function') renderItemRows();
          showToast(`✓ Added 1x "${key}" (@₹${itemData.price || 0}) to bill!`);
        });
      }

      // Inline price edit
      const priceInput = li.querySelector('.cat-price-edit');
      priceInput.addEventListener('change', () => {
        const val = parseFloat(priceInput.value);
        if (!isNaN(val) && val >= 0) {
          prof.catalog[key].price = val;
          savePlatformState();
        }
      });

      // Delete item
      li.querySelector('.btn-delete-small').addEventListener('click', () => {
        delete prof.catalog[key];
        savePlatformState();
        renderCatalogList(prof);
      });

      catalogList.appendChild(li);
    });
  };

  if (addItemForm) {
    addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const prof = getActiveProfile();
      if (!prof) return;
      if (!prof.catalog) prof.catalog = {};

      const name = catNewName.value.trim();
      const price = parseFloat(catNewPrice.value) || 0;
      if (!name) return;

      prof.catalog[name] = { price: price, count: 1 };
      savePlatformState();
      catNewName.value = '';
      catNewPrice.value = '';
      renderCatalogList(prof);
    });
  }

  // Header navigation bindings
  if (activeProfileBtn) {
    activeProfileBtn.addEventListener('click', () => {
      renderProfilesList();
      loadProfileIntoEditor(getActiveProfile());
      openModal(profileManagerModal);
    });
  }
  if (btnOpenProfileManager) {
    btnOpenProfileManager.addEventListener('click', () => {
      renderProfilesList();
      loadProfileIntoEditor(getActiveProfile());
      openModal(profileManagerModal);
    });
  }

  const activeAccountCard = document.getElementById('activeAccountCard');
  if (activeAccountCard) {
    activeAccountCard.addEventListener('click', () => {
      renderProfilesList();
      loadProfileIntoEditor(getActiveProfile());
      if (profileManagerModal) {
        profileManagerModal.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active', 'hidden'));
        profileManagerModal.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        
        const profBtn = profileManagerModal.querySelector('[data-tab="tabProfiles"]');
        const catBtn = profileManagerModal.querySelector('[data-tab="tabCatalog"]');
        const profTab = document.getElementById('tabProfiles');
        if (profBtn) profBtn.classList.add('active');
        if (catBtn) catBtn.classList.add('hidden'); // De-duplicate: hide catalog tab when in account profile settings
        if (profTab) profTab.classList.remove('hidden');

        openModal(profileManagerModal);
      }
    });
  }

  // ---- 1-Click Smart Catalog Access ----
  const openSmartCatalogModal = () => {
    renderProfilesList();
    const prof = getActiveProfile();
    loadProfileIntoEditor(prof);
    renderCatalogList(prof);

    if (profileManagerModal) {
      profileManagerModal.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active', 'hidden'));
      profileManagerModal.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
      
      const profBtn = profileManagerModal.querySelector('[data-tab="tabProfiles"]');
      const catBtn = profileManagerModal.querySelector('[data-tab="tabCatalog"]');
      const catTab = document.getElementById('tabCatalog');
      if (profBtn) profBtn.classList.add('hidden'); // De-duplicate: hide profile settings when browsing item catalog
      if (catBtn) catBtn.classList.add('active');
      if (catTab) catTab.classList.remove('hidden');

      openModal(profileManagerModal);
    }
  };

  const btnOpenCatalogNav = document.getElementById('btnOpenCatalogNav');
  if (btnOpenCatalogNav) btnOpenCatalogNav.addEventListener('click', openSmartCatalogModal);

  const btnOpenCatalogQuick = document.getElementById('btnOpenCatalogQuick');
  if (btnOpenCatalogQuick) btnOpenCatalogQuick.addEventListener('click', openSmartCatalogModal);

  // ============================================
  // Expandable Itemized Billing & Smart Autocomplete
  // ============================================

  const updateItemizedTotals = () => {
    let grandTotal = 0;
    itemizedRows.forEach(row => {
      const rowTot = (row.qty || 0) * (row.price || 0);
      grandTotal += rowTot;
      const rowEl = document.getElementById(`item_row_${row.id}`);
      if (rowEl) {
        rowEl.querySelector('.item-row-total').textContent = `₹${rowTot.toLocaleString('en-IN')}`;
      }
    });

    if (computedTotalText) {
      computedTotalText.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    }

    // Check if there are meaningful itemized entries
    const hasItems = itemizedRows.some(r => r.name.trim() || r.price > 0);
    if (hasItems && !itemizedSection.classList.contains('hidden')) {
      amountInput.value = grandTotal > 0 ? grandTotal : '';
      amountInput.readOnly = true;
      if (amountLockHint) amountLockHint.classList.remove('hidden');
    } else {
      amountInput.readOnly = false;
      if (amountLockHint) amountLockHint.classList.add('hidden');
    }
  };

  const closeAutocompletePopup = () => {
    if (autocompleteMenu) autocompleteMenu.classList.add('hidden');
    activeAutocompleteRowId = null;
  };

  const showAutocompleteSuggestions = (rowId, query, inputEl) => {
    const prof = getActiveProfile();
    if (!prof || !prof.catalog || !autocompleteMenu || !autocompleteList) return;
    
    const matches = Object.keys(prof.catalog).filter(k => k.toLowerCase().includes(query.toLowerCase().trim()));
    if (matches.length === 0 || query.trim() === '') {
      closeAutocompletePopup();
      return;
    }

    activeAutocompleteRowId = rowId;
    autocompleteList.innerHTML = '';
    matches.slice(0, 8).forEach(matchKey => {
      const itemData = prof.catalog[matchKey];
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.innerHTML = `
        <span>${escapeHTML(matchKey)}</span>
        <span class="autocomplete-price-tag">₹${safeAmount(itemData.price)}</span>
      `;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = itemizedRows.find(r => r.id === rowId);
        if (row) {
          row.name = matchKey;
          row.price = itemData.price || 0;
          const rowEl = document.getElementById(`item_row_${rowId}`);
          if (rowEl) {
            rowEl.querySelector('.item-name-input').value = row.name;
            rowEl.querySelector('.item-price-input').value = row.price;
          }
          updateItemizedTotals();
        }
        closeAutocompletePopup();
      });
      autocompleteList.appendChild(div);
    });

    // Position relative inside itemized section
    const secRect = itemizedSection.getBoundingClientRect();
    const inpRect = inputEl.getBoundingClientRect();
    autocompleteMenu.style.top = `${inpRect.bottom - secRect.top + 4}px`;
    autocompleteMenu.style.left = '16px';
    autocompleteMenu.style.right = '16px';
    autocompleteMenu.classList.remove('hidden');
  };

  const renderItemRows = () => {
    if (!itemRowsContainer) return;
    itemRowsContainer.innerHTML = '';

    itemizedRows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'item-row';
      rowDiv.id = `item_row_${row.id}`;
      rowDiv.innerHTML = `
        <input type="text" class="item-name-input" placeholder="Item Name (e.g. Latte)" value="${escapeHTML(row.name)}" enterkeyhint="next" autocomplete="off">
        <div class="item-qty-wrapper" data-label="Qty">
          <input type="text" inputmode="numeric" class="item-qty-input" value="${safeAmount(row.qty, 1)}" placeholder="1" enterkeyhint="next" autocomplete="off">
        </div>
        <div class="item-price-wrapper" data-label="Price (₹)">
          <input type="text" inputmode="decimal" class="item-price-input" placeholder="0" value="${safeAmount(row.price) || ''}" enterkeyhint="next" autocomplete="off">
        </div>
        <span class="item-row-total">₹0</span>
        <button type="button" class="btn-del-row" title="Delete Row">×</button>
      `;

      const nameInp = rowDiv.querySelector('.item-name-input');
      const qtyInp = rowDiv.querySelector('.item-qty-input');
      const priceInp = rowDiv.querySelector('.item-price-input');
      const delBtn = rowDiv.querySelector('.btn-del-row');

      // Auto-select text on focus so user doesn't have to manually backspace default values on mobile touchscreens
      [nameInp, qtyInp, priceInp].forEach(inp => {
        inp.addEventListener('focus', function() {
          setTimeout(() => { this.select(); }, 10);
          this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });

      nameInp.addEventListener('input', (e) => {
        row.name = e.target.value;
        showAutocompleteSuggestions(row.id, row.name, nameInp);
        updateItemizedTotals();
      });
      nameInp.addEventListener('focus', () => {
        if (row.name.trim()) showAutocompleteSuggestions(row.id, row.name, nameInp);
      });

      qtyInp.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        row.qty = val === '' ? 0 : (parseInt(val, 10) || 0);
        updateItemizedTotals();
      });
      qtyInp.addEventListener('blur', (e) => {
        if (e.target.value.trim() === '' || isNaN(parseInt(e.target.value, 10)) || row.qty <= 0) {
          row.qty = 1;
          e.target.value = '1';
          updateItemizedTotals();
        }
      });

      priceInp.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        row.price = val === '' ? 0 : (parseFloat(val) || 0);
        updateItemizedTotals();
      });
      priceInp.addEventListener('blur', (e) => {
        if (row.price === 0 && e.target.value.trim() === '') {
          e.target.value = '';
        } else {
          e.target.value = safeAmount(row.price);
        }
      });

      delBtn.addEventListener('click', () => {
        itemizedRows = itemizedRows.filter(r => r.id !== row.id);
        renderItemRows();
        updateItemizedTotals();
      });

      itemRowsContainer.appendChild(rowDiv);
    });

    updateItemizedTotals();
  };

  const addItemRow = (customName = '', customQty = 1, customPrice = 0) => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    itemizedRows.push({
      id: newId,
      name: customName,
      qty: customQty,
      price: customPrice
    });
    renderItemRows();
  };

  if (addItemRowBtn) {
    addItemRowBtn.addEventListener('click', () => addItemRow());
  }
  if (clearItemsBtn) {
    clearItemsBtn.addEventListener('click', () => {
      itemizedRows = [];
      renderItemRows();
      updateItemizedTotals();
    });
  }
  if (toggleItemizedBtn) {
    toggleItemizedBtn.addEventListener('click', () => {
      const isHidden = itemizedSection.classList.contains('hidden');
      if (isHidden) {
        itemizedSection.classList.remove('hidden');
        toggleItemizedBtn.classList.add('active');
        if (toggleItemizedIcon) toggleItemizedIcon.textContent = '–';
        if (itemizedRows.length === 0) addItemRow();
      } else {
        itemizedSection.classList.add('hidden');
        toggleItemizedBtn.classList.remove('active');
        if (toggleItemizedIcon) toggleItemizedIcon.textContent = '+';
        amountInput.readOnly = false;
        if (amountLockHint) amountLockHint.classList.add('hidden');
        closeAutocompletePopup();
      }
      updateItemizedTotals();
    });
  }

  document.addEventListener('click', (e) => {
    if (autocompleteMenu && !e.target.closest('.autocomplete-menu') && !e.target.closest('.item-name-input')) {
      closeAutocompletePopup();
    }
  });

  // ============================================
  // Input Validation & Error Display
  // ============================================

  const showError = (groupId, errorId, message) => {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) group.classList.add('error');
    if (error) error.textContent = message;
  };

  const clearError = (groupId) => {
    const group = document.getElementById(groupId);
    if (group) group.classList.remove('error');
  };

  const clearAllErrors = () => {
    document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error'));
  };

  const validate = () => {
    let isValid = true;
    clearAllErrors();

    const name = nameInput.value.trim();
    if (!name || name.length < 2) {
      showError('nameGroup', 'nameError', 'Please enter a payee name (2+ characters)');
      isValid = false;
    }

    const upiId = upiInput.value.trim().toLowerCase();
    if (!upiId || !UPI_REGEX.test(upiId)) {
      showError('upiGroup', 'upiError', 'Enter a valid UPI ID (e.g. merchant@icici)');
      isValid = false;
    }

    const amount = amountInput.value.trim();
    if (amount) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0 || num > 500000) {
        showError('amountGroup', 'amountError', 'Enter a valid amount between ₹1 and ₹5,00,000');
        isValid = false;
      }
    }

    return isValid;
  };

  // ============================================
  // QR Code & Placard Generation
  // ============================================

  const generateQR = () => {
    if (!validate()) return;
    navigator.vibrate?.(50);

    const activeProf = getActiveProfile() || { themeColor: '#00B86B', label: 'Main' };
    const name = nameInput.value.trim();
    const upiId = upiInput.value.trim().toLowerCase();
    const amount = amountInput.value.trim();
    const note = noteInput.value.trim();

    // Check itemized breakdown state
    let activeItems = [];
    if (!itemizedSection.classList.contains('hidden')) {
      activeItems = itemizedRows
        .filter(r => r.name.trim() || r.price > 0)
        .map(r => ({ name: r.name.trim() || 'Item', qty: r.qty || 1, price: r.price || 0 }));
    }

    // Build UPI URL
    let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`;
    if (amount && parseFloat(amount) > 0) {
      upiUrl += `&am=${parseFloat(amount).toFixed(2)}`;
    }
    if (note) {
      upiUrl += `&tn=${encodeURIComponent(note)}`;
    }

    currentData = { name, upiId, amount, note, upiUrl, items: activeItems };

    generateBtn.classList.add('loading');
    generateBtnText.textContent = 'Generating Placard...';
    qrInner.innerHTML = '';

    const themeCol = activeProf.themeColor || '#00B86B';
    const logoUri = activeProf.logoDataUri || null;

    currentQR = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'canvas',
      data: upiUrl,
      image: logoUri,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.35
      },
      dotsOptions: {
        color: '#1a1a2e',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        color: themeCol,
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: themeCol,
        type: 'dot'
      },
      qrOptions: {
        errorCorrectionLevel: 'Q'
      }
    });

    currentQR.append(qrInner);

    // Populate on-screen card labels
    qrNameLabel.textContent = name;
    qrUpiLabel.textContent = upiId;

    if (amount && parseFloat(amount) > 0) {
      qrCardAmount.textContent = `Amount: ₹${Number(amount).toLocaleString('en-IN')}`;
      qrCardAmount.classList.remove('any-amount');
    } else {
      qrCardAmount.textContent = 'Amount: Any Amount';
      qrCardAmount.classList.add('any-amount');
    }

    if (note) {
      qrCardNote.textContent = `📝 Note: ${note}`;
      qrCardNote.style.display = 'inline-block';
    } else {
      qrCardNote.textContent = '';
      qrCardNote.style.display = 'none';
    }

    qrAmountText.textContent = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Any Amount';
    qrPayeeText.textContent = `Pay to ${name}`;

    setTimeout(() => {
      qrSection.classList.add('visible');
      setTimeout(() => {
        qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      generateBtn.classList.remove('loading');
      generateBtn.classList.add('success');
      generateBtnText.textContent = '✓ Placard Generated!';

      setTimeout(() => {
        generateBtn.classList.remove('success');
        generateBtnText.textContent = 'Generate QR & Placard';
      }, 2500);
    }, 350);

    // 1. Auto-save input modifications back into active profile if checked
    if (saveProfileCheck.checked && activeProf.id) {
      const idx = platformState.profiles.findIndex(p => p.id === activeProf.id);
      if (idx !== -1) {
        platformState.profiles[idx].name = name;
        platformState.profiles[idx].upiId = upiId;
      }
    }

    // 2. Automatically learn / override item prices in Smart Catalog
    if (activeProf && activeItems.length > 0) {
      if (!activeProf.catalog) activeProf.catalog = {};
      activeItems.forEach(item => {
        if (item.name && item.price >= 0) {
          activeProf.catalog[item.name] = { price: item.price, count: 1 };
        }
      });
      const idx = platformState.profiles.findIndex(p => p.id === activeProf.id);
      if (idx !== -1) platformState.profiles[idx].catalog = activeProf.catalog;
    }

    // 3. Log transaction to Recent Invoices Ledger
    const invoiceLog = {
      id: 'inv_' + Date.now(),
      timestamp: Date.now(),
      profileId: activeProf.id || 'unknown',
      profileName: activeProf.label || 'Store Checkout',
      payeeName: name,
      upiId: upiId,
      amount: amount ? parseFloat(amount) : 0,
      note: note,
      items: JSON.parse(JSON.stringify(activeItems))
    };

    platformState.ledger.unshift(invoiceLog);
    // Keep ledger capped at 350 entries to preserve localStorage quota
    if (platformState.ledger.length > MAX_LEDGER_ENTRIES) {
      platformState.ledger.pop();
    }

    savePlatformState();
    document.activeElement?.blur();
  };

  // ============================================
  // Composite Canvas (Placard Export)
  // ============================================

  const getCompositeCanvas = () => {
    const qrCanvas = qrInner.querySelector('canvas');
    if (!qrCanvas) return null;

    const activeProf = getActiveProfile() || {};
    const themeCol = activeProf.themeColor || '#00B86B';

    const name = currentData.name || 'Merchant Payment';
    const upiId = currentData.upiId || '';
    const hasNote = Boolean(currentData.note && currentData.note.trim());

    const totalWidth = 360;
    const headerHeight = hasNote ? 148 : 120;
    const qrSectionHeight = 290;
    const bottomSectionHeight = 190;
    const totalHeight = headerHeight + qrSectionHeight + bottomSectionHeight;
    const padding = 40;
    const scale = 2;

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Header
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '700 20px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, totalWidth / 2, 36);

    ctx.fillStyle = '#6b6b80';
    ctx.font = '500 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText(upiId, totalWidth / 2, 62);

    const amountStr = currentData.amount && parseFloat(currentData.amount) > 0 
      ? `Amount: ₹${Number(currentData.amount).toLocaleString('en-IN')}` 
      : 'Amount: Any Amount';
    ctx.fillStyle = currentData.amount ? '#00965e' : '#4a4a5a';
    ctx.font = currentData.amount ? '700 17px Inter, system-ui, -apple-system, sans-serif' : '600 15px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText(amountStr, totalWidth / 2, 90);

    if (hasNote) {
      ctx.fillStyle = '#555568';
      ctx.font = '500 13px Inter, system-ui, -apple-system, sans-serif';
      let noteText = `📝 Note: ${currentData.note.trim()}`;
      if (ctx.measureText(noteText).width > totalWidth - 48) {
        while (noteText.length > 0 && ctx.measureText(noteText + '...').width > totalWidth - 48) {
          noteText = noteText.slice(0, -1);
        }
        noteText += '...';
      }
      ctx.fillText(noteText, totalWidth / 2, 118);
    }

    ctx.strokeStyle = '#e8e8ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, headerHeight);
    ctx.lineTo(totalWidth - padding, headerHeight);
    ctx.stroke();

    const qrX = (totalWidth - qrCanvas.width) / 2;
    const qrY = headerHeight + 15;
    ctx.drawImage(qrCanvas, qrX, qrY);

    const bottomDivY = qrY + qrCanvas.height + 15;
    ctx.beginPath();
    ctx.moveTo(padding, bottomDivY);
    ctx.lineTo(totalWidth - padding, bottomDivY);
    ctx.stroke();

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '700 15px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📲 Scan this QR code to pay', totalWidth / 2, bottomDivY + 26);

    const drawStep = (y, numberText, stepText) => {
      const circleX = padding + 10;
      ctx.fillStyle = themeCol;
      ctx.beginPath();
      ctx.arc(circleX, y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(numberText, circleX, y + 1);

      ctx.fillStyle = '#333344';
      ctx.font = '500 12.5px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stepText, circleX + 18, y + 1);
    };

    drawStep(bottomDivY + 58, '1', 'Open any UPI app (GPay, PhonePe, Paytm)');
    drawStep(bottomDivY + 88, '2', 'Tap Scan QR and scan this image');

    const subDivY = bottomDivY + 114;
    ctx.strokeStyle = '#f0f0f5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, subDivY);
    ctx.lineTo(totalWidth - padding, subDivY);
    ctx.stroke();

    ctx.fillStyle = themeCol;
    ctx.font = '700 13px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📱 Received on WhatsApp?', totalWidth / 2, subDivY + 22);

    ctx.fillStyle = '#555568';
    ctx.font = '500 11.5px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('Long press image → Tap Share → Select your UPI app', totalWidth / 2, subDivY + 42);

    return canvas;
  };

  const downloadQR = () => {
    if (!currentQR) return;
    navigator.vibrate?.(30);

    const amount = currentData.amount || 'any';
    const compositeCanvas = getCompositeCanvas();

    if (compositeCanvas) {
      const link = document.createElement('a');
      link.download = `PayQR_${amount}.png`;
      link.href = compositeCanvas.toDataURL('image/png');
      link.click();
    } else {
      currentQR.download({ name: `PayQR_${amount}`, extension: 'png' });
    }

    downloadBtnText.textContent = '✓ Downloaded!';
    downloadBtn.classList.add('success');
    setTimeout(() => {
      downloadBtnText.textContent = 'Download QR Image';
      downloadBtn.classList.remove('success');
    }, 2000);
  };

  // ============================================
  // WhatsApp Sharing & Receipt Formatting
  // ============================================

  const shareWhatsApp = async () => {
    if (!currentQR) return;
    navigator.vibrate?.(30);

    const { name, upiId, amount, note, items } = currentData;
    const amountText = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'any amount';
    const noteText = note ? `\n📝 *Note:* ${note.trim()}` : '';

    // Build itemized breakdown receipt if items exist
    let itemsBlock = '';
    if (items && items.length > 0) {
      itemsBlock = `\n\n📋 *Itemized Bill Summary:*\n` +
        items.map(i => `• ${i.qty}x ${i.name} (@ ₹${i.price}) = ₹${i.qty * i.price}`).join('\n') +
        `\n-----------------------------\n*Grand Total: ₹${Number(amount || 0).toLocaleString('en-IN')}*`;
    }

    const shareText = `💰 Pay ${amountText} to ${name}${noteText}${itemsBlock}\n\n📲 *How to pay:*\nScan this QR code using any UPI app (GPay, PhonePe, Paytm)\n\n📱 *On WhatsApp:*\nLong press the QR image → Tap Share → Select your UPI app`;
    const compositeCanvas = getCompositeCanvas();

    try {
      if (compositeCanvas && navigator.canShare && navigator.share) {
        const blob = await new Promise(resolve => compositeCanvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Payment QR Code',
            text: shareText,
            files: [file]
          });
          return;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Web Share API fallback:', err);
    }

    if (compositeCanvas) {
      try {
        const blob = await new Promise(resolve => compositeCanvas.toBlob(resolve, 'image/png'));
        if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }
        const link = document.createElement('a');
        link.download = `PayQR_${amount || 'any'}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
      } catch (err) {
        console.warn('Clipboard/download fallback error:', err);
      }
    }

    const btnSpan = whatsappBtn.querySelector('span');
    const origText = btnSpan ? btnSpan.textContent : 'Share on WhatsApp';
    if (btnSpan) btnSpan.textContent = '✓ Image Copied! Just Paste in WhatsApp';
    whatsappBtn.classList.add('success');
    setTimeout(() => {
      if (btnSpan) btnSpan.textContent = origText;
      whatsappBtn.classList.remove('success');
    }, 4000);

    const fallbackMessage = `💰 Pay ${amountText} to ${name}\nUPI ID: ${upiId}${noteText}${itemsBlock}\n\n📲 *How to pay:*\nScan the QR code using any UPI app\n\n📱 *On WhatsApp:*\nLong press the QR image → Tap Share → Select your UPI app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fallbackMessage)}`, '_blank');
  };

  // ============================================
  // Recent Invoices Ledger Modal (with Sorting & Filtering)
  // ============================================

  let activeLedgerFilter = 'all';
  let activeLedgerSort = 'newest';

  const renderLedger = () => {
    if (!ledgerList) return;
    ledgerList.innerHTML = '';

    const filterText = (ledgerSearchInput ? ledgerSearchInput.value : '').toLowerCase().trim();
    let logs = [...(platformState.ledger || [])];
    const todayStr = new Date().toDateString();
    let todayVol = 0;
    let allTimeVol = 0;

    (platformState.ledger || []).forEach(log => {
      const amt = parseFloat(log.amount) || 0;
      allTimeVol += amt;
      if (new Date(log.timestamp).toDateString() === todayStr) {
        todayVol += amt;
      }
    });

    if (dailyRevenueText) dailyRevenueText.textContent = `₹${todayVol.toLocaleString('en-IN')}`;
    if (allTimeRevenueText) allTimeRevenueText.textContent = `₹${allTimeVol.toLocaleString('en-IN')}`;
    if (totalBillsCount) totalBillsCount.textContent = (platformState.ledger || []).length.toString();

    // Apply Quick Pill Filters
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const monthISO = todayISO.slice(0, 7);

    if (activeLedgerFilter === 'today') {
      logs = logs.filter(l => (l.date || new Date(l.timestamp).toISOString()).startsWith(todayISO));
    } else if (activeLedgerFilter === 'month') {
      logs = logs.filter(l => (l.date || new Date(l.timestamp).toISOString()).startsWith(monthISO));
    } else if (activeLedgerFilter === 'high-value') {
      logs = logs.filter(l => parseFloat(l.amount || 0) >= 500);
    }

    // Apply Text Search Filter
    if (filterText) {
      logs = logs.filter(l => {
        const matchNote = (l.note || '').toLowerCase().includes(filterText);
        const matchProf = (l.profileName || '').toLowerCase().includes(filterText);
        const matchAmt = (l.amount || '').toString().includes(filterText);
        const matchItems = (l.items || []).some(i => (i.name || '').toLowerCase().includes(filterText));
        return matchNote || matchProf || matchAmt || matchItems;
      });
    }

    // Apply Sort Ordering
    if (activeLedgerSort === 'oldest') {
      logs.reverse();
    } else if (activeLedgerSort === 'amount-desc') {
      logs.sort((a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0));
    } else if (activeLedgerSort === 'amount-asc') {
      logs.sort((a, b) => parseFloat(a.amount || 0) - parseFloat(b.amount || 0));
    }

    if (logs.length === 0) {
      if (ledgerEmptyState) ledgerEmptyState.classList.remove('hidden');
      return;
    }
    if (ledgerEmptyState) ledgerEmptyState.classList.add('hidden');

    logs.forEach(item => {
      const dt = new Date(item.timestamp);
      const timeFormatted = dt.toLocaleDateString('en-IN') + ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const itemsSummary = item.items && item.items.length > 0
        ? item.items.map(i => `${i.qty}x ${i.name} (@₹${i.price})`).join('; ')
        : 'Standard lump sum transaction';

      const li = document.createElement('li');
      li.className = 'ledger-item';
      li.innerHTML = `
        <div class="ledger-header-line">
          <span class="lh-time">${escapeHTML(timeFormatted)}</span>
          <span class="lh-prof">${escapeHTML(item.profileName || 'General')}</span>
        </div>
        <div class="ledger-body">
          <div class="lb-details">
            <p class="lb-note">${escapeHTML(item.note || 'No transaction note')}</p>
            <p class="lb-items">${escapeHTML(itemsSummary)}</p>
          </div>
          <div class="lb-amount">₹${Number(item.amount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="ledger-actions">
          <button type="button" class="btn-ledger-action btn-dup">🔄 Reopen & Duplicate</button>
          <button type="button" class="btn-ledger-action btn-del-log" style="color: var(--error);">🗑️ Delete</button>
        </div>
      `;

      // Reopen & Duplicate action
      li.querySelector('.btn-dup').addEventListener('click', () => {
        // Find profile and switch to it if exists
        if (item.profileId) {
          const matchedProf = platformState.profiles.find(p => p.id === item.profileId);
          if (matchedProf) {
            platformState.activeProfileId = matchedProf.id;
            applyActiveProfileToUI();
          }
        }

        amountInput.value = item.amount || '';
        noteInput.value = item.note || '';

        // Check if invoice had itemized entries
        if (item.items && item.items.length > 0) {
          itemizedSection.classList.remove('hidden');
          if (toggleItemizedBtn) toggleItemizedBtn.classList.add('active');
          if (toggleItemizedIcon) toggleItemizedIcon.textContent = '–';
          
          itemizedRows = item.items.map(i => ({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: i.name || '',
            qty: i.qty || 1,
            price: i.price || 0
          }));
          renderItemRows();
        } else {
          itemizedSection.classList.add('hidden');
          itemizedRows = [];
          renderItemRows();
          amountInput.readOnly = false;
          if (amountLockHint) amountLockHint.classList.add('hidden');
        }

        closeModal(ledgerModal);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigator.vibrate?.(40);
        showToast('🔄 Reopened past invoice ready for duplication!');
      });

      // Delete action
      li.querySelector('.btn-del-log').addEventListener('click', () => {
        platformState.ledger = platformState.ledger.filter(l => l.id !== item.id);
        savePlatformState();
        renderLedger(ledgerSearchInput ? ledgerSearchInput.value : '');
      });

      ledgerList.appendChild(li);
    });
  };

  if (btnOpenLedger) {
    btnOpenLedger.addEventListener('click', () => {
      if (ledgerSearchInput) ledgerSearchInput.value = '';
      renderLedger();
      openModal(ledgerModal);
    });
  }

  if (ledgerSearchInput) {
    ledgerSearchInput.addEventListener('input', () => renderLedger());
  }

  const ledgerSortSelect = document.getElementById('ledgerSortSelect');
  if (ledgerSortSelect) {
    ledgerSortSelect.addEventListener('change', (e) => {
      activeLedgerSort = e.target.value;
      renderLedger();
    });
  }

  document.querySelectorAll('.ledger-quick-filters .filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.ledger-quick-filters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeLedgerFilter = pill.getAttribute('data-filter') || 'all';
      renderLedger();
      if (navigator.vibrate) navigator.vibrate(5);
    });
  });

  if (btnClearAllLedger) {
    btnClearAllLedger.addEventListener('click', () => {
      if (confirm('Are you sure you want to completely erase your historical invoice ledger?')) {
        platformState.ledger = [];
        savePlatformState();
        renderLedger();
      }
    });
  }

  // ============================================
  // Data Portability (JSON Backup & CSV Export)
  // ============================================

  if (btnOpenBackup) {
    btnOpenBackup.addEventListener('click', () => openModal(backupModal));
  }

  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const jsonString = JSON.stringify(platformState, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PayQR_Studio_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Universal Workspace Backup Restoration Helper
  const handleWorkspaceRestore = (file, modalToClose) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const restoredState = normalizePlatformState(parsed);
        if (restoredState.profiles.length > 0) {
          platformState = restoredState;
          savePlatformState();
          applyActiveProfileToUI();
          showToast('✓ Workspace successfully restored from JSON backup!');
          if (modalToClose) closeModal(modalToClose);
        } else {
          alert('Invalid backup file format. Expected PayQR studio state JSON with valid profiles.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (btnUploadJson) {
    btnUploadJson.addEventListener('change', (e) => {
      handleWorkspaceRestore(e.target.files && e.target.files[0], backupModal);
      e.target.value = '';
    });
  }

  const onboardRestoreInput = document.getElementById('onboardRestoreInput');
  if (onboardRestoreInput) {
    onboardRestoreInput.addEventListener('change', (e) => {
      handleWorkspaceRestore(e.target.files && e.target.files[0], onboardingModal);
      e.target.value = '';
    });
  }

  const profRestoreInput = document.getElementById('profRestoreInput');
  if (profRestoreInput) {
    profRestoreInput.addEventListener('change', (e) => {
      handleWorkspaceRestore(e.target.files && e.target.files[0], profileManagerModal);
      e.target.value = '';
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const logs = platformState.ledger || [];
      if (logs.length === 0) {
        showToast('⚠ No invoices logged in the ledger yet.');
        return;
      }

      const csvCell = (value) => {
        let text = String(value ?? '');
        // Prevent spreadsheet applications from treating imported text as a formula.
        if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
      };

      const headers = ['Invoice ID', 'Date & Time', 'Profile Name', 'Payee Name', 'UPI ID', 'Note', 'Itemized Summary', 'Grand Total (INR)'];
      const rows = logs.map(entry => [
        csvCell(entry.id),
        csvCell(new Date(entry.timestamp).toLocaleString('en-IN')),
        csvCell(entry.profileName),
        csvCell(entry.payeeName),
        csvCell(entry.upiId),
        csvCell(entry.note),
        csvCell(entry.items?.length ? entry.items.map(i => `${i.qty}x ${i.name} (@₹${i.price})`).join('; ') : 'Lump Sum'),
        safeAmount(entry.amount)
      ]);

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PayQR_Accounting_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('📈 Accounting ledger CSV exported!');
    });
  }

  // ============================================
  // Event Listeners: Main Form & Inputs
  // ============================================

  if (qrForm) {
    qrForm.addEventListener('submit', (e) => {
      e.preventDefault();
      generateQR();
    });
  }

  if (whatsappBtn) whatsappBtn.addEventListener('click', shareWhatsApp);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadQR);

  nameInput.addEventListener('input', () => clearError('nameGroup'));
  upiInput.addEventListener('input', () => {
    clearError('upiGroup');
    const pos = upiInput.selectionStart;
    upiInput.value = upiInput.value.toLowerCase();
    upiInput.setSelectionRange(pos, pos);
  });
  amountInput.addEventListener('input', () => clearError('amountGroup'));
  amountInput.addEventListener('focus', function() {
    setTimeout(() => { this.select(); }, 10);
  });

  amountInput.addEventListener('keydown', (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  });

  [nameInput, upiInput, amountInput, noteInput].forEach(input => {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateQR();
      }
    });
  });

  // ============================================
  // Display Preferences (Theme Toggle & Font Scaling)
  // ============================================

  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const btnFontDec = document.getElementById('btnFontDec');
  const btnFontInc = document.getElementById('btnFontInc');
  const fontSizeIndicator = document.getElementById('fontSizeIndicator');

  const FONT_PRESETS = [
    { label: 'Small', size: '14px' },
    { label: 'Normal', size: '16px' },
    { label: 'Large', size: '18px' },
    { label: 'XL', size: '20px' }
  ];

  let currentFontIdx = 1; // Default to Normal (16px)
  let isDarkMode = localStorage.getItem('payqr_theme') === 'dark';
  const savedFontIdx = localStorage.getItem('payqr_font_idx');
  if (savedFontIdx !== null && !isNaN(savedFontIdx)) {
    currentFontIdx = Math.max(0, Math.min(FONT_PRESETS.length - 1, parseInt(savedFontIdx, 10)));
  }

  const updateThemeUI = () => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggleIcon) themeToggleIcon.textContent = '☀️ Light Theme';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggleIcon) themeToggleIcon.textContent = '🌙 Dark Theme';
    }
    localStorage.setItem('payqr_theme', isDarkMode ? 'dark' : 'light');
  };

  const updateFontUI = () => {
    const preset = FONT_PRESETS[currentFontIdx];
    document.documentElement.style.setProperty('--font-base-size', preset.size);
    if (fontSizeIndicator) fontSizeIndicator.textContent = preset.label;
    localStorage.setItem('payqr_font_idx', currentFontIdx.toString());
  };

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isDarkMode = !isDarkMode;
      updateThemeUI();
      if (navigator.vibrate) navigator.vibrate(5);
    });
  }

  if (btnFontDec) {
    btnFontDec.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentFontIdx > 0) {
        currentFontIdx--;
        updateFontUI();
        if (navigator.vibrate) navigator.vibrate(5);
      }
    });
  }

  if (btnFontInc) {
    btnFontInc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentFontIdx < FONT_PRESETS.length - 1) {
        currentFontIdx++;
        updateFontUI();
        if (navigator.vibrate) navigator.vibrate(5);
      }
    });
  }

  updateThemeUI();
  updateFontUI();

  // ============================================
  // Initialize Studio
  // ============================================

  loadPlatformState();
});
