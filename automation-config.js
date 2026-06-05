/**
 * Replace placeholder URLs after creating Make.com Custom Webhooks.
 * Scenario 1: Tour bookings → Bookings_Master sheet
 * Scenario 2: Payment receipts → Google Drive + sheet update
 * Scenario 3 (optional): Lead inquiries → Leads_Inquiries sheet
 */
window.PRT_AUTOMATION = {
  // 1. Paste your "Message Webhook" URL here
  MAKE_WEBHOOK_BOOKING: 'https://hook.eu1.make.com/pk74ncrw2ox5rfcx72559f77gcoyg1yy',
  
  // 2. Paste the EXACT SAME "Message Webhook" URL here too
  MAKE_WEBHOOK_LEAD:    'https://hook.eu1.make.com/pk74ncrw2ox5rfcx72559f77gcoyg1yy',
  
  // 3. Paste your "PRT Scenario 2" URL here
  MAKE_WEBHOOK_PAYMENT: 'https://hook.eu1.make.com/ydse3mfbk62ip4yimsrl1lkkwni4cx86',
  
  MAX_RECEIPT_BYTES: 5 * 1024 * 1024 
};
