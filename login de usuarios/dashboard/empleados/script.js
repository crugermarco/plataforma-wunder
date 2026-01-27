const SCRIPT_SUSPENCION_URL = 'https://script.google.com/macros/s/AKfycbxhCrsH4v93AZlx9YmNdBVDCTvD5yNzz4E7JalcfbrQEJG0YNrlL4lRjZ8qNlRVUeb0ug/exec'
const SCRIPT_VACACIONES_URL = 'https://script.google.com/macros/s/AKfycbxBmNzLb2a2D0x52w6EA-e534VCTreo1uxRIW4_fq67aLbjQR0uX1uDjchuBLdY-iSQ/exec'
const FORMATO_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIm50evaQ-4qohsHZUTMHiIjEaVlJrNtYn-fm7ymjRRDGMw8vjD7omQYAdEx0AHj6q/exec'

const sheetConnections = {
  productivity: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbw1r_Hkv3aWEvIOqtf3mP7o82tTlevWTFCGRInBKqSUqPNtlQKUNYNb3dh34NYIh2ld/exec',
    spreadsheetId: '1NsT7jztJLNZgOE6xJkSofq2hqcpE-1ySiChjVM-zV0c',
    sheetName: 'Productivity Bonus 2025'
  },
  vacations: {
    scriptUrl: SCRIPT_VACACIONES_URL,
    spreadsheetId: '1ZDpnn0axnQ80USHsTbGbx92cTq7LI1g-ZOBuadoT0hY',
    sheetName: 'CONCENTRADO DE VACACIONES'
  },
  nonWorkingDays: {
    scriptUrl: SCRIPT_VACACIONES_URL,
    spreadsheetId: '1ZDpnn0axnQ80USHsTbGbx92cTq7LI1g-ZOBuadoT0hY',
    sheetName: 'DIAS NO LABORABLES'
  },
  employees: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxn3SzwPkDh4ErM6e0EeXyKw3q8d1lxlvEmkpEtFuvfeoVs3nwg41fTT6rNrYrd7n0c/exec',
    spreadsheetId: '1jO4KTH6X7NVslzTXQqMcrSa5XzFifBOMBTYduSMtJQE',
    sheetName: 'DATA'
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
  },
  vacationFormato: {
    scriptUrl: FORMATO_SCRIPT_URL,
    spreadsheetId: '1ZDpnn0axnQ80USHsTbGbx92cTq7LI1g-ZOBuadoT0hY',
    sheetName: 'FORMATO DE VACACIONES'
  },
};

const columnMappingVacation = {
  'NOMBRE': 'A',
  'FECHA DE INGRESO': 'B',
  'NUMERO DE EMPLEADO': 'C',
  'ÁREA': 'D',
  'DÍAS VACACIONES': 'E',
  'FECHA DE PAGO': 'F',
  'FECHA SALIDA': 'G',
  'FECHA REGRESO': 'H',
  'AUTORIZADAS': 'I',
  'DÍAS TOMADOS': 'J',
  'GUARDAR DICIEMBRE': 'K'
};

let attendanceData = [];
let vacationData = [];
let employeesData = [];
let nonWorkingDaysData = [];
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
let filteredVacationData = [];
let vacationFilters = {
    nombre: '',
    area: '',
    diciembre: ''
};

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
  dismissalNotification: null,
  exportDataBtn: null,
  dataTableBody: null,
  addEmployeeBtn: null,
  exportVacationExcelBtn: null,
  addVacationScheduleBtn: null,
  vacationConcentradoBody: null,
  vacationFilterNombre: null,
  vacationFilterArea: null,
  vacationFilterDiciembre: null
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
  elements.permissionsTableBody = document.getElementById('permissions-table-body');
  elements.userNameDisplay = document.getElementById('userNameDisplay');
  elements.suspensionNotification = document.getElementById('suspension-notification');
  elements.exportDataBtn = document.getElementById('export-data-btn');
  elements.dataTableBody = document.getElementById('data-table-body');
  elements.addEmployeeBtn = document.getElementById('add-employee-btn');
  elements.exportVacationExcelBtn = document.getElementById('export-vacation-excel-btn');
  elements.addVacationScheduleBtn = document.getElementById('add-vacation-schedule-btn');
  elements.vacationConcentradoBody = document.getElementById('vacation-concentrado-body');
  elements.vacationFilterNombre = document.getElementById('vacation-filter-nombre');
  elements.vacationFilterArea = document.getElementById('vacation-filter-area');
  elements.vacationFilterDiciembre = document.getElementById('vacation-filter-diciembre');
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

function formatDateForVacation(dateString) {
  if (!dateString) return '';
  
  if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const [part1, part2, year] = dateString.split('/');
    return `${part1.padStart(2, '0')}/${part2.padStart(2, '0')}/${year}`;
  }
  
  try {
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
    return dateString;
  }
}

