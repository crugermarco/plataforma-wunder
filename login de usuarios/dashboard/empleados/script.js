const SCRIPT_SUSPENCION_URL = 'https://script.google.com/macros/s/AKfycbxhCrsH4v93AZlx9YmNdBVDCTvD5yNzz4E7JalcfbrQEJG0YNrlL4lRjZ8qNlRVUeb0ug/exec'

const sheetConnections = {
  productivity: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbw1r_Hkv3aWEvIOqtf3mP7o82tTlevWTFCGRInBKqSUqPNtlQKUNYNb3dh34NYIh2ld/exec',
    spreadsheetId: '1NsT7jztJLNZgOE6xJkSofq2hqcpE-1ySiChjVM-zV0c',
    sheetName: 'Productivity Bonus 2025'
  },
  vacations: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbw8YvlasGkFEoIN0f9xaYUMaVBfIzCK3LsRDH6TzV0_93d0HVsXqYLiIW4mh3yysvqi/exec',
    spreadsheetId: '1ZDpnn0axnQ80USHsTbGbx92cTq7LI1g-ZOBuadoT0hY',
    sheetName: 'SOLICITUD DE VACACIONES'
  },
  employees: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxsHymuWZi4_hY5RjvSAoQ8QnfBs0EFIa0-sGI6FlROYdhBo9Kl__H33Y_7Gp8ev1Tl/exec',
    spreadsheetId: '1ZDpnn0axnQ80USHsTbGbx92cTq7LI1g-ZOBuadoT0hY',
    sheetName: 'BASE DE DATOS'
  },
  permissions: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwvBFWxx5M83TJRkETjOx5SPN6hQ5uVLtO_HyCaRGhV3zcCPy3ZPtqifYuJeqbgv1rolg/exec',
    spreadsheetId: '1oJu9b0zCltzM2PCCFuXWgib7ckp2Xbj9nVcgpcYTYDI',
    sheetName: 'FORMATO'
  },
  suspensionConcentrado: {
    scriptUrl: SCRIPT_SUSPENCION_URL,
    spreadsheetId: '1VPiuexZdnGe1zjk9Mwbc6Lxh3DKNgEX-bh6VID3BtBI',
    sheetName: 'CONCENTRADO DE SUSPENCIONES'
  },
  suspensionFormato: {
    scriptUrl: SCRIPT_SUSPENCION_URL,
    spreadsheetId: '1VPiuexZdnGe1zjk9Mwbc6Lxh3DKNgEX-bh6VID3BtBI',
    sheetName: 'SUSPENCION'
  }
};

let attendanceData = [];
let vacationData = [];
let employeesData = [];
let suspensionData = [];
let suspensionCandidates = [];
let notAppliedSuspensions = [];
let appliedSuspensions = [];
let automaticDismissalCandidates = [];
let currentUser = null;
let suspensionSound = null;
let currentFilters = {
    date: '',
    name: '',
    subject: '',
    points: ''
};
let filteredAttendanceData = [];
let suspensionCheckInterval = null;
let lastSuspensionCheckTime = null;

const elements = {
  navItems: null,
  sections: null,
  pageTitle: null,
  pageSubtitle: null,
  attendanceModal: null,
  generateReportBtn: null,
  closeAttendanceModalBtn: null,
  cancelAttendanceBtn: null,
  attendanceForm: null,
  vacationModal: null,
  addVacationBtn: null,
  closeVacationModalBtn: null,
  cancelVacationBtn: null,
  vacationForm: null,
  permissionModal: null,
  generatePermissionBtn: null,
  closePermissionModalBtn: null,
  cancelPermissionBtn: null,
  permissionForm: null,
  suspensionModal: null,
  suspensionDateModal: null,
  refreshSuspensionsBtn: null,
  suspensionForm: null,
  suspensionsTableBody: null,
  notAppliedSuspensionsBody: null,
  appliedSuspensionsBody: null,
  dismissalCandidatesBody: null,
  attendanceTableBody: null,
  missingEmployeesBody: null,
  vacationTableBody: null,
  permissionsTableBody: null,
  userNameDisplay: null,
  suspensionNotification: null,
  dismissalNotification: null
};

function initializeDOMElements() {
  elements.navItems = document.querySelectorAll('.nav-item');
  elements.sections = document.querySelectorAll('.section-content');
  elements.pageTitle = document.getElementById('page-title');
  elements.pageSubtitle = document.getElementById('page-subtitle');
  elements.attendanceModal = document.getElementById('attendance-modal');
  elements.generateReportBtn = document.getElementById('generate-report-btn');
  elements.closeAttendanceModalBtn = document.getElementById('close-attendance-modal');
  elements.cancelAttendanceBtn = document.getElementById('cancel-attendance');
  elements.attendanceForm = document.getElementById('attendance-form');
  elements.vacationModal = document.getElementById('vacation-modal');
  elements.addVacationBtn = document.getElementById('add-vacation-btn');
  elements.closeVacationModalBtn = document.getElementById('close-vacation-modal');
  elements.cancelVacationBtn = document.getElementById('cancel-vacation');
  elements.vacationForm = document.getElementById('vacation-form');
  elements.permissionModal = document.getElementById('permission-modal');
  elements.generatePermissionBtn = document.getElementById('generate-permission-btn');
  elements.closePermissionModalBtn = document.getElementById('close-permission-modal');
  elements.cancelPermissionBtn = document.getElementById('cancel-permission');
  elements.permissionForm = document.getElementById('permission-form');
  elements.suspensionModal = document.getElementById('suspension-modal');
  elements.suspensionDateModal = document.getElementById('suspension-date-modal');
  elements.refreshSuspensionsBtn = document.getElementById('refresh-suspensions-btn');
  elements.suspensionForm = document.getElementById('suspension-form');
  elements.suspensionsTableBody = document.getElementById('suspensions-table-body');
  elements.notAppliedSuspensionsBody = document.getElementById('not-applied-suspensions-body');
  elements.appliedSuspensionsBody = document.getElementById('applied-suspensions-body');
  elements.dismissalCandidatesBody = document.getElementById('dismissal-candidates-body');
  elements.attendanceTableBody = document.getElementById('attendance-table-body');
  elements.missingEmployeesBody = document.getElementById('missing-employees-body');
  elements.vacationTableBody = document.getElementById('vacation-table-body');
  elements.permissionsTableBody = document.getElementById('permissions-table-body');
  elements.userNameDisplay = document.getElementById('userNameDisplay');
  elements.suspensionNotification = document.getElementById('suspension-notification');
  elements.dismissalNotification = document.getElementById('dismissal-notification');
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return dateString;
  }
  
  try {
    if (typeof dateString === 'string' && dateString.startsWith('Date(')) {
      const dateParts = dateString.match(/\d+/g);
      if (dateParts && dateParts.length >= 3) {
        return `${dateParts[1].padStart(2, '0')}/${dateParts[2].padStart(2, '0')}/${dateParts[0]}`;
      }
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateString;
  }
}

