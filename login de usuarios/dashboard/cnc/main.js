document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('app');
  
  // Estado inicial
  let state = {
    formData: {
      fecha: '6/10/2025',
      lider: 'Roberto Gonzalez Veloz',
      turno: '3',
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
      bonding: {
        '10': 0, '10_2': 0, '12': 0, '12R': 0, '14': 0, '14R': 0, 'NW': 0
      },
      flycut: {
        row1: { measures: [0.41, 0.45, 0.18, 0.125, 0.125, 0.412, 0.458, 0.25, 0.175], quantities: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
        row2: { measures: [0.3, 0.75, 0.65, 0.33, 0.4, 0.6, 0.45, 0.35, 0.39], quantities: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
        row3: { measures: [0.655, 0.15, 0.5, 0.9, 0, 0, 0, 0, 0], quantities: [0, 0, 0, 0, 0, 0, 0, 0, 0] }
      },
      materiales: {
        '1201-195': 0, '1201-196': 0, '1201-197': 0, '1201-21587': 0, '1201-199': 0,
        '1201-205': 0, '1201-215': 0, '1201-236': 0, '1201-354': 0
      }
    },
    isSubmitting: false,
    submitStatus: ''
  };

  // Datos constantes
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

  // Funciones para manejar el estado
  function setState(newState) {
    state = { ...state, ...newState };
    render();
  }

  function handleFlycutChange(rowName, index, value) {
    const newFormData = { ...state.formData };
    newFormData.flycut[rowName].quantities[index] = parseInt(value) || 0;
    setState({ formData: newFormData });
  }

  function handleInputChange(section, key, value) {
    const newFormData = { ...state.formData };
    newFormData[section][key] = value;
    setState({ formData: newFormData });
  }

  function handleSubmit() {
    setState({ isSubmitting: true, submitStatus: 'loading' });
    
    // Simular envío
    setTimeout(() => {
      setState({ 
        isSubmitting: false,
        submitStatus: 'success'
      });
      
      setTimeout(() => setState({ submitStatus: '' }), 3000);
    }, 2000);
  }

  // Renderizar la aplicación
  function render() {
    app.innerHTML = `
      <div class="min-h-screen">
        <!-- Background Animation -->
        <div class="background-animation">
          <div class="pulse-circle" style="top: 10%; left: 10%; width: 6rem; height: 6rem; animation-delay: 0s;"></div>
          <div class="pulse-circle" style="top: 70%; right: 10%; width: 8rem; height: 8rem; animation-delay: 3s;"></div>
          <div class="pulse-circle" style="bottom: 30%; left: 70%; width: 5rem; height: 5rem; animation-delay: 6s;"></div>
        </div>

        <div class="container">
          <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="header">
              <div class="header-box">
                <h1 class="title">
                  <i data-lucide="settings-2" class="w-8 h-8"></i>
                  FORMATOS MAQUINADO CNC
                </h1>
              </div>
              <p class="subtitle">Sistema de Control de Producción</p>
            </div>

            <!-- Main Container -->
            <div class="main-container">
              <!-- Header Info -->
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">
                    <i data-lucide="calendar" class="w-6 h-6 text-emerald-400"></i>
                    <span class="info-label-text">FECHA</span>
                  </div>
                  <input
                    type="text"
                    value="${state.formData.fecha}"
                    onchange="app.handleDateChange(this.value)"
                    class="info-input"
                  />
                </div>

                <div class="info-box">
                  <div class="info-label">
                    <i data-lucide="user" class="w-6 h-6 text-emerald-400"></i>
                    <span class="info-label-text">LIDER</span>
                  </div>
                  <input
                    type="text"
                    value="${state.formData.lider}"
                    onchange="app.handleLeaderChange(this.value)"
                    class="info-input"
                  />
                </div>

                <div class="info-box">
                  <div class="info-label">
                    <i data-lucide="clock" class="w-6 h-6 text-emerald-400"></i>
                    <span class="info-label-text">TURNO</span>
                  </div>
                  <input
                    type="text"
                    value="${state.formData.turno}"
                    onchange="app.handleShiftChange(this.value)"
                    class="info-input"
                  />
                </div>

                <div class="info-box">
                  <div class="info-label">
                    <i data-lucide="clock" class="w-6 h-6 text-emerald-400"></i>
                    <span class="info-label-text">HORAS</span>
                  </div>
                  <input
                    type="text"
                    value="${state.formData.horas}"
                    onchange="app.handleHoursChange(this.value)"
                    class="info-input"
                  />
                </div>

                <div class="info-box">
                  <div class="info-label">
                    <i data-lucide="settings-2" class="w-6 h-6 text-emerald-400"></i>
                    <span class="info-label-text">MAQUINAS</span>
                  </div>
                  <input
                    type="text"
                    value="${state.formData.maquinas}"
                    onchange="app.handleMachinesChange(this.value)"
                    class="info-input"
                  />
                </div>
              </div>

              <!-- Production Section -->
              <div class="mb-8">
                <h2 class="section-title">
                  <div class="section-title-line bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                  PRODUCCION
                </h2>
                
                <div class="space-y-6">
                  ${produccionSections.map((section, sectionIndex) => `
                    <div class="section-box">
                      <div class="production-grid">
                        ${section.codes.map((code, index) => `
                          <div class="space-y-2">
                            <div class="code-label">${code}</div>
                            <input
                              type="number"
                              value="${state.formData.produccion[code] || 0}"
                              onchange="app.handleProductionChange('${code}', this.value)"
                              class="number-input focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Bonding Section -->
              <div class="mb-8">
                <h2 class="section-title">
                  <div class="section-title-line bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  BONDING
                </h2>
                
                <div class="section-box">
                  <div class="mb-4">
                    <span class="text-slate-300 font-medium">Nº Bins</span>
                  </div>
                  <div class="bonding-grid">
                    ${['10', '10_2', '12', '12R', '14', '14R', 'NW'].map((bin, index) => `
                      <div class="space-y-2">
                        <div class="code-label">${bin === '10_2' ? '10' : bin}</div>
                        <input
                          type="number"
                          value="${state.formData.bonding[bin] || 0}"
                          onchange="app.handleBondingChange('${bin}', this.value)"
                          class="number-input focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Flycut Section -->
              <div class="mb-8">
                <h2 class="section-title">
                  <div class="section-title-line bg-gradient-to-r from-purple-500 to-purple-600"></div>
                  FLYCUT
                </h2>
                
                <div class="section-box space-y-6">
                  ${Object.entries(state.formData.flycut).map(([rowName, rowData], rowIndex) => `
                    <div class="space-y-3">
                      <div class="row-title">
                        Fila ${rowIndex + 1} - Medidas
                      </div>
                      <div class="flycut-grid">
                        ${rowData.measures.map((measure, colIndex) => `
                          <div class="space-y-2">
                            <div class="measure-box">
                              <span class="measure-value">${measure}</span>
                            </div>
                            <input
                              type="number"
                              value="${rowData.quantities[colIndex] || 0}"
                              onchange="app.handleFlycutChange('${rowName}', ${colIndex}, this.value)"
                              class="number-input focus:border-purple-500 focus:ring-purple-500/20"
                              placeholder="0"
                            />
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Material Section -->
              <div class="mb-8">
                <h2 class="section-title">
                  <div class="section-title-line bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  ENTRADA DE MATERIAL
                </h2>
                
                <div class="section-box">
                  <div class="material-grid">
                    ${materialesData.map((material, index) => `
                      <div class="bg-slate-700/50 rounded-xl p-4 space-y-3">
                        <div class="text-center">
                          <div class="material-code">${material.code}</div>
                          <div class="material-desc">${material.desc}</div>
                          <div class="material-color">${material.color}</div>
                        </div>
                        <input
                          type="number"
                          value="${state.formData.materiales[material.code] || 0}"
                          onchange="app.handleMaterialChange('${material.code}', this.value)"
                          class="number-input focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="text-center">
                <button
                  onclick="app.handleSubmit()"
                  ${state.isSubmitting ? 'disabled' : ''}
                  class="submit-btn ${state.isSubmitting ? 'submit-btn-loading' : 'submit-btn-normal'}"
                >
                  ${state.isSubmitting ? `
                    <div class="flex items-center gap-3">
                      <div class="spinner"></div>
                      ENVIANDO...
                    </div>
                  ` : `
                    <div class="flex items-center gap-3">
                      <i data-lucide="send" class="w-6 h-6"></i>
                      ENVIAR PRODUCCION
                    </div>
                  `}
                </button>
              </div>

              <!-- Status Messages -->
              ${state.submitStatus ? `
                <div class="status-message ${state.submitStatus === 'success' ? 'status-success' : 
                                          state.submitStatus === 'error' ? 'status-error' : 'status-loading'}">
                  ${state.submitStatus === 'success' ? '✅ Producción enviada exitosamente' : 
                   state.submitStatus === 'error' ? '❌ Error al enviar la producción' : 
                   '⏳ Enviando producción...'}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Recrear los íconos después de renderizar
    lucide.createIcons();
  }

  // Exponer funciones al objeto global app
  window.app = {
    handleDateChange: (value) => setState({ formData: { ...state.formData, fecha: value } }),
    handleLeaderChange: (value) => setState({ formData: { ...state.formData, lider: value } }),
    handleShiftChange: (value) => setState({ formData: { ...state.formData, turno: value } }),
    handleHoursChange: (value) => setState({ formData: { ...state.formData, horas: value } }),
    handleMachinesChange: (value) => setState({ formData: { ...state.formData, maquinas: value } }),
    handleProductionChange: (code, value) => {
      const newFormData = { ...state.formData };
      newFormData.produccion[code] = parseInt(value) || 0;
      setState({ formData: newFormData });
    },
    handleBondingChange: (bin, value) => {
      const newFormData = { ...state.formData };
      newFormData.bonding[bin] = parseInt(value) || 0;
      setState({ formData: newFormData });
    },
    handleFlycutChange,
    handleMaterialChange: (code, value) => {
      const newFormData = { ...state.formData };
      newFormData.materiales[code] = parseInt(value) || 0;
      setState({ formData: newFormData });
    },
    handleSubmit
  };

  // Renderizar la aplicación inicial
  render();
});