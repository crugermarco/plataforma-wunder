let autoRefreshInterval;

const GOOGLE_SHEETS_CONFIG = {
    apiKey: 'AIzaSyBYw2gwhaxFI6JgXZFRFkKcu5n6-mOvwV4',
    spreadsheetId: '16bdhcjyctw5KLoleLAd4_vkw8eKqedxLHulWO1kEGJ8',
    range: 'ANDON DIGITAL!A:A',
};

const mockData = [
    ["https://www.haas.com.mx/wp-content/uploads/2022/09/HAAS-VF-1.png?w=400"],
    ["MT"],
    ["No hay energía eléctrica en el taller"],
    ["Torno CNC 01"],
    [""],
    ["https://www.haas.com.mx/wp-content/uploads/2022/09/HAAS-VF-1.png?w=400"],
    ["IN PROGRESS"],
    ["Cambio de herramienta en ejecución"],
    ["Fresadora 5E"],
    [""]
];

async function getSheetData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
            return data.values;
        } else {
            throw new Error('No se encontraron datos');
        }
    } catch (error) {
        console.warn('Error conectando con Google Sheets, usando datos de ejemplo:', error);
        return mockData;
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

function getStatusClass(status) {
    const statusUpper = status.toUpperCase();
    if (statusUpper.startsWith('MT')) return 'status-mt';
    if (statusUpper.includes('ACTIVA')) return 'status-progress';
    return 'status-neutral';
}

function getStatusColor(status) {
    const statusUpper = status.toUpperCase();
    if (statusUpper.startsWith('MT')) return '#ff4757';
    if (statusUpper.includes('ACTIVA')) return '#4CAF50';
    return '#9E9E9E';
}

function extractImageUrl(cellValue) {
    if (typeof cellValue === 'string' && cellValue.startsWith('=IMAGE("')) {
        return cellValue.match(/=IMAGE\("(.*?)"\)/)?.[1] || '';
    }
    return cellValue;
}

function createMachineCard(imgUrl, status, description, name, index) {
    const statusClass = getStatusClass(status);
    const statusColor = getStatusColor(status);

    return `
        <div class="machine-card fade-in" style="--status-color: ${statusColor}; animation-delay: ${index * 0.1}s">
            <div class="machine-image">
                ${imgUrl && imgUrl.startsWith('http')
                    ? `<img src="${imgUrl}" alt="${name}" onerror="this.parentElement.innerHTML='<div class=placeholder>📷 Sin Imagen</div>'">`
                    : '<div class="placeholder">📷 Sin Imagen</div>'
                }
            </div>
            <div class="machine-name">${name}</div>
            <div class="status-badge ${statusClass}">${status}</div>
            <div class="machine-details">
                <div class="detail-item"><span>📝</span><span>${description}</span></div>
                <div class="detail-item"><span>🏷️</span><span>ID: M${String(index + 1).padStart(3, '0')}</span></div>
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
        const rawData = await getSheetData();
        const machines = [];

        // Recorremos cada bloque de 5 en 5
        for (let i = 0; i < rawData.length; i += 5) {
            const imgRaw = rawData[i]?.[0] || '';
            const status = rawData[i + 1]?.[0] || 'DESCONOCIDO';
            const description = rawData[i + 2]?.[0] || '';
            const name = rawData[i + 3]?.[0] || `Máquina ${machines.length + 1}`;
            const imgUrl = extractImageUrl(imgRaw);

            machines.push({ imgUrl, status, description, name });
        }

        // Ordenamos: MT → IN PROGRESS → otros
        const mtMachines = machines.filter(m => m.status.toUpperCase().startsWith("MT"));
        const inProgressMachines = machines.filter(m => m.status.toUpperCase().includes("ACTIVA") && !m.status.toUpperCase().startsWith("MT"));
        const others = machines.filter(m => !m.status.toUpperCase().startsWith("MT") && !m.status.toUpperCase().includes("ACTIVA"));
        const orderedMachines = [...mtMachines, ...inProgressMachines, ...others];

        let cardsHTML = '<div class="machines-grid">';
        orderedMachines.forEach((machine, index) => {
            cardsHTML += createMachineCard(machine.imgUrl, machine.status, machine.description, machine.name, index);
        });
        cardsHTML += '</div>';

        content.innerHTML = cardsHTML;
        document.getElementById('total-machines').textContent = `${machines.length} Máquinas`;
        document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString('es-MX');

    } catch (error) {
        content.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar los datos: ${error.message}
                <br><br>
                <button class="btn-refresh" onclick="loadData()">Reintentar</button>
            </div>
        `;
    }
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
}

window.addEventListener('load', init);
window.addEventListener('beforeunload', function () {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});
