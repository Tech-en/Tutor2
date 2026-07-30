/**
 * apiService.js
 * Central fetch wrapper for all backend communication.
 * Backend base: POST /api/v1/auth/register  → { success, token, user }
 *               POST /api/v1/auth/login     → { success, token, user }
 *               GET  /api/v1/auth/profile   → { success, data }
 */

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api/v1',
  TIMEOUT:  30000
};

/* ── Token helpers ─────────────────────────────────────────────────────────── */

function getAuthToken()       { return localStorage.getItem('token'); }
function setAuthToken(token)  { localStorage.setItem('token', token); }
function removeAuthToken()    { localStorage.removeItem('token'); localStorage.removeItem('user'); }

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
function setStoredUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/* ── Core fetch wrapper ────────────────────────────────────────────────────── */

async function apiFetch(endpoint, options = {}) {
  const url     = API_CONFIG.BASE_URL + endpoint;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token   = getAuthToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const res  = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timer);

    // Parse JSON if available
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      // 401 → clear token and redirect unless already on auth pages
      if (res.status === 401) {
        removeAuthToken();
        const page = window.location.pathname.split('/').pop();
        if (page !== 'login.html' && page !== 'register.html') {
          window.location.href = 'login.html';
        }
      }
      throw new Error((data && data.message) || 'Request failed (' + res.status + ')');
    }

    return data;

  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
    if (err.message === 'Failed to fetch') throw new Error('Cannot reach server. Check your connection.');
    throw err;
  }
}

/* ── Auth API ──────────────────────────────────────────────────────────────── */
// Backend responses:
//   register → { success: true, token, user }
//   login    → { success: true, token, user }
//   profile  → { success: true, data: user }

const authAPI = {
  async register(payload) {
    const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    if (res.token) { setAuthToken(res.token); setStoredUser(res.user); }
    return res;
  },
  async login(email, password) {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.token) { setAuthToken(res.token); setStoredUser(res.user); }
    return res;
  },
  async getProfile() {
    const res = await apiFetch('/auth/profile', { method: 'GET' });
    if (res.data) setStoredUser(res.data);
    return res;
  },
  async updateProfile(payload) {
    const res = await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
    if (res.data) setStoredUser(res.data);
    return res;
  },
  async changePassword(currentPassword, newPassword) {
    return apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
  },
  logout() {
    removeAuthToken();
    window.location.href = 'login.html';
  }
};

/* ── Orders API ────────────────────────────────────────────────────────────── */

const ordersAPI = {
  async createOrder(orderData, files) {
    const token = getAuthToken();
    const form  = new FormData();
    Object.keys(orderData).forEach(k => form.append(k, orderData[k]));
    if (files) Array.from(files).forEach(f => form.append('files', f));
    const res = await fetch(API_CONFIG.BASE_URL + '/orders', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },
  async getMyOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/orders/my-orders' + (qs ? '?' + qs : ''));
  },
  async getOrderById(id)            { return apiFetch('/orders/' + id); },
  async updateOrder(id, data)       { return apiFetch('/orders/' + id, { method: 'PUT',    body: JSON.stringify(data) }); },
  async cancelOrder(id, reason)     { return apiFetch('/orders/' + id, { method: 'DELETE', body: JSON.stringify({ reason }) }); },
  async getOrderStats()             { return apiFetch('/orders/stats'); }
};

/* ── Payments API ──────────────────────────────────────────────────────────── */

const paymentsAPI = {
  async processPayment(data) { return apiFetch('/payments/process', { method: 'POST', body: JSON.stringify(data) }); },
  async getMyPayments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/payments/my-payments' + (qs ? '?' + qs : ''));
  },
  async getPaymentById(id)   { return apiFetch('/payments/' + id); },
  async getPaymentStats()    { return apiFetch('/payments/stats'); }
};

/* ── Utility helpers ───────────────────────────────────────────────────────── */

function isAuthenticated()          { return !!getAuthToken(); }
function requireAuth(url)           { if (!isAuthenticated()) { window.location.href = url || 'login.html'; return false; } return true; }

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
}
function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}
function debounce(fn, wait) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}

/* ── Expose globally ───────────────────────────────────────────────────────── */

window.API = {
  auth:     authAPI,
  orders:   ordersAPI,
  payments: paymentsAPI
};

window.getAuthToken      = getAuthToken;
window.getStoredUser     = getStoredUser;
window.isAuthenticated   = isAuthenticated;
window.requireAuth       = requireAuth;
window.formatCurrency    = formatCurrency;
window.formatDate        = formatDate;
window.formatDateTime    = formatDateTime;
window.debounce          = debounce;

console.log('✅ apiService loaded');
