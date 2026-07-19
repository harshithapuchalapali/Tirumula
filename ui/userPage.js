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

document.getElementById('detailClose').onclick = closeDetail;
overlay.addEventListener('click', closeDetail);

document.getElementById('acctUserBtn').onclick = () => UI.showPasswordModal();

load();

async function load() {
  try {
    products = await ProductRepo.getAll();
    apply();
  } catch {
    UI.toast('Failed to load products', 'e');
  }
}

function apply() {
  const q = search.value;
  const cat = catFilter.value;
  const sort = sortEl.value;
  let f = StockService.filterByCategory(products, cat);
  f = StockService.search(f, q);
  f = StockService.sort(f, sort);
  render(f);
}

catFilter.addEventListener('change', apply);
search.addEventListener('input', apply);
sortEl.addEventListener('change', apply);

function render(list) {
  grid.innerHTML = '';
  if (!list.length) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  list.forEach(p => {
    grid.innerHTML += `
      <div class="u-card">
        <div class="u-card-img"><img src="${p.image}" alt="${p.name}"></div>
        <div class="u-card-body">
          <div class="u-card-cat">${p.category}</div>
          <div class="u-card-name">${p.name}</div>
          <div class="u-card-price">₹${p.price}<span class="u-card-unit">per packet</span></div>
          <div class="u-card-stock"><span class="u-stock-dot ${p.stockStatus}"></span> ${p.stockLabel}</div>
          <div class="u-card-act"><button class="u-card-btn" data-id="${p.id}">View details</button></div>
        </div>
      </div>`;
  });
  document.querySelectorAll('.u-card-btn').forEach(btn => {
    btn.onclick = () => {
      const p = products.find(x => x.id == btn.dataset.id);
      if (p) showDetail(p);
    };
  });
}

function showDetail(p) {
  detailTitle.textContent = p.name;
  detailBody.innerHTML = `
    <div class="u-detail">
      <div class="u-detail-img"><img src="${p.image}" alt="${p.name}"></div>
      <div class="u-detail-info">
        <div class="u-detail-cat">${p.category}</div>
        <div class="u-detail-name">${p.name}</div>
        <div class="u-detail-price">₹${p.price}<span class="u-card-unit">per packet</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Product ID</span><span class="u-detail-val">${p.productId}</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Stock</span><span class="u-detail-val">${p.stock} units</span></div>
        <div class="u-detail-row"><span class="u-detail-label">Status</span><span class="u-detail-val">${p.stockLabel}</span></div>
      </div>
    </div>
  `;
  overlay.classList.add('open');
  detailModal.classList.add('open');
}

function closeDetail() { overlay.classList.remove('open'); detailModal.classList.remove('open'); }
