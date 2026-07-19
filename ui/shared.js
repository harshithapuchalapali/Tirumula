const UI = {
  toast(msg, type = 's') {
    const icons = { s: 'fa-check-circle', e: 'fa-exclamation-circle', w: 'fa-exclamation-triangle' };
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = '<i class="fas ' + (icons[type] || icons.s) + '"></i> ' + msg;
    (document.getElementById('userToast') || document.getElementById('adminToast') || document.getElementById('toast')).appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 2500);
  },

  showPasswordModal() {
    const overlay = document.getElementById('pwOverlay');
    const modal = document.getElementById('pwModal');
    const input = document.getElementById('pwInput');
    const submit = document.getElementById('pwSubmit');
    const close = document.getElementById('pwClose');
    const err = document.getElementById('pwErr');

    input.value = '';
    err.textContent = '';
    overlay.classList.add('open');
    modal.classList.add('open');
    setTimeout(() => input.focus(), 100);

    const closeFn = () => { overlay.classList.remove('open'); modal.classList.remove('open'); };
    close.onclick = closeFn;
    overlay.onclick = closeFn;

    submit.onclick = async () => {
      const pw = input.value.trim();
      if (!pw) { err.textContent = 'Enter password'; return; }
      try {
        const { data, error } = await sb.from('admins').select('password_hash').eq('username', 'admin').maybeSingle();
        if (error || !data) { err.textContent = 'Run supabase-setup.sql first — admins table missing or no admin row'; return; }
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
        const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
        console.log('Entered hash:', hex);
        console.log('Stored hash:', data.password_hash);
        if (hex === data.password_hash) {
          localStorage.setItem('td_admin', 'true');
          window.location.href = 'admin.html';
        } else {
          err.textContent = 'Incorrect password';
          input.value = '';
          input.focus();
        }
      } catch (e) {
        err.textContent = 'Server error — check console for details';
        console.error(e);
      }
    };
    input.onkeydown = e => { if (e.key === 'Enter') submit.click(); };
  },

  checkAdminGate() {
    if (localStorage.getItem('td_admin') !== 'true') {
      window.location.href = 'index.html';
    }
  },

  logout() {
    localStorage.removeItem('td_admin');
    window.location.href = 'index.html';
  },

  formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
  }
};
