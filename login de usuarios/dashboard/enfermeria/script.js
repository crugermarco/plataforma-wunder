const sheetsConfig = {
    consultas: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q',
        sheetName: 'REPORTE DE CONSULTA',
        headers: [
            'FECHA Y HORA', 'NOMBRE', 'AREA', 'OPERACION',
            'TIPO DE CONSULTA INTERNA/EXTERNA', 'SINTOMAS',
            'DIAGNOSTICO', 'MEDICAMENTO', 'DOSIS', 'Tº',
            'PRESION ARTERIAL ALTA', 'PRESION ARTERIAL BAJA',
            'OXIMETRO', 'OBSERVACIONES'
        ]
    },
    estado: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q',
        sheetName: 'ESTADO DE CONSULTORIO',
        statusCell: 'B1'
    },
    inventario: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q',
        sheetName: 'INVENTARIO DE MEDICAMENTOS',
        headers: [
            'NOMBRE', 'MG', 'CANTIDAD POR CAJA',
            'FECHA DE CADUCIDAD', 'STOCK',
            'UNIDADES', 'IMAGEN'
        ]
    },
    flujo: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1Xh1aej4LmYGf3m4q_OjfYeLDMRGzw2-V-oLx0GlbkQs',
        sheetName: 'FLUJO',
        headers: [
            'FECHA Y HORA', 'ARTICULO', 'QTY', 'UNIDAD'
        ]
    },
    personal: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1oJu9b0zCltzM2PCCFuXWgib7ckp2Xbj9nVcgpcYTYDI',
        sheetName: 'DATA',
        headers: [
            'NOMBRE', 'PUESTO', 'AREA'
        ]
    },
    permisos: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q',
        sheetName: 'PASE MEDICO'
    }
};

let medicamentosData = [];
let consultas = [];
let estadoConsultorio = "ACTIVO";
let currentUser = "Marco Cruger";
let personalData = [];
let vencimientoAlertShown = false;
let selectedMedForRemoval = null;
let selectedMedForRequest = null;
let criterioSeleccionado = null; // Variable para almacenar el criterio seleccionado

// --- helpers ---
function pad(n) { return n < 10 ? '0' + n : String(n); }

// Devuelve "YYYY-MM-DDTHH:MM" usando la hora local del navegador
function getLocalDatetimeForInput(date = new Date()) {
    return date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes());
}

function verificarCredenciales() {
    const usuariosAutorizados = ["Marco Cruger", "Ricardo Ruiz", "Sonia Vazquez", "Doctor Externo"];
    if (!usuariosAutorizados.includes(currentUser)) {
        mostrarAlertaSinPermiso();
        return false;
    }
    return true;
}

function mostrarAlertaSinPermiso() {
    alert("❌ No cuentas con el permiso para este apartado");
    document.querySelectorAll('.content-section, .nav-item').forEach(el => el.style.display = 'none');
}

function showSection(sectionId, event) {
    try {
        if (!verificarCredenciales()) return;
        
        const section = document.getElementById(`${sectionId}-section`);
        if (!section) {
            console.error(`Sección ${sectionId}-section no encontrada`);
            return;
        }

        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        section.classList.add('active');
        
        if (event?.currentTarget) {
            event.currentTarget.classList.add('active');
        }
        
        if (sectionId === 'consultas') {
            actualizarTablaConsultas();
        } else if (sectionId === 'inventario') {
            renderizarInventario();
        }
    } catch (error) {
        console.error("Error en showSection:", error);
    }
}

function buildUrl(config, params = {}, method = 'GET') {
    const url = new URL(config.scriptUrl);
    
    url.searchParams.append('spreadsheetId', config.spreadsheetId);
    url.searchParams.append('sheetName', config.sheetName);
    
    if (method === 'GET') {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        }
        url.searchParams.append('_', Date.now());
    }
    
    return url;
}

async function fetchData(config, params = {}) {
    try {
        const url = buildUrl(config, params, 'GET');
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result) {
            throw new Error('El servidor no devolvió una respuesta válida');
        }
        
        if (Array.isArray(result)) {
            return result;
        }
        
        if (result.success !== undefined) {
            if (!result.success) {
                throw new Error(result.error || 'Error en la respuesta del servidor');
            }
            return result.data || [];
        }
        
        throw new Error('Formato de respuesta no reconocido');
    } catch (error) {
        console.error("Error en fetchData:", error);
        throw error;
    }
}

async function guardarEnSheets(config, data) {
    try {
        const url = buildUrl(config, {}, 'POST');
        
        const formData = new FormData();
        formData.append('spreadsheetId', config.spreadsheetId);
        formData.append('sheetName', config.sheetName);
        formData.append('data', JSON.stringify(data));
        
        if (config.headers) {
            formData.append('headers', JSON.stringify(config.headers));
        }

        if (data.accion) {
            formData.append('action', data.accion);
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            mode: 'cors',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error al guardar');
        }
        
        return result;
    } catch (error) {
        console.error("Error en guardarEnSheets:", error);
        throw error;
    }
}

