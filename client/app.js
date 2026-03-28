const API = '/api';
let state = { token: localStorage.getItem('token'), user: JSON.parse(localStorage.getItem('user') || 'null') };

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function setSyncStatus() {
  const online = navigator.onLine;
  $('#syncStatus').textContent = online ? 'online' : 'offline';
  $('#syncStatus').className = `pill ${online ? 'online' : 'offline'}`;
}

async function api(path, options = {}, allowQueue = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const config = { ...options, headers };

  if (!navigator.onLine && allowQueue && ['POST','PUT','DELETE'].includes((config.method || 'GET').toUpperCase())) {
    queueRequest(path, config);
    return { queued: true };
  }

  const res = await fetch(`${API}${path}`, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Error en la solicitud');
  }
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) return res.json();
  return res.blob();
}

function queueRequest(path, config) {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  queue.push({ path, config });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
  alert('Sin conexión. El registro quedó en cola y se sincronizará al volver internet.');
}

async function flushQueue() {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  if (!queue.length || !navigator.onLine || !state.token) return;
  const remaining = [];
  for (const item of queue) {
    try {
      await api(item.path, item.config, false);
    } catch (e) {
      remaining.push(item);
    }
  }
  localStorage.setItem('offlineQueue', JSON.stringify(remaining));
  if (!remaining.length) loadAll();
}

function serialize(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((k) => {
    if (data[k] === '') data[k] = null;
    if (['weight_kg','quantity','unit_price','total_amount','current_stock','reorder_level','unit_cost','to_location_id'].includes(k) && data[k] !== null) {
      data[k] = Number(data[k]);
    }
  });
  return data;
}

async function login(e) {
  e.preventDefault();
  const payload = serialize(e.target);
  const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  state.token = data.token; state.user = data.user;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  showApp();
}

function logout() {
  localStorage.clear();
  state = { token: null, user: null };
  $('#mainView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}

async function submitForm(formId, endpoint) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = serialize(form);
      await api(endpoint, { method: 'POST', body: JSON.stringify(data) });
      form.reset();
      alert('Registro guardado');
      loadAll();
    } catch (error) {
      alert(error.message);
    }
  });
}

function renderList(target, rows, mapFn) {
  const el = document.getElementById(target);
  el.innerHTML = rows.length ? rows.map(mapFn).join('') : '<p class="muted">Sin registros.</p>';
}

async function loadDashboard() {
  const data = await api('/dashboard/summary');
  $('#dashboardCards').innerHTML = `
    <div class="kpi"><div class="label">Ventas 7 días</div><div class="value">$${data.weeklySales}</div></div>
    <div class="kpi"><div class="label">Costos 7 días</div><div class="value">$${data.weeklyCosts}</div></div>
    ${data.animalsByCategory.map(item => `<div class="kpi"><div class="label">${item.current_category}</div><div class="value">${item.total}</div></div>`).join('')}
  `;
  $('#dashboardLists').innerHTML = `
    <div class="list-item"><div class="title">Animales por ubicación</div><div class="meta">${data.animalsByLocation.map(x => `${x.name}: ${x.total}`).join(' · ')}</div></div>
    <div class="list-item"><div class="title">Alertas de inventario</div><div class="meta">${data.lowStock.length ? data.lowStock.map(x => `${x.item_name} (${x.current_stock}${x.unit})`).join(' · ') : 'Sin alertas'}</div></div>
  `;
}

async function loadLocations() {
  const locations = await api('/locations');
  $('#movementLocation').innerHTML = '<option value="">Destino</option>' + locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
}

async function loadAll() {
  await Promise.all([loadDashboard(), loadLocations(), loadAnimals(), loadWeights(), loadHealth(), loadMovements(), loadTransactions(), loadReproduction(), loadSupplies(), loadUsers()]);
}

const dateFmt = (v) => v ? new Date(v).toLocaleDateString('es-CO') : '-';

