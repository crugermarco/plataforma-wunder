const SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbxsLWuBxp0N9Y_LN0_77zqECLrzGxKIjmx-wtO_a0rwXL_3Y7gQxKHhUzpI8sGpeIlRUQ/exec';

const sheetConnections = {
    medidas: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1YLFhIq_C3SUWXjjPLS8oXOyjuowX106u5X2ejSNCmUA',
        sheetName: 'CONCENTRADO DE MEDIDAS',
        headersRow: 1
    },
    placas: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
        sheetName: 'Inventario de Placas',
        headersRow: 1
    },
    flycut: {
        scriptUrl: SCRIPT_BASE_URL,
        spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
        sheetName: 'Flycut Stock-mx',
        headersRow: 1
    }
};

let currentView = 'medidas';
let allData = {
    medidas: { headers: [], data: [], discrepancias: [] },
    placas: [],
    flycut: []
};

let discrepanciasData = {
    machines: {},
    programas: {},
    shifts: {},
    filasConDiscrepancias: []
};

let currentDiscrepanciaRow = null;
let currentDiscrepanciaIndex = null;
let currentDiscrepanciaDataIndex = null;

setInterval(() => {
    if (currentView === 'medidas' && allData.medidas.data && allData.medidas.data.length > 0) {
        loadSheetData(currentView);
    } else if (currentView !== 'medidas' && allData[currentView].length > 0) {
        loadSheetData(currentView);
    }
}, 300000); // 5 minutos

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        currentView = this.dataset.view;
        
        document.querySelectorAll('.view-content').forEach(v => v.style.display = 'none');
        document.getElementById(currentView + 'View').style.display = 'block';
        
        const alertDiv = document.getElementById('discrepanciasAlert');
        if (currentView !== 'medidas') {
            alertDiv.style.display = 'none';
        } else if (discrepanciasData.filasConDiscrepancias.length > 0) {
            alertDiv.style.display = 'block';
        }
        
        if ((currentView === 'medidas' && allData.medidas.data.length === 0) || 
            (currentView !== 'medidas' && allData[currentView].length === 0)) {
            loadSheetData(currentView);
        } else {
            renderTableExact(currentView, currentView === 'medidas' ? allData.medidas : allData[currentView]);
        }
    });
});

const modal = document.getElementById('discrepanciaModal');
const closeBtn = document.querySelector('.close');
const btnCancelar = document.getElementById('btnCancelar');
const btnResolver = document.getElementById('btnResolver');

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

btnCancelar.onclick = function() {
    modal.style.display = 'none';
}

btnResolver.onclick = function() {
    resolverDiscrepancia();
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

async function loadSheetData(view) {
    const config = sheetConnections[view];
    const contentDiv = document.getElementById(view + 'TableContent');
    contentDiv.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const url = `${config.scriptUrl}?action=getData&sheetName=${encodeURIComponent(config.sheetName)}`;
        
        console.log('Cargando datos desde:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message);
        }

        console.log('Datos recibidos:', data);

        if (view === 'medidas') {
            if (data.headers && data.data) {
                allData[view] = {
                    headers: data.headers,
                    data: formatDatesInData(data.data),
                    discrepancias: data.discrepancias || []
                };
                console.log(`Datos cargados: ${allData[view].data.length} filas para ${view}`);
                
                procesarDiscrepancias(allData[view].data);
                updateDiscrepanciasAlert();
            } else {
                allData[view] = { headers: [], data: [], discrepancias: [] };
                console.log(`No hay datos estructurados para: ${view}`);
            }
        } else {
            if (data.length > 0) {
                allData[view] = formatDatesInData(data);
                console.log(`Datos cargados: ${allData[view].length} filas para ${view}`);
            } else {
                allData[view] = [];
                console.log(`No hay datos para: ${view}`);
            }
        }

        renderTableExact(view, view === 'medidas' ? allData[view] : allData[view]);
        
    } catch (error) {
        console.error('Error completo:', error);
        showError(view, 'Error al cargar datos: ' + error.message);
    }
}