async function cargarDatosDesdeSheets() {
    try {
        consultas = [];
        medicamentosData = [];
        personalData = [];

        const consultasData = await fetchData(sheetsConfig.consultas, {
            action: 'get',
            range: 'A2:N'
        });
        
        if (consultasData && consultasData.length > 0) {
            consultas = processData(consultasData, sheetsConfig.consultas.headers);
        }

        const inventarioData = await fetchData(sheetsConfig.inventario, {
            action: 'get',
            range: 'A2:G'
        });
        
        if (inventarioData && inventarioData.length > 0) {
            medicamentosData = inventarioData.map(row => ({
                nombre: row[0] || '',
                mg: row[1] || '',
                cantidad_por_caja: parseInt(row[2]) || 0,
                fecha_de_caducidad: row[3] || '',
                stock: parseInt(row[4]) || 0,
                unidades: parseInt(row[5]) || 0,
                imagen: row[6] || ''
            }));
        }

        await cargarEstadoConsultorio();

        const personalDataResponse = await fetchData(sheetsConfig.personal, {
            action: 'get',
            range: 'A2:C'
        });
        
        if (personalDataResponse && personalDataResponse.length > 0) {
            personalData = personalDataResponse.map(row => ({
                nombre: row[0] || '',
                area: row[2] || ''
            }));
            
            const nombresList = document.getElementById('nombres-list');
            if (nombresList) {
                nombresList.innerHTML = '';
                personalData.forEach(persona => {
                    const option = document.createElement('option');
                    option.value = persona.nombre;
                    nombresList.appendChild(option);
                });
            }
        }

        actualizarTablaConsultas();
        renderizarInventario();
        actualizarEstadoConsultorioUI();
        configurarAutocompletado();
        configurarCriteriosMedicamentos();

    } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar datos. Por favor recarga la página.");
    }
}

function configurarAutocompletado() {
    const nombreInput = document.getElementById('nombre');
    const permisoNombreInput = document.getElementById('permiso-nombre');
    
    if (nombreInput) {
        nombreInput.addEventListener('input', function() {
            const nombre = this.value;
            const persona = personalData.find(p => p.nombre === nombre);
            if (persona) {
                document.getElementById('area').value = persona.area;
            }
        });
    }
    
    if (permisoNombreInput) {
        permisoNombreInput.addEventListener('input', function() {
            const nombre = this.value;
            const persona = personalData.find(p => p.nombre === nombre);
            if (persona) {
                document.getElementById('permiso-area').value = persona.area;
            }
        });
    }
}

function configurarCriteriosMedicamentos() {
    const medicamentoSelect = document.getElementById('medicamento');
    if (!medicamentoSelect) return;

    // Agregar opciones de criterios específicos al final de la lista de medicamentos
    const criterios = [
        { value: 'criterio_colicos', text: '💊TRATAMIENTO CÓLICOS (BUSCAPINA + KETEROLACO)' },
        { value: 'criterio_muscular', text: '💪TRATAMIENTO MUSCULAR (IBUPROFENO + TRIBEDOCE)' },
        { value: 'criterio_gripe', text: '🤧TRATAMIENTO GRIPE (DESENFRIOL-D + IBUPROFENO + LORATADINA)' },
        { value: 'criterio_colitis', text: '🤢TRATAMIENTO COLITIS (BUSCAPINA + OMEPRAZOL)' },
        { value: 'criterio_inyectado', text: '💉MEDICAMENTO INYECTADO (DEXAMETASONA + KETEROLACO)' }
    ];

    // Separador
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '────────── TRATAMIENTOS ESPECIALES ──────────';
    medicamentoSelect.appendChild(separator);

    // Agregar criterios
    criterios.forEach(criterio => {
        const option = document.createElement('option');
        option.value = criterio.value;
        option.textContent = criterio.text;
        medicamentoSelect.appendChild(option);
    });

    // Configurar el evento para almacenar el criterio seleccionado
    medicamentoSelect.addEventListener('change', function() {
        const valor = this.value;
        if (valor.startsWith('criterio_')) {
            criterioSeleccionado = valor;
            // Mostrar información del criterio seleccionado
            const infoDiv = document.getElementById('criterio-info');
            if (infoDiv) {
                const nombresCriterios = {
                    'criterio_colicos': 'Cólicos',
                    'criterio_muscular': 'Muscular',
                    'criterio_gripe': 'Gripe',
                    'criterio_colitis': 'Colitis',
                    'criterio_inyectado': 'Medicamento inyectado'
                };
                infoDiv.innerHTML = `<div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>Tratamiento seleccionado:</strong> ${nombresCriterios[valor]}<br>
                    <small>Se descontarán los medicamentos al guardar la consulta</small>
                </div>`;
                infoDiv.style.display = 'block';
            }
        } else {
            criterioSeleccionado = null;
            const infoDiv = document.getElementById('criterio-info');
            if (infoDiv) {
                infoDiv.style.display = 'none';
            }
        }
    });
}

