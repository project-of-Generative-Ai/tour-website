/**
 * booking-modal.js
 * Shared booking form modal for all destination pages.
 * Injects CSS + HTML, auto-fills the tour name from the page <h1>.
 */
(function () {
  /* ── 1. Inject CSS ──────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .bm-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.78);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
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
      width: 100%; max-width: 520px;
      max-height: 90vh; overflow-y: auto;
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
      cursor: pointer; color: #94a3b8; font-size: 1.1rem;
      transition: background 0.2s, color 0.2s; padding: 0;
    }
    .bm-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; border-color: rgba(239,68,68,0.3); }

    .bm-header { margin-bottom: 22px; }
    .bm-header h2 {
      font-size: 1.45rem; font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #10b981 100%);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; margin-bottom: 3px;
    }
    .bm-header p { color: #64748b; font-size: 0.83rem; margin: 0; }

    .bm-group { margin-bottom: 16px; }
    .bm-group label {
      display: block; font-size: 0.8rem; font-weight: 600;
      color: #cbd5e1; margin-bottom: 6px; letter-spacing: 0.3px;
    }
    .bm-wrap {
      display: flex; align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .bm-wrap:focus-within {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.18);
    }
    .bm-icon { padding: 0 12px; color: #64748b; font-size: 1rem; flex-shrink: 0; }
    .bm-wrap input,
    .bm-wrap select {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 12px 14px 12px 0;
      color: #f8fafc; font-family: 'Poppins', sans-serif; font-size: 0.9rem;
    }
    .bm-wrap input::placeholder { color: #475569; }
    .bm-wrap select option { background: #0f172a; color: #f8fafc; }

    /* Phone */
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
      padding: 12px 10px 12px 14px;
      border-right: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8; font-size: 0.85rem; font-weight: 600; white-space: nowrap;
    }
    .bm-phone input {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 12px 10px; color: #f8fafc;
      font-family: 'Poppins', sans-serif; font-size: 0.9rem;
    }
    .bm-phone input::placeholder { color: #475569; }
    .bm-wa { padding: 0 12px; font-size: 1.15rem; }

    /* Two columns */
    .bm-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
    .bm-note { font-size: 0.7rem; color: #ef4444; margin-top: 4px; font-style: italic; display: block; }

    /* Submit */
    .bm-submit {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none; border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.92rem; font-weight: 700; letter-spacing: 1px;
      cursor: pointer; margin-top: 10px;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
      box-shadow: 0 6px 20px rgba(16,185,129,0.3);
    }
    .bm-submit:hover { background: linear-gradient(135deg,#059669,#047857); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(16,185,129,0.45); }
    .bm-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* Success */
    .bm-success { display: none; text-align: center; padding: 30px 10px; }
    .bm-success .bm-ok { font-size: 3.5rem; margin-bottom: 14px; }
    .bm-success h3 { font-size: 1.35rem; font-weight: 700; color: #10b981; margin-bottom: 10px; }
    .bm-success p { color: #94a3b8; font-size: 0.92rem; line-height: 1.6; }

    /* Dest Book Now CTA button override */
    .dest-cta .bm-trigger {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff; border: none;
      padding: 14px 36px; border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem; font-weight: 700; letter-spacing: 0.5px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 6px 20px rgba(16,185,129,0.35);
      text-decoration: none;
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

  /* Map destination page names → package dropdown values */
  const tourMap = {
    'Hunza Valley':           'Hunza Autumn Tour',
    'Fairy Meadows':          'Fairy Meadows Adventure',
    'Skardu Valley':          'Skardu Expedition',
    'Swat Valley':            'Swat Summer Retreat',
    'Neelum Valley':          'Neelum Valley Escapade',
    'Naran Kaghan Valley':    'Naran Kaghan Classic',
    'Naran Kaghan':           'Naran Kaghan Classic',
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
        <p>Fill out the form below to secure your spot.</p>
      </div>

      <form id="bmForm" novalidate>

        <!-- Selected Tour -->
        <div class="bm-group">
          <label for="bm-tour">Selected Tour:</label>
          <div class="bm-wrap">
            <span class="bm-icon">🗺️</span>
            <select id="bm-tour" name="tour" required>
              <option value="" disabled>Choose your adventure...</option>
              <option value="Astore Valley">Astore Valley</option>
              <option value="Fairy Meadows Adventure">Fairy Meadows Adventure — 5 Days / Rs. 45,000</option>
              <option value="Hunza Autumn Tour">Hunza Autumn Tour — 7 Days / Rs. 65,000</option>
              <option value="K2 Base Camp Trek">K2 Base Camp Trek</option>
              <option value="Kumrat Valley">Kumrat Valley</option>
              <option value="Kalash Valley Chitral">Kalash Valley Chitral</option>
              <option value="Naran Kaghan Classic">Naran Kaghan Classic — 3 Days / Rs. 25,000</option>
              <option value="Neelum Valley Escapade">Neelum Valley Escapade — 5 Days / Rs. 42,000</option>
              <option value="Skardu Expedition">Skardu Expedition — 8 Days / Rs. 85,000</option>
              <option value="Shogran Valley">Shogran Valley</option>
              <option value="Swat Summer Retreat">Swat Summer Retreat — 4 Days / Rs. 35,000</option>
              <option value="Umbrella Waterfall Day Trip">Umbrella Waterfall Day Trip</option>
            </select>
          </div>
        </div>

        <!-- Full Name -->
        <div class="bm-group">
          <label for="bm-name">Full Name:</label>
          <div class="bm-wrap">
            <span class="bm-icon">👤</span>
            <input type="text" id="bm-name" name="fullName" placeholder="Ali Khan" required>
          </div>
        </div>

        <!-- Contact Number -->
        <div class="bm-group">
          <label for="bm-phone">Contact Number <span style="color:#64748b;">(WhatsApp Preferred):</span></label>
          <div class="bm-phone">
            <div class="bm-prefix"><span>🇵🇰</span><span>+92 ▾</span></div>
            <input type="tel" id="bm-phone" name="phone" placeholder="300 1234567" maxlength="11" required>
            <span class="bm-wa" title="WhatsApp preferred">💬</span>
          </div>
        </div>

        <!-- Email -->
        <div class="bm-group">
          <label for="bm-email">Email Address:</label>
          <div class="bm-wrap">
            <span class="bm-icon">✉️</span>
            <input type="email" id="bm-email" name="email" placeholder="ali.khan@email.com" required>
          </div>
        </div>

        <!-- Travelers + CNIC -->
        <div class="bm-row2">
          <div class="bm-group">
            <label for="bm-travelers">Number of Travelers:</label>
            <div class="bm-wrap">
              <span class="bm-icon">👥</span>
              <input type="number" id="bm-travelers" name="travelers" placeholder="2" min="1" max="30" required>
            </div>
          </div>
          <div class="bm-group">
            <label for="bm-cnic">CNIC / Passport Number:</label>
            <div class="bm-wrap">
              <span class="bm-icon">🪪</span>
              <input type="text" id="bm-cnic" name="cnic" placeholder="42101-1234567-1" required>
            </div>
            <span class="bm-note">*Crucial for hotel check-ins &amp; security checkpoints (GB Region)*</span>
          </div>
        </div>

        <!-- Departure Date -->
        <div class="bm-group">
          <label for="bm-date">Preferred Departure Date:</label>
          <div class="bm-wrap">
            <span class="bm-icon">📅</span>
            <input type="date" id="bm-date" name="departureDate" required>
          </div>
        </div>

        <button type="submit" class="bm-submit" id="bmSubmit">SEND BOOKING REQUEST</button>
      </form>

      <div class="bm-success" id="bmSuccess">
        <div class="bm-ok">✅</div>
        <h3>Booking Request Sent!</h3>
        <p>Thank you! Our team will contact you on WhatsApp within 24 hours to confirm your tour details.</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── 4. Pre-select tour ─────────────────────────────────────── */
  const tourSelect = overlay.querySelector('#bm-tour');
  // Try exact match first, then partial
  let matched = false;
  for (const opt of tourSelect.options) {
    if (opt.value === selectedTour) { opt.selected = true; matched = true; break; }
  }
  if (!matched) {
    for (const opt of tourSelect.options) {
      if (opt.value.toLowerCase().includes(destName.toLowerCase()) ||
          destName.toLowerCase().includes(opt.value.toLowerCase())) {
        opt.selected = true; break;
      }
    }
  }

  /* Set min date */
  const dateInput = overlay.querySelector('#bm-date');
  dateInput.min = new Date().toISOString().split('T')[0];

  /* ── 5. Wire up all "Book Now" buttons on the page ──────────── */
  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Convert existing anchor links + add trigger class to any .bm-trigger buttons
  document.querySelectorAll('.dest-cta a, .bm-trigger, #dest-book-now-btn').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  overlay.querySelector('#bmClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── 6. Form submission ─────────────────────────────────────── */
  const form    = overlay.querySelector('#bmForm');
  const success = overlay.querySelector('#bmSuccess');
  const submitBtn = overlay.querySelector('#bmSubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
      submitBtn.textContent = 'SEND BOOKING REQUEST';
      submitBtn.disabled = false;
      form.reset();
    }, 1200);
  });

})();
