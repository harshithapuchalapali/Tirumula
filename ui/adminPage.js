let products = [];
let quantities = {};
let todaySales = JSON.parse(localStorage.getItem('td_sales') || '[]').filter(s => {
  const d = new Date(s.date);
  const daysOld = (Date.now() - d.getTime()) / 86400000;
  return daysOld < 7;
});
// Keep only the latest bill per day
const perDay = {};
todaySales.forEach(s => {
  const day = new Date(s.date).toDateString();
  perDay[day] = s;
});
todaySales = Object.values(perDay);
localStorage.setItem('td_sales', JSON.stringify(todaySales));

const tableBody = document.getElementById('body');
const search = document.getElementById('search');
const catFilter = document.getElementById('catFilter');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const nameField = document.getElementById('eName');
const priceField = document.getElementById('ePrice');
const stockField = document.getElementById('eStock');
const catField = document.getElementById('eCat');
const imgUpload = document.getElementById('imgUpload');
const imgInput = document.getElementById('eImage');
const imgPreview = document.getElementById('imgPreview');
const previewImg = document.getElementById('previewImg');
const imgRemove = document.getElementById('imgRemove');
const saveBtn = document.getElementById('modalSave');
const cancelBtn = document.getElementById('modalCancel');

const statTop = document.getElementById('statTop');

const drawerOverlay = document.getElementById('drawerOverlay');
const drawer = document.getElementById('drawer');
const drawerBody = document.getElementById('drawerBody');
const grandTotal = document.getElementById('grandTotal');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

document.getElementById('drawerClose').onclick = closeDrawer;
drawerOverlay.onclick = closeDrawer;
document.getElementById('modalClose').onclick = closeModal;
overlay.onclick = closeModal;
saveBtn.onclick = saveProduct;
cancelBtn.onclick = closeModal;
document.getElementById('modal').addEventListener('keydown', e => { if (e.key === 'Enter') saveProduct(); });

document.getElementById('addBtn').onclick = () => openModal();
document.getElementById('salesBtn').onclick = () => { renderDrawer(); drawerOverlay.classList.add('open'); drawer.classList.add('open'); };
document.getElementById('pdfBtn').onclick = async () => {
  if (getCart().length) await generateBill();
  if (!window._billDoc) buildPDFFromTodaySales();
  if (!window._billDoc) rebuildBillFromStorage();
  if (window._billDoc) downloadPDF();
};

document.getElementById('actionSelect').onchange = function() {
  switch (this.value) {
    case 'add': openModal(); break;
    case 'sales': renderDrawer(); drawerOverlay.classList.add('open'); drawer.classList.add('open'); break;
    case 'pdf':
      (async () => {
        if (getCart().length) await generateBill();
        if (!window._billDoc) buildPDFFromTodaySales();
        if (!window._billDoc) rebuildBillFromStorage();
        if (window._billDoc) downloadPDF();
      })();
      break;
  }
  this.value = '';
};

imgUpload.onclick = () => imgInput.click();
imgInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { previewImg.src = ev.target.result; imgPreview.style.display = 'block'; imgUpload.style.display = 'none'; };
  reader.readAsDataURL(file);
};
imgRemove.onclick = () => { imgPreview.style.display = 'none'; imgUpload.style.display = 'flex'; imgInput.value = ''; };

generateBtn.onclick = generateBill;
downloadBtn.onclick = downloadPDF;
document.getElementById('acctBtn').onclick = () => window.location.href = 'index.html';
document.getElementById('clearBtn').onclick = () => { Object.keys(quantities).forEach(k => quantities[k] = 0); renderDrawer(); };

catFilter.addEventListener('change', apply);
search.addEventListener('input', apply);

load();

async function load() {
  try {
    products = await ProductRepo.getAll();
    products.forEach(p => { if (quantities[p.id] === undefined) quantities[p.id] = 0; });
    apply();
    updateStats();
  } catch { UI.toast('Failed to load', 'e'); }
}

function apply() {
  const q = search.value;
  const cat = catFilter.value;
  let f = StockService.filterByCategory(products, cat);
  f = StockService.search(f, q);
  render(f);
}

