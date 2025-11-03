const URL_SHEETS = 'https://script.google.com/macros/s/AKfycbypdCeaQsblh3BUIyiTwrK83m6E7cM_q1ZUbFXyJva2RB1eSa1vm2yes-OwGDUOM0-o2A/exec';

const sheetConnections = {
  requerimientos: {
    scriptUrl: URL_SHEETS,
    spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
    sheetName: 'REQUERIMIENTOS'
  },
  andon: {
    scriptUrl: URL_SHEETS,
    spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
    sheetName: 'ANDON DIGITAL'
  }
};

let autoRefreshInterval;
let allMachines = [];
let notificationPermission = false;
let currentUser = '';
let audioContext = null;
let notificationSound = null;
let pendingNotifications = new Set();
let isProcessing = false;
let currentActiveJob = null;
let lastNotifiedMachines = new Set();
let userActiveJobsCache = null;
let lastJobCheckTime = 0;

function initAudio() {
  if (audioContext) return;
  
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('AudioContext inicializado');
  } catch (e) {
    console.log('Audio no soportado:', e);
  }
}

async function loadNotificationSound() {
  if (!audioContext) return;
  
  try {
    const response = await fetch('https://assets.mixkit.co/active_storage/sfx/286/286-preview.mp3');
    const arrayBuffer = await response.arrayBuffer();
    notificationSound = await audioContext.decodeAudioData(arrayBuffer);
    console.log('Sonido de notificación cargado');
  } catch (e) {
    console.log('Error cargando sonido:', e);
  }
}

function playNotificationSound() {
  if (!audioContext || !notificationSound) {
    console.log('Audio no disponible');
    return;
  }
  
  try {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = notificationSound;
    source.connect(audioContext.destination);
    source.start(0);
    console.log('Sonido reproducido');
  } catch (e) {
    console.log('Error reproduciendo sonido:', e);
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      notificationPermission = permission === 'granted';
      console.log('Permisos de notificación:', permission);
    });
  }
}

function getCurrentUser() {
  if (window.currentUser && window.currentUser.name) {
    return window.currentUser.name;
  }
  
  return localStorage.getItem('currentUserName') || 'Usuario No Identificado';
}

function setCurrentUser(user) {
  if (user && user.name) {
    localStorage.setItem('currentUserName', user.name);
  } else if (typeof user === 'string') {
    localStorage.setItem('currentUserName', user);
  }
  
  console.log('Usuario detectado:', user);
}

function isAuthorizedTech() {
  const user = getCurrentUser();
  return ['Marco Cruger', 'Josue Chavez'].includes(user);
}

function isSaturday() {
  return new Date().getDay() === 6;
}

function canCloseReassigned() {
  return isSaturday() || isAuthorizedTech();
}

