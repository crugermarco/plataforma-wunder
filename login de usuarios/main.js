class LoginApp {
  constructor() {
    this.scriptURL = "https://script.google.com/macros/s/AKfycbxQdztvWiCJUEyIiVKgyJOylIC5QvY_SLQ9sRSpqjA49mqRp9NftDaNcFcuZaGYmLWC/exec";
    this.initializeElements();
    this.setupEventListeners();
    this.loadRememberedCredentials();
  }

  initializeElements() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.loginBtn = document.getElementById('loginBtn');
    this.statusMessage = document.getElementById('statusMessage');
    this.rememberMe = document.getElementById('rememberMe');
    this.minimizeBtn = document.getElementById('minimizeBtn');
    this.closeBtn = document.getElementById('closeBtn');
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleLogin(e));
    this.minimizeBtn?.addEventListener('click', () => this.minimizeWindow());
    this.closeBtn?.addEventListener('click', () => this.closeWindow());
    this.rememberMe.addEventListener('change', () => this.saveRememberedCredentials());
    this.emailInput.addEventListener('input', () => this.saveRememberedCredentials());
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showStatus('Por favor completa todos los campos', 'error');
      return;
    }

    this.setLoadingState(true);
    this.showStatus('Verificando credenciales...', 'loading');

    try {
      const url = `${this.scriptURL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        this.showStatus(`¡Bienvenido, ${result.user.name}!`, 'success');
        if (this.rememberMe.checked) this.saveRememberedCredentials();

        setTimeout(() => this.launchApplications(result.user), 1500);
      } else {
        this.showStatus(result.message || 'Error de autenticación', 'error');
      }
    } catch (err) {
      console.error(err);
      this.showStatus('Error de conexión. Intenta nuevamente.', 'error');
    }

    this.setLoadingState(false);
  }

  launchApplications(user) {
    localStorage.setItem('userSession', JSON.stringify(user));

    window.location.href = './dashboard/dashboard.html';

  }

  setLoadingState(loading) {
    this.loginBtn.disabled = loading;
    this.emailInput.disabled = loading;
    this.passwordInput.disabled = loading;
    this.loginBtn.innerHTML = loading ? '<div class="loader"></div>Verificando...' : 'Iniciar Sesión';
  }

  showStatus(message, type) {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message status-${type}`;
    this.statusMessage.style.display = 'block';

    if (type !== 'loading') {
      setTimeout(() => (this.statusMessage.style.display = 'none'), 5000);
    }
  }

  saveRememberedCredentials() {
    if (this.rememberMe.checked) {
      this.savedCredentials = { email: this.emailInput.value, rememberMe: true };
    } else {
      this.savedCredentials = null;
    }
  }

  loadRememberedCredentials() {
    if (this.savedCredentials) {
      this.emailInput.value = this.savedCredentials.email || '';
      this.rememberMe.checked = true;
    }
  }

  minimizeWindow() {
    if (window.electronAPI) window.electronAPI.minimize();
  }

  closeWindow() {
    if (window.electronAPI) window.electronAPI.close();
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginApp());
