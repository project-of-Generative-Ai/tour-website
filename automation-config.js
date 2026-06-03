/**
 * Replace placeholder URLs after creating Make.com Custom Webhooks.
 * Scenario 1: Tour bookings → Bookings_Master sheet
 * Scenario 2: Payment receipts → Google Drive + sheet update
 * Scenario 3 (optional): Lead inquiries → Leads_Inquiries sheet
 */
window.PRT_AUTOMATION = {
  MAKE_WEBHOOK_BOOKING: 'https://hook.us1.make.com/your_actual_webhook_id_here',
  MAKE_WEBHOOK_LEAD: 'https://hook.us1.make.com/your_lead_webhook_id_here',
  MAKE_WEBHOOK_PAYMENT: 'https://hook.us1.make.com/your_payment_webhook_id_here',
  MAX_RECEIPT_BYTES: 5 * 1024 * 1024
};
