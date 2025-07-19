// Configuración de conexiones a Google Sheets
const sheetConnections = {
  produccion: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwJ4etjCog-Bgiwziyvrs4QSZU_tRLaWLCTabQCC7nmP_WMTk9tfpWtMvNeW7ZDc23E/exec',
    spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
    sheetName: 'Inventario de Placas'
  },
  scrap: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwJ4etjCog-Bgiwziyvrs4QSZU_tRLaWLCTabQCC7nmP_WMTk9tfpWtMvNeW7ZDc23E/exec',
    spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
    sheetName: 'Inventario de Placas'
  },
  bonding: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwJ4etjCog-Bgiwziyvrs4QSZU_tRLaWLCTabQCC7nmP_WMTk9tfpWtMvNeW7ZDc23E/exec',
    spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
    sheetName: 'Inventario de Placas'
  },
  flycut: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwJ4etjCog-Bgiwziyvrs4QSZU_tRLaWLCTabQCC7nmP_WMTk9tfpWtMvNeW7ZDc23E/exec',
    spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
    sheetName: 'Flycut Stock-mx'
  },
  materiales: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwJ4etjCog-Bgiwziyvrs4QSZU_tRLaWLCTabQCC7nmP_WMTk9tfpWtMvNeW7ZDc23E/exec',
    spreadsheetId: '1Mk8xFzapTzXl2QUaY8G8tS413W3dVKKOt2OF_Xf4FTY',
    sheetName: 'Flycut Stock-mx'
  }
};

// Objeto principal para almacenar los datos del formulario
const formData = {
    fecha: '', 
    lider: '',
    turno: '',
    horas: '8',
    maquinas: '7',
    produccion: {
        '9101': 0, '9102': 0, '9103': 0, '9103R': 0, '9104': 0, '9105': 0, '9114': 0, '9115': 0,
        '1201': 0, '1202': 0, '1203': 0, '1203R': 0, '1204': 0, '1205': 0,
        '1401': 0, '1402': 0, '1403': 0, '1403R': 0, '1404': 0, '1405': 0,
        '7101': 0, '7102': 0, '7103': 0, '7104': 0,
        '1121': 0, '1122': 0, '1123': 0, '1123R': 0, '1124': 0, '1125': 0, '9206/07 6B': 0,
        '9201': 0, '9202/03 EN': 0, '9208': 0, '9209': 0, '9204/05 MT': 0,
        '1141': 0, '1152': 0, '1155': 0, '1142': 0, '1145': 0,
        '8661': 0, '8662': 0, '8663': 0, '654': 0, '653': 0, '652': 0, '651': 0, '646': 0,
        '634': 0, '635': 0, '636': 0, '698': 0, '697': 0, '696': 0,
        '6774': 0, '6775': 0, '6776': 0, '6985': 0, '6001': 0, '6002': 0, '6003': 0, '6004': 0
    },
    scrap: {
        '9101': 0, '9102': 0, '9103': 0, '9103R': 0, '9104': 0, '9105': 0, '9114': 0, '9115': 0,
        '1201': 0, '1202': 0, '1203': 0, '1203R': 0, '1204': 0, '1205': 0,
        '1401': 0, '1402': 0, '1403': 0, '1403R': 0, '1404': 0, '1405': 0,
        '7101': 0, '7102': 0, '7103': 0, '7104': 0,
        '1121': 0, '1122': 0, '1123': 0, '1123R': 0, '1124': 0, '1125': 0, '9206/07 6B': 0,
        '9201': 0, '9202/03 EN': 0, '9208': 0, '9209': 0, '9204/05 MT': 0,
        '1141': 0, '1152': 0, '1155': 0, '1142': 0, '1145': 0,
        '8661': 0, '8662': 0, '8663': 0, '654': 0, '653': 0, '652': 0, '651': 0, '646': 0,
        '634': 0, '635': 0, '636': 0, '698': 0, '697': 0, '696': 0,
        '6774': 0, '6775': 0, '6776': 0, '6985': 0, '6001': 0, '6002': 0, '6003': 0, '6004': 0
    },
    bonding: {
        '10': 0, '10R': 0, '12': 0, '12R': 0, '14': 0, '14R': 0, 'NW': 0,
        'STLN': 0, 'BT-025': 0, '6B': 0, 'ENERGY': 0, 'M-5': 0, '5MT': 0, 'R-8': 0
    },
    materiales: {
        '1201-195': 0, '1201-196': 0, '1201-197': 0, '1201-21587': 0, '1201-199': 0,
        '1201-205': 0, '1201-215': 0, '1201-236': 0, '1201-354': 0
    },
    flycut: {
        '0.41': 0, '0.43': 0, '0.45': 0, '0.18': 0, '0.125': 0, '0.125R': 0,
        '0.412': 0, '0.458': 0, '0.25': 0, '0.175': 0,
        '0.3': 0, '0.75': 0, '0.65': 0, '0.33': 0, '0.4': 0,
        '0.6': 0, '0.8': 0, '0.35': 0, '0.39': 0, '0.655': 0,
        '0.15': 0, '0.5': 0, '0.9': 0
    }
};

