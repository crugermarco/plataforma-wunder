const sheetConnections = {
    medidas: {
      scriptUrl: 'https://script.google.com/macros/s/AKfycby-KfWmQvC5bEU5j6WUe1sOumZfzUN7uznRiUw9kskrmrflWJJJF13GGYrbLLaZYrTH/exec',
      spreadsheetId: '1YLFhIq_C3SUWXjjPLS8oXOyjuowX106u5X2ejSNCmUA',
      sheetName: 'CONCENTRADO DE MEDIDAS',
      headersRow: 1
    },
    data: {
      scriptUrl: 'https://script.google.com/macros/s/AKfycby-KfWmQvC5bEU5j6WUe1sOumZfzUN7uznRiUw9kskrmrflWJJJF13GGYrbLLaZYrTH/exec',
      spreadsheetId: '1YLFhIq_C3SUWXjjPLS8oXOyjuowX106u5X2ejSNCmUA',
      sheetName: 'DATA',
      headersRow: 1
    }
  };
  
  let rows = [];
  let currentRow = null;
  let currentStep = 0;
  let currentSet = 2;
  
  const measurementStructure = {
    set1: [
      { key: 'type1', label: 'TYPE', required: false, isInfo: true },
      { key: 'program1', label: 'PROGRAM', required: false, isInfo: true },
      { key: 'plateThickness1', label: 'PLATE THICKNESS', required: true, isInfo: false }
    ],
    
    set2: [
      { key: 'plateThickness2', label: 'PLATE THICKNESS', required: true, isInfo: false },
      { key: 'trackRojo2', label: 'TRACK ROJO', required: false, isInfo: false },
      { key: 'trackAzul2', label: 'TRACK AZUL', required: false, isInfo: false },
      { key: 'ballVerde2', label: 'BALL VERDE', required: false, isInfo: false },
      { key: 'ballAmarillo2', label: 'BALL AMARILLO', required: false, isInfo: false },
      { key: 'ballAzulCielo12', label: 'BALL AZUL CIELO1', required: false, isInfo: false },
      { key: 'ballAzulCielo22', label: 'BALL AZUL CIELO2', required: false, isInfo: false }
    ],
    
    set3: [
      { key: 'trackRojo3', label: 'TRACK ROJO', required: false, isInfo: false },
      { key: 'trackAzul3', label: 'TRACK AZUL', required: false, isInfo: false },
      { key: 'ballVerde3', label: 'BALL VERDE', required: false, isInfo: false },
      { key: 'ballAmarillo3', label: 'BALL AMARILLO', required: false, isInfo: false },
      { key: 'ballAzulCielo13', label: 'BALL AZUL CIELO1', required: false, isInfo: false },
      { key: 'ballAzulCielo23', label: 'BALL AZUL CIELO2', required: false, isInfo: false }
    ],
    
    set4: [
      { key: 'trackRojo4', label: 'TRACK ROJO', required: false, isInfo: false },
      { key: 'trackAzul4', label: 'TRACK AZUL', required: false, isInfo: false },
      { key: 'ballVerde4', label: 'BALL VERDE', required: false, isInfo: false },
      { key: 'ballAmarillo4', label: 'BALL AMARILLO', required: false, isInfo: false },
      { key: 'ballAzulCielo14', label: 'BALL AZUL CIELO1', required: false, isInfo: false },
      { key: 'ballAzulCielo24', label: 'BALL AZUL CIELO2', required: false, isInfo: false }
    ]
  };
  
  function getAllMeasurementFields() {
    return [
      ...measurementStructure.set1,
      ...measurementStructure.set2,
      ...measurementStructure.set3,
      ...measurementStructure.set4
    ];
  }
  
  function validateMachineInput(machine) {
    const machineNumber = parseInt(machine);
    return !isNaN(machineNumber) && machineNumber >= 1 && machineNumber <= 8;
  }
  
  function showMachineError(show = true) {
    const errorElement = document.getElementById('machineError');
    const machineInput = document.getElementById('machine');
    
    if (errorElement) {
      errorElement.style.display = show ? 'block' : 'none';
    }
    
    if (machineInput) {
      if (show) {
        machineInput.classList.add('input-error');
      } else {
        machineInput.classList.remove('input-error');
      }
    }
  }
  
  function deleteRow(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta fila?')) {
      rows.splice(index, 1);
      renderRows();
      
      document.getElementById('sendBtn').disabled = rows.length === 0;
      
      showMessage('🗑️ Fila eliminada correctamente', 'success');
    }
  }
  
  function createImageModal() {
    if (document.getElementById('imageModalOverlay')) return;
    
    const imageModalHTML = `
      <div id="imageModalOverlay" class="image-modal-overlay">
        <div class="image-modal-content">
          <div class="image-modal-header">
            <h3 id="imageModalTitle">Imagen de Referencia</h3>
            <button class="close-image-modal" onclick="closeImageModal()">×</button>
          </div>
          <div class="image-modal-body">
            <div id="imageContainer">
              <img id="referenceImage" src="" alt="Imagen de referencia">
            </div>
            <div class="image-description">
              <p id="imageDescription"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', imageModalHTML);
    
    const styles = `
      <style>
        .image-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          display: none;
          z-index: 10001;
          justify-content: flex-start;
          align-items: stretch;
          pointer-events: none;
        }
        
        .image-modal-overlay.active {
          display: flex;
        }
        
        .image-modal-content {
          width: 500px;
          height: 100%;
          background: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
          pointer-events: auto;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .image-modal-header {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
        }
        
        .image-modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }
        
        .close-image-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-image-modal:hover {
          color: #333;
          background: #e0e0e0;
          border-radius: 50%;
        }
        
        .image-modal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow: hidden;
        }
        
        #imageContainer {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }
        
        #referenceImage {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .image-description {
          padding: 15px;
          background: #e8f4fd;
          border-radius: 6px;
          border-left: 4px solid #2196F3;
        }
        
        .image-description p {
          margin: 0;
          color: #333;
          font-size: 14px;
          line-height: 1.4;
        }
  
        #modalOverlay.active {
          background: rgba(0,0,0,0.5);
          z-index: 10000;
        }
  
        #modalContent {
          z-index: 10000;
          position: relative;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  function openImageModal(fieldLabel, imageUrl) {
    createImageModal();
    const overlay = document.getElementById('imageModalOverlay');
    const image = document.getElementById('referenceImage');
    const title = document.getElementById('imageModalTitle');
    const description = document.getElementById('imageDescription');
    
    title.textContent = `Referencia: ${fieldLabel}`;
    
    if (imageUrl && imageUrl !== 'N/A' && imageUrl !== '') {
      image.src = imageUrl;
      image.alt = `Imagen de referencia para ${fieldLabel}`;
      description.textContent = `Imagen de referencia para la medición: ${fieldLabel}. Use esta imagen como guía para realizar la medición correctamente.`;
    } else {
      image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBNODAgMTAwSDE0ME04MCAxNDBIMTIwTTYwIDgwVjEyME02MCA2MFY0ME0xNDAgNjBWNDBNMTQwIDE0MFYxNjBNNjAgMTQwVjE2MCIgc3Ryb2tlPSIjQ0RDRENEIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iI0VBRUFFQSIgc3Ryb2tlPSIjQ0RDRENEIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2Zz4=';
      image.alt = 'Imagen no disponible';
      description.textContent = `No hay imagen de referencia disponible para ${fieldLabel}. Contacte al administrador.`;
    }
    
    overlay.classList.add('active');
  }
  
  function closeImageModal() {
    const overlay = document.getElementById('imageModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }
  
  async function callGoogleScript(connection, action, data = {}) {
      try {
          console.log(`📡 Enviando ${action} a Google Apps Script...`);
          
          const url = new URL(connection.scriptUrl);
          const params = new URLSearchParams({
              action: action,
              spreadsheetId: connection.spreadsheetId,
              sheetName: connection.sheetName,
              headersRow: connection.headersRow,
              data: JSON.stringify(data)
          });
  
          const fullUrl = `${url}?${params}`;
          console.log('🔗 URL final:', fullUrl);
  
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
  
          const response = await fetch(fullUrl, {
              method: 'GET',
              signal: controller.signal
          });
  
          clearTimeout(timeoutId);
  
          console.log('📨 Estado de respuesta:', response.status, response.statusText);
  
          if (!response.ok) {
              throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
          }
  
          const result = await response.json();
          console.log('✅ Respuesta REAL del servidor:', result);
          
          return result;
  
      } catch (error) {
          console.error('❌ Error en callGoogleScript:', error);
          
          if (error.name === 'AbortError') {
              throw new Error('Timeout: El servidor no respondió en 10 segundos');
          }
          
          throw new Error('Error de conexión: ' + error.message);
      }
  }
  
  function getShift() {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 15) return '1';
      if (hour >= 15 && hour < 22) return '2';
      return '3';
  }
  
  function openModal() {
      currentRow = {
          date: new Date().toISOString().split('T')[0],
          machine: '',
          program: '',
          shift: getShift(),
          type: '',
          measurements: {},
          referenceValues: {},
          referenceImages: {},
          notes: '',
          hasError: false
      };
      currentStep = 0;
      currentSet = 2;
      showInitialForm();
      document.getElementById('modalOverlay').classList.add('active');
  }
  
  function closeModal() {
      document.getElementById('modalOverlay').classList.remove('active');
      currentRow = null;
      currentStep = 0;
      currentSet = 2;
      closeImageModal();
  }
  
  function showInitialForm() {
      const content = `
          <form id="initialForm" onsubmit="handleInitialForm(event)">
              <div class="form-group">
                  <label>Fecha</label>
                  <input type="date" value="${currentRow.date}" readonly>
              </div>
              <div class="form-group">
                  <label>MACHINE</label>
                  <input type="text" id="machine" required placeholder="Ej: 5 (solo números 1-8)" 
                         oninput="validateMachineOnInput()">
                  <div class="error-message-machine" id="machineError">
                      ❌ Solo se permiten números del 1 al 8
                  </div>
              </div>
              <div class="form-group">
                  <label>PROGRAM</label>
                  <input type="text" id="program" required placeholder="Ej: 9101">
              </div>
              <div class="form-group">
                  <label>SHIFT</label>
                  <input type="text" value="${currentRow.shift}" readonly>
              </div>
              <div id="messageArea"></div>
              <div class="modal-actions">
                  <button type="button" class="cancel-btn" onclick="closeModal()">Cancelar</button>
                  <button type="submit" class="next-btn" id="searchBtn">Buscar Referencias</button>
              </div>
          </form>
      `;
      document.getElementById('modalContent').innerHTML = content;
      document.getElementById('modalTitle').textContent = 'Datos Básicos';
      
      validateMachineOnInput();
  }
  
  function validateMachineOnInput() {
      const machineInput = document.getElementById('machine');
      const searchBtn = document.getElementById('searchBtn');
      
      if (machineInput && searchBtn) {
          const isValid = validateMachineInput(machineInput.value);
          
          if (machineInput.value.trim() === '') {
              showMachineError(false);
              searchBtn.disabled = false;
          } else if (!isValid) {
              showMachineError(true);
              searchBtn.disabled = true;
          } else {
              showMachineError(false);
              searchBtn.disabled = false;
          }
      }
  }
  
  async function handleInitialForm(e) {
      e.preventDefault();
      const machine = document.getElementById('machine').value;
      const program = document.getElementById('program').value;
      
      if (!validateMachineInput(machine)) {
          showMessage('❌ El campo MACHINE solo acepta números del 1 al 8', 'error');
          showMachineError(true);
          return;
      }
      
      if (!machine || !program) {
          showMessage('Por favor completa todos los campos obligatorios', 'error');
          return;
      }
      
      currentRow.machine = machine;
      currentRow.program = program;
  
      document.getElementById('messageArea').innerHTML = '<div class="loading-text">Buscando referencias en DATA...</div>';
  
      try {
          const result = await callGoogleScript(
              sheetConnections.data, 
              'getReferenceValues', 
              { program: program }
          );
          
          console.log('Resultado de búsqueda:', result);
          
          if (result.success && result.data && result.data.found) {
              currentRow.type = result.data.type;
              currentRow.referenceValues = result.data.measurements;
              currentRow.referenceImages = result.data.images || {};
              
              console.log('✅ Referencias encontradas. TYPE:', currentRow.type, 'Referencias:', currentRow.referenceValues);
              console.log('🖼️ Imágenes de referencia:', currentRow.referenceImages);
              
              const allFields = getAllMeasurementFields();
              allFields.forEach(field => {
                  if (field.isInfo) {
                      currentRow.measurements[field.key] = currentRow.referenceValues[field.key] || 'N/A';
                  } else {
                      const baseKey = field.key.replace(/\d+$/, '1');
                      const refValue = currentRow.referenceValues[baseKey];
                      if (refValue === 'N/A' || refValue === null || refValue === undefined) {
                          currentRow.measurements[field.key] = 'N/A';
                      } else {
                          currentRow.measurements[field.key] = null;
                      }
                  }
              });
              
              showReferenceSummary();
              
          } else {
              const errorMsg = result.data && result.data.error 
                  ? result.data.error 
                  : `No se encontraron datos de referencia para el Program: ${program}`;
              showMessage('❌ ' + errorMsg, 'error');
          }
      } catch (error) {
          console.error('Error buscando referencias:', error);
          showMessage('❌ Error de conexión: ' + error.message, 'error');
      }
  }
  
  function showReferenceSummary() {
      const refValues = currentRow.referenceValues;
      const content = `
          <div class="form-group">
              <h3>✅ Referencias Encontradas</h3>
              <div class="reference-summary">
                  <div class="reference-item">
                      <strong>PROGRAM:</strong> ${currentRow.program}
                  </div>
                  <div class="reference-item">
                      <strong>TYPE:</strong> ${currentRow.type || 'N/A'}
                  </div>
                  <div class="reference-item">
                      <strong>PLATE THICKNESS:</strong> <span class="reference-value">${refValues.plateThickness1 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>TRACK ROJO:</strong> <span class="reference-value">${refValues.trackRojo1 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>TRACK AZUL:</strong> <span class="reference-value">${refValues.trackAzul1 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>BALL VERDE:</strong> <span class="reference-value">${refValues.ballVerde1 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>BALL AMARILLO:</strong> <span class="reference-value">${refValues.ballAmarillo1 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>BALL AZUL CIELO1:</strong> <span class="reference-value">${refValues.ballAzulCielo11 || 'N/A'}</span>
                  </div>
                  <div class="reference-item">
                      <strong>BALL AZUL CIELO2:</strong> <span class="reference-value">${refValues.ballAzulCielo21 || 'N/A'}</span>
                  </div>
              </div>
              <p class="hint">Set 1 cargado automáticamente. Ahora captura las mediciones reales (Sets 2-4).</p>
              <p class="hint"><strong>Nota:</strong> Solo el Set 2 incluye PLATE THICKNESS</p>
          </div>
          <div class="modal-actions">
              <button type="button" class="cancel-btn" onclick="closeModal()">Cancelar</button>
              <button type="button" class="next-btn" onclick="startSetMeasurement()">Comenzar Mediciones (Set 2)</button>
          </div>
      `;
      document.getElementById('modalContent').innerHTML = content;
      document.getElementById('modalTitle').textContent = 'Referencias Cargadas';
  }
  
  function startSetMeasurement() {
      currentStep = 0;
      showMeasurementForm();
  }
  
  function showMeasurementForm() {
      const currentFields = measurementStructure[`set${currentSet}`];
      
      if (currentStep >= currentFields.length) {
          if (currentSet < 4) {
              currentSet++;
              currentStep = 0;
              setTimeout(() => showMeasurementForm(), 100);
          } else {
              checkIfNoteRequired();
          }
          return;
      }
  
      const field = currentFields[currentStep];
      const baseKey = field.key.replace(/\d+$/, '1');
      const refValue = currentRow.referenceValues[baseKey];
      const currentValue = currentRow.measurements[field.key];
      
      let imageUrl = '';
      if (field.label === 'TRACK ROJO') {
          imageUrl = currentRow.referenceImages.trackRojoImagen || '';
      } else if (field.label === 'TRACK AZUL') {
          imageUrl = currentRow.referenceImages.trackAzulImagen || '';
      } else if (field.label === 'BALL VERDE') {
          imageUrl = currentRow.referenceImages.ballVerdeImagen || '';
      } else if (field.label === 'BALL AMARILLO') {
          imageUrl = currentRow.referenceImages.ballAmarilloImagen || '';
      } else if (field.label === 'BALL AZUL CIELO1') {
          imageUrl = currentRow.referenceImages.ballAzulCielo1Imagen || '';
      } else if (field.label === 'BALL AZUL CIELO2') {
          imageUrl = currentRow.referenceImages.ballAzulCielo2Imagen || '';
      }
      
      console.log(`🔍 Set ${currentSet} - Campo: ${field.label}, Valor ref: ${refValue}, Valor actual: ${currentValue}`);
      console.log(`🖼️ Imagen para ${field.label}:`, imageUrl);
      
      if (currentValue !== null) {
          console.log(`⏭️ Saltando ${field.label} (ya tiene valor: ${currentValue})`);
          currentStep++;
          setTimeout(() => showMeasurementForm(), 100);
          return;
      }
  
      if (imageUrl && imageUrl !== 'N/A' && imageUrl !== '') {
          setTimeout(() => {
              openImageModal(field.label, imageUrl);
          }, 300);
      }
  
      const content = `
          <div class="form-group">
              <label>Set ${currentSet} - ${field.label} ${field.required ? '*' : ''}</label>
              <div class="hint">Valor de referencia: <span class="reference-value">${refValue !== undefined && refValue !== 'N/A' ? refValue : 'N/A'}</span></div>
              <input type="number" step="0.001" id="measurementInput" ${field.required ? 'required' : ''} autofocus
                     placeholder="Ingresa la medida">
              <div class="hint">Medición ${currentStep + 1} de ${currentFields.length} (Set ${currentSet})</div>
          </div>
          <div id="messageArea"></div>
          <div class="modal-actions">
              <button type="button" class="cancel-btn" onclick="closeModal()">Cancelar</button>
              <button type="button" class="next-btn" onclick="saveMeasurement()">Siguiente</button>
          </div>
      `;
      document.getElementById('modalContent').innerHTML = content;
      document.getElementById('modalTitle').textContent = `Set ${currentSet} - Medición ${currentStep + 1}`;
      
      setTimeout(() => {
          const input = document.getElementById('measurementInput');
          if (input) input.focus();
      }, 100);
  }
  
  function saveMeasurement() {
      const input = document.getElementById('measurementInput');
      const value = parseFloat(input.value);
      
      if (isNaN(value)) {
          showMessage('Por favor ingresa un valor válido', 'error');
          input.focus();
          return;
      }
  
      const currentFields = measurementStructure[`set${currentSet}`];
      const field = currentFields[currentStep];
      const baseKey = field.key.replace(/\d+$/, '1');
      const refValue = currentRow.referenceValues[baseKey];
      
      if (refValue !== 'N/A' && refValue !== null && refValue !== undefined && !isNaN(parseFloat(refValue))) {
          const numRefValue = parseFloat(refValue);
          const difference = Math.abs(value - numRefValue);
          if (difference > 0.006) {
              currentRow.hasError = true;
              console.log(`⚠️ Diferencia detectada en ${field.label}: ${difference.toFixed(4)} (máximo permitido: 0.006)`);
              showMessage(`⚠️ Diferencia de ${difference.toFixed(4)} detectada. Máximo permitido: 0.006`, 'error');
          }
      }
  
      currentRow.measurements[field.key] = value;
      currentStep++;
      
      closeImageModal();
      
      showMeasurementForm();
  }
  
  function checkIfNoteRequired() {
      console.log('🔍 Verificando si se requieren notas. hasError:', currentRow.hasError);
      
      if (currentRow.hasError) {
          showNoteForm(true);
      } else {
          showNoteForm(false);
      }
  }
  
  function showNoteForm(required) {
      const content = `
          <div class="form-group">
              <label>NOTAS ${required ? '*' : '(Opcional)'}</label>
              <textarea id="notesInput" ${required ? 'required' : ''} 
                        placeholder="${required ? 'Explica por qué las mediciones están fuera del rango' : 'Observaciones adicionales'}"></textarea>
              ${required ? '<div class="error-message">⚠️ Se detectaron mediciones fuera del rango permitido. La nota es obligatoria.</div>' : ''}
          </div>
          <div class="modal-actions">
              <button type="button" class="cancel-btn" onclick="closeModal()">Cancelar</button>
              <button type="button" class="save-btn" onclick="saveRow()">Guardar Fila</button>
          </div>
      `;
      document.getElementById('modalContent').innerHTML = content;
      document.getElementById('modalTitle').textContent = 'Finalizar';
      
      if (required) {
          setTimeout(() => {
              const textarea = document.getElementById('notesInput');
              if (textarea) textarea.focus();
          }, 1000);
      }
  }
  
  function saveRow() {
      const notesInput = document.getElementById('notesInput');
      const notes = notesInput ? notesInput.value.trim() : '';
      
      if (currentRow.hasError && !notes) {
          showMessage('La nota es obligatoria para filas con mediciones fuera del rango', 'error');
          if (notesInput) notesInput.focus();
          return;
      }
  
      currentRow.notes = notes;
      
      if (currentRow.measurements.plateThickness2 === null || 
          currentRow.measurements.plateThickness2 === undefined || 
          currentRow.measurements.plateThickness2 === 'N/A') {
          showMessage('Falta la medición de PLATE THICKNESS en el Set 2', 'error');
          return;
      }
      
      rows.push({...currentRow});
      console.log('💾 Fila guardada:', currentRow);
      renderRows();
      closeModal();
      document.getElementById('sendBtn').disabled = false;
      
      showMessage(`✅ Fila agregada correctamente. Sets 2-4 capturados. Total: ${rows.length} fila(s)`, 'success');
  }
  
  function renderRows() {
      const container = document.getElementById('rowsContainer');
      
      if (rows.length === 0) {
          container.innerHTML = `
              <div class="empty-state">
                  <div class="empty-state-icon">📋</div>
                  <h3>No hay filas registradas</h3>
                  <p>Haz clic en "Nueva Fila" para comenzar</p>
              </div>
          `;
          return;
      }
  
      container.innerHTML = rows.map((row, index) => `
          <div class="row-card ${row.hasError ? 'has-error' : ''}">
              <div class="row-header">
                  <span class="row-title">Fila ${index + 1} - ${row.program} (TYPE: ${row.type})</span>
                  <div style="display: flex; align-items: center; gap: 10px;">
                      ${row.hasError ? '<span class="error-badge">⚠️ Con discrepancias</span>' : ''}
                      <button class="delete-row-btn" onclick="deleteRow(${index})" title="Eliminar fila">✕</button>
                  </div>
              </div>
              <div class="row-info">
                  <div class="info-item">
                      <div class="info-label">Fecha</div>
                      <div class="info-value">${row.date}</div>
                  </div>
                  <div class="info-item">
                      <div class="info-label">Machine</div>
                      <div class="info-value">${row.machine}</div>
                  </div>
                  <div class="info-item">
                      <div class="info-label">Program</div>
                      <div class="info-value">${row.program}</div>
                  </div>
                  <div class="info-item">
                      <div class="info-label">Shift</div>
                      <div class="info-value">${row.shift}</div>
                  </div>
                  <div class="info-item">
                      <div class="info-label">Type</div>
                      <div class="info-value">${row.type}</div>
                  </div>
              </div>
              <div class="sets-container">
                  ${renderSets(row)}
              </div>
              ${row.notes ? `
                  <div class="note-section">
                      <div class="note-label">📝 NOTAS</div>
                      <div class="note-text">${row.notes}</div>
                  </div>
              ` : ''}
          </div>
      `).join('');
  }
  
  function renderSets(row) {
      let html = '';
      
      html += `
          <div class="set-container">
              <div class="set-header">Set 1 (Referencias)</div>
              <div class="measurements-grid">
                  ${renderMeasurementsForSet(row, 1)}
              </div>
          </div>
      `;
      
      for (let setNum = 2; setNum <= 4; setNum++) {
          const fields = measurementStructure[`set${setNum}`];
          const hasData = fields.some(field => 
              row.measurements[field.key] !== null && 
              row.measurements[field.key] !== undefined && 
              row.measurements[field.key] !== 'N/A'
          );
          
          if (hasData) {
              html += `
                  <div class="set-container">
                      <div class="set-header">Set ${setNum} (Mediciones) ${setNum === 2 ? '(con PLATE THICKNESS)' : ''}</div>
                      <div class="measurements-grid">
                          ${renderMeasurementsForSet(row, setNum)}
                      </div>
                  </div>
              `;
          }
      }
      
      return html;
  }
  
  function renderMeasurementsForSet(row, setNum) {
      const fields = measurementStructure[`set${setNum}`];
      return fields.map(field => {
          const value = row.measurements[field.key];
          const baseKey = field.key.replace(/\d+$/, '1');
          const refValue = row.referenceValues[baseKey];
          
          if (value === undefined || value === null || value === 'N/A') return '';
          
          const isNA = refValue === 'N/A' || refValue === null || refValue === undefined;
          const isInfoField = field.isInfo;
          
          let outOfRange = false;
          if (!isNA && !isInfoField && typeof value === 'number') {
              const numRefValue = parseFloat(refValue);
              if (!isNaN(numRefValue)) {
                  outOfRange = Math.abs(value - numRefValue) > 0.006;
              }
          }
          
          return `
              <div class="measurement-item ${outOfRange ? 'out-of-range' : ''}">
                  <div class="measurement-label">${field.label}</div>
                  <div class="measurement-value">${typeof value === 'number' ? value.toFixed(3) : value}</div>
                  <div class="measurement-difference">${isNA ? 'Ref: N/A' : 'Ref: ' + refValue}</div>
              </div>
          `;
      }).join('');
  }
  
  function showMessage(text, type) {
      const messageArea = document.getElementById('messageArea');
      if (messageArea) {
          messageArea.innerHTML = `<div class="${type === 'error' ? 'error-message' : 'success-message'}">${text}</div>`;
          
          if (type === 'success') {
              setTimeout(() => {
                  if (messageArea.innerHTML.includes('success-message')) {
                      messageArea.innerHTML = '';
                  }
              }, 5000);
          }
      }
  }
  
  async function sendToGoogleSheets() {
      if (rows.length === 0) {
          alert('No hay filas para enviar');
          return;
      }
  
      const sendBtn = document.getElementById('sendBtn');
      sendBtn.disabled = true;
      sendBtn.textContent = '⏳ Enviando...';
  
      try {
          const values = rows.map(row => {
              return [
                  row.date,                    // A: DATE
                  row.machine,                 // B: MACHINE
                  row.program,                 // C: PROGRAM
                  row.shift,                   // D: SHIFT
                  row.type || '',              // E: TYPE
                  
                  row.referenceValues.plateThickness1 || 'N/A',  // F: PLATE THICKNESS (referencia)
                  row.referenceValues.trackRojo1 || 'N/A',       // G: TRACK ROJO (referencia)
                  row.referenceValues.trackAzul1 || 'N/A',       // H: TRACK AZUL (referencia)
                  row.referenceValues.ballVerde1 || 'N/A',       // I: BALL VERDE (referencia)
                  row.referenceValues.ballAmarillo1 || 'N/A',    // J: BALL AMARILLO (referencia)
                  row.referenceValues.ballAzulCielo11 || 'N/A',  // K: BALL AZUL CIELO1 (referencia)
                  row.referenceValues.ballAzulCielo21 || 'N/A',  // L: BALL AZUL CIELO2 (referencia)
                  
                  // COLUMNAS M-S: SET 2 (Mediciones del usuario CON PLATE THICKNESS)
                  row.measurements.plateThickness2 || 'N/A',     // M: PLATE THICKNESS
                  row.measurements.trackRojo2 || 'N/A',          // N: TRACK ROJO
                  row.measurements.trackAzul2 || 'N/A',          // O: TRACK AZUL
                  row.measurements.ballVerde2 || 'N/A',          // P: BALL VERDE
                  row.measurements.ballAmarillo2 || 'N/A',       // Q: BALL AMARILLO
                  row.measurements.ballAzulCielo12 || 'N/A',     // R: BALL AZUL CIELO1
                  row.measurements.ballAzulCielo22 || 'N/A',     // S: BALL AZUL CIELO2
                  
                  // COLUMNAS T-Y: SET 3 (Mediciones del usuario SIN PLATE THICKNESS)
                  row.measurements.trackRojo3 || 'N/A',          // T: TRACK ROJO
                  row.measurements.trackAzul3 || 'N/A',          // U: TRACK AZUL
                  row.measurements.ballVerde3 || 'N/A',          // V: BALL VERDE
                  row.measurements.ballAmarillo3 || 'N/A',       // W: BALL AMARILLO
                  row.measurements.ballAzulCielo13 || 'N/A',     // X: BALL AZUL CIELO1
                  row.measurements.ballAzulCielo23 || 'N/A',     // Y: BALL AZUL CIELO2
                  
                  // COLUMNAS Z-AE: SET 4 (Mediciones del usuario SIN PLATE THICKNESS)
                  row.measurements.trackRojo4 || 'N/A',          // Z: TRACK ROJO
                  row.measurements.trackAzul4 || 'N/A',          // AA: TRACK AZUL
                  row.measurements.ballVerde4 || 'N/A',          // AB: BALL VERDE
                  row.measurements.ballAmarillo4 || 'N/A',       // AC: BALL AMARILLO
                  row.measurements.ballAzulCielo14 || 'N/A',     // AD: BALL AZUL CIELO1
                  row.measurements.ballAzulCielo24 || 'N/A',     // AE: BALL AZUL CIELO2
                  
                  // COLUMNA AF: NOTAS
                  row.notes || ''
              ];
          });
  
          console.log('📤 Enviando datos a CONCENTRADO DE MEDIDAS. Filas:', rows.length);
  
          const result = await callGoogleScript(
              sheetConnections.medidas,
              'appendData',
              { values }
          );
  
          if (result.success) {
              alert(`✅ ${result.message || `${rows.length} fila(s) enviadas exitosamente a CONCENTRADO DE MEDIDAS`}`);
              rows = [];
              renderRows();
              document.getElementById('sendBtn').disabled = true;
          } else {
              throw new Error(result.error || 'Error desconocido al enviar datos');
          }
          
      } catch (error) {
          console.error('Error completo:', error);
          alert('❌ Error al enviar a Google Sheets: ' + error.message);
      } finally {
          sendBtn.textContent = '📤 Enviar Reporte';
          sendBtn.disabled = rows.length === 0;
      }
  }
  
  function initApp() {
      console.log('🚀 Inicializando aplicación...');
      console.log('🔗 URLs configuradas:', sheetConnections);
      
      if (!document.getElementById('rowsContainer')) {
          console.error('❌ No se encontró el elemento rowsContainer');
          return;
      }
      
      if (!document.getElementById('sendBtn')) {
          console.error('❌ No se encontró el elemento sendBtn');
          return;
      }
      
      createImageModal();
      
      renderRows();
      document.getElementById('sendBtn').disabled = true;
      
      setTimeout(() => {
          showMessage('✅ Sistema listo. Haz clic en "Nueva Fila" para comenzar.', 'success');
      }, 10000);
  }
  
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
  } else {
      initApp();
  }
  
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.handleInitialForm = handleInitialForm;
  window.saveMeasurement = saveMeasurement;
  window.saveRow = saveRow;
  window.sendToGoogleSheets = sendToGoogleSheets;
  window.startSetMeasurement = startSetMeasurement;
  window.openImageModal = openImageModal;
  window.closeImageModal = closeImageModal;
  window.validateMachineOnInput = validateMachineOnInput;
  window.deleteRow = deleteRow;