function formatDate(date) {
  const pad = num => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function fetchSheetData(connection, action = 'read', data = null) {
  try {
    let url = `${connection.scriptUrl}?action=${action}&sheetName=${encodeURIComponent(connection.sheetName)}&spreadsheetId=${connection.spreadsheetId}`;
    
    if (data) {
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          url += `&${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
        }
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });
    
    if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    throw error;
  }
}

async function checkUserActiveJobs(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && userActiveJobsCache && (now - lastJobCheckTime) < 5000) {
    return userActiveJobsCache;
  }
  
  try {
    const result = await fetchSheetData(
      sheetConnections.requerimientos, 
      'checkActiveJobs', 
      {
        user: getCurrentUser(),
        action: 'checkActiveJobs',
        sheetName: 'REQUERIMIENTOS',
        spreadsheetId: sheetConnections.requerimientos.spreadsheetId
      }
    );
    
    if (result.success && result.hasActiveJobs && result.activeJobs && result.activeJobs.length > 0) {
      currentActiveJob = result.activeJobs[0];
      userActiveJobsCache = result;
      lastJobCheckTime = now;
      return result;
    } else {
      currentActiveJob = null;
      userActiveJobsCache = { hasActiveJobs: false, activeJobs: [] };
      lastJobCheckTime = now;
      return { hasActiveJobs: false, activeJobs: [] };
    }
  } catch (error) {
    console.error('Error verificando trabajos activos:', error);
    currentActiveJob = null;
    userActiveJobsCache = { hasActiveJobs: false, activeJobs: [] };
    return { hasActiveJobs: false, activeJobs: [] };
  }
}

async function canAcceptNewJob() {
  const activeJobs = await checkUserActiveJobs(true);
  return !activeJobs.hasActiveJobs;
}

function checkAndShowMTNotifications(machinesData) {
  if (!isAuthorizedTech()) return;
  
  const currentMTMachines = new Set();
  let mtMachinesFound = false;
  
  machinesData.forEach(machine => {
    if (machine.status === 'MT' && !machine.reassigned && !machine.acceptedBy) {
      const machineKey = `${machine.id}-${machine.name}`;
      currentMTMachines.add(machineKey);
      mtMachinesFound = true;
      
      showPushNotification(
        machine.name,
        'Alta',
        machine.description || 'Sin descripción',
        'Sistema',
        `${machine.id}-${Date.now()}`
      );
    }
  });
  
  lastNotifiedMachines = currentMTMachines;
  
  if (mtMachinesFound && audioContext && notificationSound) {
    playNotificationSound();
  }
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const currentTimeElement = document.getElementById('current-time');
  if (currentTimeElement) {
    currentTimeElement.textContent = timeString;
  }
}

function extractImageUrl(cellValue) {
  if (typeof cellValue === 'string' && cellValue.startsWith('=IMAGE("')) {
    return cellValue.match(/=IMAGE\("(.*?)"\)/)?.[1] || '';
  }
  return cellValue;
}

function showReassignedRestriction() {
  const modal = document.getElementById('restriction-modal');
  if (modal) {
    const title = modal.querySelector('.modal-title');
    const body = modal.querySelector('.modal-body p');
    if (title && body) {
      title.textContent = 'Restricción de Servicio';
      body.textContent = 'ESTE SERVICIO FUE ASIGNADO PARA EL DIA SABADO - SOLO ESE DIA PUEDE DARSE DE BAJA';
      modal.style.display = 'flex';
    }
  }
}

function showActiveJobRestriction(activeJob) {
  const modal = document.getElementById('active-job-modal');
  const message = document.getElementById('active-job-message');
  if (modal && message) {
    message.textContent = `❌ NO PUEDES ACEPTAR ESTE TRABAJO\n\nYa estás atendiendo: "${activeJob.machine}"\n\nDebes cerrar el trabajo actual antes de aceptar uno nuevo.`;
    modal.style.display = 'flex';
  }
}

function showPushNotification(machine, priority, description, user, requestId) {
  if (pendingNotifications.has(requestId)) return;
  
  pendingNotifications.add(requestId);
  
  const notification = document.createElement('div');
  notification.className = 'push-notification';
  notification.id = `notification-${requestId}`;
  notification.innerHTML = `
    <div class="notification-header">
      <h4>🚨 NUEVA SOLICITUD DE MANTENIMIENTO</h4>
      <button class="close-notification" onclick="closeNotification('${requestId}')">&times;</button>
    </div>
    <div class="notification-body">
      <p><strong>Máquina:</strong> ${machine}</p>
      <p><strong>Prioridad:</strong> <span style="color: #ef4444; font-weight: bold;">${priority}</span></p>
      <p><strong>Solicitante:</strong> ${user}</p>
      <p><strong>Problema:</strong> ${description}</p>
      <p><em>🕒 Detectado: ${new Date().toLocaleTimeString()}</em></p>
    </div>
    <div class="notification-footer">
      <button class="btn-accept-notification" onclick="acceptFromNotification('${requestId}', '${machine}', '${description.replace(/'/g, "\\'")}')">
        ✅ Aceptar Trabajo
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  if (audioContext && notificationSound) {
    playNotificationSound();
  }
  
  if (notificationPermission && 'Notification' in window) {
    new Notification('🚨 NUEVA SOLICITUD MT', {
      body: `Máquina: ${machine}\nPrioridad: ${priority}\nProblema: ${description}`,
      icon: '/icon.png',
      tag: 'maintenance-request',
      requireInteraction: true
    });
  }
  
  setTimeout(() => {
    closeNotification(requestId);
  }, 30000);
}

function closeNotification(requestId) {
  const notification = document.getElementById(`notification-${requestId}`);
  if (notification) {
    notification.remove();
    pendingNotifications.delete(requestId);
  }
}

async function acceptFromNotification(requestId, machine, description) {
  if (isProcessing) return;
  
  const canAccept = await canAcceptNewJob();
  if (!canAccept) {
    showActiveJobRestriction(currentActiveJob);
    closeNotification(requestId);
    return;
  }
  
  isProcessing = true;
  
  try {
    await acceptRequest(requestId);
    closeNotification(requestId);
  } finally {
    isProcessing = false;
  }
}

async function openAcceptModal(id, name, description) {
  if (isProcessing) return;
  
  const canAccept = await canAcceptNewJob();
  if (!canAccept) {
    showActiveJobRestriction(currentActiveJob);
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Aceptar Solicitud</h3>
        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <p><strong>Máquina:</strong> ${name}</p>
        <p><strong>Problema:</strong> ${description}</p>
        <p>¿Deseas aceptar esta solicitud de mantenimiento?</p>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" onclick="this.closest('.modal').remove()">Cancelar</button>
        <button type="button" class="btn-submit" onclick="acceptRequest('${id}')">Aceptar Solicitud</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function acceptRequest(id) {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    const canAccept = await canAcceptNewJob();
    if (!canAccept) {
      showActiveJobRestriction(currentActiveJob);
      document.querySelectorAll('.modal').forEach(modal => modal.remove());
      return;
    }
    
    const result = await fetchSheetData(
      sheetConnections.requerimientos, 
      'accept', 
      {
        id: id,
        user: getCurrentUser(),
        action: 'accept',
        sheetName: 'REQUERIMIENTOS',
        spreadsheetId: sheetConnections.requerimientos.spreadsheetId
      }
    );
    
    if (result.success) {
      showMessage('success', "Solicitud aceptada correctamente");
      document.querySelectorAll('.modal').forEach(modal => modal.remove());
      
      userActiveJobsCache = null;
      currentActiveJob = null;
      lastJobCheckTime = 0;
      
      await loadData();
    } else {
      showMessage('error', "Error al aceptar: " + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    showMessage('error', "Error de conexión: " + error.message);
  } finally {
    isProcessing = false;
  }
}

async function reassignRequest(id) {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    const result = await fetchSheetData(
      sheetConnections.requerimientos, 
      'reassign', 
      {
        id: id,
        action: 'reassign',
        sheetName: 'REQUERIMIENTOS',
        spreadsheetId: sheetConnections.requerimientos.spreadsheetId
      }
    );
    
    if (result.success) {
      showMessage('success', "Solicitud reasignada para el sábado");
      await loadData();
    } else {
      showMessage('error', "Error al reasignar: " + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    showMessage('error', "Error de conexión: " + error.message);
  } finally {
    isProcessing = false;
  }
}

async function openTechModalWithAuth(id, rowIndex, name, status, description, isReassigned = false, acceptedBy = '') {
  if (isProcessing) return;
  
  if (!isAuthorizedTech()) {
    document.getElementById('restriction-modal').style.display = 'flex';
    return;
  }
  
  if (isReassigned && !canCloseReassigned()) {
    showReassignedRestriction();
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  const reassignButton = status === 'FALSE' && !isReassigned ? `
    <button type="button" class="btn-reassign" onclick="reassignRequest('${id}')">
      📅 Reasignar para Sábado
    </button>
  ` : '';
  
  const acceptButton = status === 'FALSE' && !acceptedBy ? `
    <button type="button" class="btn-accept" onclick="acceptRequest('${id}')">
      ✅ Aceptar Solicitud
    </button>
  ` : '';
  
  const acceptedInfo = acceptedBy ? `
    <div class="accepted-info">
      <p><strong>✅ Aceptado por:</strong> ${acceptedBy}</p>
    </div>
  ` : '';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Acciones Técnicas - ${name}</h3>
        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <form id="tech-modal-form-${id}">
        <input type="hidden" id="machine-id-${id}" value="${id}">
        <input type="hidden" id="machine-row-${id}" value="${rowIndex}">
        
        ${acceptedInfo}
        
        <div class="form-group">
          <label>Descripción del Problema</label>
          <textarea class="form-control" id="tech-problem-description-${id}" disabled rows="3">${description || 'Sin descripción'}</textarea>
        </div>
        
        <div class="form-group">
          <label>Acción Realizada</label>
          <input type="text" class="form-control" id="action-taken-${id}" required>
        </div>
        
        <div class="form-group">
          <label>Técnico</label>
          <input type="text" class="form-control" id="technician-${id}" value="${getCurrentUser()}" required>
        </div>
        
        <div class="form-group">
          <label>Estatus</label>
          <select class="form-control" id="status-${id}" required>
            <option value="FALSE">MT (Mantenimiento)</option>
            <option value="TRUE">Activa</option>
          </select>
        </div>
        
        <div class="action-buttons">
          ${reassignButton}
          ${acceptButton}
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="this.closest('.modal').remove()">Cancelar</button>
          <button type="submit" class="btn-submit">Guardar Cambios</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  checkUserActiveJobs(true).then(activeJobs => {
    if (activeJobs.hasActiveJobs && activeJobs.activeJobs[0].id !== id) {
      const warningDiv = document.createElement('div');
      warningDiv.className = 'warning-message';
      warningDiv.innerHTML = `⚠️ <strong>TRABAJO ACTIVO</strong><br>Ya estás atendiendo: "${activeJobs.activeJobs[0].machine}"`;
      
      const form = document.getElementById(`tech-modal-form-${id}`);
      if (form) {
        form.insertBefore(warningDiv, form.firstChild);
        
        const acceptBtn = form.querySelector('.btn-accept');
        if (acceptBtn) {
          acceptBtn.style.display = 'none';
        }
      }
    }
  });
  
  document.getElementById(`tech-modal-form-${id}`).addEventListener('submit', async function(e) {
    e.preventDefault();
    await submitTechForm(id);
  });
}

async function submitTechForm(id) {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    const formData = {
      id: document.getElementById(`machine-id-${id}`).value,
      row: document.getElementById(`machine-row-${id}`).value,
      actionTaken: document.getElementById(`action-taken-${id}`).value,
      technician: document.getElementById(`technician-${id}`).value,
      status: document.getElementById(`status-${id}`).value,
      description: document.getElementById(`tech-problem-description-${id}`).value,
      responseTime: formatDate(new Date()),
      action: 'update',
      sheetName: 'REQUERIMIENTOS',
      spreadsheetId: sheetConnections.requerimientos.spreadsheetId
    };

    const result = await fetchSheetData(
      sheetConnections.requerimientos, 
      'update', 
      formData
    );
    
    if (result.success) {
      showMessage('success', "Datos técnicos actualizados correctamente");
      document.querySelectorAll('.modal').forEach(modal => modal.remove());
      
      userActiveJobsCache = null;
      currentActiveJob = null;
      lastJobCheckTime = 0;
      
      await loadData();
    } else {
      showMessage('error', "Error al actualizar: " + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    showMessage('error', "Error de conexión: " + error.message);
  } finally {
    isProcessing = false;
  }
}

function createMachineCard(imgUrl, status, description, name, id, rowIndex, responseTime, reassigned = false, acceptedBy = '', notified = false) {
  let statusClass, statusText, borderStyle;
  
  if (reassigned) {
    statusClass = 'status-reassigned';
    statusText = 'REASIGNADA';
    borderStyle = '--status-color:rgb(255, 251, 0); --neon-glow: 0 0 10px rgb(251, 255, 0), 0 0 10px rgb(255, 251, 0), 0 0 20px rgb(255, 251, 0);';
  } else {
    statusClass = status === 'MT' ? 'status-mt' : 'status-active';
    statusText = status === 'MT' ? 'MT' : 'ACTIVA';
    borderStyle = status === 'MT' ? 
      '--status-color: #ef4444; --neon-glow: 0 0 10px #ef4444, 0 0 20px #ef4444;' : 
      '--status-color: #10b981; --neon-glow: 0 0 10px #10b981, 0 0 20px #10b981;';
  }
  
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMzAwIDE1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  
  const acceptedByTooltip = acceptedBy ? `
    <div class="accepted-by-tooltip">
      <span class="tooltip-icon">✅</span>
      <div class="tooltip-text">Atendiendo: ${acceptedBy}</div>
    </div>
  ` : '';

  const acceptButton = status === 'MT' && !acceptedBy && isAuthorizedTech() && !reassigned ? `
    <button class="btn-accept-card" onclick="event.stopPropagation(); openAcceptModal('${id}', '${name.replace(/'/g, "\\'")}', '${(description || '').replace(/'/g, "\\'")}')">
      <span>✅</span> Aceptar
    </button>
  ` : '';

  const notificationIndicator = status === 'MT' && !acceptedBy && !notified && isAuthorizedTech() && !reassigned ? `
    <div class="notification-indicator" title="Nueva solicitud sin asignar">
      🔔
    </div>
  ` : '';

  return `
    <div class="machine-card" data-id="${id}" data-row="${rowIndex}" style="${borderStyle}" data-reassigned="${reassigned}">
      ${notificationIndicator}
      <div class="machine-image">
        ${imgUrl && imgUrl.startsWith('http') ? 
          `<img src="${imgUrl}" alt="${name}" onerror="this.src='${placeholderImage}'">` : 
          `<img src="${placeholderImage}" alt="Sin imagen">`
        }
      </div>
      <div class="machine-name">${name}</div>
      <div class="status-badge ${statusClass}">${statusText}</div>
      ${acceptedByTooltip}
      <div class="machine-details">
        ${status === 'MT' || reassigned ? `<div class="detail-item"><span>📝</span><span>${description || 'Sin descripción'}</span></div>` : ''}
        <div class="detail-item"><span>🏷️</span><span>ID: ${id || 'N/A'}</span></div>
        ${responseTime ? `<div class="detail-item"><span>⏱️</span><span>Tiempo respuesta: ${responseTime}</span></div>` : ''}
        ${acceptedBy ? `<div class="detail-item"><span>👨‍🔧</span><span>Técnico: ${acceptedBy}</span></div>` : ''}
      </div>
      <div class="machine-actions">
        ${acceptButton}
        <button class="btn-tech-action" onclick="event.stopPropagation(); openTechModalWithAuth('${id}', '${rowIndex}', '${name.replace(/'/g, "\\'")}', '${status === 'MT' ? 'FALSE' : 'TRUE'}', '${(description || '').replace(/'/g, "\\'")}', ${reassigned}, '${acceptedBy}')">
          <span>⚙️</span> Acciones Técnicas
        </button>
      </div>
    </div>
  `;
}

async function loadData() {
  if (isProcessing) return;
  isProcessing = true;
  
  const content = document.getElementById('content');
  if (!content) {
    isProcessing = false;
    return;
  }
  
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando datos del sistema...</p>
    </div>
  `;

  try {
    const [requirementsData, andonData] = await Promise.all([
      fetchSheetData(sheetConnections.requerimientos),
      fetchSheetData(sheetConnections.andon)
    ]);

    const machineStatusMap = {};
    const machineDetails = {};
    const reassignedMachines = new Set();
    const acceptedByMap = {};
    const notifiedMap = {};
    
    const reqData = requirementsData.data || requirementsData;
    
    if (reqData && Array.isArray(reqData) && reqData.length > 1) {
      const sortedData = reqData.slice(1).sort((a, b) => {
        const dateA = new Date(a[0] || 0);
        const dateB = new Date(b[0] || 0);
        return dateB - dateA;
      });

      sortedData.forEach(row => {
        if (row.length >= 14) {
          const machineName = row[2];
          if (machineName && !machineStatusMap[machineName]) {
            const status = row[9] === 'TRUE' ? 'ACTIVA' : 'MT';
            const isReassigned = row[12] === 'REASIGNADA';
            
            machineStatusMap[machineName] = status;
            machineDetails[machineName] = {
              description: row[4] || '',
              id: row[5] || '',
              responseTime: row[11] || '',
              reassigned: isReassigned,
              acceptedBy: row[13] || '',
              notified: row[14] || ''
            };
            
            if (isReassigned) {
              reassignedMachines.add(machineName);
            }
            
            if (row[13]) {
              acceptedByMap[machineName] = row[13];
            }
            
            notifiedMap[machineName] = row[14] || '';
          }
        }
      });
    }

    const uniqueMachineNames = new Set();
    const andonDataToUse = andonData.data || andonData;
    
    if (andonDataToUse && Array.isArray(andonDataToUse)) {
      for (let i = 3; i < andonDataToUse.length; i += 5) {
        const machineName = andonDataToUse[i]?.[0];
        if (machineName) {
          uniqueMachineNames.add(machineName);
        }
      }
    }

    updateMachineSelect(Array.from(uniqueMachineNames));

    const machines = [];
    if (andonDataToUse && Array.isArray(andonDataToUse)) {
      for (let i = 0; i < andonDataToUse.length; i += 5) {
        const imgRaw = andonDataToUse[i]?.[0] || '';
        const name = andonDataToUse[i + 3]?.[0] || `Máquina ${machines.length + 1}`;
        
        const details = machineDetails[name] || {};
        const isReassigned = reassignedMachines.has(name);
        const status = isReassigned ? 'REASIGNADA' : (machineStatusMap[name] || 'ACTIVA');
        
        machines.push({
          imgUrl: extractImageUrl(imgRaw),
          status,
          description: details.description,
          name,
          id: details.id,
          rowIndex: i,
          responseTime: details.responseTime,
          reassigned: isReassigned,
          acceptedBy: acceptedByMap[name] || '',
          notified: notifiedMap[name] || ''
        });
      }
    }

    allMachines = machines;

    checkAndShowMTNotifications(machines);

    const reassignedMachinesList = machines.filter(m => m.reassigned);
    const mtMachines = machines.filter(m => m.status === 'MT' && !m.reassigned);
    const activeMachines = machines.filter(m => m.status === 'ACTIVA');
    const orderedMachines = [...reassignedMachinesList, ...mtMachines, ...activeMachines];

    let cardsHTML = '<div class="machines-grid">';
    orderedMachines.forEach((machine) => {
      cardsHTML += createMachineCard(
        machine.imgUrl, 
        machine.status, 
        machine.description, 
        machine.name, 
        machine.id,
        machine.rowIndex,
        machine.responseTime,
        machine.reassigned,
        machine.acceptedBy,
        machine.notified
      );
    });
    cardsHTML += '</div>';

    content.innerHTML = cardsHTML;
    
    const totalMachinesElement = document.getElementById('total-machines');
    const lastUpdateTimeElement = document.getElementById('last-update-time');
    
    if (totalMachinesElement) {
      totalMachinesElement.textContent = `${machines.length} Máquinas`;
    }
    
    if (lastUpdateTimeElement) {
      lastUpdateTimeElement.textContent = new Date().toLocaleTimeString('es-MX');
    }

  } catch (error) {
    console.error('Error cargando datos:', error);
    content.innerHTML = `
      <div class="error-message">
        ❌ Error al cargar datos: ${error.message}
        <br><br>
        <button class="btn-refresh" onclick="loadData()">Reintentar</button>
      </div>
    `;
  } finally {
    isProcessing = false;
  }
}

function updateMachineSelect(machineNames) {
  const machineSelect = document.getElementById('machine');
  if (!machineSelect) return;
  
  machineSelect.innerHTML = '<option value="">Seleccione una máquina</option>';
  
  machineNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    machineSelect.appendChild(option);
  });
}

function openRequestModal() {
  const requestModal = document.getElementById('request-modal');
  if (requestModal) {
    requestModal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    if (modalId === 'request-modal') {
      const requestForm = document.getElementById('request-form');
      if (requestForm) {
        requestForm.reset();
      }
    }
  }
}

function showMessage(type, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
  messageDiv.textContent = message;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
}

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    loadData();
  }, 60000);
}

function initEventListeners() {
  const initAudioOnInteraction = () => {
    initAudio();
    loadNotificationSound();
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('touchstart', initAudioOnInteraction);
  };
  
  document.addEventListener('click', initAudioOnInteraction);
  document.addEventListener('touchstart', initAudioOnInteraction);

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-modal') || e.target.classList.contains('btn-cancel')) {
      const modalId = e.target.getAttribute('data-modal');
      if (modalId) {
        closeModal(modalId);
      } else {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.remove();
        }
      }
      return;
    }
  });

  const requestBtn = document.getElementById('request-btn');
  if (requestBtn) {
    requestBtn.addEventListener('click', openRequestModal);
  }

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadData);
  }

  const techForm = document.getElementById('tech-form');
  const requestForm = document.getElementById('request-form');
  
  if (techForm) {
    techForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const machineId = document.getElementById('machine-id').value;
      const isReassigned = document.querySelector(`.machine-card[data-id="${machineId}"]`)?.dataset.reassigned === 'true';
      
      if (isReassigned && !canCloseReassigned()) {
        showReassignedRestriction();
        return;
      }
      
      const now = new Date();
      const formData = {
        id: machineId,
        row: document.getElementById('machine-row').value,
        actionTaken: document.getElementById('action-taken').value,
        technician: document.getElementById('technician').value,
        status: document.getElementById('status').value,
        description: document.getElementById('tech-problem-description').value,
        responseTime: formatDate(now),
        action: 'update',
        sheetName: 'REQUERIMIENTOS',
        spreadsheetId: sheetConnections.requerimientos.spreadsheetId
      };

      try {
        const result = await fetchSheetData(
          sheetConnections.requerimientos, 
          'update', 
          formData
        );
        
        if (result.success) {
          showMessage('success', "Datos técnicos actualizados correctamente");
          closeModal('tech-modal');
          await loadData();
        } else {
          showMessage('error', "Error al actualizar: " + (result.message || 'Error desconocido'));
        }
      } catch (error) {
        showMessage('error', "Error de conexión: " + error.message);
      }
    });
  }
  
  if (requestForm) {
    requestForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
        machine: document.getElementById('machine').value,
        priority: document.getElementById('priority').value,
        problemDescription: document.getElementById('problem-description').value,
        requestTime: formatDate(new Date()),
        user: getCurrentUser(),
        action: 'create',
        sheetName: 'REQUERIMIENTOS',
        spreadsheetId: sheetConnections.requerimientos.spreadsheetId
      };

      try {
        const result = await fetchSheetData(
          sheetConnections.requerimientos, 
          'create', 
          formData
        );
        
        if (result.success) {
          showMessage('success', "Solicitud enviada correctamente. ID: " + (result.id || ''));
          closeModal('request-modal');
          await loadData();
        } else {
          showMessage('error', "Error al enviar: " + (result.message || 'Error desconocido'));
        }
      } catch (error) {
        showMessage('error', "Error de conexión: " + error.message);
      }
    });
  }
}

function init() {
  console.log('Iniciando aplicación...');
  
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    setCurrentUser(savedUser);
  } else {
    setCurrentUser('Marco Cruger');
  }
  
  const techBtn = document.getElementById('tech-btn');
  if (techBtn) {
    techBtn.style.display = isAuthorizedTech() ? 'block' : 'none';
  }
  
  requestNotificationPermission();
  
  updateClock();
  setInterval(updateClock, 1000);
  
  initEventListeners();
  
  loadData();
  startAutoRefresh();
  
  console.log('Aplicación iniciada correctamente');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});