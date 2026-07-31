/**
 * payments.js
 * Payment processing module for TutorHub frontend.
 * Depends on: apiService.js (must load first)
 *
 * STATUS: Validation helpers are fully implemented.
 *         API calls are stubbed — wire to backend when ready.
 *
 * Backend endpoints:
 *   POST /api/v1/payments/process       → processPayment
 *   GET  /api/v1/payments/my-payments   → getMyPayments
 *   GET  /api/v1/payments/:id           → getPaymentById
 *   GET  /api/v1/payments/stats         → getPaymentStats
 */

/* ── Card validation (Luhn algorithm) ────────────────────────────────────── */
function isValidCardNumber(number) {
  var digits = String(number).replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  var sum = 0;
  var alt = false;
  for (var i = digits.length - 1; i >= 0; i--) {
    var n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/* ── Expiry date validation ───────────────────────────────────────────────── */
function isValidExpiryDate(value) {
  var match = String(value).match(/^(\d{2})\/?(\d{2,4})$/);
  if (!match) return false;
  var month = parseInt(match[1], 10);
  var year  = parseInt(match[2], 10);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return false;
  var expiry = new Date(year, month - 1, 1);
  var today  = new Date();
  today.setDate(1); today.setHours(0, 0, 0, 0);
  return expiry >= today;
}

/* ── Card type detection ──────────────────────────────────────────────────── */
function detectCardType(number) {
  var n = String(number).replace(/\s/g, '');
  if (/^4/.test(n))                     return 'visa';
  if (/^5[1-5]/.test(n))               return 'mastercard';
  if (/^3[47]/.test(n))                return 'amex';
  if (/^6011/.test(n))                  return 'discover';
  return 'unknown';
}

/* ── Mask card number ─────────────────────────────────────────────────────── */
function maskCardNumber(number) {
  var digits = String(number).replace(/\s/g, '');
  return '**** **** **** ' + digits.slice(-4);
}

/* ── Process payment ──────────────────────────────────────────────────────── */
// Named defaultProcessPayment (not processPayment) so this top-level function
// declaration doesn't get hoisted onto window.processPayment and silently clobber
// a page-specific implementation (e.g. dashboard.html's own processPayment(method)),
// which loads earlier but would otherwise be overwritten once this deferred script runs.
async function defaultProcessPayment(orderId, paymentData) {
  if (typeof API !== 'undefined') {
    return API.payments.processPayment({ orderId: orderId, ...paymentData });
  }
  console.warn('[payments.js] API not available — processPayment skipped');
  return null;
}

/* ── Get my payments ──────────────────────────────────────────────────────── */
async function getMyPayments(params) {
  if (typeof API !== 'undefined') {
    return API.payments.getMyPayments(params);
  }
  return { success: true, data: [] };
}

/* ── Get payment stats ────────────────────────────────────────────────────── */
async function getPaymentStats() {
  if (typeof API !== 'undefined') {
    return API.payments.getPaymentStats();
  }
  return { success: true, data: { total: 0, completed: 0, totalSpent: 0 } };
}

/* ── Status helpers ───────────────────────────────────────────────────────── */
function getPaymentStatusBadgeClass(status) {
  var map = {
    pending:    'status-pending',
    processing: 'status-progress',
    completed:  'status-completed',
    failed:     'status-cancelled'
  };
  return map[status] || 'status-pending';
}

function getPaymentMethodDisplayName(method) {
  var map = {
    'credit-card': 'Credit Card',
    'debit-card':  'Debit Card',
    paypal:        'PayPal',
    'bank-transfer': 'Bank Transfer'
  };
  return map[method] || method;
}

/* ── Expose globally ──────────────────────────────────────────────────────── */
window.isValidCardNumber          = isValidCardNumber;
window.isValidExpiryDate          = isValidExpiryDate;
window.detectCardType             = detectCardType;
window.maskCardNumber             = maskCardNumber;
if (typeof window.processPayment !== 'function') {
  window.processPayment = defaultProcessPayment;
}
window.getMyPayments              = getMyPayments;
window.getPaymentStats            = getPaymentStats;
window.getPaymentStatusBadgeClass = getPaymentStatusBadgeClass;
window.getPaymentMethodDisplayName = getPaymentMethodDisplayName;

console.log('✅ payments.js loaded');
