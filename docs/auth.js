/* ═══════════════════════════════════════════════════════════════════
   Synergy Systems — demo authentication (client-side, simulated OAuth)
   Providers: Google · Apple · GitHub · Email
   Session persists in localStorage. Swap the simulated flow for real
   Google Identity Services / Sign in with Apple by replacing the
   completeSignIn() internals and adding the provider SDK scripts.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'synergy_user';
  var PALETTE = ['#02817d', '#BD5F83', '#111111', '#7a5aa6', '#b8792a', '#2f7d4f'];

  var LOGOS = {
    google:
      '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
      '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
      '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
      '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
      '</svg>',
    apple:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="#111" aria-hidden="true">' +
      '<path d="M16.365 1.43c0 1.14-.42 2.2-1.11 2.99-.81.94-2.14 1.66-3.24 1.57-.07-1.12.4-2.31 1.08-3.1C13.83 1.88 15.2 1.2 16.31 1.24c.02.06.06.12.06.19zM20.2 17.13c-.51 1.17-1.25 2.55-2.15 3.65-.79.96-1.58 1.93-2.84 1.95-1.24.03-1.64-.72-3.06-.72-1.42 0-1.86.7-3.03.75-1.21.05-2.13-1.04-2.93-2-1.79-2.56-3.15-7.25-1.32-10.41.91-1.58 2.53-2.58 4.29-2.61 1.34-.03 2.6.9 3.42.9.82 0 2.36-1.11 3.97-.95.68.03 2.58.27 3.8 2.06-.1.06-2.27 1.32-2.24 3.94.03 3.14 2.75 4.18 2.78 4.2-.02.06-.43 1.49-1.42 2.94z"/>' +
      '</svg>',
    github:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="#111" aria-hidden="true">' +
      '<path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3z"/>' +
      '</svg>',
    email:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>' +
      '</svg>'
  };

  var PROVIDERS = {
    google: {
      name: 'Google',
      demo: [
        { name: 'Alex Rivera', email: 'alex.rivera@gmail.com' },
        { name: 'Marina Chen', email: 'marina.chen@gmail.com' }
      ]
    },
    apple: {
      name: 'Apple',
      demo: [
        { name: 'Sam Taylor', email: 'sam.taylor@icloud.com' },
        { name: 'Emily Stone', email: 'emily.stone@icloud.com' }
      ]
    },
    github: {
      name: 'GitHub',
      demo: [
        { name: 'Cody Turner', email: 'cody.turner@github.com' }
      ]
    },
    email: { name: 'Email' }
  };

  /* ── helpers ─────────────────────────────────────── */
  function get() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function set(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    document.dispatchEvent(new CustomEvent('synergy:authchange', { detail: user }));
  }
  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    document.dispatchEvent(new CustomEvent('synergy:authchange', { detail: null }));
  }
  function hashStr(s) {
    var h = 0, i;
    for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function initials(name) {
    return name.trim().split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase();
  }
  function colorFor(email) { return PALETTE[hashStr(email) % PALETTE.length]; }
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function firstWord(name) { return name.trim().split(/\s+/)[0] || 'there'; }

  function completeSignIn(provider, name, email) {
    var user = {
      id: 'demo_' + hashStr(email).toString(36),
      provider: provider,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      joinedAt: new Date().toISOString(),
      color: colorFor(email),
      stats: {
        requests: 40 + (hashStr(email) % 360),
        saved: 3 + (hashStr(email) % 18)
      }
    };
    set(user);
    closeModal();
    toast('Welcome, ' + firstWord(user.name) + '! You are signed in.');
    renderNav();
    renderProfile();
  }

  /* ── toast ───────────────────────────────────────── */
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'auth-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    window.setTimeout(function () { t.classList.add('auth-toast--out'); }, 2600);
    window.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
  }

  /* ── modal ───────────────────────────────────────── */
  var modal, stage, providersEl;

  function modalHTML() {
    return (
      '<div class="auth-modal" id="authModal" hidden>' +
      '  <div class="auth-modal__backdrop" data-auth-close></div>' +
      '  <div class="auth-modal__card" role="dialog" aria-modal="true" aria-labelledby="authTitle">' +
      '    <button class="auth-modal__close" data-auth-close aria-label="Close" type="button">&times;</button>' +
      '    <img class="auth-modal__mark" src="assets/favicon/favicon-synergy-systems.png" width="34" height="34" alt="Synergy Systems"/>' +
      '    <h2 id="authTitle">Sign in</h2>' +
      '    <p class="auth-modal__sub">Continue to the Synergy Systems developer portal.</p>' +
      '    <div class="auth-providers" id="authProviders">' +
      '      <button class="auth-provider" type="button" data-provider="google">' + LOGOS.google + 'Continue with Google</button>' +
      '      <button class="auth-provider" type="button" data-provider="apple">' + LOGOS.apple + 'Continue with Apple</button>' +
      '      <button class="auth-provider" type="button" data-provider="github">' + LOGOS.github + 'Continue with GitHub</button>' +
      '      <div class="auth-or"><span>or</span></div>' +
      '      <button class="auth-provider" type="button" data-provider="email">' + LOGOS.email + 'Continue with email</button>' +
      '    </div>' +
      '    <div class="auth-stage" id="authStage" hidden></div>' +
      '    <p class="auth-modal__note">Demo · simulated sign-in — no real account is created</p>' +
      '  </div>' +
      '</div>'
    );
  }

  function ensureModal() {
    if (modal) return;
    var div = document.createElement('div');
    div.innerHTML = modalHTML();
    document.body.appendChild(div.firstChild);
    modal = document.getElementById('authModal');
    stage = document.getElementById('authStage');
    providersEl = document.getElementById('authProviders');

    modal.querySelectorAll('[data-auth-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    providersEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-provider]');
      if (btn) startProvider(btn.getAttribute('data-provider'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });
  }

  function openModal() {
    ensureModal();
    modal.hidden = false;
    stage.hidden = true;
    providersEl.hidden = false;
    document.body.classList.add('auth-open');
    document.getElementById('authTitle').focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('auth-open');
  }

  /* ── provider flow ───────────────────────────────── */
  function startProvider(provider) {
    var p = PROVIDERS[provider];
    providersEl.hidden = true;
    stage.hidden = false;
    stage.innerHTML =
      '<div class="auth-spinner">' +
      '  <span class="auth-spinner__ring"></span>' +
      '  <span>Connecting to ' + esc(p.name) + '…</span>' +
      '</div>';
    window.setTimeout(function () {
      if (p.demo && p.demo.length) showChooser(provider);
      else showForm(provider);
    }, 950);
  }

  function showSpinner(msg) {
    stage.innerHTML =
      '<div class="auth-spinner">' +
      '  <span class="auth-spinner__ring"></span>' +
      '  <span>' + msg + '</span>' +
      '</div>';
  }

  function showChooser(provider) {
    var p = PROVIDERS[provider];
    var html =
      '<button class="auth-back" type="button" data-auth-back>&larr; Choose another option</button>' +
      '<div class="auth-chooser">';
    p.demo.forEach(function (acc) {
      var c = colorFor(acc.email);
      html +=
        '<button class="auth-account" type="button" data-account="' + esc(acc.name) + '" data-email="' + esc(acc.email) + '">' +
        '  <span class="auth-account__avatar" style="background:' + c + '">' + initials(acc.name) + '</span>' +
        '  <span><span class="auth-account__name">' + esc(acc.name) + '</span><br/><span class="auth-account__email">' + esc(acc.email) + '</span></span>' +
        '</button>';
    });
    html +=
      '<button class="auth-account auth-account--other" type="button" data-provider-form="' + provider + '">Use another account</button>' +
      '</div>';
    stage.innerHTML = html;

    stage.querySelectorAll('[data-account]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-account');
        var email = btn.getAttribute('data-email');
        showSpinner('Signing you in…');
        window.setTimeout(function () { completeSignIn(provider, name, email); }, 900);
      });
    });
    stage.querySelector('[data-provider-form]').addEventListener('click', function () { showForm(provider); });
    stage.querySelector('[data-auth-back]').addEventListener('click', function () {
      stage.hidden = true;
      providersEl.hidden = false;
    });
  }

  function showForm(provider) {
    var p = PROVIDERS[provider];
    var nameVal = '', emailVal = '';
    if (provider === 'github') { nameVal = 'Cody Turner'; emailVal = 'cody.turner@github.com'; }
    if (provider === 'email') { nameVal = ''; emailVal = ''; }
    stage.innerHTML =
      '<button class="auth-back" type="button" data-auth-back>&larr; Choose another option</button>' +
      '<form class="auth-form" id="authForm" novalidate>' +
      '  <label for="authName">Full name</label>' +
      '  <input id="authName" name="name" type="text" placeholder="Your name" value="' + esc(nameVal) + '" required/>' +
      '  <label for="authEmail">Email</label>' +
      '  <input id="authEmail" name="email" type="email" placeholder="you@example.com" value="' + esc(emailVal) + '" required/>' +
      '  <p class="auth-error" id="authError" hidden>Please enter a valid name and email.</p>' +
      '  <button class="btn btn--primary" type="submit">Continue</button>' +
      '</form>';
    var f = document.getElementById('authForm');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = f.name.value.trim();
      var em = f.email.value.trim();
      var err = document.getElementById('authError');
      if (!n || !validEmail(em)) {
        err.hidden = false;
        return;
      }
      err.hidden = true;
      showSpinner('Signing you in…');
      window.setTimeout(function () { completeSignIn(provider, n, em); }, 900);
    });
    stage.querySelector('[data-auth-back]').addEventListener('click', function () {
      stage.hidden = true;
      providersEl.hidden = false;
    });
    document.getElementById('authName').focus();
  }

  /* ── nav ─────────────────────────────────────────── */
  function renderNav() {
    var el = document.getElementById('navAuth');
    if (!el) return;
    var user = get();
    if (user) {
      el.innerHTML =
        '<a class="nav__user" href="profile.html" title="View profile">' +
        '  <span class="nav__user-avatar" style="background:' + user.color + '">' + esc(initials(user.name)) + '</span>' +
        '  <span class="nav__user-name">' + esc(user.name) + '</span>' +
        '</a>';
    } else {
      el.innerHTML =
        '<button class="nav__login" type="button" id="authLoginBtn">Log in</button>' +
        '<button class="nav__signin" type="button" id="authSignInBtn">Get started for free' +
        '<svg width="14" height="14" viewBox="0 0 37 18" fill="none" aria-hidden="true"><path d="M28.7208 1L36 9M36 9L28.7208 17M36 9H0" stroke="currentColor"/></svg>' +
        '</button>';
      document.getElementById('authLoginBtn').addEventListener('click', openModal);
      document.getElementById('authSignInBtn').addEventListener('click', openModal);
    }
  }

  /* ── profile page ────────────────────────────────── */
  function memberSince(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return '—'; }
  }

  function renderProfile() {
    var view = document.getElementById('profileView');
    if (!view) return;
    var user = get();
    if (!user) {
      view.innerHTML =
        '<div class="profile__empty">' +
        '  <span class="section__num">PROFILE</span>' +
        '  <div class="profile__avatar">?</div>' +
        '  <h1 class="profile__name">You are not signed in</h1>' +
        '  <p class="profile__email">Sign in with Google, Apple, GitHub or email to see your profile.</p>' +
        '  <div class="profile__actions">' +
        '    <button class="btn btn--primary" type="button" id="profileSignInBtn">Sign in</button>' +
        '    <a class="btn btn--ghost" href="index.html">Back to portal</a>' +
        '  </div>' +
        '</div>';
      document.getElementById('profileSignInBtn').addEventListener('click', openModal);
      return;
    }
    var p = PROVIDERS[user.provider] || { name: user.provider };
    view.innerHTML =
      '<div class="profile">' +
      '  <div class="profile__head">' +
      '    <span class="section__num">PROFILE</span>' +
      '    <div class="profile__avatar" style="background:' + user.color + '">' + esc(initials(user.name)) + '</div>' +
      '    <h1 class="profile__name">' + esc(user.name) + '</h1>' +
      '    <p class="profile__email">' + esc(user.email) + '</p>' +
      '    <div class="profile__badges">' +
      '      <span class="profile__badge profile__badge--provider">' + LOGOS[user.provider] + esc(p.name) + '</span>' +
      '      <span class="profile__badge">Free plan</span>' +
      '      <span class="profile__badge">&#10003; Verified</span>' +
      '    </div>' +
      '  </div>' +
      '  <p class="profile__meta">Member since <strong>' + memberSince(user.joinedAt) + '</strong> · Key <strong>sk_live_…' + esc(user.id.slice(-6)) + '</strong></p>' +
      '  <div class="profile__grid">' +
      '    <div class="profile__stat"><span class="profile__stat-num">' + user.stats.requests + '</span><span class="profile__stat-label">API requests</span></div>' +
      '    <div class="profile__stat"><span class="profile__stat-num">' + user.stats.saved + '</span><span class="profile__stat-label">Saved entities</span></div>' +
      '    <div class="profile__stat"><span class="profile__stat-num">v1.1</span><span class="profile__stat-label">API version</span></div>' +
      '  </div>' +
      '  <div class="profile__actions">' +
      '    <button class="btn btn--ghost" type="button" id="authSignOutBtn">Sign out</button>' +
      '    <a class="btn btn--primary" href="index.html">Back to portal</a>' +
      '  </div>' +
      '</div>';
    document.getElementById('authSignOutBtn').addEventListener('click', function () {
      clear();
      toast('You are signed out.');
      renderNav();
      renderProfile();
    });
  }

  /* ── init ────────────────────────────────────────── */
  function init() {
    renderNav();
    renderProfile();
    document.addEventListener('synergy:authchange', renderNav);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SynergyAuth = {
    getUser: get,
    openModal: openModal,
    closeModal: closeModal,
    signOut: function () { clear(); renderNav(); renderProfile(); }
  };
})();
