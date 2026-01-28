const bitacorasData = [
    {
        tipo: 'salida_emergencia',
        numero: '001',
        nombre: 'Salida de Emergencia',
        descripcion: 'Bitácora de salidas de emergencia',
        norma: 'NOM-001-STPS-2008',
        tituloNorma: 'Edificios, locales e instalaciones',
        frecuencia: 'Semestral'
    },
    {
        tipo: 'aire',
        numero: '001',
        nombre: 'Aire Acondicionado',
        descripcion: 'Bitácora de aires acondicionados',
        norma: 'NOM-001-STPS-2008',
        tituloNorma: 'Edificios, locales e instalaciones',
        frecuencia: 'Anual'
    },
    {
        tipo: 'ocular',
        numero: '001',
        nombre: 'Verificación Ocular',
        descripcion: 'Bitácora de revisión ocular',
        norma: 'NOM-001-STPS-2008',
        tituloNorma: 'Edificios, locales e instalaciones',
        frecuencia: 'Anual'
    },
    {
        tipo: 'lavaojos',
        numero: '002',
        nombre: 'Lavaojos de Emergencia',
        descripcion: 'Bitácora de lavaojos de emergencia',
        norma: 'NOM-002-STPS-2010',
        tituloNorma: 'Prevención y protección contra incendios',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'kit_derrames',
        numero: '002',
        nombre: 'Kit Antiderrames',
        descripcion: 'Bitácora del kit antiderrames',
        norma: 'NOM-002-STPS-2010',
        tituloNorma: 'Prevención y protección contra incendios',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'detectores',
        numero: '002',
        nombre: 'Detectores de Humo',
        descripcion: 'Bitácora de detectores de humo',
        norma: 'NOM-002-STPS-2010',
        tituloNorma: 'Prevención y protección contra incendios',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'lamparas',
        numero: '002',
        nombre: 'Lámparas de Emergencia',
        descripcion: 'Bitácora de lámparas de emergencia',
        norma: 'NOM-002-STPS-2010',
        tituloNorma: 'Prevención y protección contra incendios',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'pallet',
        numero: '006',
        nombre: 'Pallet Jack',
        descripcion: 'Bitácora de pallet jack',
        norma: 'NOM-006-STPS-2023',
        tituloNorma: 'Almacenamiento y manejo de materiales',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'estantes',
        numero: '006',
        nombre: 'Estantes',
        descripcion: 'Bitácora de revision de estantes',
        norma: 'NOM-006-STPS-2023',
        tituloNorma: 'Almacenamiento y manejo de materiales',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'montacargas',
        numero: '006',
        nombre: 'Montacargas',
        descripcion: 'Bitácora de montacargas',
        norma: 'NOM-006-STPS-2023',
        tituloNorma: 'Almacenamiento y manejo de materiales',
        frecuencia: 'Diario'
    },
    {
        tipo: 'escaleras',
        numero: '009',
        nombre: 'Escaleras para Trabajos en Altura',
        descripcion: 'Bitácora de escaleras para trabajos en altura',
        norma: 'NOM-009-STPS-2011',
        tituloNorma: 'Trabajos en altura',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'equipos',
        numero: '009',
        nombre: 'Equipo para Trabajos en Altura',
        descripcion: 'Bitácora de equipos para trabajos en altura',
        norma: 'NOM-009-STPS-2011',
        tituloNorma: 'Trabajos en altura',
        frecuencia: 'Diario'
    },
    {
        tipo: 'compresor',
        numero: '020',
        nombre: 'Recipientes sujetos a presion y calderas',
        descripcion: 'Bitácora de Compresor',
        norma: 'NOM-020-STPS-2011',
        tituloNorma: 'Bitacora de revision de compresores',
        frecuencia: 'Diario'
    },
    {
        tipo: 'mantenimiento compresor',
        numero: '020',
        nombre: 'Recipientes sujetos a presion y calderas',
        descripcion: 'Bitácora de Mantenimiento a Compresor',
        norma: 'NOM-020-STPS-2011',
        tituloNorma: 'Bitacora de revision de compresores',
        frecuencia: 'Mensual'
    },
    {
        tipo: 'personal_autorizado',
        numero: '030',
        nombre: 'Personal Autorizado',
        descripcion: 'Bitácora de personal autorizado para trabajos de riesgo',
        norma: 'NOM-030-STPS-2009',
        tituloNorma: 'Servicios preventivos de seguridad y salud',
        frecuencia: 'Anual'
    }
];

const sheetConnections = {
    bitacoras: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbw1r_Hkv3aWEvIOqtf3mP7o82tTlevWTFCGRInBKqSUqPNtlQKUNYNb3dh34NYIh2ld/exec',
        spreadsheetId: 'TU_SPREADSHEET_ID_AQUI',
        sheetName: 'Bitácoras'
    }
};

let currentBitacora = null;
let currentFormType = null;
let formData = {};
let signatureData = null;
let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let modalCallback = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        checkUserAuth();
        renderBitacoras();
        setupEventListeners();
        initializeSignaturePad();
    } catch (error) {
        showNotification('Error al cargar la aplicación', 'error');
    }
}

function checkUserAuth() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            currentUser = {
                name: user.USUARIO || 'Usuario',
                role: user.ROL || 'user'
            };
        } catch (error) {
            console.log('Error parsing user session');
        }
    }
}

function showSection(sectionId) {
    document.getElementById('dashboard').style.display = sectionId === 'dashboard' ? 'grid' : 'none';
    document.getElementById('formContainer').style.display = sectionId === 'form' ? 'block' : 'none';
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
    
    if (sectionId === 'dashboard') {
        renderBitacoras();
    }
}

function renderBitacoras(filter = '') {
    const grid = document.getElementById('bitacorasGrid');
    if (!grid) return;
    
    const filterNorma = document.getElementById('filterNorma')?.value || '';
    const filterFrecuencia = document.getElementById('filterFrecuencia')?.value || '';
    
    let filteredBitacoras = bitacorasData;
    
    if (filter) {
        filteredBitacoras = filteredBitacoras.filter(b => 
            b.nombre.toLowerCase().includes(filter.toLowerCase()) ||
            b.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
            b.numero.includes(filter)
        );
    }
    
    if (filterNorma) {
        filteredBitacoras = filteredBitacoras.filter(b => b.norma === filterNorma);
    }
    
    if (filterFrecuencia) {
        filteredBitacoras = filteredBitacoras.filter(b => b.frecuencia === filterFrecuencia);
    }
    
    const groupedBitacoras = {};
    filteredBitacoras.forEach(bitacora => {
        if (!groupedBitacoras[bitacora.norma]) {
            groupedBitacoras[bitacora.norma] = [];
        }
        groupedBitacoras[bitacora.norma].push(bitacora);
    });
    
    grid.innerHTML = '';
    
    Object.keys(groupedBitacoras).sort().forEach(norma => {
        const bitacorasList = groupedBitacoras[norma];
        const firstBitacora = bitacorasList[0];
        
        const normaSection = document.createElement('div');
        normaSection.className = 'norma-section';
        normaSection.innerHTML = `
            <div class="norma-header">
                <div class="norma-icon">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <div class="norma-info">
                    <h3 class="norma-title">${norma}</h3>
                    <p class="norma-subtitle">${firstBitacora.tituloNorma}</p>
                </div>
                <span class="frecuencia-badge" style="background: ${getFrecuenciaColor(firstBitacora.frecuencia)}20; color: ${getFrecuenciaColor(firstBitacora.frecuencia)};">
                    ${bitacorasList.length} bitácoras
                </span>
            </div>
            <div class="bitacoras-grid">
                ${bitacorasList.map(bitacora => createBitacoraCardHTML(bitacora)).join('')}
            </div>
        `;
        
        grid.appendChild(normaSection);
    });
    
    if (filteredBitacoras.length === 0) {
        grid.innerHTML = `
            <div class="norma-section" style="text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--slate-400); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--slate-600);">No se encontraron bitácoras</h3>
                <p style="color: var(--slate-500);">Intenta con otros criterios de búsqueda</p>
            </div>
        `;
    }
}

function createBitacoraCardHTML(bitacora) {
    const frecuenciaColor = getFrecuenciaColor(bitacora.frecuencia);
    
    return `
        <div class="bitacora-card" onclick="openBitacora('${bitacora.tipo}')">
            <div class="card-header">
                <span class="bitacora-numero">${bitacora.numero}</span>
                <span class="frecuencia-badge" style="background: ${frecuenciaColor}20; color: ${frecuenciaColor};">
                    ${bitacora.frecuencia}
                </span>
            </div>
            <h3 class="bitacora-title">${bitacora.nombre}</h3>
            <p class="bitacora-description">${bitacora.descripcion}</p>
            <button class="btn btn-primary" style="width: 100%;">
                Abrir Bitácora
            </button>
        </div>
    `;
}

function openBitacora(tipo) {
    const bitacora = bitacorasData.find(b => b.tipo === tipo);
    if (!bitacora) return;
    
    currentBitacora = bitacora;
    currentFormType = tipo;
    
    document.getElementById('formTitle').textContent = bitacora.nombre;
    document.getElementById('formSubtitle').textContent = `${bitacora.norma} - ${bitacora.descripcion}`;
    
    document.getElementById('formContent').innerHTML = getFormTemplate(tipo);
    
    showSection('form');
    
    clearSignature();
    
    loadSavedData(tipo);
    
    initializeFormListeners();
}

function getFormTemplate(tipo) {
    const templates = {
        'salida_emergencia': getSalidaEmergenciaTemplate(),
        'aire': getBitacoraAireTemplate(),
        'ocular': getBitacoraVerificacionOcularTemplate(),
        'lavaojos': getBitacoraLavajosTemplate(),
        'kit_derrames': getBitacoraKitDerramesTemplate(),
        'detectores': getBitacoraDetectoresHumoTemplate(),
        'lamparas': getInspeccionLamparasEmergenciaTemplate(),
        'pallet': getFormatoPalletJackTemplate(),
        'estantes': getFormatoRevisionEstantesTemplate(),
        'montacargas': getInspeccionMontacargasTemplate(),
        'escaleras': getBitacoraRevisionEscalerasTemplate(),
        'equipos': getBitacoraEquiposAlturaTemplate(),
        'compresor': getBitacoraRecipientesPresionTemplate(),
        'mantenimiento compresor': getBitacoraMantenimientoRecipientesTemplate(),
        'personal_autorizado': getTablaPersonalAutorizadoTemplate()
    };
    
    return templates[tipo] || getGenericTemplate();
}
//aca inician el temple de cada bitacora
function getSalidaEmergenciaTemplate() {
    const items = [
        'La vía de salida es lo suficientemente ancha',
        'La vía de salida se encuentra protegida contra el paso de llamas y humo',
        'La vía de salida hacia el exterior es la más corta',
        'La vía de salida se encuentra libre de obstáculos',
        'La vía de salida no está obstruida o anulada',
        'La salida de emergencia cuenta con luces de emergencia',
        'La salida de emergencia cuenta con señalización adecuada',
        'El estado físico de la salida cuenta con buenas condiciones de seguridad',
        'La salida cuenta con fácil manejo de entrada y salida',
        'El señalamiento se encuentra en un punto de fácil visualización'
    ];
    
    return `
        <div class="form-group">
            <label class="form-label">Fecha de Inspección *</label>
            <input type="date" class="form-input" id="fecha" required>
        </div>
        <div class="form-group">
            <label class="form-label">Responsable *</label>
            <input type="text" class="form-input" id="responsable" placeholder="Nombre completo" required>
        </div>
        <div class="form-group">
            <label class="form-label">Área/Ubicación</label>
            <input type="text" class="form-input" id="ubicacion" placeholder="Ubicación de la salida">
        </div>
        
        <h3 style="margin: 2rem 0 1rem 0; color: #f8fafc;">Verificaciones</h3>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 12px; text-align: left; color: #f8fafc; border: 1px solid #4b5563; width: 60%;">Verificación</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">Cumple</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">Cantidad</th>
                        <th style="padding: 12px; text-align: left; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 12px; color: #f8fafc; border: 1px solid #4b5563;">
                                ${index + 1}. ${item}
                            </td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #4b5563;">
                                <div class="toggle-switch" style="display: inline-block;">
                                    <input type="checkbox" id="item_${index}">
                                    <span class="toggle-slider"></span>
                                </div>
                            </td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #4b5563;">
                                <input type="number" 
                                       class="form-input" 
                                       id="cantidad_${index}" 
                                       placeholder="0"
                                       min="0"
                                       style="width: 80px; padding: 8px; text-align: center; background-color: #1f2937; border: 1px solid #4b5563; color: #f8fafc; border-radius: 4px;">
                            </td>
                            <td style="padding: 12px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       id="obs_${index}" 
                                       placeholder="Observaciones"
                                       style="width: 100%; padding: 8px; background-color: #1f2937; border: 1px solid #4b5563; color: #f8fafc; border-radius: 4px;">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="form-group">
            <label class="form-label">Observaciones Generales</label>
            <textarea class="form-textarea" id="observaciones" placeholder="Observaciones adicionales..."></textarea>
        </div>
    `;
}

function getGenericTemplate() {
    return `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-tools" style="font-size: 3rem; color: var(--slate-400); margin-bottom: 1rem;"></i>
            <h3 style="color: var(--slate-600);">Formulario en Desarrollo</h3>
            <p style="color: var(--slate-500);">Esta bitácora estará disponible próximamente</p>
        </div>
    `;
}

function getOcularTemplate() {
    return `
        <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input type="date" class="form-input" id="fecha" required>
        </div>
        <div class="form-group">
            <label class="form-label">Responsable *</label>
            <input type="text" class="form-input" id="responsable" required>
        </div>
        <div class="form-group">
            <label class="form-label">Causa de inspección</label>
            <select class="form-select" id="causa">
                <option value="rutinaria">Rutinaria</option>
                <option value="extraordinaria">Evento Extraordinario</option>
            </select>
        </div>
        <div style="text-align: center; padding: 2rem; color: var(--slate-500);">
            <i class="fas fa-eye" style="font-size: 2rem;"></i>
            <p>Formulario de verificación ocular - En desarrollo</p>
        </div>
    `;
}

