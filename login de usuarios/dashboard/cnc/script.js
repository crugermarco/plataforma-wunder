const CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzKmGJISYhLuP6ZONBBlSVUYi3-bdDdsGGYe3k0qc_UoagxPhccPSxHUrPxa-PAoVlV/exec',
    sheetName: 'Herramientas stock',
    headers: ['NOMBRE', 'STOCK FISICO', 'STOCK NECESARIO', 'IMAGEN']
};

let allTools = [];
let currentFilter = 'all'; 
let retryCount = 0;
const MAX_RETRIES = 3;

let stockUpdateBuffer = [];
let stockUpdateTimeout = null;
const STOCK_UPDATE_DELAY = 1500;

let useModalOverlay, useModalClose, useModalCancel, useToolForm, useToolNameInput, useQtyInput, useQtyHint, useMachineSelect, useToolIdHidden;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        cacheModalRefs();
        setupEventListeners();
        setupUseModal();
        loadToolsDataJSONP();
    }, 100);
});

function cacheModalRefs() {
    useModalOverlay   = document.getElementById('useModalOverlay');
    useModalClose     = document.getElementById('useModalClose');
    useModalCancel    = document.getElementById('useModalCancel');
    useToolForm       = document.getElementById('useToolForm');
    useToolNameInput  = document.getElementById('useToolName');
    useQtyInput       = document.getElementById('useQty');
    useQtyHint        = document.getElementById('useQtyHint');
    useMachineSelect  = document.getElementById('useMachine');
    useToolIdHidden   = document.getElementById('useToolId');
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));

    const retryButton = document.getElementById('retryButton');
    if (retryButton) retryButton.addEventListener('click', function() {
        retryCount = 0;
        loadToolsDataJSONP();
    });
}

function setupUseModal() {
    if (!useMachineSelect) return;
    useMachineSelect.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
        const opt = document.createElement('option');
        opt.value = `MAQUINA VF-1 #${i}`;
        opt.textContent = `MAQUINA VF-1 #${i}`;
        useMachineSelect.appendChild(opt);
    }
    const extra = [
        { v: 'MAQUINA TM2P#8',  t: 'MAQUINA TM2P#8' },
        { v: 'MAQUINA TMP2#10', t: 'MAQUINA TMP2#10' }
    ];
    extra.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.v; opt.textContent = e.t;
        useMachineSelect.appendChild(opt);
    });

    if (useModalClose)  useModalClose.addEventListener('click', closeUseModal);
    if (useModalCancel) useModalCancel.addEventListener('click', closeUseModal);
    if (useModalOverlay) {
        useModalOverlay.addEventListener('click', (e) => {
            if (e.target === useModalOverlay) closeUseModal();
        });
    }

    if (useToolForm) {
        useToolForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = parseInt(useToolIdHidden.value, 10);
            const tool = allTools.find(t => t.id === id);
            if (!tool) return;

            const qty = parseInt(useQtyInput.value, 10);
            const machine = useMachineSelect.value;

            if (!qty || qty <= 0) { useQtyInput.focus(); return; }
            if (qty > tool.currentStock) { 
                useQtyHint.textContent = `No puedes usar más de ${tool.currentStock}.`;
                useQtyInput.focus();
                return; 
            }

            tool.currentStock -= qty;
            renderStatistics();
            renderInventory();
            bufferStockUpdate(tool);

            try { await recordToolChange(tool, qty, machine); } 
            catch (err) { console.error(err); }

            closeUseModal();
        });
    }
}

function openUseModal(tool) {
    if (!useModalOverlay) return;
    useToolNameInput.value = tool.name;
    useToolIdHidden.value = tool.id;
    useQtyInput.value = '';
    useQtyInput.min = 1;
    useQtyInput.max = Math.max(tool.currentStock, 0);
    useQtyHint.textContent = `Stock disponible: ${tool.currentStock}`;
    useModalOverlay.style.display = 'flex';
    setTimeout(() => useQtyInput.focus(), 50);
}
function closeUseModal() { if (useModalOverlay) useModalOverlay.style.display = 'none'; }

