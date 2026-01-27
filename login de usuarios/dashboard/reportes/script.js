const scriptUrl = 'https://script.google.com/macros/s/AKfycbzHeOCIwdfVrF7BSLKksF5uUXa4Fs9mnFxSDcaVf_Elh2JXfOuvVu8Sm-VNqup_fCF2uw/exec';

const sheetsConfig = {
    rotaciones: {
        spreadsheetId: '1Cj6EaRlXmhA5hN3UKy_288iWKHkw-woEVLTqz1jj_wM',
        sheetName: 'REGISTRO',
        range: 'A:D'
    },
    personalAreas: {
        spreadsheetId: '1Cj6EaRlXmhA5hN3UKy_288iWKHkw-woEVLTqz1jj_wM',
        sheetName: 'PERSONAL POR AREA',
        range: 'A:B'
    },
    mantenimientos: {
        spreadsheetId: '1JIjuUcogzSW-oVKq7mNaUlAqtxvjtBDf1uSF4CUpnJU',
        sheetName: 'CONCENTRADO DE REQUERIMIENTOS',
        range: 'A:K'
    },
    asistencias: {
        spreadsheetId: '1NsT7jztJLNZgOE6xJkSofq2hqcpE-1ySiChjVM-zV0c',
        sheetName: 'Productivity Bonus 2025',
        range: 'A:E'
    }
};

let rotacionesData = [];
let personalAreasData = [];
let mantenimientosData = [];
let asistenciasData = [];

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabs();
    loadAllData();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabId).classList.add('active');
        });
    });
}

async function loadAllData() {
    showLoading(true);
    
    try {
        await Promise.all([
            loadRotacionesData(),
            loadPersonalAreasData(),
            loadMantenimientosData(),
            loadAsistenciasData()
        ]);
        
        renderAllCharts();
        renderAllAnalysis();
        showLoading(false);
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Error al cargar los datos');
        showLoading(false);
    }
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'inline-block' : 'none';
    }
}

function showError(message) {
    alert(message);
}

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
        throw new Error('No se pudieron cargar los datos');
    }
}

async function loadRotacionesData() {
    const data = await fetchData({
        action: 'getData',
        spreadsheetId: sheetsConfig.rotaciones.spreadsheetId,
        sheetName: sheetsConfig.rotaciones.sheetName,
        range: sheetsConfig.rotaciones.range
    });
    
    rotacionesData = data.data.filter(row => row[0] && row[0].toString().trim() !== '');
}

async function loadPersonalAreasData() {
    const data = await fetchData({
        action: 'getData',
        spreadsheetId: sheetsConfig.personalAreas.spreadsheetId,
        sheetName: sheetsConfig.personalAreas.sheetName,
        range: sheetsConfig.personalAreas.range
    });
    
    personalAreasData = data.data.filter(row => row[0] && row[0].toString().trim() !== '');
}

async function loadMantenimientosData() {
    const data = await fetchData({
        action: 'getData',
        spreadsheetId: sheetsConfig.mantenimientos.spreadsheetId,
        sheetName: sheetsConfig.mantenimientos.sheetName,
        range: sheetsConfig.mantenimientos.range
    });
    
    mantenimientosData = data.data.filter(row => row[0] && row[0].toString().trim() !== '');
}

async function loadAsistenciasData() {
    const data = await fetchData({
        action: 'getData',
        spreadsheetId: sheetsConfig.asistencias.spreadsheetId,
        sheetName: sheetsConfig.asistencias.sheetName,
        range: sheetsConfig.asistencias.range
    });
    
    asistenciasData = data.data.filter(row => row[0] && row[0].toString().trim() !== '');
}

function renderAllCharts() {
    renderRotacionesCharts();
    renderMantenimientosCharts();
    renderAsistenciasCharts();
}

function renderAllAnalysis() {
    renderRotacionesAnalysis();
    renderMantenimientosAnalysis();
    renderAsistenciasAnalysis();
}

function renderRotacionesCharts() {
    const data2025 = processRotacionesYear(2025);
    const data2026 = processRotacionesYear(2026);
    
    renderRotacionesChart('rotaciones2025Chart', data2025, true);
    renderRotacionesChart('rotaciones2026Chart', data2026, false);
}

function processRotacionesYear(year) {
    const yearData = rotacionesData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === year;
        } catch {
            return false;
        }
    });
    
    const monthlyCounts = Array(12).fill(0);
    
    yearData.forEach(row => {
        try {
            const date = new Date(row[0]);
            const month = date.getMonth();
            monthlyCounts[month]++;
        } catch (e) {
            console.error('Error processing date:', row[0]);
        }
    });
    
    return monthlyCounts;
}

