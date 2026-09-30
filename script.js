// ===== CONFIG =====
const WHATSAPP_NUMBER = "923405105815";
const PAGE_SIZE = 24;

// ===== STATE =====
let state = {
  search: "",
  category: "All",
  page: 1
};

// ===== WHATSAPP ORDER =====
function orderOnWhatsApp(product) {
  const message =
    `Hello Asad and Sons Imported Toys Mart, I want to order this toy:\n\n` +
    `Product: ${product.name}\n` +
    `Price: Rs. ${product.price.toLocaleString()}\n\n` +
    `Please provide me with the order details.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// ===== CATEGORIES =====
function getCategories() {
  const set = new Set(PRODUCTS.map(p => p.category));
  return ["All", ...Array.from(set).sort()];
}

function renderCategoryPills() {
  const wrap = document.getElementById("catScroll");
  wrap.innerHTML = "";
  getCategories().forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat-pill" + (state.category === cat ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => { state.category = cat; state.page = 1; renderAll(); scrollToProducts(); };
    wrap.appendChild(btn);
  });
}

function scrollToProducts(){
  document.getElementById("toys").scrollIntoView({behavior:"smooth", block:"start"});
}

// ===== FILTERING =====
function getFiltered() {
  const q = state.search.trim().toLowerCase();
  return PRODUCTS.filter(p => {
    const matchesCat = state.category === "All" || p.category === state.category;
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });
}

// ===== PRODUCT CARD =====
function cardHTML(p) {
  return `
    <div class="card">
      <div class="card-img"><img src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy"></div>
      <div class="card-body">
        <span class="card-cat">${escapeHTML(p.category)}</span>
        <div class="card-name">${escapeHTML(p.name)}</div>
        <div class="card-desc">${escapeHTML(p.description)}</div>
        <div class="card-price">Rs. ${p.price.toLocaleString()}</div>
        <div class="card-actions">
          <button class="btn-view" onclick="openModal(${p.id})">View Details</button>
          <button class="btn-order" onclick="orderOnWhatsApp(PRODUCTS.find(x=>x.id===${p.id}))">
            Order Now
          </button>
        </div>
      </div>
    </div>`;
}

function escapeHTML(str){
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ===== RENDER GRID + PAGINATION =====
function renderGrid() {
  const filtered = getFiltered();
  const grid = document.getElementById("productGrid");
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  document.getElementById("resultCount").textContent =
    `${filtered.length} toy${filtered.length !== 1 ? "s" : ""} found`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results">No toys found. Try another search.</div>`;
  } else {
    grid.innerHTML = pageItems.map(cardHTML).join("");
  }
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = document.getElementById("pagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  let html = "";
  html += `<button class="page-btn" ${state.page===1?"disabled":""} onclick="goPage(${state.page-1})">Prev</button>`;
  const windowSize = 5;
  let startP = Math.max(1, state.page - Math.floor(windowSize/2));
  let endP = Math.min(totalPages, startP + windowSize - 1);
  startP = Math.max(1, endP - windowSize + 1);
  for (let i = startP; i <= endP; i++) {
    html += `<button class="page-btn ${i===state.page?"active":""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${state.page===totalPages?"disabled":""} onclick="goPage(${state.page+1})">Next</button>`;
  el.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  renderGrid();
  scrollToProducts();
}

// ===== MODAL =====
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById("modalBody").innerHTML = `
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div class="modal-img"><img src="${p.image}" alt="${escapeHTML(p.name)}"></div>
    <div class="modal-info">
      <span class="card-cat">${escapeHTML(p.category)}</span>
      <h2>${escapeHTML(p.name)}</h2>
      <div class="price">Rs. ${p.price.toLocaleString()}</div>
      <p class="desc">${escapeHTML(p.description)}</p>
      <div class="meta-row"><b>Category:</b>&nbsp;${escapeHTML(p.category)}</div>
      <div class="modal-actions">
        <button class="btn-order" style="flex:1;padding:14px 0;" onclick='orderOnWhatsApp(PRODUCTS.find(x=>x.id===${p.id}))'>Order Now on WhatsApp</button>
      </div>
    </div>`;
  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ===== SEARCH =====
function onSearchInput(val) {
  state.search = val;
  state.page = 1;
  renderGrid();
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}

// ===== INIT =====
function renderAll() {
  renderCategoryPills();
  renderGrid();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
