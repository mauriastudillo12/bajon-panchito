/* ═══════════════════════════════════════
   El Bajón de Panchito — JavaScript
   ═══════════════════════════════════════ */

let cart = [];
let isDelivery = false;

/* ── SEGURIDAD / VALIDACIÓN ── */
function sanitize(str) {
  return str.replace(/[<>]/g, '').trim();
}

function validatePhone(str) {
  if (!str) return true;
  return /^[0-9\s\-\+]{8,}$/.test(str);
}

function showFormError(msg) {
  const el = document.getElementById('formError');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function showSuccessToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = [
    'position:fixed','bottom:24px','left:50%','transform:translateX(-50%)',
    'z-index:9999','background:#22a35a','color:#fff','border-radius:8px',
    'padding:12px 22px','font-family:Inter,sans-serif','font-size:13px',
    'font-weight:600','box-shadow:0 4px 20px rgba(0,0,0,.2)',
    'animation:toastIn .25s ease forwards','white-space:nowrap'
  ].join(';');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => t.remove(), 250);
  }, 2800);
}

/* ── DELIVERY TOGGLE ── */
function toggleDelivery() {
  isDelivery = !isDelivery;
  const sw   = document.getElementById('deliverySwitch');
  const dot  = document.getElementById('deliverySwitchDot');
  const addr = document.getElementById('deliveryAddress');
  sw.style.background  = isDelivery ? '#C9A84C' : '#DDD';
  dot.style.transform  = isDelivery ? 'translateX(18px)' : 'translateX(0)';
  addr.style.display   = isDelivery ? 'flex' : 'none';
}

/* ── ADD TO CART ── */
function add(name, price, icon, categoria) {
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty++;
  else cart.push({ name, price, icon, categoria, qty: 1 });
  animateCartIcon();
  showAddedToast(name, icon);
  renderCart();
}

function animateCartIcon() {
  const btn = document.getElementById('cartNavBtn');
  if (!btn) return;
  btn.classList.remove('cart-pop');
  void btn.offsetWidth;
  btn.classList.add('cart-pop');
  btn.addEventListener('animationend', () => btn.classList.remove('cart-pop'), { once: true });
}

function showAddedToast(name, icon) {
  const t = document.createElement('div');
  t.style.cssText = [
    'position:fixed', 'top:68px', 'right:20px', 'z-index:9999',
    'background:#fff', 'border:1px solid #E8E5E0', 'border-radius:8px',
    'padding:10px 14px', 'display:flex', 'align-items:center', 'gap:10px',
    'font-family:Inter,sans-serif', 'font-size:12px', 'font-weight:500',
    'box-shadow:0 4px 20px rgba(0,0,0,.12)',
    'animation:toastIn .25s ease forwards',
    'max-width:240px'
  ].join(';');
  t.innerHTML = `<span style="font-size:18px">${icon}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span><span style="color:#22a35a;font-size:15px;font-weight:700;">✓</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => t.remove(), 250);
  }, 1800);
}

/* ── DRAWER ── */
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('cart-open');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
  document.body.style.overflow = '';
  document.body.classList.remove('cart-open');
  setTimeout(backToCart, 350);
}

/* ── RENDER CART ── */
function renderCart() {
  const n = cart.reduce((a, i) => a + i.qty, 0);
  const ccEl = document.getElementById('cc');
  ccEl.textContent = n;
  ccEl.style.display = n > 0 ? 'flex' : 'none';
  document.getElementById('drawerCount').textContent = n;

  const empty  = document.getElementById('drawerEmpty');
  const items  = document.getElementById('drawerItems');
  const footer = document.getElementById('drawerFooter');

  if (!cart.length) {
    empty.style.display  = 'flex';
    items.style.display  = 'none';
    footer.style.display = 'none';
    return;
  }

  empty.style.display  = 'none';
  items.style.display  = 'block';
  footer.style.display = 'block';

  const sub = cart.reduce((a, i) => a + i.price * i.qty, 0);
  document.getElementById('dSub').textContent   = '$' + sub.toLocaleString('es-CL');
  document.getElementById('dTotal').textContent = '$' + sub.toLocaleString('es-CL');

  items.innerHTML = cart.map(it => `
    <div class="cart-item">
      <div class="cart-item-img">${it.icon}</div>
      <div style="flex:1;min-width:0;">
        <div class="cart-item-name">${it.name}</div>
        ${it.categoria ? `<div style="font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:.5px;margin-top:1px">${it.categoria}</div>` : ''}
        <div class="cart-item-unit">$${it.price.toLocaleString('es-CL')} c/u</div>
        <div class="cart-item-ctrl">
          <button class="cqb" onclick="chg('${it.name}',-1)">−</button>
          <span class="cqn">${it.qty}</span>
          <button class="cqb" onclick="chg('${it.name}',1)">+</button>
        </div>
      </div>
      <div class="cart-item-total">$${(it.price * it.qty).toLocaleString('es-CL')}</div>
    </div>
  `).join('');
}

function chg(name, d) {
  const it = cart.find(i => i.name === name);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) cart = cart.filter(i => i.name !== name);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

/* ── CHECKOUT FLOW ── */
function checkout() {
  if (!cart.length) return;
  isDelivery = false;
  document.getElementById('deliveryAddress').style.display   = 'none';
  document.getElementById('deliverySwitch').style.background = '#DDD';
  document.getElementById('deliverySwitchDot').style.transform = 'translateX(0)';
  const summaryEl = document.getElementById('checkoutItems');
  if (summaryEl) {
    summaryEl.innerHTML = cart.map(it => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F5F2EE;">
        <span style="font-size:12.5px;color:#000;">${it.name} <span style="color:#999;">× ${it.qty}</span></span>
        <span style="font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:#C9A84C;">$${(it.price * it.qty).toLocaleString('es-CL')}</span>
      </div>
    `).join('');
  }
  // Sync char counter with any pre-filled content
  const commentEl = document.getElementById('clientComment');
  const countEl   = document.getElementById('commentCount');
  if (commentEl && countEl) countEl.textContent = commentEl.value.length + '/300';

  document.getElementById('cartMainView').style.display = 'none';
  document.getElementById('checkoutStep').style.display = 'flex';
}

