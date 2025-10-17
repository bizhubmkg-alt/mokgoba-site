// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- CONTACT INFO ---
const contact = {
  businessName: "Mokgoba Biz Hub",
  parentOrg: "Ithemba Lokwakha Group",
  phoneLocal: "0660627939",
  whatsappInternational: "27660627939",
  email: "bizhubmkg@gmail.com",
  address: "Mokgoba Biz Hub, Mokgoba Business Centre, Benoni, Gauteng, South Africa"
};

// --- LOAD SERVICES ---
const servicesPath = path.join(__dirname, 'data/services.json');
let services = [];
try {
  services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
} catch (err) {
  console.error('Error loading services.json:', err);
}

// --- API: GET SERVICES ---
app.get('/api/services', (req, res) => {
  res.json({ success: true, services });
});

// --- API: CONTACT INFO ---
app.get('/api/contact', (req, res) => {
  res.json({ success: true, contact });
});

// --- API: CREATE ORDER (with WhatsApp auto-link) ---
let orders = [];
app.post('/api/order', (req, res) => {
  const body = req.body || {};
  const order = {
    id: orders.length + 1,
    createdAt: new Date().toISOString(),
    customerName: body.customerName || 'Guest',
    customerPhone: body.customerPhone || null,
    serviceId: body.serviceId || null,
    serviceTitle: body.serviceTitle || null,
    notes: body.notes || null
  };
  orders.push(order);

  const message = encodeURIComponent(
    `🧾 *New Mokgoba Biz Hub Enquiry*` +
    `\n👤 Name: ${order.customerName}` +
    `\n📞 Phone: ${order.customerPhone}` +
    `\n🛠 Service: ${order.serviceTitle}` +
    `\n📝 Notes: ${order.notes || 'None'}`
  );

  const whatsappUrl = `https://wa.me/27660627939?text=${message}`;
  return res.json({ success: true, order, whatsappUrl });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

// --- SIMPLE CHATBOT ENDPOINT ---
app.post('/api/chat', (req, res) => {
  const { message } = req.body || {};
  const msg = (message || '').toLowerCase();

  // Load fresh data each time to reflect updates
  let servicesData = [];
  try {
    servicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
  } catch {
    servicesData = services;
  }

  let reply = "👋 Hello! I'm the Mokgoba Biz Hub Assistant. Ask me about prices for printing, internet, laminating, or design.";

  // Try to find matching item
  for (const category of servicesData) {
    for (const item of category.services) {
      const key = item.name.toLowerCase().split(' ')[0]; // rough keyword
      if (msg.includes(key)) {
        reply = `💬 ${item.name} costs ${item.price}.`;
        break;
      }
    }
    if (!reply.startsWith("👋")) break;
  }

  // Broader keyword matches
  if (msg.includes('internet')) reply = '💻 Internet café access: R6 (15 min), R11 (30 min), R20 (1 hour), or R80 full day.';
  if (msg.includes('print') || msg.includes('printing')) reply = '🖨 Printing ranges from R3–R4 for A4 B/W to R18–R25 for A3 colour.';
  if (msg.includes('laminating')) reply = '✨ Laminating A4 costs R10, A3 costs R25.';
  if (msg.includes('design')) reply = '🎨 Design packages start at R200 for social media to R700 for full branding.';
  if (msg.includes('scan')) reply = '📠 Scanning is R5 per A4 page.';
  if (msg.includes('cv') || msg.includes('typing')) reply = '⌨️ CV or document typing costs about R20 per page.';
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) reply = '👋 Hello there! Ask me about any Mokgoba Biz Hub service or price.';

  return res.json({ success: true, reply });
});

// --- FALLBACK: SERVE FRONTEND ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Mokgoba site running on port ${PORT}`);
});