function formatDatesInData(data) {
    return data.map(row => {
        return row.map(cell => {
            if (typeof cell === 'string' && cell.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                return cell.split('T')[0];
            }
            return cell;
        });
    });
}

function procesarDiscrepancias(data) {
    console.log('🔍 === USANDO DISCREPANCIAS DEL APPS SCRIPT ===');
    
    discrepanciasData.filasConDiscrepancias = [];
    discrepanciasData.machines = {};
    discrepanciasData.programas = {};
    discrepanciasData.shifts = {};
    console.log('🧹 Discrepancias limpiadas forzosamente');

    const discrepanciasFromServer = allData.medidas.discrepancias || [];
    
    console.log(`📊 Discrepancias recibidas del servidor: ${discrepanciasFromServer.length}`);

    discrepanciasFromServer.forEach(discrepancia => {
        const rowIndex = discrepancia.index;
        const rowData = data[rowIndex];
        
        if (rowData) {
            const machine = rowData[1] || 'Desconocida';
            const programa = rowData[2] || 'Desconocido';
            const shift = rowData[3] || 'Desconocido';
            
            discrepanciasData.machines[machine] = (discrepanciasData.machines[machine] || 0) + 1;
            discrepanciasData.programas[programa] = (discrepanciasData.programas[programa] || 0) + 1;
            discrepanciasData.shifts[shift] = (discrepanciasData.shifts[shift] || 0) + 1;
            
            discrepanciasData.filasConDiscrepancias.push({
                index: rowIndex,
                rowData: rowData,
                discrepancias: discrepancia.discrepancias
            });
            
            console.log(`🎯 FILA ${rowIndex + 1} CON DISCREPANCIAS: ${discrepancia.discrepancias.length} celdas`);
        }
    });

    console.log('✅ === DISCREPANCIAS PROCESADAS DESDE SERVIDOR ===');
    console.log(`📈 Total filas con discrepancias: ${discrepanciasData.filasConDiscrepancias.length}`);
    console.log('Máquinas con discrepancias:', discrepanciasData.machines);
}

function updateDiscrepanciasAlert() {
    const alertDiv = document.getElementById('discrepanciasAlert');
    const countSpan = document.getElementById('discrepanciasCount');
    
    const count = discrepanciasData.filasConDiscrepancias.length;
    
    if (count > 0 && currentView === 'medidas') {
        alertDiv.style.display = 'block';
        countSpan.textContent = `${count} PLACA${count > 1 ? 'S' : ''} CON DISCREPANCIAS SIN RESOLVER`;
    } else {
        alertDiv.style.display = 'none';
    }
}

