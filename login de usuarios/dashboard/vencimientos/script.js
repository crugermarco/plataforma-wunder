let autoRefreshInterval;
let currentData = [];

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygUQLcz4hKbjtTTFUAfbmCa01ZJ3jzwfyfuLiHQUxnSWODWYRXoT3DI5BpIvhF2CWX/exec';

const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1hZ-kiTPSCje0qpJEGd3bDpiYVBLJkOUF-FpkglHm_00',
  sheetName: 'material',
  range: 'A:G'
};

async function getSheetData() {
  try {
    const params = {
      action: 'getData',
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
      range: GOOGLE_SHEETS_CONFIG.range
    };
    
    const baseUrl = APPS_SCRIPT_URL;
    const urlParams = new URLSearchParams(params);
    const url = `${baseUrl}?${urlParams.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error(data.error || 'No se encontraron datos');
    }
  } catch (error) {
    console.error('Error conectando con Google Sheets:', error);
    return [];
  }
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  document.getElementById('current-time').textContent = timeString;
}

function formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  } catch {
    return dateString;
  }
}

function createCard(row, rowNumber) {
  const partNumber = row[1] || 'Sin número de parte';
  const imageUrl = row[2] || '';
  const cantidad = parseInt(row[3]) || 0;
  const fechaRecibo = formatDate(row[0]);
  const fechaVencimiento = formatDate(row[4]);
  const pdfLink = row[5] || '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const vencDate = fechaVencimiento !== 'N/A' ? new Date(row[4]) : null;
  const isVencido = vencDate && vencDate < today;
  const isVigente = vencDate && vencDate >= today;
  
  const statusText = isVencido ? 'VENCIMIENTO' : isVigente ? 'VIGENTE' : 'SIN DATOS';
  const statusClass = isVencido ? 'status-vencimiento' : isVigente ? 'status-vigente' : 'status-neutral';
  const cardClass = isVencido ? 'card-vencimiento' : '';
  
  return `
    <div class="machine-card ${cardClass}" data-row="${rowNumber}" data-cantidad="${cantidad}">
      <div class="image-section">
        ${imageUrl ? `<img src="${imageUrl}" alt="${partNumber}" onerror="this.parentElement.innerHTML='<div class=placeholder>Sin Imagen</div>'">` : `<div class="placeholder">Sin Imagen</div>`}
        ${pdfLink ? `<a href="${pdfLink}" target="_blank" class="pdf-icon" title="Ver Hoja de Seguridad">PDF</a>` : ''}
      </div>
      <div class="info-section">
        <div class="product-name">${partNumber}</div>
        <div class="dates-row">
          <div class="date-item">
            <span class="date-label">Recibido:</span>
            <span class="date-value">${fechaRecibo}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Vence:</span>
            <span class="date-value ${isVencido ? 'text-danger' : ''}">${fechaVencimiento}</span>
          </div>
        </div>
        <div class="quantity-row">
          <span class="quantity-label">Cantidad:</span>
          <span class="quantity-value">${cantidad}</span>
        </div>
        <div class="${statusClass} status-badge">${statusText}</div>
        <div class="buttons-row">
          <button class="btn-action btn-add" data-row="${rowNumber}">Agregar Stock</button>
          <button class="btn-action btn-remove" data-row="${rowNumber}">Dar de Baja</button>
        </div>
      </div>
    </div>
  `;
}

async function loadData() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading"><div class="spinner"></div><p>Actualizando datos...</p></div>`;
  try {
    const rawData = await getSheetData();
    currentData = rawData;

    if (rawData.length > 0 && rawData[0][0] && rawData[0][0].toString().toLowerCase().includes('fecha')) {
      rawData.shift();
    }

    const vencidos = rawData.filter(row => {
      const fechaVencimiento = row[4];
      if (!fechaVencimiento || fechaVencimiento === 'N/A') return false;
      const vencDate = new Date(fechaVencimiento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return vencDate < today;
    });
    const vigentes = rawData.filter(row => {
      const fechaVencimiento = row[4];
      if (!fechaVencimiento || fechaVencimiento === 'N/A') return false;
      const vencDate = new Date(fechaVencimiento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return vencDate >= today;
    });
    const otros = rawData.filter(row => {
      const fechaVencimiento = row[4];
      return !fechaVencimiento || fechaVencimiento === 'N/A';
    });
    const orderedCards = [...vencidos, ...vigentes, ...otros];
    let cardsHTML = '<div class="machines-grid">';
    orderedCards.forEach((row, index) => {
      cardsHTML += createCard(row, index + 2);
    });
    cardsHTML += '</div>';
    content.innerHTML = cardsHTML;
    document.getElementById('total-machines').textContent = `${rawData.length} Químicos`;
    document.getElementById('vencidos-count').textContent = `${vencidos.length} Vencidos`;
    document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString('es-MX');
    
    attachButtonEvents();
  } catch (error) {
    content.innerHTML = `<div class="error-message">Error al cargar datos: ${error.message}<br><br><button class="btn-confirm" onclick="loadData()">Reintentar</button></div>`;
  }
}

function attachButtonEvents() {
  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const rowNumber = parseInt(this.getAttribute('data-row'));
      openStockModal('add', rowNumber);
    });
  });
  
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const rowNumber = parseInt(this.getAttribute('data-row'));
      openStockModal('remove', rowNumber);
    });
  });
}

