const sb = window.supabase.createClient('https://wwsctdtyohiqabwtbmhn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3c2N0ZHR5b2hpcWFid3RibWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTYxMzEsImV4cCI6MjA5NzYzMjEzMX0.qwNRfFm4H_wocKQyz2yo5csRAXLNcPwmFZNRBLg-UT0');

(async () => {
  if (localStorage.getItem('td_admin') !== 'true') {
    window.location.href = 'index.html'; return;
  }
  init();
})();

function init() {

const labels = { green:'In Stock', orange:'Low Stock', red:'Out of Stock' };
let products = [];
let editIdx = -1;
let isAdd = false;

const body = document.getElementById('body');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const catFilter = document.getElementById('catFilter');
const search = document.getElementById('search');
const modalTitle = document.getElementById('modalTitle');
const eName = document.getElementById('eName');
const eCat = document.getElementById('eCat');
const eImage = document.getElementById('eImage');
const ePrice = document.getElementById('ePrice');
const eStock = document.getElementById('eStock');
const imgUpload = document.getElementById('imgUpload');
const imgPreview = document.getElementById('imgPreview');
const previewImg = document.getElementById('previewImg');
const imgRemove = document.getElementById('imgRemove');
let uploadedImg = '';

/* ========== SALES DOM ========== */
const drawerOverlay = document.getElementById('drawerOverlay');
const drawer = document.getElementById('drawer');
const drawerBody = document.getElementById('drawerBody');
const grandTotalEl = document.getElementById('grandTotal');
const statRevenue = document.getElementById('statRevenue');
const statQty = document.getElementById('statQty');
const statTop = document.getElementById('statTop');

/* ========== SUPABASE CRUD ========== */
async function load() {
  const { data, error } = await sb.from('products').select('*').order('id', { ascending: true });
  if (error) { show('Failed to load', 'e'); return; }
  products = data || [];
  apply();
  await loadStats();
}

async function add(item) {
  const { error } = await sb.from('products').insert([item]);
  if (error) { show(error.message, 'e'); return; }
  await load(); show('Product added', 's');
}

async function update(id, item) {
  const { error } = await sb.from('products').update(item).eq('id', id);
  if (error) { show(error.message, 'e'); return; }
  await load(); show('Product updated', 's');
}

async function remove(id) {
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) { show(error.message, 'e'); return; }
  await load(); show('Product deleted', 'e');
}

/* ========== RENDER ========== */
function render(list) {
  body.innerHTML = '';
  list.forEach((p,i) => {
    const st = p.stock === 0 ? 'red' : p.stock <= 10 ? 'orange' : 'green';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.product_id}</strong></td>
      <td><img src="${p.image}" alt="" class="prod-img"></td>
      <td>${p.name}</td>
      <td>${p.category || '—'}</td>
      <td><strong>₹${p.price}</strong></td>
      <td>${p.stock}</td>
      <td><span class="badge ${st}"><i class="fas fa-circle" style="font-size:4px"></i> ${labels[st]}</span></td>
      <td>
        <button class="act-btn edit-btn" data-id="${p.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="act-btn del del-btn" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>`;
    tr.querySelector('.edit-btn').addEventListener('click', () => edit(p.id));
    tr.querySelector('.del-btn').addEventListener('click', () => del(p.id));
    body.appendChild(tr);
  });
}

function apply() {
  const q = search.value.toLowerCase().trim();
  const cat = catFilter.value;
  let filtered = products;
  if (cat !== 'all') filtered = filtered.filter(p => p.category.toLowerCase().trim() === cat.toLowerCase());
  if (q) filtered = filtered.filter(p => (p.name + ' ' + p.product_id + ' ' + p.category).toLowerCase().includes(q));
  render(filtered);
}

catFilter.addEventListener('change', apply);
search.addEventListener('input', apply);
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) search.blur(); });

/* ========== IMAGE UPLOAD ========== */
function resetImg() { uploadedImg = ''; imgUpload.style.display = 'block'; imgPreview.style.display = 'none'; eImage.value = ''; }
function showImgPreview(src) { uploadedImg = src; imgUpload.style.display = 'none'; imgPreview.style.display = 'inline-block'; previewImg.src = src; }
imgUpload.addEventListener('click', () => eImage.click());
eImage.addEventListener('change', e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = ev => showImgPreview(ev.target.result); r.readAsDataURL(e.target.files[0]); } });
imgRemove.addEventListener('click', resetImg);

/* ========== MODAL ========== */
document.getElementById('addBtn').addEventListener('click', () => {
  isAdd = true; editIdx = -1;
  modalTitle.textContent = 'Add Product';
  eName.value = ''; eCat.value = 'Milk'; ePrice.value = ''; eStock.value = ''; resetImg();
  overlay.classList.add('open'); modal.classList.add('open');
});

function edit(id) {
  isAdd = false; editIdx = id; const p = products.find(pp => pp.id == id);
  if (!p) return;
  modalTitle.textContent = 'Edit Product';
  eName.value = p.name; eCat.value = p.category || ''; ePrice.value = p.price; eStock.value = p.stock;
  showImgPreview(p.image);
  overlay.classList.add('open'); modal.classList.add('open');
}