// Función mejorada para buscar medicamentos de forma flexible
function buscarMedicamentoFlexible(nombreBuscado) {
    if (!nombreBuscado) return null;
    
    const nombreLimpio = nombreBuscado.toString().toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    let medicamento = medicamentosData.find(med => 
        med.nombre.toLowerCase().trim() === nombreLimpio
    );
    
    if (medicamento) return medicamento;
    
    // Buscar coincidencia parcial (que contenga el texto)
    medicamento = medicamentosData.find(med => 
        med.nombre.toLowerCase().includes(nombreLimpio)
    );
    
    if (medicamento) return medicamento;
    
    // Buscar por similitud (eliminando caracteres especiales y espacios)
    const nombreNormalizado = nombreLimpio.replace(/[^a-z0-9]/g, '');
    medicamento = medicamentosData.find(med => {
        const medNormalizado = med.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
        return medNormalizado.includes(nombreNormalizado);
    });
    
    return medicamento || null;
}

async function aplicarCriterioMedicamentos(criterio) {
    const criteriosMedicamentos = {
        'criterio_colicos': ['BUSCAPINA', 'KETEROLACO'],
        'criterio_muscular': ['IBUPROFENO', 'TRIBEDOCE'],
        'criterio_gripe': ['DESENFRIOL-D', 'IBUPROFENO', 'LORATADINA'],
        'criterio_colitis': ['BUSCAPINA', 'OMEPRAZOL'],
        'criterio_inyectado': ['DEXAMETASONA GOTAS OCULARES', 'KETEROLACO']
    };

    const nombresCriterios = {
        'criterio_colicos': 'Cólicos',
        'criterio_muscular': 'Muscular',
        'criterio_gripe': 'Gripe',
        'criterio_colitis': 'Colitis',
        'criterio_inyectado': 'Medicamento inyectado'
    };

    const medicamentosAConsumir = criteriosMedicamentos[criterio];
    const nombreCriterio = nombresCriterios[criterio];
    
    if (medicamentosAConsumir) {
        try {
            let exitosos = 0;
            let fallidos = [];
            
            // Descontar cada medicamento con búsqueda flexible
            for (const nombreMedicamento of medicamentosAConsumir) {
                const medicamento = buscarMedicamentoFlexible(nombreMedicamento);
                
                if (medicamento) {
                    const success = await descontarMedicamento(medicamento.nombre, 1);
                    if (success) {
                        exitosos++;
                    } else {
                        fallidos.push(nombreMedicamento);
                    }
                } else {
                    fallidos.push(nombreMedicamento);
                }
            }
            
            // Actualizar la interfaz
            renderizarInventario();
            
            // Mostrar resultado
            if (fallidos.length === 0) {
                alert(`✅ Tratamiento aplicado para: ${nombreCriterio}\nSe descontó 1 unidad de ${exitosos} medicamentos`);
            } else {
                alert(`⚠️ Tratamiento parcialmente aplicado\n✅ Exitoso: ${exitosos} medicamentos\n❌ No encontrados: ${fallidos.join(', ')}`);
            }
            
        } catch (error) {
            console.error('Error al aplicar criterio:', error);
            alert('Error al aplicar el tratamiento automático');
        }
    }
}

function processData(data, headers) {
    return data.map(row => {
        const item = {};
        headers.forEach((header, index) => {
            const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            item[key] = row[index] || '';
        });
        return item;
    });
}