function formatDateForSuspension(dateString) {
  if (!dateString) return '';
  
  try {
    if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return dateString;
    }
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${month}/${day}/${year}`;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (e) {
    console.error('Error formateando fecha:', dateString, e);
    return dateString;
  }
}

function getMonthName(monthNumber) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[parseInt(monthNumber) - 1] || '';
}

function getMonthNumber(monthName) {
  const months = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };
  return months[monthName.toLowerCase()] || '';
}

function isMondayOrFriday(dateString) {
  try {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 1 || dayOfWeek === 5;
  } catch (e) {
    return false;
  }
}

function isValidSuspensionDay(dateString) {
  try {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  } catch (e) {
    return false;
  }
}

function getSuspensionDates(suggestedDays, firstAbsenceDate) {
  const dates = [];
  const startDate = new Date(firstAbsenceDate);
  let currentDate = new Date(startDate);
  const usedWeeks = new Set();
  
  while (dates.length < suggestedDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (isValidSuspensionDay(currentDate)) {
      const weekNumber = getWeekNumber(currentDate);
      const weekKey = `${currentDate.getFullYear()}-${weekNumber}`;
      
      if (suggestedDays >= 6 || !usedWeeks.has(weekKey)) {
        dates.push(new Date(currentDate));
        usedWeeks.add(weekKey);
      }
    }
  }
  
  return dates.slice(0, suggestedDays);
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function convertTo12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function convertTo24Hour(time12) {
  if (!time12) return '';
  const [time, ampm] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

async function initializeApp() {
  try {
    initializeDOMElements();
    
    const user = JSON.parse(localStorage.getItem('userSession'));
    if (!user) {
      window.location.href = '../../index.html';
      return;
    }
    
    currentUser = {
      name: user.USUARIO || 'Usuario',
      role: user.ROL || 'user'
    };
    
    if (elements.userNameDisplay) {
      elements.userNameDisplay.textContent = currentUser.name;
    }
    
    showNotification('Cargando datos...', 'success');
    
    await loadEmployeesData();
    await loadSuspensionData();
    initializeEventListeners();
    await loadAttendanceData();
    await loadVacationData();
    
    setupVacationAutocomplete();
    setupPermissionAutocomplete();
    setupFilterAutocomplete();
    
    initializeSuspensionSound();
    scheduleHourlySuspensionCheck();
    await updateSuspensionStatuses();
    
    applyBlinkingStyles();
    addExportButton();
    createAppliedSuspensionsTable();
    createDismissalCandidatesTable();
    
    showNotification('Aplicación cargada correctamente', 'success');
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    showNotification('Error al cargar la aplicación. Verifica la conexión.', 'error');
  }
}

async function loadSuspensionData() {
  try {
    const result = await fetchSheetData(sheetConnections.suspensionConcentrado);
    if (result && result.error) {
      console.error('Error cargando datos de suspensión:', result.error);
      showNotification('Error al cargar datos de suspensión', 'error');
      suspensionData = [];
      return;
    }
    
    suspensionData = result && result.data ? result.data : [];
    console.log('Datos de suspensión cargados:', suspensionData.length, 'registros');
  } catch (error) {
    console.error('Error en loadSuspensionData:', error);
    suspensionData = [];
    showNotification('Error de conexión con datos de suspensión', 'error');
  }
}

function addExportButton() {
  const tableHeader = document.querySelector('.glassmorphism-table .table-header');
  if (tableHeader && !document.getElementById('export-excel-btn')) {
    const exportButton = document.createElement('button');
    exportButton.id = 'export-excel-btn';
    exportButton.className = 'modern-button export-button';
    exportButton.innerHTML = `
      <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Exportar Excel
    `;
    exportButton.addEventListener('click', exportToExcel);
    tableHeader.appendChild(exportButton);
  }
}

function createAppliedSuspensionsTable() {
  const suspensionSection = document.getElementById('suspensiones-section');
  if (!suspensionSection) return;
  
  const appliedSuspensionsTable = document.createElement('div');
  appliedSuspensionsTable.className = 'glassmorphism-table';
  appliedSuspensionsTable.innerHTML = `
    <div class="table-header">
      <h3 class="table-title">Suspensiones Aplicadas <span class="counter-badge" id="applied-suspensions-count">0</span></h3>
      <button class="modern-button export-button export-suspension-btn" data-table="applied">
        <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Exportar Excel
      </button>
    </div>
    <table class="data-table" id="applied-suspensions-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Fecha Suspensión</th>
          <th>Días</th>
          <th>Faltas Originales</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody id="applied-suspensions-body"></tbody>
    </table>
  `;
  
  suspensionSection.appendChild(appliedSuspensionsTable);
  elements.appliedSuspensionsBody = document.getElementById('applied-suspensions-body');
  
  document.querySelector('.export-suspension-btn[data-table="applied"]').addEventListener('click', () => {
    exportSuspensionTable('applied');
  });
}

function createDismissalCandidatesTable() {
  const suspensionSection = document.getElementById('suspensiones-section');
  if (!suspensionSection) return;
  
  const dismissalTable = document.createElement('div');
  dismissalTable.className = 'glassmorphism-table';
  dismissalTable.innerHTML = `
    <div class="table-header">
      <h3 class="mini-table-title">CANDIDATOS A BAJA AUTOMÁTICA <span class="counter-badge blinking-red" id="dismissal-candidates-count">0</span></h3>
      <button class="modern-button export-button export-suspension-btn" data-table="dismissal">
        <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Exportar Excel
      </button>
    </div>
    <table class="data-table" id="dismissal-candidates-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Faltas en 30 días</th>
          <th>Primera Falta</th>
          <th>Última Falta</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody id="dismissal-candidates-body"></tbody>
    </table>
  `;
  
  suspensionSection.appendChild(dismissalTable);
  elements.dismissalCandidatesBody = document.getElementById('dismissal-candidates-body');
  
  document.querySelector('.export-suspension-btn[data-table="dismissal"]').addEventListener('click', () => {
    exportSuspensionTable('dismissal');
  });
}

function exportToExcel() {
  if (filteredAttendanceData.length === 0) {
    showNotification('No hay datos para exportar', 'error');
    return;
  }

  let csvContent = "Fecha,Nombre del Empleado,Asunto,Puntos\n";
  
  filteredAttendanceData.forEach(item => {
    const row = [
      `"${formatDate(item.FECHA)}"`,
      `"${item.NOMBRE || ''}"`,
      `"${item.MOTIVO || ''}"`,
      `"${item.PUNTOS || '0'}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', `asistencias_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Datos exportados exitosamente', 'success');
}

function exportSuspensionTable(tableType) {
  let data = [];
  let filename = '';
  let headers = [];
  
  switch(tableType) {
    case 'pending':
      data = suspensionCandidates;
      filename = 'suspensiones_pendientes';
      headers = ['Nombre', 'Primera Falta', 'Faltas', 'Días Sugeridos', 'Estado'];
      break;
    case 'not-applied':
      data = notAppliedSuspensions;
      filename = 'suspensiones_no_aplicadas';
      headers = ['Nombre', 'Primera Falta', 'Fecha Límite', 'Estado'];
      break;
    case 'applied':
      data = appliedSuspensions;
      filename = 'suspensiones_aplicadas';
      headers = ['Nombre', 'Fecha Suspensión', 'Días', 'Faltas Originales', 'Estado'];
      break;
    case 'dismissal':
      data = automaticDismissalCandidates;
      filename = 'candidatos_baja_automatica';
      headers = ['Nombre', 'Faltas en 30 días', 'Primera Falta', 'Última Falta', 'Estado'];
      break;
  }
  
  if (data.length === 0) {
    showNotification('No hay datos para exportar', 'error');
    return;
  }
  
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = [];
    switch(tableType) {
      case 'pending':
        row.push(`"${item.employeeName}"`);
        row.push(`"${formatDate(item.firstAbsenceDate)}"`);
        row.push(`"${item.absencesCount} faltas (${item.mondayFridayCount} en lunes/viernes)"`);
        row.push(`"${item.suggestedDays} día(s)"`);
        row.push(`"${item.status}"`);
        break;
      case 'not-applied':
        row.push(`"${item.employeeName}"`);
        row.push(`"${formatDate(item.firstAbsenceDate)}"`);
        row.push(`"${formatDate(item.deadline)}"`);
        row.push(`"${item.status}"`);
        break;
      case 'applied':
        row.push(`"${item.employeeName}"`);
        row.push(`"${formatDate(item.suspensionDate)}"`);
        row.push(`"${item.days} día(s)"`);
        row.push(`"${item.originalAbsences}"`);
        row.push(`"REALIZADA"`);
        break;
      case 'dismissal':
        row.push(`"${item.employeeName}"`);
        row.push(`"${item.absencesCount} faltas"`);
        row.push(`"${formatDate(item.firstAbsenceDate)}"`);
        row.push(`"${formatDate(item.lastAbsenceDate)}"`);
        row.push(`"BAJA"`);
        break;
    }
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Datos exportados exitosamente', 'success');
}

function applyBlinkingStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink-red {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(255, 0, 0, 0.3); }
    }
    @keyframes blink-red-border {
      0%, 100% { border-left-color: transparent; }
      50% { border-left-color: #ff4444; }
    }
    .blinking-red {
      animation: blink-red 1s infinite;
    }
    .blinking-red-border {
      animation: blink-red-border 1s infinite;
      border-left: 3px solid transparent;
    }
    .export-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    }
    .counter-badge {
      background: rgba(239, 68, 68, 0.2);
      color: var(--red-500);
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }
    .dismissal-notification {
      background-color: rgba(239, 68, 68, 0.9) !important;
      border: 2px solid #ff4444;
    }
    .date-inputs-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .date-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .date-input-group label {
      color: var(--slate-300);
      font-weight: 600;
      min-width: 80px;
    }
    .suspension-info {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .suspension-info h4 {
      color: var(--slate-300);
      margin-bottom: 0.5rem;
    }
    .suspension-info p {
      color: var(--slate-400);
      margin: 0.25rem 0;
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pendiente {
      background-color: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid #f59e0b;
    }
    .status-no-aplicada {
      background-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
    }
    .status-aplicada {
      background-color: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid #22c55e;
    }
    .status-baja {
      background-color: rgba(139, 0, 0, 0.2);
      color: #8b0000;
      border: 1px solid #8b0000;
    }
    .blinking-row-yellow {
      animation: blink-yellow 2s infinite;
    }
    .blinking-row-red {
      animation: blink-red 2s infinite;
    }
    .blinking-row-green{
      animation:blink-green 2s infinite;
    }  
    @keyframes blink-yellow {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(245, 158, 11, 0.1); }
    }
    @keyframes blink-red {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.1); }
    }
    @keyframes blink-green {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(11, 143, 29, 0.24); }
  }
  `;
  document.head.appendChild(style);
}

function initializeEventListeners() {
  elements.navItems.forEach(item => {
    if (item) {
      item.addEventListener('click', () => {
        const sectionName = item.dataset.section;
        switchActiveSection(item, sectionName);
      });
    }
  });

  if (elements.generateReportBtn) {
    elements.generateReportBtn.addEventListener('click', openAttendanceModal);
  }
  if (elements.closeAttendanceModalBtn) {
    elements.closeAttendanceModalBtn.addEventListener('click', closeAttendanceModal);
  }
  if (elements.cancelAttendanceBtn) {
    elements.cancelAttendanceBtn.addEventListener('click', closeAttendanceModal);
  }
  if (elements.attendanceForm) {
    elements.attendanceForm.addEventListener('submit', handleAttendanceSubmit);
  }

  if (elements.addVacationBtn) {
    elements.addVacationBtn.addEventListener('click', handleAddVacationClick);
  }
  if (elements.closeVacationModalBtn) {
    elements.closeVacationModalBtn.addEventListener('click', closeVacationModal);
  }
  if (elements.cancelVacationBtn) {
    elements.cancelVacationBtn.addEventListener('click', closeVacationModal);
  }
  if (elements.vacationForm) {
    elements.vacationForm.addEventListener('submit', handleVacationSubmit);
  }

  if (elements.generatePermissionBtn) {
    elements.generatePermissionBtn.addEventListener('click', openPermissionModal);
  }
  if (elements.closePermissionModalBtn) {
    elements.closePermissionModalBtn.addEventListener('click', closePermissionModal);
  }
  if (elements.cancelPermissionBtn) {
    elements.cancelPermissionBtn.addEventListener('click', closePermissionModal);
  }
  if (elements.permissionForm) {
    elements.permissionForm.addEventListener('submit', handlePermissionSubmit);
  }

  if (elements.refreshSuspensionsBtn) {
    elements.refreshSuspensionsBtn.addEventListener('click', async () => {
      await loadSuspensionData();
      await updateSuspensionStatuses();
      showNotification('Suspensiones actualizadas', 'success');
    });
  }

  const closeSuspensionModalBtn = document.getElementById('close-suspension-modal');
  if (closeSuspensionModalBtn) {
    closeSuspensionModalBtn.addEventListener('click', closeSuspensionModal);
  }

  const cancelSuspensionBtn = document.getElementById('cancel-suspension');
  if (cancelSuspensionBtn) {
    cancelSuspensionBtn.addEventListener('click', closeSuspensionModal);
  }

  const closeSuspensionDateModalBtn = document.getElementById('close-suspension-date-modal');
  if (closeSuspensionDateModalBtn) {
    closeSuspensionDateModalBtn.addEventListener('click', closeSuspensionDateModal);
  }

  const cancelSuspensionDateBtn = document.getElementById('cancel-suspension-date');
  if (cancelSuspensionDateBtn) {
    cancelSuspensionDateBtn.addEventListener('click', closeSuspensionDateModal);
  }

  const confirmSuspensionDateBtn = document.getElementById('confirm-suspension-date');
  if (confirmSuspensionDateBtn) {
    confirmSuspensionDateBtn.addEventListener('click', confirmSuspensionDate);
  }

  if (elements.suspensionForm) {
    elements.suspensionForm.addEventListener('submit', handleSuspensionSubmit);
  }

  const permissionHours = document.getElementById('permission-hours');
  if (permissionHours) {
    permissionHours.addEventListener('change', handlePermissionTypeChange);
  }

  const permissionDay = document.getElementById('permission-day');
  if (permissionDay) {
    permissionDay.addEventListener('change', handlePermissionTypeChange);
  }

  const permissionDayWithPay = document.getElementById('permission-day-with-pay');
  if (permissionDayWithPay) {
    permissionDayWithPay.addEventListener('change', handlePermissionTypeChange);
  }

  document.querySelectorAll('.modal').forEach(modal => {
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  const closeNotificationBtn = document.querySelector('.close-notification');
  if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener('click', () => {
      if (elements.suspensionNotification) {
        elements.suspensionNotification.style.display = 'none';
      }
    });
  }

  initializeTableFilters();
}

async function fetchSheetData(connection, action = 'read', data = null) {
  try {
    const url = new URL(connection.scriptUrl);
    url.searchParams.append('id', connection.spreadsheetId);
    url.searchParams.append('sheet', connection.sheetName);
    url.searchParams.append('action', action);
    
    if (data) {
      if (action === 'update') {
        url.searchParams.append('data', JSON.stringify(data));
      } else {
        const formattedData = Array.isArray(data) ? data : [data];
        const finalData = formattedData.map(item => {
          const formattedItem = {...item};
          if ('AUTORIZADAS' in formattedItem) {
            formattedItem.AUTORIZADAS = formattedItem.AUTORIZADAS ? 'TRUE' : 'FALSE';
          }
          return formattedItem;
        });
        url.searchParams.append('data', JSON.stringify(finalData));
      }
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    showNotification(`Error al cargar datos: ${error.message}`, 'error');
    return { error: error.message };
  }
}

async function loadAttendanceData() {
  const result = await fetchSheetData(sheetConnections.productivity);
  if (result.error) return;
  
  attendanceData = result.data || [];
  filteredAttendanceData = [...attendanceData];
  renderAttendanceTable();
  checkMissingEmployees();
}

async function loadVacationData() {
  try {
    const result = await fetchSheetData(sheetConnections.vacations);
    
    if (result.error) {
      console.error('Error cargando datos de vacaciones:', result.error);
      showNotification('Error al cargar datos de vacaciones', 'error');
      return;
    }
    
    vacationData = (result.data || []).map(item => {
      const isAuthorized = item['Autorizadas'] === true || 
                         item['Autorizadas'] === 'TRUE' || 
                         item['Autorizadas'] === 'true' ||
                         item['AUTORIZADAS'] === true || 
                         item['AUTORIZADAS'] === 'TRUE' || 
                         item['AUTORIZADAS'] === 'true';
      
      return {
        'Name': item['Name'] || '',
        'Entry Date': item['Entry Date'] || '',
        'ID #': item['ID #'] || '',
        'Days Vacations': item['Days Vacations'] || '0',
        'Fecha de Salida': item['Fecha de salida'] || '',
        'Fecha de Regreso': item['Fecha de Regreso'] || '',
        'AUTORIZADAS': isAuthorized
      };
    });
    
    renderVacationTable();
  } catch (error) {
    console.error('Error en loadVacationData:', error);
    showNotification('Error crítico al cargar vacaciones', 'error');
  }
}

async function loadEmployeesData() {
  const result = await fetchSheetData(sheetConnections.employees);
  if (result.error) {
    console.error('Error cargando datos de empleados:', result.error);
    showNotification('Error al cargar datos de empleados', 'error');
    return;
  }
  
  employeesData = result.data || [];
}

function renderAttendanceTable() {
  if (!elements.attendanceTableBody) return;
  
  elements.attendanceTableBody.innerHTML = '';
  
  if (filteredAttendanceData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="no-data">No hay datos de asistencia disponibles</td>';
    elements.attendanceTableBody.appendChild(row);
    return;
  }
  
  const hasActiveFilters = currentFilters.date || currentFilters.name || currentFilters.subject || currentFilters.points;
  
  let displayData;
  if (hasActiveFilters) {
    displayData = filteredAttendanceData;
  } else {
    const startIndex = Math.max(0, filteredAttendanceData.length - 20);
    displayData = filteredAttendanceData.slice(startIndex);
  }
  
  displayData.forEach(item => {
    const row = document.createElement('tr');
    const formattedDate = formatDate(item.FECHA);
    const isBlinkingDate = isMondayOrFriday(item.FECHA);
    const isBlinkingSubject = (item.MOTIVO || '').toLowerCase() === 'falta injustificada';
    
    row.innerHTML = `
      <td class="${isBlinkingDate ? 'blinking-red-border' : ''}">${formattedDate || ''}</td>
      <td>${item.NOMBRE || ''}</td>
      <td class="${isBlinkingSubject ? 'blinking-red' : ''}">
        <span class="status-badge status-${(item.MOTIVO || '').toLowerCase().replace(/\s+/g, '-')}">
          ${item.MOTIVO || ''}
        </span>
      </td>
      <td>${item.PUNTOS || '0'}</td>
    `;
    elements.attendanceTableBody.appendChild(row);
  });
  
  if (!hasActiveFilters && filteredAttendanceData.length > 20) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4" class="no-data">Mostrando las últimas 20 de ${filteredAttendanceData.length} registros. Usa filtros para ver más registros.</td>`;
    elements.attendanceTableBody.appendChild(row);
  }
}

