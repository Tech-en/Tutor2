/**
 * orders.js
 * Order management module for TutorHub frontend.
 * Depends on: apiService.js (must load first)
 *
 * STATUS: Stub — implementation pending.
 * All functions are defined and safe to call.
 * Wire to backend by replacing the placeholder bodies below.
 *
 * Backend endpoints (from authRoutes / orderRoutes):
 *   POST   /api/v1/orders              → createOrder
 *   GET    /api/v1/orders/my-orders    → getMyOrders
 *   GET    /api/v1/orders/:id          → getOrderById
 *   PUT    /api/v1/orders/:id          → updateOrder
 *   DELETE /api/v1/orders/:id          → cancelOrder
 *   GET    /api/v1/orders/stats        → getOrderStats
 */

/* ── Create order ─────────────────────────────────────────────────────────── */
async function createOrder(orderData, files) {
  if (typeof API !== 'undefined') {
    return API.orders.createOrder(orderData, files);
  }
  console.warn('[orders.js] API not available — createOrder skipped');
  return null;
}

/* ── Get my orders ────────────────────────────────────────────────────────── */
async function getMyOrders(params) {
  if (typeof API !== 'undefined') {
    return API.orders.getMyOrders(params);
  }
  // Fallback: return localStorage orders in expected shape
  var stored = JSON.parse(localStorage.getItem('tutorHubOrders') || '[]');
  return { success: true, data: stored };
}

/* ── Get single order ─────────────────────────────────────────────────────── */
async function getOrderById(id) {
  if (typeof API !== 'undefined') {
    return API.orders.getOrderById(id);
  }
  return null;
}

/* ── Update order ─────────────────────────────────────────────────────────── */
async function updateOrder(id, data) {
  if (typeof API !== 'undefined') {
    return API.orders.updateOrder(id, data);
  }
  return null;
}

/* ── Cancel order ─────────────────────────────────────────────────────────── */
async function cancelOrder(id, reason) {
  if (typeof API !== 'undefined') {
    return API.orders.cancelOrder(id, reason);
  }
  return null;
}

/* ── Order statistics ─────────────────────────────────────────────────────── */
async function getOrderStats() {
  if (typeof API !== 'undefined') {
    return API.orders.getOrderStats();
  }
  return { success: true, data: { total: 0, pending: 0, completed: 0 } };
}

/* ── Status helpers ───────────────────────────────────────────────────────── */
function getStatusBadgeClass(status) {
  var map = {
    pending:     'status-pending',
    'in-progress': 'status-progress',
    completed:   'status-completed',
    cancelled:   'status-cancelled'
  };
  return map[status] || 'status-pending';
}

function getStatusDisplayText(status) {
  var map = {
    pending:     'Pending',
    'in-progress': 'In Progress',
    completed:   'Completed',
    cancelled:   'Cancelled'
  };
  return map[status] || status;
}

/* ── Expose globally ──────────────────────────────────────────────────────── */
window.createOrder         = createOrder;
window.getMyOrders         = getMyOrders;
window.getOrderById        = getOrderById;
window.updateOrder         = updateOrder;
window.cancelOrder         = cancelOrder;
window.getOrderStats       = getOrderStats;
window.getStatusBadgeClass = getStatusBadgeClass;
window.getStatusDisplayText = getStatusDisplayText;

console.log('✅ orders.js loaded');