function renderRotacionesChart(canvasId, monthlyCounts, is2025) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const meta = 8500;
    const registros = monthlyCounts;
    const faltantes = registros.map(count => Math.max(0, meta - count));
    
    const datasets = [
        {
            label: 'Meta (8500)',
            data: Array(12).fill(meta),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            order: 3
        },
        {
            label: 'Registros',
            data: registros,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
            order: 2
        },
        {
            label: 'Faltantes',
            data: faltantes,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            order: 1
        }
    ];
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
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
    
    if (is2025) {
        addJulyAnnotation(chart);
    }
}

function addJulyAnnotation(chart) {
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;
    
    if (!xAxis || !yAxis) return;
    
    const xPosition = xAxis.getPixelForValue(6.5);
    const yTop = yAxis.top;
    const yBottom = yAxis.bottom;
    
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(xPosition, yTop);
    ctx.lineTo(xPosition, yBottom);
    ctx.strokeStyle = 'rgba(139, 92, 246, 1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.fillRect(xPosition - 70, yTop + 10, 140, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Inicio de plataforma', xPosition, yTop + 25);
    ctx.restore();
}

function renderMantenimientosCharts() {
    const data2025 = processMantenimientosYear(2025);
    const data2026 = processMantenimientosYear(2026);
    
    renderMantenimientosChart('mantenimientos2025Chart', data2025);
    renderMantenimientosChart('mantenimientos2026Chart', data2026);
}

function processMantenimientosYear(year) {
    const yearData = mantenimientosData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === year;
        } catch {
            return false;
        }
    });
    
    const monthlyCounts = Array(12).fill(0);
    
    yearData.forEach(row => {
        try {
            const date = new Date(row[0]);
            const month = date.getMonth();
            monthlyCounts[month]++;
        } catch (e) {
            console.error('Error processing date:', row[0]);
        }
    });
    
    return monthlyCounts;
}

function renderMantenimientosChart(canvasId, monthlyCounts) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Mantenimientos',
                data: monthlyCounts,
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

function renderAsistenciasCharts() {
    const data2025 = processAsistenciasYear(2025);
    const data2026 = processAsistenciasYear(2026);
    
    renderAsistenciasChart('asistencias2025Chart', data2025);
    renderAsistenciasChart('asistencias2026Chart', data2026);
}

function processAsistenciasYear(year) {
    const yearData = asistenciasData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === year;
        } catch {
            return false;
        }
    });
    
    const motivos = {
        'falta injustificada': Array(12).fill(0),
        'permiso - por día': Array(12).fill(0),
        'incapacidad': Array(12).fill(0),
        'suspension': Array(12).fill(0),
        'error de proceso': Array(12).fill(0),
        '5hrs': Array(12).fill(0),
        'no se escanea o no cuenta con gafete': Array(12).fill(0),
        'retardo': Array(12).fill(0),
        'permiso - por hora': Array(12).fill(0)
    };
    
    yearData.forEach(row => {
        try {
            const date = new Date(row[0]);
            const month = date.getMonth();
            const motivo = (row[2] || '').toString().toLowerCase().trim();
            
            for (const key in motivos) {
                if (motivo.includes(key)) {
                    motivos[key][month]++;
                    break;
                }
            }
        } catch (e) {
            console.error('Error processing date:', row[0]);
        }
    });
    
    return motivos;
}