function loadToolsDataJSONP() {
    showLoading(true);
    hideError();
    const callbackName = 'jsonpCallback_' + new Date().getTime();
    const script = document.createElement('script');

    window[callbackName] = function(data) {
        try {
            if (!data.success) throw new Error(data.error || 'Error en el servidor');
            if (!data.data || !Array.isArray(data.data)) throw new Error('Formato de datos inválido');

            allTools = data.data.map((row, index) => ({
                id: index + 1,
                name: row[0] || 'Sin nombre',
                currentStock: parseInt(row[1]) || 0,
                neededStock: parseInt(row[2]) || 0,
                imageUrl: row[3] || ''
            }));

            renderStatistics();
            renderInventory();
            showLoading(false);
            retryCount = 0;

        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(loadToolsDataJSONP, 2000 * retryCount);
            } else {
                showError(error.message);
                showLoading(false);
            }
        } finally {
            delete window[callbackName];
            if (script.parentNode) document.body.removeChild(script);
        }
    };

    const params = new URLSearchParams({
        sheetName: CONFIG.sheetName,
        range: 'A2:D',
        callback: callbackName,
        t: new Date().getTime()
    });
    script.src = `${CONFIG.scriptUrl}?${params}`;
    document.body.appendChild(script);

    setTimeout(() => {
        if (script.parentNode) {
            document.body.removeChild(script);
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(loadToolsDataJSONP, 2000 * retryCount);
            } else {
                showError('El servidor no respondió. Por favor, verifica tu conexión.');
                showLoading(false);
            }
        }
    }, 10000);
}

function showLoading(show) {
    const container = document.getElementById('loadingContainer');
    if (container) container.style.display = show ? 'flex' : 'none';
}
function showError(message) {
    const container = document.getElementById('errorContainer');
    if (!container) return;
    container.innerHTML = `
        <h3>❌ Error al cargar los datos</h3>
        <p>${message}</p>
        <button id="retryButton" style="margin-top:1rem;padding:0.5rem 1rem;background:#10b981;color:white;border:none;border-radius:0.5rem;cursor:pointer;">
            Reintentar
        </button>`;
    container.style.display = 'block';
    const retryButton = document.getElementById('retryButton');
    if (retryButton) retryButton.addEventListener('click', function() {
        retryCount = 0; loadToolsDataJSONP();
    });
}
function hideError() {
    const container = document.getElementById('errorContainer');
    if (container) container.style.display = 'none';
}

function renderStatistics() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    const totalTools = allTools.length;
    const criticalTools = allTools.filter(t => t.currentStock <= 5).length;
    const lowTools = allTools.filter(t => t.currentStock > 5 && t.currentStock < t.neededStock).length;
    const goodTools = allTools.filter(t => t.currentStock >= t.neededStock).length;

    statsGrid.innerHTML = `
        <div class="stat-card"><div class="stat-value stat-total">${totalTools}</div><div class="stat-label">Total de Herramientas</div></div>
        <div class="stat-card"><div class="stat-value stat-critical">${criticalTools}</div><div class="stat-label">Stock Crítico</div></div>
        <div class="stat-card"><div class="stat-value stat-low">${lowTools}</div><div class="stat-label">Stock Bajo</div></div>
        <div class="stat-card"><div class="stat-value stat-good">${goodTools}</div><div class="stat-label">Stock Bueno</div></div>
    `;
}

