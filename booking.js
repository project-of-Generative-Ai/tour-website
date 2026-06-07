(function () {
  'use strict';

  const cfg = window.PRT_AUTOMATION || {};
  const MAX_RECEIPT_BYTES = cfg.MAX_RECEIPT_BYTES || 5 * 1024 * 1024;

  function generateBookingId() {
    return 'PKR-' + Math.floor(100000 + Math.random() * 900000);
  }

  function generateLeadId() {
    return 'LEAD-' + Math.floor(100000 + Math.random() * 900000);
  }

  /** Normalize 03xx / 923xx to +92... for Make/WhatsApp modules */
  function normalizePakistanPhone(input) {
    let digits = String(input).replace(/\D/g, '');
    if (digits.startsWith('92')) {
      return '+' + digits;
    }
    if (digits.startsWith('0')) {
      digits = '92' + digits.slice(1);
    } else {
      digits = '92' + digits;
    }
    return '+' + digits;
  }

  function isWebhookConfigured(url) {
    return url && !url.includes('your_') && !url.includes('your_actual');
  }

  function injectBookingModal() {
    if (document.getElementById('bookingModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'bookingModalOverlay';
    overlay.className = 'booking-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div id="bookingModal" class="booking-modal">
        <div class="booking-modal-header">
          <h3>Book Your Adventure</h3>
          <button type="button" class="booking-modal-close" aria-label="Close">&times;</button>
        </div>
        <form id="tourBookingForm" class="form-container">
          <input type="hidden" id="formTourName" value="">
          <div class="form-group">
            <label for="userName">Full Name *</label>
            <input type="text" id="userName" required placeholder="e.g., Ali Ahmed" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="userWhatsApp">WhatsApp Number *</label>
            <input type="tel" id="userWhatsApp" required placeholder="e.g., 03001234567" pattern="[0-9+\\s-]{10,15}" inputmode="numeric" autocomplete="tel">
          </div>
          <div class="form-group">
            <label for="userEmail">Email Address *</label>
            <input type="email" id="userEmail" required placeholder="name@email.com" autocomplete="email">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="departureCity">Departure From *</label>
              <select id="departureCity" required>
                <option value="" disabled selected>Select City</option>
                <option value="Islamabad">Islamabad (Centaurus/Daewoo Terminal)</option>
                <option value="Lahore">Lahore (Thokar Niaz Baig)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="departureDate">Select Date *</label>
              <input type="date" id="departureDate" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="seatCount">Seats Required *</label>
              <input type="number" id="seatCount" min="1" max="20" value="1" required>
            </div>
            <div class="form-group">
              <label for="roomSharing">Room Category *</label>
              <select id="roomSharing" required>
                <option value="Quad Sharing">Quad Sharing (Standard Price)</option>
                <option value="Twin Sharing">Twin Sharing (Couples - Addon Fee)</option>
              </select>
            </div>
          </div>
          <button type="submit" id="submitBtn" class="btn-submit">Secure My Seat</button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.booking-modal-close').addEventListener('click', closeBookingModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeBookingModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBookingModal();
    });
  }

  function openBookingModal(tourName) {
    injectBookingModal();
    const overlay = document.getElementById('bookingModalOverlay');
    const tourInput = document.getElementById('formTourName');
    if (tourInput) tourInput.value = tourName || 'Pakistan Road Trip Package';
    const dateInput = document.getElementById('departureDate');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
    }
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('userName')?.focus();
  }

  function closeBookingModal() {
    const overlay = document.getElementById('bookingModalOverlay');
    if (overlay) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  window.openBookingModal = openBookingModal;
  window.closeBookingModal = closeBookingModal;

  function initBookNowDelegation() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.btn-book-now, [data-open-booking]');
      if (!trigger) return;
      e.preventDefault();
      const tourName =
        trigger.getAttribute('data-tour-name') ||
        trigger.dataset.tourName ||
        document.querySelector('.dest-hero h1')?.textContent?.replace(/\s*\|.*/, '').trim() ||
        'Pakistan Road Trip Package';
      openBookingModal(tourName);
    });
  }

  function initTourBookingForm() {
    const form = document.getElementById('tourBookingForm');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = document.getElementById('submitBtn');
      const originalButtonText = submitButton.innerText;

      submitButton.innerText = 'Processing Reservation...';
      submitButton.disabled = true;

      const bookingPayload = {
        bookingId: generateBookingId(),
        tourName: document.getElementById('formTourName').value,
        name: document.getElementById('userName').value.trim(),
        to: normalizePakistanPhone(document.getElementById('userWhatsApp').value),
        email: document.getElementById('userEmail').value.trim(),
        city: document.getElementById('departureCity').value,
        date: document.getElementById('departureDate').value,
        seats: parseInt(document.getElementById('seatCount').value, 10),
        room: document.getElementById('roomSharing').value,
        status: 'Pending',
        timestamp: new Date().toISOString()
      };

      const makeWebhookUrl = cfg.MAKE_WEBHOOK_BOOKING;

      if (!isWebhookConfigured(makeWebhookUrl)) {
        alert(
          'Booking saved locally for testing. Add your Make.com booking webhook URL in automation-config.js.\n\nYour Booking ID: ' +
            bookingPayload.bookingId +
            '\nYou will receive a confirmation email with payment instructions once the booking is confirmed.'
        );
        console.log('Booking payload (configure webhook):', bookingPayload);
        form.reset();
        closeBookingModal();
        submitButton.innerText = originalButtonText;
        submitButton.disabled = false;
        return;
      }

      try {
        const response = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });

        if (response.ok) {
          alert(
            'Booking request received! Your Booking ID is ' +
              bookingPayload.bookingId +
              '. You will receive a confirmation email with payment instructions shortly.'
          );
          form.reset();
          closeBookingModal();
        } else {
          throw new Error('Network response was not stable');
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert(
          'System error. Please try again or message our support team on WhatsApp directly.'
        );
      } finally {
        submitButton.innerText = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }

  function initLeadInquiryForm() {
    const form = document.getElementById('leadInquiryForm');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.innerText;
      btn.disabled = true;
      btn.innerText = 'Sending...';

      const payload = {
        leadId: generateLeadId(),
        source: 'Website Form',
        customerName: form.querySelector('#leadName').value.trim(),
        to: normalizePakistanPhone(form.querySelector('#leadWhatsApp').value),
        email: (form.querySelector('#leadEmail')?.value || '').trim(),
        destination: form.querySelector('#leadDestination').value,
        preferredMonth: form.querySelector('#leadMonth').value,
        status: 'New',
        timestamp: new Date().toISOString()
      };

      const url = cfg.MAKE_WEBHOOK_LEAD;

      if (!isWebhookConfigured(url)) {
        alert('Thank you! We will contact you soon. (Configure MAKE_WEBHOOK_LEAD in automation-config.js for automation.)');
        console.log('Lead payload:', payload);
        form.reset();
        btn.disabled = false;
        btn.innerText = originalText;
        return;
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('Thank you! Our team will reach out on WhatsApp shortly.');
          form.reset();
        } else {
          throw new Error('Lead submission failed');
        }
      } catch (err) {
        console.error(err);
        alert('Could not send your inquiry. Please WhatsApp us directly.');
      } finally {
        btn.disabled = false;
        btn.innerText = originalText;
      }
    });
  }

  function initPaymentUploadForm() {
    const form = document.getElementById('paymentUploadForm');
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const bookingId = document.getElementById('payBookingId').value.trim();
      const fileInput = document.getElementById('receiptFile');
      const file = fileInput?.files?.[0];
      const submitBtn = document.getElementById('paySubmitBtn');

      if (!file) {
        alert('Please select a receipt file.');
        return;
      }

      if (file.size > MAX_RECEIPT_BYTES) {
        alert('File is too large. Please use an image under 5 MB.');
        return;
      }

      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Uploading...';

      const reader = new FileReader();
      reader.onloadend = async function () {
        const base64Data = reader.result.split(',')[1];
        const payload = {
          bookingId: bookingId,
          fileName: file.name,
          fileMimeType: file.type,
          fileData: base64Data,
          timestamp: new Date().toISOString()
        };

        const url = cfg.MAKE_WEBHOOK_PAYMENT;

        if (!isWebhookConfigured(url)) {
          alert(
            'Receipt captured for testing. Configure MAKE_WEBHOOK_PAYMENT in automation-config.js.\nBooking ID: ' +
              bookingId
          );
          console.log('Payment payload (file truncated in log):', {
            ...payload,
            fileData: '[base64 ' + base64Data.length + ' chars]'
          });
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
          return;
        }

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            alert(
              'Receipt submitted successfully! Your booking status will update upon financial clearance.'
            );
            form.reset();
          } else {
            throw new Error('Upload failed');
          }
        } catch (err) {
          console.error(err);
          alert('Upload failed. Please try again or contact support on WhatsApp.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      };

      reader.readAsDataURL(file);
    });

    const fileInput = document.getElementById('receiptFile');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        const f = this.files[0];
        if (f && f.size > MAX_RECEIPT_BYTES) {
          alert('File exceeds 5 MB. Please choose a smaller screenshot.');
          this.value = '';
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectBookingModal();
    initBookNowDelegation();
    initTourBookingForm();
    initLeadInquiryForm();
    initPaymentUploadForm();
  });
})();
