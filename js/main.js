/* ============================================================
   TEST — shared JS: navbar, auth state, toasts, form helpers
   ============================================================ */

/* ---------- Mobile nav drawer ---------- */
const MOBILE_BREAKPOINT = 860;

function buildMobileMenu() {
  if (document.querySelector('.mobile-menu')) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const menu = document.createElement('nav');
  menu.className = 'mobile-menu';
  menu.setAttribute('aria-label', 'Mobile navigation');

  // Clone page links from the existing .nav-links so active state is preserved
  const desktopLinks = document.querySelector('.nav-links');
  const linkIcons = {
    'home': 'fa-house', 'about': 'fa-user-astronaut',
    'blog': 'fa-newspaper', 'contact': 'fa-paper-plane',
  };
  let linksHTML = '<ul>';
  if (desktopLinks) {
    desktopLinks.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const key = Object.keys(linkIcons).find(k => href.toLowerCase().includes(k));
      const icon = key ? linkIcons[key] : 'fa-link';
      const active = a.classList.contains('active') ? ' active' : '';
      linksHTML += `<li><a href="${href}" class="mm-link${active}"><i class="fa-solid ${icon}"></i> ${a.textContent.trim()}</a></li>`;
    });
  }
  linksHTML += '</ul>';

  menu.innerHTML = `
    <div class="mm-auth-guest" style="display:none;">
      <a href="login.html" class="btn btn-primary btn-block" style="margin-bottom:10px;">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
      </a>
      <a href="signup.html" class="btn btn-ghost btn-block">
        <i class="fa-solid fa-user-plus"></i> Create Account
      </a>
      <div class="mm-divider"></div>
    </div>
    <div class="mm-auth-user" style="display:none;">
      <div class="mm-user">
        <div class="avatar">U</div>
        <div class="meta">
          <strong class="mm-name">User</strong>
          <span class="mm-email">user@example.com</span>
        </div>
        <button class="mm-logout" title="Log out"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
      <div class="mm-divider"></div>
    </div>
    ${linksHTML}
  `;
  document.body.appendChild(menu);

  // Close when any link is tapped
  menu.querySelectorAll('a.mm-link, .mm-auth-guest a').forEach(a =>
    a.addEventListener('click', closeMobileMenu)
  );
  menu.querySelector('.mm-logout')?.addEventListener('click', () => {
    closeMobileMenu();
    logout();
  });
  backdrop.addEventListener('click', closeMobileMenu);

  updateMobileAuthUI();
}

function openMobileMenu() {
  const menu = document.querySelector('.mobile-menu');
  const backdrop = document.querySelector('.nav-backdrop');
  const toggle = document.querySelector('.nav-toggle');
  if (!menu) return;
  menu.classList.add('show');
  backdrop?.classList.add('show');
  toggle?.classList.add('open');
  toggle?.setAttribute('aria-expanded', 'true');
  const icon = toggle?.querySelector('i');
  if (icon) icon.className = 'fa-solid fa-xmark';
  document.body.classList.add('no-scroll');
}

function closeMobileMenu() {
  const menu = document.querySelector('.mobile-menu');
  const backdrop = document.querySelector('.nav-backdrop');
  const toggle = document.querySelector('.nav-toggle');
  menu?.classList.remove('show');
  backdrop?.classList.remove('show');
  toggle?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  const icon = toggle?.querySelector('i');
  if (icon) icon.className = 'fa-solid fa-bars';
  document.body.classList.remove('no-scroll');
}

function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }

function updateMobileAuthUI() {
  const user = Store.current();
  const guestBox = document.querySelector('.mm-auth-guest');
  const userBox = document.querySelector('.mm-auth-user');
  if (!guestBox || !userBox) return;
  if (user) {
    guestBox.style.display = 'none';
    userBox.style.display = 'block';
    userBox.querySelector('.mm-name').textContent = user.name;
    userBox.querySelector('.mm-email').textContent = user.email;
    userBox.querySelector('.avatar').textContent = (user.name[0] || 'U').toUpperCase();
  } else {
    guestBox.style.display = 'block';
    userBox.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildMobileMenu();

  const toggle = document.querySelector('.nav-toggle');
  toggle?.addEventListener('click', () => {
    const menu = document.querySelector('.mobile-menu');
    if (menu?.classList.contains('show')) closeMobileMenu();
    else openMobileMenu();
  });

  // Close drawer with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Reset state if the window grows to desktop width
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  });

  updateAuthUI();
});

/* ---------- Tiny user store (localStorage) ---------- */
const Store = {
  users() { return JSON.parse(localStorage.getItem('test_users') || '[]'); },
  saveUsers(u) { localStorage.setItem('test_users', JSON.stringify(u)); },
  current() { return JSON.parse(localStorage.getItem('test_current') || 'null'); },
  setCurrent(u) { localStorage.setItem('test_current', JSON.stringify(u)); },
  clearCurrent() { localStorage.removeItem('test_current'); },
};

/* ---------- Toast notifications ---------- */
function toast(message, type = 'info', title = '') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <div class="msg">${title ? `<strong>${title}</strong>` : ''}${message}</div>`;
  stack.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 300);
  }, 4000);
}

/* ---------- Update navbar based on auth ---------- */
function updateAuthUI() {
  const user = Store.current();
  const chip = document.querySelector('.user-chip');
  const loginBtn = document.querySelector('.nav-login-btn');
  if (user) {
    if (chip) {
      chip.classList.add('show');
      chip.querySelector('.uname').textContent = user.name;
      chip.querySelector('.avatar').textContent = (user.name[0] || 'U').toUpperCase();
    }
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    if (chip) chip.classList.remove('show');
    if (loginBtn) loginBtn.style.display = '';
  }
  // keep mobile drawer in sync too
  if (typeof updateMobileAuthUI === 'function') updateMobileAuthUI();
}

function logout() {
  Store.clearCurrent();
  updateAuthUI();
  toast('You have been logged out.', 'info', 'Signed out');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

/* ---------- Validators ---------- */
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const setError = (el, msg) => {
  const err = el.parentElement.querySelector('.form-error') || el.nextElementSibling;
  if (err && err.classList.contains('form-error')) {
    err.textContent = msg;
    err.classList.add('show');
  }
};
const clearErrors = form => {
  form.querySelectorAll('.form-error').forEach(e => { e.textContent = ''; e.classList.remove('show'); });
};

/* ---------- Password visibility toggle ---------- */
function bindPasswordToggles(scope = document) {
  scope.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  });
}

/* ---------- Password strength meter ---------- */
function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}
function renderStrength(pw, bar) {
  const wrap = bar.parentElement;
  if (!pw) { wrap.classList.remove('show'); return; }
  wrap.classList.add('show');
  const s = passwordStrength(pw);
  const widths = ['25%', '50%', '75%', '100%'];
  const colors = ['#ff5470', '#ffb020', '#00e5ff', '#2ecc71'];
  const i = Math.min(s, 4) - 1;
  if (i < 0) { bar.style.width = '10%'; bar.style.background = '#ff5470'; return; }
  bar.style.width = widths[i];
  bar.style.background = colors[i];
}

/* ---------- Modal helper ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('show');
}
function closeModal(el) {
  const m = el.closest('.modal-overlay');
  if (m) m.classList.remove('show');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('show');
});
