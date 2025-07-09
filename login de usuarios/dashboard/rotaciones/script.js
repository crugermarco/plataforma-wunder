const GOOGLE_SHEETS_CONFIG = {
    employeeDatabase: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbxaDn9mCZ5m5mFRyBO7lTI9jx7jAEhkrQJb_3S4tf78dhTRzQjBkSQyrL-x6q37L1Exew/exec',
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'DATA'
    },
    rotationRegistry: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbyPW8MdC-jHLyWL31BnTd9tzqCoyDkbOpdzHdXkShAOj2OvX6YHMYtVyffTx1kNfJOkEw/exec',
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'FLUJO DE ROTACIONES'
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

// === BAÑO: lógica de tarjetas con temporizador ===
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
        card.innerHTML = `
            <div class="name">${user.name}</div>
            <div class="time">${minutes}:${seconds}</div>
            <div class="label">Tiempo en el baño</div>
        `;
        panel.appendChild(card);
    });
}

setInterval(updateBathroomPanel, 1000);

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
        showStatus('✅ Registro enviado exitosamente', 'success');

        const lower = operationName.toLowerCase();
        const existing = bathroomUsers.find(u => u.key === nameKey);

        if (lower.includes('baño')) {
            if (existing) {
                // SALIDA DEL BAÑO
                const exitTime = new Date();
                const durationMs = exitTime - existing.startTime;
                const durationMin = (durationMs / 60000).toFixed(2);

                // Enviar a hoja BAÑO
                const date = exitTime.toLocaleDateString('es-MX');
                const entryTimeStr = existing.startTime.toLocaleTimeString('es-MX');
                const exitTimeStr = exitTime.toLocaleTimeString('es-MX');

                const params = new URLSearchParams({
                    action: 'logBathroom',
                    employeeName: employeeName,
                    employeeId: employeeId,
                    entryTime: entryTimeStr,
                    exitTime: exitTimeStr,
                    duration: durationMin,
                    date: date
                });

                const bathroomSheetUrl = `https://script.google.com/macros/s/AKfycbyPW8MdC-jHLyWL31BnTd9tzqCoyDkbOpdzHdXkShAOj2OvX6YHMYtVyffTx1kNfJOkEw/exec?${params.toString()}`;
                await fetch(bathroomSheetUrl, { method: 'GET', mode: 'cors' });

                // Remover del panel
                const index = bathroomUsers.findIndex(u => u.key === nameKey);
                if (index !== -1) bathroomUsers.splice(index, 1);

            } else {
                // ENTRADA AL BAÑO
                if (bathroomUsers.length >= 2) {
                    alert("⛔ Ya hay 2 personas en el baño. No puedes registrar más.");
                } else {
                    bathroomUsers.push({ name: employeeName, key: nameKey, startTime: now });
                }
            }
        } else {
            // Si no se menciona "baño", eliminar en caso de que haya registro residual
            const index = bathroomUsers.findIndex(u => u.key === nameKey);
            if (index !== -1) bathroomUsers.splice(index, 1);
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