function formatDateForSheet(dateString) {
  if (!dateString) return '';
  
  try {
    if (typeof dateString === 'string' && dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
      const [part1, part2, year] = dateString.split('/').map(Number);
      
      if (part1 > 12 && part2 <= 12) {
        return `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`;
      }
      
      if (part1 <= 12 && part2 <= 12) {
        return `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`;
      }
    }
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${month}/${day}/${year}`;
    }
    
    return dateString;
    
  } catch (e) {
    return dateString;
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  try {
    if (typeof dateString === 'string' && dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
      const [month, day, year] = dateString.split('/').map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
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
    await loadNonWorkingDaysData();
    await loadSuspensionData();
    initializeEventListeners();
    await loadAttendanceData();
    
    setupVacationAutocomplete();
    setupPermissionAutocomplete();
    setupFilterAutocomplete();
    setupVacationFilters();
    
    initializeSuspensionSound();
    scheduleHourlySuspensionCheck();
    await updateSuspensionStatuses();
    
    applyBlinkingStyles();
    addExportButton();
    
    if (elements.exportVacationExcelBtn) {
      elements.exportVacationExcelBtn.addEventListener('click', exportVacationToExcel);
    }
    
    if (elements.addVacationScheduleBtn) {
      elements.addVacationScheduleBtn.addEventListener('click', openVacationScheduleModal);
    }
    
    showNotification('Aplicación cargada correctamente', 'success');
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    showNotification('Error al cargar la aplicación. Verifica la conexión.', 'error');
  }
}

async function loadNonWorkingDaysData() {
  try {
    const result = await fetchSheetData(sheetConnections.nonWorkingDays);
    if (result && result.error) {
      nonWorkingDaysData = [];
      return;
    }
    
    nonWorkingDaysData = result && result.data ? result.data : [];
  } catch (error) {
    nonWorkingDaysData = [];
  }
}

function isNonWorkingDay(date) {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }
    
    const dateStr = formatDate(dateObj);
    
    const specificNonWorkingDays = [
      '02/02/2026',
      '03/16/2026',
      '04/03/2026',
      '05/01/2026',
      '09/16/2026',
      '11/16/2026',
      '12/25/2026',
      '01/01/2027'
    ];
    
    if (specificNonWorkingDays.includes(dateStr)) {
      return true;
    }
    
    if (nonWorkingDaysData && nonWorkingDaysData.length > 0) {
      return nonWorkingDaysData.some(day => {
        if (!day.FECHA && !day.Date) return false;
        try {
          const nonWorkingDate = new Date(day.FECHA || day.Date);
          const nonWorkingDateStr = formatDate(nonWorkingDate);
          return nonWorkingDateStr === dateStr;
        } catch (e) {
          return false;
        }
      });
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

async function loadVacationConcentradoData() {
  try {
    const result = await fetchSheetData(sheetConnections.vacations);
    
    if (result.error) {
      showNotification('Error al cargar datos de vacaciones', 'error');
      return;
    }
    
    vacationData = result.data || [];
    filteredVacationData = [...vacationData];
    
    renderVacationConcentradoTable();
    checkUpcomingVacations();
    
  } catch (error) {
    console.error('Error al cargar vacaciones:', error);
    showNotification('Error crítico al cargar vacaciones', 'error');
  }
}

function renderVacationConcentradoTable() {
  const tableBody = elements.vacationConcentradoBody;
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (filteredVacationData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="12" class="no-data">No hay datos de vacaciones disponibles</td>';
    tableBody.appendChild(row);
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  filteredVacationData.forEach((item, index) => {
    const formatDateFromSheet = (dateValue) => {
      if (!dateValue) return '';
      
      if (typeof dateValue === 'string') {
        if (dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const [part1, part2, year] = dateValue.split('/').map(Number);
          
          if (part1 > 12 && part2 <= 12) {
            return `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`;
          }
          
          return `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`;
        }
        
        if (dateValue.includes('Date(') || dateValue.includes('-') || dateValue.includes('T')) {
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
          } catch (e) {
            console.error(`Error parseando fecha:`, e);
          }
        }
      }
      
      if (dateValue instanceof Date) {
        const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
        const day = dateValue.getDate().toString().padStart(2, '0');
        const year = dateValue.getFullYear();
        return `${month}/${day}/${year}`;
      }
      
      return dateValue;
    };
    
    const fechaIngreso = formatDateFromSheet(item['FECHA DE INGRESO']);
    const fechaPago = formatDateFromSheet(item['FECHA DE PAGO']);
    const fechaSalida = formatDateFromSheet(item['FECHA SALIDA']);
    const fechaRegreso = formatDateFromSheet(item['FECHA REGRESO']);
    
    const nombre = item.NOMBRE || '';
    const numeroEmpleado = item['NUMERO DE EMPLEADO'] || '';
    const area = item['ÁREA'] || '';
    const diasVacaciones = item['DÍAS VACACIONES'] || '0';
    const autorizadas = item['AUTORIZADAS'] === true || item['AUTORIZADAS'] === 'TRUE' || item['AUTORIZADAS'] === 'true';
    const diasTomados = item['DÍAS TOMADOS'] || '0';
    const guardarDiciembre = item['GUARDAR DICIEMBRE'] || '0';
    
    const row = document.createElement('tr');
    
    if (autorizadas) {
      row.classList.add('blinking-row-green');
    }
    
    if (fechaSalida) {
      try {
        const [month, day, year] = fechaSalida.split('/').map(Number);
        const startDate = new Date(year, month - 1, day);
        
        const diffTime = startDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 15) {
          row.classList.add('blinking-row-red');
        } else if (diffDays > 15 && diffDays <= 30) {
          row.classList.add('blinking-row-yellow');
        }
        
      } catch (e) {
        console.error('Error al procesar fecha de salida:', fechaSalida, e);
      }
    }
    
const showActions = currentUser && (
    currentUser.name.toLowerCase() === 'marco cruger' || 
    currentUser.name.toLowerCase() === 'bosco alcazar'
);
    
    row.innerHTML = `
      <td>${nombre}</td>
      <td>${fechaIngreso}</td>
      <td>${numeroEmpleado}</td>
      <td>${area}</td>
      <td>${diasVacaciones}</td>
      <td>${fechaPago}</td>
      <td>${fechaSalida}</td>
      <td>${fechaRegreso}</td>
      <td>
        <label class="toggle-label">
          <input type="checkbox" class="toggle-input" ${autorizadas ? 'checked' : ''} 
            onchange="toggleVacationAuthorization(${vacationData.indexOf(item)}, this.checked)"
            ${!showActions ? 'disabled' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>${diasTomados}</td>
      <td>${guardarDiciembre}</td>
      <td>
        ${showActions ? `
          <div class="action-buttons">
            <button class="action-button small delete" onclick="deleteVacationRecord(${vacationData.indexOf(item)})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
            <button class="action-button small print" onclick="printVacationPDF(${vacationData.indexOf(item)})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Imprimir
            </button>
          </div>
        ` : '<span class="no-permission">Solo lectura</span>'}
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function setupVacationFilters() {
  if (elements.vacationFilterNombre) {
    elements.vacationFilterNombre.addEventListener('input', function() {
      vacationFilters.nombre = this.value.toLowerCase();
      applyVacationFilters();
    });
  }
  
  if (elements.vacationFilterArea) {
    elements.vacationFilterArea.addEventListener('input', function() {
      vacationFilters.area = this.value.toLowerCase();
      applyVacationFilters();
    });
  }
  
  if (elements.vacationFilterDiciembre) {
    elements.vacationFilterDiciembre.addEventListener('input', function() {
      vacationFilters.diciembre = this.value.toLowerCase();
      applyVacationFilters();
    });
  }
}

function applyVacationFilters() {
  filteredVacationData = [...vacationData];
  
  if (vacationFilters.nombre) {
    filteredVacationData = filteredVacationData.filter(item => {
      const nombre = item.NOMBRE || '';
      return nombre.toLowerCase().includes(vacationFilters.nombre);
    });
  }
  
  if (vacationFilters.area) {
    filteredVacationData = filteredVacationData.filter(item => {
      const area = item['ÁREA'] || '';
      return area.toLowerCase().includes(vacationFilters.area);
    });
  }
  
  if (vacationFilters.diciembre) {
    filteredVacationData = filteredVacationData.filter(item => {
      const diciembre = item['GUARDAR DICIEMBRE'] || '';
      return diciembre.toString().toLowerCase().includes(vacationFilters.diciembre);
    });
  }
  
  renderVacationConcentradoTable();
}

async function toggleVacationAuthorization(index, isAuthorized) {
  try {
    const record = vacationData[index];
    
    const updateData = {
      action: 'update',
      original: {
        NOMBRE: record.NOMBRE,
        'NUMERO DE EMPLEADO': record['NUMERO DE EMPLEADO'],
        'FECHA SALIDA': record['FECHA SALIDA']
      },
      updated: {
        'AUTORIZADAS': isAuthorized ? 'TRUE' : 'FALSE'
      }
    };
    
    const result = await fetchSheetData(sheetConnections.vacations, 'update', updateData);
    
    if (result.error) {
      showNotification('Error al actualizar autorización: ' + result.error, 'error');
      return;
    }
    
    vacationData[index]['AUTORIZADAS'] = isAuthorized;
    applyVacationFilters();
    showNotification(`Vacación ${isAuthorized ? 'autorizada' : 'desautorizada'} exitosamente`, 'success');
    
  } catch (error) {
    console.error('Error en toggleVacationAuthorization:', error);
    showNotification('Error al actualizar autorización', 'error');
  }
}

function checkUpcomingVacations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  employeesData.forEach(employee => {
    if (employee['FECHA DE INGRESO']) {
      const entryDate = new Date(employee['FECHA DE INGRESO']);
      const monthsWorked = (today.getFullYear() - entryDate.getFullYear()) * 12 + 
                           (today.getMonth() - entryDate.getMonth());
      
      if (monthsWorked >= 11 && monthsWorked < 12) {
        const hasVacations = vacationData.some(vacation => 
          vacation.NOMBRE === employee.NOMBRE && 
          (vacation['AUTORIZADAS'] === true || vacation['AUTORIZADAS'] === 'TRUE')
        );
        
        if (!hasVacations) {
          showNotification(`⚠️ ${employee.NOMBRE} necesita agendar sus vacaciones. Le quedan ${12 - monthsWorked} mes(es) para cumplir un año.`, 'warning');
        }
      }
    }
  });
}

function openVacationScheduleModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'vacation-schedule-modal';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;
  
  modal.innerHTML = `
    <div class="modal-content compact-modal">
      <div class="modal-header">
        <h3 class="modal-title">AGENDAR VACACIONES</h3>
        <button class="close-button" onclick="closeVacationScheduleModal()">&times;</button>
      </div>
      <form id="vacation-schedule-form">
        <div class="form-group">
          <label class="form-label">Nombre del Empleado *</label>
          <input type="text" class="form-input" id="schedule-employee-name" placeholder="Buscar empleado..." required>
          <div id="employee-suggestions" class="suggestions-dropdown"></div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha de Ingreso</label>
            <input type="text" class="form-input" id="schedule-entry-date" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Número de Empleado</label>
            <input type="text" class="form-input" id="schedule-employee-id" readonly>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Área</label>
            <input type="text" class="form-input" id="schedule-area" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Días de Vacaciones Disponibles</label>
            <input type="text" class="form-input" id="schedule-vacation-days" readonly>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Fecha de Pago</label>
          <select class="form-select" id="schedule-pay-date" onchange="handlePayDateChange(this.value)">
            <option value="">Seleccionar fecha de pago</option>
            <option value="fecha">Seleccionar fecha de pago</option>
            <option value="semanal">PAGO POR SEMANA</option>
          </select>
          <input type="date" class="form-input" id="schedule-custom-pay-date" style="display: none; margin-top: 0.5rem;">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha de Salida *</label>
            <input type="date" class="form-input" id="schedule-start-date" required 
              min="${formattedToday}" onchange="calculateVacationDates()">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de Regreso</label>
            <input type="text" class="form-input" id="schedule-return-date" readonly>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Días de Vacaciones a Tomar *</label>
          <input type="number" class="form-input" id="schedule-days-to-take" min="1.2" step="1.2" required 
            oninput="calculateVacationDates()">
          <small style="color: var(--slate-400);">Cada día de vacaciones equivale a 1.2 días laborales</small>
          <div id="days-calculation-info" style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--slate-300);"></div>
        </div>
        
        <div class="form-group">
          <label class="toggle-label">
            <span class="toggle-text">Autorizadas</span>
            <input type="checkbox" class="toggle-input" id="schedule-authorized">
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="form-group">
          <label class="form-label">Días que se Descontarán</label>
          <input type="text" class="form-input" id="schedule-days-taken" readonly>
        </div>
        
        <div class="form-group">
          <label class="form-label">Guardar Días de Vacaciones para Diciembre</label>
          <input type="number" class="form-input" id="schedule-december-save" min="0" step="1.2" value="0" 
            oninput="calculateVacationDates()">
          <small style="color: var(--slate-400);">Días de vacaciones que se guardarán para diciembre</small>
        </div>
        
        <div class="button-group">
          <button type="button" class="cancel-button" onclick="closeVacationScheduleModal()">Cancelar</button>
          <button type="submit" class="modern-button">Guardar Vacaciones</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setupEmployeeAutocomplete();
  setupVacationScheduleEvents();
  
  modal.classList.add('active');
}

function handlePayDateChange(value) {
  const customPayDateInput = document.getElementById('schedule-custom-pay-date');
  
  if (value === 'semanal') {
    customPayDateInput.style.display = 'none';
    customPayDateInput.value = '';
  } else if (value === 'fecha') {
    customPayDateInput.style.display = 'block';
    generateFridayOptions();
  } else {
    customPayDateInput.style.display = 'none';
    customPayDateInput.value = '';
  }
}

function generateFridayOptions() {
  const customPayDateInput = document.getElementById('schedule-custom-pay-date');
  const startDateInput = document.getElementById('schedule-start-date');
  
  if (!customPayDateInput) return;
  
  let targetMonth, targetYear;
  
  if (startDateInput && startDateInput.value) {
    const [year, month, day] = startDateInput.value.split('-');
    targetYear = parseInt(year);
    targetMonth = parseInt(month) - 1;
  } else {
    const today = new Date();
    const ensenadaDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
    targetYear = ensenadaDate.getFullYear();
    targetMonth = ensenadaDate.getMonth();
  }
  
  const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);
  
  let fridays = [];
  let currentDate = new Date(firstDayOfMonth);
  
  while (currentDate <= lastDayOfMonth) {
    if (currentDate.getDay() === 5) {
      fridays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  if (fridays.length > 0) {
    const fridayFormattedForInput = fridays.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    
    const fridayFormattedForDisplay = fridays.map(date => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    });
    
    customPayDateInput.min = fridayFormattedForInput[0];
    customPayDateInput.max = fridayFormattedForInput[fridayFormattedForInput.length - 1];
    
    let selectedFriday;
    
    if (startDateInput && startDateInput.value) {
      const startDate = new Date(startDateInput.value);
      
      for (let i = fridays.length - 1; i >= 0; i--) {
        if (fridays[i] <= startDate) {
          selectedFriday = fridays[i];
          break;
        }
      }
      
      if (!selectedFriday) {
        selectedFriday = fridays[fridays.length - 1];
      }
    } else {
      selectedFriday = fridays[0];
    }
    
    const selectedYear = selectedFriday.getFullYear();
    const selectedMonth = String(selectedFriday.getMonth() + 1).padStart(2, '0');
    const selectedDay = String(selectedFriday.getDate()).padStart(2, '0');
    const selectedFridayFormatted = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    
    customPayDateInput.value = selectedFridayFormatted;
    
    const fridayDisplayElement = document.getElementById('friday-display');
    if (!fridayDisplayElement) {
      const displayDiv = document.createElement('div');
      displayDiv.id = 'friday-display';
      displayDiv.className = 'friday-display';
      displayDiv.style.marginTop = '0.5rem';
      displayDiv.style.color = 'var(--slate-300)';
      displayDiv.style.fontSize = '0.9rem';
      displayDiv.innerHTML = `<strong>Viernes de pago:</strong> ${formatDateForDisplay(selectedFriday)}`;
      customPayDateInput.parentNode.appendChild(displayDiv);
    } else {
      fridayDisplayElement.innerHTML = `<strong>Viernes de pago:</strong> ${formatDateForDisplay(selectedFriday)}`;
    }
    
  } else {
    const defaultDate = new Date(targetYear, targetMonth, 15);
    const defaultYear = defaultDate.getFullYear();
    const defaultMonth = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const defaultDay = String(defaultDate.getDate()).padStart(2, '0');
    const defaultFormatted = `${defaultYear}-${defaultMonth}-${defaultDay}`;
    
    customPayDateInput.min = defaultFormatted;
    customPayDateInput.max = defaultFormatted;
    customPayDateInput.value = defaultFormatted;
  }
}

function formatDateForDisplay(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${month}/${day}/${year}`;
}

function getEnsenadaDate() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
}

