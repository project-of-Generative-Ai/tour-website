/**
 * booking-modal.js  — Pakistan Road Trips
 * Shared booking form modal for all destination pages.
 * Injects CSS + HTML, auto-fills tour from page <h1>,
 * and POSTs to Make.com webhook.
 *
 * ── SETUP: Replace the URL below with your Make.com webhook URL ──
 */
const MAKE_BOOKING_WEBHOOK = 'YOUR_MAKE_WEBHOOK_URL';

(function () {

  /* ── 1. Inject CSS ──────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .bm-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.80);
      backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.35s ease;
    }
    .bm-overlay.active { opacity: 1; pointer-events: all; }

    .bm-modal {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.7);
      width: 100%; max-width: 540px;
      max-height: 92vh; overflow-y: auto;
      padding: 36px 36px 28px;
      position: relative;
      transform: translateY(30px) scale(0.97);
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
      font-family: 'Poppins', sans-serif;
    }
    .bm-overlay.active .bm-modal { transform: translateY(0) scale(1); }
    .bm-modal::-webkit-scrollbar { width: 5px; }
    .bm-modal::-webkit-scrollbar-track { background: transparent; }
    .bm-modal::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }

    .bm-close {
      position: absolute; top: 14px; right: 18px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 50%; width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #94a3b8; font-size: 1rem;
      transition: background 0.2s, color 0.2s; padding: 0;
    }
    .bm-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

    .bm-header { margin-bottom: 20px; }
    .bm-header h2 {
      font-size: 1.45rem; font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #10b981 100%);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; margin-bottom: 3px;
    }
    .bm-header p { color: #64748b; font-size: 0.82rem; margin: 0; }

    .bm-group { margin-bottom: 14px; }
    .bm-group label {
      display: block; font-size: 0.79rem; font-weight: 600;
      color: #cbd5e1; margin-bottom: 6px; letter-spacing: 0.3px;
    }
    .bm-wrap {
      display: flex; align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .bm-wrap:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
    .bm-icon { padding: 0 12px; color: #64748b; font-size: 1rem; flex-shrink: 0; }
    .bm-wrap input, .bm-wrap select {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 11px 14px 11px 0;
      color: #f8fafc; font-family: 'Poppins', sans-serif; font-size: 0.88rem;
    }
    .bm-wrap input::placeholder { color: #475569; }
    .bm-wrap select { cursor: pointer; }
    .bm-wrap select option { background: #0f172a; color: #f8fafc; }

    /* Phone row */
    .bm-phone {
      display: flex; align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .bm-phone:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
    .bm-prefix {
      display: flex; align-items: center; gap: 5px;
      padding: 11px 10px 11px 14px;
      border-right: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8; font-size: 0.82rem; font-weight: 600; white-space: nowrap;
    }
    .bm-phone input {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 11px 10px; color: #f8fafc;
      font-family: 'Poppins', sans-serif; font-size: 0.88rem;
    }
    .bm-phone input::placeholder { color: #475569; }
    .bm-wa { padding: 0 12px; font-size: 1.1rem; }

    /* 2-col grid */
    .bm-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* Notes */
    .bm-note { font-size: 0.68rem; color: #ef4444; margin-top: 4px; font-style: italic; display: block; }
    .bm-hint { font-size: 0.68rem; color: #64748b; margin-top: 4px; display: block; }

    /* Submit */
    .bm-submit {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none; border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.92rem; font-weight: 700; letter-spacing: 1px;
      cursor: pointer; margin-top: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(16,185,129,0.3);
    }
    .bm-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(16,185,129,0.45); }
    .bm-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Success */
    .bm-success { display: none; text-align: center; padding: 30px 10px; }
    .bm-success .bm-ok { font-size: 3.5rem; margin-bottom: 14px; }
    .bm-success h3 { font-size: 1.3rem; font-weight: 700; color: #10b981; margin-bottom: 10px; }
    .bm-success p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 8px; }
    .bm-success .bm-bid {
      display: inline-block; background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.3); border-radius: 8px;
      padding: 8px 20px; color: #10b981; font-weight: 700; font-size: 1.05rem;
      letter-spacing: 1px; margin: 8px 0 14px;
    }

    /* Book Now button on dest pages */
    .dest-cta .bm-trigger {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none;
      padding: 14px 36px; border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem; font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(16,185,129,0.35);
    }
    .dest-cta .bm-trigger:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(16,185,129,0.5); }

    @media (max-width: 540px) {
      .bm-modal { padding: 26px 18px 22px; }
      .bm-row2 { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  /* ── 2. Detect destination name from page <h1> ─────────────── */
  const h1 = document.querySelector('.dest-hero h1, section h1, h1');
  const destName = h1 ? h1.textContent.trim() : 'This Tour';

  const tourMap = {
    'Hunza Valley':        'Hunza Autumn Tour — 7 Days / Rs. 65,000',
    'Fairy Meadows':       'Fairy Meadows Adventure — 5 Days / Rs. 45,000',
    'Skardu Valley':       'Skardu Expedition — 8 Days / Rs. 85,000',
    'Swat Valley':         'Swat Summer Retreat — 4 Days / Rs. 35,000',
    'Neelum Valley':       'Neelum Valley Escapade — 5 Days / Rs. 42,000',
    'Naran Kaghan Valley': 'Naran Kaghan Classic — 3 Days / Rs. 25,000',
    'Naran Kaghan':        'Naran Kaghan Classic — 3 Days / Rs. 25,000',
  };
  const selectedTour = tourMap[destName] || destName;

  /* ── 3. Inject Modal HTML ───────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.className = 'bm-overlay';
  overlay.id = 'bmOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="bm-modal" id="booking-form">
      <button class="bm-close" id="bmClose" aria-label="Close">&#10005;</button>

      <div class="bm-header">
        <h2>📋 Booking Request</h2>
        <p>Fill out the form below to secure your seat.</p>
      </div>

      <form id="bmForm" novalidate>

        <!-- Hidden fields -->
        <input type="hidden" id="bm-tour-hidden" name="tourName">
        <input type="hidden" id="bm-booking-id" name="bookingId">

        <!-- Selected Tour -->
        <div class="bm-group">
          <label for="bm-tour">Selected Tour:</label>
          <div class="bm-wrap">
            <span class="bm-icon">🗺️</span>
            <select id="bm-tour" name="tourDisplay" required>
              <option value="" disabled>Choose your adventure...</option>
              <option value="Astore Valley">Astore Valley</option>
              <option value="Fairy Meadows Adventure — 5 Days / Rs. 45,000">Fairy Meadows Adventure — 5 Days / Rs. 45,000</option>
              <option value="Hunza Autumn Tour — 7 Days / Rs. 65,000">Hunza Autumn Tour — 7 Days / Rs. 65,000</option>
              <option value="K2 Base Camp Trek">K2 Base Camp Trek</option>
              <option value="Kumrat Valley">Kumrat Valley</option>
              <option value="Kalash Valley Chitral">Kalash Valley Chitral</option>
              <option value="Naran Kaghan Classic — 3 Days / Rs. 25,000">Naran Kaghan Classic — 3 Days / Rs. 25,000</option>
              <option value="Neelum Valley Escapade — 5 Days / Rs. 42,000">Neelum Valley Escapade — 5 Days / Rs. 42,000</option>
              <option value="Skardu Expedition — 8 Days / Rs. 85,000">Skardu Expedition — 8 Days / Rs. 85,000</option>
              <option value="Shogran Valley">Shogran Valley</option>
              <option value="Swat Summer Retreat — 4 Days / Rs. 35,000">Swat Summer Retreat — 4 Days / Rs. 35,000</option>
              <option value="Umbrella Waterfall Day Trip">Umbrella Waterfall Day Trip</option>
            </select>
          </div>
        </div>

        <!-- Full Name -->
        <div class="bm-group">
          <label for="bm-name">Full Name: *</label>
          <div class="bm-wrap">
            <span class="bm-icon">👤</span>
            <input type="text" id="bm-name" name="customerName" placeholder="e.g., Ali Ahmed" required>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="bm-group">
          <label for="bm-phone">WhatsApp Number: * <span style="color:#64748b;">(WhatsApp Preferred)</span></label>
          <div class="bm-phone">
            <div class="bm-prefix"><span>🇵🇰</span><span>+92 ▾</span></div>
            <input type="tel" id="bm-phone" name="whatsapp" placeholder="300 1234567" maxlength="11" required>
            <span class="bm-wa" title="WhatsApp">💬</span>
          </div>
          <span class="bm-hint">Enter without leading zero e.g. 300 1234567</span>
        </div>

        <!-- Email -->
        <div class="bm-group">
          <label for="bm-email">Email Address: *</label>
          <div class="bm-wrap">
            <span class="bm-icon">✉️</span>
            <input type="email" id="bm-email" name="email" placeholder="name@email.com" required>
          </div>
        </div>

        <!-- Departure City + Date -->
        <div class="bm-row2">
          <div class="bm-group">
            <label for="bm-city">Departure From: *</label>
            <div class="bm-wrap">
              <span class="bm-icon">🚌</span>
              <select id="bm-city" name="departureCity" required>
                <option value="" disabled selected>Select City</option>
                <option value="Islamabad">Islamabad (Centaurus / Daewoo)</option>
                <option value="Lahore">Lahore (Thokar Niaz Baig)</option>
              </select>
            </div>
          </div>
          <div class="bm-group">
            <label for="bm-date">Departure Date: *</label>
            <div class="bm-wrap">
              <span class="bm-icon">📅</span>
              <input type="date" id="bm-date" name="departureDate" required>
            </div>
          </div>
        </div>

        <!-- Seats + Room -->
        <div class="bm-row2">
          <div class="bm-group">
            <label for="bm-seats">Seats Required: *</label>
            <div class="bm-wrap">
              <span class="bm-icon">👥</span>
              <input type="number" id="bm-seats" name="seats" value="1" min="1" max="20" required>
            </div>
          </div>
          <div class="bm-group">
            <label for="bm-room">Room Category: *</label>
            <div class="bm-wrap">
              <span class="bm-icon">🛏️</span>
              <select id="bm-room" name="roomType" required>
                <option value="Quad Sharing">Quad Sharing (Standard)</option>
                <option value="Twin Sharing">Twin Sharing (Couples +addon)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- CNIC -->
        <div class="bm-group">
          <label for="bm-cnic">CNIC / Passport Number: *</label>
          <div class="bm-wrap">
            <span class="bm-icon">🪪</span>
            <input type="text" id="bm-cnic" name="cnic" placeholder="42101-1234567-1" required>
          </div>
          <span class="bm-note">*Required for hotel check-ins & security checkpoints (GB Region)*</span>
        </div>

        <button type="submit" class="bm-submit" id="bmSubmit">Secure My Seat</button>
      </form>

      <div class="bm-success" id="bmSuccess">
        <div class="bm-ok">🎉</div>
        <h3>Booking Request Received!</h3>
        <div class="bm-bid" id="bmBidDisplay"></div>
        <p>Screenshot your Booking ID above — you will need it for payment verification.</p>
        <p>Our team will contact you on <strong style="color:#10b981;">WhatsApp within 24 hours</strong> to confirm your seat and share bank details.</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── 4. Pre-select tour ─────────────────────────────────────── */
  const tourSelect = overlay.querySelector('#bm-tour');
  for (const opt of tourSelect.options) {
    if (opt.value === selectedTour || opt.value.startsWith(destName)) {
      opt.selected = true; break;
    }
  }

  /* Set min date */
  overlay.querySelector('#bm-date').min = new Date().toISOString().split('T')[0];

  /* ── 5. Open / Close helpers ────────────────────────────────── */
  function openModal(tourOverride) {
    if (tourOverride) {
      for (const opt of tourSelect.options) {
        if (opt.value === tourOverride) { opt.selected = true; break; }
      }
    }
    // Generate a fresh Booking ID every open
    const bid = 'PKR-' + Math.floor(100000 + Math.random() * 900000);
    overlay.querySelector('#bm-booking-id').value = bid;
    // Reset view
    overlay.querySelector('#bmForm').style.display = 'block';
    overlay.querySelector('#bmSuccess').style.display = 'none';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ── 6. Hook all Book Now triggers on the page ──────────────── */
  document.querySelectorAll('.dest-cta a, .bm-trigger, #dest-book-now-btn, .book-now-btn').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const tourOverride = this.getAttribute('data-tour') || null;
      openModal(tourOverride);
    });
  });

  overlay.querySelector('#bmClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── 7. Form submission → Make.com webhook ──────────────────── */
  const form      = overlay.querySelector('#bmForm');
  const success   = overlay.querySelector('#bmSuccess');
  const submitBtn = overlay.querySelector('#bmSubmit');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Reservation...';
    submitBtn.disabled = true;

    // Normalise WhatsApp: strip leading 0, prepend +92
    const rawPhone = overlay.querySelector('#bm-phone').value.trim().replace(/^0/, '');
    const whatsapp = '+92' + rawPhone;

    const bookingId = overlay.querySelector('#bm-booking-id').value;

    const payload = {
      bookingId,
      tourName:      tourSelect.value,
      customerName:  overlay.querySelector('#bm-name').value,
      whatsappNumber: whatsapp,
      email:         overlay.querySelector('#bm-email').value,
      departureCity: overlay.querySelector('#bm-city').value,
      departureDate: overlay.querySelector('#bm-date').value,
      seats:         parseInt(overlay.querySelector('#bm-seats').value, 10),
      roomType:      overlay.querySelector('#bm-room').value,
      cnic:          overlay.querySelector('#bm-cnic').value,
      timestamp:     new Date().toISOString()
    };

    try {
      if (MAKE_BOOKING_WEBHOOK && MAKE_BOOKING_WEBHOOK !== 'YOUR_MAKE_WEBHOOK_URL') {
        const res = await fetch(MAKE_BOOKING_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Network error');
      }
      // Show success
      overlay.querySelector('#bmBidDisplay').textContent = bookingId;
      form.style.display = 'none';
      success.style.display = 'block';
      form.reset();
    } catch (err) {
      console.error('Booking submission error:', err);
      alert('⚠️ System error. Please try again or contact us directly on WhatsApp: 03199819952');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

})();