function actualizarTablaConsultas() {
    const tableContainer = document.getElementById('consultas-table-container');
    if (!tableContainer) return;
    
    // Crear contenedor de filtros
    const filterContainer = document.createElement('div');
    filterContainer.className = 'table-filter-container';
    
    // Botón para resetear filtros
    const resetButton = document.createElement('button');
    resetButton.className = 'filter-reset-btn';
    resetButton.textContent = 'Resetear Filtros';
    resetButton.onclick = () => {
        document.querySelectorAll('.table-filter').forEach(filter => {
            filter.value = '';
        });
        filterTable();
    };
    
    // Crear tabla
    const table = document.createElement('table');
    table.className = 'filterable-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    
    // Limpiar contenedor
    tableContainer.innerHTML = '';
    
    // Crear encabezados y filtros
    sheetsConfig.consultas.headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.className = 'filter-header';
        th.textContent = header;
        
        // Crear input de filtro
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'table-filter';
        filterInput.placeholder = `🔻​${header}`;
        filterInput.dataset.columnIndex = index;
        filterInput.addEventListener('input', filterTable);
        
        // Contenedor para el filtro
        const filterDiv = document.createElement('div');
        filterDiv.style.position = 'absolute';
        filterDiv.style.top = '5px';
        filterDiv.style.left = '0';
        filterDiv.style.width = '100%';
        filterDiv.style.padding = '0 15px';
        filterDiv.style.boxSizing = 'border-box';
        
        filterDiv.appendChild(filterInput);
        th.appendChild(filterDiv);
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    
    // Función para filtrar la tabla
    function filterTable() {
        const filters = Array.from(document.querySelectorAll('.table-filter')).map(input => input.value.toLowerCase());
        
        tbody.innerHTML = '';
        
        consultas.forEach(consulta => {
            const rowData = sheetsConfig.consultas.headers.map(header => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                return String(consulta[key] || '').toLowerCase();
            });
            
            const shouldShow = filters.every((filter, index) => {
                return rowData[index].includes(filter);
            });
            
            if (shouldShow) {
                const row = document.createElement('tr');
                
                sheetsConfig.consultas.headers.forEach(header => {
                    const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    const cell = document.createElement('td');
                    
                    if (header === 'FECHA Y HORA') {
                        cell.textContent = new Date(consulta[key]).toLocaleString();
                    } else if (header === 'Tº') {
                        cell.textContent = consulta[key] ? `${consulta[key]}°C` : '';
                    } else if (header === 'OXIMETRO') {
                        cell.textContent = consulta[key] ? `${consulta[key]}%` : '';
                    } else {
                        cell.textContent = consulta[key] || '';
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            }
        });
    }
    
    // Agregar elementos al DOM
    filterContainer.appendChild(resetButton);
    tableContainer.appendChild(filterContainer);
    tableContainer.appendChild(table);
    
    // Renderizar datos iniciales
    filterTable();
}

function renderizarInventario() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const medicamentoSelect = document.getElementById('medicamento');
    const requestArticleSelect = document.getElementById('request-article');
    const addMedicamentoSelect = document.getElementById('add-medicamento');
    
    if (medicamentoSelect) {
        medicamentoSelect.innerHTML = '<option value="">Seleccionar medicamento</option>';
    }
    
    if (requestArticleSelect) {
        requestArticleSelect.innerHTML = '<option value="">Seleccionar medicamento</option>';
    }

    if (addMedicamentoSelect) {
        addMedicamentoSelect.innerHTML = '<option value="">Seleccionar medicamento</option>';
    }

    medicamentosData.forEach(med => {
        const card = document.createElement('div');
        card.className = `inventory-card ${med.unidades <= 10 ? 'low-stock-card' : ''}`;
       
        const fechaCaducidad = new Date(med.fecha_de_caducidad);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const isVencido = fechaCaducidad <= hoy;

        card.innerHTML = `
            <div class="medication-image">
                <img src="${med.imagen}" alt="${med.nombre}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <h3>${med.nombre} ${med.mg}</h3>
            <div class="medication-details">
                <div class="detail-row">
                    <span>Cantidad por caja:</span>
                    <span class="detail-value">${med.cantidad_por_caja}</span>
                </div>
                <div class="detail-row">
                    <span>Stock (cajas):</span>
                    <span class="detail-value">${med.stock}</span>
                </div>
                <div class="detail-row">
                    <span>Unidades totales:</span>
                    <span class="detail-value ${med.unidades <= 10 ? 'low-stock' : ''}">${med.unidades}</span>
                </div>
                <div class="detail-row">
                    <span>Fecha de caducidad:</span>
                    <span class="detail-value ${isVencido ? 'expired' : ''}">${fechaCaducidad.toLocaleDateString()}</span>
                </div>
            </div>
            <div class="medication-actions">
                <button class="buy-button" onclick="openRequestModal('${med.nombre}')">
                    Solicitar
                </button>
                ${isVencido ? `<button class="remove-button" onclick="mostrarModalRetirarMedicamento('${med.nombre}')">🗑️ Retirar</button>` : ''}
            </div>
            ${med.unidades <= 10 ? '<div class="stock-warning">⚠️ STOCK BAJO</div>' : ''}
            ${isVencido ? '<div class="expired-warning">❌ VENCIDO</div>' : ''}
        `;
        grid.appendChild(card);

        if (medicamentoSelect) {
            const option = document.createElement('option');
            option.value = med.nombre;
            option.textContent = `${med.nombre} ${med.mg}`;
            medicamentoSelect.appendChild(option);
        }

        if (requestArticleSelect) {
            const option = document.createElement('option');
            option.value = `${med.nombre} ${med.mg}`;
            option.textContent = `${med.nombre} ${med.mg}`;
            requestArticleSelect.appendChild(option);
        }

        if (addMedicamentoSelect) {
            const option = document.createElement('option');
            option.value = med.nombre;
            option.textContent = `${med.nombre} ${med.mg}`;
            addMedicamentoSelect.appendChild(option);
        }
    });

    // Volver a configurar los criterios después de renderizar
    configurarCriteriosMedicamentos();

    verificarMedicamentosVencidos();
}

async function cargarEstadoConsultorio() {
    try {
        const estadoData = await fetchData(sheetsConfig.estado, {
            action: 'get',
            range: 'B1'
        });
        
        if (estadoData && estadoData.length > 0 && estadoData[0].length > 0) {
            estadoConsultorio = estadoData[0][0] || 'ACTIVO';
        }
    } catch (error) {
        console.error("Error al cargar estado del consultorio:", error);
    }
}

function actualizarEstadoConsultorioUI() {
    const toggle = document.getElementById('consultorio-toggle');
    if (!toggle) return;
    
    const slider = toggle.querySelector('.toggle-slider');
    const labels = document.querySelectorAll('.status-label');

    toggle.classList.remove('active', 'closed');
    labels.forEach(label => label.classList.remove('active', 'closed'));

    if (estadoConsultorio === "ACTIVO") {
        toggle.classList.add('active');
        labels[0]?.classList.add('active');
        if (slider) slider.textContent = "ACTIVO";
    } else {
        toggle.classList.add('closed');
        labels[1]?.classList.add('closed');
        if (slider) slider.textContent = "CERRADO";
    }
}

async function toggleConsultorio() {
    if (!verificarCredenciales()) return;
    
    estadoConsultorio = estadoConsultorio === "ACTIVO" ? "CERRADO" : "ACTIVO";

    try {
        await guardarEnSheets(sheetsConfig.estado, { estado: estadoConsultorio });
        actualizarEstadoConsultorioUI();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        alert("Error al actualizar el estado del consultorio");
    }
}

async function descontarMedicamento(nombreMedicamento, dosis) {
    try {
        // Buscar medicamento de forma flexible
        const medicamento = buscarMedicamentoFlexible(nombreMedicamento);
        
        if (!medicamento) {
            alert(`Medicamento "${nombreMedicamento}" no encontrado en el inventario`);
            return false;
        }

        if (medicamento.unidades < dosis) {
            alert(`No hay suficiente stock de ${medicamento.nombre}. Disponible: ${medicamento.unidades} unidades`);
            return false;
        }

        medicamento.unidades -= dosis;
        medicamento.stock = Math.floor(medicamento.unidades / medicamento.cantidad_por_caja);

        const updateData = {
            accion: 'DESCONTAR',
            nombre: medicamento.nombre,
            dosis: dosis
        };

        await guardarEnSheets(sheetsConfig.inventario, updateData);
        
        renderizarInventario();
        
        if (medicamento.unidades <= 10) {
            enviarSolicitudCompra(medicamento);
        }
        
        return true;
    } catch (error) {
        console.error("Error al descontar medicamento:", error);
        alert("Error al actualizar el inventario. Por favor intente nuevamente.");
        return false;
    }
}

function verificarMedicamentosVencidos() {
    if (vencimientoAlertShown) return;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencidos = medicamentosData.filter(med => {
        const fechaCaducidad = new Date(med.fecha_de_caducidad);
        return fechaCaducidad <= hoy;
    });

    if (vencidos.length > 0) {
        const medicamentosList = vencidos.map(med => `${med.nombre} (${new Date(med.fecha_de_caducidad).toLocaleDateString()})`).join('\n');
        alert(`⚠️ Medicamentos vencidos:\n\n${medicamentosList}\n\nPor favor retírelos del inventario.`);
        vencimientoAlertShown = true;
    }
}

// --- funciones principales del modal de consultas ---
function openConsultaModal() {
    if (!verificarCredenciales()) return;

    document.getElementById('consulta-modal').classList.add('show');
    
    // SOLO MODIFICACIÓN: Usar la función helper para obtener la hora local correcta
    document.getElementById('fecha-hora').value = getLocalDatetimeForInput();
    
    // Crear div para mostrar información del criterio si no existe
    if (!document.getElementById('criterio-info')) {
        const infoDiv = document.createElement('div');
        infoDiv.id = 'criterio-info';
        infoDiv.style.display = 'none';
        infoDiv.style.margin = '10px 0';
        const medicamentoGroup = document.querySelector('.form-group:has(#medicamento)');
        if (medicamentoGroup) {
            medicamentoGroup.parentNode.insertBefore(infoDiv, medicamentoGroup.nextSibling);
        }
    }
    
    // Resetear criterio seleccionado
    criterioSeleccionado = null;
}

function closeConsultaModal() {
    document.getElementById('consulta-modal').classList.remove('show');
    document.getElementById('consulta-form').reset();
    
    // Ocultar información del criterio
    const infoDiv = document.getElementById('criterio-info');
    if (infoDiv) {
        infoDiv.style.display = 'none';
    }
    
    // Resetear criterio seleccionado
    criterioSeleccionado = null;
}

// Registramos el listener cuando el DOM esté listo para evitar problemas en Vercel/SSR
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('consulta-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
       
        const formData = {
            fecha_y_hora: document.getElementById('fecha-hora').value,
            nombre: document.getElementById('nombre').value,
            area: document.getElementById('area').value,
            operacion: document.getElementById('operacion').value,
            tipo_de_consulta_interna_externa: document.getElementById('tipo-consulta').value,
            sintomas: document.getElementById('sintomas').value,
            diagnostico: document.getElementById('diagnostico').value,
            medicamento: document.getElementById('medicamento').value,
            dosis: parseInt(document.getElementById('dosis').value) || 0,
            t_: parseFloat(document.getElementById('temperatura').value) || 0,
            presion_arterial_alta: parseInt(document.getElementById('presion-alta').value) || 0,
            presion_arterial_baja: parseInt(document.getElementById('presion-baja').value) || 0,
            oximetro: parseInt(document.getElementById('oximetro').value) || 0,
            observaciones: document.getElementById('observaciones').value
        };

        if (!formData.nombre || !formData.tipo_de_consulta_interna_externa || !formData.sintomas || !formData.diagnostico) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            // Aplicar criterio si está seleccionado (solo al guardar)
            if (criterioSeleccionado) {
                await aplicarCriterioMedicamentos(criterioSeleccionado);
            }
            
            // Solo descontar medicamento específico si no es un criterio especial
            if (formData.medicamento && !formData.medicamento.startsWith('criterio_') && formData.dosis > 0) {
                const success = await descontarMedicamento(formData.medicamento, formData.dosis);
                if (!success) return;
            }

            await guardarEnSheets(sheetsConfig.consultas, formData);
            consultas.push(formData);
            actualizarTablaConsultas();
            closeConsultaModal();
            alert('Consulta registrada exitosamente');
        } catch (error) {
            console.error("Error al guardar consulta:", error);
            alert('Error al guardar la consulta. Por favor intente nuevamente.');
        }
    });
});

