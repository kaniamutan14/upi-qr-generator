// ============================================
// PayQR — UPI QR Code Generator
// Main Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ---- DOM References ----
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
  const qrAmountText = document.getElementById('qrAmountText');
  const qrPayeeText = document.getElementById('qrPayeeText');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnText = document.getElementById('downloadBtnText');
  const saveProfileCheck = document.getElementById('saveProfileCheck');

  // ---- State ----
  let currentQR = null;
  let currentData = {};

  // ---- Constants ----
  const PROFILE_KEY = 'payqr_profile';
  const UPI_REGEX = /^[\w.\-]+@[\w.\-]+$/;

  // ============================================
  // Profile Management (localStorage)
  // ============================================

  const loadProfile = () => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile.name) nameInput.value = profile.name;
        if (profile.upiId) upiInput.value = profile.upiId;
        saveProfileCheck.checked = true;
      }
    } catch (e) {
      console.warn('Could not load profile:', e);
    }
  };

  const saveProfile = () => {
    if (saveProfileCheck.checked) {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
          name: nameInput.value.trim(),
          upiId: upiInput.value.trim()
        }));
      } catch (e) {
        console.warn('Could not save profile:', e);
      }
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  };

  // ============================================
  // Input Validation
  // ============================================

  const showError = (groupId, errorId, message) => {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    group.classList.add('error');
    error.textContent = message;
  };

  const clearError = (groupId) => {
    const group = document.getElementById(groupId);
    group.classList.remove('error');
  };

  const clearAllErrors = () => {
    document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error'));
  };

  const validate = () => {
    let isValid = true;
    clearAllErrors();

    // Name validation
    const name = nameInput.value.trim();
    if (!name) {
      showError('nameGroup', 'nameError', 'Please enter your name');
      isValid = false;
    } else if (name.length < 2) {
      showError('nameGroup', 'nameError', 'Name must be at least 2 characters');
      isValid = false;
    }

    // UPI ID validation
    const upiId = upiInput.value.trim().toLowerCase();
    if (!upiId) {
      showError('upiGroup', 'upiError', 'Please enter your UPI ID');
      isValid = false;
    } else if (!UPI_REGEX.test(upiId)) {
      showError('upiGroup', 'upiError', 'Enter a valid UPI ID (e.g. name@paytm)');
      isValid = false;
    }

    // Amount validation
    const amount = amountInput.value.trim();
    if (!amount) {
      showError('amountGroup', 'amountError', 'Please enter an amount');
      isValid = false;
    } else {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        showError('amountGroup', 'amountError', 'Enter a valid positive amount');
        isValid = false;
      } else if (num > 100000) {
        showError('amountGroup', 'amountError', 'Maximum amount is ₹1,00,000');
        isValid = false;
      }
    }

    return isValid;
  };

  // ============================================
  // QR Code Generation
  // ============================================

  const generateQR = () => {
    if (!validate()) return;

    // Haptic feedback
    navigator.vibrate?.(50);

    const name = nameInput.value.trim();
    const upiId = upiInput.value.trim().toLowerCase();
    const amount = amountInput.value.trim();
    const note = noteInput.value.trim();

    // Build UPI URL
    let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`;
    if (amount && parseFloat(amount) > 0) {
      upiUrl += `&am=${parseFloat(amount).toFixed(2)}`;
    }
    if (note) {
      upiUrl += `&tn=${encodeURIComponent(note)}`;
    }

    // Store current data
    currentData = { name, upiId, amount, note, upiUrl };

    // Loading state
    generateBtn.classList.add('loading');
    generateBtnText.textContent = 'Generating...';

    // Clear previous QR
    qrInner.innerHTML = '';

    // Create styled QR code
    currentQR = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'canvas',
      data: upiUrl,
      dotsOptions: {
        color: '#1a1a2e',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        color: '#00B86B',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#00B86B',
        type: 'dot'
      },
      qrOptions: {
        errorCorrectionLevel: 'M'
      }
    });

    // Append QR to inner container
    currentQR.append(qrInner);

    // Set name and UPI ID inside QR card
    qrNameLabel.textContent = name;
    qrUpiLabel.textContent = upiId;

    // Update display text
    qrAmountText.textContent = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Any Amount';
    qrPayeeText.textContent = `Pay to ${name}`;

    // Show QR section with animation
    setTimeout(() => {
      qrSection.classList.add('visible');

      // Smooth scroll to QR
      setTimeout(() => {
        qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      // Reset button state
      generateBtn.classList.remove('loading');
      generateBtn.classList.add('success');
      generateBtnText.textContent = '✓ Regenerate QR';

      setTimeout(() => {
        generateBtn.classList.remove('success');
      }, 2000);
    }, 300);

    // Save profile if checked
    saveProfile();

    // Hide keyboard on mobile
    document.activeElement?.blur();
  };

  // ============================================
  // Composite Canvas (QR + Name)
  // Creates an image with the QR code and name
  // text below it for download/share
  // ============================================

  const getCompositeCanvas = () => {
    const qrCanvas = qrInner.querySelector('canvas');
    if (!qrCanvas) return null;

    const name = currentData.name || 'Merchant Payment';
    const upiId = currentData.upiId || '';

    // Layout dimensions (logical pixels)
    const totalWidth = 360;
    const totalHeight = 560;
    const padding = 40;

    // Create 2x resolution canvas for sharp rendering on mobile screens
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // 1. Solid white background with subtle padding
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // 2. Top Header (Name and UPI ID above QR)
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '700 20px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, totalWidth / 2, 42);

    ctx.fillStyle = '#6b6b80';
    ctx.font = '500 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText(upiId, totalWidth / 2, 68);

    // Top Divider Line
    ctx.strokeStyle = '#e8e8ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, 88);
    ctx.lineTo(totalWidth - padding, 88);
    ctx.stroke();

    // 3. Center QR Code
    const qrX = (totalWidth - qrCanvas.width) / 2;
    ctx.drawImage(qrCanvas, qrX, 104);

    // Bottom Divider Line
    const bottomDivY = 104 + qrCanvas.height + 16; // 380
    ctx.beginPath();
    ctx.moveTo(padding, bottomDivY);
    ctx.lineTo(totalWidth - padding, bottomDivY);
    ctx.stroke();

    // 4. Bottom Instructions
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '700 15px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📲 Scan this QR code to pay', totalWidth / 2, bottomDivY + 26);

    // Helper to draw numbered step badges and text
    const drawStep = (y, numberText, stepText) => {
      const circleX = padding + 10;
      // Draw green circle badge
      ctx.fillStyle = '#00B86B';
      ctx.beginPath();
      ctx.arc(circleX, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw white number inside circle
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(numberText, circleX, y + 1);

      // Draw instruction text
      ctx.fillStyle = '#333344';
      ctx.font = '500 12.5px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stepText, circleX + 18, y + 1);
    };

    drawStep(bottomDivY + 58, '1', 'Open any UPI app (GPay, PhonePe, Paytm)');
    drawStep(bottomDivY + 88, '2', 'Tap Scan QR and scan this image');

    // Sub-divider for WhatsApp hint
    const subDivY = bottomDivY + 114;
    ctx.strokeStyle = '#f0f0f5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, subDivY);
    ctx.lineTo(totalWidth - padding, subDivY);
    ctx.stroke();

    // WhatsApp instructions at very bottom
    ctx.fillStyle = '#00965e';
    ctx.font = '700 13px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📱 Received on WhatsApp?', totalWidth / 2, subDivY + 22);

    ctx.fillStyle = '#555568';
    ctx.font = '500 11.5px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('Long press image → Tap Share → Select your UPI app', totalWidth / 2, subDivY + 42);

    return canvas;
  };

  // ============================================
  // Download QR
  // ============================================

  const downloadQR = () => {
    if (!currentQR) return;

    navigator.vibrate?.(30);

    const amount = currentData.amount || 'any';
    const compositeCanvas = getCompositeCanvas();

    if (compositeCanvas) {
      // Download the composite image (QR + name)
      const link = document.createElement('a');
      link.download = `PayQR_${amount}.png`;
      link.href = compositeCanvas.toDataURL('image/png');
      link.click();
    } else {
      // Fallback to library download
      currentQR.download({ name: `PayQR_${amount}`, extension: 'png' });
    }

    // Success feedback
    downloadBtnText.textContent = '✓ Downloaded!';
    downloadBtn.classList.add('success');

    setTimeout(() => {
      downloadBtnText.textContent = 'Download QR Image';
      downloadBtn.classList.remove('success');
    }, 2000);
  };

  // ============================================
  // WhatsApp Share
  // ============================================

  const shareWhatsApp = async () => {
    if (!currentQR) return;

    navigator.vibrate?.(30);

    const { name, upiId, amount } = currentData;
    const amountText = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'any amount';
    const shareText = `💰 Pay ${amountText} to ${name}\n\n📲 *How to pay:*\nScan this QR code using any UPI app (GPay, PhonePe, Paytm)\n\n📱 *On WhatsApp:*\nLong press the QR image → Tap Share → Select your UPI app`;

    try {
      // Try Web Share API with composite image (QR + name)
      const compositeCanvas = getCompositeCanvas();
      if (compositeCanvas) {
        const blob = await new Promise(resolve => compositeCanvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'Payment QR Code',
            text: shareText,
            files: [file]
          });
          return;
        }
      }
    } catch (err) {
      // User cancelled or share failed — fall through to WhatsApp URL
      if (err.name === 'AbortError') return;
      console.warn('Web Share failed:', err);
    }

    // Fallback: open WhatsApp with text (no image, user must send QR separately)
    const fallbackText = encodeURIComponent(
      `💰 Pay ${amountText} to ${name}\nUPI ID: ${upiId}\n\n📲 *How to pay:*\nScan the QR code using any UPI app\n\n📱 *On WhatsApp:*\nLong press the QR image → Tap Share → Select your UPI app`
    );
    window.open(`https://wa.me/?text=${fallbackText}`, '_blank');
  };

  // ============================================
  // Event Listeners
  // ============================================

  // Form submit
  qrForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateQR();
  });

  // Action buttons
  whatsappBtn.addEventListener('click', shareWhatsApp);
  downloadBtn.addEventListener('click', downloadQR);

  // Clear errors on input
  nameInput.addEventListener('input', () => clearError('nameGroup'));
  upiInput.addEventListener('input', () => {
    clearError('upiGroup');
    // Auto-lowercase UPI ID
    const pos = upiInput.selectionStart;
    upiInput.value = upiInput.value.toLowerCase();
    upiInput.setSelectionRange(pos, pos);
  });
  amountInput.addEventListener('input', () => clearError('amountGroup'));

  // Prevent negative amounts
  amountInput.addEventListener('keydown', (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  });

  // Enter key to submit from any input
  [nameInput, upiInput, amountInput, noteInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generateQR();
      }
    });
  });

  // ============================================
  // Initialize
  // ============================================

  loadProfile();
});
