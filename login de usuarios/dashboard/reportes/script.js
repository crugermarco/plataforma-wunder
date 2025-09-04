// Configuración del backend único
const scriptUrl = 'https://script.google.com/macros/s/AKfycbzI-19vfR4NJIZ9zRYsJY0C2UBYe3PMI2PD6m36TsLd5NK9OfUIZictvujaZtzNMPevkQ/exec';

// Configuración de las hojas de Google Sheets
const sheetsConfig = {
    mantenimientos: {
        spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
        sheetName: 'GRAFICA',
        range: 'A2:B13'
    },
    bano: {
        spreadsheetId: '1VJf4jHb67XY7OI0JS4wAG51C4PWRYPRU_EVByYo0vY0',
        sheetName: 'GRAFICA DE BAÑO',
        range: 'A2:B6'
    },
    asistencias: {
        spreadsheetId: '1NsT7jztJLNZgOE6xJkSofq2hqcpE-1ySiChjVM-zV0c',
        sheetName: 'GRAFICA 2025',
        range: 'A2:H13'
    },
    rotaciones: {
        spreadsheetId: '1Cj6EaRlXmhA5hN3UKy_288iWKHkw-woEVLTqz1jj_wM',
        sheetName: 'GRAFICA 2025',
        range: 'A2:D13'
    }
};

// Variables globales para almacenar datos
let mantenimientosData = [];
let banoData = [];
let asistenciasData = [];
let rotacionesData = [];
let tiempoMuertoData = null;
let frecuenciaFaltasData = null;
let areaRotacionesData = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabs();
    loadAllData();
});

// Inicializar la navegación
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Actualizar clases activas
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
            
            // Cargar datos específicos si es necesario
            if (sectionId === 'mantenimientos' && mantenimientosData.length === 0) {
                loadMantenimientosData();
            } else if (sectionId === 'uso-bano' && banoData.length === 0) {
                loadBanoData();
            } else if (sectionId === 'asistencias' && asistenciasData.length === 0) {
                loadAsistenciasData();
            } else if (sectionId === 'rotaciones' && rotacionesData.length === 0) {
                loadRotacionesData();
            } else if (sectionId === 'tiempo-muerto' && !tiempoMuertoData) {
                loadTiempoMuertoAnalysis();
            } else if (sectionId === 'frecuencia-faltas' && !frecuenciaFaltasData) {
                loadFrecuenciaFaltasAnalysis();
            } else if (sectionId === 'area-rotaciones' && !areaRotacionesData) {
                loadAreaRotacionesAnalysis();
            }
        });
    });
}

// Inicializar pestañas
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar clases activas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar contenido correspondiente
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Cargar todos los datos
function loadAllData() {
    showLoading(true);
    
    Promise.all([
        loadMantenimientosData(),
        loadBanoData(),
        loadAsistenciasData(),
        loadRotacionesData()
    ]).then(() => {
        showLoading(false);
    }).catch(error => {
        console.error('Error loading data:', error);
        showLoading(false);
        showError('Error al cargar los datos. Por favor, recarga la página.');
    });
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'inline-block' : 'none';
    }
}