function openRequestModal(nombreMedicamento) {
    selectedMedForRequest = medicamentosData.find(med => med.nombre === nombreMedicamento);
    
    if (!selectedMedForRequest) {
        console.error('Medicamento no encontrado:', nombreMedicamento);
        alert('Error: Medicamento no encontrado en el inventario');
        return;
    }
    
    document.getElementById('request-modal').classList.add('show');
    document.getElementById('request-date').value = getLocalDatetimeForInput();
    document.getElementById('request-article').value = `${selectedMedForRequest.nombre} ${selectedMedForRequest.mg}`;
}

function closeRequestModal() {
    document.getElementById('request-modal').classList.remove('show');
    selectedMedForRequest = null;
}

async function submitRequest() {
    try {
        const fechaHora = document.getElementById('request-date').value;
        const articulo = document.getElementById('request-article').value;
        const cantidad = parseInt(document.getElementById('request-quantity').value) || 0;
        const unidad = document.getElementById('request-unit').value;
        
        if (!fechaHora || !articulo || isNaN(cantidad) || cantidad <= 0 || !unidad) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }
        
        const requestData = {
            fecha_y_hora: fechaHora,
            articulo: articulo,
            qty: cantidad,
            unidad: unidad
        };
        
        await guardarEnSheets(sheetsConfig.flujo, requestData);
        closeRequestModal();
        alert(`Solicitud de ${articulo} enviada correctamente`);
    } catch (error) {
        console.error("Error al enviar solicitud:", error);
        alert(`Error al enviar la solicitud: ${error.message}`);
    }
}

