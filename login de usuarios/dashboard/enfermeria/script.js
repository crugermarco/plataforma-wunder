const sheetsConfig = {
    consultas: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzxK22mOK5Bwa5RCNUmz9HQgFyBwfAGeGtHn7jcri7PC64MHkMHRIHLGBlS_JgkWcS-/exec',
        spreadsheetId: '1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q',
        sheetName: 'REPORTE DE CONSULTA',
        headers: [
            'FECHA Y HORA', 'NOMBRE', 'AREA', 'OPERACION',
            'TIPO DE CONSULTA', 'SINTOMAS',
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
        spreadsheetId: '1jO4KTH6X7NVslzTXQqMcrSa5XzFifBOMBTYduSMtJQE',
        sheetName: 'DATA',
        headers: [
            'NOMBRE', 'GAFETE', 'FECHA DE INGRESO', 'NUMERO DE EMPLEADO', 'AREA', 'AÑOS', 'DIAS DE VACACIONES'
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
let criterioSeleccionado = null;
let filteredConsultas = [];
let filterTimeout = null;

function pad(n) { return n < 10 ? '0' + n : String(n); }

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
    alert("No cuentas con el permiso para este apartado");
    document.querySelectorAll('.content-section, .nav-item').forEach(el => el.style.display = 'none');
}

function showSection(sectionId) {
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
        
        const activeButton = document.querySelector(`.nav-item[onclick*="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        if (sectionId === 'consultas') {
            setTimeout(() => {
                inicializarFiltros();
            }, 100);
        } else if (sectionId === 'inventario') {
            renderizarInventario();
        }
    } catch (error) {
        console.error("Error en showSection:", error);
    }
}

async function fetchData(config, params = {}) {
    try {
        const url = new URL(config.scriptUrl);
        
        url.searchParams.append('spreadsheetId', config.spreadsheetId);
        url.searchParams.append('sheetName', config.sheetName);
        
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        }
        
        url.searchParams.append('timestamp', Date.now());
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error en la respuesta del servidor');
        }
        
        return result.data || [];
    } catch (error) {
        console.error("Error en fetchData:", error);
        return [];
    }
}

async function guardarEnSheets(config, data) {
    try {
        const url = new URL(config.scriptUrl);
        
        const formData = new URLSearchParams();
        formData.append('spreadsheetId', config.spreadsheetId);
        formData.append('sheetName', config.sheetName);
        formData.append('data', JSON.stringify(data));
        
        if (data.accion) {
            formData.append('action', data.accion);
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
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
        console.log('Cargando datos desde Sheets...');
        
        consultas = [];
        medicamentosData = [];
        personalData = [];

        const consultasData = await fetchData(sheetsConfig.consultas, {
            range: 'A2:N'
        });
        
        if (consultasData && consultasData.length > 0) {
            consultas = processData(consultasData, sheetsConfig.consultas.headers);
            filteredConsultas = [...consultas];
        }

        const inventarioData = await fetchData(sheetsConfig.inventario, {
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
            range: 'A2:G'
        });
        
        if (personalDataResponse && personalDataResponse.length > 0) {
            personalData = personalDataResponse.map(row => ({
                nombre: row[0] || '',
                gafete: row[1] || '',
                numero_empleado: row[3] || '',
                area: row[4] || ''
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

        console.log('Datos cargados exitosamente');
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
                document.getElementById('permiso-numero').value = persona.numero_empleado;
            }
        });
    }
    
    const permisoDatalist = document.getElementById('nombres-list');
    if (permisoDatalist) {
        personalData.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.nombre;
            permisoDatalist.appendChild(option);
        });
    }
}

function configurarCriteriosMedicamentos() {
    const medicamentoSelect = document.getElementById('medicamento');
    if (!medicamentoSelect) return;

    const criterios = [
        { value: 'criterio_colicos', text: '💊 TRATAMIENTO CÓLICOS (BUSCAPINA + KETEROLACO)' },
        { value: 'criterio_muscular', text: '💪 TRATAMIENTO MUSCULAR (IBUPROFENO + TRIBEDOCE)' },
        { value: 'criterio_gripe', text: '🤧 TRATAMIENTO GRIPE (DESENFRIOL-D + IBUPROFENO + LORATADINA)' },
        { value: 'criterio_colitis', text: '🤢 TRATAMIENTO COLITIS (BUSCAPINA + OMEPRAZOL)' },
        { value: 'criterio_inyectado', text: '💉 MEDICAMENTO INYECTADO (DEXAMETASONA + KETEROLACO)' }
    ];

    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '────────── TRATAMIENTOS ESPECIALES ──────────';
    medicamentoSelect.appendChild(separator);

    criterios.forEach(criterio => {
        const option = document.createElement('option');
        option.value = criterio.value;
        option.textContent = criterio.text;
        medicamentoSelect.appendChild(option);
    });

    medicamentoSelect.addEventListener('change', function() {
        const valor = this.value;
        if (valor.startsWith('criterio_')) {
            criterioSeleccionado = valor;
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

function buscarMedicamentoFlexible(nombreBuscado) {
    if (!nombreBuscado) return null;
    
    const nombreLimpio = nombreBuscado.toString().toLowerCase().trim();
    
    let medicamento = medicamentosData.find(med => 
        med.nombre.toLowerCase().trim() === nombreLimpio
    );
    
    if (medicamento) return medicamento;
    
    medicamento = medicamentosData.find(med => 
        med.nombre.toLowerCase().includes(nombreLimpio)
    );
    
    if (medicamento) return medicamento;
    
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
            
            renderizarInventario();
            
            if (fallidos.length === 0) {
                alert(`Tratamiento aplicado para: ${nombreCriterio}\nSe descontó 1 unidad de ${exitosos} medicamentos`);
            } else {
                alert(`Tratamiento parcialmente aplicado\nExitoso: ${exitosos} medicamentos\nNo encontrados: ${fallidos.join(', ')}`);
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

function filterTable() {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
    
    filterTimeout = setTimeout(() => {
        const filterInputs = document.querySelectorAll('.table-filter');
        const filters = Array.from(filterInputs).map(input => 
            input ? input.value.toLowerCase().trim() : ''
        );
        
        console.log('Filtros aplicados:', filters);
        
        if (filters.every(filter => filter === '')) {
            filteredConsultas = [...consultas];
        } else {
            filteredConsultas = consultas.filter(consulta => {
                return filters.every((filter, index) => {
                    if (!filter || filter === '') return true;
                    
                    const header = sheetsConfig.consultas.headers[index];
                    if (!header) return true;
                    
                    const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    const cellValue = String(consulta[key] || '').toLowerCase().trim();
                    
                    return cellValue.includes(filter);
                });
            });
        }
        
        console.log('Resultados filtrados:', filteredConsultas.length);
        actualizarContenidoTabla();
    }, 300);
}

function actualizarContenidoTabla() {
    const tbody = document.querySelector('#consultas-table-container .filterable-table tbody');
    if (!tbody) {
        console.error('No se encontró el tbody de la tabla');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (filteredConsultas.length > 0) {
        filteredConsultas.forEach(consulta => {
            const row = document.createElement('tr');
            
            sheetsConfig.consultas.headers.forEach(header => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                const cell = document.createElement('td');
                
                if (header === 'FECHA Y HORA') {
                    try {
                        const fecha = new Date(consulta[key]);
                        cell.textContent = fecha.toLocaleString('es-MX');
                    } catch (e) {
                        cell.textContent = consulta[key] || '';
                    }
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
        });
    } else {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = sheetsConfig.consultas.headers.length;
        emptyCell.textContent = consultas.length === 0 
            ? 'No hay consultas registradas' 
            : 'No se encontraron consultas con los filtros aplicados';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '40px';
        emptyCell.style.color = '#94a3b8';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    }
}

function actualizarTablaConsultas() {
    const tableContainer = document.getElementById('consultas-table-container');
    if (!tableContainer) {
        console.error('No se encontró el contenedor de la tabla');
        return;
    }
    
    tableContainer.innerHTML = '';
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'table-filter-container';
    
    const exportButton = document.createElement('button');
    exportButton.className = 'export-excel-btn';
    exportButton.innerHTML = '📊 Exportar a Excel';
    exportButton.onclick = exportToExcel;
    
    const resetButton = document.createElement('button');
    resetButton.className = 'filter-reset-btn';
    resetButton.textContent = 'Resetear Filtros';
    resetButton.onclick = () => {
        const filterInputs = document.querySelectorAll('.table-filter');
        filterInputs.forEach(input => {
            if (input) input.value = '';
        });
        filteredConsultas = [...consultas];
        actualizarContenidoTabla();
    };
    
    const table = document.createElement('table');
    table.className = 'filterable-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    
    sheetsConfig.consultas.headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.className = 'filter-header';
        th.textContent = header;
        
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.className = 'table-filter';
        filterInput.placeholder = `🔍 ${header}`;
        filterInput.dataset.columnIndex = index;
        
        filterInput.addEventListener('input', function(e) {
            e.stopPropagation();
            filterTable();
        });
        
        filterInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterTable();
            }
        });
        
        const filterDiv = document.createElement('div');
        filterDiv.style.position = 'absolute';
        filterDiv.style.top = '10px';
        filterDiv.style.left = '0';
        filterDiv.style.width = 'calc(100% - 24px)';
        filterDiv.style.margin = '0 12px';
        filterDiv.appendChild(filterInput);
        
        th.appendChild(filterDiv);
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    
    if (filteredConsultas.length > 0) {
        filteredConsultas.forEach(consulta => {
            const row = document.createElement('tr');
            
            sheetsConfig.consultas.headers.forEach(header => {
                const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                const cell = document.createElement('td');
                
                if (header === 'FECHA Y HORA') {
                    try {
                        const fecha = new Date(consulta[key]);
                        cell.textContent = fecha.toLocaleString('es-MX');
                    } catch (e) {
                        cell.textContent = consulta[key] || '';
                    }
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
        });
    } else {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = sheetsConfig.consultas.headers.length;
        emptyCell.textContent = consultas.length === 0 
            ? 'No hay consultas registradas' 
            : 'No se encontraron consultas con los filtros aplicados';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '40px';
        emptyCell.style.color = '#94a3b8';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    }
    
    filterContainer.appendChild(exportButton);
    filterContainer.appendChild(resetButton);
    tableContainer.appendChild(filterContainer);
    tableContainer.appendChild(table);
}

function inicializarFiltros() {
    const tableContainer = document.getElementById('consultas-table-container');
    if (tableContainer) {
        const oldFilters = tableContainer.querySelectorAll('.table-filter');
        oldFilters.forEach(filter => {
            const newFilter = filter.cloneNode(true);
            filter.parentNode.replaceChild(newFilter, filter);
        });
    }
    
    actualizarTablaConsultas();
}

function exportToExcel() {
    if (filteredConsultas.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    try {
        if (typeof XLSX === 'undefined') {
            alert('Error: La librería XLSX no está cargada');
            return;
        }
        
        const headers = sheetsConfig.consultas.headers;
        
        const worksheetData = [
            headers,
            ...filteredConsultas.map(consulta => {
                return headers.map(header => {
                    const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    const value = consulta[key] || '';
                    
                    if (header === 'FECHA Y HORA') {
                        try {
                            return new Date(value).toLocaleString('es-MX');
                        } catch (e) {
                            return value;
                        }
                    } else if (header === 'Tº') {
                        return value ? `${value}°C` : '';
                    } else if (header === 'OXIMETRO') {
                        return value ? `${value}%` : '';
                    }
                    
                    return value;
                });
            })
        ];
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        XLSX.utils.book_append_sheet(wb, ws, "Consultas");
        
        const today = new Date();
        const fileName = `consultas_${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al exportar a Excel.');
    }
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

    if (medicamentosData.length === 0) {
        grid.innerHTML = `
            <div class="no-data-message">
                <p>No hay medicamentos en el inventario</p>
            </div>
        `;
        return;
    }

    medicamentosData.forEach(med => {
        const card = document.createElement('div');
        card.className = `inventory-card ${med.unidades <= 10 ? 'low-stock-card' : ''}`;
       
        let isVencido = false;
        if (med.fecha_de_caducidad) {
            try {
                const fechaCaducidad = new Date(med.fecha_de_caducidad);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                isVencido = fechaCaducidad <= hoy;
            } catch (e) {
                console.error('Error al parsear fecha:', med.fecha_de_caducidad);
            }
        }

        card.innerHTML = `
            <div class="medication-image">
                <img src="${med.imagen || 'https://via.placeholder.com/150'}" alt="${med.nombre}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <h3 class="medication-name">${med.nombre} ${med.mg}</h3>
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
                    <span class="detail-value ${isVencido ? 'expired' : ''}">
                        ${med.fecha_de_caducidad ? new Date(med.fecha_de_caducidad).toLocaleDateString() : 'N/A'}
                    </span>
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

    configurarCriteriosMedicamentos();
    verificarMedicamentosVencidos();
}

async function cargarEstadoConsultorio() {
    try {
        const estadoData = await fetchData(sheetsConfig.estado, {
            range: 'B1'
        });
        
        if (estadoData && estadoData.length > 0 && estadoData[0].length > 0) {
            estadoConsultorio = estadoData[0][0] || 'ACTIVO';
        }
    } catch (error) {
        console.error("Error al cargar estado del consultorio:", error);
        estadoConsultorio = "ACTIVO";
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
        await guardarEnSheets(sheetsConfig.estado, { 
            accion: 'update',
            estado: estadoConsultorio 
        });
        actualizarEstadoConsultorioUI();
        alert(`Estado del consultorio actualizado a: ${estadoConsultorio}`);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        alert("Error al actualizar el estado del consultorio");
    }
}

async function descontarMedicamento(nombreMedicamento, dosis) {
    try {
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
        alert("Error al actualizar el inventario.");
        return false;
    }
}

function verificarMedicamentosVencidos() {
    if (vencimientoAlertShown) return;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencidos = medicamentosData.filter(med => {
        if (!med.fecha_de_caducidad) return false;
        try {
            const fechaCaducidad = new Date(med.fecha_de_caducidad);
            return fechaCaducidad <= hoy;
        } catch (e) {
            console.error("Error al parsear fecha:", med.fecha_de_caducidad);
            return false;
        }
    });

    if (vencidos.length > 0) {
        const medicamentosList = vencidos.map(med => {
            try {
                const fecha = new Date(med.fecha_de_caducidad);
                return `${med.nombre} (${fecha.toLocaleDateString()})`;
            } catch (e) {
                return `${med.nombre} (Fecha inválida)`;
            }
        }).join('\n');
        
        alert(`Medicamentos vencidos:\n\n${medicamentosList}\n\nPor favor retírelos del inventario.`);
        vencimientoAlertShown = true;
    }
}

function openConsultaModal() {
    if (!verificarCredenciales()) return;

    document.getElementById('consulta-modal').classList.add('show');
    
    document.getElementById('fecha-hora').value = getLocalDatetimeForInput();
    
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
    
    criterioSeleccionado = null;
}

function closeConsultaModal() {
    document.getElementById('consulta-modal').classList.remove('show');
    document.getElementById('consulta-form').reset();
    
    const infoDiv = document.getElementById('criterio-info');
    if (infoDiv) {
        infoDiv.style.display = 'none';
    }
    
    criterioSeleccionado = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const consultaForm = document.getElementById('consulta-form');
    if (consultaForm) {
        consultaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
           
            const formData = {
                fecha_y_hora: document.getElementById('fecha-hora').value,
                nombre: document.getElementById('nombre').value,
                area: document.getElementById('area').value,
                operacion: document.getElementById('operacion').value,
                tipo_de_consulta: document.getElementById('tipo-consulta').value,
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

            if (!formData.nombre || !formData.tipo_de_consulta || !formData.sintomas || !formData.diagnostico) {
                alert('Por favor complete todos los campos requeridos');
                return;
            }

            try {
                if (criterioSeleccionado) {
                    await aplicarCriterioMedicamentos(criterioSeleccionado);
                }
                
                if (formData.medicamento && !formData.medicamento.startsWith('criterio_') && formData.dosis > 0) {
                    const success = await descontarMedicamento(formData.medicamento, formData.dosis);
                    if (!success) return;
                }

                await guardarEnSheets(sheetsConfig.consultas, formData);
                
                consultas.push(formData);
                filteredConsultas = [...consultas];
                actualizarTablaConsultas();
                closeConsultaModal();
                alert('Consulta registrada exitosamente');
            } catch (error) {
                console.error("Error al guardar consulta:", error);
                alert('Error al guardar la consulta: ' + error.message);
            }
        });
    }
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
        if (!med.fecha_de_caducidad) return false;
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
        try {
            const fechaCaducidad = new Date(med.fecha_de_caducidad);
            return `
                <option value="${med.nombre}" ${nombreMedicamento && med.nombre === nombreMedicamento ? 'selected' : ''}>
                    ${med.nombre} ${med.mg} - Vence: ${fechaCaducidad.toLocaleDateString()} - Unidades: ${med.unidades}
                </option>
            `;
        } catch (e) {
            return `
                <option value="${med.nombre}">
                    ${med.nombre} ${med.mg} - Fecha inválida - Unidades: ${med.unidades}
                </option>
            `;
        }
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
        if (selectedMedForRemoval) {
            document.getElementById('remove-cantidad').max = selectedMedForRemoval.unidades;
        }
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
        console.error("Error al retirar medicamento:", error);
        alert("Error al retirar el medicamento.");
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
        
        await guardarEnSheets(sheetsConfig.inventario, updateData);
        
        medicamento.stock += cantidadCajas;
        medicamento.unidades += unidadesAAgregar;
        medicamento.fecha_de_caducidad = fechaCaducidad;
        
        renderizarInventario();
        closeAddStockModal();
        alert(`Se agregaron ${cantidadCajas} cajas (${unidadesAAgregar} unidades) de ${medicamento.nombre}\nNuevo stock: ${medicamento.stock} cajas (${medicamento.unidades} unidades)`);
    } catch (error) {
        console.error("Error al agregar stock:", error);
        alert("Error al agregar stock.");
    }
});

function enviarSolicitudCompra(medicamento) {
    console.log(`Solicitud de compra para: ${medicamento.nombre}`);
}

function openPermisoModal() {
    if (!verificarCredenciales()) return;
    
    document.getElementById('permiso-modal').classList.add('show');
    document.getElementById('permiso-fecha').valueAsDate = new Date();
    document.getElementById('permiso-hora').value = new Date().toTimeString().substring(0, 5);
    
    // Limpiar campos al abrir
    document.getElementById('permiso-nombre').value = '';
    document.getElementById('permiso-numero').value = '';
    document.getElementById('permiso-area').value = '';
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
        // Preparar datos para guardar
        const permisoData = {
            nombre: nombre,
            numero: numero,
            area: area,
            fecha: fecha,
            hora: hora,
            comentarios: comentarios
        };

        console.log('Guardando permiso:', permisoData);
        
        await guardarEnSheets(sheetsConfig.permisos, {
            accion: 'update',
            ...permisoData
        });

        alert('Pase médico generado correctamente');
        
        closePermisoModal();
        
        const spreadsheetId = "1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q";
        const gid = "724084909";
        
        const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=${gid}&portrait=true&fitw=true`;
        
        const printWindow = window.open(pdfUrl, '_blank');
        
        if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
            window.location.href = pdfUrl;
        } else {
            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (printError) {
                    console.error("Error al imprimir:", printError);
                    printWindow.close();
                    window.location.href = pdfUrl;
                }
            }, 2000);
        }
    } catch (error) {
        console.error("Error al guardar permiso:", error);
        alert('Error al generar el permiso: ' + error.message);
    }
});

function imprimirPermiso() {
    try {
        const spreadsheetId = "1YLksBSie8ciDB9VKg0qadsZ2IsDXnUVq0UV321Hrl6Q";
        const gid = "724084909";
        
        const pdfUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=${gid}&portrait=true&fitw=true`;
        
        const printWindow = window.open(pdfUrl, '_blank');
        
        if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
            window.location.href = pdfUrl;
        } else {
            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (printError) {
                    console.error("Error al imprimir:", printError);
                    printWindow.close();
                    window.location.href = pdfUrl;
                }
            }, 2000);
        }
    } catch (error) {
        console.error("Error en imprimirPermiso:", error);
        alert("Error al preparar el pase médico para impresión.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!verificarCredenciales()) return;
    
    cargarDatosDesdeSheets();
    
    const toggleBtn = document.getElementById('consultorio-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleConsultorio);
    }
    
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
window.exportToExcel = exportToExcel;
window.filterTable = filterTable;
