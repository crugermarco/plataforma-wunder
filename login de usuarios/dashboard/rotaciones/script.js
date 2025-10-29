const SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbyTr9JHkSwC6lC_5mfe6aG-s3tjUFxm-fd4_JvpfFRZWkC9RpD3hmmvj_DNtN1l4xkpMg/exec',


GOOGLE_SHEETS_CONFIG = {
    employeeDatabase: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'DATA'
    },
    rotationRegistry: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'FLUJO DE ROTACIONES'
    },
    bathroomRegistry: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'BAÑO'
    }
};

const employeeDatabase = {
    'marco cruger': { id: '3378', fullName: 'Marco Cruger' },
};

let searchTimeout;
let bathroomUsers = [];
let pendingBathroomRecords = []; 

function setCurrentDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    document.getElementById('dateTime').value = now.toLocaleString('es-MX', options);
}

async function searchEmployee(name) {
    const nameStatus = document.getElementById('nameStatus');
    const employeeIdField = document.getElementById('employeeId');

    if (!name.trim()) {
        nameStatus.innerHTML = '';
        employeeIdField.value = '';
        return;
    }

    nameStatus.innerHTML = '⏳';
    nameStatus.className = 'field-status status-loading';

    try {
        const url = `${GOOGLE_SHEETS_CONFIG.employeeDatabase.scriptUrl}?action=searchEmployee&name=${encodeURIComponent(name)}`;
        const response = await fetch(url, { method: 'GET', mode: 'cors' });

        if (!response.ok) throw new Error('Error en la conexión con la base de datos');

        const result = await response.json();

        if (result.found) {
            employeeIdField.value = result.id;
            nameStatus.innerHTML = '✓';
            nameStatus.className = 'field-status status-found';
        } else {
            employeeIdField.value = '';
            nameStatus.innerHTML = '✗';
            nameStatus.className = 'field-status status-error';
        }
    } catch (error) {
        console.error('Error al buscar empleado:', error);
        nameStatus.innerHTML = '⚠️';
        nameStatus.className = 'field-status status-error';
        employeeIdField.value = '';

        const searchKey = name.toLowerCase().trim();
        const employee = employeeDatabase[searchKey];

        if (employee) {
            employeeIdField.value = employee.id;
            nameStatus.innerHTML = '✓';
            nameStatus.className = 'field-status status-found';
        }
    }
}

function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

async function sendToGoogleSheets(formData) {
    try {
        const queryString = new URLSearchParams({
            action: 'addRotation',
            employeeName: formData.employeeName,
            employeeId: formData.employeeId,
            operationName: formData.operationName,
            dateTime: formData.dateTime
        }).toString();

        const url = `${GOOGLE_SHEETS_CONFIG.rotationRegistry.scriptUrl}?${queryString}`;

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`Error en la conexión con Google Sheets: ${response.status}`);

        const result = await response.json();

        if (result.success) {
            return { success: true, message: 'Registro enviado exitosamente' };
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('❌ Error al enviar a Google Sheets:', error);
        throw error;
    }
}

async function sendBathroomRecord(recordData) {
    return new Promise((resolve, reject) => {
        pendingBathroomRecords.push({ recordData, resolve, reject });
        
        if (pendingBathroomRecords.length === 1) {
            processBathroomQueue();
        }
    });
}