function closeRemoveMedModal() {
    document.getElementById('remove-med-modal').classList.remove('show');
    selectedMedForRemoval = null;
}

function mostrarModalRetirarMedicamento(nombreMedicamento = null) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const medicamentosVencidos = medicamentosData.filter(med => {
        try {
            const fechaCaducidad = new Date(med.fecha_de_caducidad);
            return fechaCaducidad <= hoy;
        } catch (e) {
            console.error("Error al parsear fecha:", med.fecha_de_caducidad);
            return false;
        }
    });
    
    if (medicamentosVencidos.length === 0) {
        alert("No hay medicamentos vencidos para retirar");
        return;
    }
    
    const optionsHTML = medicamentosVencidos.map(med => {
        const fechaCaducidad = new Date(med.fecha_de_caducidad);
        return `
            <option value="${med.nombre}" ${nombreMedicamento && med.nombre === nombreMedicamento ? 'selected' : ''}>
                ${med.nombre} ${med.mg} - Vence: ${fechaCaducidad.toLocaleDateString()} - Unidades: ${med.unidades}
            </option>
        `;
    }).join('');
    
    document.getElementById('remove-med-content').innerHTML = `
        <div class="form-group">
            <label class="form-label">Medicamento vencido:</label>
            <select id="select-med-vencido" class="form-input">
                ${optionsHTML}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Unidades a retirar:</label>
            <input type="number" id="remove-cantidad" class="form-input" min="1" value="1">
        </div>
        <div style="text-align: center; margin-top: 1.5rem;">
            <button onclick="confirmRemoveMed()" class="add-button" style="background: var(--red-600);">Confirmar Retiro</button>
        </div>
    `;
    
    if (nombreMedicamento) {
        selectedMedForRemoval = medicamentosData.find(med => med.nombre === nombreMedicamento);
    } else {
        selectedMedForRemoval = medicamentosVencidos[0];
    }
    
    const cantidadInput = document.getElementById('remove-cantidad');
    if (cantidadInput && selectedMedForRemoval) {
        cantidadInput.max = selectedMedForRemoval.unidades;
    }
    
    document.getElementById('select-med-vencido').addEventListener('change', function() {
        const nombreMed = this.value;
        selectedMedForRemoval = medicamentosData.find(med => med.nombre === nombreMed);
        document.getElementById('remove-cantidad').max = selectedMedForRemoval.unidades;
    });
    
    document.getElementById('remove-med-modal').classList.add('show');
}

