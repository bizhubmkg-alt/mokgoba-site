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

const services = require('./data/services.json');

// API endpoints
app.get('/api/services', (req, res) => {
  res.json({ success: true, services });
});
app.get('/api/contact', (req, res) => {
  res.json({ success: true, contact });
});

// In-memory orders for demo
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
  return res.json({ success: true, order });
});
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

// fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Mokgoba site running on port ${PORT}`);
});