function renderVacationTable() {
  if (!elements.vacationTableBody) {
    console.error('Elemento vacationTableBody no encontrado');
    return;
  }
  
  elements.vacationTableBody.innerHTML = '';
  
  if (vacationData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="7" class="no-data">No hay datos de vacaciones disponibles</td>';
    elements.vacationTableBody.appendChild(row);
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  vacationData.forEach(item => {
    const row = document.createElement('tr');
    
    if (!item.AUTORIZADAS && item['Fecha de Salida']) {
      const departureDate = new Date(item['Fecha de Salida']);
      if (!isNaN(departureDate.getTime())) {
        const daysToDeparture = Math.floor((departureDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysToDeparture <= 7 && daysToDeparture >= 0) {
          row.classList.add('blinking-row-red');
        } else if (daysToDeparture <= 15 && daysToDeparture > 7) {
          row.classList.add('blinking-row-yellow');
        }
      }
    }
    
    const formattedEntryDate = formatDate(item['Entry Date']);
    const formattedStartDate = formatDate(item['Fecha de Salida']);
    const formattedEndDate = formatDate(item['Fecha de Regreso']);
    
    row.innerHTML = `
      <td>${item.Name || ''}</td>
      <td>${formattedEntryDate || ''}</td>
      <td>${item['ID #'] || ''}</td>
      <td>${item['Days Vacations'] || '0'}</td>
      <td>${formattedStartDate || ''}</td>
      <td>${formattedEndDate || ''}</td>
      <td><span class="status-badge ${item.AUTORIZADAS ? 'status-asistencia' : 'status-no-registro'}">
        ${item.AUTORIZADAS ? 'Sí' : 'No'}
      </span></td>
    `;
    
    elements.vacationTableBody.appendChild(row);
  });
}

function renderSuspensionTables() {
  renderSuspensionCandidates();
  renderNotAppliedSuspensions();
  renderAppliedSuspensions();
  renderDismissalCandidates();
}

function renderSuspensionCandidates() {
  if (!elements.suspensionsTableBody) return;
  
  elements.suspensionsTableBody.innerHTML = '';
  
  if (suspensionCandidates.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="no-data">No hay candidatos a suspensión pendientes</td>';
    elements.suspensionsTableBody.appendChild(row);
    return;
  }
  
  suspensionCandidates.forEach((candidate, index) => {
    const row = document.createElement('tr');
    if (candidate.status === 'PENDIENTE') {
      row.classList.add('blinking-row-yellow');
    }
    
    const daysRemaining = Math.ceil((candidate.deadline - new Date()) / (1000 * 60 * 60 * 24));
    
    row.innerHTML = `
      <td>${candidate.employeeName}</td>
      <td>${formatDate(candidate.firstAbsenceDate)}</td>
      <td>${candidate.absencesCount} falta(s) (${candidate.mondayFridayCount} en lunes/viernes)</td>
      <td>${candidate.suggestedDays} día(s)</td>
      <td><span class="status-badge status-pendiente">${candidate.status}</span></td>
      <td>
        <button class="action-button" onclick="openSuspensionModal(${index})">
          Aplicar Suspensión
        </button>
        <br>
        <small>Vence en ${daysRemaining} días</small>
      </td>
    `;
    elements.suspensionsTableBody.appendChild(row);
  });
}

function renderNotAppliedSuspensions() {
  if (!elements.notAppliedSuspensionsBody) return;
  
  elements.notAppliedSuspensionsBody.innerHTML = '';
  
  if (notAppliedSuspensions.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="no-data">No hay suspensiones no aplicadas</td>';
    elements.notAppliedSuspensionsBody.appendChild(row);
    return;
  }
  
  notAppliedSuspensions.forEach(suspension => {
    const row = document.createElement('tr');
    row.classList.add('blinking-row-red');
    
    row.innerHTML = `
      <td>${suspension.employeeName}</td>
      <td>${formatDate(suspension.firstAbsenceDate)}</td>
      <td>${formatDate(suspension.deadline)}</td>
      <td><span class="status-badge status-no-aplicada">${suspension.status}</span></td>
    `;
    elements.notAppliedSuspensionsBody.appendChild(row);
  });
}

function renderAppliedSuspensions() {
  if (!elements.appliedSuspensionsBody) return;
  
  elements.appliedSuspensionsBody.innerHTML = '';
  
  if (appliedSuspensions.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="no-data">No hay suspensiones aplicadas</td>';
    elements.appliedSuspensionsBody.appendChild(row);
    return;
  }
  
  appliedSuspensions.forEach(suspension => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${suspension.employeeName}</td>
      <td>${formatDate(suspension.suspensionDate)}</td>
      <td>${suspension.days} día(s)</td>
      <td>${suspension.originalAbsences}</td>
      <td><span class="status-badge status-aplicada">REALIZADA</span></td>
    `;
    elements.appliedSuspensionsBody.appendChild(row);
  });
  
  const counter = document.getElementById('applied-suspensions-count');
  if (counter) {
    counter.textContent = appliedSuspensions.length;
  }
}

function renderDismissalCandidates() {
  if (!elements.dismissalCandidatesBody) return;
  
  elements.dismissalCandidatesBody.innerHTML = '';
  
  if (automaticDismissalCandidates.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="no-data">No hay candidatos a baja automática</td>';
    elements.dismissalCandidatesBody.appendChild(row);
    return;
  }
  
  automaticDismissalCandidates.forEach(candidate => {
    const row = document.createElement('tr');
    row.classList.add('blinking-red');
    
    row.innerHTML = `
      <td>${candidate.employeeName}</td>
      <td>${candidate.absencesCount} faltas</td>
      <td>${formatDate(candidate.firstAbsenceDate)}</td>
      <td>${formatDate(candidate.lastAbsenceDate)}</td>
      <td><span class="status-badge status-baja">${candidate.status}</span></td>
    `;
    elements.dismissalCandidatesBody.appendChild(row);
  });
  
  const counter = document.getElementById('dismissal-candidates-count');
  if (counter) {
    counter.textContent = automaticDismissalCandidates.length;
  }
}

function setupVacationAutocomplete() {
  const nameInput = document.getElementById('vacation-employee-name');
  if (!nameInput) return;

  nameInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    const datalist = document.createElement('datalist');
    datalist.id = 'employee-names-list';
    
    if (value.length > 1) {
      const matches = employeesData.filter(emp => 
        emp.Name && emp.Name.toLowerCase().includes(value)
      ).slice(0, 10);
      
      matches.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.Name;
        option.dataset.id = emp['ID #'];
        option.dataset.position = emp.Position;
        option.dataset.days = emp['Days Vacations'];
        option.dataset.entryDate = emp['Entry Date'];
        datalist.appendChild(option);
      });
    }
    
    const oldDatalist = document.getElementById('employee-names-list');
    if (oldDatalist) document.body.removeChild(oldDatalist);
    
    if (datalist.childNodes.length > 0) {
      document.body.appendChild(datalist);
      this.setAttribute('list', 'employee-names-list');
    } else {
      this.removeAttribute('list');
    }
  });

  nameInput.addEventListener('change', function() {
    const selectedOption = document.querySelector(`#employee-names-list option[value="${this.value}"]`);
    if (selectedOption) {
      document.getElementById('vacation-employee-id').value = selectedOption.dataset.id || '';
      document.getElementById('vacation-position').value = selectedOption.dataset.position || '';
      document.getElementById('vacation-days').value = selectedOption.dataset.days || '0';
    }
  });
}

function setupPermissionAutocomplete() {
  const nameInput = document.getElementById('permission-name');
  if (!nameInput) return;

  nameInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    const datalist = document.createElement('datalist');
    datalist.id = 'permission-names-list';
    
    if (value.length > 1) {
      const matches = employeesData.filter(emp => 
        emp.Name && emp.Name.toLowerCase().includes(value)
      ).slice(0, 10);
      
      matches.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.Name;
        option.dataset.id = emp['ID #'];
        option.dataset.area = emp.Position || 'General';
        datalist.appendChild(option);
      });
    }
    
    const oldDatalist = document.getElementById('permission-names-list');
    if (oldDatalist) document.body.removeChild(oldDatalist);
    
    if (datalist.childNodes.length > 0) {
      document.body.appendChild(datalist);
      this.setAttribute('list', 'permission-names-list');
    } else {
      this.removeAttribute('list');
    }
  });

  nameInput.addEventListener('change', function() {
    const selectedOption = document.querySelector(`#permission-names-list option[value="${this.value}"]`);
    if (selectedOption) {
      document.getElementById('permission-employee-id').value = selectedOption.dataset.id || '';
      document.getElementById('permission-area').value = selectedOption.dataset.area || 'General';
    }
  });
}

function setupFilterAutocomplete() {
  const filterInputs = document.querySelectorAll('.filter-input');
  
  filterInputs.forEach(input => {
    if (!input) return;
    
    input.addEventListener('input', function() {
      const tableName = this.dataset.table;
      const column = parseInt(this.dataset.column);
      
      if (tableName === 'attendance') {
        switch(column) {
          case 0: currentFilters.date = this.value; break;
          case 1: currentFilters.name = this.value; break;
          case 2: currentFilters.subject = this.value; break;
          case 3: currentFilters.points = this.value; break;
        }
        
        applyFilters();
      }
    });
    
    if (input.dataset.table === 'attendance' && input.dataset.column === '0') {
      input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const datalist = document.createElement('datalist');
        datalist.id = 'filter-months-list';
        
        if (value.length > 0) {
          const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          const matches = months.filter(month => 
            month.toLowerCase().includes(value)
          ).slice(0, 12);
          
          matches.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            datalist.appendChild(option);
          });
        }
        
        const oldDatalist = document.getElementById('filter-months-list');
        if (oldDatalist) document.body.removeChild(oldDatalist);
        
        if (datalist.childNodes.length > 0) {
          document.body.appendChild(datalist);
          this.setAttribute('list', 'filter-months-list');
        } else {
          this.removeAttribute('list');
        }
      });
    }
    
    if (input.dataset.table === 'attendance' && input.dataset.column === '1') {
      input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const datalist = document.createElement('datalist');
        datalist.id = 'filter-names-list';
        
        if (value.length > 1) {
          const uniqueNames = [...new Set(attendanceData.map(item => item.NOMBRE).filter(Boolean))];
          const matches = uniqueNames.filter(name => 
            name.toLowerCase().includes(value)
          ).slice(0, 10);
          
          matches.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
          });
        }
        
        const oldDatalist = document.getElementById('filter-names-list');
        if (oldDatalist) document.body.removeChild(oldDatalist);
        
        if (datalist.childNodes.length > 0) {
          document.body.appendChild(datalist);
          this.setAttribute('list', 'filter-names-list');
        } else {
          this.removeAttribute('list');
        }
      });
    }
  });
}

