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

// URL del Web App de Google Apps Script
const scriptUrl = 'https://script.google.com/macros/s/AKfycby0Fkn9eQEN5pLGFyHfi83XInRz1spIxz_K15KDpmnUvrK7jHxld2s99ylWnXtw6Io2Zg/exec';

// Variables globales para almacenar datos
let mantenimientosData = [];
let banoData = [];
let asistenciasData = [];
let rotacionesData = [];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
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
            } else if (sectionId === 'tiempo-muerto') {
                loadTiempoMuertoAnalysis();
            }
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
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Cargar datos de mantenimientos
async function loadMantenimientosData() {
    try {
        const response = await fetch(`${scriptUrl}?action=getData&spreadsheetId=${sheetsConfig.mantenimientos.spreadsheetId}&sheetName=${sheetsConfig.mantenimientos.sheetName}&range=${sheetsConfig.mantenimientos.range}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos de mantenimientos');
        }
        
        const data = await response.json();
        
        if (data && data.values) {
            mantenimientosData = data.values;
            renderMantenimientosChart();
            updateMantenimientosStats();
        } else {
            throw new Error('Formato de datos incorrecto');
        }
    } catch (error) {
        console.error('Error loading mantenimientos data:', error);
        showError('Error al cargar datos de mantenimientos');
    }
}

// Cargar datos de baño
async function loadBanoData() {
    try {
        const response = await fetch(`${scriptUrl}?action=getData&spreadsheetId=${sheetsConfig.bano.spreadsheetId}&sheetName=${sheetsConfig.bano.sheetName}&range=${sheetsConfig.bano.range}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos de baño');
        }
        
        const data = await response.json();
        
        if (data && data.values) {
            banoData = data.values;
            renderBanoChart();
            updateBanoStats();
        } else {
            throw new Error('Formato de datos incorrecto');
        }
    } catch (error) {
        console.error('Error loading baño data:', error);
        showError('Error al cargar datos de uso de baño');
    }
}

// Cargar datos de asistencias
async function loadAsistenciasData() {
    try {
        const response = await fetch(`${scriptUrl}?action=getData&spreadsheetId=${sheetsConfig.asistencias.spreadsheetId}&sheetName=${sheetsConfig.asistencias.sheetName}&range=${sheetsConfig.asistencias.range}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos de asistencias');
        }
        
        const data = await response.json();
        
        if (data && data.values) {
            asistenciasData = data.values;
            renderAsistenciasChart();
            updateAsistenciasStats();
        } else {
            throw new Error('Formato de datos incorrecto');
        }
    } catch (error) {
        console.error('Error loading asistencias data:', error);
        showError('Error al cargar datos de asistencias');
    }
}

// Cargar datos de rotaciones
async function loadRotacionesData() {
    try {
        const response = await fetch(`${scriptUrl}?action=getData&spreadsheetId=${sheetsConfig.rotaciones.spreadsheetId}&sheetName=${sheetsConfig.rotaciones.sheetName}&range=${sheetsConfig.rotaciones.range}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos de rotaciones');
        }
        
        const data = await response.json();
        
        if (data && data.values) {
            rotacionesData = data.values;
            renderRotacionesChart();
            updateRotacionesStats();
        } else {
            throw new Error('Formato de datos incorrecto');
        }
    } catch (error) {
        console.error('Error loading rotaciones data:', error);
        showError('Error al cargar datos de rotaciones');
    }
}

// Cargar análisis de tiempo muerto
async function loadTiempoMuertoAnalysis() {
    try {
        // Cargar tiempo promedio desde B25
        const response = await fetch(`${scriptUrl}?action=getCell&spreadsheetId=${sheetsConfig.mantenimientos.spreadsheetId}&sheetName=${sheetsConfig.mantenimientos.sheetName}&cell=B25`);
        
        if (!response.ok) {
            throw new Error('Error al cargar análisis de tiempo muerto');
        }
        
        const data = await response.json();
        
        if (data && data.value) {
            const tiempoPromedio = data.value;
            
            // Cargar usuario con más reportes desde B27
            const userResponse = await fetch(`${scriptUrl}?action=getCell&spreadsheetId=${sheetsConfig.mantenimientos.spreadsheetId}&sheetName=${sheetsConfig.mantenimientos.sheetName}&cell=B27`);
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                const usuarioMasReportes = userData.value || 'No disponible';
                
                // Actualizar el texto de análisis
                const analysisText = document.getElementById('tiempo-muerto-text');
                if (analysisText) {
                    analysisText.innerHTML = `
                        <p>El tiempo promedio que tarda un técnico en solucionar un problema mecánico es de <span class="highlight-number">${tiempoPromedio}</span>.</p>
                        <p>Este tiempo representa tiempo muerto para la producción, lo que impacta directamente en la eficiencia operativa.</p>
                        <p>El usuario o plataforma que genera más reportes es: <span class="highlight-number">${usuarioMasReportes}</span>.</p>
                    `;
                }
            }
        } else {
            throw new Error('Formato de datos incorrecto');
        }
    } catch (error) {
        console.error('Error loading tiempo muerto analysis:', error);
        showError('Error al cargar análisis de tiempo muerto');
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