function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;

    if (allTools.length === 0) {
        inventoryGrid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No hay herramientas registradas</h3></div>`;
        return;
    }

    const filteredTools = currentFilter === 'all' ? [...allTools] : allTools.filter(tool => getStockStatus(tool) === currentFilter);

    inventoryGrid.innerHTML = filteredTools.map(tool => {
        const stockPercentage = tool.neededStock > 0 ? (tool.currentStock / tool.neededStock) * 100 : 0;
        const status = getStockStatus(tool);
        return `
        <div class="tool-card">
            <div class="tool-image">${tool.imageUrl ? `<img src="${tool.imageUrl}" alt="${tool.name}" onerror="this.parentElement.innerHTML='🔧'">` : '🔧'}</div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <div class="stock-info">
                    <div class="stock-item"><div class="stock-value stock-current">${tool.currentStock}</div><div class="stock-label">Stock Actual</div></div>
                    <div class="stock-item"><div class="stock-value stock-needed">${tool.neededStock}</div><div class="stock-label">Stock Necesario</div></div>
                </div>
                <div class="progress-container">
                    <div class="progress-label"><span>Nivel de Stock</span><span>${Math.round(stockPercentage)}%</span></div>
                    <div class="progress-bar"><div class="progress-fill ${getProgressColorClass(status)}" style="width: ${Math.min(Math.max(stockPercentage,0),100)}%"></div></div>
                </div>
                <div class="status-badge ${getStatusClass(status)}">${getStatusText(status)}</div>
                <div class="tool-buttons">
                    <button onclick="handleAddStock(${tool.id})">➕ Agregar Stock</button>
                    <button onclick="handleUseTool(${tool.id})">⚡ Usar Herramienta</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function getStockStatus(tool) {
    if (tool.currentStock <= 5) return 'critical';
    if (tool.currentStock > 5 && tool.currentStock < tool.neededStock) return 'low';
    return 'good';
}
function getStatusClass(status) { return `status-${status}`; }
function getProgressColorClass(status) { return { 'critical':'progress-critical', 'low':'progress-low', 'good':'progress-good' }[status] || 'progress-good'; }
function getStatusText(status) { return { 'critical':'🚨 Crítico','low':'⚠️ Bajo','good':'✅ Bueno'}[status] || 'Desconocido'; }
function handleFilter(event) { 
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); 
    event.target.classList.add('active'); 
    currentFilter = event.target.getAttribute('data-filter'); 
    renderInventory(); 
}

function handleAddStock(id) {
    const tool = allTools.find(t => t.id === id);
    const input = prompt(`Agregar cantidad de ${tool.name}:`, '1');
    if (input === null) return;
    const qty = parseInt(input, 10);
    if (!qty || qty <= 0) return;
    tool.currentStock += qty;
    renderStatistics();
    renderInventory();
    bufferStockUpdate(tool);
}
function handleUseTool(id) {
    const tool = allTools.find(t => t.id === id);
    if (!tool) return;
    openUseModal(tool);
}

function bufferStockUpdate(tool) {
    const index = stockUpdateBuffer.findIndex(t => t.name === tool.name);
    if (index >= 0) stockUpdateBuffer[index] = { name: tool.name, stock: tool.currentStock };
    else stockUpdateBuffer.push({ name: tool.name, stock: tool.currentStock });

    if (stockUpdateTimeout) clearTimeout(stockUpdateTimeout);
    stockUpdateTimeout = setTimeout(flushStockUpdates, STOCK_UPDATE_DELAY);
}
async function flushStockUpdates() {
    if (!stockUpdateBuffer.length) return;
    const updates = [...stockUpdateBuffer];
    stockUpdateBuffer = [];
    try {
        await fetch(CONFIG.scriptUrl, {
            method:'POST',
            body:JSON.stringify({ action:'updateMultipleStock', sheetName: CONFIG.sheetName, updates })
        });
    } catch (err) { console.error('Error actualizando stock en Sheets:', err); }
}

async function recordToolChange(tool, qty, machine) {
    await fetch(CONFIG.scriptUrl, {
        method:'POST',
        body:JSON.stringify({ 
            action:'recordToolChange', 
            sheetName: CONFIG.sheetName, 
            name: tool.name, 
            qty, 
            machine 
        })
    });
}

