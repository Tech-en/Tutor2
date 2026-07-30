/**
 * main.js
 * Dashboard initialisation module for TutorHub frontend.
 * Depends on: apiService.js, auth.js, orders.js, payments.js
 *
 * STATUS: Stub — safe to load, no errors thrown.
 * Extend this file to add dashboard-specific initialisation
 * logic (stats widgets, recent activity feeds, etc.)
 *
 * Load order in dashboard.html:
 *   <script src="js/apiService.js" defer></script>
 *   <script src="js/auth.js"       defer></script>
 *   <script src="js/orders.js"     defer></script>
 *   <script src="js/payments.js"   defer></script>
 *   <script src="js/main.js"       defer></script>
 */

var AppState = {
  currentUser:  null,
  currentPage:  'home',
  orders:       [],
  payments:     [],
  stats: {
    orders:   null,
    payments: null
  },
  loading: {
    orders:   false,
    payments: false,
    stats:    false
  },
  filters: {
    orderStatus:   'all',
    paymentStatus: 'all',
    searchQuery:   ''
  }
};

/* ── Dashboard init ───────────────────────────────────────────────────────── */
async function initDashboard() {
  if (typeof isAuthenticated !== 'function' || !isAuthenticated()) return;

  AppState.currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

  try {
    if (typeof getOrderStats === 'function') {
      AppState.stats.orders = await getOrderStats();
    }
  } catch (e) {
    console.warn('[main.js] Could not load order stats:', e.message);
  }

  try {
    if (typeof getPaymentStats === 'function') {
      AppState.stats.payments = await getPaymentStats();
    }
  } catch (e) {
    console.warn('[main.js] Could not load payment stats:', e.message);
  }
}

/* ── UI helpers ───────────────────────────────────────────────────────────── */
function updateElementText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showLoadingOverlay(message) {
  var el = document.getElementById('loadingOverlay');
  if (el) {
    el.querySelector('.loading-message') && (el.querySelector('.loading-message').textContent = message || 'Loading…');
    el.style.display = 'flex';
  }
}

function hideLoadingOverlay() {
  var el = document.getElementById('loadingOverlay');
  if (el) el.style.display = 'none';
}

/* ── Auto-init on DOMContentLoaded ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initDashboard().catch(function (e) {
    console.warn('[main.js] Dashboard init error:', e.message);
  });
});

/* ── Expose globally ──────────────────────────────────────────────────────── */
window.AppState          = AppState;
window.initDashboard     = initDashboard;
window.updateElementText = updateElementText;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;

console.log('✅ main.js loaded');