async function del(id) {
  if (!confirm('Delete this product?')) return;
  await remove(id);
}

document.getElementById('modalSave').addEventListener('click', async () => {
  const name = eName.value.trim();
  const category = eCat.value;
  const image = uploadedImg || 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop';
  const price = parseInt(ePrice.value) || 0;
  const stock = parseInt(eStock.value) || 0;
  const status = stock === 0 ? 'red' : stock <= 10 ? 'orange' : 'green';

  if (!name) { show('Name is required', 'e'); return; }
  if (!category) { show('Category is required', 'e'); return; }

  const payload = { name, category, price, stock, status, image };

  if (isAdd) {
    const maxNum = products.reduce((m, p) => { const n = parseInt(p.product_id?.replace('PRD-', '')); return n > m ? n : m; }, 1000);
    payload.product_id = 'PRD-' + (maxNum + 1);
    await add(payload);
  } else if (editIdx) {
    await update(editIdx, payload);
  }
  closeModal();
});

document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
function closeModal() { overlay.classList.remove('open'); modal.classList.remove('open'); editIdx = -1; }

  document.getElementById('acctBtn').addEventListener('click', () => {
    localStorage.removeItem('td_admin');
    window.location.href = 'index.html';
  });

/* ========== SALES SYSTEM ========== */

async function loadStats() {
  const today = new Date().toISOString().split('T')[0];
  const { data: sales, error } = await sb.from('daily_sales').select('*, daily_sale_items(*)').eq('sale_date', today);
  if (error) return;
  let total = 0, qty = 0, top = {};
  (sales || []).forEach(s => {
    total += Number(s.total_amount);
    (s.daily_sale_items || []).forEach(item => {
      qty += item.quantity_sold;
      top[item.product_id] = (top[item.product_id] || 0) + item.quantity_sold;
    });
  });
  statRevenue.textContent = '₹' + total.toLocaleString();
  statQty.textContent = qty;
  const entries = Object.entries(top);
  if (entries.length) {
    const best = entries.sort((a,b) => b[1] - a[1])[0];
    const p = products.find(pp => pp.id == best[0]);
    statTop.textContent = p ? p.name : '—';
  } else {
    statTop.textContent = '—';
  }
}

function renderSalesDrawer() {
  const draft = JSON.parse(localStorage.getItem('td_sales_draft') || '{}');
  drawerBody.innerHTML = '';
  products.forEach(p => {
    const qty = draft[p.id] || 0;
    const rem = p.stock - qty;
    const row = document.createElement('div');
    row.className = 'sale-row';
    row.innerHTML = `
      <img src="${p.image}" alt="" class="sale-row-img">
      <div class="sale-row-info">
        <div class="sale-row-name">${p.name}</div>
        <div class="sale-row-price">₹${p.price} · Stock: ${p.stock}</div>
      </div>
      <input type="number" class="sale-row-qty" data-id="${p.id}" min="0" max="${p.stock}" value="${qty}" placeholder="0">
      <div class="sale-row-total" data-total="${p.id}">₹${(qty * p.price).toLocaleString()}</div>`;
    row.querySelector('.sale-row-qty').addEventListener('input', onQtyChange);
    drawerBody.appendChild(row);
  });
  calculateSales();
}

function onQtyChange() {
  const id = this.dataset.id;
  const val = parseInt(this.value) || 0;
  document.querySelector(`[data-total="${id}"]`).textContent = '₹' + (val * (products.find(p => p.id == id)?.price || 0)).toLocaleString();
  calculateSales();
  saveDraft();
}

function calculateSales() {
  let total = 0;
  document.querySelectorAll('.sale-row-qty').forEach(inp => {
    const id = inp.dataset.id;
    const qty = parseInt(inp.value) || 0;
    const p = products.find(pp => pp.id == id);
    if (p) total += qty * p.price;
  });
  grandTotalEl.textContent = 'Grand Total: ₹' + total.toLocaleString();
}

