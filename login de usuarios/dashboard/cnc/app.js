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
        '0.410': 0, '0.430': 0, '0.450': 0, '0.180': 0, '0.125': 0, '0.125R': 0,
        '0.412': 0, '0.458': 0, '0.250': 0, '0.175': 0,
        '0.300': 0, '0.750': 0, '0.650': 0, '0.330': 0, '0.400': 0,
        '0.600': 0, '0.800': 0, '0.350': 0, '0.390': 0, '0.655': 0,
        '0.150': 0, '0.500': 0, '0.900': 0
    }
};

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

function getCurrentDateString() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    return `${month.toString().padStart(2,'0')}/${day.toString().padStart(2,'0')}/${year}`;
}

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

document.addEventListener('DOMContentLoaded', function() {
    formData.fecha = getCurrentDateString();
    document.getElementById('fecha').value = formData.fecha;

    const leaderAndShift = getLeaderAndShift();
    formData.lider = leaderAndShift.lider;
    formData.turno = leaderAndShift.turno;

    document.getElementById('lider').value = formData.lider;
    document.getElementById('turno').value = formData.turno;

    createProductionSection('production-sections', 'produccion');
    createProductionSection('scrap-sections', 'scrap', 'production-input scrap-input');
    createBondingSection();
    createFlycutSection();
    createMaterialSection();

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

    document.getElementById('horas').addEventListener('input', function() {
        formData.horas = this.value;
    });

    document.getElementById('maquinas').addEventListener('input', function() {
        formData.maquinas = this.value;
    });

    document.getElementById('submit-btn').addEventListener('click', handleSubmit);
});

function handleInputChange(section, key, value) {
    formData[section][key] = value;
}

function handleSubmit() {
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');

    submitBtn.disabled = true;
    submitBtn.classList.remove('submit-button-primary');
    submitBtn.classList.add('submit-button-disabled');
    submitBtn.innerHTML = `
        <div class="spinner"></div>
        ENVIANDO...
    `;

    statusMessage.textContent = '⏳ Enviando producción...';
    statusMessage.className = 'status-message status-loading';
    statusMessage.classList.remove('hidden');

    setTimeout(() => {
        statusMessage.textContent = '✅ Producción enviada exitosamente';
        statusMessage.className = 'status-message status-success';

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
                ENVIAR PRODUCCION
            `;

            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 3000);
        }, 3000);
    }, 2000);
}