function setupEmployeeAutocomplete() {
  const nameInput = document.getElementById('schedule-employee-name');
  const suggestionsDiv = document.getElementById('employee-suggestions');
  
  if (!nameInput || !suggestionsDiv) return;
  
  nameInput.addEventListener('input', function() {
    const value = this.value.toLowerCase().trim();
    suggestionsDiv.innerHTML = '';
    
    if (value.length < 2) return;
    
    const matches = employeesData.filter(emp => 
      emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(value)
    ).slice(0, 10);
    
    matches.forEach(emp => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = emp.NOMBRE;
      div.dataset.id = emp['NUMERO DE EMPLEADO'];
      div.dataset.area = emp.AREA;
      div.dataset.days = emp['DIAS DE VACACIONES'];
      div.dataset.entryDate = emp['FECHA DE INGRESO'];
      
      div.addEventListener('click', () => {
        nameInput.value = emp.NOMBRE;
        document.getElementById('schedule-entry-date').value = formatDate(emp['FECHA DE INGRESO']);
        document.getElementById('schedule-employee-id').value = emp['NUMERO DE EMPLEADO'];
        document.getElementById('schedule-area').value = emp.AREA;
        document.getElementById('schedule-vacation-days').value = emp['DIAS DE VACACIONES'] || '0';
        suggestionsDiv.innerHTML = '';
        
        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0];
        document.getElementById('schedule-start-date').min = todayFormatted;
        
        calculateVacationDates();
      });
      
      suggestionsDiv.appendChild(div);
    });
  });
  
  document.addEventListener('click', (e) => {
    if (!nameInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.innerHTML = '';
    }
  });
}

function setupVacationScheduleEvents() {
  const form = document.getElementById('vacation-schedule-form');
  if (form) {
    form.addEventListener('submit', handleVacationScheduleSubmit);
  }
  
  const daysToTakeInput = document.getElementById('schedule-days-to-take');
  const decemberSaveInput = document.getElementById('schedule-december-save');
  const startDateInput = document.getElementById('schedule-start-date');
  
  if (daysToTakeInput) {
    daysToTakeInput.addEventListener('input', calculateVacationDates);
  }
  
  if (decemberSaveInput) {
    decemberSaveInput.addEventListener('input', calculateVacationDates);
  }
  
  if (startDateInput) {
    startDateInput.addEventListener('change', calculateVacationDates);
  }
}