function backToCart() {
  const main  = document.getElementById('cartMainView');
  const step2 = document.getElementById('checkoutStep');
  if (!main || !step2) return;
  main.style.display  = 'flex';
  step2.style.display = 'none';
}

async function confirmOrder() {
  // Rate limiting (sessionStorage resets on tab close; 30s cooldown)
  const lastTs = sessionStorage.getItem('lastOrderTs');
  if (lastTs && Date.now() - parseInt(lastTs) < 30000) {
    showFormError('Por favor espera unos segundos antes de enviar otro pedido.');
    return;
  }

  const rawNombre     = document.getElementById('clientName').value.trim();
  const rawTelefono   = document.getElementById('clientPhone').value.trim();
  const rawComment    = document.getElementById('clientComment').value.trim();
  const rawAddress    = isDelivery ? (document.getElementById('clientAddress')?.value.trim() || '') : '';
  const rawAddressRef = isDelivery ? (document.getElementById('clientAddressRef')?.value.trim() || '') : '';

  if (!rawNombre) {
    document.getElementById('clientName').style.borderColor = '#C9A84C';
    document.getElementById('clientName').focus();
    return;
  }
  document.getElementById('clientName').style.borderColor = '#E8E5E0';

  if (isDelivery && !rawAddress) {
    const addrEl = document.getElementById('clientAddress');
    if (addrEl) { addrEl.style.borderColor = '#C9A84C'; addrEl.focus(); }
    showFormError('Ingresa tu dirección de entrega.');
    return;
  }

  if (rawTelefono && !validatePhone(rawTelefono)) {
    document.getElementById('clientPhone').style.borderColor = '#C9A84C';
    document.getElementById('clientPhone').focus();
    showFormError('Teléfono inválido. Solo números, espacios, guiones o +.');
    return;
  }
  document.getElementById('clientPhone').style.borderColor = '#E8E5E0';

  const nombre   = sanitize(rawNombre).slice(0, 60);
  const telefono = sanitize(rawTelefono).slice(0, 20);
  const comment  = sanitize(rawComment).slice(0, 300);
  const address  = sanitize(rawAddress).slice(0, 150);
  const addressRef = sanitize(rawAddressRef).slice(0, 100);
  const total    = Math.round(cart.reduce((a, i) => a + i.price * i.qty, 0));

  const btn     = document.getElementById('confirmBtn');
  const btnText = document.getElementById('confirmBtnText');
  if (btn)     btn.disabled = true;
  if (btnText) btnText.textContent = 'Enviando…';

  const result = await insertPedido({
    cliente_nombre:     nombre,
    cliente_telefono:   telefono || null,
    items: cart.map(i => ({ nombre: i.name, cantidad: i.qty, precio: i.price, categoria: i.categoria || '' })),
    total,
    origen:             'web',
    comentario:         comment || null,
    es_delivery:        isDelivery,
    direccion_entrega:  address || null,
    referencia_entrega: addressRef || null,
  });

  if (!result.ok) {
    log('confirmOrder error:', result.error);
    if (btn)     btn.disabled = false;
    if (btnText) btnText.textContent = 'Confirmar pedido';
    showErrorToast('Hubo un problema al registrar tu pedido. Intenta de nuevo.');
    return;
  }

  log('Pedido guardado:', { cliente_nombre: nombre, total, items: cart.map(i => i.name + ' ×' + i.qty), origen: 'web', es_delivery: isDelivery });
  sessionStorage.setItem('lastOrderTs', Date.now().toString());

  // Snapshot delivery info and reset state before clearing
  const deliverySnap = isDelivery ? { address, addressRef } : null;
  isDelivery = false;
  const sw  = document.getElementById('deliverySwitch');
  const dot = document.getElementById('deliverySwitchDot');
  const da  = document.getElementById('deliveryAddress');
  if (sw)  sw.style.background = '#DDD';
  if (dot) dot.style.transform = 'translateX(0)';
  if (da)  da.style.display    = 'none';

  // Snapshot cart before clearing
  const orderItems = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }));
  if (btn)     btn.disabled = false;
  if (btnText) btnText.textContent = 'Confirmar pedido';

  clearCart();
  closeCart();
  // Wait for drawer close animation before showing modal
  setTimeout(() => showOrderModal(nombre, orderItems, total, comment, deliverySnap), 350);
}

