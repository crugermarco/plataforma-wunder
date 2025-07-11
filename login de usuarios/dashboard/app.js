const applications = [
  {
    id: 'rotaciones',
    title: 'Registro de Rotaciones',
    description: 'Sistema para registrar y gestionar las rotaciones de personal en tiempo real.',
    icon: '🔄',
    status: 'active',
    url: './rotaciones/index.html',
    category: 'Operaciones'
  },
  {
    id: 'vencimientos',
    title: 'Control de Vencimientos',
    description: 'Gestión y monitoreo de vencimientos - material quimico.',
    icon: '📋',
    status: 'active',
    url: './vencimientos/index.html',
    category: 'Gestión'
  },
  {
    id: 'wunder',
    title: 'Wunder Bar - Mantenimiento',
    description: 'Sistema integral de mantenimiento y control de equipos industriales.',
    icon: '⚙️',
    status: 'active',
    url: './wunder/index.html',
    category: 'Mantenimiento'
  },
  {
    id: 'empleados',
    title: 'Gestión de Empleados',
    description: 'Sistema de vacaciones y gestión de personal - permisos .',
    icon: '👥',
    status: 'restricted',
    url: './empleados/index.html',
    category: 'Recursos Humanos'
  },
  {
    id: 'reportes',
    title: 'Reportes y Analytics',
    description: 'Generación de reportes detallados y análisis de datos .',
    icon: '📊',
    status: 'restricted',
    url: './reportes/index.html',
    category: 'Analytics'
  },
  {
    id: 'inventario',
    title: 'Almacen',
    description: 'Gestión completa de inventarios, stock y movimientos de materiales.',
    icon: '📦',
    status: 'restricted',
    url: './inventario/index.html',
    category: 'Inventario'
  },
  {
    id: 'produccion',
    title: 'Control de Producción',
    description: 'Monitoreo y control de procesos productivos en tiempo real.',
    icon: '🏭',
    status: 'maintenance',
    url: './produccion/index.html',
    category: 'Producción'
  },
  {
    id: 'calidad',
    title: 'Control de Calidad - QC',
    description: 'Sistema de gestión de calidad y control de procesos.',
    icon: '✅',
    status: 'restricted',
    url: './calidad/index.html',
    category: 'Calidad'
  },
  {
    id: 'configuracion',
    title: 'Configuración del Sistema',
    description: 'Configuración general del sistema y parámetros globales - DEV.',
    icon: '🧑‍💻',
    status: 'restricted',
    url: './configuracion/index.html',
    category: 'Administración'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  loadApplications();

  document.addEventListener('mousemove', function (e) {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
      const speed = (index + 1) * 0.001;
      const x = e.clientX * speed;
      const y = e.clientY * speed;
      circle.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
});

function loadApplications() {
  const appsGrid = document.getElementById('appsGrid');
  appsGrid.innerHTML = '';

  applications.forEach(app => {
    const appCard = createAppCard(app);
    appsGrid.appendChild(appCard);
  });
}

function createAppCard(app) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.setAttribute('data-category', app.category);

  const statusClass = app.status === 'active' ? 'status-active' :
                      app.status === 'maintenance' ? 'status-maintenance' : 'status-restricted';

  const statusText = app.status === 'active' ? 'Activo' :
                     app.status === 'maintenance' ? 'Mantenimiento' : 'Restringido';

  card.innerHTML = `
    <div class="app-icon">${app.icon}</div>
    <div class="app-title">${app.title}</div>
    <div class="app-description">${app.description}</div>
    <div class="app-status ${statusClass}">${statusText}</div>
    <div class="app-actions">
      <button class="action-btn primary" onclick="openApp('${app.url}', '${app.title}')">Abrir</button>
      <button class="action-btn" onclick="showAppInfo('${app.id}')">Info</button>
    </div>
  `;

  return card;
}

function openApp(url, title) {
  if (url.startsWith('./')) {
    window.open(url, '_blank');
  } else if (url.startsWith('#')) {
    window.location.hash = url;
  } else {
    window.open(url, '_blank');
  }

  console.log(`Accediendo a: ${title}`);
}

function showAppInfo(appId) {
  const app = applications.find(a => a.id === appId);
  if (app) {
    alert(`Información de ${app.title}:\n\nCategoría: ${app.category}\nDescripción: ${app.description}\nEstado: ${app.status}`);
  }
}