function openStockModal(action, rowNumber) {
  const modal = document.getElementById('stock-modal');
  const modalTitle = document.getElementById('modal-title');
  const productName = document.getElementById('product-name');
  const currentQuantity = document.getElementById('current-quantity');
  const actionType = document.getElementById('action-type');
  const adjustQuantity = document.getElementById('adjust-quantity');
  
  modalTitle.textContent = action === 'add' ? 'Agregar Stock' : 'Dar de Baja Stock';
  actionType.value = action;
  
  const card = document.querySelector(`.machine-card[data-row="${rowNumber}"]`);
  if (!card) {
    alert('Error: No se encontró el producto');
    return;
  }
  
  const productNameText = card.querySelector('.product-name').textContent;
  const cantidad = parseInt(card.getAttribute('data-cantidad'));
  
  productName.value = productNameText;
  currentQuantity.value = cantidad;
  
  if (action === 'add') {
    document.getElementById('expiration-group').style.display = 'block';
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    document.getElementById('new-expiration').min = today.toISOString().split('T')[0];
    document.getElementById('new-expiration').value = nextMonth.toISOString().split('T')[0];
  } else {
    document.getElementById('expiration-group').style.display = 'none';
  }
  
  adjustQuantity.value = '1';
  adjustQuantity.max = action === 'remove' ? cantidad : '';
  adjustQuantity.min = '1';
  
  modal.style.display = 'flex';
  setTimeout(() => {
    adjustQuantity.focus();
  }, 100);
}

function closeStockModal() {
  const modal = document.getElementById('stock-modal');
  modal.style.display = 'none';
}

async function confirmStockAdjustment() {
  const actionType = document.getElementById('action-type').value;
  const adjustQuantity = parseInt(document.getElementById('adjust-quantity').value);
  
  if (adjustQuantity < 1) {
    alert('La cantidad debe ser al menos 1');
    return;
  }
  
  let newExpiration = '';
  
  if (actionType === 'add') {
    newExpiration = document.getElementById('new-expiration').value;
    if (!newExpiration) {
      alert('Por favor seleccione una fecha de vencimiento');
      return;
    }
  } else {
    const confirmar = confirm(`¿Está seguro de dar de baja ${adjustQuantity} unidades?`);
    if (!confirmar) return;
  }
  
  try {
    const productName = document.getElementById('product-name').value;
    
    const params = {
      action: 'updateStock',
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
      productName: productName,
      actionType: actionType,
      quantity: adjustQuantity.toString(),
      newExpiration: newExpiration || ''
    };
    
    const baseUrl = APPS_SCRIPT_URL;
    const urlParams = new URLSearchParams(params);
    const url = `${baseUrl}?${urlParams.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error al actualizar');
    }
    
    alert('Stock actualizado correctamente');
    closeStockModal();
    loadData();
  } catch (error) {
    alert('Error al actualizar el stock: ' + error.message);
  }
}

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(loadData, 60000);
}

function init() {
  updateClock();
  setInterval(updateClock, 1000);
  loadData();
  startAutoRefresh();
  
  document.getElementById('modal-close').addEventListener('click', closeStockModal);
  document.getElementById('btn-cancel').addEventListener('click', closeStockModal);
  document.getElementById('btn-confirm').addEventListener('click', confirmStockAdjustment);
  
  document.getElementById('action-type').addEventListener('change', function() {
    if (this.value === 'add') {
      document.getElementById('expiration-group').style.display = 'block';
    } else {
      document.getElementById('expiration-group').style.display = 'none';
    }
  });
  
  document.getElementById('adjust-quantity').addEventListener('input', function() {
    const actionType = document.getElementById('action-type').value;
    if (actionType === 'remove') {
      const currentQty = parseInt(document.getElementById('current-quantity').value) || 0;
      const value = parseInt(this.value) || 0;
      if (value > currentQty) {
        this.value = currentQty;
      }
      if (value < 1) {
        this.value = 1;
      }
    }
  });
  
  document.getElementById('stock-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeStockModal();
    }
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeStockModal();
    }
  });
}

window.addEventListener('load', init);
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});