// Mostrar error
function showError(message) {
    // Crear elemento de error si no existe
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('.content-header').appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Función genérica para hacer fetch
async function fetchData(params) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${scriptUrl}?${queryString}`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error('No se pudieron cargar los datos. Verifica la conexión y que la URL del backend sea correcta.');
    }
}

// Cargar datos de mantenimientos
async function loadMantenimientosData() {
    try {
        const data = await fetchData({
            action: 'getData',
            spreadsheetId: sheetsConfig.mantenimientos.spreadsheetId,
            sheetName: sheetsConfig.mantenimientos.sheetName,
            range: sheetsConfig.mantenimientos.range
        });
        
        mantenimientosData = data.data;
        renderMantenimientosChart();
        updateMantenimientosStats();
    } catch (error) {
        console.error('Error loading mantenimientos data:', error);
        showError('Error al cargar datos de mantenimientos');
    }
}

// Cargar datos de baño
async function loadBanoData() {
    try {
        const data = await fetchData({
            action: 'getData',
            spreadsheetId: sheetsConfig.bano.spreadsheetId,
            sheetName: sheetsConfig.bano.sheetName,
            range: sheetsConfig.bano.range
        });
        
        banoData = data.data;
        renderBanoChart();
        updateBanoStats();
    } catch (error) {
        console.error('Error loading baño data:', error);
        showError('Error al cargar datos de uso de baño');
    }
}

// Cargar datos de asistencias
async function loadAsistenciasData() {
    try {
        const data = await fetchData({
            action: 'getData',
            spreadsheetId: sheetsConfig.asistencias.spreadsheetId,
            sheetName: sheetsConfig.asistencias.sheetName,
            range: sheetsConfig.asistencias.range
        });
        
        asistenciasData = data.data;
        renderAsistenciasChart();
        updateAsistenciasStats();
    } catch (error) {
        console.error('Error loading asistencias data:', error);
        showError('Error al cargar datos de asistencias');
    }
}

// Cargar datos de rotaciones
async function loadRotacionesData() {
    try {
        const data = await fetchData({
            action: 'getData',
            spreadsheetId: sheetsConfig.rotaciones.spreadsheetId,
            sheetName: sheetsConfig.rotaciones.sheetName,
            range: sheetsConfig.rotaciones.range
        });
        
        rotacionesData = data.data;
        renderRotacionesChart();
        updateRotacionesStats();
    } catch (error) {
        console.error('Error loading rotaciones data:', error);
        showError('Error al cargar datos de rotaciones');
    }
}

// Cargar análisis de tiempo muerto
async function loadTiempoMuertoAnalysis() {
    try {
        showLoading(true);
        const data = await fetchData({
            action: 'getTiempoMuerto'
        });
        
        tiempoMuertoData = data;
        renderTiempoMuertoAnalysis();
        showLoading(false);
    } catch (error) {
        console.error('Error loading tiempo muerto analysis:', error);
        showError('Error al cargar análisis de tiempo muerto');
        showLoading(false);
    }
}

// Cargar análisis de frecuencia de faltas
async function loadFrecuenciaFaltasAnalysis() {
    try {
        showLoading(true);
        const data = await fetchData({
            action: 'getFrecuenciaFaltas'
        });
        
        frecuenciaFaltasData = data;
        renderFrecuenciaFaltasAnalysis();
        showLoading(false);
    } catch (error) {
        console.error('Error loading frecuencia faltas analysis:', error);
        showError('Error al cargar análisis de frecuencia de faltas');
        showLoading(false);
    }
}

// Cargar análisis de área con más rotaciones
async function loadAreaRotacionesAnalysis() {
    try {
        showLoading(true);
        const data = await fetchData({
            action: 'getAreaRotaciones'
        });
        
        areaRotacionesData = data;
        renderAreaRotacionesAnalysis();
        showLoading(false);
    } catch (error) {
        console.error('Error loading area rotaciones analysis:', error);
        showError('Error al cargar análisis de área con más rotaciones');
        showLoading(false);
    }
}

// Renderizar análisis de tiempo muerto
function renderTiempoMuertoAnalysis() {
    if (!tiempoMuertoData) return;
    
    // Renderizar top 5 máquinas
    const ctx = document.getElementById('tiempoMuertoChart').getContext('2d');
    const labels = tiempoMuertoData.topMachines.map(item => item.machine);
    const data = tiempoMuertoData.topMachines.map(item => item.count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frecuencia de Problemas',
                data: data,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            }
        }
    });
    
    // Renderizar problema con mayor tiempo de respuesta
    const problemText = document.getElementById('max-time-problem-text');
    if (problemText && tiempoMuertoData.maxTimeProblem) {
        problemText.innerHTML = `
            <div class="problem-card">
                <div class="problem-title">Descripción del Problema:</div>
                <div class="problem-description">${tiempoMuertoData.maxTimeProblem.description || 'No disponible'}</div>
                <div class="problem-time">Tiempo de respuesta: ${tiempoMuertoData.maxTimeProblem.time} horas</div>
            </div>
        `;
    }
}

// Renderizar análisis de frecuencia de faltas
function renderFrecuenciaFaltasAnalysis() {
    if (!frecuenciaFaltasData) return;
    
    // Renderizar faltas del mes
    const monthList = document.getElementById('month-faltas-list');
    if (monthList) {
        monthList.innerHTML = '';
        
        frecuenciaFaltasData.monthFaltas.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'top-item';
            listItem.style.animationDelay = `${index * 0.1}s`;
            listItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="name">${item.person}</div>
                <div class="count">${item.count} faltas</div>
            `;
            monthList.appendChild(listItem);
        });
    }
    
    // Renderizar faltas del año
    const yearList = document.getElementById('year-faltas-list');
    if (yearList) {
        yearList.innerHTML = '';
        
        frecuenciaFaltasData.yearFaltas.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'top-item';
            listItem.style.animationDelay = `${index * 0.1}s`;
            listItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="name">${item.person}</div>
                <div class="count">${item.count} faltas</div>
            `;
            yearList.appendChild(listItem);
        });
    }
}

// Renderizar análisis de área con más rotaciones
function renderAreaRotacionesAnalysis() {
    if (!areaRotacionesData) return;
    
    // Renderizar gráfica
    const ctx = document.getElementById('areaRotacionesChart').getContext('2d');
    const labels = areaRotacionesData.topAreas.map(item => item.area);
    const data = areaRotacionesData.topAreas.map(item => item.count);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgba(139, 92, 246, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cbd5e1',
                        padding: 20
                    }
                }
            }
        }
    });
    
    // Renderizar lista
    const areaList = document.getElementById('area-rotaciones-list');
    if (areaList) {
        areaList.innerHTML = '';
        
        areaRotacionesData.topAreas.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'top-item';
            listItem.style.animationDelay = `${index * 0.1}s`;
            listItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="name">${item.area}</div>
                <div class="count">${item.count} rotaciones</div>
            `;
            areaList.appendChild(listItem);
        });
    }
}

