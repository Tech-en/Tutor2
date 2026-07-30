/**
 * auth.js
 * Authentication helpers used by login.html, register.html, and dashboard.html.
 * Depends on: apiService.js (must load first)
 */

/* ── Register ──────────────────────────────────────────────────────────────── */

async function register(firstName, lastName, email, password, phone, role) {
  const payload = {
    firstName: firstName.trim(),
    lastName:  lastName.trim(),
    email:     email.toLowerCase().trim(),
    password,
    role:      role || 'student'
  };
  // phone is accepted by the User model even though the controller
  // doesn't destructure it — attach if provided so the model saves it
  if (phone && phone.trim()) payload.phone = phone.trim();

  const res = await API.auth.register(payload);   // throws on error
  // Token + user already stored inside apiService.js authAPI.register()
  return res;
}

/* ── Login ─────────────────────────────────────────────────────────────────── */

async function login(email, password) {
  const res = await API.auth.login(email.toLowerCase().trim(), password);
  return res;
}

/* ── Logout ────────────────────────────────────────────────────────────────── */

function logout() {
  API.auth.logout();   // clears storage + redirects to login.html
}

/* ── User info helpers ─────────────────────────────────────────────────────── */

function getCurrentUser()    { return getStoredUser(); }
function isLoggedIn()        { return isAuthenticated(); }
function getUserRole()       { const u = getCurrentUser(); return u ? u.role : null; }
function isStudent()         { return getUserRole() === 'student'; }
function isTutor()           { return getUserRole() === 'tutor'; }
function isAdmin()           { return getUserRole() === 'admin'; }

function getUserFullName() {
  const u = getCurrentUser();
  if (!u) return 'User';
  return (u.firstName + ' ' + u.lastName).trim() || u.email.split('@')[0];
}

function getUserEmail() {
  const u = getCurrentUser(); return u ? u.email : null;
}

function getUserProfilePicture() {
  const u = getCurrentUser();
  return (u && u.profilePicture) ? u.profilePicture : 'assets/images/default-avatar.png';
}

/* ── Auth guard ────────────────────────────────────────────────────────────── */

// Call on any protected page — redirects to login if no token
function checkAuth(redirectUrl) {
  if (!isAuthenticated()) {
    window.location.href = redirectUrl || 'login.html';
    return false;
  }
  return true;
}

// Validate token against server (use on dashboard load)
async function initAuth() {
  if (!isAuthenticated()) return false;
  try {
    await API.auth.getProfile();
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
}

/* ── Auto-logout: re-validates token every 5 min ───────────────────────────── */

function setupAutoLogout() {
  setInterval(async function () {
    if (isAuthenticated()) {
      try { await API.auth.getProfile(); }
      catch { logout(); }
    }
  }, 5 * 60 * 1000);
}

/* ── Expose globally ───────────────────────────────────────────────────────── */

window.login            = login;
window.register         = register;
window.logout           = logout;
window.getCurrentUser   = getCurrentUser;
window.isLoggedIn       = isLoggedIn;
window.getUserRole      = getUserRole;
window.isStudent        = isStudent;
window.isTutor          = isTutor;
window.isAdmin          = isAdmin;
window.getUserFullName  = getUserFullName;
window.getUserEmail     = getUserEmail;
window.getUserProfilePicture = getUserProfilePicture;
window.checkAuth        = checkAuth;
window.initAuth         = initAuth;
window.setupAutoLogout  = setupAutoLogout;

setupAutoLogout();
console.log('✅ auth.js loaded');