async function processBathroomQueue() {
    while (pendingBathroomRecords.length > 0) {
        const { recordData, resolve, reject } = pendingBathroomRecords[0];
        
        try {
            const queryString = new URLSearchParams({
                action: 'logBathroom',
                ...recordData
            }).toString();

            const url = `${GOOGLE_SHEETS_CONFIG.bathroomRegistry.scriptUrl}?${queryString}`;
            const response = await fetch(url, { 
                method: 'GET', 
                mode: 'cors',
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) throw new Error('Error al conectar con el servidor');
            
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Error al registrar baño');
            
            resolve({ success: true });
        } catch (error) {
            console.warn('Error en registro de baño (se reintentará):', error);
            
            setTimeout(async () => {
                try {
                    const queryString = new URLSearchParams({
                        action: 'logBathroom',
                        ...recordData
                    }).toString();

                    const url = `${GOOGLE_SHEETS_CONFIG.bathroomRegistry.scriptUrl}?${queryString}`;
                    const response = await fetch(url, { method: 'GET', mode: 'cors' });

                    if (!response.ok) throw new Error('Error en reintento');
                    
                    const result = await response.json();
                    if (!result.success) throw new Error(result.message);
                    
                    resolve({ success: true });
                } catch (retryError) {
                    reject(retryError);
                } finally {
                    pendingBathroomRecords.shift();
                    if (pendingBathroomRecords.length > 0) {
                        processBathroomQueue();
                    }
                }
            }, 2000);
            
            return;
        }
        
        pendingBathroomRecords.shift();
    }
}

function updateBathroomPanel() {
    const panel = document.getElementById('bathroomPanel');
    if (bathroomUsers.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    
    const fragment = document.createDocumentFragment();
    fragment.innerHTML = '<div class="bathroom-title">PERSONAL EN BAÑO</div>';

    const now = new Date();
    bathroomUsers.forEach(user => {
        const diff = Math.floor((now - user.startTime) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');

        const card = document.createElement('div');
        card.className = 'bathroom-card';
        
        if (diff > 600) { // Más de 10 minutos
            card.classList.add('critical-alert');
        } else if (diff > 900) { // Más de 15 minutos
            card.classList.add('warning-alert');
        }
        
        card.innerHTML = `
            <div class="name">${user.name}</div>
            <div class="time">${minutes}:${seconds}</div>
            <div class="label">Tiempo en el baño</div>
        `;
        fragment.appendChild(card);
    });

    panel.innerHTML = '';
    panel.appendChild(fragment);
}

async function handleBathroomExit(employeeName, employeeId, existing) {
    const exitTime = new Date();
    const durationMs = exitTime - existing.startTime;
    const durationMin = (durationMs / 60000).toFixed(2);

    const index = bathroomUsers.findIndex(u => u.key === existing.key);
    if (index !== -1) {
        bathroomUsers.splice(index, 1);
        updateBathroomPanel(); 
    }

    const recordData = {
        employeeName: employeeName,
        employeeId: employeeId,
        entryTime: existing.startTime.toLocaleTimeString('es-MX'),
        exitTime: exitTime.toLocaleTimeString('es-MX'),
        duration: durationMin,
        date: exitTime.toLocaleDateString('es-MX')
    };

    sendBathroomRecord(recordData)
        .then(() => {
            console.log('✅ Registro de baño guardado exitosamente');
        })
        .catch(error => {
            console.warn('⚠️ Error en registro de baño (pero usuario ya fue removido):', error);
        });

    return `✅ ${employeeName} salió del baño después de ${durationMin} minutos`;
}

document.getElementById('employeeName').addEventListener('input', function(e) {
    const name = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchEmployee(name), 500);
});

document.getElementById('rotationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    const employeeId = document.getElementById('employeeId').value;

    if (!employeeId) {
        showStatus('❌ Por favor, ingresa un nombre de empleado válido', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loader"></div>ENVIANDO...';

    const employeeName = document.getElementById('employeeName').value.trim();
    const operationName = document.getElementById('operationName').value.trim();
    const dateTime = document.getElementById('dateTime').value.trim();

    const formData = {
        employeeName,
        employeeId: employeeId.trim(),
        operationName,
        dateTime
    };

    const nameKey = employeeName.toLowerCase();
    const now = new Date();

    try {
        showStatus('📤 Enviando registro a Google Sheets...', 'loading');
        
        await sendToGoogleSheets(formData);
        
        const lower = operationName.toLowerCase();
        const existing = bathroomUsers.find(u => u.key === nameKey);

        if (lower.includes('servicio')) {
            if (existing) {
                const exitMessage = await handleBathroomExit(employeeName, employeeId, existing);
                showStatus(exitMessage, 'success');
            } else {
                if (bathroomUsers.length >= 3) {
                    showStatus("⛔ Ya hay 3 personas en el baño. No puedes registrar más.", 'error');
                } else {
                    bathroomUsers.push({ name: employeeName, key: nameKey, startTime: now });
                    updateBathroomPanel(); 
                    showStatus(`✅ ${employeeName} registrado en el baño`, 'success');
                }
            }
        } else {
            const index = bathroomUsers.findIndex(u => u.key === nameKey);
            if (index !== -1) {
                bathroomUsers.splice(index, 1);
                updateBathroomPanel(); // Actualización inmediata
            }
            showStatus('✅ Registro enviado exitosamente', 'success');
        }

        document.getElementById('rotationForm').reset();
        document.getElementById('nameStatus').innerHTML = '';
        setCurrentDateTime();
    } catch (error) {
        showStatus(`❌ Error al enviar el registro: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

setInterval(updateBathroomPanel, 1000);

setCurrentDateTime();