async function confirmRemoveMed() {
    try {
        if (!selectedMedForRemoval || !selectedMedForRemoval.nombre) {
            alert("Error: No se ha seleccionado ningún medicamento");
            return false;
        }
        
        const inputCantidad = document.getElementById('remove-cantidad');
        if (!inputCantidad) {
            alert("Error: No se encontró el campo de cantidad");
            return false;
        }
        
        const unidadesARetirar = parseInt(inputCantidad.value);
        
        if (isNaN(unidadesARetirar) || unidadesARetirar <= 0) {
            alert('Por favor ingrese una cantidad válida (mayor que cero)');
            return false;
        }
        
        if (unidadesARetirar > selectedMedForRemoval.unidades) {
            alert(`No hay suficientes unidades. Disponibles: ${selectedMedForRemoval.unidades}`);
            return false;
        }
        
        const index = medicamentosData.findIndex(med => med.nombre === selectedMedForRemoval.nombre);
        if (index === -1) {
            alert('Error: Medicamento no encontrado en el inventario');
            return false;
        }
        
        const updateData = {
            accion: 'delete',
            nombre: selectedMedForRemoval.nombre,
            cantidad: unidadesARetirar
        };

        const flujoData = {
            fecha_y_hora: new Date().toISOString(),
            articulo: `${selectedMedForRemoval.nombre} ${selectedMedForRemoval.mg}`,
            qty: unidadesARetirar,
            unidad: 'unidades'
        };
        
        await Promise.all([
            guardarEnSheets(sheetsConfig.inventario, updateData),
            guardarEnSheets(sheetsConfig.flujo, flujoData)
        ]);
        
        medicamentosData[index].unidades -= unidadesARetirar;
        medicamentosData[index].stock = Math.floor(
            medicamentosData[index].unidades / 
            medicamentosData[index].cantidad_por_caja
        );
        
        if (medicamentosData[index].unidades <= 0) {
            medicamentosData.splice(index, 1);
        }
        
        renderizarInventario();
        closeRemoveMedModal();
        
        alert(`${unidadesARetirar} unidades de ${selectedMedForRemoval.nombre} retiradas correctamente`);
        return true;
        
    } catch (error) {
        console.error("Error al retirar medicamento:", {
            error: error.message,
            medicamento: selectedMedForRemoval,
            stack: error.stack
        });
        alert("Error al retirar el medicamento. Por favor intente nuevamente.");
        return false;
    }
}

function openAddStockModal() {
    if (!verificarCredenciales()) return;
    
    document.getElementById('add-stock-modal').classList.add('show');
    document.getElementById('add-medicamento').innerHTML = '<option value="">Seleccionar medicamento</option>';
    
    medicamentosData.forEach(med => {
        const option = document.createElement('option');
        option.value = med.nombre;
        option.textContent = `${med.nombre} ${med.mg}`;
        document.getElementById('add-medicamento').appendChild(option);
    });
    
    document.getElementById('add-cantidad').value = '1';
    document.getElementById('add-fecha-caducidad').value = '';
}

function closeAddStockModal() {
    document.getElementById('add-stock-modal').classList.remove('show');
}

document.getElementById('add-stock-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const medicamentoNombre = document.getElementById('add-medicamento').value;
    const cantidadCajas = parseInt(document.getElementById('add-cantidad').value) || 0;
    const fechaCaducidad = document.getElementById('add-fecha-caducidad').value;
    
    if (!medicamentoNombre || isNaN(cantidadCajas) || cantidadCajas <= 0 || !fechaCaducidad) {
        alert('Por favor complete todos los campos correctamente');
        return;
    }
    
    const medicamento = medicamentosData.find(med => med.nombre === medicamentoNombre);
    if (!medicamento) {
        alert('Medicamento no encontrado');
        return;
    }
    
    const unidadesPorCaja = medicamento.cantidad_por_caja || 1;
    const unidadesAAgregar = cantidadCajas * unidadesPorCaja;
    
    try {
        const updateData = {
            accion: 'AGREGAR_STOCK',
            nombre: medicamento.nombre,
            stock: cantidadCajas,
            fecha_caducidad: fechaCaducidad
        };
        
        const result = await guardarEnSheets(sheetsConfig.inventario, updateData);
        
        if (result.success) {
            medicamento.stock += cantidadCajas;
            medicamento.unidades += unidadesAAgregar;
            medicamento.fecha_de_caducidad = fechaCaducidad;
            
            renderizarInventario();
            closeAddStockModal();
            alert(`Se agregaron ${cantidadCajas} cajas (${unidadesAAgregar} unidades) de ${medicamento.nombre}\nNuevo stock: ${medicamento.stock} cajas (${medicamento.unidades} unidades)`);
        } else {
            throw new Error(result.error || 'Error al guardar');
        }
    } catch (error) {
        console.error("Error al agregar stock:", error);
        alert("Error al agregar stock. Por favor intente nuevamente.");
    }
});