// Renderizar gráfica de mantenimientos
function renderMantenimientosChart() {
    const ctx = document.getElementById('mantenimientosChart').getContext('2d');
    
    const meses = mantenimientosData.map(row => row[0]);
    const valores = mantenimientosData.map(row => parseInt(row[1]) || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Mantenimientos',
                data: valores,
                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            }
        }
    });
}

// Renderizar gráfica de baño
function renderBanoChart() {
    const ctx = document.getElementById('usoBanoChart').getContext('2d');
    
    const dias = banoData.map(row => row[0]);
    const valores = banoData.map(row => parseInt(row[1]) || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dias,
            datasets: [{
                label: 'Uso de Baño',
                data: valores,
                backgroundColor: 'rgba(234, 179, 8, 0.7)',
                borderColor: 'rgba(234, 179, 8, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            }
        }
    });
}

// Renderizar gráfica de asistencias
function renderAsistenciasChart() {
    const ctx = document.getElementById('asistenciasChart').getContext('2d');
    
    const meses = asistenciasData.map(row => row[0]);
    
    // Obtener los datos para cada categoría
    const asistenciaGral = asistenciasData.map(row => parseInt(row[1]) || 0);
    const faltaInjustificada = asistenciasData.map(row => parseInt(row[2]) || 0);
    const permisoDia = asistenciasData.map(row => parseInt(row[3]) || 0);
    const permisoHora = asistenciasData.map(row => parseInt(row[4]) || 0);
    const suspension = asistenciasData.map(row => parseInt(row[5]) || 0);
    const vacaciones = asistenciasData.map(row => parseInt(row[6]) || 0);
    const noEscan = asistenciasData.map(row => parseInt(row[7]) || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Asistencia General',
                    data: asistenciaGral,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Falta Injustificada',
                    data: faltaInjustificada,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Permiso - Por Día',
                    data: permisoDia,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Permiso - Por Hora',
                    data: permisoHora,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Suspensión',
                    data: suspension,
                    backgroundColor: 'rgba(107, 114, 128, 0.7)',
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Vacaciones',
                    data: vacaciones,
                    backgroundColor: 'rgba(249, 115, 22, 0.7)',
                    borderColor: 'rgba(249, 115, 22, 1)',
                    borderWidth: 1
                },
                {
                    label: 'No se escanea',
                    data: noEscan,
                    backgroundColor: 'rgba(234, 179, 8, 0.7)',
                    borderColor: 'rgba(234, 179, 8, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                },
                x: {
                    stacked: false,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            }
        }
    });
}