// Configuración de secciones
const produccionSections = [
    { title: 'PRODUCCION', codes: ['9101', '9102', '9103', '9103R', '9104', '9105', '9114', '9115'] },
    { title: '', codes: ['1201', '1202', '1203', '1203R', '1204', '1205'] },
    { title: '', codes: ['1401', '1402', '1403', '1403R', '1404', '1405'] },
    { title: '', codes: ['7101', '7102', '7103', '7104'] },
    { title: '', codes: ['1121', '1122', '1123', '1123R', '1124', '1125', '9206/07 6B'] },
    { title: '', codes: ['9201', '9202/03 EN', '9208', '9209', '9204/05 MT'] },
    { title: '', codes: ['1141', '1152', '1155', '1142', '1145'] },
    { title: '', codes: ['8661', '8662', '8663', '654', '653', '652', '651', '646'] },
    { title: '', codes: ['634', '635', '636', '698', '697', '696'] },
    { title: '', codes: ['6774', '6775', '6776', '6985', '6001', '6002', '6003', '6004'] }
];

const materialesData = [
    { code: '1201-195', desc: 'ABS PLATE', color: 'Black' },
    { code: '1201-196', desc: '(0.472)', color: '' },
    { code: '1201-197', desc: '(0.177)', color: '' },
    { code: '1201-21587', desc: '(0.118)', color: '' },
    { code: '1201-199', desc: '(0.708)', color: '' },
    { code: '1201-205', desc: '(0.944)', color: '' },
    { code: '1201-215', desc: 'RED', color: '(0.177)' },
    { code: '1201-236', desc: '(0.236)', color: '' },
    { code: '1201-354', desc: '(0.354)', color: '' }
];

// Función para obtener fecha actual
function getCurrentDateString() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    return `${month.toString().padStart(2,'0')}/${day.toString().padStart(2,'0')}/${year}`;
}

// Función para determinar líder y turno
function getLeaderAndShift() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 15) {
        return { lider: 'Marco Cruger', turno: '1er turno' };
    } else if (hour >= 15 && hour < 23) {
        return { lider: 'Juan Amador', turno: '2do turno' };
    } else {
        return { lider: 'Roberto Veloz', turno: '3er turno' };
    }
}

// Función para crear secciones de producción
function createProductionSection(containerId, dataKey, inputClass = 'production-input') {
    const container = document.getElementById(containerId);
    
    produccionSections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'production-section';

        const gridDiv = document.createElement('div');
        gridDiv.className = 'production-grid';

        section.codes.forEach(code => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'production-item';

            const labelDiv = document.createElement('div');
            labelDiv.className = 'production-label';
            labelDiv.textContent = code;

            const input = document.createElement('input');
            input.type = 'number';
            input.className = inputClass;
            input.value = formData[dataKey][code] || 0;
            input.min = 0;
            input.dataset.section = dataKey;
            input.dataset.key = code;

            input.addEventListener('input', function() {
                handleInputChange(dataKey, code, parseInt(this.value) || 0);
            });

            itemDiv.appendChild(labelDiv);
            itemDiv.appendChild(input);
            gridDiv.appendChild(itemDiv);
        });

        sectionDiv.appendChild(gridDiv);
        container.appendChild(sectionDiv);
    });
}

