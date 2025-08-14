console.log("dashboard.js cargado");

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('userSession'));

  if (!user) {
    alert('Sesión no iniciada. Por favor inicia sesión.');
    window.location.href = 'index.html';
    return;
  }

  const nombreUsuario = user["USUARIO"] || 'Usuario';
  const userNameSpan = document.getElementById('userNameDisplay');
  if (userNameSpan) userNameSpan.textContent = nombreUsuario;

  const appsGrid = document.getElementById('appsGrid');
  if (!appsGrid) {
    console.error('No se encontró el contenedor de apps (appsGrid)');
    return;
  }

  const appDefinitions = {
    rotaciones: './rotaciones/index.html',
    vencimientos: './vencimientos/index.html',
    wunder: './wunder/index.html',
    empleados: './empleados/index.html',
    reportes: './reportes/index.html',
    enfermeria: './enfermeria/index.html',
    produccion: './produccion/index.html',
    calidad: './calidad/index.html',
    configuracion: './cnc/index.html'
  };

  const cards = appsGrid.querySelectorAll('.app-card');
  cards.forEach(card => {
    const appId = card.getAttribute('data-app');
    if (!appId) return;

    const permisoRaw = String(user[appId] || '').trim().toLowerCase();
    const hasAccess = permisoRaw === 'true' || permisoRaw === 'verdadero';

    const statusDiv = card.querySelector('.app-status');
    if (statusDiv) {
      statusDiv.textContent = hasAccess ? 'Activo' : 'Restringido';
      statusDiv.className = 'app-status ' + (hasAccess ? 'status-active' : 'status-restricted');
    }

    const openBtn = card.querySelector('.action-btn.primary');
    const infoBtn = card.querySelector('.action-btn.info-btn');

    if (openBtn) {
      openBtn.disabled = !hasAccess;
      openBtn.textContent = hasAccess ? 'Abrir' : 'Restringido';
      if (hasAccess && appDefinitions[appId]) {
        openBtn.setAttribute('data-url', appDefinitions[appId]);
      } else {
        openBtn.removeAttribute('data-url');
      }
    }

    if (infoBtn) {
      infoBtn.setAttribute('data-id', appId);
    }
  });

  // Delegación única para todos los botones en appsGrid
  appsGrid.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.action-btn.primary');
    const infoBtn = e.target.closest('.action-btn.info-btn');

    if (openBtn) {
      const url = openBtn.getAttribute('data-url');
      console.log('Listener delegado activado para botón Abrir:', url);
      if (!openBtn.disabled && url) {
        window.open(url, '_blank');
      } else {
        alert('Acceso restringido a esta aplicación.');
      }
    }

    if (infoBtn) {
      const appId = infoBtn.getAttribute('data-id');
      const permisoRaw = String(user[appId] || '').trim().toLowerCase();
      const hasAccess = permisoRaw === 'true' || permisoRaw === 'verdadero';
      alert(`Acceso a esta aplicación: ${hasAccess ? 'Permitido' : 'No permitido'}`);
    }
  });

  // Efecto visual círculos (opcional)
  document.addEventListener('mousemove', (e) => {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
      const speed = (index + 1) * 0.001;
      const x = e.clientX * speed;
      const y = e.clientY * speed;
      circle.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
});