function render(list) {
  tableBody.innerHTML = '';
  if (!list.length) { tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text3)">No products found</td></tr>'; return; }
  list.forEach(p => {
    const s = p.stockStatus;
    const labels = { green: 'In stock', orange: 'Low stock', red: 'Out of stock' };
    tableBody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td><img class="prod-img" src="${p.image}" alt="${p.name}"></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td><span class="badge ${s}"><i class="fas fa-circle" style="font-size:4px"></i> ${labels[s]}</span></td>
        <td>
          <button class="act-btn edit-btn" data-id="${p.id}"><i class="fas fa-pen"></i></button>
          <button class="act-btn del del-btn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  });
  document.querySelectorAll('.edit-btn').forEach(b => b.onclick = () => editProduct(b.dataset.id));
  document.querySelectorAll('.del-btn').forEach(b => b.onclick = () => deleteProduct(b.dataset.id));
}

function updateStats() {
  const today = new Date().toDateString();
  const todaysSales = todaySales.filter(s => new Date(s.date).toDateString() === today);
  const latest = todaysSales.length ? todaysSales[todaysSales.length - 1] : null;
  if (!latest) {
    document.getElementById('statRevenue').textContent = '₹0';
    document.getElementById('statQty').textContent = '0 units';
    statTop.textContent = '—';
    return;
  }
  const rev = latest.total;
  const qty = latest.items.reduce((a, i) => a + i.qty, 0);
  const topItem = [...latest.items].sort((a, b) => b.qty - a.qty)[0];
  document.getElementById('statRevenue').textContent = '₹' + rev;
  document.getElementById('statQty').textContent = qty + ' units';
  statTop.textContent = topItem ? topItem.name : '—';
}

let editingId = null;
function openModal(p) {
  editingId = p ? p.id : null;
  modalTitle.textContent = p ? 'Edit Product' : 'Add Product';
  nameField.value = p ? p.name : '';
  priceField.value = p ? p.price : '';
  stockField.value = p ? p.stock : '';
  catField.value = p ? p.category : 'Milk';
  if (p && p.image) { previewImg.src = p.image; imgPreview.style.display = 'block'; imgUpload.style.display = 'none'; }
  else { imgPreview.style.display = 'none'; imgUpload.style.display = 'flex'; }
  overlay.classList.add('open');
  modal.classList.add('open');
}

function closeModal() { overlay.classList.remove('open'); modal.classList.remove('open'); imgInput.value = ''; imgPreview.style.display = 'none'; imgUpload.style.display = 'flex'; editingId = null; }

function editProduct(id) {
  const p = products.find(x => x.id == id);
  if (p) openModal(p);
}

async function saveProduct() {
  const name = nameField.value.trim();
  const price = parseFloat(priceField.value);
  const stock = parseInt(stockField.value);
  const category = catField.value;
  let image = (imgPreview.style.display !== 'none' && previewImg.src) ? previewImg.src : '';

  if (!name || isNaN(price) || isNaN(stock) || !category) { UI.toast('Fill all fields', 'e'); return; }
  const data = { name, price, stock, category, image };

  try {
    if (editingId) await ProductRepo.update(editingId, data);
    else await ProductRepo.create(data);
    UI.toast(editingId ? 'Updated' : 'Added', 's');
    closeModal();
    await load();
  } catch { UI.toast('Save failed', 'e'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await ProductRepo.remove(id); UI.toast('Deleted', 's'); await load(); }
  catch { UI.toast('Delete failed', 'e'); }
}

function renderDrawer() {
  drawerBody.innerHTML = '';
  products.forEach(p => {
    const q = quantities[p.id] || 0;
    const line = p.price * q;
    drawerBody.innerHTML += `
      <div class="sale-row">
        <img class="sale-row-img" src="${p.image}" alt="${p.name}">
        <div class="sale-row-info">
          <div class="sale-row-name">${p.name}</div>
          <div class="sale-row-stock">Stock: ${p.stock}</div>
          <div class="sale-row-price">₹${p.price} × <span class="line-qty">${q}</span></div>
        </div>
        <input class="sale-row-qty" type="number" min="0" max="${p.stock}" value="${q}" data-id="${p.id}">
        <div class="sale-row-total"><span class="line-total">₹${line}</span></div>
      </div>`;
  });
  updateGrandTotal();
  document.querySelectorAll('.sale-row-qty').forEach(inp => {
    inp.oninput = function () {
      const id = parseInt(this.dataset.id);
      let v = parseInt(this.value);
      if (isNaN(v) || v < 0) v = 0;
      const prod = products.find(p => p.id === id);
      if (prod && v > prod.stock) v = prod.stock;
      this.value = v;
      quantities[id] = v;
      const row = this.closest('.sale-row');
      if (row) {
        row.querySelector('.line-qty').textContent = v;
        row.querySelector('.line-total').textContent = '₹' + (prod ? prod.price * v : 0);
      }
      updateGrandTotal();
    };
  });
}

function updateGrandTotal() {
  let grand = 0;
  products.forEach(p => { grand += p.price * (quantities[p.id] || 0); });
  grandTotal.textContent = 'Grand Total: ₹' + grand;
}

function closeDrawer() { drawerOverlay.classList.remove('open'); drawer.classList.remove('open'); }

function getCart() {
  return products.filter(p => (quantities[p.id] || 0) > 0).map(p => ({ ...p, qty: quantities[p.id] }));
}

async function generateBill() {
  const cart = getCart();
  if (!cart.length) { UI.toast('No items selected', 'e'); return; }
  try {
    for (const c of cart) {
      const newStock = c.stock - c.qty;
      await ProductRepo.update(c.id, { stock: newStock });
    }
  } catch { UI.toast('Stock update failed', 'e'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(14); doc.text('Tirumula Dairy', 105, y, { align: 'center' }); y += 7;
  doc.setFontSize(8); doc.text('Beside PR Club, Muthyalapeta, Gudur — 524101', 105, y, { align: 'center' }); y += 5;
  doc.setFontSize(9); doc.text('Date: ' + new Date().toLocaleDateString(), 20, y); y += 6;
  let grand = 0;
  const rows = [];
  cart.forEach(c => {
    const ln = c.price * c.qty;
    grand += ln;
    const opening = c.stock;
    const sold = c.qty;
    const remaining = opening - sold;
    rows.push([c.name, opening, sold, remaining, 'Rs.' + c.price, 'Rs.' + ln]);
  });
  doc.autoTable({
    startY: y,
    head: [['Product', 'Opening Stock', 'Sold', 'Closing Stock', 'Price', 'Total']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, font: 'Helvetica' },
    headStyles: { fillColor: [194,105,45] },
    margin: { left: 15, right: 15 }
  });
  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(12); doc.text('Grand Total: Rs.' + grand, 20, y);
  doc.setFontSize(8); doc.text('Thank you!', 105, y + 8, { align: 'center' });
  window._billDoc = doc;
  const billRows = rows;
  const billGrand = grand;
  localStorage.setItem('td_lastBill', JSON.stringify({ rows: billRows, grand: billGrand }));
  const todayStr = new Date().toDateString();
  todaySales = todaySales.filter(s => new Date(s.date).toDateString() !== todayStr);
  todaySales.push({ date: new Date().toISOString(), items: cart, total: grand });
  localStorage.setItem('td_sales', JSON.stringify(todaySales));
  Object.keys(quantities).forEach(k => quantities[k] = 0);
  await load();
  renderDrawer();
  updateStats();
  closeDrawer();
  UI.toast('Bill generated & stock updated', 's');
}

function buildPDFFromTodaySales() {
  const today = new Date().toDateString();
  const todaysSales = todaySales.filter(s => new Date(s.date).toDateString() === today);
  if (!todaysSales.length) return;
  const agg = {};
  todaysSales.forEach(s => {
    s.items.forEach(item => {
      if (!agg[item.id]) agg[item.id] = { ...item, qty: 0 };
      agg[item.id].qty += item.qty;
    });
  });
  const items = Object.values(agg);
  let grand = 0;
  const rows = [];
  items.forEach(item => {
    const ln = item.price * item.qty;
    grand += ln;
    rows.push([item.name, item.stock, item.qty, item.stock - item.qty, 'Rs.' + item.price, 'Rs.' + ln]);
  });
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(14); doc.text('Tirumula Dairy', 105, y, { align: 'center' }); y += 7;
  doc.setFontSize(8); doc.text('Beside PR Club, Muthyalapeta, Gudur — 524101', 105, y, { align: 'center' }); y += 5;
  doc.setFontSize(9); doc.text('Date: ' + new Date().toLocaleDateString(), 20, y); y += 6;
  doc.autoTable({
    startY: y,
    head: [['Product', 'Opening Stock', 'Sold', 'Closing Stock', 'Price', 'Total']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, font: 'Helvetica' },
    headStyles: { fillColor: [194,105,45] },
    margin: { left: 15, right: 15 }
  });
  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(12); doc.text('Grand Total: Rs.' + grand, 20, y);
  doc.setFontSize(8); doc.text('Thank you!', 105, y + 8, { align: 'center' });
  window._billDoc = doc;
}

function rebuildBillFromStorage() {
  const saved = JSON.parse(localStorage.getItem('td_lastBill'));
  if (!saved || !saved.rows || !saved.rows.length) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(14); doc.text('Tirumula Dairy', 105, y, { align: 'center' }); y += 7;
  doc.setFontSize(8); doc.text('Beside PR Club, Muthyalapeta, Gudur — 524101', 105, y, { align: 'center' }); y += 5;
  doc.setFontSize(9); doc.text('Date: ' + new Date().toLocaleDateString(), 20, y); y += 6;
  doc.autoTable({
    startY: y,
    head: [['Product', 'Opening Stock', 'Sold', 'Closing Stock', 'Price', 'Total']],
    body: saved.rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, font: 'Helvetica' },
    headStyles: { fillColor: [194,105,45] },
    margin: { left: 15, right: 15 }
  });
  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(12); doc.text('Grand Total: Rs.' + saved.grand, 20, y);
  doc.setFontSize(8); doc.text('Thank you!', 105, y + 8, { align: 'center' });
  window._billDoc = doc;
}

function downloadPDF() {
  if (!window._billDoc) { UI.toast('Generate bill first', 'e'); return; }
  window._billDoc.save('Tirumula_Bill_' + Date.now() + '.pdf');
}
