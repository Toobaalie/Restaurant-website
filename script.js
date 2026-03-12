// ===== CART STATE =====
let cart = [];

// ===== ADD TO CART =====
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  showToast(`${name} added to cart!`);
}

// ===== UPDATE CART UI =====
function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><i class="fas fa-cart-shopping"></i><p>Your cart is empty</p></div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  let total = 0;

  container.innerHTML = cart.map((item, idx) => {
    const sub = item.price * item.qty;
    total += sub;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">PKR ${item.price.toLocaleString()} &times; ${item.qty} = <strong>PKR ${sub.toLocaleString()}</strong></div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">&#8722;</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          <button class="remove-btn" onclick="removeItem(${idx})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
  }).join('');

  document.getElementById('cartTotal').textContent = `PKR ${total.toLocaleString()}`;
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  updateCartUI();
}

// ===== CART SIDEBAR TOGGLE =====
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
}

// ===== OPEN ORDER MODAL =====
function openOrderModal() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  let total = 0;
  const rows = cart.map(item => {
    const sub = item.price * item.qty;
    total += sub;
    return `<div class="summary-item"><span>${item.name} &times; ${item.qty}</span><span>PKR ${sub.toLocaleString()}</span></div>`;
  }).join('');

  document.getElementById('orderSummary').innerHTML =
    rows + `<div class="summary-total"><span>Total</span><span>PKR ${total.toLocaleString()}</span></div>`;

  document.getElementById('modalBackdrop').classList.add('active');
  toggleCart();
}

function closeOrderModal() {
  document.getElementById('modalBackdrop').classList.remove('active');
}

// ===== SUBMIT ORDER (POST to backend) =====
async function submitOrder(event) {
  event.preventDefault();

  const name    = document.getElementById('custName').value.trim();
  const phone   = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const total   = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const payload = { name, phone, address, items: cart, total };

  const btn = event.target.querySelector('.btn-confirm');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      closeOrderModal();
      cart = [];
      updateCartUI();
      document.getElementById('orderForm').reset();
      showToast(`Order #${data.orderId} confirmed! We'll call you shortly.`);
    } else {
      showToast(data.message || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    showToast('Server not reachable. Run: node server.js');
  } finally {
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Order';
    btn.disabled = false;
  }
}

// ===== MENU TABS =====
function showTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== STICKY HEADER SHADOW =====
window.addEventListener('scroll', () => {
  const h = document.getElementById('mainHeader');
  h.style.boxShadow = window.scrollY > 20
    ? '0 2px 30px rgba(0,0,0,0.55)'
    : '0 2px 20px rgba(0,0,0,0.35)';
});