function renderAsistenciasChart(canvasId, motivos) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const datasets = [];
    const colors = [
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(107, 114, 128, 0.7)',
        'rgba(249, 115, 22, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(6, 182, 212, 0.7)'
    ];
    
    let i = 0;
    for (const motivo in motivos) {
        datasets.push({
            label: motivo.toUpperCase(),
            data: motivos[motivo],
            backgroundColor: colors[i],
            borderColor: colors[i].replace('0.7', '1'),
            borderWidth: 1
        });
        i++;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: datasets
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
                        color: '#cbd5e1',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function renderRotacionesAnalysis() {
    const top2025 = getTopPersonal(2025, 5);
    const top2026 = getTopPersonal(2026, 5);
    const topAreas = getTopAreas(3);
    
    renderTopPersonalBarChart('topPersonal2025Chart', top2025, 'TOP 5 PERSONAL 2025');
    renderTopPersonalBarChart('topPersonal2026Chart', top2026, 'TOP 5 PERSONAL 2026');
    renderTopAreasPieChart('topAreasChart', topAreas);
    
    renderTopPersonalList('top-personal-2025-list', top2025);
    renderTopPersonalList('top-personal-2026-list', top2026);
    renderTopAreasList('top-areas-list', topAreas);
    
    updateAreaTop();
}

function getTopPersonal(year, limit) {
    const yearData = rotacionesData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === year;
        } catch {
            return false;
        }
    });
    
    const personalCount = {};
    
    yearData.forEach(row => {
        const nombre = row[1];
        if (nombre) {
            personalCount[nombre] = (personalCount[nombre] || 0) + 1;
        }
    });
    
    return Object.entries(personalCount)
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopPersonalBarChart(canvasId, topList, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = topList.map(item => item.nombre);
    const counts = topList.map(item => item.count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rotaciones',
                data: counts,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
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
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
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

function getTopAreas(limit) {
    const personalMap = {};
    
    personalAreasData.forEach(row => {
        const nombre = row[0];
        const area = row[1];
        if (nombre && area) {
            personalMap[nombre] = area;
        }
    });
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const yearData = rotacionesData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    const areaCount = {};
    
    yearData.forEach(row => {
        const nombre = row[1];
        if (nombre && personalMap[nombre]) {
            const area = personalMap[nombre];
            areaCount[area] = (areaCount[area] || 0) + 1;
        }
    });
    
    return Object.entries(areaCount)
        .map(([area, count]) => ({ area, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopAreasPieChart(canvasId, topAreas) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = topAreas.map(item => item.area);
    const counts = topAreas.map(item => item.count);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
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
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function renderTopPersonalList(containerId, topList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    topList.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'top-item';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="name">${item.nombre}</div>
            <div class="count">${item.count} rotaciones</div>
        `;
        container.appendChild(itemElement);
    });
}

function renderTopAreasList(containerId, topAreas) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    topAreas.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'top-item';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="name">${item.area}</div>
            <div class="count">${item.count} registros</div>
        `;
        container.appendChild(itemElement);
    });
}

function updateAreaTop() {
    const container = document.getElementById('area-top-container');
    if (!container) return;
    
    const personalMap = {};
    
    personalAreasData.forEach(row => {
        const nombre = row[0];
        const area = row[1];
        if (nombre && area) {
            personalMap[nombre] = area;
        }
    });
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const monthlyData = rotacionesData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        } catch {
            return false;
        }
    });
    
    const areaCount = {};
    
    monthlyData.forEach(row => {
        const nombre = row[1];
        if (nombre && personalMap[nombre]) {
            const area = personalMap[nombre];
            areaCount[area] = (areaCount[area] || 0) + 1;
        }
    });
    
    let topArea = 'No hay datos';
    let maxCount = 0;
    
    for (const area in areaCount) {
        if (areaCount[area] > maxCount) {
            maxCount = areaCount[area];
            topArea = area;
        }
    }
    
    container.innerHTML = `
        <div class="area-top-card">
            <div class="area-top-title">ÁREA CON MÁS ROTACIONES ESTE MES:</div>
            <div class="area-top-value">${topArea}</div>
            <div class="area-top-count">${maxCount} registros</div>
        </div>
    `;
}

function renderMantenimientosAnalysis() {
    const topMaquinasMes = getTopMaquinas('month', 5);
    const topMaquinasAnio = getTopMaquinas('year', 10);
    const topUsuarios = getTopUsuarios(3);
    
    renderTopMaquinasBarChart('topMaquinasMesChart', topMaquinasMes);
    renderTopMaquinasBarChart('topMaquinasAnioChart', topMaquinasAnio);
    renderTopUsuariosBarChart('topUsuariosChart', topUsuarios);
    
    renderTopMaquinasList('top-maquinas-mes-list', topMaquinasMes);
    renderTopMaquinasList('top-maquinas-anio-list', topMaquinasAnio);
    
    updateUsuariosStats(topUsuarios);
}

function getTopMaquinas(period, limit) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const filteredData = mantenimientosData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            
            if (period === 'month') {
                return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
            } else {
                return date.getFullYear() === currentYear;
            }
        } catch {
            return false;
        }
    });
    
    const maquinaCount = {};
    
    filteredData.forEach(row => {
        const maquina = row[2];
        if (maquina) {
            maquinaCount[maquina] = (maquinaCount[maquina] || 0) + 1;
        }
    });
    
    return Object.entries(maquinaCount)
        .map(([maquina, count]) => ({ maquina, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopMaquinasBarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(item => item.maquina);
    const counts = data.map(item => item.count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de problemas',
                data: counts,
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
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
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

function renderTopMaquinasList(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'top-item';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="name">${item.maquina}</div>
            <div class="count">${item.count} problemas</div>
        `;
        container.appendChild(itemElement);
    });
}

function getTopUsuarios(limit) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const yearData = mantenimientosData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    const usuarioCount = {};
    
    yearData.forEach(row => {
        const usuario = row[1];
        if (usuario) {
            usuarioCount[usuario] = (usuarioCount[usuario] || 0) + 1;
        }
    });
    
    return Object.entries(usuarioCount)
        .map(([usuario, count]) => ({ usuario, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopUsuariosBarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(item => item.usuario);
    const counts = data.map(item => item.count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Registros enviados',
                data: counts,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: 'rgba(139, 92, 246, 1)',
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
                        color: '#cbd5e1',
                        font: {
                            size: 11
                        }
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

function updateUsuariosStats(usuarios) {
    const container = document.getElementById('usuarios-stats');
    if (!container) return;
    
    let html = '';
    usuarios.forEach(usuario => {
        html += `
            <div class="stat-card">
                <div class="stat-value">${usuario.usuario}</div>
                <div class="stat-label">${usuario.count} registros este año</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderAsistenciasAnalysis() {
    const topFaltasMes = getTopFaltas('month', 10);
    const topFaltasAnio = getTopFaltas('year', 10);
    const topPermisosDia = getTopPermisos('dia', 10);
    const topPermisosHora = getTopPermisos('hora', 10);
    
    renderTopFaltasBarChart('topFaltasMesChart', topFaltasMes, 'Faltas injustificadas por mes');
    renderTopFaltasBarChart('topFaltasAnioChart', topFaltasAnio, 'Faltas injustificadas por año');
    renderTopPermisosBarChart('topPermisosDiaChart', topPermisosDia, 'Permisos por día');
    renderTopPermisosBarChart('topPermisosHoraChart', topPermisosHora, 'Permisos por hora');
    
    renderTopList('top-faltas-mes-list', topFaltasMes, 'faltas');
    renderTopList('top-faltas-anio-list', topFaltasAnio, 'faltas');
}

function getTopFaltas(period, limit) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const filteredData = asistenciasData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            
            if (period === 'month') {
                return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
            } else {
                return date.getFullYear() === currentYear;
            }
        } catch {
            return false;
        }
    }).filter(row => {
        const motivo = (row[2] || '').toString().toLowerCase();
        return motivo.includes('falta injustificada');
    });
    
    const personaCount = {};
    
    filteredData.forEach(row => {
        const nombre = row[1];
        if (nombre) {
            personaCount[nombre] = (personaCount[nombre] || 0) + 1;
        }
    });
    
    return Object.entries(personaCount)
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopFaltasBarChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(item => item.nombre);
    const counts = data.map(item => item.count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: counts,
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
                        color: '#cbd5e1',
                        font: {
                            size: 10
                        }
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

function getTopPermisos(tipo, limit) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const yearData = asistenciasData.filter(row => {
        const dateStr = row[0];
        if (!dateStr) return false;
        
        try {
            const date = new Date(dateStr);
            return date.getFullYear() === currentYear;
        } catch {
            return false;
        }
    }).filter(row => {
        const motivo = (row[2] || '').toString().toLowerCase();
        if (tipo === 'dia') {
            return motivo.includes('permiso - por día') || motivo.includes('permiso por día');
        } else {
            return motivo.includes('permiso - por hora') || motivo.includes('permiso por hora');
        }
    });
    
    const personaCount = {};
    
    yearData.forEach(row => {
        const nombre = row[1];
        if (nombre) {
            personaCount[nombre] = (personaCount[nombre] || 0) + 1;
        }
    });
    
    return Object.entries(personaCount)
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function renderTopPermisosBarChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = data.map(item => item.nombre);
    const counts = data.map(item => item.count);
    const color = title.includes('día') ? 'rgba(59, 130, 246, 0.7)' : 'rgba(6, 182, 212, 0.7)';
    const borderColor = title.includes('día') ? 'rgba(59, 130, 246, 1)' : 'rgba(6, 182, 212, 1)';
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: counts,
                backgroundColor: color,
                borderColor: borderColor,
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
                        color: '#cbd5e1',
                        font: {
                            size: 10
                        }
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

function renderTopList(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'top-item';
        itemElement.style.animationDelay = `${index * 0.1}s`;
        itemElement.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="name">${item.nombre}</div>
            <div class="count">${item.count} ${type}</div>
        `;
        container.appendChild(itemElement);
    });
}