async function loadAnimals() {
  const rows = await api('/animals');
  renderList('animalsList', rows, r => `<div class="list-item"><div class="title">${r.animal_code} · ${r.current_category}</div><div class="meta">${r.sex} · ${r.status} · nac. ${dateFmt(r.birth_date)}</div></div>`);
}
async function loadWeights() {
  const rows = await api('/weights');
  renderList('weightsList', rows, r => `<div class="list-item"><div class="title">${r.animal_code} · ${r.weight_kg} kg</div><div class="meta">${dateFmt(r.weighed_at)} · GMD ${r.average_daily_gain ?? '-'} kg/día</div></div>`);
}
async function loadHealth() {
  const rows = await api('/health');
  renderList('healthList', rows, r => `<div class="list-item"><div class="title">${r.animal_code} · ${r.event_type}</div><div class="meta">${dateFmt(r.event_date)} · ${r.medicine_name || r.diagnosis || '-'}</div></div>`);
}
async function loadMovements() {
  const rows = await api('/movements');
  renderList('movementsList', rows, r => `<div class="list-item"><div class="title">${r.animal_code}</div><div class="meta">${dateFmt(r.moved_at)} · ubicación ${r.to_location_id}</div></div>`);
}
async function loadTransactions() {
  const rows = await api('/transactions');
  renderList('transactionsList', rows, r => `<div class="list-item"><div class="title">${r.transaction_type} · ${r.animal_code || 'lote'}</div><div class="meta">${dateFmt(r.transaction_date)} · total $${r.total_amount}</div></div>`);
}
async function loadReproduction() {
  const rows = await api('/reproduction');
  renderList('reproductionList', rows, r => `<div class="list-item"><div class="title">${r.event_type} · ${r.female_code}</div><div class="meta">${dateFmt(r.event_date)} · cría ${r.calf_code || '-'}</div></div>`);
}
async function loadSupplies() {
  const rows = await api('/supplies');
  renderList('suppliesList', rows, r => `<div class="list-item"><div class="title">${r.item_name}</div><div class="meta">${r.current_stock} ${r.unit} · mínimo ${r.reorder_level}</div></div>`);
}
async function loadUsers() {
  if (state.user?.role !== 'admin') { document.getElementById('usersList').innerHTML = '<p class="muted">Solo administrador.</p>'; return; }
  const rows = await api('/users');
  renderList('usersList', rows, r => `<div class="list-item"><div class="title">${r.full_name}</div><div class="meta">${r.email} · ${r.role}</div></div>`);
}

function setupTabs() {
  $$('.tab').forEach(btn => btn.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $$('.form-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`${btn.dataset.tab}Form`).classList.remove('hidden');
  }));
  $$('.list-tab').forEach(btn => btn.addEventListener('click', () => {
    $$('.list-tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $$('.list-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(btn.dataset.list).classList.remove('hidden');
  }));
}

async function downloadReport(path, name) {
  try {
    const blob = await api(path, { method: 'GET' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  } catch (e) { alert(e.message); }
}

function showApp() {
  $('#loginView').classList.add('hidden');
  $('#mainView').classList.remove('hidden');
  $('#userLabel').textContent = `${state.user.name} · ${state.user.role}`;
  loadAll();
  flushQueue();
}

window.addEventListener('online', () => { setSyncStatus(); flushQueue(); });
window.addEventListener('offline', setSyncStatus);

$('#loginForm').addEventListener('submit', login);
$('#logoutBtn').addEventListener('click', logout);
$('#downloadPdf').addEventListener('click', () => downloadReport('/reports/weekly.pdf', 'reporte-semanal-el-rio.pdf'));
$('#downloadExcel').addEventListener('click', () => downloadReport('/reports/weekly.xlsx', 'reporte-semanal-el-rio.xlsx'));
submitForm('animalsForm', '/animals');
submitForm('weightsForm', '/weights');
submitForm('healthForm', '/health');
submitForm('movementsForm', '/movements');
submitForm('transactionsForm', '/transactions');
submitForm('reproductionForm', '/reproduction');
submitForm('suppliesForm', '/supplies');
submitForm('usersForm', '/users');
setupTabs();
setSyncStatus();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
if (state.token && state.user) showApp();