function mostrarAnalisisInteligente() {
    const topMachines = Object.entries(discrepanciasData.machines)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topProgramas = Object.entries(discrepanciasData.programas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topShifts = Object.entries(discrepanciasData.shifts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    let html = `
        <div class="analisis-inteligente">
            <h3>🔍 Análisis Inteligente - Discrepancias</h3>
            <div class="analisis-grid">
                <div class="analisis-item">
                    <h4>Top Máquinas con Discrepancias</h4>
                    <ul>
    `;
    
    topMachines.forEach(([machine, count]) => {
        html += `<li>${machine}: ${count} discrepancia(s)</li>`;
    });
    
    html += `
                    </ul>
                </div>
                <div class="analisis-item">
                    <h4>Top Programas con Discrepancias</h4>
                    <ul>
    `;
    
    topProgramas.forEach(([programa, count]) => {
        html += `<li>${programa}: ${count} discrepancia(s)</li>`;
    });
    
    html += `
                    </ul>
                </div>
                <div class="analisis-item">
                    <h4>Top Shifts con Discrepancias</h4>
                    <ul>
    `;
    
    topShifts.forEach(([shift, count]) => {
        html += `<li>Turno ${shift}: ${count} discrepancia(s)</li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </div>
    `;

    const existingAnalisis = document.querySelector('.analisis-inteligente');
    if (existingAnalisis) {
        existingAnalisis.remove();
    }
    
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        filtersSection.insertAdjacentHTML('afterend', html);
    }
}

function updateDynamicFilters(view) {
    let data;
    if (view === 'medidas') {
        data = allData.medidas.data;
    } else {
        data = allData[view];
    }
    
    if (!data || data.length === 0) return;

    if (view === 'medidas') {
        const dataRows = data.slice(8);
        
        const MACHINE = [...new Set(dataRows.map(d => d[1]).filter(Boolean))];
        const selectMachine = document.getElementById('filterMACHINE');
        selectMachine.innerHTML = '<option value="">Todas</option>' + 
            MACHINE.map(m => `<option value="${m}">${m}</option>`).join('');
        
        const programs = [...new Set(dataRows.map(d => d[2]).filter(Boolean))];
        const selectProgram = document.getElementById('filterProgram');
        selectProgram.innerHTML = '<option value="">Todos</option>' + 
            programs.map(p => `<option value="${p}">${p}</option>`).join('');
        
        if (!document.getElementById('btnAnalisisInteligente')) {
            const btnAnalisis = document.createElement('button');
            btnAnalisis.id = 'btnAnalisisInteligente';
            btnAnalisis.className = 'analisis-btn';
            btnAnalisis.innerHTML = '🔍 Análisis Inteligente';
            btnAnalisis.onclick = mostrarAnalisisInteligente;
            
            const filtersDiv = document.querySelector('.filters-section');
            if (filtersDiv) {
                filtersDiv.appendChild(btnAnalisis);
            }
        }
    } else if (view === 'placas') {
        const filasRelevantes = [data[0], data[3]];
        const lideres = [...new Set(filasRelevantes.map(d => d[1]).filter(Boolean))];
        const select = document.getElementById('filterLiderPlacas');
        select.innerHTML = '<option value="">Todos</option>' + 
            lideres.map(l => `<option value="${l}">${l}</option>`).join('');
    } else if (view === 'flycut') {
        const lideres = [...new Set(data.slice(1).map(d => d[1]).filter(Boolean))];
        const select = document.getElementById('filterLiderFlycut');
        select.innerHTML = '<option value="">Todos</option>' + 
            lideres.map(l => `<option value="${l}">${l}</option>`).join('');
    }
}

function applyFilters() {
    console.log('Aplicando filtros para:', currentView);
    
    let filtered;
    if (currentView === 'medidas') {
        filtered = { ...allData.medidas };
    } else {
        filtered = [...allData[currentView]];
    }
    
    if (currentView === 'medidas') {
        const mes = document.getElementById('filterMesMedidas').value;
        const MACHINE = document.getElementById('filterMACHINE').value;
        const shift = document.getElementById('filterShift').value;
        const program = document.getElementById('filterProgram').value;

        console.log('Filtros medidas:', { mes, MACHINE, shift, program });

        if (mes || MACHINE || shift || program) {
            const headers = filtered.headers;
            const dataRows = filtered.data.slice(8);
            
            let filteredData = dataRows.filter(row => {
                let include = true;
                
                if (mes) {
                    const fecha = row[0] || '';
                    include = include && (fecha.includes(`-${mes}-`) || fecha.includes(`/${mes}/`));
                }
                if (MACHINE) {
                    include = include && (row[1] == MACHINE);
                }
                if (shift) {
                    include = include && (row[3] == shift);
                }
                if (program) {
                    include = include && (row[2] == program);
                }
                
                return include;
            });
            
            console.log('Filas filtradas:', filteredData.length);
            filtered.data = [headers, ...filteredData];
        } else {
            filtered = allData.medidas;
        }
    } else if (currentView === 'placas') {
        const mes = document.getElementById('filterMesPlacas').value;
        const lider = document.getElementById('filterLiderPlacas').value;
        const categoria = document.getElementById('filterCategoria').value;

        if (mes || lider || categoria) {
            const headers = filtered[0];
            const fila4 = filtered[3];
            const dataRows = filtered.slice(5); // A partir de fila 6
            
            let filteredData = dataRows.filter(row => {
                let include = true;
                
                if (mes) {
                    const fecha = row[0] || '';
                    include = include && (fecha.includes(`-${mes}-`) || fecha.includes(`/${mes}/`));
                }
                if (lider) {
                    include = include && (row[1] === lider);
                }
                if (categoria) {
                    const rowText = row.join(' ').toLowerCase();
                    include = include && rowText.includes(categoria.toLowerCase());
                }
                
                return include;
            });
            
            filtered = [headers, fila4, ...filteredData];
        } else {
            // Sin filtros, mostrar filas 1, 4 y a partir de la 6
            filtered = [filtered[0], filtered[3], ...filtered.slice(5)];
        }
    } else if (currentView === 'flycut') {
        const mes = document.getElementById('filterMesFlycut').value;
        const lider = document.getElementById('filterLiderFlycut').value;
        const tipo = document.getElementById('filterTipoFlycut').value;

        if (mes || lider || tipo) {
            const headers = filtered[0];
            const dataRows = filtered.slice(1);
            
            let filteredData = dataRows.filter(row => {
                let include = true;
                
                if (mes) {
                    const fecha = row[0] || '';
                    include = include && (fecha.includes(`-${mes}-`) || fecha.includes(`/${mes}/`));
                }
                if (lider) {
                    include = include && (row[1] === lider);
                }
                if (tipo) {
                    include = include && (row[2] === tipo);
                }
                
                return include;
            });
            
            filtered = [headers, ...filteredData];
        } else {
            filtered = allData[currentView];
        }
    }

    renderTableExact(currentView, filtered);
}

function renderTableExact(view, data) {
    const contentDiv = document.getElementById(view + 'TableContent');
    
    if ((view === 'medidas' && (!data.data || data.data.length === 0)) || 
        (view !== 'medidas' && data.length === 0)) {
        contentDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No hay datos para mostrar</p>
            </div>
        `;
        return;
    }

    let html = '';
    
    if (view === 'medidas') {
        const headers = data.headers;
        const tableData = data.data;
        
        html = `
            <div class="table-scroll-container">
                <table class="data-table scroll-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header || ''}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        const esVistaCompleta = data === allData.medidas;
        
        const esValorValido = (valor) => {
            if (valor === undefined || valor === null || valor === '') return false;
            const strValor = String(valor).trim();
            const upperValor = strValor.toUpperCase();
            if (upperValor === 'N/A' || upperValor === 'NA' || upperValor === '#N/A' || 
                upperValor.includes('N/A') || upperValor === 'NAN' || upperValor === 'NULL' ||
                upperValor === '0' || upperValor === '0.0' || upperValor === '0.00') return false;
            const numValor = parseFloat(strValor.replace(',', '.'));
            return !isNaN(numValor) && isFinite(numValor);
        };

        for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];
            
            let globalIndex;
            if (esVistaCompleta) {
                globalIndex = i + 8; 
            } else {
                const rowData = tableData[i];
                globalIndex = allData.medidas.data.findIndex((originalRow, idx) => {
                    return JSON.stringify(originalRow) === JSON.stringify(rowData);
                });
                if (globalIndex === -1) globalIndex = i + 8;
            }
            
            const notas = row[row.length - 1] || '';
            
            console.log(`\n🔍 DEPURACIÓN RENDER: Fila ${globalIndex} - Buscando discrepancias...`);
            
            const filaDiscrepancia = discrepanciasData.filasConDiscrepancias.find(
                discrepancia => discrepancia.index === globalIndex
            );
            
            const tieneDiscrepanciaSinResolver = !!filaDiscrepancia;
            
            let celdasConDiscrepancia = [];
            if (tieneDiscrepanciaSinResolver) {
                celdasConDiscrepancia = filaDiscrepancia.discrepancias;
                console.log(`🎯 DEPURACIÓN: Fila ${globalIndex} TIENE ${celdasConDiscrepancia.length} discrepancias en columnas: ${celdasConDiscrepancia.join(', ')}`);
                
                celdasConDiscrepancia.forEach(colIndex => {
                    console.log(`   Columna ${colIndex}: Valor = "${row[colIndex]}"`);
                });
            } else {
                console.log(`✅ DEPURACIÓN: Fila ${globalIndex} NO TIENE discrepancias registradas`);
            }
            
            html += '<tr>';
            
            row.forEach((cell, index) => {
                let cellClass = '';
                let value = cell || '';
                
                const esCeldaConDiscrepancia = celdasConDiscrepancia.includes(index);
                const esValidoParaParpadeo = esValorValido(value) && esCeldaConDiscrepancia;
                
                if (esValidoParaParpadeo && !notas.includes('-Discrepancia Resuelta')) {
                    cellClass = 'alerta-parpadeo';
                    console.log(`🚨 DEPURACIÓN: APLICANDO parpadeo a fila ${globalIndex}, columna ${index} - Valor: "${value}"`);
                } else if (esCeldaConDiscrepancia && !esValidoParaParpadeo) {
                    console.log(`⏭️ DEPURACIÓN: Saltando parpadeo para fila ${globalIndex}, columna ${index} - Valor NO válido: "${value}"`);
                } else if (esCeldaConDiscrepancia) {
                    console.log(`❓ DEPURACIÓN: Celda ${index} marcada como discrepancia pero NO aplicando parpadeo - Valor: "${value}"`);
                }
                
                if (index === row.length - 1) {
                    if (tieneDiscrepanciaSinResolver && !notas.includes('-Discrepancia Resuelta')) {
                        value = `<button class="btn-alerta" onclick="abrirModalDiscrepancia(${i}, ${globalIndex})">⚠️</button> ${value}`;
                    } else {
                        value = cell || ''; // Mostrar solo el valor sin botón
                    }
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            });
            
            html += '</tr>';
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
    } else if (view === 'placas') {
        html = `
            <div class="table-scroll-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${data[0].map(header => `<th>${header || ''}</th>`).join('')}
                        </tr>
                        <tr class="fila-4-header">
                            ${data[1].map((cell, index) => {
                                let cellClass = '';
                                let value = cell || '';
                                
                                const numValue = parseFloat(cell);
                                if (!isNaN(numValue) && numValue <= 0) {
                                    cellClass = 'alerta-parpadeo';
                                }
                                
                                return `<th class="${cellClass}">${value}</th>`;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            html += '<tr>';
            
            row.forEach((cell, index) => {
                let cellClass = '';
                let value = cell || '';
                
                if (index === 2) {
                    const programa = String(cell).toUpperCase();
                    if (programa.includes('PRODUCCION')) {
                        cellClass = 'etiqueta-produccion';
                    } else if (programa.includes('SCRAP')) {
                        cellClass = 'etiqueta-scrap';
                    } else if (programa.includes('BONDING')) {
                        cellClass = 'etiqueta-bonding';
                    }
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            });
            
            html += '</tr>';
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
    } else if (view === 'flycut') {
        const columnasAlerta = [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
        
        html = `
            <div class="table-scroll-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${data[0].map(header => `<th>${header || ''}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            html += '<tr>';
            
            row.forEach((cell, index) => {
                let cellClass = '';
                let value = cell || '';
                
                if (index === 2) {
                    if (value === 'PROCESO') {
                        cellClass = 'etiqueta-proceso';
                    } else if (value === 'ENTRADA') {
                        cellClass = 'etiqueta-entrada';
                    }
                }
                
                if (columnasAlerta.includes(index)) {
                    const numValue = parseFloat(cell);
                    if (!isNaN(numValue)) {
                        if (numValue <= -100) {
                            cellClass = 'alerta-negativo';
                        } else if (numValue >= 100) {
                            cellClass = 'alerta-positivo';
                        }
                    }
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            });
            html += '</tr>';
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    contentDiv.innerHTML = html;
    updateDynamicFilters(view);
}

async function abrirModalDiscrepancia(rowIndex, globalIndex) {
    let data;
    if (currentView === 'medidas') {
        data = allData.medidas.data;
    } else {
        data = allData[currentView];
    }
    
    const row = data[globalIndex];
    const notasIndex = row.length - 1;
    const notas = row[notasIndex] || '';
    
    document.getElementById('notaOriginal').textContent = notas;
    document.getElementById('respuestaUsuario').value = '';
    document.getElementById('passwordInput').value = '';
    
    currentDiscrepanciaRow = row;
    currentDiscrepanciaIndex = globalIndex;
    currentDiscrepanciaDataIndex = notasIndex;
    
    modal.style.display = 'block';
}

async function resolverDiscrepancia() {
    const password = document.getElementById('passwordInput').value;
    const respuesta = document.getElementById('respuestaUsuario').value;
    
    if (password !== '41352') {
        alert('Contraseña incorrecta');
        return;
    }
    
    if (!respuesta.trim()) {
        alert('Por favor escribe una respuesta');
        return;
    }
    
    try {
        const config = sheetConnections[currentView];
        const nuevaNota = respuesta + ' -Discrepancia Resuelta';
        
        const filaEnSheet = currentDiscrepanciaIndex + 1;
        const columnaEnSheet = currentDiscrepanciaDataIndex + 1;
        
        const formData = new FormData();
        formData.append('action', 'updateCell');
        formData.append('sheetName', config.sheetName);
        formData.append('row', filaEnSheet.toString());
        formData.append('col', columnaEnSheet.toString());
        formData.append('value', nuevaNota);
        
        const response = await fetch(config.scriptUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar la celda');
        }
        
        const result = await response.json();
        
        if (result.success) {
            if (currentView === 'medidas') {
                allData.medidas.data[currentDiscrepanciaIndex][currentDiscrepanciaDataIndex] = nuevaNota;
            } else {
                allData[currentView][currentDiscrepanciaIndex][currentDiscrepanciaDataIndex] = nuevaNota;
            }
            
            if (currentView === 'medidas') {
                procesarDiscrepancias(allData.medidas.data);
                updateDiscrepanciasAlert();
            }
            
            renderTableExact(currentView, currentView === 'medidas' ? allData.medidas : allData[currentView]);
            
            modal.style.display = 'none';
            alert('Discrepancia resuelta correctamente');
        } else {
            throw new Error(result.message || 'Error al actualizar');
        }
        
    } catch (error) {
        console.error('Error al resolver discrepancia:', error);
        alert('Error al resolver la discrepancia: ' + error.message);
    }
}

function showError(view, message) {
    const contentDiv = document.getElementById(view + 'TableContent');
    contentDiv.innerHTML = `
        <div class="error-message">
            ⚠️ ${message}
        </div>
        <div class="empty-state">
            <div class="empty-state-icon">🔧</div>
            <p>Verifica la configuración de conexión</p>
            <p style="font-size: 0.85rem; margin-top: 1rem;">
                Asegúrate de que la URL del Apps Script sea correcta.
            </p>
        </div>
    `;
}

window.abrirModalDiscrepancia = abrirModalDiscrepancia;
window.resolverDiscrepancia = resolverDiscrepancia;
window.applyFilters = applyFilters;
window.mostrarAnalisisInteligente = mostrarAnalisisInteligente;

window.addEventListener('DOMContentLoaded', () => {
    loadSheetData(currentView);
});