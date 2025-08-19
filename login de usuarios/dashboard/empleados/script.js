// Configuración de conexiones a Google Sheets
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
  }
};

// Variables globales
let attendanceData = [];
let vacationData = [];
let employeesData = [];
let currentUser = null;

// Elementos del DOM
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
  attendanceTableBody: null,
  missingEmployeesBody: null,
  vacationTableBody: null,
  userNameDisplay: null
};

// Función para inicializar elementos del DOM
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
  elements.attendanceTableBody = document.getElementById('attendance-table-body');
  elements.missingEmployeesBody = document.getElementById('missing-employees-body');
  elements.vacationTableBody = document.getElementById('vacation-table-body');
  elements.userNameDisplay = document.getElementById('userNameDisplay');
}

// Función mejorada para formatear fechas
function formatDate(dateString) {
  if (!dateString) return '';
  
  if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return dateString;
  }
  
  try {
    if (typeof dateString === 'string' && dateString.startsWith('Date(')) {
      const dateParts = dateString.match(/\d+/g);
      if (dateParts && dateParts.length >= 3) {
        return `${dateParts[2].padStart(2, '0')}/${(parseInt(dateParts[1])).toString().padStart(2, '0')}/${dateParts[0]}`;
      }
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error('Error formateando fecha:', dateString, e);
    return dateString;
  }
}

// Función para calcular días entre fechas
function daysBetweenDates(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  firstDate.setHours(0, 0, 0, 0);
  secondDate.setHours(0, 0, 0, 0);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Inicialización de la aplicación
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
    } else {
      console.warn('Elemento userNameDisplay no encontrado');
    }
    
    await loadEmployeesData();
    initializeEventListeners();
    await loadAttendanceData();
    await loadVacationData();
    
    setupVacationAutocomplete();
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    showNotification('Error al cargar la aplicación', 'error');
  }
}

// Inicialización de eventos
function initializeEventListeners() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionName = item.dataset.section;
      switchActiveSection(item, sectionName);
    });
  });

  elements.generateReportBtn.addEventListener('click', openAttendanceModal);
  elements.closeAttendanceModalBtn.addEventListener('click', closeAttendanceModal);
  elements.cancelAttendanceBtn.addEventListener('click', closeAttendanceModal);
  elements.attendanceForm.addEventListener('submit', handleAttendanceSubmit);

  elements.addVacationBtn.addEventListener('click', handleAddVacationClick);
  elements.closeVacationModalBtn.addEventListener('click', closeVacationModal);
  elements.cancelVacationBtn.addEventListener('click', closeVacationModal);
  elements.vacationForm.addEventListener('submit', handleVacationSubmit);

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  initializeTableFilters();
}