function enviarSolicitudCompra(medicamento) {
    const asunto = `Solicitud de compra urgente: ${medicamento.nombre}`;
    const mensaje = `
        Se requiere compra urgente del siguiente medicamento:
        
        Medicamento: ${medicamento.nombre} ${medicamento.mg}
        Stock actual: ${medicamento.stock} cajas (${medicamento.unidades} unidades)
        
        El stock ha bajado del nivel mínimo recomendado.
        
        Fecha: ${new Date().toLocaleString()}
    `;
    
    const url = new URL(sheetsConfig.inventario.scriptUrl);
    url.searchParams.append('action', 'sendEmail');
    url.searchParams.append('to', 'ricardoruizcastillo1@gmail.com');
    url.searchParams.append('subject', asunto);
    url.searchParams.append('body', mensaje);
    
    fetch(url.toString()).catch(error => console.error("Error al enviar solicitud:", error));
}

function openPermisoModal() {
    if (!verificarCredenciales()) return;
    
    document.getElementById('permiso-modal').classList.add('show');
    document.getElementById('permiso-fecha').valueAsDate = new Date();
    document.getElementById('permiso-hora').value = new Date().toTimeString().substring(0, 5);
}

function closePermisoModal() {
    document.getElementById('permiso-modal').classList.remove('show');
    document.getElementById('permiso-form').reset();
}

document.getElementById('permiso-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('permiso-nombre').value;
    const numero = document.getElementById('permiso-numero').value;
    const area = document.getElementById('permiso-area').value;
    const fecha = document.getElementById('permiso-fecha').value;
    const hora = document.getElementById('permiso-hora').value;
    const comentarios = document.getElementById('permiso-comentarios').value;

    if (!nombre || !fecha || !hora) {
        alert('Por favor complete los campos requeridos (Nombre, Fecha y Hora)');
        return;
    }

    try {
        await guardarEnSheets(sheetsConfig.permisos, {
            accion: 'ACTUALIZAR_PERMISO',
            nombre: nombre,
            numero: numero,
            area: area,
            fecha: fecha,
            hora: hora,
            comentarios: comentarios
        });

        alert('Pase médico generado correctamente');
        
        closePermisoModal();
        
        document.getElementById('print-nombre').textContent = nombre;
        document.getElementById('print-numero').textContent = numero || 'N/A';
        document.getElementById('print-area').textContent = area;
        document.getElementById('print-fecha-hora').textContent = `${new Date(fecha).toLocaleDateString()} ${hora}`;
        document.getElementById('print-comentarios').textContent = comentarios || 'Ninguno';
        document.getElementById('print-permiso').textContent = `PERMISO DE SALIDA ${hora}`;

        document.getElementById('print-section').style.display = 'block';
    } catch (error) {
        console.error("Error al guardar permiso:", error);
        alert('Error al generar el permiso. Por favor intente nuevamente.');
    }
});

function imprimirPermiso() {
    try {
        // Configuración de la hoja específica
        const spreadsheetId = "1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q";
        const sheetName = "PASE MEDICO";
        const gid = "724084909";
        
        // URL directa al PDF de impresión
        const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=${gid}&portrait=true&fitw=true`;
        
        // Abrir el PDF en una nueva ventana para imprimir
        const printWindow = window.open(pdfUrl, '_blank');
        
        // Si el navegador bloquea la ventana emergente
        if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
            // Alternativa: abrir en la misma ventana
            window.location.href = pdfUrl;
            
            // Mostrar mensaje al usuario
            alert("Por favor habilite las ventanas emergentes para este sitio. O imprima el documento que se ha abierto.");
        } else {
            // Pequeño retraso para asegurar que el PDF se cargue
            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (printError) {
                    console.error("Error al imprimir:", printError);
                    // Alternativa si falla el print()
                    printWindow.close();
                    window.location.href = pdfUrl;
                }
            }, 2000);
        }
    } catch (error) {
        console.error("Error en imprimirPermiso:", error);
        alert("Error al preparar el pase médico para impresión. Por favor intente nuevamente.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!verificarCredenciales()) return;
    
    cargarDatosDesdeSheets();
    
    document.getElementById('consultorio-toggle')?.addEventListener('click', toggleConsultorio);
    
    setInterval(verificarMedicamentosVencidos, 3600000);
});

window.showSection = showSection;
window.openConsultaModal = openConsultaModal;
window.closeConsultaModal = closeConsultaModal;
window.toggleConsultorio = toggleConsultorio;
window.openRequestModal = openRequestModal;
window.closeRequestModal = closeRequestModal;
window.submitRequest = submitRequest;
window.mostrarModalRetirarMedicamento = mostrarModalRetirarMedicamento;
window.closeRemoveMedModal = closeRemoveMedModal;
window.confirmRemoveMed = confirmRemoveMed;
window.openAddStockModal = openAddStockModal;
window.closeAddStockModal = closeAddStockModal;
window.openPermisoModal = openPermisoModal;
window.closePermisoModal = closePermisoModal;
window.imprimirPermiso = imprimirPermiso;
