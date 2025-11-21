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
  }
};

let attendanceData = [];
let vacationData = [];
let employeesData = [];
let permissionsData = [];
let currentUser = null;
let currentFilters = {
    date: '',
    name: '',
    subject: '',
    points: ''
};
let filteredAttendanceData = [];

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
  attendanceTableBody: null,
  missingEmployeesBody: null,
  vacationTableBody: null,
  permissionsTableBody: null,
  userNameDisplay: null
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
  elements.attendanceTableBody = document.getElementById('attendance-table-body');
  elements.missingEmployeesBody = document.getElementById('missing-employees-body');
  elements.vacationTableBody = document.getElementById('vacation-table-body');
  elements.permissionsTableBody = document.getElementById('permissions-table-body');
  elements.userNameDisplay = document.getElementById('userNameDisplay');
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
    
    await loadEmployeesData();
    initializeEventListeners();
    await loadAttendanceData();
    await loadVacationData();
    
    setupVacationAutocomplete();
    setupPermissionAutocomplete();
    setupFilterAutocomplete();
    
    applyBlinkingStyles();
    addExportButton();
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    showNotification('Error al cargar la aplicación', 'error');
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
  `;
  document.head.appendChild(style);
}

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

  elements.generatePermissionBtn.addEventListener('click', openPermissionModal);
  elements.closePermissionModalBtn.addEventListener('click', closePermissionModal);
  elements.cancelPermissionBtn.addEventListener('click', closePermissionModal);
  elements.permissionForm.addEventListener('submit', handlePermissionSubmit);

  document.getElementById('permission-hours').addEventListener('change', handlePermissionTypeChange);
  document.getElementById('permission-day').addEventListener('change', handlePermissionTypeChange);
  document.getElementById('permission-day-with-pay').addEventListener('change', handlePermissionTypeChange);

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  initializeTableFilters();
}

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
  } else if (sectionName === 'vacaciones') {
    elements.pageTitle.textContent = 'Gestión de Vacaciones';
    elements.pageSubtitle.textContent = 'Administra las vacaciones programadas del personal';
  } else if (sectionName === 'permisos') {
    elements.pageTitle.textContent = 'Solicitud de Permisos';
    elements.pageSubtitle.textContent = 'Gestiona los permisos del personal';
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);



