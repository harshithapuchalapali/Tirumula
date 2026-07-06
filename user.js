const sb = window.supabase.createClient(
  'https://wwsctdtyohiqabwtbmhn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3c2N0ZHR5b2hpcWFid3RibWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTYxMzEsImV4cCI6MjA5NzYzMjEzMX0.qwNRfFm4H_wocKQyz2yo5csRAXLNcPwmFZNRBLg-UT0'
);

let products = [];

const grid = document.getElementById('prodGrid');
const search = document.getElementById('userSearch');
const empty = document.getElementById('userEmpty');
const overlay = document.getElementById('userOverlay');
const detailModal = document.getElementById('detailModal');
const detailBody = document.getElementById('detailBody');
const detailTitle = document.getElementById('detailTitle');
const catFilter = document.getElementById('userCatFilter');
const sortEl = document.getElementById('userSort');

load();

/* ========== LOAD ========== */
async function load() {
  const { data, error } = await sb.from('products').select('*').order('id', { ascending: true });
  if (error) { show('Failed to load', 'e'); return; }
  products = data || [];
  apply();
}

/* ========== RENDER ========== */
function render(list) {
  grid.innerHTML = '';
  if (!list.length) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  list.forEach(p => {
    const stockText = p.status === 'red' ? 'Out of stock' : (p.stock + ' units in stock');
    grid.innerHTML += `
      <div class="u-card" data-id="${p.id}">
        <div class="u-card-img"><img src="${p.image}" alt="${p.name}"></div>
        <div class="u-card-body">
          <div class="u-card-cat">${p.category}</div>
          <div class="u-card-name">${p.name}</div>
          <div class="u-card-price">₹${p.price}<span class="u-card-unit">per packet</span></div>
          <div class="u-card-stock">${stockText}</div>
          <div class="u-card-act"><button class="u-card-btn" data-id="${p.id}">View details</button></div>
        </div>
      </div>`;
  });
  document.querySelectorAll('.u-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = products.find(x => x.id == btn.dataset.id);
      if (p) showDetail(p);
    });
  });
}

function apply() {
  const q = search.value.toLowerCase().trim();
  const cat = catFilter.value;
  const sort = sortEl.value;
  let f = products;
  if (cat !== 'all') f = f.filter(p => p.category.toLowerCase().trim() === cat.toLowerCase());
  if (q) f = f.filter(p => (p.name + ' ' + p.product_id + ' ' + p.category).toLowerCase().includes(q));
  if (sort === 'price-asc') f = [...f].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') f = [...f].sort((a, b) => b.price - a.price);
  else if (sort === 'stock') f = [...f].sort((a, b) => b.stock - a.stock);
  else if (sort === 'name') f = [...f].sort((a, b) => a.name.localeCompare(b.name));
  render(f);
}

catFilter.addEventListener('change', apply);
search.addEventListener('input', apply);
sortEl.addEventListener('change', apply);

/* ========== DETAIL MODAL ========== */
function showDetail(p) {
  detailTitle.textContent = p.name;
  const statusText = p.status === 'green' ? 'In stock' : p.status === 'orange' ? 'Low stock' : 'Out of stock';
  detailBody.innerHTML = `
    <div class="u-detail">
      <div class="u-detail-img"><img src="${p.image}" alt="${p.name}"></div>
      <div class="u-detail-info">
        <div class="u-detail-cat">${p.category}</div>
        <div class="u-detail-name">${p.name}</div>
        <div class="u-detail-price">₹${p.price}<span class="u-detail-unit">per packet</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Product ID</span><span class="u-detail-val">${p.product_id}</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Stock</span><span class="u-detail-val">${p.stock} units</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Status</span><span class="u-detail-val">${statusText}</span></div>
      </div>
    </div>
  `;
  overlay.classList.add('open');
  detailModal.classList.add('open');
}

document.getElementById('detailClose').addEventListener('click', closeDetail);
overlay.addEventListener('click', closeDetail);
function closeDetail() { overlay.classList.remove('open'); detailModal.classList.remove('open'); }

/* ========== ADMIN PASSWORD ========== */
const pwOverlay = document.getElementById('pwOverlay');
const pwModal = document.getElementById('pwModal');
const pwInput = document.getElementById('pwInput');
const pwSubmit = document.getElementById('pwSubmit');
const pwClose = document.getElementById('pwClose');
const pwErr = document.getElementById('pwErr');

document.getElementById('acctUserBtn').addEventListener('click', () => {
  pwInput.value = '';
  pwErr.textContent = '';
  pwOverlay.classList.add('open');
  pwModal.classList.add('open');
  setTimeout(() => pwInput.focus(), 100);
});

function closePw() { pwOverlay.classList.remove('open'); pwModal.classList.remove('open') }

pwClose.addEventListener('click', closePw);
pwOverlay.addEventListener('click', closePw);

pwSubmit.addEventListener('click', () => {
  const pw = pwInput.value.trim();
  if (pw === 'password123') {
    localStorage.setItem('td_admin', 'true');
    window.location.href = 'admin.html';
  } else {
    pwErr.textContent = 'Incorrect password';
    pwInput.value = '';
    pwInput.focus();
  }
});

pwInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') pwSubmit.click();
});

/* ========== TOAST ========== */
function show(msg, t = 's') {
  const icons = { s:'fa-check-circle', e:'fa-exclamation-circle', w:'fa-exclamation-triangle' };
  const el = document.createElement('div');
  el.className = 'toast ' + t;
  el.innerHTML = '<i class="fas ' + icons[t] + '"></i> ' + msg;
  document.getElementById('userToast').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, 2500);
}