function applyFilters() {
  filteredAttendanceData = [...attendanceData];
  
  if (currentFilters.date) {
    const filterDate = currentFilters.date.toLowerCase();
    const monthNumber = getMonthNumber(filterDate);
    
    if (monthNumber) {
      filteredAttendanceData = filteredAttendanceData.filter(item => {
        const itemDate = formatDate(item.FECHA);
        const [itemMonth, itemDay, itemYear] = itemDate.split('/');
        return itemMonth === monthNumber;
      });
    } else {
      filteredAttendanceData = filteredAttendanceData.filter(item => {
        const itemDate = formatDate(item.FECHA);
        return itemDate.toLowerCase().includes(filterDate);
      });
    }
  }
  
  if (currentFilters.name) {
    filteredAttendanceData = filteredAttendanceData.filter(item => 
      (item.NOMBRE || '').toLowerCase().includes(currentFilters.name.toLowerCase())
    );
  }
  
  if (currentFilters.subject) {
    filteredAttendanceData = filteredAttendanceData.filter(item => 
      (item.MOTIVO || '').toLowerCase().includes(currentFilters.subject.toLowerCase())
    );
  }
  
  if (currentFilters.points) {
    filteredAttendanceData = filteredAttendanceData.filter(item => 
      (item.PUNTOS || '').toString().includes(currentFilters.points)
    );
  }
  
  renderAttendanceTable();
}

function checkMissingEmployees() {
  if (!elements.missingEmployeesBody) return;
  
  const missingEmployees = [];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const allEmployees = [...new Set(attendanceData.map(item => item.NOMBRE))];
  
  allEmployees.forEach(employee => {
    if (!employee) return;
    
    const employeeRecords = attendanceData
      .filter(item => item.NOMBRE === employee)
      .sort((a, b) => new Date(b.FECHA) - new Date(a.FECHA));
    
    const hasDisqualifyingRecord = employeeRecords.some(record => {
      const recordDate = new Date(record.FECHA);
      if (recordDate < ninetyDaysAgo) return false;
      
      const motivo = record.MOTIVO;
      return [
        'Permiso - Por Hora',
        'Permiso - Por Día',
        'Falta injustificada',
        'Vacaciones',
        'Suspensión',
        'Falta justificada',
        'NO SE ESCANEA O NO CUENTA CON GAFETE',
        '5hrs',
        'Incapacidad',
        'Error de Procceso',
        'Retardo',
      ].includes(motivo);
    });
    
    if (employeeRecords.length > 0 && employeeRecords[0].FECHA) {
      const lastRecordDate = new Date(employeeRecords[0].FECHA);
      if (lastRecordDate < ninetyDaysAgo && !hasDisqualifyingRecord) {
        missingEmployees.push({
          name: employee,
          lastRecord: formatDate(employeeRecords[0].FECHA),
          days: Math.floor((new Date() - lastRecordDate) / (1000 * 60 * 60 * 24)),
          has5hrs: true
        });
      }
    }
  });
  
  renderMissingEmployees(missingEmployees);
}

function renderMissingEmployees(employees) {
  if (!elements.missingEmployeesBody) return;
  
  elements.missingEmployeesBody.innerHTML = '';
  
  if (employees.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3" class="no-data">No hay empleados con 5hrs disponibles</td>';
    elements.missingEmployeesBody.appendChild(row);
    return;
  }
  
  employees.forEach(employee => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.lastRecord}</td>
      <td>${employee.days} días ${employee.has5hrs ? '<span class="blinking-text">5hrs disponibles</span>' : ''}</td>
    `;
    elements.missingEmployeesBody.appendChild(row);
  });
}

function openAttendanceModal() {
  if (!elements.attendanceModal) return;
  elements.attendanceModal.classList.add('active');
  
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;
  
  document.getElementById('attendance-date').value = formattedDate;
  
  const nameInput = document.getElementById('employee-name');
  if (nameInput) {
    setupAutocomplete(nameInput);
  }
  
  updateAttendanceTypeOptions();
}

function updateAttendanceTypeOptions() {
  const select = document.getElementById('attendance-type');
  if (!select) return;
  
  select.innerHTML = `
    <option value="">Seleccione un tipo</option>
    <option value="Asistencia">Asistencia</option>
    <option value="Permiso - Por Hora">Permiso - Por Hora</option>
    <option value="Permiso - Por Día">Permiso - Por Día</option>
    <option value="Falta injustificada">Falta injustificada</option>
    <option value="Vacaciones">Vacaciones</option>
    <option value="Suspensión">Suspensión</option>
    <option value="Falta justificada">Falta justificada</option>
    <option value="NO SE ESCANEA O NO CUENTA CON GAFETE">NO SE ESCANEA O NO CUENTA CON GAFETE</option>
    <option value="5hrs">5hrs</option>
    <option value="Incapacidad">Incapacidad</option>
    <option value="Error de Procceso">Error de Processo</option>
    <option value="Retardo">Retardo</option>
  `;
}

function setupAutocomplete(inputElement) {
  const uniqueNames = [...new Set(attendanceData.map(item => item.NOMBRE).filter(Boolean))];
  
  inputElement.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    const datalist = document.createElement('datalist');
    datalist.id = 'attendance-names-list';
    
    if (value.length > 1) {
      const matches = uniqueNames.filter(name => 
        name.toLowerCase().includes(value)
      ).slice(0, 10);
      
      matches.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
      });
    }
    
    const oldDatalist = document.getElementById('attendance-names-list');
    if (oldDatalist) {
      document.body.removeChild(oldDatalist);
    }
    
    if (datalist.childNodes.length > 0) {
      document.body.appendChild(datalist);
      this.setAttribute('list', 'attendance-names-list');
    } else {
      this.removeAttribute('list');
    }
  });
  
  elements.attendanceModal.addEventListener('click', function(e) {
    if (e.target === elements.attendanceModal) {
      const datalist = document.getElementById('attendance-names-list');
      if (datalist) {
        document.body.removeChild(datalist);
      }
    }
  });
}

function closeAttendanceModal() {
  if (!elements.attendanceModal) return;
  elements.attendanceModal.classList.remove('active');
  if (elements.attendanceForm) elements.attendanceForm.reset();
  
  const datalist = document.getElementById('attendance-names-list');
  if (datalist) {
    document.body.removeChild(datalist);
  }
}

async function handleAddVacationClick() {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showAccessDeniedMessage();
    return;
  }
  
  openVacationModal();
}

function openVacationModal() {
  if (!elements.vacationModal) return;
  elements.vacationModal.classList.add('active');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('vacation-start-date').value = today;
  document.getElementById('vacation-start-date').setAttribute('min', today);
}

function closeVacationModal() {
  if (!elements.vacationModal) return;
  elements.vacationModal.classList.remove('active');
  if (elements.vacationForm) elements.vacationForm.reset();
  
  const datalist = document.getElementById('employee-names-list');
  if (datalist) {
    document.body.removeChild(datalist);
  }
}

function showAccessDeniedMessage() {
  const accessDeniedModal = document.createElement('div');
  accessDeniedModal.className = 'access-denied-modal';
  accessDeniedModal.innerHTML = `
    <div class="neon-message">
      <span class="access-denied-text">Solo Marco Cruger puede agregar vacaciones</span>
      <p class="access-denied-subtext">Tus credenciales solo te permiten visualizar el contenido</p>
    </div>
  `;
  
  document.body.appendChild(accessDeniedModal);
  
  setTimeout(() => {
    accessDeniedModal.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(accessDeniedModal);
    }, 500);
  }, 3000);
}

function openPermissionModal() {
  if (!elements.permissionModal) return;
  
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;
  
  document.getElementById('permission-fill-date').value = formattedDate;
  
  elements.permissionForm.reset();
  document.getElementById('permission-fill-date').value = formattedDate;
  
  document.getElementById('hours-container').style.display = 'none';
  
  const entryTimeInput = document.getElementById('permission-entry-time');
  const exitTimeInput = document.getElementById('permission-exit-time');
  
  entryTimeInput.value = '';
  exitTimeInput.value = '';
  
  elements.permissionModal.classList.add('active');
}

function closePermissionModal() {
  if (!elements.permissionModal) return;
  elements.permissionModal.classList.remove('active');
  if (elements.permissionForm) elements.permissionForm.reset();
  
  const datalist = document.getElementById('permission-names-list');
  if (datalist) {
    document.body.removeChild(datalist);
  }
}

function handlePermissionTypeChange(e) {
  const permissionHours = document.getElementById('permission-hours');
  const hoursContainer = document.getElementById('hours-container');
  
  if (e.target.id === 'permission-hours') {
    hoursContainer.style.display = 'none';
  }
  
  if (e.target.checked) {
    const allToggles = document.querySelectorAll('.toggle-input');
    allToggles.forEach(toggle => {
      if (toggle !== e.target) {
        toggle.checked = false;
      }
    });
  }
}

async function handlePermissionSubmit(e) {
  if (!e) return;
  e.preventDefault();
  
  if (!validatePermissionForm()) {
    return;
  }
  
  const entryTime24 = convertTo24Hour(document.getElementById('permission-entry-time').value);
  const exitTime24 = convertTo24Hour(document.getElementById('permission-exit-time').value);
  
  const formData = {
    'Nombre': document.getElementById('permission-name').value,
    'NumeroEmpleado': document.getElementById('permission-employee-id').value,
    'Area': document.getElementById('permission-area').value,
    'FechaLLenado': document.getElementById('permission-fill-date').value,
    'PermisoDia': document.getElementById('permission-day').checked,
    'PermisoDiaGoce': document.getElementById('permission-day-with-pay').checked,
    'Paternidad': document.getElementById('permission-paternity').checked,
    'Fallecimiento': document.getElementById('permission-bereavement').checked,
    'Matrimonio': document.getElementById('permission-marriage').checked,
    'PermisoHoras': document.getElementById('permission-hours').checked,
    'HorasPermiso': document.getElementById('permission-hours-count').value || '0',
    'PermisoEntrada': entryTime24,
    'PermisoSalida': exitTime24,
    'FechaInicio': document.getElementById('permission-start-date').value,
    'FechaRegreso': document.getElementById('permission-end-date').value,
    'Comentarios': document.getElementById('permission-comments').value
  };
  
  try {
    showNotification('Guardando datos en formato...', 'success');
    
    const saveResult = await fetchSheetData(
      sheetConnections.permissions, 
      'append', 
      [formData]
    );
    
    if (saveResult.error) {
      showNotification('Error al guardar el permiso: ' + saveResult.error, 'error');
      return;
    }
    
    showNotification('Datos guardados exitosamente. Generando PDF...', 'success');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await generatePermissionPDF(formData);
    
    closePermissionModal();
    
  } catch (error) {
    console.error('Error en handlePermissionSubmit:', error);
    showNotification('Error al procesar la solicitud: ' + error.message, 'error');
  }
}

async function generatePermissionPDF(formData) {
  try {
    showNotification('Generando PDF...', 'success');
    
    const spreadsheetId = sheetConnections.permissions.spreadsheetId;
    
    const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&portrait=true&size=A4&fitw=true&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false&gid=0`;
    
    console.log('Descargando PDF desde:', pdfUrl);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.target = '_blank';
    
    const timestamp = new Date().getTime();
    downloadLink.download = `Formato_Permiso_${formData.Nombre.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showNotification('PDF descargado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error descargando PDF:', error);
    
    const spreadsheetId = sheetConnections.permissions.spreadsheetId;
    const fallbackUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=0`;
    
    showNotification(`Error al descargar automáticamente. <a href="${fallbackUrl}" target="_blank" style="color: white; text-decoration: underline;">Haz clic aquí para descargar formato manualmente</a>`, 'error');
  }
}