/* ── ORDER CONFIRMATION MODAL ── */
function showOrderModal(nombre, items, total, comment, delivery = null) {
  const itemsHtml = items.map(i =>
    `<div class="order-modal-item">
      <span>${i.qty}× ${i.name}</span>
      <span class="order-modal-item-price">$${(i.price * i.qty).toLocaleString('es-CL')}</span>
    </div>`
  ).join('');

  const commentHtml = comment
    ? `<div style="font-size:11px;color:#999;margin-top:.6rem;font-style:italic;padding-top:.5rem;border-top:1px solid #E8E5E0;">📝 ${comment}</div>`
    : '';

  const deliveryHtml = delivery
    ? `<div style="font-size:11px;color:#555;margin-top:.6rem;padding-top:.5rem;border-top:1px solid #E8E5E0;">
        🛵 <strong>Delivery</strong><br>
        📍 ${delivery.address}${delivery.addressRef ? `<br><span style="color:#999">ℹ️ ${delivery.addressRef}</span>` : ''}
      </div>`
    : '';

  const overlay = document.createElement('div');
  overlay.id = 'orderModal';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-check">✓</div>
      <div class="order-modal-title">¡Pedido recibido!</div>
      <div class="order-modal-sub">Tu pedido ha sido registrado correctamente.<br>Nos pondremos en contacto contigo pronto.</div>
      <div class="order-modal-summary">
        <div class="order-modal-client">👤 ${nombre}</div>
        ${itemsHtml}
        ${commentHtml}
        ${deliveryHtml}
        <hr class="order-modal-divider">
        <div class="order-modal-total">
          <span>Total</span>
          <span class="order-modal-total-val">$${total.toLocaleString('es-CL')}</span>
        </div>
      </div>
      <button class="order-modal-close" onclick="closeOrderModal()">Cerrar</button>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target === overlay) closeOrderModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  const m = document.getElementById('orderModal');
  if (m) m.remove();
  document.body.style.overflow = '';
}

function showErrorToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = [
    'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
    'z-index:9999', 'background:#c0392b', 'color:#fff', 'border-radius:8px',
    'padding:12px 22px', 'font-family:Inter,sans-serif', 'font-size:13px',
    'font-weight:600', 'box-shadow:0 4px 20px rgba(0,0,0,.25)',
    'animation:toastIn .25s ease forwards', 'white-space:nowrap'
  ].join(';');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => t.remove(), 250);
  }, 3500);
}

/* ── TABS MENÚ ── */
const catIds = ['empanadas','pastel','vienesas','churrascos','lomitos','mechada','as','fajitas','papas','bebidas'];

function scrollTocat(id, btn) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  const el = document.getElementById('cat-' + id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - (54 + 45);
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/* ── SCROLL ANIMATIONS ── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.mitem, .cat-title, .promo-card, .about-item').forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });

  // Staggered delay for items within each category list
  document.querySelectorAll('.items-list').forEach(list => {
    Array.from(list.children).forEach((item, i) => {
      item.style.transitionDelay = `${(i % 4) * 0.05}s`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
  }, 1500);
});

// Scroll spy
window.addEventListener('scroll', () => {
  let current = catIds[0];
  for (const id of catIds) {
    const el = document.getElementById('cat-' + id);
    if (el && el.getBoundingClientRect().top < 140) current = id;
  }
  document.querySelectorAll('.mtab').forEach((t, i) => {
    t.classList.toggle('on', catIds[i] === current);
  });
});