// Renderizar gráfica de rotaciones
function renderRotacionesChart() {
    const ctx = document.getElementById('rotacionesChart').getContext('2d');
    
    const meses = rotacionesData.map(row => row[0]);
    const total = rotacionesData.map(row => parseInt(row[1]) || 0);
    const terminados = rotacionesData.map(row => parseInt(row[2]) || 0);
    const pendientes = rotacionesData.map(row => parseInt(row[3]) || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Total',
                    data: total,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Terminados',
                    data: terminados,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pendientes',
                    data: pendientes,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(71, 85, 105, 0.3)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            }
        }
    });
}

// Actualizar estadísticas de mantenimientos
function updateMantenimientosStats() {
    const statsContainer = document.getElementById('mantenimientosStats');
    if (!statsContainer) return;
    
    const total = mantenimientosData.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0);
    const promedio = total / (mantenimientosData.length || 1);
    const max = Math.max(...mantenimientosData.map(row => parseInt(row[1]) || 0));
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total de Mantenimientos</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(promedio)}</div>
            <div class="stat-label">Promedio Mensual</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${max}</div>
            <div class="stat-label">Máximo en un Mes</div>
        </div>
    `;
}

// Actualizar estadísticas de baño
function updateBanoStats() {
    const statsContainer = document.getElementById('banioStats');
    if (!statsContainer) return;
    
    const total = banoData.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0);
    const max = Math.max(...banoData.map(row => parseInt(row[1]) || 0));
    const diaMax = banoData.find(row => parseInt(row[1]) === max)?.[0] || 'N/A';
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total de Usos</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${max}</div>
            <div class="stat-label">Máximo en un Día</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${diaMax}</div>
            <div class="stat-label">Día con Más Uso</div>
        </div>
    `;
}

// Actualizar estadísticas de asistencias
function updateAsistenciasStats() {
    const statsContainer = document.getElementById('asistenciasStats');
    if (!statsContainer) return;
    
    // Calcular totales por categoría
    const totalAsistencia = asistenciasData.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0);
    const totalFaltas = asistenciasData.reduce((sum, row) => sum + (parseInt(row[2]) || 0), 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalAsistencia}</div>
            <div class="stat-label">Asistencia General</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalFaltas}</div>
            <div class="stat-label">Faltas Injustificadas</div>
        </div>
    `;
}

// Actualizar estadísticas de rotaciones
function updateRotacionesStats() {
    const statsContainer = document.getElementById('rotacionesStats');
    if (!statsContainer) return;
    
    const totalRotaciones = rotacionesData.reduce((sum, row) => sum + (parseInt(row[1]) || 0), 0);
    const totalTerminados = rotacionesData.reduce((sum, row) => sum + (parseInt(row[2]) || 0), 0);
    const totalPendientes = rotacionesData.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0);
    const porcentajeCompletado = totalRotaciones > 0 ? Math.round((totalTerminados / totalRotaciones) * 100) : 0;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalRotaciones}</div>
            <div class="stat-label">Total de Rotaciones</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalTerminados}</div>
            <div class="stat-label">Rotaciones Terminadas</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalPendientes}</div>
            <div class="stat-label">Rotaciones Pendientes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${porcentajeCompletado}%</div>
            <div class="stat-label">Porcentaje Completado</div>
        </div>
    `;
}