// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Contact & metadata
const contact = {
  businessName: "Mokgoba Biz Hub",
  parentOrg: "Ithemba Lokwakha Group",
  phoneLocal: "0660627939",
  whatsappInternational: "27660627939",
  email: "bizhubmkg@gmail.com",
  address: "Mokgoba Biz Hub, Mokgoba Business Centre, Benoni, Gauteng, South Africa"
};

// Load services data
const services = require('./data/services.json');

// --- API endpoints ---
app.get('/api/services', (req, res) => {
  res.json({ success: true, services });
});

app.get('/api/contact', (req, res) => {
  res.json({ success: true, contact });
});

// --- WhatsApp-connected Enquiry API ---
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

  // Build formatted WhatsApp message
  const message = encodeURIComponent(
    `🧾 *New Mokgoba Biz Hub Enquiry*` +
    `\n👤 Name: ${order.customerName}` +
    `\n📞 Phone: ${order.customerPhone}` +
    `\n🛠 Service: ${order.serviceTitle}` +
    `\n📝 Notes: ${order.notes || 'None'}`
  );

  // Direct WhatsApp link for owner notification
  const whatsappUrl = `https://wa.me/27660627939?text=${message}`;

  // Send response back to front-end
  return res.json({ success: true, order, whatsappUrl });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

// --- Fallback for SPA ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Mokgoba site running on port ${PORT}`);
});

