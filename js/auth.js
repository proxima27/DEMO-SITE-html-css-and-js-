/* ============================================================
   TEST — auth pages logic (login / signup / forgot / reset)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- SIGNUP ---------- */
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    bindPasswordToggles(signupForm);
    const pwInput = signupForm.querySelector('#password');
    const strengthBar = signupForm.querySelector('.strength-bar');
    pwInput.addEventListener('input', () => renderStrength(pwInput.value, strengthBar));

    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(signupForm);
      const name = signupForm.querySelector('#name').value.trim();
      const email = signupForm.querySelector('#email').value.trim().toLowerCase();
      const password = signupForm.querySelector('#password').value;
      const terms = signupForm.querySelector('#terms').checked;

      let ok = true;
      if (name.length < 2) { setError(signupForm.querySelector('#name'), 'Please enter your name.'); ok = false; }
      if (!validEmail(email)) { setError(signupForm.querySelector('#email'), 'Enter a valid email address.'); ok = false; }
      if (password.length < 6) { setError(signupForm.querySelector('#password'), 'Password must be at least 6 characters.'); ok = false; }
      if (!terms) { toast('Please accept the Terms & Privacy Policy.', 'warning'); ok = false; }
      if (!ok) return;

      const users = Store.users();
      if (users.find(u => u.email === email)) {
        setError(signupForm.querySelector('#email'), 'An account with this email already exists.');
        return;
      }
      users.push({ name, email, password, createdAt: new Date().toISOString() });
      Store.saveUsers(users);
      Store.setCurrent({ name, email });
      toast('Account created! Welcome to TEST.', 'success', 'Signed up');
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    });
  }

  /* ---------- Seed demo account (login: demo / demo123) ---------- */
  (function seedDemo() {
    const users = Store.users();
    if (!users.find(u => u.email === 'demo@test.dev')) {
      users.push({ name: 'Demo User', email: 'demo@test.dev', password: 'demo123', createdAt: new Date().toISOString() });
      Store.saveUsers(users);
    }
  })();

  /* ---------- LOGIN ---------- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    bindPasswordToggles(loginForm);

    // One-click demo login button
    const demoBtn = document.getElementById('demo-login');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        loginForm.querySelector('#email').value = 'demo';
        loginForm.querySelector('#password').value = 'demo123';
        loginForm.requestSubmit();
      });
    }

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(loginForm);
      let email = loginForm.querySelector('#email').value.trim().toLowerCase();
      const password = loginForm.querySelector('#password').value;

      // Allow username "demo" as a shortcut for the demo account
      if (email === 'demo') email = 'demo@test.dev';

      if (!validEmail(email)) { setError(loginForm.querySelector('#email'), 'Enter a valid email (or use "demo").'); return; }
      if (!password) { setError(loginForm.querySelector('#password'), 'Enter your password.'); return; }

      const user = Store.users().find(u => u.email === email);
      if (!user || user.password !== password) {
        toast('Invalid email or password.', 'error', 'Login failed');
        return;
      }
      Store.setCurrent({ name: user.name, email: user.email });
      toast(`Welcome back, ${user.name}!`, 'success', 'Logged in');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    });
  }

  /* ---------- FORGOT PASSWORD ---------- */
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(forgotForm);
      const email = forgotForm.querySelector('#email').value.trim().toLowerCase();
      if (!validEmail(email)) { setError(forgotForm.querySelector('#email'), 'Enter a valid email.'); return; }
      const user = Store.users().find(u => u.email === email);
      if (!user) {
        setError(forgotForm.querySelector('#email'), 'No account found with that email.');
        return;
      }
      // Simulate sending a reset link / code
      const code = Math.floor(100000 + Math.random() * 900000);
      // store a short-lived reset request
      localStorage.setItem('test_reset', JSON.stringify({ email, code, ts: Date.now() }));
      const box = document.getElementById('reset-sent');
      box.style.display = 'block';
      box.querySelector('.reset-email').textContent = email;
      box.querySelector('.reset-code').textContent = code;
      forgotForm.querySelector('button[type="submit"]').disabled = true;
      toast('Password reset code generated (demo).', 'success', 'Check your inbox');
    });

    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
      verifyForm.addEventListener('submit', e => {
        e.preventDefault();
        clearErrors(verifyForm);
        const code = verifyForm.querySelector('#code').value.trim();
        const pw = verifyForm.querySelector('#new-password').value;
        const pw2 = verifyForm.querySelector('#confirm-password').value;
        const reset = JSON.parse(localStorage.getItem('test_reset') || 'null');
        if (!reset || code !== String(reset.code)) {
          setError(verifyForm.querySelector('#code'), 'Invalid or expired code.');
          return;
        }
        if (pw.length < 6) { setError(verifyForm.querySelector('#new-password'), 'At least 6 characters.'); return; }
        if (pw !== pw2) { setError(verifyForm.querySelector('#confirm-password'), 'Passwords do not match.'); return; }
        const users = Store.users();
        const u = users.find(x => x.email === reset.email);
        if (u) { u.password = pw; Store.saveUsers(users); }
        localStorage.removeItem('test_reset');
        toast('Your password has been reset. You can now log in.', 'success', 'All set!');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      });
      bindPasswordToggles(verifyForm);
    }
  }

  /* ---------- CONTACT form ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(contactForm);
      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();
      const msg = contactForm.querySelector('#message').value.trim();
      if (!name) { setError(contactForm.querySelector('#name'), 'Enter your name.'); return; }
      if (!validEmail(email)) { setError(contactForm.querySelector('#email'), 'Enter a valid email.'); return; }
      if (msg.length < 10) { setError(contactForm.querySelector('#message'), 'Message should be at least 10 characters.'); return; }
      contactForm.reset();
      toast('Thanks for reaching out! I will get back to you soon.', 'success', 'Message sent');
    });
  }

  /* ---------- Newsletter ---------- */
  document.querySelectorAll('.nl-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input').value.trim();
      if (!validEmail(email)) { toast('Please enter a valid email.', 'warning'); return; }
      form.reset();
      toast('You are subscribed to TEST updates.', 'success', 'Subscribed!');
    });
  });
});
