const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app        = express();
const PORT       = 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.static(__dirname));   // serves index.html, style.css, script.js

// ── Initialise orders file if missing ──────────────────────
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

// ── Helpers ─────────────────────────────────────────────────
function sanitize(str) {
  return String(str).replace(/[<>"']/g, '').trim();
}

function readOrders() {
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// ── POST /api/order — place a new order ─────────────────────
app.post('/api/order', (req, res) => {
  const { name, phone, address, items, total } = req.body;

  if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const order = {
    id:        Date.now(),
    name:      sanitize(name),
    phone:     sanitize(phone),
    address:   sanitize(address),
    items:     items.map(i => ({
      name:  sanitize(i.name),
      price: Number(i.price),
      qty:   Number(i.qty)
    })),
    total:     Number(total),
    status:    'Pending',
    createdAt: new Date().toISOString()
  };

  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);

  console.log('\n✅ New Order Received');
  console.log(`   ID       : ${order.id}`);
  console.log(`   Customer : ${order.name}`);
  console.log(`   Phone    : ${order.phone}`);
  console.log(`   Address  : ${order.address}`);
  console.log(`   Items    : ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}`);
  console.log(`   Total    : PKR ${order.total}`);

  res.json({ success: true, message: 'Order placed!', orderId: order.id });
});

// ── GET /api/orders — view all orders ───────────────────────
app.get('/api/orders', (req, res) => {
  res.json(readOrders());
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍴  TastyBite server running  →  http://localhost:${PORT}`);
  console.log(`📋  All orders               →  http://localhost:${PORT}/api/orders\n`);
});