// Crear sección de bonding en el DOM
function createBondingSection() {
    const container = document.getElementById('bonding-items');
    
    Object.keys(formData.bonding).forEach(bin => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bonding-item';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'bonding-label';
        labelDiv.textContent = bin;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'bonding-input';
        input.value = formData.bonding[bin] || 0;
        input.min = 0;
        input.dataset.section = 'bonding';
        input.dataset.key = bin;

        input.addEventListener('input', function() {
            handleInputChange('bonding', bin, parseInt(this.value) || 0);
        });

        itemDiv.appendChild(labelDiv);
        itemDiv.appendChild(input);
        container.appendChild(itemDiv);
    });
}

// Crear sección de flycut en el DOM
function createFlycutSection() {
    const container = document.getElementById('flycut-items');
    
    Object.keys(formData.flycut).forEach(code => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flycut-item';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'flycut-label';
        labelDiv.textContent = code;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'flycut-input';
        input.value = formData.flycut[code] || 0;
        input.min = 0;
        input.step = '0.001';
        input.dataset.section = 'flycut';
        input.dataset.key = code;

        input.addEventListener('input', function() {
            handleInputChange('flycut', code, parseFloat(this.value) || 0);
        });

        itemDiv.appendChild(labelDiv);
        itemDiv.appendChild(input);
        container.appendChild(itemDiv);
    });
}

// Crear sección de materiales en el DOM
function createMaterialSection() {
    const container = document.getElementById('material-items');
    
    materialesData.forEach(material => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'material-card';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'material-header';

        const codeDiv = document.createElement('div');
        codeDiv.className = 'material-code';
        codeDiv.textContent = material.code;

        const descDiv = document.createElement('div');
        descDiv.className = 'material-desc';
        descDiv.textContent = material.desc;

        const colorDiv = document.createElement('div');
        colorDiv.className = 'material-color';
        colorDiv.textContent = material.color;

        headerDiv.appendChild(codeDiv);
        headerDiv.appendChild(descDiv);
        headerDiv.appendChild(colorDiv);

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'material-input';
        input.value = formData.materiales[material.code] || 0;
        input.min = 0;
        input.dataset.section = 'materiales';
        input.dataset.key = material.code;

        input.addEventListener('input', function() {
            handleInputChange('materiales', material.code, parseInt(this.value) || 0);
        });

        cardDiv.appendChild(headerDiv);
        cardDiv.appendChild(input);
        container.appendChild(cardDiv);
    });
}

// Manejar cambios en los inputs
function handleInputChange(section, key, value) {
    formData[section][key] = value;
}