function saveDraft() {
  const draft = {};
  document.querySelectorAll('.sale-row-qty').forEach(inp => {
    const val = parseInt(inp.value) || 0;
    if (val > 0) draft[inp.dataset.id] = val;
  });
  localStorage.setItem('td_sales_draft', JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem('td_sales_draft');
}

document.getElementById('salesBtn').addEventListener('click', openDrawer);

function openDrawer() {
  renderSalesDrawer();
  drawerOverlay.classList.add('open');
  drawer.classList.add('open');
}

function closeDrawer() {
  drawerOverlay.classList.remove('open');
  drawer.classList.remove('open');
}

drawerOverlay.addEventListener('click', closeDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);

document.getElementById('generateBtn').addEventListener('click', async () => {
  const items = [];
  document.querySelectorAll('.sale-row-qty').forEach(inp => {
    const qty = parseInt(inp.value) || 0;
    if (qty > 0) {
      const p = products.find(pp => pp.id == parseInt(inp.dataset.id));
      if (p) items.push({ product_id: p.id, quantity_sold: qty, price: p.price, subtotal: qty * p.price });
    }
  });
  if (!items.length) { show('No quantities entered', 'w'); return; }

  const total = items.reduce((s, i) => s + i.subtotal, 0);
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await sb.from('daily_sales').select('id').eq('sale_date', today);
  const saleId = existing?.length ? existing[0].id : null;

  try {
    if (saleId) {
      const { error: delErr } = await sb.from('daily_sale_items').delete().eq('sale_id', saleId);
      if (delErr) throw delErr;
      const { error: upErr } = await sb.from('daily_sales').update({ total_amount: total }).eq('id', saleId);
      if (upErr) throw upErr;
      const { error: insErr } = await sb.from('daily_sale_items').insert(items.map(i => ({ ...i, sale_id: saleId })));
      if (insErr) throw insErr;
      show('Bill updated', 's');
    } else {
      const { data: sale, error: sErr } = await sb.from('daily_sales').insert([{ sale_date: today, total_amount: total }]).select().single();
      if (sErr) throw sErr;
      const { error: iErr } = await sb.from('daily_sale_items').insert(items.map(i => ({ ...i, sale_id: sale.id })));
      if (iErr) throw iErr;
      show('Bill generated', 's');
    }
    for (const item of items) {
      const p = products.find(pp => pp.id == item.product_id);
      if (p) {
        const newStock = Math.max(0, p.stock - item.quantity_sold);
        const newStatus = newStock === 0 ? 'red' : newStock <= 10 ? 'orange' : 'green';
        await sb.from('products').update({ stock: newStock, status: newStatus }).eq('id', p.id);
        p.stock = newStock;
      }
    }
    clearDraft();
    closeDrawer();
    apply();
    await loadStats();
  } catch (e) {
    show(e.message || 'Failed to save bill', 'e');
  }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const items = [];
  document.querySelectorAll('.sale-row-qty').forEach(inp => {
    const qty = parseInt(inp.value) || 0;
    if (qty > 0) {
      const p = products.find(pp => pp.id == parseInt(inp.dataset.id));
      if (p) items.push({ name: p.name, qty, price: p.price, subtotal: qty * p.price, stock: p.stock, remaining: p.stock - qty });
    }
  });
  if (!items.length) { show('No items to export', 'w'); return; }
  downloadPDF(items);
});

function downloadPDF(items) {
  if (typeof window.jspdf === 'undefined') { show('PDF library not loaded', 'e'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const pageW = 190;
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TIRUMALA DAIRY', pageW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Today\'s Sales Report', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.text('Date: ' + today, pageW / 2, y, { align: 'center' });
  y += 10;

  const grandTotal = items.reduce((s, i) => s + i.subtotal, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  doc.autoTable({
    startY: y,
    head: [['#', 'Product', 'Stock', 'Sold', 'Remaining', 'Price', 'Total']],
    body: items.map((i, idx) => [idx + 1, i.name, i.stock, i.qty, i.remaining, 'Rs.' + i.price, 'Rs.' + i.subtotal.toLocaleString()]),
    foot: [['', '', '', '', '', '', '']],
    theme: 'grid',
    headStyles: { fillColor: [26, 46, 92], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fontSize: 8 },
    margin: { left: 8, right: 8 },
    tableWidth: 194,
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setDrawColor(200);
  doc.line(10, y, pageW + 10, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 92);
  doc.text('Total Revenue: Rs.' + grandTotal.toLocaleString(), pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text('Total Units Sold: ' + totalQty + '  |  Total Items: ' + items.length, pageW / 2, y, { align: 'center' });
  y += 12;
  doc.setDrawColor(220);
  doc.line(60, y, pageW - 40, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('Generated by: Admin  |  ' + today, pageW / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(160);
  doc.text('Tirumula Dairy', pageW / 2, y, { align: 'center' });

  doc.save('sales-report-' + new Date().toISOString().split('T')[0] + '.pdf');
  show('PDF downloaded', 's');
}

document.getElementById('pdfBtn').addEventListener('click', async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: sales, error } = await sb.from('daily_sales').select('*, daily_sale_items(*)').eq('sale_date', today);
  if (error || !sales?.length) { show('No sales found for today', 'w'); return; }
  const items = [];
  sales.forEach(s => (s.daily_sale_items || []).forEach(item => {
    const p = products.find(pp => pp.id == item.product_id);
    const qty = item.quantity_sold;
    const curStock = p?.stock || 0;
    items.push({ name: p?.name || 'Product #' + item.product_id, qty, price: item.price, subtotal: item.subtotal, stock: curStock + qty, remaining: curStock });
  }));
  if (!items.length) { show('No items in today\'s sales', 'w'); return; }
  downloadPDF(items);
});

  load();
}

function show(msg, t='s') {
  const icons = { s:'fa-check-circle', e:'fa-exclamation-circle', w:'fa-exclamation-triangle' };
  const el = document.createElement('div');
  el.className = 'toast ' + t;
  el.innerHTML = '<i class="fas ' + icons[t] + '"></i> ' + msg;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(100%)'; el.style.transition='all 0.3s'; setTimeout(()=>el.remove(),300); }, 2500);
}