// Función para obtener datos de Google Sheets
async function fetchSheetData(connection, action = 'read', data = null) {
  try {
    const url = new URL(connection.scriptUrl);
    url.searchParams.append('id', connection.spreadsheetId);
    url.searchParams.append('sheet', connection.sheetName);
    url.searchParams.append('action', action);
    
    if (data) {
      const formattedData = data.map(item => {
        const formattedItem = {...item};
        if ('AUTORIZADAS' in formattedItem) {
          formattedItem.AUTORIZADAS = formattedItem.AUTORIZADAS ? 'TRUE' : 'FALSE';
        }
        return formattedItem;
      });
      url.searchParams.append('data', JSON.stringify(formattedData));
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

// Funciones para cargar datos
async function loadAttendanceData() {
  const result = await fetchSheetData(sheetConnections.productivity);
  if (result.error) return;
  
  attendanceData = result.data || [];
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

// Funciones para renderizar tablas
function renderAttendanceTable() {
  if (!elements.attendanceTableBody) return;
  
  elements.attendanceTableBody.innerHTML = '';
  
  if (attendanceData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="no-data">No hay datos de asistencia disponibles</td>';
    elements.attendanceTableBody.appendChild(row);
    return;
  }
  
  attendanceData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(item.FECHA) || ''}</td>
      <td>${item.NOMBRE || ''}</td>
      <td><span class="status-badge status-${(item.MOTIVO || '').toLowerCase().replace(/\s+/g, '-')}">
        ${item.MOTIVO || ''}
      </span></td>
      <td>${item.PUNTOS || '0'}</td>
    `;
    elements.attendanceTableBody.appendChild(row);
  });
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

// Configurar autocompletado para formulario de vacaciones
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

// Función para verificar empleados sin registro con nueva lógica de 5hrs
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

// Funciones para modales
function openAttendanceModal() {
  if (!elements.attendanceModal) return;
  elements.attendanceModal.classList.add('active');
  document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
  
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
  `;
}

// Función para configurar autocompletado
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

// Función para mostrar mensaje de acceso denegado
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

// Funciones para formularios
async function handleAttendanceSubmit(e) {
  if (!e) return;
  e.preventDefault();
  
  if (!validateAttendanceForm()) {
    return;
  }
  
  const formData = {
    FECHA: document.getElementById('attendance-date').value,
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
  
  // Estructura de datos corregida para enviar a Google Sheets
  const formData = {
    'Name': document.getElementById('vacation-employee-name').value,
    'Entry Date': selectedEmployee?.dataset.entryDate || '',
    'ID #': document.getElementById('vacation-employee-id').value,
    'Days Vacations': days, // Se envía a columna G
    'Fecha de salida': startDate, // Se envía a columna L
    'Fecha de Regreso': calculateReturnDate(startDate, days), // Se envía a columna M
    'Autorizadas': false // Se envía a columna N
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

// Funciones de utilidad
function getPoints(type) {
  const pointsMap = {
    'Asistencia': '+1',
    'Permiso - Por Hora': '0',
    'Permiso - Por Día': '0',
    'Falta injustificada': '-2',
    'Vacaciones': '0',
    'Suspensión': '-2',
    'Falta justificada': '-1',
    'NO SE ESCANEA O NO CUENTA CON GAFETE': '-1',
    '5hrs': '+0.5',
    'Incapacidad': '0'
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
  notification.innerHTML = `
    <span>${message}</span>
    <button class="close-notification">&times;</button>
  `;
  
  document.body.appendChild(notification);
  
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
  }
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Sistema de filtrado
function initializeTableFilters() {
  const filterInputs = document.querySelectorAll('.filter-input');
  
  filterInputs.forEach(input => {
    if (!input) return;
    
    input.addEventListener('input', function() {
      const column = parseInt(this.dataset.column);
      const tableName = this.dataset.table;
      const filterValue = this.value.toLowerCase();
      
      let tableId;
      switch(tableName) {
        case 'attendance': tableId = 'attendance-table'; break;
        case 'vacation': tableId = 'vacation-table'; break;
        case 'missing-employees': tableId = 'missing-employees-table'; break;
        default: return;
      }
      
      filterTable(tableId, column, filterValue);
    });
  });
}

function filterTable(tableId, columnIndex, filterValue) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const cell = row.cells[columnIndex];
    if (cell) {
      let cellText = cell.textContent.toLowerCase();
      
      if (cellText.includes('/') && cellText.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        const [day, month, year] = cellText.split('/');
        cellText = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      row.style.display = cellText.includes(filterValue.toLowerCase()) ? '' : 'none';
    }
  });
}

// Función para cambiar sección activa
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

// Función para actualizar títulos de página
function updatePageTitles(sectionName) {
  if (!elements.pageTitle || !elements.pageSubtitle) return;
  
  if (sectionName === 'asistencias') {
    elements.pageTitle.textContent = 'Control de Asistencias';
    elements.pageSubtitle.textContent = 'Gestiona las asistencias y faltas del personal';
  } else if (sectionName === 'vacaciones') {
    elements.pageTitle.textContent = 'Gestión de Vacaciones';
    elements.pageSubtitle.textContent = 'Administra las vacaciones programadas del personal';
  }
}

// Iniciar la aplicación cuando el DOM esté cargado

document.addEventListener('DOMContentLoaded', initializeApp);