function validatePermissionForm() {
  const name = document.getElementById('permission-name');
  const comments = document.getElementById('permission-comments');
  
  if (!name.value.trim()) {
    showNotification('El nombre es obligatorio', 'error');
    return false;
  }
  
  if (!comments.value.trim()) {
    showNotification('Los comentarios son obligatorios', 'error');
    return false;
  }
  
  const permissionTypes = [
    'permission-day',
    'permission-day-with-pay',
    'permission-paternity',
    'permission-bereavement',
    'permission-marriage',
    'permission-hours'
  ];
  
  const hasPermissionType = permissionTypes.some(type => 
    document.getElementById(type).checked
  );
  
  if (!hasPermissionType) {
    showNotification('Seleccione al menos un tipo de permiso', 'error');
    return false;
  }
  
  if (document.getElementById('permission-hours').checked) {
    const entryTime = document.getElementById('permission-entry-time').value;
    const exitTime = document.getElementById('permission-exit-time').value;
    
    if (!entryTime || !exitTime) {
      showNotification('Para permiso por horas, debe especificar hora de entrada y salida', 'error');
      return false;
    }
  }
  
  return true;
}

async function handleAttendanceSubmit(e) {
  if (!e) return;
  e.preventDefault();
  
  if (!validateAttendanceForm()) {
    return;
  }
  
  const fechaInput = document.getElementById('attendance-date').value;
  
  const formData = {
    FECHA: fechaInput,
    NOMBRE: document.getElementById('employee-name').value,
    MOTIVO: document.getElementById('attendance-type').value,
    NOTAS: '',
    PUNTOS: getPoints(document.getElementById('attendance-type').value)
  };
  
  const result = await fetchSheetData(
    sheetConnections.productivity, 
    'append', 
    [formData]
  );
  
  if (!result.error) {
    showNotification('Registro exitoso', 'success');
    closeAttendanceModal();
    await loadAttendanceData();
  }
}

async function handleVacationSubmit(e) {
  if (!e) return;
  e.preventDefault();
  
  if (!validateVacationForm()) {
    return;
  }
  
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showAccessDeniedMessage();
    return;
  }
  
  const startDate = document.getElementById('vacation-start-date').value;
  const days = parseFloat(document.getElementById('vacation-days').value);
  
  const selectedEmployee = document.querySelector(`#employee-names-list option[value="${document.getElementById('vacation-employee-name').value}"]`);
  
  const formData = {
    'Name': document.getElementById('vacation-employee-name').value,
    'Entry Date': selectedEmployee?.dataset.entryDate || '',
    'ID #': document.getElementById('vacation-employee-id').value,
    'Days Vacations': days,
    'Fecha de salida': startDate,
    'Fecha de Regreso': calculateReturnDate(startDate, days),
    'Autorizadas': false
  };
  
  const result = await fetchSheetData(
    sheetConnections.vacations, 
    'append', 
    [formData]
  );
  
  if (!result.error) {
    showNotification('Solicitud de vacaciones enviada', 'success');
    closeVacationModal();
    await loadVacationData();
  }
}

function calculateReturnDate(startDate, days) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + Math.ceil(days));
  return date.toISOString().split('T')[0];
}

function getPoints(type) {
  const pointsMap = {
    'Asistencia': 'parametro de prueba',
    'Permiso - Por Hora': 'Revisar hoja de permiso',
    'Permiso - Por Día': '-10',
    'Falta injustificada': '-10',
    'Vacaciones': 'N/A',
    'Suspensión': '-10',
    'Falta justificada': '-10',
    'NO SE ESCANEA O NO CUENTA CON GAFETE': '-$10',
    '5hrs': 'N/A',
    'Incapacidad': '-10'
  };
  return pointsMap[type] || '0';
}

function validateAttendanceForm() {
  const date = document.getElementById('attendance-date');
  const name = document.getElementById('employee-name');
  const type = document.getElementById('attendance-type');

  if (!date || !name || !type || !date.value || !name.value.trim() || !type.value) {
    showNotification('Por favor, complete todos los campos', 'error');
    return false;
  }

  if (name.value.trim().length < 3) {
    showNotification('El nombre debe tener al menos 3 caracteres', 'error');
    return false;
  }

  return true;
}

function validateVacationForm() {
  const name = document.getElementById('vacation-employee-name');
  const startDate = document.getElementById('vacation-start-date');
  const employeeId = document.getElementById('vacation-employee-id');
  const position = document.getElementById('vacation-position');
  const days = document.getElementById('vacation-days');

  if (!name || !startDate || !employeeId || !position || !days || 
      !name.value.trim() || !startDate.value || !employeeId.value.trim() || 
      !position.value.trim() || !days.value) {
    showNotification('Por favor, complete todos los campos', 'error');
    return false;
  }

  if (name.value.trim().length < 3) {
    showNotification('El nombre debe tener al menos 3 caracteres', 'error');
    return false;
  }

  const daysValue = parseFloat(days.value);
  if (isNaN(daysValue) || daysValue < 0.1 || daysValue > 30) {
    showNotification('Los días de vacaciones deben estar entre 0.1 y 30', 'error');
    return false;
  }

  const today = new Date();
  const start = new Date(startDate.value);
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  if (start < today) {
    showNotification('La fecha de inicio no puede ser anterior a hoy', 'error');
    return false;
  }

  return true;
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  if (message.includes('<')) {
    notification.innerHTML = message;
  } else {
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-notification';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 500);
  }, 5000);
}

function initializeTableFilters() {
  setupFilterAutocomplete();
}

function switchActiveSection(clickedItem, sectionName) {
  if (!clickedItem || !sectionName) return;
  
  elements.navItems.forEach(nav => {
    if (nav) nav.classList.remove('active');
  });
  clickedItem.classList.add('active');
  
  elements.sections.forEach(section => {
    if (section) section.classList.remove('active');
  });
  
  const section = document.getElementById(sectionName + '-section');
  if (section) section.classList.add('active');
  
  updatePageTitles(sectionName);
}

function updatePageTitles(sectionName) {
  if (!elements.pageTitle || !elements.pageSubtitle) return;
  
  if (sectionName === 'asistencias') {
    elements.pageTitle.textContent = 'Control de Asistencias';
    elements.pageSubtitle.textContent = 'Gestiona las asistencias y faltas del personal';
  } else if (sectionName === 'suspensiones') {
    elements.pageTitle.textContent = 'Gestión de Suspensiones';
    elements.pageSubtitle.textContent = 'Administra las suspensiones del personal';
  } else if (sectionName === 'vacaciones') {
    elements.pageTitle.textContent = 'Gestión de Vacaciones';
    elements.pageSubtitle.textContent = 'Administra las vacaciones programadas del personal';
  } else if (sectionName === 'permisos') {
    elements.pageTitle.textContent = 'Solicitud de Permisos';
    elements.pageSubtitle.textContent = 'Gestiona los permisos del personal';
  }
}