function getBitacoraAireTemplate() {
    const numFilas = 8;
    
    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #f8fafc; margin-bottom: 0.5rem;">BITACORA DE MANTENIMIENTO DEL SISTEMA DE VENTILACION ARTIFICIAL</h1>
            <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
            <p style="color: #d1d5db; margin-top: 1rem;">Emisión: <span id="fecha-emision">${new Date().toLocaleDateString()}</span></p>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">No. De Identificación</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">Tipo de equipo</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">Capacidad</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Área</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">Tipo de mantenimiento</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Preventivo</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Predictivo</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Correctivo</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">Fecha</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 7%;">Responsable</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">Acciones realizadas</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" class="form-input" style="width: 100%; text-align: center;" id="no_id_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" class="form-input" style="width: 100%;" id="tipo_equipo_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" class="form-input" style="width: 100%;" id="capacidad_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" class="form-input" style="width: 100%;" id="area_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" class="form-input" style="width: 100%;" id="tipo_mantenimiento_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="checkbox" id="preventivo_${index}" style="transform: scale(1.3);">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="checkbox" id="predictivo_${index}" style="transform: scale(1.3);">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="checkbox" id="correctivo_${index}" style="transform: scale(1.3);">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" class="form-input" style="width: 100%;" id="fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" class="form-input" style="width: 100%;" id="responsable_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" style="width: 100%; min-height: 60px;" id="acciones_${index}" placeholder="Acciones realizadas"></textarea>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">CONVENCIONES:</h3>
            <div style="display: flex; gap: 3rem;">
                <div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 0.5rem;">P:</span>
                    <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
                <div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 0.5rem;">O:</span>
                    <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="text-align: center; margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">ENCARGADO DE MANTENIMIENTO</h3>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="display: flex; justify-content: space-between; margin-top: 3rem;">
            <div style="flex: 1;">
                <h3 style="color: #f8fafc; margin-bottom: 1rem;">Firma</h3>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Espacio para firma</span>
                </div>
            </div>
            <div style="flex: 1; margin-left: 2rem;">
                <h3 style="color: #f8fafc; margin-bottom: 1rem;">Nombre</h3>
                <input type="text" class="form-input" style="width: 100%;" id="nombre_encargado" placeholder="Nombre completo del encargado">
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFila()" style="margin-right: 1rem;">
                + Agregar Fila
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarUltimaFila()">
                - Eliminar Última Fila
            </button>
        </div>
    `;
}

let filaCount = 8;

function agregarFila() {
    filaCount++;
    console.log(`Agregar fila ${filaCount}`);
}

function eliminarUltimaFila() {
    if (filaCount > 1) {
        filaCount--;
        console.log(`Eliminar fila, total: ${filaCount}`);
    }
}

function getBitacoraVerificacionOcularTemplate() {
    const secciones = [
        {
            titulo: "1. Señalamientos",
            porcentaje: "100%",
            items: [
                "1.1 Los señalamientos están visibles",
                "1.2 Se encuentran libres de obstrucciones",
                "1.3 Están colocados de manera segura",
                "1.4 Los señalamientos se encuentran en buen estado",
                "1.5 Los señalamientos son del tamaño adecuado",
                "1.6 Se identifican todas las áreas de riesgo"
            ]
        },
        {
            titulo: "2. Salidas normales y de emergencia",
            porcentaje: "100%",
            items: [
                "2.1 Las puertas están libres de obstrucción",
                "2.2 Las puertas se encuentran en buen estado",
                "2.3 Cuentan con señalización de 'Salida de Emergencia'",
                "2.4 Se cuenta con punto de reunión correctamente señalizada y difundida"
            ]
        },
        {
            titulo: "3. Pisos",
            porcentaje: "100%",
            items: [
                "3.1 Los pisos se encuentran en buen estado",
                "3.2 Se identifican los cambios de nivel",
                "3.3 Se encuentran libres de estancamientos de líquidos",
                "3.4 Son llanos en las vías de transito de personal",
                "3.5 Libres de riesgos"
            ]
        },
        {
            titulo: "4. Diques de contención",
            porcentaje: "100%",
            items: [
                "4.1 Libre de obstrucciones",
                "4.2 Recubrimiento opesico en buen estado",
                "4.3 Diques de contenido libres de químicos y sin agua"
            ]
        },
        {
            titulo: "5. Paredes",
            porcentaje: "100%",
            items: [
                "5.1 Se mantienen con colores tales que eviten la reflexión de la luz",
                "5.2 Cuenta con señalización en las zonas de riesgo",
                "5.3 Se encuentran en buen estado",
                "5.4 Son utilizadas para soportar cargas sólo si fueron destinadas para estos fines"
            ]
        },
        {
            titulo: "6. Orden y limpieza",
            porcentaje: "100%",
            items: [
                "6.1 Recipientes para basura y residuos",
                "6.2 Orden y limpieza de las areas",
                "6.3 Pasillos libres de obstáculos",
                "6.4 Condiciones generales de comedor y baños"
            ]
        },
        {
            titulo: "7. Cuartos / Tableros Eléctricos",
            porcentaje: "100%",
            items: [
                "7.1 Acceso restringido, limpio y ordenado (no tener materiales o sustancias almacenados)",
                "7.2 Señalamientos visibles (riesgo eléctrico, sólo personal autorizado, uso de calzado dieléctrico)",
                "7.3 En buenas condiciones",
                "7.4 No se observan riesgos aparentes"
            ]
        },
        {
            titulo: "8. Escaleras, Rampas",
            porcentaje: "100%",
            items: [
                "8.1 Escaleras/Rampas libres de defectos",
                "8.2 Las escaleras cuentan con antiderrapante"
            ]
        },
        {
            titulo: "9. Techos",
            porcentaje: "100%",
            items: [
                "9.1 Protegen de condiciones externas (libres de goteras)",
                "9.2 Cuenta con desagüe en buen estado",
                "9.3 Visualmente se observan en buen estado"
            ]
        },
        {
            titulo: "10. Iluminación",
            porcentaje: "100%",
            items: [
                "10.1 Estado físico adecuado",
                "10.2 Proporcionan una iluminación adecuada"
            ]
        },
        {
            titulo: "11. Ventanas",
            porcentaje: "100%",
            items: [
                "11.1 Ventanas en buen estado libres daños",
                "11.2 Adecuadas al sitio de ubicación",
                "11.3 Cuentan con película antiestallante"
            ]
        },
        {
            titulo: "12. Residuos",
            porcentaje: "100%",
            items: [
                "12.1 Los contenedores de residuos se vacían según procedimientos",
                "12.2 Los contenedores de residuos están etiquetados correctamente",
                "12.3 Contenedores en buenas condiciones"
            ]
        },
        {
            titulo: "13. Seguridad eléctrica",
            porcentaje: "100%",
            items: [
                "13.1 Extensiones eléctricas en buenas condiciones sin empates ni partes sin aislamientos",
                "13.2 Las tomas de corriente no están sobrecargadas"
            ]
        },
        {
            titulo: "14. Almacen",
            porcentaje: "100%",
            items: [
                "14.1 Se respeta la altura maxima permitida",
                "14.2 Pasillos libres de obstáculos",
                "14.3 Materiales correctamente estibados",
                "14.4 Racks libres de daños o deformidades"
            ]
        }
    ];

    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem;">BITACORA DE VERIFICACION OCULAR A LOS CENTROS DE TRABAJO</h1>
            <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal; font-size: 1.2rem;">NOM-001-STPS-2008</h2>
            <h2 style="color: #f8fafc; margin-top: 0.5rem; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
            <p style="color: #d1d5db; margin-top: 1rem; font-style: italic;">
                Realizar verificaciones oculares cada doce meses o en caso de eventos extraordinarios.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="form-group">
                <label class="form-label">Domicilio</label>
                <input type="text" class="form-input" id="domicilio" placeholder="Domicilio del centro de trabajo">
            </div>
            <div class="form-group">
                <label class="form-label">Responsable</label>
                <input type="text" class="form-input" id="responsable" placeholder="Nombre del responsable">
            </div>
            <div class="form-group">
                <label class="form-label">Puesto</label>
                <input type="text" class="form-input" id="puesto" placeholder="Puesto del responsable">
            </div>
            <div class="form-group">
                <label class="form-label">Causa que motiva la inspección</label>
                <input type="text" class="form-input" id="causa" placeholder="Causa de la inspección">
            </div>
            <div class="form-group">
                <label class="form-label">Tipo de evento extraordinario</label>
                <input type="text" class="form-input" id="evento_extraordinario" placeholder="Tipo de evento (si aplica)">
            </div>
            <div class="form-group">
                <label class="form-label">Verificación de instalaciones</label>
                <select class="form-input" id="verificacion_instalaciones">
                    <option value="">Seleccionar</option>
                    <option value="si">Si</option>
                    <option value="no">No</option>
                    <option value="na">N.A.</option>
                </select>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <h3 style="color: #f8fafc; margin-bottom: 1.5rem;">VERIFICACIONES POR SECCIÓN</h3>
        
        ${secciones.map((seccion, seccionIndex) => `
            <div style="margin-bottom: 2rem; background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="color: #f8fafc; margin: 0;">${seccion.titulo}</h4>
                    <span style="color: #60a5fa; font-weight: bold;">${seccion.porcentaje}</span>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #374151;">
                                <th style="padding: 10px; text-align: left; color: #f8fafc; border: 1px solid #4b5563; width: 50%;">Condición</th>
                                <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">Si</th>
                                <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">No</th>
                                <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">N.A.</th>
                                <th style="padding: 10px; text-align: left; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${seccion.items.map((item, itemIndex) => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;">
                                        ${item}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                        <input type="radio" 
                                               name="cond_${seccionIndex}_${itemIndex}" 
                                               value="si"
                                               id="cond_${seccionIndex}_${itemIndex}_si"
                                               style="transform: scale(1.2);">
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                        <input type="radio" 
                                               name="cond_${seccionIndex}_${itemIndex}" 
                                               value="no"
                                               id="cond_${seccionIndex}_${itemIndex}_no"
                                               style="transform: scale(1.2);">
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                        <input type="radio" 
                                               name="cond_${seccionIndex}_${itemIndex}" 
                                               value="na"
                                               id="cond_${seccionIndex}_${itemIndex}_na"
                                               style="transform: scale(1.2);">
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc;">
                                        0
                                    </td>
                                </tr>
                            `).join('')}
                            <tr style="background-color: #374151;">
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: right; color: #f8fafc; font-weight: bold;">
                                    TOTAL
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc;">
                                    <input type="number" 
                                           class="form-input" 
                                           style="width: 60px; padding: 5px; text-align: center;"
                                           id="total_si_${seccionIndex}"
                                           value="0" 
                                           min="0" 
                                           readonly>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc;">
                                    <input type="number" 
                                           class="form-input" 
                                           style="width: 60px; padding: 5px; text-align: center;"
                                           id="total_no_${seccionIndex}"
                                           value="0" 
                                           min="0" 
                                           readonly>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc;">
                                    <input type="number" 
                                           class="form-input" 
                                           style="width: 60px; padding: 5px; text-align: center;"
                                           id="total_na_${seccionIndex}"
                                           value="0" 
                                           min="0" 
                                           readonly>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                    0
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label class="form-label">Condición detectada y evidencia fotográfica</label>
                        <textarea class="form-textarea" 
                                  id="condicion_detectada_${seccionIndex}" 
                                  placeholder="Descripción de condiciones detectadas y referencia a evidencia fotográfica"
                                  style="min-height: 80px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Reparación a realizar</label>
                        <textarea class="form-textarea" 
                                  id="reparacion_${seccionIndex}" 
                                  placeholder="Descripción de reparaciones necesarias"
                                  style="min-height: 80px;"></textarea>
                    </div>
                </div>
            </div>
        `).join('')}
        
        <hr style="border: 1px solid #4b5563; margin: 3rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">RESUMEN GENERAL</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <h4 style="color: #4ade80; margin-bottom: 0.5rem;">TOTAL SI</h4>
                    <input type="number" 
                           class="form-input" 
                           style="width: 100px; margin: 0 auto; padding: 10px; font-size: 1.5rem; text-align: center; font-weight: bold;"
                           id="resumen_total_si"
                           value="0" 
                           readonly>
                </div>
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <h4 style="color: #f87171; margin-bottom: 0.5rem;">TOTAL NO</h4>
                    <input type="number" 
                           class="form-input" 
                           style="width: 100px; margin: 0 auto; padding: 10px; font-size: 1.5rem; text-align: center; font-weight: bold;"
                           id="resumen_total_no"
                           value="0" 
                           readonly>
                </div>
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <h4 style="color: #60a5fa; margin-bottom: 0.5rem;">TOTAL N.A.</h4>
                    <input type="number" 
                           class="form-input" 
                           style="width: 100px; margin: 0 auto; padding: 10px; font-size: 1.5rem; text-align: center; font-weight: bold;"
                           id="resumen_total_na"
                           value="0" 
                           readonly>
                </div>
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="calcularTotales()">
                Calcular Totales
            </button>
        </div>
        
        <script>
        function calcularTotales() {
            // Esta función calcularía los totales de cada sección y el resumen general
            console.log('Calculando totales...');
            // Implementar lógica para sumar los radios seleccionados
        }
        </script>
    `;
}

function getBitacoraLavajosTemplate() {
    const numFilas = 6;
    
    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #f8fafc; margin-bottom: 0.5rem;">BITÁCORA DE INSPECCIÓN PARA LAVAJOJOS</h1>
            <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
            
            <div style="margin: 1.5rem 0; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 150px; height: 80px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Wunderbar</span>
                </div>
            </div>
        </div>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">FECHA DE INSPECCIÓN</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">LIQUIDO LAVADOR</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">SEÑALÉTICA</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">PRESIÓN Y FLUJO</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">SOPORTE SIN DAÑOS</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">ESTADO FISICO</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">OBSERVACIONES</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => {
                        if (index === 4) {
                            return `
                                <tr style="border-bottom: 1px solid #4b5563;">
                                    <td style="padding: 10px; border: 1px solid #4b5563;"></td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;" colspan="6">
                                        <div style="display: flex; align-items: center;">
                                            <span style="font-weight: bold; color: #4ade80; margin-right: 8px;">P:</span>
                                            <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }
                        if (index === 5) {
                            return `
                                <tr style="border-bottom: 1px solid #4b5563;">
                                    <td style="padding: 10px; border: 1px solid #4b5563;"></td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;" colspan="6">
                                        <div style="display: flex; align-items: center;">
                                            <span style="font-weight: bold; color: #f87171; margin-right: 8px;">O:</span>
                                            <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }
                        
                        return `
                            <tr style="border-bottom: 1px solid #4b5563;">
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="date" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="fecha_${index}">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="liquido_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="senaletica_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="presion_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="soporte_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="estado_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <textarea class="form-textarea" 
                                              style="width: 100%; min-height: 60px; resize: vertical;" 
                                              id="observaciones_${index}" 
                                              placeholder="Observaciones"></textarea>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">CONVENCIONES:</h3>
            <div style="display: flex; gap: 3rem; margin-bottom: 1.5rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <div style="width: 20px; height: 20px; background-color: #4ade80; border-radius: 4px; margin-right: 10px;"></div>
                        <span style="color: #f8fafc; font-weight: bold; margin-right: 8px;">P:</span>
                        <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="width: 20px; height: 20px; background-color: #f87171; border-radius: 4px; margin-right: 10px;"></div>
                        <span style="color: #f8fafc; font-weight: bold; margin-right: 8px;">O:</span>
                        <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de ejecución</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="form-group">
                        <label class="form-label">Nombre</label>
                        <input type="text" 
                               class="form-input" 
                               id="responsable_nombre" 
                               placeholder="Nombre completo del responsable">
                    </div>
                    <div>
                        <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                        <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #9ca3af;">Espacio para firma</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-top: 2rem;">
            <h4 style="color: #f8fafc; margin-bottom: 1rem;">Observación</h4>
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #60a5fa;">
                <p style="color: #d1d5db; margin: 0;">
                    Si se detecta alguna anomalía en el estado y funcionamiento del lavaojos, 
                    se debe reportar inmediatamente al departamento de mantenimiento para su 
                    reparación o sustitución.
                </p>
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaLavajos()" style="margin-right: 1rem;">
                + Agregar Fila de Inspección
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaLavajos()">
                - Eliminar Última Fila
            </button>
        </div>
        
        <script>
        let filasLavajos = ${numFilas - 2}; // Restamos las 2 filas de convenciones
        
        function agregarFilaLavajos() {
            filasLavajos++;
            // Lógica para agregar una nueva fila antes de las filas de convenciones
            console.log('Agregar fila lavajos:', filasLavajos);
        }
        
        function eliminarFilaLavajos() {
            if (filasLavajos > 1) {
                filasLavajos--;
                // Lógica para eliminar la última fila (excepto las de convenciones)
                console.log('Eliminar fila lavajos:', filasLavajos);
            }
        }
        </script>
    `;
}

function getBitacoraKitDerramesTemplate() {
    const numFilas = 8;
    
    return `
        <div style="display: flex; align-items: center; margin-bottom: 2rem;">
            <div style="flex-shrink: 0; margin-right: 2rem;">
                <div style="width: 120px; height: 80px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">wunderbar</span>
                </div>
            </div>
            <div style="flex: 1;">
                <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem;">BITÁCORA DE INSPECCIÓN PARA KIT DE ATENCIÓN A DERRAMES</h1>
                <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
            </div>
        </div>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">FECHA DE INSPECCIÓN</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">TARIMA ALMACENADORA DE LÍQUIDOS</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">TOALLAS ABSORBENTES</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">ASERRÍN</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">EQUIPO MANUAL (PALA, PICO, COA...)</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">OBSERVACIONES</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => {
                        if (index === numFilas - 2) {
                            return `
                                <tr style="border-bottom: 1px solid #4b5563;">
                                    <td style="padding: 10px; border: 1px solid #4b5563;"></td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;" colspan="5">
                                        <div style="display: flex; align-items: center;">
                                            <span style="font-weight: bold; color: #4ade80; margin-right: 8px;">P:</span>
                                            <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }
                        if (index === numFilas - 1) {
                            return `
                                <tr style="border-bottom: 1px solid #4b5563;">
                                    <td style="padding: 10px; border: 1px solid #4b5563;"></td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;" colspan="5">
                                        <div style="display: flex; align-items: center;">
                                            <span style="font-weight: bold; color: #f87171; margin-right: 8px;">O:</span>
                                            <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }
                        
                        return `
                            <tr style="border-bottom: 1px solid #4b5563;">
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="date" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="fecha_${index}">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="tarima_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="toallas_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="aserin_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="equipo_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="p">P</option>
                                        <option value="o">O</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <textarea class="form-textarea" 
                                              style="width: 100%; min-height: 60px; resize: vertical;" 
                                              id="observaciones_${index}" 
                                              placeholder="Observaciones"></textarea>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="display: flex; gap: 3rem; margin-bottom: 1.5rem;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <div style="width: 20px; height: 20px; background-color: #4ade80; border-radius: 4px; margin-right: 10px;"></div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 8px;">P:</span>
                    <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 20px; height: 20px; background-color: #f87171; border-radius: 4px; margin-right: 10px;"></div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 8px;">O:</span>
                    <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #1f2937; border-radius: 8px; border-left: 4px solid #60a5fa;">
            <h4 style="color: #f8fafc; margin-bottom: 0.5rem;">Observación:</h4>
            <p style="color: #d1d5db; margin: 0;">
                Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
            </p>
        </div>
        
        <div style="margin-top: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1.5rem;">Responsable de ejecución</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo">
                </div>
                <div class="form-group">
                    <label class="form-label">Puesto</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_puesto" 
                           placeholder="Puesto del responsable">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaKitDerrames()" style="margin-right: 1rem;">
                + Agregar Fila de Inspección
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaKitDerrames()">
                - Eliminar Última Fila
            </button>
        </div>
        
        <script>
        let filasKitDerrames = ${numFilas - 2}; // Restamos las 2 filas de convenciones
        
        function agregarFilaKitDerrames() {
            filasKitDerrames++;
            // Lógica para agregar una nueva fila antes de las filas de convenciones
            console.log('Agregar fila kit derrames:', filasKitDerrames);
        }
        
        function eliminarFilaKitDerrames() {
            if (filasKitDerrames > 1) {
                filasKitDerrames--;
                // Lógica para eliminar la última fila (excepto las de convenciones)
                console.log('Eliminar fila kit derrames:', filasKitDerrames);
            }
        }
        </script>
    `;
}

function getBitacoraDetectoresHumoTemplate() {
    const numFilas = 10;
    
    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="margin-bottom: 1rem;">
                <h1 style="color: #f8fafc; margin: 0; font-size: 2rem; font-weight: bold;">Wunderbar</h1>
            </div>
            
            <h2 style="color: #f8fafc; margin-bottom: 0.5rem;">BITACORA DE INSPECCIÓN DE DETECTORES DE HUMO</h2>
            <h3 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h3>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">FECHA</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">NO. DE DETECTOR</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">UBICACIÓN</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">REVISIÓN VISUAL</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">ALARMA SONORA</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">FECHA DE REMPLAZO</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">PANEL DE CONTROL (FUNCIONAMIENTO NORMAL)</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 16%;">OBSERVACIONES</th>
                        <th style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">REVISO</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="no_detector_${index}" 
                                       placeholder="Número">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="ubicacion_${index}" 
                                       placeholder="Ubicación">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="revision_visual_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="alarma_sonora_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="fecha_remplazo_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="panel_control_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 60px; resize: vertical;" 
                                          id="observaciones_${index}" 
                                          placeholder="Observaciones"></textarea>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="checkbox" 
                                       id="reviso_${index}" 
                                       style="transform: scale(1.3);">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">CONVENCIONES:</h3>
            <div style="display: flex; gap: 3rem;">
                <div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 0.5rem;">P:</span>
                    <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
                <div>
                    <span style="color: #f8fafc; font-weight: bold; margin-right: 0.5rem;">O:</span>
                    <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de ejecución</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo del responsable">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #1f2937; border-radius: 8px; border-left: 4px solid #60a5fa;">
            <h4 style="color: #f8fafc; margin-bottom: 0.5rem;">Observación:</h4>
            <p style="color: #d1d5db; margin: 0;">
                Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
            </p>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-top: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Puesto</h3>
            <div style="max-width: 400px;">
                <input type="text" 
                       class="form-input" 
                       id="puesto_responsable" 
                       placeholder="Puesto del responsable">
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaDetectores()" style="margin-right: 1rem;">
                + Agregar Fila de Inspección
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaDetectores()">
                - Eliminar Última Fila
            </button>
        </div>
        
        <script>
        let filasDetectores = ${numFilas};
        
        function agregarFilaDetectores() {
            filasDetectores++;
            // Lógica para agregar una nueva fila
            console.log('Agregar fila detectores:', filasDetectores);
        }
        
        function eliminarFilaDetectores() {
            if (filasDetectores > 1) {
                filasDetectores--;
                // Lógica para eliminar la última fila
                console.log('Eliminar fila detectores:', filasDetectores);
            }
        }
        </script>
    `;
}

function getInspeccionLamparasEmergenciaTemplate() {
    const numFilas = 8;
    
    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem;">FORMATO MENSUAL DE INSPECCION DE LAMPARAS DE EMERGENCIA</h1>
            <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
        </div>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">#</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">UBICACIÓN</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">PILA EN BUEN ESTADO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 18%;">FUNCIONÓ EN LA PRUEBA DE ENCENDIO/APAGADO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">CONEXIONES EN BUEN ESTADO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">SE ENCUENTRA LIMPIA</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">FOCOS EN BUEN ESTADO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 14%;">OBSERVACIÓN/ACCIÓN CORRECTIVA</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                ${index + 1}
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="ubicacion_${index}" 
                                       placeholder="Ubicación">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="pila_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="prueba_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="conexiones_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="limpia_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="focos_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 80px; resize: vertical;" 
                                          id="observacion_${index}" 
                                          placeholder="Observación o acción correctiva"></textarea>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">CONVENCIONES:</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; align-items: center;">
                    <span style="color: #f8fafc; font-weight: bold; min-width: 40px; margin-right: 10px;">P:</span>
                    <span style="color: #d1d5db;">CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="color: #f8fafc; font-weight: bold; min-width: 40px; margin-right: 10px;">O:</span>
                    <span style="color: #d1d5db;">NO CUMPLE CON LAS CONDICIONES ADECUADAS PARA SU BUEN FUNCIONAMIENTO</span>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem; padding: 1.5rem; background-color: #1f2937; border-radius: 8px; border-left: 4px solid #60a5fa;">
            <h4 style="color: #f8fafc; margin-bottom: 0.5rem;">Observación:</h4>
            <p style="color: #d1d5db; margin: 0;">
                Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
            </p>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de ejecución</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Puesto</h4>
                <div>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_puesto" 
                           placeholder="Puesto del responsable">
                </div>
            </div>
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Mes de Inspección</h4>
                <div>
                    <input type="month" 
                           class="form-input" 
                           id="mes_inspeccion" 
                           style="width: 100%;">
                </div>
                <div style="margin-top: 1.5rem;">
                    <label class="form-label">Fecha de Inspección</label>
                    <input type="date" 
                           class="form-input" 
                           id="fecha_inspeccion" 
                           style="width: 100%;">
                </div>
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaLamparas()" style="margin-right: 1rem;">
                + Agregar Firma
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaLamparas()">
                - Eliminar Última Firma
            </button>
        </div>
        
        <script>
        let filasLamparas = ${numFilas};
        
        function agregarFilaLamparas() {
            filasLamparas++;
            // Lógica para agregar una nueva fila con el número consecutivo
            console.log('Agregar fila lámparas:', filasLamparas);
        }
        
        function eliminarFilaLamparas() {
            if (filasLamparas > 1) {
                filasLamparas--;
                // Lógica para eliminar la última fila
                console.log('Eliminar fila lámparas:', filasLamparas);
            }
        }
        </script>
    `;
}

function getFormatoPalletJackTemplate() {
    const numFilas = 23;
    
    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: vertical-rl; transform: rotate(180deg); font-size: 2rem; font-weight: bold;"></h1>
                </div>
                <div style="flex: 1;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem; text-align: center;">FORMATO MENSUAL DE PALLET JACK</h1>
                    <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal; text-align: center;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
                </div>
            </div>
        </div>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">NO.</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">SERIE</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Fecha</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">NORTE/CENTRAL DE SALUD PÚBLICA</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">PRUEBA DE VELOCIDAD</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">VENTURA DE SUENTO DISEÑADO</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">VENTURA DE SUENTO DISEÑADO</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">VENTURA DE SUENTÓ DISEÑADO</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">NORTE/CENTRAL DE SALUD PÚBLICA</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">NORTE/CENTRAL DE SALUD PÚBLICA</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">NORTE/CENTRAL DE SALUD PÚBLICA</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 7%;">Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                ${index + 1}
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="serie_${index}" 
                                       placeholder="Serie">
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="fecha_${index}">
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="norte_salud_1_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="prueba_velocidad_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="ventura_1_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="ventura_2_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="ventura_3_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="norte_salud_2_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="norte_salud_3_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="norte_salud_4_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                          id="observaciones_${index}" 
                                          placeholder="Observaciones"></textarea>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Nota:</h3>
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <ul style="color: #d1d5db; margin: 0; padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.75rem;">
                        <span style="font-weight: bold;">P:</span> Cumple / 
                        <span style="font-weight: bold;">O:</span> No Cumple
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        El supervisor debe verificar que el formato se encuentre totalmente diligenciado
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        No operar el equipo si no reúne los requerimientos de seguridad
                    </li>
                    <li>
                        Si durante la operación detecta o escucha alguna falla repórtela al supervisor o al taller de mantenimiento
                    </li>
                </ul>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de Inspección</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo del inspector">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Supervisor</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="supervisor_nombre" 
                           placeholder="Nombre completo del supervisor">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
            <div class="form-group">
                <label class="form-label">Mes de Inspección</label>
                <input type="month" 
                       class="form-input" 
                       id="mes_inspeccion" 
                       style="width: 100%;">
            </div>
            <div class="form-group">
                <label class="form-label">Área/Departamento</label>
                <input type="text" 
                       class="form-input" 
                       id="area_departamento" 
                       placeholder="Área o departamento">
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaPalletJack()" style="margin-right: 1rem;">
                + Agregar Equipo
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaPalletJack()">
                - Eliminar Último Equipo
            </button>
        </div>
        
        <script>
        let filasPalletJack = ${numFilas};
        
        function agregarFilaPalletJack() {
            filasPalletJack++;
            // Lógica para agregar una nueva fila con el número consecutivo
            console.log('Agregar fila pallet jack:', filasPalletJack);
        }
        
        function eliminarFilaPalletJack() {
            if (filasPalletJack > 1) {
                filasPalletJack--;
                // Lógica para eliminar la última fila
                console.log('Eliminar fila pallet jack:', filasPalletJack);
            }
        }
        </script>
    `;
}

function getFormatoRevisionEstantesTemplate() {
    const numFilas = 23;
    
    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: horizontal-rl; transform: rotate(0deg); font-size: 2rem; font-weight: bold; letter-spacing: 2px;">WUNDERBAR</h1>
                </div>
                <div style="flex: 1;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem; text-align: center;">FORMATO DE REVISION ESTANTES</h1>
                    <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal; text-align: center;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
                </div>
            </div>
        </div>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">NO.</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">UBICACIÓN Y NO. DE IDENTIFICACIÓN</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">Fecha</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">ESTADO/CARGA DEL ESTANTE</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">TRABAJO DE CARGA EN BUEN ESTADO DE LA PARTE</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">ORDEN Y LIMPIEZA DE LA PARTE</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">CANTIDAD, SU INFORMACIÓN DE PESOS Y LOS NIVELES SUPERAN LAS CARGAS MÁXIMAS PERMITIDAS</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">DISTRIBUCIÓN DE LA BARRAS DE ARRIOSTRE</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">LOS ANCLAJES NO ESTÁN DAÑADOS</th>
                        <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                ${index + 1}
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="ubicacion_${index}" 
                                       placeholder="Ubicación y número">
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="fecha_${index}">
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="estado_carga_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="trabajo_carga_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="orden_limpieza_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="cantidad_pesos_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="distribucion_barras_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563; text-align: center;">
                                <select class="form-input" 
                                        style="width: 100%;" 
                                        id="anclajes_${index}">
                                    <option value="">Seleccionar</option>
                                    <option value="p">P</option>
                                    <option value="o">O</option>
                                </select>
                            </td>
                            <td style="padding: 8px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                          id="observaciones_${index}" 
                                          placeholder="Observaciones"></textarea>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Nota:</h3>
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <ul style="color: #d1d5db; margin: 0; padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.75rem;">
                        <span style="font-weight: bold;">P:</span> Cumple / 
                        <span style="font-weight: bold;">O:</span> No Cumple
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        El supervisor debe verificar que el formato se encuentre totalmente diligenciado
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        No operar el equipo si no reúne los requerimientos de seguridad
                    </li>
                    <li>
                        Si durante la operación detecta o escucha alguna falla repórtela al supervisor o al taller de mantenimiento
                    </li>
                </ul>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de Inspección</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo del inspector">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Supervisor</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="supervisor_nombre" 
                           placeholder="Nombre completo del supervisor">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 3rem;">
            <div style="flex: 1;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Firma Final</h4>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del responsable</span>
                </div>
            </div>
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Nombre</h4>
                <input type="text" 
                       class="form-input" 
                       style="width: 100%;" 
                       id="nombre_final" 
                       placeholder="Nombre completo">
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
            <div class="form-group">
                <label class="form-label">Mes de Inspección</label>
                <input type="month" 
                       class="form-input" 
                       id="mes_inspeccion" 
                       style="width: 100%;">
            </div>
            <div class="form-group">
                <label class="form-label">Área/Almacén</label>
                <input type="text" 
                       class="form-input" 
                       id="area_almacen" 
                       placeholder="Área o almacén inspeccionado">
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaEstantes()" style="margin-right: 1rem;">
                + Agregar Estante
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaEstantes()">
                - Eliminar Último Estante
            </button>
        </div>
        
        <script>
        let filasEstantes = ${numFilas};
        
        function agregarFilaEstantes() {
            filasEstantes++;
            // Lógica para agregar una nueva fila con el número consecutivo
            console.log('Agregar fila estantes:', filasEstantes);
        }
        
        function eliminarFilaEstantes() {
            if (filasEstantes > 1) {
                filasEstantes--;
                // Lógica para eliminar la última fila
                console.log('Eliminar fila estantes:', filasEstantes);
            }
        }
        </script>
    `;
}

function getInspeccionMontacargasTemplate() {
    const diasSemana = ['LUN', 'MAR', 'MIER', 'JUE', 'VIER', 'SAB', 'DOM'];
    const itemsInspeccion = [
        {
            categoria: 'PARTE EXTERNA',
            items: [
                { id: 'espejos_laterales', descripcion: 'Espejos laterales', estandar: 'Sin roturas, sin manchas y ajustado' },
                { id: 'limpieza_general', descripcion: 'Limpieza general', estandar: 'Pintura en buen estado, carrocería sin daños, tapetes en buen estado.' },
                { id: 'luces_traseras', descripcion: 'Luces traseras', estandar: 'De freno: mínimo dos / de color rojo / Direccionales: mínimo dos de color amarillo / Retroceso: mínimo dos de color blanco' },
                { id: 'alarma_reversa', descripcion: 'Alarma de reversa', estandar: 'Función automática con el cambio de reversa.' },
                { id: 'extintor', descripcion: 'Extintor de incendio', estandar: 'Extintor PQS / Recargado / Revisado' },
                { id: 'llantas', descripcion: 'Llantas', estandar: 'Libres de rajaduras y sin desgaste excesivo' },
                { id: 'placa', descripcion: 'Placa de montacargas', estandar: 'En buen estado y legible' },
                { id: 'cilindros', descripcion: 'Cilindros de elevación e inclinación', estandar: 'Libres de escape o daños' },
                { id: 'montura_cilindros', descripcion: 'Montura de los cilindros', estandar: 'Firme' },
                { id: 'luces_frontales_altas', descripcion: 'Indicadores luces frontales altas', estandar: 'Funcionando correctamente.' },
                { id: 'luces_direccionales', descripcion: 'Indicadores luces direccionales', estandar: 'Funcionando correctamente.' },
                { id: 'luces_delanteras', descripcion: 'Lámparas Luces delanteras', estandar: 'Lentes sin roturas/ funcionando / de color blanco / amarillo' },
                { id: 'luces_parqueo', descripcion: 'Indicador luces de parqueo', estandar: 'Mínimo dos / funcionando correctamente.' },
                { id: 'tanque_combustible', descripcion: 'Tanque de combustible/gas', estandar: 'Sin fugas / ajustado / con tapa original y ajustada' }
            ]
        },
        {
            categoria: 'COMPARTIMIENTO DEL MOTOR',
            items: [
                { id: 'fuente_energia', descripcion: 'Fuente de energía', estandar: 'Sin rajaduras/ Aislada adecuadamente' },
                { id: 'conexiones_electricas', descripcion: 'Conexiones eléctricas', estandar: 'Firmes y en buen estado' },
                { id: 'refrigeracion', descripcion: 'Nivel agua refrigeración / mangueras', estandar: 'Nivel correcto / mangueras sin fugas' },
                { id: 'lineas_hidraulicas', descripcion: 'Estado de las líneas hidráulicas', estandar: 'Líneas sin fugas y en buen estado' },
                { id: 'niveles_aceite', descripcion: 'Niveles de aceite motor / hidráulico', estandar: 'Niveles de acuerdo al fabricante.' },
                { id: 'cableado_electrico', descripcion: 'Cableado eléctrico', estandar: 'Aislado / sin roturas / ajustados' },
                { id: 'direccion', descripcion: 'Botella de dirección / Nivel aceite', estandar: 'Sin fugas/ bien asegurado / nivel correcto' }
            ]
        },
        {
            categoria: 'INTERIOR DE LA CABINA',
            items: [
                { id: 'espejo_retrovisor', descripcion: 'Espejos retrovisor interior', estandar: 'Sin roturas / sin manchas / ajustado' },
                { id: 'vidrios', descripcion: 'Vidrio parabrisas/ vidrios ventanas', estandar: 'Sin roturas / manchas / distorsiones' },
                { id: 'limpiador_parabrisas', descripcion: 'Plumillas limpiovidrios/ motor lavaparabrisas', estandar: 'Mínimo two / empaque sin desgastes / funcionando / mínimo dos revoluciones' },
                { id: 'estado_cabina', descripcion: 'Estado de la cabina del operador', estandar: 'Protegida y en buen estado en general' },
                { id: 'indicador_combustible', descripcion: 'Indicador de combustible', estandar: 'La barra o indicador debe mostrar el nivel de combustible' },
                { id: 'indicador_presion_aceite', descripcion: 'Indicador presión de aceite motor', estandar: 'Que se ilumine al encender el motor' },
                { id: 'sillas', descripcion: 'Sillas/ Apoyo para la cabeza', estandar: 'Atornilladas al piso/ apoyo para la cabeza asegurado' },
                { id: 'pedales', descripcion: 'Pedales freno / clutch / acelerador', estandar: 'Con forro antideslizante / sin juego excesivo' },
                { id: 'alarma_retroceso', descripcion: 'Alarma de retroceso', estandar: 'Funcionando correctamente.' },
                { id: 'cinturones_seguridad', descripcion: 'Cinturones de seguridad', estandar: 'Dos de 3 puntos de apoyo' },
                { id: 'claxon', descripcion: 'Claxon', estandar: 'Funcionando' },
                { id: 'timon', descripcion: 'Timón o volante', estandar: 'Funcionando en perfectas condiciones' },
                { id: 'frenos', descripcion: 'Frenos', estandar: 'Pedales con antideslizante/ nivel de líquido de acuerdo al fabricante' },
                { id: 'horometro', descripcion: 'Horómetro', estandar: 'Funcionando, legible y dentro del rango' }
            ]
        }
    ];

    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem;">INSPECCIÓN PREOPERACIONAL DE MONTACARGAS</h1>
            <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
            <div class="form-group">
                <label class="form-label">Inspeccionado por (Nombre):</label>
                <input type="text" class="form-input" id="inspector_nombre" placeholder="Nombre del inspector">
            </div>
            <div class="form-group">
                <label class="form-label">Supervisor (Nombre):</label>
                <input type="text" class="form-input" id="supervisor_nombre" placeholder="Nombre del supervisor">
            </div>
            <div class="form-group">
                <label class="form-label">Mes:</label>
                <input type="month" class="form-input" id="mes_inspeccion">
            </div>
            <div class="form-group">
                <label class="form-label">Marca:</label>
                <input type="text" class="form-input" id="marca_montacargas" placeholder="Marca del montacargas">
            </div>
            <div class="form-group">
                <label class="form-label">HRS Inicial:</label>
                <input type="number" class="form-input" id="hrs_inicial" placeholder="Horas iniciales" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label class="form-label">HRS Final:</label>
                <input type="number" class="form-input" id="hrs_final" placeholder="Horas finales" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label class="form-label">Semana de:</label>
                <input type="date" class="form-input" id="semana_inicio">
            </div>
            <div class="form-group">
                <label class="form-label">Al:</label>
                <input type="date" class="form-input" id="semana_fin">
            </div>
            <div class="form-group">
                <label class="form-label">Número de Serie/Placa:</label>
                <input type="text" class="form-input" id="numero_serie" placeholder="Número de serie o placa">
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 4%;">ITEM</th>
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 25%;">ESTÁNDAR / DESCRIPCIÓN</th>
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">APLICA</th>
                        ${diasSemana.map(dia => `
                            <th style="padding: 8px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">${dia}</th>
                        `).join('')}
                    </tr>
                    <tr>
                        ${diasSemana.map((_, index) => `
                            <th style="padding: 4px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; font-size: 0.9rem;">
                                <div style="display: flex; justify-content: center; gap: 10px;">
                                    <span style="color: #4ade80;">S</span>
                                    <span style="color: #f87171;">N</span>
                                    <span style="color: #60a5fa;">C</span>
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${itemsInspeccion.map((categoria, catIndex) => `
                        <tr style="background-color: #1f2937;">
                            <td colspan="${diasSemana.length + 4}" style="padding: 10px; border: 1px solid #4b5563;">
                                <h4 style="color: #f8fafc; margin: 0;">${categoria.categoria}</h4>
                            </td>
                        </tr>
                        ${categoria.items.map((item, itemIndex) => {
                            const globalIndex = catIndex * 100 + itemIndex;
                            return `
                                <tr style="border-bottom: 1px solid #4b5563;">
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                        ${globalIndex + 1}
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563;">
                                        <div style="margin-bottom: 5px;">
                                            <strong style="color: #f8fafc;">${item.descripcion}</strong>
                                        </div>
                                        <div style="font-size: 0.9rem; color: #d1d5db;">
                                            ${item.estandar}
                                        </div>
                                    </td>
                                    <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                        <input type="checkbox" 
                                               id="aplica_${globalIndex}" 
                                               style="transform: scale(1.2);"
                                               checked>
                                    </td>
                                    ${diasSemana.map((_, diaIndex) => `
                                        <td style="padding: 5px; border: 1px solid #4b5563;">
                                            <div style="display: flex; justify-content: center; gap: 15px;">
                                                <div>
                                                    <input type="radio" 
                                                           name="item_${globalIndex}_dia_${diaIndex}" 
                                                           value="S"
                                                           id="item_${globalIndex}_dia_${diaIndex}_s"
                                                           style="transform: scale(1.1);">
                                                </div>
                                                <div>
                                                    <input type="radio" 
                                                           name="item_${globalIndex}_dia_${diaIndex}" 
                                                           value="N"
                                                           id="item_${globalIndex}_dia_${diaIndex}_n"
                                                           style="transform: scale(1.1);">
                                                </div>
                                                <div>
                                                    <input type="radio" 
                                                           name="item_${globalIndex}_dia_${diaIndex}" 
                                                           value="C"
                                                           id="item_${globalIndex}_dia_${diaIndex}_c"
                                                           style="transform: scale(1.1);">
                                                </div>
                                            </div>
                                        </td>
                                    `).join('')}
                                </tr>
                            `;
                        }).join('')}
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Recomendaciones / Observaciones:</h3>
            <textarea class="form-textarea" 
                      id="recomendaciones_observaciones" 
                      placeholder="Ingrese aquí las recomendaciones u observaciones encontradas durante la inspección"
                      style="width: 100%; min-height: 120px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
            <div style="flex: 1;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">OPERADOR</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre:</label>
                    <input type="text" 
                           class="form-input" 
                           id="operador_nombre" 
                           placeholder="Nombre del operador">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma:</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Firma del operador</span>
                    </div>
                </div>
            </div>
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">INSPECTOR</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre:</label>
                    <input type="text" 
                           class="form-input" 
                           id="inspector_firma_nombre" 
                           placeholder="Nombre del inspector">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma:</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Firma del inspector</span>
                    </div>
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Nota:</h3>
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <ul style="color: #d1d5db; margin: 0; padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.75rem;">
                        <span style="color: #4ade80; font-weight: bold;">S:</span> Sí Cumple / 
                        <span style="color: #f87171; font-weight: bold;">N:</span> No Cumple / 
                        <span style="color: #60a5fa; font-weight: bold;">C:</span> No Aplica (N.C.)
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        El supervisor debe verificar que el formato se encuentre totalmente diligenciado
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        Si se detecta alguna anomalía en el estado y funcionamiento se reparará inmediatamente
                    </li>
                    <li style="margin-bottom: 0.75rem;">
                        No operar el equipo si no reúne los requerimientos de seguridad
                    </li>
                    <li>
                        Si durante la operación detecta o escucha alguna falla repórtela al supervisor o al taller de mantenimiento
                    </li>
                </ul>
            </div>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button type="button" class="btn btn-primary" onclick="guardarInspeccion()" style="margin-right: 1rem;">
                Guardar Inspección
            </button>
            <button type="button" class="btn btn-secondary" onclick="imprimirFormato()">
                Imprimir Formato
            </button>
        </div>
    `;
}

function getBitacoraRevisionEscalerasTemplate() {
    const numFilas = 20;
    
    const opcionesEstado = [
        { valor: 'b', texto: 'Bien', color: '#4ade80' },
        { valor: 'm', texto: 'Mal', color: '#f87171' },
        { valor: 'r', texto: 'Repone', color: '#fbbf24' },
        { valor: 'c', texto: 'Cambio', color: '#60a5fa' },
        { valor: 'n', texto: 'Nuevo', color: '#c084fc' },
        { valor: 'sc', texto: 'Sucia', color: '#f97316' },
        { valor: 's', texto: 'Se surte por primera vez', color: '#06b6d4' }
    ];

    const itemsRevision = [
        { id: 'zapata', descripcion: 'Zapatas, pistas, Cieladas' },
        { id: 'planos_verticales', descripcion: 'Rele planos verticales, Bordes' },
        { id: 'escaleras', descripcion: 'Escaleras, pistas, pasamanos' },
        { id: 'torno_superior', descripcion: 'Torno superior, barandales' },
        { id: 'torno_inferior', descripcion: 'Torno inferior, base, suelo' },
        { id: 'frecuencia', descripcion: 'Frecuencia de uso' },
        { id: 'limpieza', descripcion: 'Limpieza general' },
        { id: 'aseguramiento', descripcion: 'Aseguramiento de material' },
        { id: 'estado_general', descripcion: 'Estado general' },
        { id: 'eliminacion', descripcion: 'Eliminación de obstáculos' },
        { id: 'soporte', descripcion: 'Soporte estructural' },
        { id: 'cuadro_superior', descripcion: 'Cuadro superior' },
        { id: 'cuadro_inferior', descripcion: 'Cuadro inferior' },
        { id: 'obtener_1', descripcion: 'Obturaciones superiores' },
        { id: 'obtener_2', descripcion: 'Obturaciones medias' },
        { id: 'obtener_3', descripcion: 'Obturaciones inferiores' },
        { id: 'obtener_4', descripcion: 'Obturaciones laterales' },
        { id: 'obtener_5', descripcion: 'Obturaciones de seguridad' },
        { id: 'observado', descripcion: 'Observaciones generales' },
        { id: 'tag', descripcion: 'No. TAG y Ubicación' }
    ];

    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: horizontal-rl; transform: rotate(0deg); font-size: 2rem; font-weight: bold; letter-spacing: 2px;">WUNDERBAR</h1>
                </div>
                <div style="flex: 1;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem; text-align: center;">BITACORA DE REVISION DE ESCALERAS</h1>
                    <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal; text-align: center;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem; background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">ÁREA DE REVISIÓN - CÓDIGOS</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                ${opcionesEstado.map((opcion, index) => `
                    <div style="display: flex; align-items: center; background-color: ${opcion.color}20; padding: 0.5rem 1rem; border-radius: 6px; border-left: 4px solid ${opcion.color};">
                        <div style="width: 12px; height: 12px; background-color: ${opcion.color}; border-radius: 50%; margin-right: 8px;"></div>
                        <span style="color: #f8fafc; font-weight: bold; margin-right: 5px;">${opcion.texto.charAt(0).toUpperCase()}:</span>
                        <span style="color: #d1d5db;">${opcion.texto}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 3rem;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">NO.</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 25%;">ELEMENTO DE REVISIÓN</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 30%;">ESTADO ACTUAL</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">OBSERVACIONES</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">FECHA REVISIÓN</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">REVISÓ</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => {
                        const item = itemsRevision[index] || { id: `item_${index}`, descripcion: `Elemento ${index + 1}` };
                        return `
                            <tr style="border-bottom: 1px solid #4b5563;">
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                    ${index + 1}
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;">
                                    ${item.descripcion}
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="estado_${index}">
                                        <option value="">Seleccionar estado</option>
                                        ${opcionesEstado.map(opcion => `
                                            <option value="${opcion.valor}" style="color: ${opcion.color}; font-weight: bold;">
                                                ${opcion.texto.charAt(0).toUpperCase()} - ${opcion.texto}
                                            </option>
                                        `).join('')}
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <textarea class="form-textarea" 
                                              style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                              id="obs_${index}" 
                                              placeholder="Observaciones específicas"></textarea>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="date" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="fecha_${index}">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <input type="checkbox" 
                                           id="reviso_${index}" 
                                           style="transform: scale(1.3);">
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <!-- AYUDA VISUAL DE ESCALERAS -->
        <div style="margin-bottom: 3rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1.5rem; text-align: center;">AYUDA VISUAL - PARTES DE ESCALERAS</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <!-- Diagrama de escalera -->
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px; position: relative; min-height: 400px;">
                    <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">Diagrama de Escalera</h4>
                    
                    <!-- Representación visual de una escalera -->
                    <div style="position: relative; height: 350px; border: 1px solid #4b5563; border-radius: 4px; padding: 1rem;">
                        <!-- Barandales laterales -->
                        <div style="position: absolute; left: 20px; top: 20px; width: 10px; height: 300px; background-color: #4b5563; border-radius: 2px;"></div>
                        <div style="position: absolute; right: 20px; top: 20px; width: 10px; height: 300px; background-color: #4b5563; border-radius: 2px;"></div>
                        
                        <!-- Pasamanos superior -->
                        <div style="position: absolute; left: 15px; top: 15px; width: calc(100% - 30px); height: 10px; background-color: #60a5fa; border-radius: 2px;"></div>
                        
                        <!-- Escalones -->
                        ${Array.from({length: 10}, (_, i) => {
                            const top = 40 + (i * 28);
                            return `
                                <div style="position: absolute; left: 30px; top: ${top}px; width: calc(100% - 60px); height: 15px; background-color: ${i % 2 === 0 ? '#374151' : '#4b5563'}; border-radius: 2px;"></div>
                            `;
                        }).join('')}
                        
                        <!-- Zapatas (base) -->
                        <div style="position: absolute; left: 15px; bottom: 15px; width: 20px; height: 20px; background-color: #f87171; border-radius: 50%;"></div>
                        <div style="position: absolute; right: 15px; bottom: 15px; width: 20px; height: 20px; background-color: #f87171; border-radius: 50%;"></div>
                        
                        <!-- Leyenda visual -->
                        <div style="position: absolute; bottom: 10px; left: 50px; color: #60a5fa; font-size: 0.8rem;">Pasamanos</div>
                        <div style="position: absolute; top: 100px; left: 10px; color: #4b5563; font-size: 0.8rem;">Barandales</div>
                        <div style="position: absolute; bottom: 10px; left: 10px; color: #f87171; font-size: 0.8rem;">Zapatas</div>
                        <div style="position: absolute; top: 150px; right: 10px; color: #d1d5db; font-size: 0.8rem;">Escalones</div>
                    </div>
                </div>
                
                <!-- Leyenda de partes -->
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <h4 style="color: #f8fafc; margin-bottom: 1rem;">Partes Principales a Revisar</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${[
                            { parte: 'Zapatas/Pistas', desc: 'Base de soporte de la escalera', color: '#f87171' },
                            { parte: 'Pasamanos/Barandales', desc: 'Elementos de seguridad para agarre', color: '#60a5fa' },
                            { parte: 'Escalones/Peldaños', desc: 'Superficies de paso', color: '#d1d5db' },
                            { parte: 'Conexiones/Tornos', desc: 'Uniones y puntos de ensamble', color: '#fbbf24' },
                            { parte: 'Soportes Estructurales', desc: 'Elementos de soporte principal', color: '#4ade80' },
                            { parte: 'Elementos de Fijación', desc: 'Tornillos, pernos y anclajes', color: '#c084fc' },
                            { parte: 'Superficies Antideslizantes', desc: 'Texturas de seguridad', color: '#f97316' }
                        ].map((item, idx) => `
                            <div style="display: flex; align-items: center; padding: 0.5rem; background-color: ${item.color}20; border-radius: 4px; border-left: 3px solid ${item.color};">
                                <div style="width: 12px; height: 12px; background-color: ${item.color}; border-radius: 50%; margin-right: 10px;"></div>
                                <div>
                                    <div style="color: #f8fafc; font-weight: bold; font-size: 0.9rem;">${item.parte}</div>
                                    <div style="color: #9ca3af; font-size: 0.8rem;">${item.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Responsable de Revisión</h4>
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Nombre</label>
                    <input type="text" 
                           class="form-input" 
                           id="responsable_nombre" 
                           placeholder="Nombre completo del inspector">
                </div>
                <div>
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #f8fafc;">Firma</label>
                    <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #9ca3af;">Espacio para firma</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">Datos Generales</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Ubicación de Escalera</label>
                    <input type="text" 
                           class="form-input" 
                           id="ubicacion_escalera" 
                           placeholder="Área o ubicación específica">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">No. TAG/Identificación</label>
                    <input type="text" 
                           class="form-input" 
                           id="tag_escalera" 
                           placeholder="Número de identificación">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Tipo de Escalera</label>
                    <select class="form-input" id="tipo_escalera" style="width: 100%;">
                        <option value="">Seleccionar tipo</option>
                        <option value="fija">Fija</option>
                        <option value="portatil">Portátil</option>
                        <option value="extension">Extensión</option>
                        <option value="tijera">Tijera</option>
                        <option value="caracol">Caracol/Espiral</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: #f8fafc; margin-bottom: 1rem;">Recomendaciones Generales</h4>
            <textarea class="form-textarea" 
                      id="recomendaciones_generales" 
                      placeholder="Ingrese recomendaciones generales de mantenimiento o seguridad"
                      style="width: 100%; min-height: 100px; resize: vertical;"></textarea>
        </div>
        
        <div class="form-group" style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaEscalera()" style="margin-right: 1rem;">
                + Agregar Elemento
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaEscalera()">
                - Eliminar Último Elemento
            </button>
            <button type="button" class="btn btn-success" onclick="generarReporte()" style="margin-left: 1rem;">
                📋 Generar Reporte
            </button>
        </div>
        
        <script>
        let filasEscaleras = ${numFilas};
        
        function agregarFilaEscalera() {
            filasEscaleras++;
            // Lógica para agregar una nueva fila
            console.log('Agregar fila escalera:', filasEscaleras);
        }
        
        function eliminarFilaEscalera() {
            if (filasEscaleras > 1) {
                filasEscaleras--;
                // Lógica para eliminar la última fila
                console.log('Eliminar fila escalera:', filasEscaleras);
            }
        }
        
        function generarReporte() {
            // Lógica para generar reporte de inspección
            console.log('Generando reporte de escalera...');
        }
        </script>
    `;
}

function getBitacoraEquiposAlturaTemplate() {
    const numFilas = 15;
    
    const opcionesEstado = [
        { valor: 'b', texto: 'Bien', color: '#4ade80', icon: '✓' },
        { valor: 'm', texto: 'Mal', color: '#f87171', icon: '✗' },
        { valor: 'r', texto: 'Repone', color: '#fbbf24', icon: '🔄' },
        { valor: 'c', texto: 'Cambio', color: '#60a5fa', icon: '🔄' },
        { valor: 'n', texto: 'Nuevo', color: '#c084fc', icon: '🆕' },
        { valor: 'sc', texto: 'Sucia', color: '#f97316', icon: '🧹' },
        { valor: 's', texto: 'Se surte por primera vez', color: '#06b6d4', icon: '📦' }
    ];

    const equiposAltura = [
        { id: 'arnes', descripcion: 'ARNÉS DE SEGURIDAD', tipo: 'Equipo Personal' },
        { id: 'casco', descripcion: 'CASCO DE SEGURIDAD', tipo: 'Equipo Personal' },
        { id: 'linea_vida', descripcion: 'LÍNEA DE VIDA', tipo: 'Sistema Colectivo' },
        { id: 'eslingas', descripcion: 'ESLINGAS Y CABLES', tipo: 'Equipo Personal' },
        { id: 'mosqueton', descripcion: 'MOSQUETONES Y CONECTORES', tipo: 'Equipo Personal' },
        { id: 'disipador', descripcion: 'DISIPADOR DE ENERGÍA', tipo: 'Equipo Personal' },
        { id: 'andamio', descripcion: 'ANDAMIO', tipo: 'Sistema Colectivo' },
        { id: 'plataforma', descripcion: 'PLATAFORMA ELEVADORA', tipo: 'Sistema Colectivo' },
        { id: 'escalera', descripcion: 'ESCALERA PORTÁTIL', tipo: 'Equipo de Acceso' },
        { id: 'cuerdas', descripcion: 'CUERDAS DE SEGURIDAD', tipo: 'Equipo Personal' },
        { id: 'descensor', descripcion: 'DESCENSOR/RAPEL', tipo: 'Equipo Personal' },
        { id: 'ascensor', descripcion: 'ASCENSOR/ASCENSO', tipo: 'Equipo Personal' },
        { id: 'barandales', descripcion: 'BARANDALES DE PROTECCIÓN', tipo: 'Sistema Colectivo' },
        { id: 'red_seguridad', descripcion: 'RED DE SEGURIDAD', tipo: 'Sistema Colectivo' },
        { id: 'botas', descripcion: 'BOTAS DE SEGURIDAD ANTIDESLIZANTES', tipo: 'Equipo Personal' },
        { id: 'guantes', descripcion: 'GUANTES DE PROTECCIÓN', tipo: 'Equipo Personal' },
        { id: 'gafas', descripcion: 'GAFAS DE SEGURIDAD', tipo: 'Equipo Personal' },
        { id: 'auditivos', descripcion: 'PROTECTORES AUDITIVOS', tipo: 'Equipo Personal' },
        { id: 'cintas', descripcion: 'CINTAS DE SEÑALIZACIÓN', tipo: 'Sistema Colectivo' },
        { id: 'kit_rescate', descripcion: 'KIT DE RESCATE EN ALTURA', tipo: 'Equipo de Emergencia' }
    ];

    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: horizontal-rl; transform: rotate(0deg); font-size: 2rem; font-weight: bold; letter-spacing: 2px;">WUNDERBAR</h1>
                </div>
                <div style="flex: 1; text-align: center;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.5rem;">BITACORA DE REVISION DE EQUIPOS PARA TRABAJOS EN ALTURA</h1>
                    <h2 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h2>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem; background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 style="color: #f8fafc; margin-bottom: 1rem;">ÁREA DE REVISIÓN - CÓDIGOS</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                        ${opcionesEstado.map((opcion) => `
                            <div style="display: flex; align-items: center; background-color: ${opcion.color}20; padding: 0.4rem 0.8rem; border-radius: 4px; border-left: 3px solid ${opcion.color};">
                                <span style="color: ${opcion.color}; font-weight: bold; margin-right: 5px; font-size: 1.2rem;">${opcion.icon}</span>
                                <span style="color: #f8fafc; font-weight: bold; margin-right: 5px;">${opcion.texto.charAt(0).toUpperCase()}:</span>
                                <span style="color: #d1d5db; font-size: 0.9rem;">${opcion.texto}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="background-color: #374151; padding: 1rem; border-radius: 6px; min-width: 200px;">
                    <h4 style="color: #f8fafc; margin-bottom: 0.5rem; text-align: center;">TIPO DE EQUIPOS</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; background-color: #4ade80; border-radius: 50%; margin-right: 8px;"></div>
                            <span style="color: #d1d5db; font-size: 0.9rem;">Equipo Personal</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; background-color: #60a5fa; border-radius: 50%; margin-right: 8px;"></div>
                            <span style="color: #d1d5db; font-size: 0.9rem;">Sistema Colectivo</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; background-color: #c084fc; border-radius: 50%; margin-right: 8px;"></div>
                            <span style="color: #d1d5db; font-size: 0.9rem;">Equipo de Acceso</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; background-color: #f97316; border-radius: 50%; margin-right: 8px;"></div>
                            <span style="color: #d1d5db; font-size: 0.9rem;">Equipo de Emergencia</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="form-group">
                <label class="form-label">Número de Serie ARNÉS:</label>
                <input type="text" class="form-input" id="serie_arnes" placeholder="Serie del arnés principal">
            </div>
            <div class="form-group">
                <label class="form-label">Responsable de Revisión:</label>
                <input type="text" class="form-input" id="responsable_revision" placeholder="Nombre del inspector">
            </div>
            <div class="form-group">
                <label class="form-label">Fecha de Revisión:</label>
                <input type="date" class="form-input" id="fecha_revision">
            </div>
            <div class="form-group">
                <label class="form-label">Área de Trabajo:</label>
                <input type="text" class="form-input" id="area_trabajo" placeholder="Área donde se usarán los equipos">
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 3rem;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">NO.</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 25%;">EQUIPO / DESCRIPCIÓN</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">TIPO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">ESTADO</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">NÚMERO DE SERIE</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">OBSERVACIONES</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">FECHA PRÓXIMA REVISIÓN</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">✓</th>
                    </tr>
                </thead>
                <tbody>
                    ${equiposAltura.slice(0, numFilas).map((equipo, index) => {
                        // Determinar color según tipo
                        let tipoColor = '#4ade80'; // Equipo Personal por defecto
                        if (equipo.tipo === 'Sistema Colectivo') tipoColor = '#60a5fa';
                        if (equipo.tipo === 'Equipo de Acceso') tipoColor = '#c084fc';
                        if (equipo.tipo === 'Equipo de Emergencia') tipoColor = '#f97316';
                        
                        return `
                            <tr style="border-bottom: 1px solid #4b5563;">
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                    ${index + 1}
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc; font-weight: bold;">
                                    ${equipo.descripcion}
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <span style="display: inline-block; padding: 3px 8px; background-color: ${tipoColor}20; color: ${tipoColor}; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">
                                        ${equipo.tipo}
                                    </span>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <select class="form-input" 
                                            style="width: 100%; font-weight: bold;" 
                                            id="estado_${equipo.id}">
                                        <option value="">Seleccionar</option>
                                        ${opcionesEstado.map(opcion => `
                                            <option value="${opcion.valor}" style="color: ${opcion.color};">
                                                ${opcion.icon} ${opcion.texto}
                                            </option>
                                        `).join('')}
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="text" 
                                           class="form-input" 
                                           style="width: 100%; text-align: center;" 
                                           id="serie_${equipo.id}" 
                                           placeholder="Número de serie">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <textarea class="form-textarea" 
                                              style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                              id="obs_${equipo.id}" 
                                              placeholder="Observaciones"></textarea>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="date" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="proxima_revision_${equipo.id}">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <input type="checkbox" 
                                           id="verificado_${equipo.id}" 
                                           style="transform: scale(1.3);">
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
            <!-- INSPECCIÓN VISUAL DE ARNÉS -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">INSPECCIÓN VISUAL DE ARNÉS</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    ${[
                        { id: 'cinturon', desc: 'Cinturón de cadera', check: true },
                        { id: 'piernas', desc: 'Correas de piernas', check: true },
                        { id: 'hombros', desc: 'Correas de hombros', check: true },
                        { id: 'pecho', desc: 'Correa de pecho', check: false },
                        { id: 'costuras', desc: 'Costuras completas', check: true },
                        { id: 'hebillas', desc: 'Hebillas funcionando', check: true },
                        { id: 'anillos', desc: 'Anillos en D', check: true },
                        { id: 'etiquetas', desc: 'Etiquetas legibles', check: true }
                    ].map(item => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background-color: #374151; border-radius: 4px;">
                            <span style="color: #f8fafc; font-size: 0.9rem;">${item.desc}</span>
                            <input type="checkbox" 
                                   id="arnes_${item.id}" 
                                   ${item.check ? 'checked' : ''}
                                   style="transform: scale(1.2);">
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem;">
                    <label class="form-label">Observaciones del Arnés:</label>
                    <textarea class="form-textarea" 
                              style="width: 100%; min-height: 80px; resize: vertical;" 
                              id="obs_arnes" 
                              placeholder="Observaciones específicas del arnés"></textarea>
                </div>
            </div>
            
            <!-- REGISTRO FOTOGRÁFICO -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">REGISTRO FOTOGRÁFICO</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    ${['Frente', 'Reverso', 'Costuras', 'Hebillas', 'Anillos D', 'Etiquetas'].map((item, idx) => `
                        <div style="text-align: center;">
                            <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                                <span style="color: #9ca3af; font-size: 2rem;">📷</span>
                                <span style="color: #9ca3af; font-size: 0.8rem;">${item}</span>
                            </div>
                            <input type="file" 
                                   id="foto_${idx}" 
                                   accept="image/*" 
                                   style="display: none;">
                            <button type="button" 
                                    class="btn btn-secondary" 
                                    onclick="document.getElementById('foto_${idx}').click()"
                                    style="padding: 0.3rem 0.8rem; font-size: 0.8rem; width: 100%;">
                                + Subir
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: #f8fafc; margin-bottom: 1rem;">CONDICIONES DE ALMACENAMIENTO</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                ${[
                    { id: 'limpieza', label: 'Limpieza del área' },
                    { id: 'humedad', label: 'Control de humedad' },
                    { id: 'temperatura', label: 'Temperatura controlada' },
                    { id: 'protegido', label: 'Protegido de luz solar' },
                    { id: 'separado', label: 'Separado de químicos' },
                    { id: 'identificado', label: 'Identificado correctamente' }
                ].map(item => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background-color: #374151; border-radius: 4px;">
                        <span style="color: #f8fafc; font-size: 0.9rem;">${item.label}</span>
                        <select class="form-input" 
                                style="width: 80px; padding: 0.3rem;" 
                                id="almacenamiento_${item.id}">
                            <option value="">N/A</option>
                            <option value="excelente">Excelente</option>
                            <option value="bueno">Bueno</option>
                            <option value="regular">Regular</option>
                            <option value="malo">Malo</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 3rem; margin-bottom: 2rem;">
            <div style="flex: 1;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">INSPECTOR</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre y Firma</label>
                    <input type="text" class="form-input" id="inspector_nombre" placeholder="Nombre del inspector">
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del inspector</span>
                </div>
            </div>
            
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">APROBACIÓN SUPERVISOR</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre y Firma</label>
                    <input type="text" class="form-input" id="supervisor_nombre" placeholder="Nombre del supervisor">
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del supervisor</span>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button type="button" class="btn btn-primary" onclick="guardarRevision()" style="margin-right: 1rem;">
                💾 Guardar Revisión
            </button>
            <button type="button" class="btn btn-success" onclick="generarCertificado()">
                📄 Generar Certificado
            </button>
            <button type="button" class="btn btn-warning" onclick="marcarParaReposicion()" style="margin-left: 1rem;">
                ⚠ Marcar para Reposición
            </button>
        </div>
        
        <script>
        function guardarRevision() {
            console.log('Guardando revisión de equipos de altura...');
        }
        
        function generarCertificado() {
            console.log('Generando certificado de revisión...');
        }
        
        function marcarParaReposicion() {
            console.log('Marcando equipos para reposición...');
        }
        </script>
    `;
}

function getBitacoraRecipientesPresionTemplate() {
    const numFilas = 24; 
    
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaActual.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    
    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: horizontal-rl; transform: rotate(0deg); font-size: 2rem; font-weight: bold; letter-spacing: 2px;">WUNDERBAR</h1>
                </div>
                <div style="flex: 1; text-align: center;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.4rem;">Bitacora de operación y revisión de recipientes sujetos a presión</h1>
                    <h2 style="color: #f8fafc; margin-bottom: 0.3rem; font-weight: normal; font-size: 1.1rem;">conforme NOM-020-STPS-2011</h2>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; margin-top: 0.5rem;">
                        <span style="color: #d1d5db;">Emisión: <span style="color: #f8fafc; font-weight: bold;">${fechaFormateada}</span></span>
                        <span style="color: #d1d5db;">|</span>
                        <h3 style="color: #f8fafc; margin: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h3>
                        <span style="color: #d1d5db;">|</span>
                        <span style="color: #d1d5db; font-weight: bold;">Tijuana</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="form-group">
                <label class="form-label">Nombre genérico del equipo:</label>
                <input type="text" 
                       class="form-input" 
                       id="nombre_equipo" 
                       placeholder="Ej: Compresor de aire, Tanque de almacenamiento, etc." 
                       style="font-weight: bold;">
            </div>
            <div class="form-group">
                <label class="form-label">Número de control asignado por la STPS:</label>
                <input type="text" 
                       class="form-input" 
                       id="numero_stps" 
                       placeholder="Número de registro STPS" 
                       style="font-weight: bold;">
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">ESPECIFICACIONES TÉCNICAS</h4>
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label class="form-label">Presión Máxima de Operación (kg/cm²):</label>
                            <input type="number" 
                                   class="form-input" 
                                   id="presion_maxima" 
                                   placeholder="Ej: 10.5" 
                                   step="0.1">
                        </div>
                        <div>
                            <label class="form-label">Temperatura Máxima (°C):</label>
                            <input type="number" 
                                   class="form-input" 
                                   id="temp_maxima" 
                                   placeholder="Ej: 120" 
                                   step="0.1">
                        </div>
                        <div>
                            <label class="form-label">Capacidad (litros):</label>
                            <input type="number" 
                                   class="form-input" 
                                   id="capacidad" 
                                   placeholder="Ej: 500">
                        </div>
                        <div>
                            <label class="form-label">Año de Fabricación:</label>
                            <input type="number" 
                                   class="form-input" 
                                   id="ano_fabricacion" 
                                   placeholder="Ej: 2020" 
                                   min="1900" 
                                   max="${año}">
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">INFORMACIÓN DE SEGURIDAD</h4>
                <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label">Última Prueba Hidrostática:</label>
                        <input type="date" 
                               class="form-input" 
                               id="ultima_prueba" 
                               style="width: 100%;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label">Próxima Prueba Hidrostática:</label>
                        <input type="date" 
                               class="form-input" 
                               id="proxima_prueba" 
                               style="width: 100%;">
                    </div>
                    <div>
                        <label class="form-label">Válvula de Seguridad (PSV) calibrada:</label>
                        <select class="form-input" id="valvula_calibrada" style="width: 100%;">
                            <option value="">Seleccionar</option>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                            <option value="pendiente">Pendiente</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 3rem;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">HORA</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 8%;">FECHA</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">PRESIÓN DE OPERACIÓN (kg/cm²)</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 12%;">TEMP. DE OPERACIÓN (°C)</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 10%;">PURGA</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">ESTADO GENERAL</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">NOMBRE DE RESPONSABLE</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">FIRMA DE RESPONSABLE</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({length: numFilas}, (_, index) => {
                        const horaBase = 6; 
                        const horas = horaBase + Math.floor(index / 2);
                        const minutos = (index % 2) === 0 ? '00' : '30';
                        const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos}`;
                        
                        return `
                            <tr style="border-bottom: 1px solid #4b5563;">
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                    ${horaFormateada}
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="date" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="fecha_${index}" 
                                           value="${fechaActual.toISOString().split('T')[0]}">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <div style="position: relative;">
                                        <input type="number" 
                                               class="form-input" 
                                               style="width: 100%; text-align: center;" 
                                               id="presion_${index}" 
                                               placeholder="kg/cm²" 
                                               step="0.1" 
                                               min="0">
                                        <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.8rem;">
                                            kg/cm²
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <div style="position: relative;">
                                        <input type="number" 
                                               class="form-input" 
                                               style="width: 100%; text-align: center;" 
                                               id="temperatura_${index}" 
                                               placeholder="°C" 
                                               step="0.1">
                                        <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.8rem;">
                                            °C
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="purga_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="realizada">Realizada</option>
                                        <option value="no_realizada">No Realizada</option>
                                        <option value="no_aplica">No Aplica</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <select class="form-input" 
                                            style="width: 100%;" 
                                            id="estado_${index}">
                                        <option value="">Seleccionar</option>
                                        <option value="normal" style="color: #4ade80;">Normal</option>
                                        <option value="atencion" style="color: #fbbf24;">Requiere Atención</option>
                                        <option value="critico" style="color: #f87171;">Crítico</option>
                                        <option value="parado" style="color: #60a5fa;">Parado</option>
                                    </select>
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563;">
                                    <input type="text" 
                                           class="form-input" 
                                           style="width: 100%;" 
                                           id="responsable_${index}" 
                                           placeholder="Nombre del responsable">
                                </td>
                                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                    <button type="button" 
                                            class="btn btn-secondary" 
                                            onclick="firmarRegistro(${index})"
                                            style="padding: 0.5rem 1rem; font-size: 0.9rem; width: 100%;">
                                        ✍️ Firmar
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
            <!-- GRÁFICA DE PRESIÓN -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">MONITOREO DE PRESIÓN</h4>
                <div style="height: 200px; border: 1px solid #4b5563; border-radius: 4px; padding: 1rem; position: relative;">
                    <!-- Línea de presión máxima permitida -->
                    <div style="position: absolute; top: 20px; left: 0; right: 0; height: 2px; background-color: #f87171; z-index: 1;"></div>
                    <div style="position: absolute; top: 15px; left: 10px; color: #f87171; font-size: 0.8rem; font-weight: bold;">
                        Presión Máx.
                    </div>
                    
                    <!-- Línea de presión normal -->
                    <div style="position: absolute; top: 100px; left: 0; right: 0; height: 2px; background-color: #4ade80; z-index: 1;"></div>
                    <div style="position: absolute; top: 95px; left: 10px; color: #4ade80; font-size: 0.8rem; font-weight: bold;">
                        Presión Normal
                    </div>
                    
                    <!-- Puntos de medición simulados -->
                    <div style="position: relative; height: 100%; display: flex; align-items: flex-end; justify-content: space-around;">
                        ${Array.from({length: 8}, (_, i) => {
                            const altura = 30 + Math.random() * 120;
                            const color = altura > 150 ? '#f87171' : altura > 100 ? '#fbbf24' : '#4ade80';
                            return `
                                <div style="display: flex; flex-direction: column; align-items: center;">
                                    <div style="width: 12px; height: ${altura}px; background-color: ${color}; border-radius: 2px;"></div>
                                    <span style="color: #9ca3af; font-size: 0.7rem; margin-top: 5px;">${6 + i * 2}:00</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button type="button" class="btn btn-primary" onclick="generarGrafica()" style="padding: 0.5rem 1rem;">
                        📊 Actualizar Gráfica
                    </button>
                </div>
            </div>
            
            <!-- REGISTRO DE INCIDENTES -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">REGISTRO DE INCIDENTES / OBSERVACIONES</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Fecha y Hora del Incidente:</label>
                    <input type="datetime-local" class="form-input" id="incidente_fecha" style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Tipo de Incidente:</label>
                    <select class="form-input" id="tipo_incidente" style="width: 100%;">
                        <option value="">Seleccionar</option>
                        <option value="sobrepresion">Sobrepresión</option>
                        <option value="fuga">Fuga</option>
                        <option value="temperatura_alta">Temperatura Alta</option>
                        <option value="falla_valvula">Falla en Válvula</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Descripción:</label>
                    <textarea class="form-textarea" 
                              id="descripcion_incidente" 
                              placeholder="Describa el incidente en detalle"
                              style="width: 100%; min-height: 80px; resize: vertical;"></textarea>
                </div>
                <div style="text-align: center;">
                    <button type="button" class="btn btn-warning" onclick="registrarIncidente()" style="padding: 0.5rem 1rem;">
                        ⚠ Registrar Incidente
                    </button>
                </div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 3rem; margin-bottom: 2rem;">
            <div style="flex: 1;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">RESPONSABLE DE TURNO</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre Completo:</label>
                    <input type="text" class="form-input" id="responsable_turno" placeholder="Nombre del responsable de turno">
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del responsable</span>
                </div>
            </div>
            
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">SUPERVISOR DE SEGURIDAD</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre Completo:</label>
                    <input type="text" class="form-input" id="supervisor_seguridad" placeholder="Nombre del supervisor">
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del supervisor</span>
                </div>
            </div>
            
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">VERIFICACIÓN FINAL</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Bitácora Completada:</label>
                    <select class="form-input" id="bitacora_completada" style="width: 100%;">
                        <option value="">Seleccionar</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                        <option value="parcial">Parcialmente</option>
                    </select>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Observaciones Finales:</label>
                    <textarea class="form-textarea" 
                              id="obs_finales" 
                              placeholder="Observaciones finales del día"
                              style="width: 100%; min-height: 60px; resize: vertical;"></textarea>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button type="button" class="btn btn-primary" onclick="guardarBitacora()" style="margin-right: 1rem; padding: 0.75rem 1.5rem;">
                💾 Guardar Bitácora Diaria
            </button>
            <button type="button" class="btn btn-success" onclick="imprimirReporte()" style="margin-right: 1rem; padding: 0.75rem 1.5rem;">
                🖨️ Imprimir Reporte
            </button>
            <button type="button" class="btn btn-danger" onclick="generarAlerta()" style="padding: 0.75rem 1.5rem;">
            ⚠ Generar Alerta de Seguridad
            </button>
        </div>
        
        <script>
        function firmarRegistro(index) {
         const responsable = document.getElementById('responsable_' + index).value;
         if (!responsable) {
         alert('Por favor, ingrese el nombre del responsable antes de firmar.');
         return;
         }
    
         // Usar querySelector con comillas simples dentro de comillas invertidas
         const boton = document.querySelector('button[onclick="firmarRegistro(' + index + ')"]');
         boton.innerHTML = '✅ Firmado';
         boton.style.backgroundColor = '#4ade80';
         boton.style.color = '#1f2937';
         boton.disabled = true;
    
         console.log('Registro firmado por:', responsable, 'en índice:', index);
        }
        
        function generarGrafica() {
            console.log('Generando nueva gráfica de presión...');
            // Aquí iría la lógica para generar/actualizar la gráfica con datos reales
        }
        
        function registrarIncidente() {
            const fecha = document.getElementById('incidente_fecha').value;
            const tipo = document.getElementById('tipo_incidente').value;
            const descripcion = document.getElementById('descripcion_incidente').value;
            
            if (!fecha || !tipo || !descripcion) {
                alert('Por favor, complete todos los campos del incidente.');
                return;
            }
            
            console.log('Incidente registrado:', { fecha, tipo, descripcion });
            alert('Incidente registrado correctamente. Se notificará al supervisor.');
            
            // Limpiar campos
            document.getElementById('incidente_fecha').value = '';
            document.getElementById('tipo_incidente').value = '';
            document.getElementById('descripcion_incidente').value = '';
        }
        
        function guardarBitacora() {
            console.log('Guardando bitácora de recipientes a presión...');
            alert('Bitácora guardada correctamente.');
        }
        
        function imprimirReporte() {
            console.log('Generando reporte para impresión...');
            window.print();
        }
        
        function generarAlerta() {
            console.log('Generando alerta de seguridad...');
            alert('Alerta de seguridad generada. Se notificará al personal correspondiente.');
        }
        </script>
    `;
}

function getBitacoraMantenimientoRecipientesTemplate() {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaActual.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    
    const itemsVerificacion = [
        { id: 'rotulado', descripcion: '¿El equipo esta rotulado o adecuadamente identificado?' },
        { id: 'placa_datos', descripcion: '¿El equipo cuenta con placa de datos?' },
        { id: 'pintura', descripcion: '¿La pintura del equipo se encuentra en buen estado?' },
        { id: 'corrosion', descripcion: '¿El equipo está libre de corrosión, roturas, abolladuras ó golpes?' },
        { id: 'orden_limpieza', descripcion: '¿Existe orden y limpieza alrededor del equipo?' },
        { id: 'acceso', descripcion: '¿El acceso al equipo se encuentra libre de obstrucciones?' },
        { id: 'purga', descripcion: '¿La purga del equipo opera correctamente?' },
        { id: 'manometro', descripcion: '¿El manómetro se encuentra en buen estado?' },
        { id: 'fugas', descripcion: '¿El equipo se encuentra libre de fugas visibles?' },
        { id: 'valvula_seguridad', descripcion: '¿La válvula de seguridad o relevo operan correctamente y se encuentran en buen estado?' },
        { id: 'valvulas_bloqueo', descripcion: '¿Las válvulas de bloqueo funcionan adecuadamente y se encuentran en buen estado?' },
        { id: 'conexiones', descripcion: '¿Las conexiones al equipo se observan en buen estado?' },
        { id: 'senalizacion', descripcion: '¿El equipo cuenta con la señalización adecuada y en buen estado?' },
        { id: 'vibracion_ruido', descripcion: '¿Existe alguna vibración o ruido inusual?' }
    ];

    return `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="flex-shrink: 0; margin-right: 2rem;">
                    <h1 style="color: #f8fafc; margin: 0; writing-mode: horizontal-rl; transform: rotate(0deg); font-size: 2rem; font-weight: bold; letter-spacing: 2px;">WUNDERBAR</h1>
                </div>
                <div style="flex: 1; text-align: center;">
                    <h1 style="color: #f8fafc; margin-bottom: 0.5rem; font-size: 1.3rem;">Bitacora de Mantenimiento de recipientes sujetos a presión</h1>
                    <h2 style="color: #f8fafc; margin-bottom: 0.3rem; font-weight: normal; font-size: 1rem;">conforme NOM-020-STPS-2011</h2>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 0.5rem;">
                        <span style="color: #d1d5db;">Emisión: <span style="color: #f8fafc; font-weight: bold;">${fechaFormateada}</span></span>
                        <span style="color: #d1d5db;">|</span>
                        <h3 style="color: #f8fafc; margin: 0; font-weight: normal; font-size: 0.9rem;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h3>
                        <span style="color: #d1d5db;">|</span>
                        <span style="color: #d1d5db; font-weight: bold; font-size: 0.9rem;">Tijuana</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
            <div class="form-group">
                <label class="form-label">Nombre del Equipo:</label>
                <input type="text" 
                       class="form-input" 
                       id="nombre_equipo" 
                       placeholder="Ej: Compresor de aire, Tanque de almacenamiento" 
                       style="font-weight: bold;">
            </div>
            <div class="form-group">
                <label class="form-label">TAG:</label>
                <input type="text" 
                       class="form-input" 
                       id="tag_equipo" 
                       placeholder="Identificación del equipo" 
                       style="font-weight: bold;">
            </div>
            <div class="form-group">
                <label class="form-label">Fecha y Hora:</label>
                <input type="datetime-local" 
                       class="form-input" 
                       id="fecha_hora_mantenimiento" 
                       value="${fechaActual.toISOString().slice(0, 16)}">
            </div>
            <div class="form-group">
                <label class="form-label">N° de registro ante STPS:</label>
                <input type="text" 
                       class="form-input" 
                       id="numero_stps" 
                       placeholder="Número de registro STPS" 
                       style="font-weight: bold;">
            </div>
        </div>
        
        <div style="overflow-x: auto; margin-bottom: 3rem;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 40%;">Descripción</th>
                        <th colspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 15%;">¿Cumple?</th>
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 25%;">Observaciones</th>
                        <th rowspan="2" style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">Acciones Correctivas</th>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: center; color: #4ade80; border: 1px solid #4b5563; font-weight: bold;">SI</th>
                        <th style="padding: 8px; text-align: center; color: #f87171; border: 1px solid #4b5563; font-weight: bold;">NO</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsVerificacion.map((item, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 10px; border: 1px solid #4b5563; color: #f8fafc;">
                                <strong>${index + 1}.</strong> ${item.descripcion}
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="radio" 
                                       name="cumple_${item.id}" 
                                       value="si"
                                       id="cumple_${item.id}_si"
                                       style="transform: scale(1.3);"
                                       onchange="actualizarEstado('${item.id}', 'si')">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="radio" 
                                       name="cumple_${item.id}" 
                                       value="no"
                                       id="cumple_${item.id}_no"
                                       style="transform: scale(1.3);"
                                       onchange="actualizarEstado('${item.id}', 'no')">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                          id="obs_${item.id}" 
                                          placeholder="Observaciones específicas"></textarea>
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <textarea class="form-textarea" 
                                          style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem;" 
                                          id="acciones_${item.id}" 
                                          placeholder="Acciones correctivas requeridas"></textarea>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
            <!-- RESUMEN DE VERIFICACIÓN -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">RESUMEN DE VERIFICACIÓN</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
                    <div style="background-color: #374151; padding: 1.5rem; border-radius: 6px;">
                        <div style="font-size: 2.5rem; color: #4ade80; font-weight: bold;" id="contador_si">0</div>
                        <div style="color: #d1d5db; margin-top: 0.5rem;">ITEMS QUE CUMPLEN</div>
                    </div>
                    <div style="background-color: #374151; padding: 1.5rem; border-radius: 6px;">
                        <div style="font-size: 2.5rem; color: #f87171; font-weight: bold;" id="contador_no">0</div>
                        <div style="color: #d1d5db; margin-top: 0.5rem;">ITEMS QUE NO CUMPLEN</div>
                    </div>
                </div>
                <div style="margin-top: 1.5rem;">
                    <div style="background-color: #374151; padding: 1rem; border-radius: 6px;">
                        <div style="color: #f8fafc; font-weight: bold; margin-bottom: 0.5rem;">PORCENTAJE DE CUMPLIMIENTO:</div>
                        <div style="display: flex; align-items: center;">
                            <div style="flex: 1; height: 20px; background-color: #4b5563; border-radius: 10px; overflow: hidden;">
                                <div id="barra_progreso" style="height: 100%; width: 0%; background-color: #4ade80; transition: width 0.3s;"></div>
                            </div>
                            <span id="porcentaje_cumplimiento" style="color: #f8fafc; font-weight: bold; margin-left: 1rem; min-width: 50px;">0%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- REGISTRO FOTOGRÁFICO -->
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem; text-align: center;">REGISTRO FOTOGRÁFICO</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    ${['Vista General', 'Placa de Datos', 'Manómetro', 'Válvulas', 'Conexiones', 'Señalización'].map((item, idx) => `
                        <div style="text-align: center;">
                            <div style="height: 120px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 0.5rem; position: relative;">
                                <span style="color: #9ca3af; font-size: 2rem;">📷</span>
                                <span style="color: #9ca3af; font-size: 0.8rem;">${item}</span>
                                <div id="preview_foto_${idx}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 4px; overflow: hidden; display: none;">
                                    <img id="img_foto_${idx}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                            </div>
                            <input type="file" 
                                   id="foto_${idx}" 
                                   accept="image/*" 
                                   style="display: none;"
                                   onchange="previewFoto(${idx})">
                            <button type="button" 
                                    class="btn btn-secondary" 
                                    onclick="document.getElementById('foto_${idx}').click()"
                                    style="padding: 0.3rem 0.8rem; font-size: 0.8rem; width: 100%; margin-bottom: 0.3rem;">
                                📸 Tomar/Subir Foto
                            </button>
                            <button type="button" 
                                    class="btn btn-danger" 
                                    onclick="eliminarFoto(${idx})"
                                    style="padding: 0.2rem 0.6rem; font-size: 0.7rem; width: 100%; display: none;"
                                    id="btn_eliminar_${idx}">
                                ❌ Eliminar
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: #f8fafc; margin-bottom: 1rem;">CONCLUSIONES Y RECOMENDACIONES</h4>
            <div style="background-color: #1f2937; padding: 1.5rem; border-radius: 8px;">
                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Condición General del Equipo:</label>
                    <select class="form-input" id="condicion_general" style="width: 100%;" onchange="actualizarCondicion()">
                        <option value="">Seleccionar</option>
                        <option value="excelente" style="color: #4ade80;">Excelente - Sin observaciones</option>
                        <option value="bueno" style="color: #60a5fa;">Bueno - Observaciones menores</option>
                        <option value="regular" style="color: #fbbf24;">Regular - Requiere mantenimiento programado</option>
                        <option value="malo" style="color: #f87171;">Malo - Requiere mantenimiento inmediato</option>
                        <option value="critico" style="color: #dc2626;">Crítico - No operar hasta reparar</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">Recomendaciones Generales:</label>
                    <textarea class="form-textarea" 
                              id="recomendaciones_generales" 
                              placeholder="Ingrese recomendaciones generales de mantenimiento, prioridades y plazos"
                              style="width: 100%; min-height: 100px; resize: vertical;"></textarea>
                </div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 3rem; margin-bottom: 2rem;">
            <div style="flex: 1;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">TÉCNICO DE MANTENIMIENTO</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre Completo:</label>
                    <input type="text" class="form-input" id="tecnico_nombre" placeholder="Nombre del técnico">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">No. de Certificación:</label>
                    <input type="text" class="form-input" id="certificacion_tecnico" placeholder="Número de certificación">
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af;">Firma del técnico</span>
                </div>
            </div>
            
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">SUPERVISOR DE MANTENIMIENTO</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Nombre Completo:</label>
                    <input type="text" class="form-input" id="supervisor_nombre" placeholder="Nombre del supervisor">
                </div>
                <div>
                    <label class="form-label">Verificación:</label>
                    <select class="form-input" id="verificacion_supervisor" style="width: 100%;">
                        <option value="">Seleccionar</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="revisar">Requiere Revisión</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>
                <div style="height: 100px; border: 2px dashed #4b5563; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-top: 1rem;">
                    <span style="color: #9ca3af;">Firma del supervisor</span>
                </div>
            </div>
            
            <div style="flex: 1; margin-left: 2rem;">
                <h4 style="color: #f8fafc; margin-bottom: 1rem;">SEGUIMIENTO</h4>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Próximo Mantenimiento:</label>
                    <input type="date" class="form-input" id="proximo_mantenimiento" style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="form-label">Tipo de Próximo Mantenimiento:</label>
                    <select class="form-input" id="tipo_proximo_mto" style="width: 100%;">
                        <option value="">Seleccionar</option>
                        <option value="preventivo">Preventivo</option>
                        <option value="correctivo">Correctivo</option>
                        <option value="predictivo">Predictivo</option>
                        <option value="inspeccion">Inspección</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">Observaciones Finales:</label>
                    <textarea class="form-textarea" 
                              id="obs_finales" 
                              placeholder="Observaciones para el próximo mantenimiento"
                              style="width: 100%; min-height: 60px; resize: vertical;"></textarea>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button type="button" class="btn btn-primary" onclick="guardarMantenimiento()" style="margin-right: 1rem; padding: 0.75rem 1.5rem;">
                💾 Guardar Bitácora de Mantenimiento
            </button>
            <button type="button" class="btn btn-success" onclick="generarReporteMantenimiento()" style="margin-right: 1rem; padding: 0.75rem 1.5rem;">
                📋 Generar Reporte de Mantenimiento
            </button>
            <button type="button" class="btn btn-warning" onclick="generarOrdenTrabajo()" style="padding: 0.75rem 1.5rem;">
                🔧 Generar Orden de Trabajo
            </button>
        </div>
        
        <script>
        let contadorSi = 0;
        let contadorNo = 0;
        const totalItems = ${itemsVerificacion.length};
        
        function actualizarEstado(itemId, valor) {
            if (valor === 'si') {
                contadorSi++;
                if (document.getElementById('cumple_' + itemId + '_no').checked) {
                    contadorNo--;
                }
            } else if (valor === 'no') {
                contadorNo++;
                if (document.getElementById('cumple_' + itemId + '_si').checked) {
                    contadorSi--;
                }
            }
            
            // Actualizar contadores
            document.getElementById('contador_si').textContent = contadorSi;
            document.getElementById('contador_no').textContent = contadorNo;
            
            // Calcular y actualizar porcentaje
            const porcentaje = totalItems > 0 ? Math.round((contadorSi / totalItems) * 100) : 0;
            document.getElementById('barra_progreso').style.width = porcentaje + '%';
            document.getElementById('porcentaje_cumplimiento').textContent = porcentaje + '%';
            
            // Cambiar color de la barra según porcentaje
            const barra = document.getElementById('barra_progreso');
            if (porcentaje >= 90) barra.style.backgroundColor = '#4ade80';
            else if (porcentaje >= 70) barra.style.backgroundColor = '#60a5fa';
            else if (porcentaje >= 50) barra.style.backgroundColor = '#fbbf24';
            else barra.style.backgroundColor = '#f87171';
        }
        
        function previewFoto(index) {
            const fileInput = document.getElementById('foto_' + index);
            const preview = document.getElementById('preview_foto_' + index);
            const img = document.getElementById('img_foto_' + index);
            const btnEliminar = document.getElementById('btn_eliminar_' + index);
            
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    img.src = e.target.result;
                    preview.style.display = 'block';
                    btnEliminar.style.display = 'block';
                }
                
                reader.readAsDataURL(fileInput.files[0]);
            }
        }
        
        function eliminarFoto(index) {
            const fileInput = document.getElementById('foto_' + index);
            const preview = document.getElementById('preview_foto_' + index);
            const btnEliminar = document.getElementById('btn_eliminar_' + index);
            
            fileInput.value = '';
            preview.style.display = 'none';
            btnEliminar.style.display = 'none';
        }
        
        function actualizarCondicion() {
            const condicion = document.getElementById('condicion_general').value;
            const recomendaciones = document.getElementById('recomendaciones_generales');
            
            // Sugerir recomendaciones basadas en la condición
            if (condicion === 'critico') {
                recomendaciones.value = 'EQUIPO EN CONDICIÓN CRÍTICA. NO OPERAR HASTA REALIZAR MANTENIMIENTO CORRECTIVO.\n\nAcciones inmediatas requeridas:\n1. Aislar y etiquetar equipo\n2. Notificar a supervisor\n3. Generar orden de trabajo urgente\n4. Programar reparación inmediata';
            } else if (condicion === 'malo') {
                recomendaciones.value = 'EQUIPO REQUIERE MANTENIMIENTO INMEDIATO.\n\nAcciones recomendadas:\n1. Programar mantenimiento correctivo\n2. Monitorear condiciones de operación\n3. Reducir carga de trabajo si es posible\n4. Realizar reparación en máximo 72 horas';
            } else if (condicion === 'regular') {
                recomendaciones.value = 'EQUIPO REQUIERE MANTENIMIENTO PROGRAMADO.\n\nAcciones recomendadas:\n1. Programar mantenimiento preventivo\n2. Incluir en próximo programa de mantenimiento\n3. Monitorear condiciones periódicamente\n4. Considerar en próximo turno de mantenimiento';
            }
        }
        
        function guardarMantenimiento() {
            console.log('Guardando bitácora de mantenimiento...');
            alert('Bitácora de mantenimiento guardada correctamente.');
        }
        
        function generarReporteMantenimiento() {
            console.log('Generando reporte de mantenimiento...');
            // Aquí iría la lógica para generar un reporte PDF o Excel
        }
        
        function generarOrdenTrabajo() {
            const itemsNoCumplen = contadorNo;
            if (itemsNoCumplen === 0) {
                alert('No hay items que no cumplan. No se requiere orden de trabajo.');
                return;
            }
            
            console.log('Generando orden de trabajo con', itemsNoCumplen, 'items a corregir...');
            // Aquí iría la lógica para generar una orden de trabajo
        }
        </script>
    `;
}

function getTablaPersonalAutorizadoTemplate() {
    return `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="margin-bottom: 1rem;">
                <h1 style="color: #f8fafc; margin: 0; font-size: 2rem; font-weight: bold;">Wunderbar</h1>
            </div>
            
            <h2 style="color: #f8fafc; margin-bottom: 0.5rem;">PERSONAL AUTORIZADO PARA ACTIVIDADES</h2>
            <h3 style="color: #f8fafc; margin-top: 0; font-weight: normal;">IVEMSA S.A. DE C.V. DIVISION WUNDERBAR</h3>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #4b5563; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #374151;">
                        <th rowspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 5%;">#</th>
                        <th rowspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; width: 20%;">NOMBRE DEL PERSONAL</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">MANEJO DE MATERIALES PELIGROSOS</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">MANEJO DE MONTACARGAS</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">INSTALACION, OPERACIÓN Y MANTENIMIENTO DE MAQUINARIA</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">TRABAJOS EN ALTURA</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">ESPACIOS CONFINADOS</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">RIESGO ELECTRICO</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">CORTE Y SOLDADURA</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">COMISION DE SEGURIDAD E HIGIENE</th>
                        <th colspan="2" style="padding: 12px; text-align: center; color: #f8fafc; border: 1px solid #4b5563;">RECIPIENTES SUJETOS A PRESION</th>
                    </tr>
                    <tr>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">CALIFICACION</th>
                        <th style="padding: 10px; text-align: center; color: #f8fafc; border: 1px solid #4b5563; background-color: #4b5563; font-size: 0.85rem;">FECHA DE ACREDITACION</th>
                    </tr>
                </thead>
                <tbody id="tablaPersonalBody">
                    ${Array.from({length: 10}, (_, index) => `
                        <tr style="border-bottom: 1px solid #4b5563;">
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                                ${index + 1}
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="nombre_${index}" 
                                       placeholder="Nombre completo">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="mat_peligrosos_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="mat_peligrosos_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="montacargas_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="montacargas_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="maquinaria_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="maquinaria_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="altura_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="altura_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="confinados_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="confinados_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="electrico_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="electrico_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="corte_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="corte_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="comision_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="comision_fecha_${index}">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                                <input type="text" 
                                       class="form-input" 
                                       style="width: 100%; text-align: center;" 
                                       id="recipientes_calif_${index}" 
                                       placeholder="CALIF">
                            </td>
                            <td style="padding: 10px; border: 1px solid #4b5563;">
                                <input type="date" 
                                       class="form-input" 
                                       style="width: 100%;" 
                                       id="recipientes_fecha_${index}">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Información de registro</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label class="form-label">Fecha de elaboración</label>
                    <input type="date" 
                           class="form-input" 
                           id="fecha_elaboracion" 
                           style="width: 100%;">
                </div>
                <div class="form-group">
                    <label class="form-label">Elaborado por</label>
                    <input type="text" 
                           class="form-input" 
                           id="elaborado_por" 
                           placeholder="Nombre del responsable"
                           style="width: 100%;">
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #f8fafc; margin-bottom: 1rem;">Revisión y aprobación</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label class="form-label">Revisado por</label>
                    <input type="text" 
                           class="form-input" 
                           id="revisado_por" 
                           placeholder="Nombre del revisor"
                           style="width: 100%;">
                </div>
                <div class="form-group">
                    <label class="form-label">Aprobado por</label>
                    <input type="text" 
                           class="form-input" 
                           id="aprobado_por" 
                           placeholder="Nombre del aprobador"
                           style="width: 100%;">
                </div>
            </div>
        </div>
        
        <hr style="border: 1px solid #4b5563; margin: 2rem 0;">
        
        <div style="margin-top: 2rem;">
            <button type="button" class="btn btn-primary" onclick="agregarFilaPersonal()" style="margin-right: 1rem;">
                Agregar Fila
            </button>
            <button type="button" class="btn btn-secondary" onclick="eliminarFilaPersonal()">
                Eliminar Última Fila
            </button>
        </div>
        
        <script>
        let filasPersonales = 10;
        
        function agregarFilaPersonal() {
            filasPersonales++;
            const tbody = document.getElementById('tablaPersonalBody');
            const nuevaFila = document.createElement('tr');
            
            nuevaFila.innerHTML = \`
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center; color: #f8fafc; font-weight: bold;">
                    \${filasPersonales}
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="nombre_\${filasPersonales-1}" 
                           placeholder="Nombre completo">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="mat_peligrosos_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="mat_peligrosos_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="montacargas_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="montacargas_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="maquinaria_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="maquinaria_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="altura_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="altura_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="confinados_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="confinados_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="electrico_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="electrico_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="corte_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="corte_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="comision_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="comision_fecha_\${filasPersonales-1}">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563; text-align: center;">
                    <input type="text" 
                           class="form-input" 
                           style="width: 100%; text-align: center;" 
                           id="recipientes_calif_\${filasPersonales-1}" 
                           placeholder="CALIF">
                </td>
                <td style="padding: 10px; border: 1px solid #4b5563;">
                    <input type="date" 
                           class="form-input" 
                           style="width: 100%;" 
                           id="recipientes_fecha_\${filasPersonales-1}">
                </td>
            \`;
            
            tbody.appendChild(nuevaFila);
        }
        
        function eliminarFilaPersonal() {
            if (filasPersonales > 1) {
                const tbody = document.getElementById('tablaPersonalBody');
                tbody.removeChild(tbody.lastChild);
                filasPersonales--;
            }
        }
        </script>
    `;
}

function getLavaojosTemplate() {
    return getGenericTemplate();
}

function getKitDerramesTemplate() {
    return getGenericTemplate();
}

function getDetectoresTemplate() {
    return getGenericTemplate();
}

function getLamparasTemplate() {
    return getGenericTemplate();
}

function getExtintorTemplate() {
    return getGenericTemplate();
}

function getPalletTemplate() {
    return getGenericTemplate();
}

function getMontacargasTemplate() {
    return getGenericTemplate();
}

function getEscalerasTemplate() {
    return getGenericTemplate();
}

function getPersonalAutorizadoTemplate() {
    return getGenericTemplate();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderBitacoras(e.target.value);
        });
    }
    
    const filterNorma = document.getElementById('filterNorma');
    const filterFrecuencia = document.getElementById('filterFrecuencia');
    
    if (filterNorma) {
        filterNorma.addEventListener('change', () => {
            renderBitacoras(searchInput?.value || '');
        });
    }
    
    if (filterFrecuencia) {
        filterFrecuencia.addEventListener('change', () => {
            renderBitacoras(searchInput?.value || '');
        });
    }
}

function getFrecuenciaColor(frecuencia) {
    const colors = {
        'Diario': '#10b981',
        'Mensual': '#3b82f6',
        'Semestral': '#f59e0b',
        'Anual': '#ef4444'
    };
    return colors[frecuencia] || '#64748b';
}

function initializeSignaturePad() {
    const signaturePad = document.getElementById('signaturePad');
    if (!signaturePad) return;
    
    canvas = signaturePad;
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    setupDrawing();
    
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = 200;
    
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupDrawing() {
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const [x, y] = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return [x, y];
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearSignature() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureData = null;
    document.getElementById('signaturePreview').classList.remove('active');
    showNotification('Firma borrada', 'warning');
}

function saveSignature() {
    if (!canvas) return;
    
    if (isCanvasBlank()) {
        showNotification('Por favor dibuje su firma primero', 'error');
        return;
    }
    
    signatureData = canvas.toDataURL('image/png');
    
    const preview = document.getElementById('signaturePreview');
    const image = document.getElementById('signatureImage');
    
    if (preview && image) {
        image.src = signatureData;
        preview.classList.add('active');
        showNotification('Firma guardada exitosamente', 'success');
    }
}

function isCanvasBlank() {
    if (!canvas) return true;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
}

function saveForm() {
    if (!validateForm()) {
        showNotification('Complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (!signatureData) {
        showNotification('Capture su firma antes de guardar', 'error');
        return;
    }
    
    collectFormData();
    
    const bitacoraData = {
        tipo: currentFormType,
        fecha: new Date().toISOString(),
        nombre: currentBitacora?.nombre || 'Bitácora',
        data: formData,
        firma: signatureData,
        usuario: currentUser?.name || 'Anónimo'
    };
    
    const key = `bitacora_${currentFormType}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(bitacoraData));
    
    showNotification('Bitácora guardada exitosamente', 'success');
    
    setTimeout(() => {
        if (confirm('¿Desea guardar otra bitácora del mismo tipo?')) {
            resetForm();
        } else {
            showSection('dashboard');
        }
    }, 1500);
}

function resetForm() {
    showModal('Confirmar Borrado', '¿Está seguro de borrar todos los datos del formulario?', function() {
        document.getElementById('formContent').querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = false;
            } else {
                el.value = '';
            }
        });
        
        clearSignature();
        showNotification('Formulario reiniciado', 'warning');
    });
}

function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

function collectFormData() {
    formData = {};
    const inputs = document.getElementById('formContent').querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            formData[input.id] = input.checked || false;
        } else {
            formData[input.id] = input.value;
        }
    });
}

function loadSavedData(tipo) {
    const keys = Object.keys(localStorage).filter(key => key.includes(`bitacora_${tipo}_`));
    if (keys.length === 0) return;
    
    const latestKey = keys.sort().reverse()[0];
    const savedData = JSON.parse(localStorage.getItem(latestKey));
    
    if (savedData && confirm('¿Desea cargar el borrador guardado?')) {
        Object.keys(savedData.data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = savedData.data[key];
                } else {
                    element.value = savedData.data[key] || '';
                }
            }
        });
        
        if (savedData.firma) {
            signatureData = savedData.firma;
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
                document.getElementById('signaturePreview').classList.add('active');
                document.getElementById('signatureImage').src = signatureData;
            };
            image.src = savedData.firma;
        }
        
        showNotification('Borrador cargado', 'success');
    }
}

function exportToPDF() {
    showNotification('Exportando a PDF...', 'warning');
    
    setTimeout(() => {
        showNotification('Función de PDF disponible próximamente', 'warning');
    }, 1000);
}

function saveToDrive() {
    showNotification('Conectando con Google Drive...', 'warning');
    
    setTimeout(() => {
        showNotification('Integración con Google Drive en desarrollo', 'warning');
    }, 1000);
}

async function fetchSheetData(connection, action = 'read', data = null) {
    try {
        const url = new URL(connection.scriptUrl);
        url.searchParams.append('id', connection.spreadsheetId);
        url.searchParams.append('sheet', connection.sheetName);
        url.searchParams.append('action', action);
        
        if (data) {
            url.searchParams.append('data', JSON.stringify(data));
        }
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        return result;
    } catch (error) {
        showNotification(`Error al cargar datos: ${error.message}`, 'error');
        return { error: error.message };
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    if (message.includes('<')) {
        notification.innerHTML = message;
    } else {
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        notification.appendChild(messageSpan);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-notification';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 5000);
}

function initializeFormListeners() {
    const autoSaveInterval = setInterval(() => {
        if (currentFormType) {
            collectFormData();
            const draftKey = `draft_${currentFormType}`;
            localStorage.setItem(draftKey, JSON.stringify({
                data: formData,
                firma: signatureData,
                timestamp: new Date().toISOString()
            }));
        }
    }, 30000);
    
    window.addEventListener('beforeunload', () => {
        clearInterval(autoSaveInterval);
    });
}

function showModal(title, message, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modalCallback = callback;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    modalCallback = null;
}

function confirmAction() {
    if (modalCallback) {
        modalCallback();
    }
    closeModal();
}

window.openBitacora = openBitacora;
window.showSection = showSection;
window.clearSignature = clearSignature;
window.saveSignature = saveSignature;
window.resetForm = resetForm;
window.saveForm = saveForm;
window.exportToPDF = exportToPDF;
window.saveToDrive = saveToDrive;
window.closeModal = closeModal;
window.confirmAction = confirmAction;