/**
 * Paste into Botpress Studio → Execute Code card (after capture nodes).
 * Set MAKE_WEBHOOK_LEAD to the same URL as automation-config.js MAKE_WEBHOOK_LEAD
 * (or a dedicated lead-ingestion webhook).
 */
const payload = {
  leadId: 'LEAD-' + Math.floor(100000 + Math.random() * 900000),
  source: 'Botpress Chatbot',
  customerName: user.name,
  whatsappNumber: user.whatsapp,
  destination: user.destination,
  preferredMonth: user.preferredMonth || 'Not specified',
  status: 'New',
  timestamp: new Date().toISOString()
};

const webhookUrl = 'https://hook.eu1.make.com/wvessaykyxxxsxds356bnp31856tx7k0';

try {
  await axios.post(webhookUrl, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  workflow.status = 'Success';
} catch (error) {
  console.error('Failed to send data to Make.com:', error.message);
  workflow.status = 'Failed';
}