// Función principal para enviar datos a Google Sheets
async function handleSubmit() {
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');

    submitBtn.disabled = true;
    submitBtn.classList.remove('submit-button-primary');
    submitBtn.classList.add('submit-button-disabled');
    submitBtn.innerHTML = `
        <div class="spinner"></div>
        ENVIANDO...
    `;

    statusMessage.textContent = '⏳ Enviando datos...';
    statusMessage.className = 'status-message status-loading';
    statusMessage.classList.remove('hidden');

    let statusMessages = [];

    try {
        if (!formData.fecha || !formData.lider) {
            throw new Error('Por favor completa los campos requeridos (fecha y líder)');
        }

        // === Enviar Producción ===
        const produccionFiltrada = {};
        Object.entries(formData.produccion).forEach(([key, val]) => {
            if (val > 0) produccionFiltrada[key] = val;
        });

        if (Object.keys(produccionFiltrada).length > 0) {
            try {
                const queryParams = new URLSearchParams({
                    fecha: formData.fecha,
                    lider: formData.lider,
                    produccion: JSON.stringify(produccionFiltrada)
                });

                const url = `${sheetConnections.produccion.scriptUrl}?${queryParams.toString()}`;
                const response = await fetch(url, { method: 'GET' });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Error al enviar producción');
                }

                statusMessages.push(`✅ Producción enviada correctamente<br><small>Total calculado: ${result.total || 0} unidades</small>`);
                resetForm('produccion');
            } catch (err) {
                statusMessages.push(`❌ Error en producción: ${err.message}`);
            }
        }

        // === Enviar Scrap ===
        const scrapFiltrada = {};
        Object.entries(formData.scrap).forEach(([key, val]) => {
            if (val > 0) scrapFiltrada[key] = -Math.abs(val);
        });

        if (Object.keys(scrapFiltrada).length > 0) {
            try {
                const queryParamsScrap = new URLSearchParams({
                    fecha: formData.fecha,
                    lider: formData.lider,
                    etiqueta: 'SCRAP',
                    scrap: JSON.stringify(scrapFiltrada)
                });

                const urlScrap = `${sheetConnections.scrap.scriptUrl}?${queryParamsScrap.toString()}`;
                const responseScrap = await fetch(urlScrap, { method: 'GET' });
                const resultScrap = await responseScrap.json();

                if (!responseScrap.ok || !resultScrap.success) {
                    throw new Error(resultScrap.message || 'Error al enviar scrap');
                }

                statusMessages.push(`✅ Scrap enviado correctamente<br><small>Total scrap negativo: ${resultScrap.totalNegativo || 0}</small>`);
                resetForm('scrap');
            } catch (err) {
                statusMessages.push(`❌ Error en scrap: ${err.message}`);
            }
        }

        // === Enviar Bonding ===
        const bondingFiltrada = {};
        Object.entries(formData.bonding).forEach(([key, val]) => {
            if (val > 0) bondingFiltrada[key] = val;
        });

        if (Object.keys(bondingFiltrada).length > 0) {
            try {
                const queryParamsBonding = new URLSearchParams({
                    fecha: formData.fecha,
                    lider: formData.lider,
                    bonding: JSON.stringify(bondingFiltrada)
                });

                const urlBonding = `${sheetConnections.bonding.scriptUrl}?${queryParamsBonding.toString()}`;
                const responseBonding = await fetch(urlBonding, { method: 'GET' });
                const resultBonding = await responseBonding.json();

                if (!responseBonding.ok || !resultBonding.success) {
                    throw new Error(resultBonding.message || 'Error al enviar bonding');
                }

                statusMessages.push(`✅ Bonding enviado correctamente`);
                resetForm('bonding');
            } catch (err) {
                statusMessages.push(`❌ Error en bonding: ${err.message}`);
            }
        }
                // === Enviar Flycut ===
        const flycutFiltrada = {};
        Object.entries(formData.flycut).forEach(([key, val]) => {
            if (val > 0) flycutFiltrada[key] = val;
        });

        if (Object.keys(flycutFiltrada).length > 0) {
            try {
                const queryParamsFlycut = new URLSearchParams({
                    fecha: formData.fecha,
                    lider: formData.lider,
                    flycut: JSON.stringify(flycutFiltrada)
                });

                const urlFlycut = `${sheetConnections.flycut.scriptUrl}?${queryParamsFlycut.toString()}`;
                const responseFlycut = await fetch(urlFlycut, { method: 'GET' });
                const resultFlycut = await responseFlycut.json();

                if (!responseFlycut.ok || !resultFlycut.success) {
                    throw new Error(resultFlycut.message || 'Error al enviar Flycut');
                }

                statusMessages.push(`✅ Flycut enviado correctamente`);
                resetForm('flycut');
            } catch (err) {
                statusMessages.push(`❌ Error en Flycut: ${err.message}`);
            }
            
        }

        // === Enviar Materiales ===
const materialesFiltrados = {};
Object.entries(formData.materiales).forEach(([key, val]) => {
  if (val > 0) materialesFiltrados[key] = val;
});

if (Object.keys(materialesFiltrados).length > 0) {
  try {
    const queryParamsMateriales = new URLSearchParams({
      fecha: formData.fecha,
      lider: formData.lider,
      materiales: JSON.stringify(materialesFiltrados)
    });

    const urlMateriales = `${sheetConnections.flycut.scriptUrl}?${queryParamsMateriales.toString()}`;
    const responseMateriales = await fetch(urlMateriales, { method: 'GET' });
    const resultMateriales = await responseMateriales.json();

    if (!responseMateriales.ok || !resultMateriales.success) {
      throw new Error(resultMateriales.message || 'Error al enviar materiales');
    }

    statusMessages.push(`✅ Materiales enviados correctamente`);
    resetForm('material');
  } catch (err) {
    statusMessages.push(`❌ Error en materiales: ${err.message}`);
  }
}


        if (statusMessages.length === 0) {
            throw new Error('No se detectaron datos válidos para enviar.');
        }

        statusMessage.innerHTML = statusMessages.join('<br>');
        statusMessage.className = statusMessages.some(m => m.includes('❌'))
            ? 'status-message status-error'
            : 'status-message status-success';

    } catch (error) {
        statusMessage.textContent = `❌ Error general: ${error.message}`;
        statusMessage.className = 'status-message status-error';
    } finally {
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('submit-button-disabled');
            submitBtn.classList.add('submit-button-primary');
            submitBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                     class="feather feather-send">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                ENVIAR
            `;
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }, 1000);
    }
}

function resetForm(tipo) {
    if (tipo === 'produccion' && formData.produccion) {
        Object.keys(formData.produccion).forEach(key => formData.produccion[key] = 0);
        document.querySelectorAll('.production-input').forEach(input => input.value = 0);
    }
    if (tipo === 'scrap' && formData.scrap) {
        Object.keys(formData.scrap).forEach(key => formData.scrap[key] = 0);
        document.querySelectorAll('.scrap-input').forEach(input => input.value = 0);
    }
    if (tipo === 'bonding' && formData.bonding) {
        Object.keys(formData.bonding).forEach(key => formData.bonding[key] = 0);
        document.querySelectorAll('.bonding-input').forEach(input => input.value = 0);
    }
    if (tipo === 'flycut' && formData.flycut) {
    Object.keys(formData.flycut).forEach(key => formData.flycut[key] = 0);
    document.querySelectorAll('.flycut-input').forEach(input => input.value = 0);
    }
    if (tipo === 'material' && formData.materiales) {
    Object.keys(formData.materiales).forEach(key => formData.materiales[key] = 0);
    document.querySelectorAll('.material-input').forEach(input => input.value = 0);
    }
}


// Validar datos antes de enviar
function validateProductionData() {
    // Validar campos básicos
    if (!formData.fecha || !formData.lider || !formData.turno) {
        return false;
    }
    
    // Validar que al menos un valor de producción sea mayor que 0
    const hasProduction = Object.values(formData.produccion).some(val => val > 0);
    
    return hasProduction;
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    formData.fecha = getCurrentDateString();
    document.getElementById('fecha').value = formData.fecha;

    // Establecer líder y turno según la hora
    const leaderAndShift = getLeaderAndShift();
    formData.lider = leaderAndShift.lider;
    formData.turno = leaderAndShift.turno;

    document.getElementById('lider').value = formData.lider;
    document.getElementById('turno').value = formData.turno;

    // Crear todas las secciones del formulario
    createProductionSection('production-sections', 'produccion');
    createProductionSection('scrap-sections', 'scrap', 'production-input scrap-input');
    createBondingSection();
    createFlycutSection();
    createMaterialSection();

    // Configurar pestañas
    const tabs = document.querySelectorAll('.section-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const sectionId = this.dataset.section + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Manejar cambios en horas y máquinas
    document.getElementById('horas').addEventListener('input', function() {
        formData.horas = this.value;
    });

    document.getElementById('maquinas').addEventListener('input', function() {
        formData.maquinas = this.value;
    });

    // Configurar el botón de enviar
    document.getElementById('submit-btn').addEventListener('click', handleSubmit);
});