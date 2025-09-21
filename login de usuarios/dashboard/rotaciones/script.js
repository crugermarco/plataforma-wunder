const GOOGLE_SHEETS_CONFIG = {
    employeeDatabase: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbxyfp4T0voGemFW0VMFS8OdDA2mRSFryZF1IPWdNjoOtLwLRZVgpaHQpFPRSq3yCOwiXg/exec',
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'DATA'
    },
    rotationRegistry: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbxyfp4T0voGemFW0VMFS8OdDA2mRSFryZF1IPWdNjoOtLwLRZVgpaHQpFPRSq3yCOwiXg/exec',
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'FLUJO DE ROTACIONES'
    },
    bathroomRegistry: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbxyfp4T0voGemFW0VMFS8OdDA2mRSFryZF1IPWdNjoOtLwLRZVgpaHQpFPRSq3yCOwiXg/exec',
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'BAÑO'
    }
};

const employeeDatabase = {
    'marco cruger': { id: '3378', fullName: 'Marco Cruger' },
    'javier raygoza': { id: '1908', fullName: 'Javier Raygoza' },
    'carlos lopez': { id: '3380', fullName: 'Carlos López' },
    'maria rodriguez': { id: '3381', fullName: 'María Rodríguez' },
    'jose martinez': { id: '3382', fullName: 'José Martínez' }
};

let searchTimeout;
let bathroomUsers = [];

// Función para establecer fecha y hora actual
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

// Función para buscar empleado
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

// Función para mostrar mensajes de estado
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

// Función para enviar datos a Google Sheets (rotaciones)
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

// Función para enviar registros de baño
async function sendBathroomRecord(recordData) {
    try {
        const queryString = new URLSearchParams({
            action: 'logBathroom',
            ...recordData
        }).toString();

        const url = `${GOOGLE_SHEETS_CONFIG.bathroomRegistry.scriptUrl}?${queryString}`;
        const response = await fetch(url, { method: 'GET', mode: 'cors' });

        if (!response.ok) throw new Error('Error al conectar con el servidor');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Error al registrar baño');
        
        return { success: true };
    } catch (error) {
        console.error('Error en sendBathroomRecord:', error);
        throw error;
    }
}

// Función para actualizar el panel de baño
function updateBathroomPanel() {
    const panel = document.getElementById('bathroomPanel');
    if (bathroomUsers.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    panel.innerHTML = '<div class="bathroom-title">PERSONAL EN BAÑO</div>';

    const now = new Date();
    bathroomUsers.forEach(user => {
        const diff = Math.floor((now - user.startTime) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');

        const card = document.createElement('div');
        card.className = 'bathroom-card';
        
        // Determinar el estado según el tiempo
        if (diff > 900) { // Más de 20 minutos (1200 segundos)
            card.classList.add('critical-alert');
        } else if (diff > 600) { // Más de 15 minutos (900 segundos)
            card.classList.add('warning-alert');
        }
        
        card.innerHTML = `
            <div class="name">${user.name}</div>
            <div class="time">${minutes}:${seconds}</div>
            <div class="label">Tiempo en el baño</div>
        `;
        panel.appendChild(card);
    });
}

// Evento para búsqueda de empleados
document.getElementById('employeeName').addEventListener('input', function(e) {
    const name = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchEmployee(name), 500);
});

// Evento submit del formulario
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
        showStatus('✅ Registro enviado exitosamente', 'success');

        const lower = operationName.toLowerCase();
        const existing = bathroomUsers.find(u => u.key === nameKey);

        if (lower.includes('servicio')) {
            if (existing) {
                // SALIDA DEL BAÑO
                const exitTime = new Date();
                const durationMs = exitTime - existing.startTime;
                const durationMin = (durationMs / 60000).toFixed(2);

                await sendBathroomRecord({
                    employeeName: employeeName,
                    employeeId: employeeId,
                    entryTime: existing.startTime.toLocaleTimeString('es-MX'),
                    exitTime: exitTime.toLocaleTimeString('es-MX'),
                    duration: durationMin,
                    date: exitTime.toLocaleDateString('es-MX')
                });

                // Remover del panel
                const index = bathroomUsers.findIndex(u => u.key === nameKey);
                if (index !== -1) bathroomUsers.splice(index, 1);

            } else {
                // ENTRADA AL BAÑO
                if (bathroomUsers.length >= 3) {
                    showStatus("⛔ Ya hay 3 personas en el baño. No puedes registrar más.", 'error');
                } else {
                    bathroomUsers.push({ name: employeeName, key: nameKey, startTime: now });
                    showStatus(`✅ ${employeeName} registrado en el baño`, 'success');
                }
            }
        } else {
            // Si no se menciona "baño", eliminar en caso de que haya registro residual
            const index = bathroomUsers.findIndex(u => u.key === nameKey);
            if (index !== -1) {
                bathroomUsers.splice(index, 1);
            }
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

// Actualizar panel de baño cada segundo
setInterval(updateBathroomPanel, 1000);

// Establecer fecha y hora al cargar la página
setCurrentDateTime();