function calculateSuggestedDays(employeeName) {
  const employeeSuspensions = suspensionData.filter(item => 
    item.NOMBRE === employeeName && 
    item.STATUS && 
    item.STATUS.toUpperCase() === 'REALIZADA'
  );
  const suspensionCount = employeeSuspensions.length;
  
  if (suspensionCount === 0) return 1;
  if (suspensionCount === 1) return 2;
  if (suspensionCount === 2) return 3;
  
  return Math.min(suspensionCount + 1, 8);
}

async function updateSuspensionStatuses() {
  suspensionCandidates = [];
  notAppliedSuspensions = [];
  appliedSuspensions = [];
  automaticDismissalCandidates = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Total de registros en suspensionData:', suspensionData.length);
  
  const employeesMap = new Map();

  suspensionData.forEach(suspension => {
    if (!suspension.FECHA || !suspension.NOMBRE) return;
    
    const employeeName = suspension.NOMBRE;
    if (!employeesMap.has(employeeName)) {
      employeesMap.set(employeeName, []);
    }
    employeesMap.get(employeeName).push(suspension);
  });

  for (const [employeeName, suspensions] of employeesMap) {
    const validSuspensions = suspensions.filter(s => s.FECHA && s.NOMBRE);
    
    validSuspensions.forEach(suspension => {
      const absenceDate = new Date(suspension.FECHA);
      absenceDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - absenceDate) / (1000 * 60 * 60 * 24));
      const status = suspension.STATUS || 'PENDIENTE';
      const isApplied = status.toUpperCase() === 'REALIZADA';

      if (isApplied) {
        appliedSuspensions.push({
          employeeName: suspension.NOMBRE,
          suspensionDate: suspension['FECHA DE APLICACION'] || suspension.FECHA,
          days: calculateSuggestedDays(suspension.NOMBRE),
          originalAbsences: '1 falta',
          absenceDate: suspension.FECHA
        });
        return;
      }

      if (daysDiff > 30) {
        notAppliedSuspensions.push({
          employeeName: suspension.NOMBRE,
          firstAbsenceDate: suspension.FECHA,
          deadline: new Date(absenceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'NO APLICADA',
          absenceDate: suspension.FECHA
        });
        return;
      }

      if (daysDiff <= 30) {
        const employeeAbsencesLast30Days = validSuspensions.filter(item => {
          const itemDate = new Date(item.FECHA);
          itemDate.setHours(0, 0, 0, 0);
          const itemDaysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
          return itemDaysDiff <= 30;
        });

        if (employeeAbsencesLast30Days.length >= 4) {
          const firstAbsence = employeeAbsencesLast30Days.reduce((earliest, current) => {
            return new Date(current.FECHA) < new Date(earliest.FECHA) ? current : earliest;
          });
          
          const lastAbsence = employeeAbsencesLast30Days.reduce((latest, current) => {
            return new Date(current.FECHA) > new Date(latest.FECHA) ? current : latest;
          });

          const alreadyInDismissal = automaticDismissalCandidates.some(
            candidate => candidate.employeeName === employeeName
          );

          if (!alreadyInDismissal) {
            automaticDismissalCandidates.push({
              employeeName: employeeName,
              firstAbsenceDate: firstAbsence.FECHA,
              lastAbsenceDate: lastAbsence.FECHA,
              absencesCount: employeeAbsencesLast30Days.length,
              status: 'BAJA'
            });
          }
          return;
        }

        const mondayFridayCount = validSuspensions.filter(item => 
          isMondayOrFriday(item.FECHA)
        ).length;

        const alreadyInCandidates = suspensionCandidates.some(
          candidate => candidate.employeeName === employeeName && 
          candidate.firstAbsenceDate === suspension.FECHA
        );

        if (!alreadyInCandidates) {
          suspensionCandidates.push({
            employeeName: suspension.NOMBRE,
            firstAbsenceDate: suspension.FECHA,
            absencesCount: 1,
            mondayFridayCount: mondayFridayCount,
            suggestedDays: calculateSuggestedDays(suspension.NOMBRE),
            status: 'PENDIENTE',
            absencesData: [suspension],
            deadline: new Date(absenceDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          });
        }
      }
    });
  }

  console.log('Candidatos a suspensión:', suspensionCandidates.length);
  console.log('Suspensiones no aplicadas:', notAppliedSuspensions.length);
  console.log('Suspensiones aplicadas:', appliedSuspensions.length);
  console.log('Candidatos a baja:', automaticDismissalCandidates.length);

  renderSuspensionTables();

  if (suspensionCandidates.length > 0) {
    showSuspensionNotification();
  }

  if (automaticDismissalCandidates.length > 0) {
    showDismissalNotification();
  }
}

function openSuspensionModal(candidateIndex) {
  if (!isAuthorizedUser()) {
    showNotification('Solo Marco Cruger o Itati Bautista pueden aplicar suspensiones', 'error');
    return;
  }
  
  const candidate = suspensionCandidates[candidateIndex];
  const employee = employeesData.find(emp => emp.Name === candidate.employeeName);
  
  document.getElementById('suspension-employee-name').value = candidate.employeeName;
  document.getElementById('suspension-employee-id').value = employee ? employee['ID #'] : '';
  document.getElementById('suspension-days-suggested').value = candidate.suggestedDays;
  document.getElementById('suspension-description').value = `falto injustificadamente el dia ${formatDate(candidate.firstAbsenceDate)}`;
  
  elements.suspensionModal.dataset.candidateIndex = candidateIndex;
  
  createSuspensionInfoSection(candidate);
  createDateInputs(candidate.suggestedDays);
  
  elements.suspensionModal.classList.add('active');
}

function createSuspensionInfoSection(candidate) {
  const suspensionForm = document.getElementById('suspension-form');
  
  const existingInfoSection = document.getElementById('suspension-info-section');
  if (existingInfoSection) {
    existingInfoSection.remove();
  }
  
  const infoSection = document.createElement('div');
  infoSection.id = 'suspension-info-section';
  infoSection.className = 'suspension-info';
  
  infoSection.innerHTML = `
    <h4>Información de la Suspensión</h4>
    <p><strong>Empleado:</strong> ${candidate.employeeName}</p>
    <p><strong>Faltas:</strong> ${candidate.absencesCount}</p>
    <p><strong>Días sugeridos:</strong> ${candidate.suggestedDays}</p>
    <p><strong>Primera falta:</strong> ${formatDate(candidate.firstAbsenceDate)}</p>
  `;
  
  const firstField = suspensionForm.querySelector('.form-group');
  suspensionForm.insertBefore(infoSection, firstField);
}

function createDateInputs(suggestedDays) {
  const suspensionForm = document.getElementById('suspension-form');
  
  const existingDateContainer = document.getElementById('suspension-date-container');
  if (existingDateContainer) {
    existingDateContainer.remove();
  }
  
  const dateContainer = document.createElement('div');
  dateContainer.id = 'suspension-date-container';
  dateContainer.className = 'date-inputs-container';
  
  const title = document.createElement('h4');
  title.textContent = `Fechas de Aplicación de Suspensión (${suggestedDays} día(s)) - Lunes a Viernes`;
  title.style.color = 'var(--slate-300)';
  title.style.marginBottom = '1rem';
  dateContainer.appendChild(title);
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayLocal = `${year}-${month}-${day}`;
  
  for (let i = 0; i < suggestedDays; i++) {
    const dateInputGroup = document.createElement('div');
    dateInputGroup.className = 'date-input-group';
    
    const label = document.createElement('label');
    label.textContent = `Día ${i + 1}:`;
    label.htmlFor = `suspension-date-${i}`;
    label.style.minWidth = '80px';
    
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'form-input suspension-date-input';
    input.id = `suspension-date-${i}`;
    input.required = true;
    input.min = todayLocal; 
    
    dateInputGroup.appendChild(label);
    dateInputGroup.appendChild(input);
    dateContainer.appendChild(dateInputGroup);
  }
  
  const descriptionField = document.getElementById('suspension-description');
  descriptionField.parentNode.insertBefore(dateContainer, descriptionField.nextSibling);
}

