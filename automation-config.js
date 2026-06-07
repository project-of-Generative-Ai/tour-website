/**
 * Replace placeholder URLs after creating Make.com Custom Webhooks.
 * Scenario 1: Tour bookings → Bookings_Master sheet
 * Scenario 2: Payment receipts → Google Drive + sheet update
 * Scenario 3 (optional): Lead inquiries → Leads_Inquiries sheet
 */
window.PRT_AUTOMATION = {
  // 1. Paste your "Message Webhook" URL here
  MAKE_WEBHOOK_BOOKING: 'https://hook.eu1.make.com/lwunyssbq49lq2qxv35fjg7a2cv9mx49',
  
  // 2. Paste the EXACT SAME "Message Webhook" URL here too
  MAKE_WEBHOOK_LEAD:    'https://hook.eu1.make.com/lwunyssbq49lq2qxv35fjg7a2cv9mx49',
  
  // 3. Paste your "PRT Scenario 2" URL here
  MAKE_WEBHOOK_PAYMENT: 'https://hook.eu1.make.com/lwunyssbq49lq2qxv35fjg7a2cv9mx49',
  
  MAX_RECEIPT_BYTES: 5 * 1024 * 1024 
};
ufhc2emwxbdoop5mcrqfoe031qvmwgqw