function calculateVacationDates() {
  const startDateInput = document.getElementById('schedule-start-date');
  const daysToTakeInput = document.getElementById('schedule-days-to-take');
  const decemberSaveInput = document.getElementById('schedule-december-save');
  const returnDateInput = document.getElementById('schedule-return-date');
  const infoDiv = document.getElementById('days-calculation-info');
  const vacationDaysInput = document.getElementById('schedule-vacation-days');
  const daysTakenInput = document.getElementById('schedule-days-taken');
  
  if (!startDateInput.value || !daysToTakeInput.value) {
    return;
  }
  
  const startDateStr = startDateInput.value;
  const [year, month, day] = startDateStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, day, 12, 0, 0);
  
  let daysToTake = parseFloat(daysToTakeInput.value) || 0;
  let decemberSave = parseFloat(decemberSaveInput.value) || 0;
  const availableDays = parseFloat(vacationDaysInput.value) || 0;
  
  const daysTaken = daysToTake;
  
  if (daysTakenInput) {
    daysTakenInput.value = daysTaken.toFixed(1);
  }
  
  const formattedStartDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  
  const WORK_DAYS_PER_VACATION_DAY = 1.2;
  const workDaysNeeded = Math.ceil(daysToTake / WORK_DAYS_PER_VACATION_DAY);
  
  let returnDate = new Date(startDate);
  let workDaysCounted = 0;
  let totalDaysElapsed = 0;
  let nonWorkingDaysCount = 0;
  
  while (workDaysCounted < workDaysNeeded) {
    returnDate.setDate(returnDate.getDate() + 1);
    totalDaysElapsed++;
    
    const dateStr = formatDateForInput(returnDate.toISOString().split('T')[0]);
    const isNonWorking = isNonWorkingDay(dateStr);
    
    if (!isNonWorking) {
      workDaysCounted++;
    } else {
      nonWorkingDaysCount++;
    }
    
    if (totalDaysElapsed > 365) {
      break;
    }
  }
  
  while (isNonWorkingDay(formatDateForInput(returnDate.toISOString().split('T')[0]))) {
    returnDate.setDate(returnDate.getDate() + 1);
  }
  
  const returnYear = returnDate.getFullYear();
  const returnMonth = (returnDate.getMonth() + 1).toString().padStart(2, '0');
  const returnDay = returnDate.getDate().toString().padStart(2, '0');
  const returnDateFormatted = `${returnMonth}/${returnDay}/${returnYear}`;
  
  if (returnDateInput) {
    returnDateInput.value = returnDateFormatted;
  }
  
  const totalUsed = daysToTake + decemberSave;
  const remainingBalance = availableDays - totalUsed;
  
  if (infoDiv) {
    infoDiv.innerHTML = `
      <div style="background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(71, 85, 105, 0.3);">
        <h4 style="color: var(--emerald-400); margin-bottom: 0.75rem;">RESUMEN DEL CÁLCULO</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: var(--slate-300);">Saldo disponible:</strong>
            <div style="color: var(--emerald-400); font-size: 1.1rem; font-weight: bold;">${availableDays.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: var(--slate-300);">Días a tomar:</strong>
            <div style="color: var(--blue-400); font-size: 1.1rem; font-weight: bold;">${daysToTake.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: var(--slate-300);">Guardar para diciembre:</strong>
            <div style="color: var(--amber-400); font-size: 1.1rem; font-weight: bold;">${decemberSave.toFixed(1)} días</div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.4); padding: 0.5rem; border-radius: 0.375rem;">
            <strong style="color: var(--slate-300);">Días descontados:</strong>
            <div style="color: var(--red-400); font-size: 1.1rem; font-weight: bold;">${daysTaken.toFixed(1)} días</div>
          </div>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.6); padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
          <strong style="color: var(--slate-300);">Cálculo de días laborales:</strong><br>
          <span style="color: var(--slate-400);">
            ${daysToTake.toFixed(1)} días de vacaciones ÷ ${WORK_DAYS_PER_VACATION_DAY} = ${workDaysNeeded} días laborales requeridos<br>
            Días contados: ${workDaysCounted} días laborales<br>
            Días no laborales saltados: ${nonWorkingDaysCount} días
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: rgba(59, 130, 246, 0.1); padding: 0.75rem; border-radius: 0.375br; border: 1px solid rgba(59, 130, 246, 0.3);">
            <strong style="color: var(--slate-300);">Fecha de salida:</strong><br>
            <span style="color: var(--blue-300); font-weight: 500;">${formattedStartDate}</span>
          </div>
          
          <div style="background: rgba(34, 197, 94, 0.1); padding: 0.75rem; border-radius: 0.375br; border: 1px solid rgba(34, 197, 94, 0.3);">
            <strong style="color: var(--slate-300);">Fecha de regreso:</strong><br>
            <span style="color: var(--emerald-300); font-weight: 500;">${returnDateFormatted}</span>
          </div>
        </div>
        
        <div style="background: rgba(15, 23, 42, 0.4); padding: 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(71, 85, 105, 0.3);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--slate-300);">Total días utilizados:</span>
            <span style="color: ${totalUsed > availableDays ? 'var(--red-400)' : 'var(--slate-300)'}; font-weight: bold;">
              ${totalUsed.toFixed(1)} días
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--slate-300);">Saldo restante:</span>
            <span style="color: ${remainingBalance < 0 ? 'var(--red-400)' : 'var(--emerald-400)'}; font-weight: bold;">
              ${remainingBalance.toFixed(1)} días
            </span>
          </div>
          
          ${remainingBalance < 0 ? `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem; margin-top: 0.5rem; border-radius: 0.375rem;">
              <span style="color: var(--red-400);">⚠️ Advertencia: El saldo sería negativo</span>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(71, 85, 105, 0.3);">
          <small style="color: var(--slate-500); font-style: italic;">
            Nota: Los días guardados para diciembre NO afectan la fecha de regreso
          </small>
        </div>
      </div>
    `;
  }
}

function getDayName(dayNumber) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber] || 'Desconocido';
}

function validateVacationScheduleForm() {
  const name = document.getElementById('schedule-employee-name');
  const startDate = document.getElementById('schedule-start-date');
  const daysToTake = document.getElementById('schedule-days-to-take');
  const decemberSave = document.getElementById('schedule-december-save');
  const vacationDays = document.getElementById('schedule-vacation-days');
  const payDateSelect = document.getElementById('schedule-pay-date');
  const customPayDateInput = document.getElementById('schedule-custom-pay-date');
  const returnDate = document.getElementById('schedule-return-date');
  
  if (!name.value.trim()) {
    showNotification('El nombre del empleado es obligatorio', 'error');
    return false;
  }
  
  if (!startDate.value) {
    showNotification('La fecha de salida es obligatoria', 'error');
    return false;
  }
  
  if (!returnDate.value) {
    showNotification('Por favor, calcule la fecha de regreso primero', 'error');
    calculateVacationDates();
    return false;
  }
  
  const daysValue = parseFloat(daysToTake.value);
  if (isNaN(daysValue) || daysValue < 1.2) {
    showNotification('Los días a tomar deben ser al menos 1.2 días', 'error');
    return false;
  }
  
  const decemberValue = parseFloat(decemberSave.value) || 0;
  const availableDays = parseFloat(vacationDays.value) || 0;
  
  if (daysValue > availableDays) {
    showNotification(`Los días a tomar (${daysValue}) superan los días disponibles (${availableDays})`, 'error');
    return false;
  }
  
  if (decemberValue > availableDays) {
    showNotification(`Los días a guardar (${decemberValue}) superan los días disponibles (${availableDays})`, 'error');
    return false;
  }
  
  if (daysValue + decemberValue > availableDays) {
    showNotification(`La suma de días a tomar (${daysValue}) y guardar (${decemberValue}) = ${(daysValue + diciembreValue).toFixed(1)} supera los días disponibles (${availableDays})`, 'error');
    return false;
  }
  
  if (payDateSelect.value === '') {
    showNotification('Seleccione una opción de fecha de pago', 'error');
    return false;
  }
  
  if (payDateSelect.value === 'fecha' && !customPayDateInput.value) {
    showNotification('Seleccione una fecha de pago válida', 'error');
    return false;
  }
  
  return true;
}

function closeVacationScheduleModal() {
  const modal = document.getElementById('vacation-schedule-modal');
  if (modal) {
    modal.remove();
  }
}

function deleteVacationRecord(index) {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showNotification('Solo Marco Cruger puede eliminar registros de vacaciones', 'error');
    return;
  }
  
  const record = vacationData[index];
  
  if (confirm(`¿Estás seguro de eliminar las vacaciones de ${record.NOMBRE} (${record['FECHA SALIDA']} - ${record['FECHA REGRESO']})?`)) {
    deleteVacationFromSheet(record, index);
  }
}

async function deleteVacationFromSheet(record, index) {
  try {
    showNotification('Eliminando registro de vacaciones...', 'success');
    
    const deleteData = {
      action: 'delete',
      NOMBRE: record.NOMBRE,
      'FECHA SALIDA': record['FECHA SALIDA'],
      'NUMERO DE EMPLEADO': record['NUMERO DE EMPLEADO']
    };
    
    const result = await fetchSheetData(sheetConnections.vacations, 'delete', deleteData);
    
    if (result.error) {
      showNotification('Error al eliminar: ' + result.error, 'error');
      return;
    }
    
    vacationData.splice(index, 1);
    applyVacationFilters();
    showNotification('Registro de vacaciones eliminado exitosamente', 'success');
    
  } catch (error) {
    showNotification('Error al eliminar registro de vacaciones', 'error');
  }
}

function handleVacationScheduleSubmit(e) {
  e.preventDefault();
  
  if (!validateVacationScheduleForm()) {
    return;
  }
  
  const name = document.getElementById('schedule-employee-name').value;
  const startDate = document.getElementById('schedule-start-date').value;
  const returnDateInput = document.getElementById('schedule-return-date');
  const daysToTake = parseFloat(document.getElementById('schedule-days-to-take').value) || 0;
  const decemberSave = parseFloat(document.getElementById('schedule-december-save').value) || 0;
  
  const daysTaken = daysToTake;
  
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const formattedStartDate = `${startMonth.toString().padStart(2, '0')}/${startDay.toString().padStart(2, '0')}/${startYear}`;
  
  const returnDateStr = returnDateInput.value;
  
  let formattedReturnDate = returnDateStr;
  
  if (returnDateStr && returnDateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const [part1, part2, year] = returnDateStr.split('/').map(Number);
    
    if (part1 > 12 && part2 <= 12) {
      formattedReturnDate = `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`;
    } else if (part1 <= 12 && part2 <= 12) {
      formattedReturnDate = `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`;
    }
  }
  
  const formData = {
    'NOMBRE': name,
    'FECHA DE INGRESO': document.getElementById('schedule-entry-date').value,
    'NUMERO DE EMPLEADO': document.getElementById('schedule-employee-id').value,
    'ÁREA': document.getElementById('schedule-area').value,
    'DÍAS VACACIONES': document.getElementById('schedule-vacation-days').value,
    'FECHA DE PAGO': getPayDateValue(),
    'FECHA SALIDA': formattedStartDate,
    'FECHA REGRESO': formattedReturnDate,
    'AUTORIZADAS': document.getElementById('schedule-authorized').checked ? 'TRUE' : 'FALSE',
    'DÍAS TOMADOS': daysTaken.toFixed(1),
    'GUARDAR DICIEMBRE': decemberSave.toFixed(1)
  };
  
  try {
    showNotification('Guardando vacaciones...', 'success');
    
    const result = fetchSheetData(
      sheetConnections.vacations, 
      'append', 
      [formData]
    );
    
    if (result.error) {
      showNotification('Error al guardar vacaciones: ' + result.error, 'error');
      return;
    }
    
    showNotification('Vacaciones guardadas exitosamente', 'success');
    closeVacationScheduleModal();
    
    loadVacationConcentradoData();
    
  } catch (error) {
    showNotification('Error al guardar vacaciones', 'error');
  }
}

function getPayDateValue() {
  const payDateSelect = document.getElementById('schedule-pay-date');
  const customPayDateInput = document.getElementById('schedule-custom-pay-date');
  
  if (payDateSelect.value === 'semanal') {
    return 'PAGO POR SEMANA';
  } else if (payDateSelect.value === 'fecha' && customPayDateInput.value) {
    const dateStr = customPayDateInput.value;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getDay() !== 5) {
    }
    
    const formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    
    return formattedDate;
  }
  
  return '';
}

async function loadSuspensionData() {
  try {
    const result = await fetchSheetData(sheetConnections.suspensionConcentrado);
    if (result && result.error) {
      suspensionData = [];
      return;
    }
    
    suspensionData = result && result.data ? result.data : [];
  } catch (error) {
    suspensionData = [];
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
      50% { background-color: rgba(236, 10, 10, 0.603); }
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
    .gafete-image {
      max-width: 50px;
      max-height: 50px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .action-button.small {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .action-button.small.delete {
      background: linear-gradient(135deg, var(--red-600), var(--red-500));
    }
    .action-button.small.delete:hover {
      background: linear-gradient(135deg, var(--red-700), var(--red-600));
    }
    .action-button.small.print {
      background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
    }
    .action-button.small.print:hover {
      background: linear-gradient(135deg, var(--blue-700), var(--blue-600));
    }
    .action-button.small.view {
      background: linear-gradient(135deg, var(--purple-600), var(--purple-500));
    }
    .action-button.small.view:hover {
      background: linear-gradient(135deg, var(--purple-700), var(--purple-600));
    }
    .no-permission {
      color: var(--slate-400);
      font-size: 0.75rem;
      font-style: italic;
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

  if (elements.exportDataBtn) {
    elements.exportDataBtn.addEventListener('click', exportDataTable);
  }

  if (elements.addEmployeeBtn) {
    elements.addEmployeeBtn.addEventListener('click', openAddEmployeeModal);
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
  
  document.getElementById('filter-nombre').addEventListener('input', filterDataTable);
  document.getElementById('filter-numero').addEventListener('input', filterDataTable);
  document.getElementById('filter-area').addEventListener('input', filterDataTable);
}

async function fetchSheetData(connection, action = 'read', data = null) {
  try {
    const url = new URL(connection.scriptUrl);
    url.searchParams.append('id', connection.spreadsheetId);
    url.searchParams.append('sheet', connection.sheetName);
    url.searchParams.append('action', action);
    
    if (data) {
      if (action === 'update' || action === 'delete') {
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

async function loadEmployeesData() {
  const result = await fetchSheetData(sheetConnections.employees);
  if (result.error) {
    showNotification('Error al cargar datos de empleados', 'error');
    return;
  }
  
  employeesData = result.data || [];
  
  if (currentUser && currentUser.name.toLowerCase() === 'marco cruger') {
    renderDataTable();
  }
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

function renderDataTable() {
  if (!elements.dataTableBody) return;
  
  elements.dataTableBody.innerHTML = '';
  
  if (employeesData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="8" class="no-data">No hay datos disponibles</td>';
    elements.dataTableBody.appendChild(row);
    return;
  }
  
  employeesData.forEach((item, index) => {
    const row = document.createElement('tr');
    
    const gafeteValue = item.GAFETE || '';
    const isImageUrl = gafeteValue.includes('http') || 
                      gafeteValue.includes('https') || 
                      gafeteValue.includes('.jpg') || 
                      gafeteValue.includes('.jpeg') || 
                      gafeteValue.includes('.png') || 
                      gafeteValue.includes('.gif') ||
                      gafeteValue.includes('drive.google.com') ||
                      gafeteValue.includes('docs.google.com');
    
    row.innerHTML = `
      <td>${item.NOMBRE || ''}</td>
      <td>
        ${isImageUrl ? `
          <img src="${gafeteValue}" alt="Gafete" class="gafete-image">
        ` : gafeteValue}
      </td>
      <td>${formatDate(item['FECHA DE INGRESO']) || ''}</td>
      <td>${item['NUMERO DE EMPLEADO'] || ''}</td>
      <td>${item.AREA || ''}</td>
      <td>${item.AÑOS || ''}</td>
      <td>${item['DIAS DE VACACIONES'] || '0'}</td>
      <td>
        ${currentUser && currentUser.name.toLowerCase() === 'marco cruger' ? `
          <div class="action-buttons">
            <button class="action-button small view" onclick="showEmployeeCard(${index})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver
            </button>
            <button class="action-button small" onclick="editEmployeeData(${index})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </button>
            <button class="action-button small delete" onclick="deleteEmployeeData(${index})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          </div>
        ` : '<span class="no-permission">Solo lectura</span>'}
      </td>
    `;
    
    elements.dataTableBody.appendChild(row);
  });
}

function showEmployeeCard(index) {
  const employee = employeesData[index];
  showEmployeeCardModal(employee);
}

function showEmployeeCardFromFilter(index) {
  const employee = employeesData[index];
  showEmployeeCardModal(employee);
}

function showEmployeeCardModal(employee) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'employee-card-modal';
    
    const isImageUrl = employee.GAFETE && (
      employee.GAFETE.includes('http') || 
      employee.GAFETE.includes('https') || 
      employee.GAFETE.includes('.jpg') || 
      employee.GAFETE.includes('.jpeg') || 
      employee.GAFETE.includes('.png') || 
      employee.GAFETE.includes('.gif') ||
      employee.GAFETE.includes('drive.google.com') ||
      employee.GAFETE.includes('docs.google.com')
    );
    
    modal.innerHTML = `
      <div class="modal-content employee-card-modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Gafete del Empleado</h3>
          <button class="close-button" onclick="closeEmployeeCardModal()">&times;</button>
        </div>
        <div class="employee-card-container">
          <div class="employee-card-left">
            <div class="gafete-large-container">
              ${isImageUrl ? `
                <img src="${employee.GAFETE}" alt="Gafete" class="gafete-large-image">
              ` : `
                <div class="no-image-message">
                  No hay imagen de gafete disponible
                </div>
              `}
            </div>
          </div>
          <div class="employee-card-right">
            <div class="employee-info-section">
              <h4 class="info-section-title">INFORMACIÓN DEL EMPLEADO</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">NOMBRE:</span>
                  <span class="info-value">${employee.NOMBRE || 'No disponible'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">NÚMERO DE EMPLEADO:</span>
                  <span class="info-value">${employee['NUMERO DE EMPLEADO'] || 'No disponible'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">FECHA DE INGRESO:</span>
                  <span class="info-value">${formatDate(employee['FECHA DE INGRESO']) || 'No disponible'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">AREA:</span>
                  <span class="info-value">${employee.AREA || 'No disponible'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">AÑOS DE SERVICIO:</span>
                  <span class="info-value">${employee.AÑOS || '0'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">DÍAS DE VACACIONES:</span>
                  <span class="info-value">${employee['DIAS DE VACACIONES'] || '0'}</span>
                </div>
              </div>
            </div>
            
            <div class="employee-actions">
              ${currentUser && currentUser.name.toLowerCase() === 'marco cruger' ? `
                <button class="action-button full-width" onclick="editEmployeeData(${employeesData.indexOf(employee)})">
                  <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar Información
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="button-group">
          <button type="button" class="modern-button" onclick="closeEmployeeCardModal()">Cerrar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const style = document.createElement('style');
    style.textContent = `
      .employee-card-modal-content {
        max-width: 1000px;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .employee-card-container {
        display: flex;
        gap: 2rem;
        margin-bottom: 1.5rem;
      }
      
      .employee-card-left {
        flex: 1;
        min-width: 400px;
      }
      
      .employee-card-right {
        flex: 1;
        min-width: 400px;
      }
      
      .gafete-large-container {
        background: rgba(30, 41, 59, 0.6);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 2px solid rgba(71, 85, 105, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 450px;
        width: 100%;
        height: 450px;
      }
      
      .gafete-large-image {
        max-width: 100%;
        max-height: 400px;
        width: auto;
        height: auto;
        border-radius: 0.5rem;
        object-fit: contain;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      }
      
      .no-image-message {
        color: var(--slate-400);
        font-size: 1.1rem;
        text-align: center;
        padding: 2rem;
        background: rgba(71, 85, 105, 0.2);
        border-radius: 0.5rem;
        border: 2px dashed rgba(71, 85, 105, 0.5);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .employee-info-section {
        background: rgba(30, 41, 59, 0.6);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid rgba(71, 85, 105, 0.3);
        margin-bottom: 1.5rem;
        width: 100%;
        height: calc(100% - 60px);
        display: flex;
        flex-direction: column;
      }
      
      .info-section-title {
        color: var(--emerald-400);
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid rgba(16, 185, 129, 0.3);
      }
      
      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
      }
      
      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .info-label {
        font-weight: 700;
        color: var(--slate-300);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .info-value {
        color: white;
        font-weight: 500;
        font-size: 1rem;
        padding: 0.5rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 0.5rem;
        border: 1px solid rgba(71, 85, 105, 0.3);
      }
      
      .employee-actions {
        margin-top: auto;
        width: 100%;
      }
      
      .action-button.full-width {
        width: 100%;
        padding: 0.75rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .gafete-image {
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      .gafete-image:hover {
        transform: scale(1.05);
      }
      
      .action-button.small.view {
        background: linear-gradient(135deg, var(--purple-600), var(--purple-500));
      }
      
      .action-button.small.view:hover {
        background: linear-gradient(135deg, var(--purple-700), var(--purple-600));
      }
      
      @media (max-width: 768px) {
        .employee-card-container {
          flex-direction: column;
        }
        
        .employee-card-left,
        .employee-card-right {
          min-width: 100%;
        }
        
        .employee-card-modal-content {
          max-width: 95%;
        }
        
        .gafete-large-container {
          min-height: 350px;
          height: 350px;
        }
        
        .gafete-large-image {
          max-height: 300px;
        }
      }
    `;
    document.head.appendChild(style);
    
    if (isImageUrl) {
      const img = modal.querySelector('.gafete-large-image');
      if (img) {
        img.onerror = function() {
          const container = this.parentNode;
          container.innerHTML = '<div class="no-image-message">No hay imagen de gafete disponible</div>';
        };
      }
    }
  }

function closeEmployeeCardModal() {
  const modal = document.getElementById('employee-card-modal');
  if (modal) {
    modal.remove();
  }
}

function filterDataTable() {
  const nameFilter = document.getElementById('filter-nombre').value.toLowerCase();
  const numeroFilter = document.getElementById('filter-numero').value.toLowerCase();
  const areaFilter = document.getElementById('filter-area').value.toLowerCase();
  
  if (!elements.dataTableBody) return;
  
  elements.dataTableBody.innerHTML = '';
  
  let filteredEmployees = employeesData;
  
  if (nameFilter) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(nameFilter)
    );
  }
  
  if (numeroFilter) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp['NUMERO DE EMPLEADO'] && emp['NUMERO DE EMPLEADO'].toString().toLowerCase().includes(numeroFilter)
    );
  }
  
  if (areaFilter) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.AREA && emp.AREA.toLowerCase().includes(areaFilter)
    );
  }
  
  if (filteredEmployees.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="8" class="no-data">No se encontraron empleados con esos filtros</td>';
    elements.dataTableBody.appendChild(row);
    return;
  }
  
  filteredEmployees.forEach((item, index) => {
    const row = document.createElement('tr');
    
    const gafeteValue = item.GAFETE || '';
    const isImageUrl = gafeteValue.includes('http') || 
                      gafeteValue.includes('https') || 
                      gafeteValue.includes('.jpg') || 
                      gafeteValue.includes('.jpeg') || 
                      gafeteValue.includes('.png') || 
                      gafeteValue.includes('.gif') ||
                      gafeteValue.includes('drive.google.com') ||
                      gafeteValue.includes('docs.google.com');
    
    row.innerHTML = `
      <td>${item.NOMBRE || ''}</td>
      <td>
        ${isImageUrl ? `
          <img src="${gafeteValue}" alt="Gafete" class="gafete-image">
        ` : gafeteValue}
      </td>
      <td>${formatDate(item['FECHA DE INGRESO']) || ''}</td>
      <td>${item['NUMERO DE EMPLEADO'] || ''}</td>
      <td>${item.AREA || ''}</td>
      <td>${item.AÑOS || ''}</td>
      <td>${item['DIAS DE VACACIONES'] || '0'}</td>
      <td>
        ${currentUser && currentUser.name.toLowerCase() === 'marco cruger' ? `
          <div class="action-buttons">
            <button class="action-button small view" onclick="showEmployeeCardFromFilter(${employeesData.indexOf(item)})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver
            </button>
            <button class="action-button small" onclick="editEmployeeData(${employeesData.indexOf(item)})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </button>
            <button class="action-button small delete" onclick="deleteEmployeeData(${employeesData.indexOf(item)})">
              <svg style="width: 0.75rem; height: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          </div>
        ` : '<span class="no-permission">Solo lectura</span>'}
      </td>
    `;
    
    elements.dataTableBody.appendChild(row);
  });
}

function editEmployeeData(index) {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showNotification('Solo Marco Cruger puede editar datos', 'error');
    return;
  }
  
  const employee = employeesData[index];
  openEditEmployeeModal(employee, index);
}

function deleteEmployeeData(index) {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showNotification('Solo Marco Cruger puede eliminar datos', 'error');
    return;
  }
  
  const employee = employeesData[index];
  
  if (confirm(`¿Estás seguro de eliminar a ${employee.NOMBRE} (${employee['NUMERO DE EMPLEADO']})?`)) {
    deleteEmployeeFromSheet(employee, index);
  }
}

async function deleteEmployeeFromSheet(employee, index) {
  try {
    showNotification('Eliminando empleado...', 'success');
    
    const deleteData = {
      action: 'delete',
      NOMBRE: employee.NOMBRE,
      'NUMERO DE EMPLEADO': employee['NUMERO DE EMPLEADO']
    };
    
    const result = await fetchSheetData(sheetConnections.employees, 'delete', deleteData);
    
    if (result.error) {
      showNotification('Error al eliminar: ' + result.error, 'error');
      return;
    }
    
    employeesData.splice(index, 1);
    renderDataTable();
    showNotification('Empleado eliminado exitosamente', 'success');
    
  } catch (error) {
    showNotification('Error al eliminar empleado', 'error');
  }
}

function openEditEmployeeModal(employee, index) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'edit-employee-modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Editar Empleado</h3>
        <button class="close-button" onclick="closeEditEmployeeModal()">&times;</button>
      </div>
      <form id="edit-employee-form">
        <div class="form-group">
          <label class="form-label">NOMBRE</label>
          <input type="text" class="form-input" id="edit-nombre" value="${employee.NOMBRE || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">GAFETE (URL de imagen)</label>
          <input type="text" class="form-input" id="edit-gafete" value="${employee.GAFETE || ''}" placeholder="https://ejemplo.com/imagen.jpg">
        </div>
        <div class="form-group">
          <label class="form-label">FECHA DE INGRESO</label>
          <input type="date" class="form-input" id="edit-fecha-ingreso" value="${formatDateForInput(employee['FECHA DE INGRESO']) || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">NUMERO DE EMPLEADO</label>
          <input type="text" class="form-input" id="edit-numero-empleado" value="${employee['NUMERO DE EMPLEADO'] || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">AREA</label>
          <input type="text" class="form-input" id="edit-area" value="${employee.AREA || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">AÑOS</label>
          <input type="number" class="form-input" id="edit-anos" value="${employee.AÑOS || ''}" step="0.1">
        </div>
        <div class="form-group">
          <label class="form-label">DIAS DE VACACIONES</label>
          <input type="number" class="form-input" id="edit-dias-vacaciones" value="${employee['DIAS DE VACACIONES'] || '0'}" step="0.5">
        </div>
        <div class="button-group">
          <button type="button" class="cancel-button" onclick="closeEditEmployeeModal()">Cancelar</button>
          <button type="submit" class="modern-button">Guardar Cambios</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const form = document.getElementById('edit-employee-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleEditEmployeeSubmit(originalEmployee, index);
  });
}

function closeEditEmployeeModal() {
  const modal = document.getElementById('edit-employee-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleEditEmployeeSubmit(originalEmployee, index) {
    if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
      showNotification('Solo Marco Cruger puede editar datos', 'error');
      return;
    }
    
    const fechaIngresoInput = document.getElementById('edit-fecha-ingreso').value;
    
    let fechaFormateada = '';
    if (fechaIngresoInput) {
      const [year, month, day] = fechaIngresoInput.split('-');
      fechaFormateada = `${month}/${day}/${year}`;
    }
    
    const updatedData = {
      NOMBRE: document.getElementById('edit-nombre').value,
      GAFETE: document.getElementById('edit-gafete').value,
      'FECHA DE INGRESO': fechaFormateada,
      'NUMERO DE EMPLEADO': document.getElementById('edit-numero-empleado').value,
      AREA: document.getElementById('edit-area').value,
      AÑOS: document.getElementById('edit-anos').value,
      'DIAS DE VACACIONES': document.getElementById('edit-dias-vacaciones').value
    };
    
    try {
      showNotification('Actualizando datos...', 'success');
      
      const updateData = {
        action: 'update',
        original: {
          NOMBRE: originalEmployee.NOMBRE,
          'NUMERO DE EMPLEADO': originalEmployee['NUMERO DE EMPLEADO']
        },
        updated: updatedData
      };
      
      const result = await fetchSheetData(sheetConnections.employees, 'update', updateData);
      
      if (result.error) {
        showNotification('Error al actualizar: ' + result.error, 'error');
        return;
      }
      
      employeesData[index] = updatedData;
      renderDataTable();
      closeEditEmployeeModal();
      showNotification('Datos actualizados exitosamente', 'success');
      
    } catch (error) {
      showNotification('Error al actualizar datos', 'error');
    }
}

function openAddEmployeeModal() {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showNotification('Solo Marco Cruger puede agregar empleados', 'error');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'add-employee-modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Agregar Nuevo Empleado</h3>
        <button class="close-button" onclick="closeAddEmployeeModal()">&times;</button>
      </div>
      <form id="add-employee-form">
        <div class="form-group">
          <label class="form-label">NOMBRE *</label>
          <input type="text" class="form-input" id="add-nombre" required>
        </div>
        <div class="form-group">
          <label class="form-label">GAFETE (URL de imagen)</label>
          <input type="text" class="form-input" id="add-gafete" placeholder="https://ejemplo.com/imagen.jpg">
        </div>
        <div class="form-group">
          <label class="form-label">FECHA DE INGRESO</label>
          <input type="date" class="form-input" id="add-fecha-ingreso">
        </div>
        <div class="form-group">
          <label class="form-label">NUMERO DE EMPLEADO *</label>
          <input type="text" class="form-input" id="add-numero-empleado" required>
        </div>
        <div class="form-group">
          <label class="form-label">AREA</label>
          <input type="text" class="form-input" id="add-area">
        </div>
        <div class="form-group">
          <label class="form-label">AÑOS</label>
          <input type="number" class="form-input" id="add-anos" step="0.1">
        </div>
        <div class="form-group">
          <label class="form-label">DIAS DE VACACIONES</label>
          <input type="number" class="form-input" id="add-dias-vacaciones" value="0" step="0.5">
        </div>
        <div class="button-group">
          <button type="button" class="cancel-button" onclick="closeAddEmployeeModal()">Cancelar</button>
          <button type="submit" class="modern-button">Agregar Empleado</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const form = document.getElementById('add-employee-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleAddEmployeeSubmit();
  });
}

function closeAddEmployeeModal() {
  const modal = document.getElementById('add-employee-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleAddEmployeeSubmit() {
    if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
      showNotification('Solo Marco Cruger puede agregar empleados', 'error');
      return;
    }
    
    const fechaIngresoInput = document.getElementById('add-fecha-ingreso').value;
    
    let fechaFormateada = '';
    if (fechaIngresoInput) {
      const [year, month, day] = fechaIngresoInput.split('-');
      fechaFormateada = `${month}/${day}/${year}`;
    }
    
    const newEmployee = {
      NOMBRE: document.getElementById('add-nombre').value,
      GAFETE: document.getElementById('add-gafete').value,
      'FECHA DE INGRESO': fechaFormateada,
      'NUMERO DE EMPLEADO': document.getElementById('add-numero-empleado').value,
      AREA: document.getElementById('add-area').value,
      AÑOS: document.getElementById('add-anos').value,
      'DIAS DE VACACIONES': document.getElementById('add-dias-vacaciones').value
    };
    
    try {
      showNotification('Agregando empleado...', 'success');
      
      const result = await fetchSheetData(sheetConnections.employees, 'append', [newEmployee]);
      
      if (result.error) {
        showNotification('Error al agregar: ' + result.error, 'error');
        return;
      }
      
      await loadEmployeesData();
      closeAddEmployeeModal();
      showNotification('Empleado agregado exitosamente', 'success');
      
    } catch (error) {
      showNotification('Error al agregar empleado', 'error');
    }
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
        emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(value)
      ).slice(0, 10);
      
      matches.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.NOMBRE;
        option.dataset.id = emp['NUMERO DE EMPLEADO'];
        option.dataset.area = emp.AREA;
        option.dataset.days = emp['DIAS DE VACACIONES'];
        option.dataset.entryDate = emp['FECHA DE INGRESO'];
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
      document.getElementById('vacation-position').value = selectedOption.dataset.area || '';
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
        emp.NOMBRE && emp.NOMBRE.toLowerCase().includes(value)
      ).slice(0, 10);
      
      matches.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.NOMBRE;
        option.dataset.id = emp['NUMERO DE EMPLEADO'];
        option.dataset.area = emp.AREA;
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
  const uniqueNames = [...new Set(employeesData.map(item => item.NOMBRE).filter(Boolean))];
  
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
    showNotification('Error al procesar la solicitud: ' + error.message, 'error');
  }
}

async function generatePermissionPDF(formData) {
  try {
    showNotification('Generando PDF...', 'success');
    
    const spreadsheetId = sheetConnections.permissions.spreadsheetId;
    
    const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&portrait=true&size=A4&fitw=true&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false&gid=0`;
    
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
  
  if (sectionName === 'vacaciones') {
    loadVacationConcentradoData();
  }
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
  } else if (sectionName === 'data') {
    elements.pageTitle.textContent = 'Base de Datos';
    elements.pageSubtitle.textContent = 'Gestiona la información de los empleados';
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
  const employee = employeesData.find(emp => emp.NOMBRE === candidate.employeeName);
  
  document.getElementById('suspension-employee-name').value = candidate.employeeName;
  document.getElementById('suspension-employee-id').value = employee ? employee['NUMERO DE EMPLEADO'] : '';
  document.getElementById('suspension-days-suggested').value = candidate.suggestedDays;
  document.getElementById('suspension-description').value = `falto injustificadamente el dia ${formatDate(candidate.firstAbsenceDate)}`;
  
  elements.suspensionModal.dataset.candidateIndex = candidateIndex;
  
  createDateInputs(candidate.suggestedDays);
  
  elements.suspensionModal.classList.add('active');
}

function createDateInputs(suggestedDays) {
  const dateContainer = document.getElementById('suspension-date-container');
  if (!dateContainer) return;
  
  dateContainer.innerHTML = '';
  
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
  const employee = employeesData.find(emp => emp.NOMBRE === candidate.employeeName);
  
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
    showNotification('Error al aplicar la suspensión: ' + error.message, 'error');
  }
}

async function updateSuspensionConcentradoCorrectly(candidate, suspensionDates) {
  try {
    const applicationDate = formatDateForSuspension(new Date());
    
    let updatedCount = 0;
    
    for (const absence of candidate.absencesData) {
      const absenceDateFormatted = formatDateForSuspension(absence.FECHA);
      
      const existingRecord = suspensionData.find(item => 
        formatDateForSuspension(item.FECHA) === absenceDateFormatted && 
        item.NOMBRE === candidate.employeeName
      );
      
      if (!existingRecord) {
        continue;
      }
      
      const updateData = {
        'FECHA': absenceDateFormatted,
        'NOMBRE': candidate.employeeName,
        'MOTIVO': existingRecord.MOTIVO || 'Falta injustificada',
        'STATUS': 'REALIZADA',
        'FECHA DE APLICACION': applicationDate
      };
      
      const updateResult = await fetchSheetData(
        sheetConnections.suspensionConcentrado,
        'update',
        updateData
      );
      
      if (updateResult.error) {
      } else if (updateResult.updated) {
        updatedCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (updatedCount === 0) {
      throw new Error('No se pudo actualizar ningún registro en el concentrado');
    }
    
    return { success: true, updatedCount };
    
  } catch (error) {
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
      'NumeroEmpleado': employee ? employee['NUMERO DE EMPLEADO'] : '',
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
  }
}

function playSuspensionSound() {
  if (suspensionSound) {
    suspensionSound.play().catch(e => {});
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

function exportDataTable() {
  if (!currentUser || currentUser.name.toLowerCase() !== 'marco cruger') {
    showNotification('Solo Marco Cruger puede exportar la base de datos', 'error');
    return;
  }

  if (employeesData.length === 0) {
    showNotification('No hay datos para exportar', 'error');
    return;
  }

  let csvContent = "NOMBRE,GAFETE,FECHA DE INGRESO,NUMERO DE EMPLEADO,AREA,AÑOS,DIAS DE VACACIONES\n";
  
  employeesData.forEach(item => {
    const row = [
      `"${item.NOMBRE || ''}"`,
      `"${item.GAFETE || ''}"`,
      `"${formatDate(item['FECHA DE INGRESO']) || ''}"`,
      `"${item['NUMERO DE EMPLEADO'] || ''}"`,
      `"${item.AREA || ''}"`,
      `"${item.AÑOS || ''}"`,
      `"${item['DIAS DE VACACIONES'] || '0'}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', `base_datos_empleados_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Datos exportados exitosamente', 'success');
}

function exportVacationToExcel() {
  if (filteredVacationData.length === 0) {
    showNotification('No hay datos de vacaciones para exportar', 'error');
    return;
  }

  let csvContent = "NOMBRE,FECHA DE INGRESO,NUMERO DE EMPLEADO,ÁREA,DÍAS VACACIONES,FECHA DE PAGO,FECHA SALIDA,FECHA REGRESO,AUTORIZADAS,DÍAS TOMADOS,GUARDAR DICIEMBRE\n";
  
  filteredVacationData.forEach(item => {
    const row = [
      `"${item.NOMBRE || ''}"`,
      `"${formatDate(item['FECHA DE INGRESO']) || ''}"`,
      `"${item['NUMERO DE EMPLEADO'] || ''}"`,
      `"${item['ÁREA'] || ''}"`,
      `"${item['DÍAS VACACIONES'] || '0'}"`,
      `"${item['FECHA DE PAGO'] || ''}"`,
      `"${formatDate(item['FECHA SALIDA']) || ''}"`,
      `"${formatDate(item['FECHA REGRESO']) || ''}"`,
      `"${item['AUTORIZADAS'] ? 'TRUE' : 'FALSE'}"`,
      `"${item['DÍAS TOMADOS'] || '0'}"`,
      `"${item['GUARDAR DICIEMBRE'] || '0'}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', `vacaciones_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Datos de vacaciones exportados exitosamente', 'success');
}

async function printVacationPDF(index) {
  try {
    const record = vacationData[index];
    
    const formatDateForPDF = (dateValue) => {
      if (!dateValue) return '';
      
      try {
        if (typeof dateValue === 'string') {
          if (dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const [part1, part2, year] = dateValue.split('/').map(Number);
            
            if (part1 > 12 && part2 <= 12) {
              return `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`;
            } else {
              return `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`;
            }
          }
          
          if (dateValue.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            const [year, month, day] = dateValue.split('-').map(Number);
            return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
          }
        }
        
        if (dateValue instanceof Date) {
          const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
          const day = dateValue.getDate().toString().padStart(2, '0');
          const year = dateValue.getFullYear();
          return `${month}/${day}/${year}`;
        }
        
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        }
      } catch (error) {
        console.error('Error formateando fecha para PDF:', error);
      }
      
      return dateValue;
    };
    
    const nombre = record.NOMBRE || '';
    const numeroEmpleado = record['NUMERO DE EMPLEADO'] || '';
    const fechaIngreso = formatDateForPDF(record['FECHA DE INGRESO']);
    const fechaPago = formatDateForPDF(record['FECHA DE PAGO']);
    const fechaSalida = formatDateForPDF(record['FECHA SALIDA']);
    const fechaRegreso = formatDateForPDF(record['FECHA REGRESO']);
    const diasTomados = record['DÍAS TOMADOS'] || '0';
    const diasVacaciones = record['DÍAS VACACIONES'] || '0';
    const area = record['ÁREA'] || '';
    
    if (!nombre) {
      showNotification('Error: No se pudo obtener el nombre del empleado', 'error');
      return;
    }
    
    showNotification(`Generando formato para ${nombre}...`, 'success');
    
    const pdfData = {
      nombre: nombre,
      numeroEmpleado: numeroEmpleado,
      fechaIngreso: fechaIngreso,
      fechaPago: fechaPago,
      fechaSalida: fechaSalida,
      fechaRegreso: fechaRegreso,
      diasTomados: diasTomados,
      diasVacaciones: diasVacaciones,
      area: area,
      comentarios: ''
    };
    
    const result = await generateVacationPDFDirect(pdfData);
    
    if (result.success) {
    } else {
      console.error('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Error en printVacationPDF:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

async function generateVacationPDFFromSchedule(formData) {
  try {
    const pdfData = {
      nombre: formData.NOMBRE || '',
      numeroEmpleado: formData['NUMERO DE EMPLEADO'] || '',
      fechaIngreso: formData['FECHA DE INGRESO'] || '',
      fechaPago: formData['FECHA DE PAGO'] || '',
      fechaSalida: formData['FECHA SALIDA'] || '',
      fechaRegreso: formData['FECHA REGRESO'] || '',
      diasTomados: formData['DÍAS TOMADOS'] || '0',
      diasVacaciones: formData['DÍAS VACACIONES'] || '0',
      comentarios: ''
    };
    
    return await generateVacationPDFDirect(pdfData);
    
  } catch (error) {
    console.error('Error generando PDF desde schedule:', error);
    return { success: false, error: error.message };
  }
}

function handleVacationScheduleSubmitWithPDF(e) {
  e.preventDefault();
  
  if (!validateVacationScheduleForm()) {
    return;
  }
  
  const name = document.getElementById('schedule-employee-name').value;
  const startDate = document.getElementById('schedule-start-date').value;
  const returnDate = document.getElementById('schedule-return-date').value;
  const daysToTake = parseFloat(document.getElementById('schedule-days-to-take').value) || 0;
  const decemberSave = parseFloat(document.getElementById('schedule-december-save').value) || 0;
  const daysTaken = daysToTake;
  
  const [year, month, day] = startDate.split('-').map(Number);
  const formattedStartDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  
  const formData = {
    'NOMBRE': name,
    'FECHA DE INGRESO': document.getElementById('schedule-entry-date').value,
    'NUMERO DE EMPLEADO': document.getElementById('schedule-employee-id').value,
    'ÁREA': document.getElementById('schedule-area').value,
    'DÍAS VACACIONES': document.getElementById('schedule-vacation-days').value,
    'FECHA DE PAGO': getPayDateValue(),
    'FECHA SALIDA': formattedStartDate,
    'FECHA REGRESO': returnDate,
    'AUTORIZADAS': document.getElementById('schedule-authorized').checked ? 'TRUE' : 'FALSE',
    'DÍAS TOMADOS': daysTaken.toFixed(1),
    'GUARDAR DICIEMBRE': decemberSave.toFixed(1)
  };
  
  try {
    showNotification('Guardando vacaciones...', 'success');
    
    const result = fetchSheetData(
      sheetConnections.vacations, 
      'append', 
      [formData]
    );
    
    if (result.error) {
      showNotification('Error al guardar vacaciones: ' + result.error, 'error');
      return;
    }
    
    showNotification('Vacaciones guardadas exitosamente', 'success');
    
    if (confirm('¿Desea generar el formato PDF de vacaciones ahora?')) {
      generateVacationPDFFromSchedule(formData);
    }
    
    closeVacationScheduleModal();
    loadVacationConcentradoData();
    
  } catch (error) {
    showNotification('Error al guardar vacaciones', 'error');
  }
}

async function generateVacationPDFDirect(vacationData) {
  try {
    showNotification('Generando PDF de vacaciones...', 'success');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    
    const today = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const diaSemana = diasSemana[today.getDay()];
    const dia = today.getDate();
    const mes = meses[today.getMonth()];
    const anio = today.getFullYear();
    const fechaHoy = `${diaSemana}, ${dia} de ${mes} de ${anio}`;
    
    const logoHeight = 25;
    const logoWidth = 50;
    const logoTopMargin = 20;
    
    const logoLeftPath = 'logos/ivemsa.png';
    const logoRightPath = 'logos/wunderbar.png';
    
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };
    
    try {
      const leftLogoImg = await loadImage(logoLeftPath);
      doc.addImage(
        leftLogoImg,
        'JPEG',
        margin,
        logoTopMargin,
        logoWidth,
        logoHeight
      );
    } catch (error) {
    }
    
    try {
      const rightLogoImg = await loadImage(logoRightPath);
      doc.addImage(
        rightLogoImg,
        'JPEG',
        pageWidth - margin - logoWidth,
        logoTopMargin,
        logoWidth,
        logoHeight
      );
    } catch (error) {
    }
    
    const headerYPos = logoTopMargin + logoHeight + 5;
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VACACIONES', pageWidth / 2, headerYPos, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ensenada, B.C., ${fechaHoy}`, pageWidth / 2, headerYPos + 10, { align: 'left' });
    
    let yPos = headerYPos + 25;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Para:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('RECURSOS HUMANOS', margin + 15, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('De:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Omar Arreola Meza', margin + 15, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.text('Por medio de la presente le solicitamos le sean procesadas las vacaciones a:', margin, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.nombre || '', margin + 22, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Numero de Empleado:', pageWidth / 2 + 10, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.numeroEmpleado || '', pageWidth / 2 + 55, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de ingreso:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.fechaIngreso || '', margin + 38, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Dias a gozar:', margin + 80, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.diasTomados || '0', margin + 110, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Dias a pagar:', margin + 130, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.diasTomados || '0', margin + 160, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de pago de vacaciones:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.fechaPago || '', margin + 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Inicio de Vacaciones:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.fechaSalida || '', margin + 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de que debera presentarse a trabajar:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(vacationData.fechaRegreso || '', margin + 95, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Comentarios:', margin, yPos);
    
    yPos += 5;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 5;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    if (vacationData.comentarios) {
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const comentariosLines = doc.splitTextToSize(vacationData.comentarios, pageWidth - (margin * 2));
      doc.text(comentariosLines, margin, yPos);
      yPos += (comentariosLines.length * 5);
    }
    
    yPos += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Atentamente', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;
    doc.setLineWidth(0.3);
    doc.line(margin + 20, yPos, pageWidth / 2 - 10, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text('Nombre y firma Autorizada', pageWidth / 4 + 10, yPos, { align: 'center' });
    
    yPos -= 5;
    doc.line(pageWidth / 2 + 10, yPos, pageWidth - margin - 20, yPos);
    yPos += 5;
    doc.text('Firma del Trabajador', pageWidth * 3/4 - 10, yPos, { align: 'center' });
    
    yPos = pageHeight - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('C.C.P. Expediente', margin, yPos);
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const timestamp = new Date().getTime();
    const safeName = vacationData.nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '_').replace(/\s+/g, '_');
    const fileName = `Formato_Vacaciones_${safeName}_${timestamp}.pdf`;
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);
    }, 100);
    
    showNotification('PDF generado exitosamente', 'success');
    return { success: true, fileName: fileName };
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    showNotification('Error al generar PDF: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

window.openSuspensionModal = openSuspensionModal;
window.closeSuspensionModal = closeSuspensionModal;
window.closeSuspensionDateModal = closeSuspensionDateModal;
window.confirmSuspensionDate = confirmSuspensionDate;
window.editEmployeeData = editEmployeeData;
window.deleteEmployeeData = deleteEmployeeData;
window.closeEditEmployeeModal = closeEditEmployeeModal;
window.openAddEmployeeModal = openAddEmployeeModal;
window.closeAddEmployeeModal = closeAddEmployeeModal;
window.closeEmployeeCardModal = closeEmployeeCardModal;
window.showEmployeeCard = showEmployeeCard;
window.showEmployeeCardFromFilter = showEmployeeCardFromFilter;
window.filterDataTable = filterDataTable;
window.deleteVacationRecord = deleteVacationRecord;
window.closeVacationScheduleModal = closeVacationScheduleModal;
window.toggleVacationAuthorization = toggleVacationAuthorization;
window.handlePayDateChange = handlePayDateChange;
window.calculateVacationDates = calculateVacationDates;
window.printVacationPDF = printVacationPDF;
window.generateVacationPDFDirect = generateVacationPDFDirect;
window.printVacationPDF = printVacationPDF;
window.generateVacationPDFFromSchedule = generateVacationPDFFromSchedule;
window.handleVacationScheduleSubmitWithPDF = handleVacationScheduleSubmitWithPDF;

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});