async function handleSuspensionSubmit(e) {
  e.preventDefault();
  
  const candidateIndex = elements.suspensionModal.dataset.candidateIndex;
  const dateInputs = document.querySelectorAll('.suspension-date-input');
  
  if (dateInputs.length === 0) {
    showNotification('Error: No se generaron campos de fecha', 'error');
    return;
  }
  
  const suspensionDates = [];
  let hasError = false;
  
  for (const input of dateInputs) {
    const date = input.value;
    
    if (!date) {
      showNotification('Por favor complete todas las fechas de suspensión', 'error');
      hasError = true;
      break;
    }
    
    if (!isValidSuspensionDay(date)) {
      const dateObj = new Date(date);
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = dayNames[dateObj.getDay()];
      showNotification(`La fecha ${date} (${dayName}) debe ser día laboral (lunes a viernes)`, 'error');
      hasError = true;
      break;
    }
    
    suspensionDates.push(date);
  }
  
  if (hasError) return;
  
  const candidate = suspensionCandidates[candidateIndex];
  const employee = employeesData.find(emp => emp.Name === candidate.employeeName);
  
  try {
    showNotification('Procesando suspensión...', 'success');
    
    const alreadyApplied = appliedSuspensions.some(applied => 
      applied.employeeName === candidate.employeeName && 
      applied.absenceDate === candidate.firstAbsenceDate
    );
    
    if (alreadyApplied) {
      showNotification('Esta suspensión ya fue aplicada anteriormente', 'error');
      return;
    }
    
    await generateSuspensionPDF(candidate, employee, suspensionDates);
    
    await updateSuspensionConcentradoCorrectly(candidate, suspensionDates);
    
    appliedSuspensions.push({
      employeeName: candidate.employeeName,
      suspensionDate: suspensionDates.join(', '),
      days: candidate.suggestedDays,
      originalAbsences: candidate.absencesCount + ' falta(s)',
      absenceDate: candidate.firstAbsenceDate
    });
    
    suspensionCandidates.splice(candidateIndex, 1);
    
    closeSuspensionModal();
    await loadSuspensionData();
    await updateSuspensionStatuses();
    showNotification('Suspensión aplicada exitosamente', 'success');
    
  } catch (error) {
    console.error('Error en handleSuspensionSubmit:', error);
    showNotification('Error al aplicar la suspensión: ' + error.message, 'error');
  }
}

async function updateSuspensionConcentradoCorrectly(candidate, suspensionDates) {
  try {
    const applicationDate = formatDateForSuspension(new Date());
    
    console.log('Actualizando concentrado correctamente para:', candidate.employeeName);
    
    let updatedCount = 0;
    
    for (const absence of candidate.absencesData) {
      const absenceDateFormatted = formatDateForSuspension(absence.FECHA);
      
      console.log('Buscando registro específico en concentrado:', {
        FECHA: absenceDateFormatted,
        NOMBRE: candidate.employeeName
      });
      
      const existingRecord = suspensionData.find(item => 
        formatDateForSuspension(item.FECHA) === absenceDateFormatted && 
        item.NOMBRE === candidate.employeeName
      );
      
      if (!existingRecord) {
        console.log('No se encontró el registro específico en concentrado');
        continue;
      }
      
      console.log('Registro encontrado en concentrado:', existingRecord);
      
      const updateData = {
        'FECHA': absenceDateFormatted,
        'NOMBRE': candidate.employeeName,
        'MOTIVO': existingRecord.MOTIVO || 'Falta injustificada',
        'STATUS': 'REALIZADA',
        'FECHA DE APLICACION': applicationDate
      };
      
      console.log('Actualizando registro en concentrado:', updateData);
      
      const updateResult = await fetchSheetData(
        sheetConnections.suspensionConcentrado,
        'update',
        updateData
      );
      
      console.log('Resultado de actualización:', updateResult);
      
      if (updateResult.error) {
        console.error('Error actualizando registro:', updateResult.error);
      } else if (updateResult.updated) {
        console.log('Registro actualizado exitosamente en concentrado');
        updatedCount++;
      } else {
        console.log('No se pudo actualizar el registro en concentrado.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (updatedCount === 0) {
      throw new Error('No se pudo actualizar ningún registro en el concentrado');
    }
    
    return { success: true, updatedCount };
    
  } catch (error) {
    console.error('Error en updateSuspensionConcentradoCorrectly:', error);
    throw error;
  }
}

async function generateSuspensionPDF(candidate, employee, suspensionDates) {
  try {
    showNotification('Generando PDF de suspensión...', 'success');
    
    const formattedDates = suspensionDates.map(date => formatDateForSuspension(date)).join('-');
    const today = new Date();
    const todayFormatted = formatDateForSuspension(today);
    
    const suspensionData = {
      'Nombre': candidate.employeeName,
      'NumeroEmpleado': employee ? employee['ID #'] : '',
      'FechadeHoy': todayFormatted,
      'Descripciondelasfaltas': `falto injustificadamente el dia ${formatDateForSuspension(candidate.firstAbsenceDate)}`,
      'FechaSuspencion': formattedDates
    };
    
    const saveResult = await fetchSheetData(
      sheetConnections.suspensionFormato,
      'append',
      [suspensionData]
    );
    
    if (saveResult.error) {
      throw new Error('Error al guardar en formato de suspensión: ' + saveResult.error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const spreadsheetId = sheetConnections.suspensionFormato.spreadsheetId;
    const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&portrait=true&size=A4&fitw=true&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false&gid=0`;
    
    const timestamp = new Date().getTime();
    const fileName = `Formato_Suspension_${candidate.employeeName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showNotification('PDF de suspensión descargado exitosamente', 'success');
      
    } catch (fetchError) {
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = fileName;
      downloadLink.target = '_blank';
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
      }, 1000);
      
      showNotification('PDF de suspensión descargado exitosamente', 'success');
    }
    
  } catch (error) {
    console.error('Error generando PDF de suspensión:', error);
    
    const spreadsheetId = sheetConnections.suspensionFormato.spreadsheetId;
    const fallbackUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=0`;
    
    const downloadLink = document.createElement('a');
    downloadLink.href = fallbackUrl;
    downloadLink.download = `Formato_Suspension_${candidate.employeeName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => document.body.removeChild(downloadLink), 1000);
    
    showNotification('PDF de suspensión descargado (método alternativo)', 'success');
  }
}

function closeSuspensionModal() {
  if (elements.suspensionModal) {
    elements.suspensionModal.classList.remove('active');
  }
  if (elements.suspensionForm) {
    elements.suspensionForm.reset();
  }
  
  const infoSection = document.getElementById('suspension-info-section');
  if (infoSection) {
    infoSection.remove();
  }
  
  const dateContainer = document.getElementById('suspension-date-container');
  if (dateContainer) {
    dateContainer.remove();
  }
}

function closeSuspensionDateModal() {
  if (elements.suspensionDateModal) {
    elements.suspensionDateModal.classList.remove('active');
  }
}

function confirmSuspensionDate() {
  const selectedDate = document.getElementById('selected-suspension-date').value;
  
  if (!selectedDate) {
    showNotification('Por favor seleccione una fecha de suspensión', 'error');
    return;
  }
  
  if (!isValidSuspensionDay(selectedDate)) {
    showNotification('La fecha de suspensión debe ser día laboral (lunes a viernes)', 'error');
    return;
  }
  
  document.getElementById('suspension-date').value = selectedDate;
  closeSuspensionDateModal();
  elements.suspensionModal.classList.add('active');
}

function isAuthorizedUser() {
  return currentUser && 
         (currentUser.name.toLowerCase() === 'marco cruger' || 
          currentUser.name.toLowerCase() === 'itati bautista');
}

function initializeSuspensionSound() {
  try {
    suspensionSound = new Audio();
  } catch (error) {
    console.error('Error inicializando sonido:', error);
  }
}

function playSuspensionSound() {
  if (suspensionSound) {
    suspensionSound.play().catch(e => console.log('Error reproduciendo sonido:', e));
  }
}

function showSuspensionNotification() {
  if (elements.suspensionNotification) {
    elements.suspensionNotification.style.display = 'flex';
    elements.suspensionNotification.className = 'notification warning';
    document.getElementById('notification-message').textContent = 
      `Hay ${suspensionCandidates.length} candidato(s) a suspensión pendientes`;
  }
}

function showDismissalNotification() {
  const notification = document.createElement('div');
  notification.className = 'notification dismissal-notification';
  notification.innerHTML = `
    <span><strong>CANDIDATO A BAJA AUTOMÁTICA:</strong> ${automaticDismissalCandidates.length} empleado(s) con 4+ faltas en 30 días</span>
    <button class="close-notification">&times;</button>
  `;
  
  notification.querySelector('.close-notification').addEventListener('click', () => {
    notification.remove();
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 500);
  }, 10000);
}

function scheduleHourlySuspensionCheck() {
  if (suspensionCheckInterval) {
    clearInterval(suspensionCheckInterval);
  }
  
  suspensionCheckInterval = setInterval(async () => {
    const now = new Date();
    
    if (!lastSuspensionCheckTime || (now - lastSuspensionCheckTime) >= 2 * 60 * 60 * 1000) {
      await loadSuspensionData();
      await updateSuspensionStatuses();
      
      if (suspensionCandidates.length > 0 || automaticDismissalCandidates.length > 0) {
        playSuspensionSound();
        
        if (suspensionCandidates.length > 0) {
          showSuspensionNotification();
        }
        
        if (automaticDismissalCandidates.length > 0) {
          showDismissalNotification();
        }
      }
      
      lastSuspensionCheckTime = now;
    }
  }, 30 * 60 * 1000);
}

window.openSuspensionModal = openSuspensionModal;
window.closeSuspensionModal = closeSuspensionModal;
window.closeSuspensionDateModal = closeSuspensionDateModal;
window.confirmSuspensionDate = confirmSuspensionDate;

document.addEventListener('DOMContentLoaded', initializeApp);
