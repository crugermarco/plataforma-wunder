// Configuración de conexiones a Google Sheets
const sheetConnections = {
  requerimientos: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycby1e4tYc6vnHUUklsSX6rlPvR-oL4Ttsvn3BsldGy9R-HSB7gX1g013SmUEyYOqNN1cMQ/exec',
    spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
    sheetName: 'REQUERIMIENTOS'
  },
  andon: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycby1e4tYc6vnHUUklsSX6rlPvR-oL4Ttsvn3BsldGy9R-HSB7gX1g013SmUEyYOqNN1cMQ/exec',
    spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
    sheetName: 'ANDON DIGITAL'
  }
};

let autoRefreshInterval;
let allMachines = [];

function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('userSession'));
    return user?.USUARIO || 'Usuario no identificado';
  } catch (e) {
    console.error('Error al obtener usuario:', e);
    return 'Usuario no identificado';
  }
}

function isAuthorizedTech() {
  const currentUser = getCurrentUser();
  return ['Marco Cruger', 'Josue Chavez'].includes(currentUser);
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
  document.getElementById('current-time').textContent = timeString;
}

function extractImageUrl(cellValue) {
  if (typeof cellValue === 'string' && cellValue.startsWith('=IMAGE("')) {
    return cellValue.match(/=IMAGE\("(.*?)"\)/)?.[1] || '';
  }
  return cellValue;
}

function openTechModalWithAuth(id, rowIndex, name, status, description) {
  if (!isAuthorizedTech()) {
    document.getElementById('restriction-modal').style.display = 'flex';
    return;
  }
  
  document.getElementById('machine-id').value = id;
  document.getElementById('machine-row').value = rowIndex;
  document.getElementById('tech-problem-description').value = description;
  document.getElementById('status').value = status;
  document.getElementById('technician').value = getCurrentUser();
  document.getElementById('action-taken').value = '';
  document.getElementById('quotations').value = '';
  
  document.getElementById('tech-modal').style.display = 'flex';
}

function createMachineCard(imgUrl, status, description, name, id, rowIndex, responseTime) {
  const statusClass = status === 'MT' ? 'status-mt' : 'status-active';
  const statusText = status === 'MT' ? 'MT' : 'ACTIVA';
  
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMzAwIDE1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  
  return `
    <div class="machine-card" data-id="${id}" data-row="${rowIndex}" style="--status-color: ${status === 'MT' ? '#ef4444' : '#10b981'}">
      <div class="machine-image">
        ${imgUrl && imgUrl.startsWith('http') ? 
          `<img src="${imgUrl}" alt="${name}" onerror="this.src='${placeholderImage}'">` : 
          `<img src="${placeholderImage}" alt="Sin imagen">`
        }
      </div>
      <div class="machine-name">${name}</div>
      <div class="status-badge ${statusClass}">${statusText}</div>
      <div class="machine-details">
        ${status === 'MT' ? `<div class="detail-item"><span>📝</span><span>${description || 'Sin descripción'}</span></div>` : ''}
        <div class="detail-item"><span>🏷️</span><span>ID: ${id || 'N/A'}</span></div>
        ${responseTime ? `<div class="detail-item"><span>⏱️</span><span>Tiempo respuesta: ${responseTime}</span></div>` : ''}
      </div>
      <div class="machine-actions">
        <button class="btn-tech-action" onclick="event.stopPropagation(); openTechModalWithAuth('${id}', '${rowIndex}', '${name.replace(/'/g, "\\'")}', '${status === 'MT' ? 'FALSE' : 'TRUE'}', '${(description || '').replace(/'/g, "\\'")}')">
          <span>⚙️</span> Acciones Técnicas
        </button>
      </div>
    </div>
  `;
}

async function loadData() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Actualizando datos...</p>
    </div>
  `;

  try {
    const [requirementsData, andonData] = await Promise.all([
      fetchSheetData(sheetConnections.requerimientos),
      fetchSheetData(sheetConnections.andon)
    ]);

    const machineStatusMap = {};
    const machineDetails = {};
    
    const reqData = requirementsData.data || requirementsData;
    
    if (reqData && reqData.length > 1) {
      const sortedData = reqData.slice(1).sort((a, b) => {
        const dateA = new Date(a[0] || 0);
        const dateB = new Date(b[0] || 0);
        return dateB - dateA;
      });

      sortedData.forEach(row => {
        if (row.length >= 10) {
          const machineName = row[2];
          if (!machineStatusMap[machineName]) {
            const status = row[9] === 'TRUE' ? 'ACTIVA' : 'MT';
            machineStatusMap[machineName] = status;
            machineDetails[machineName] = {
              description: row[4] || '',
              id: row[5] || '',
              responseTime: row[11] || ''
            };
          }
        }
      });
    }

    const uniqueMachineNames = new Set();
    const andonDataToUse = andonData.data || andonData;
    
    if (andonDataToUse && andonDataToUse.length > 0) {
      for (let i = 3; i < andonDataToUse.length; i += 5) {
        const machineName = andonDataToUse[i]?.[0];
        if (machineName) {
          uniqueMachineNames.add(machineName);
        }
      }
    }

    updateMachineSelect(Array.from(uniqueMachineNames));

    const machines = [];
    if (andonDataToUse && andonDataToUse.length > 0) {
      for (let i = 0; i < andonDataToUse.length; i += 5) {
        const imgRaw = andonDataToUse[i]?.[0] || '';
        const name = andonDataToUse[i + 3]?.[0] || `Máquina ${machines.length + 1}`;
        
        const status = machineStatusMap[name] || 'ACTIVA';
        const details = machineDetails[name] || {};
        
        machines.push({
          imgUrl: extractImageUrl(imgRaw),
          status,
          description: details.description,
          name,
          id: details.id,
          rowIndex: i,
          responseTime: details.responseTime
        });
      }
    }

    allMachines = machines;

    const mtMachines = machines.filter(m => m.status === 'MT');
    const activeMachines = machines.filter(m => m.status === 'ACTIVA');
    const orderedMachines = [...mtMachines, ...activeMachines];

    let cardsHTML = '<div class="machines-grid">';
    orderedMachines.forEach((machine) => {
      cardsHTML += createMachineCard(
        machine.imgUrl, 
        machine.status, 
        machine.description, 
        machine.name, 
        machine.id,
        machine.rowIndex,
        machine.responseTime
      );
    });
    cardsHTML += '</div>';

    content.innerHTML = cardsHTML;
    document.getElementById('total-machines').textContent = `${machines.length} Máquinas`;
    document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString('es-MX');

  } catch (error) {
    console.error('Error cargando datos:', error);
    content.innerHTML = `
      <div class="error-message">
        ❌ Error al cargar datos: ${error.message}
        <br><br>
        <button class="btn-refresh" onclick="loadData()">Reintentar</button>
      </div>
    `;
  }
}

function updateMachineSelect(machineNames) {
  const machineSelect = document.getElementById('machine');
  machineSelect.innerHTML = '<option value="">Seleccione una máquina</option>';
  
  machineNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    machineSelect.appendChild(option);
  });
}

function openRequestModal() {
  document.getElementById('request-modal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  if (modalId === 'request-modal') {
    document.getElementById('request-form').reset();
  }
}

document.getElementById('tech-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const now = new Date();
  const formData = {
    id: document.getElementById('machine-id').value,
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
      loadData();
    } else {
      showMessage('error', "Error al actualizar: " + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    showMessage('error', "Error de conexión: " + error.message);
  }
});

document.getElementById('request-form').addEventListener('submit', async function(e) {
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
      loadData();
    } else {
      showMessage('error', "Error al enviar: " + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    showMessage('error', "Error de conexión: " + error.message);
  }
});

function showMessage(type, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
  messageDiv.textContent = message;
  
  const container = document.querySelector('.container');
  container.insertBefore(messageDiv, container.firstChild);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(loadData, 60000);
}

function init() {
  updateClock();
  setInterval(updateClock, 1000);
  loadData();
  startAutoRefresh();
  
  document.getElementById('tech-btn').addEventListener('click', () => {
    if (!isAuthorizedTech()) {
      document.getElementById('restriction-modal').style.display = 'flex';
      return;
    }
    alert("Seleccione una máquina para actualizar su estado");
  });
  
  document.getElementById('request-btn').addEventListener('click', openRequestModal);
}

window.addEventListener('load', init);
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});