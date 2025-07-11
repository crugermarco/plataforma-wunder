let autoRefreshInterval;

const GOOGLE_SHEETS_CONFIG = {
  apiKey: 'AIzaSyBYw2gwhaxFI6JgXZFRFkKcu5n6-mOvwV4',
  spreadsheetId: '1hZ-kiTPSCje0qpJEGd3bDpiYVBLJkOUF-FpkglHm_00',
  range: 'material!A:G',
};

const mockData = [
  ["2025-08-01", "NP1234", "https://via.placeholder.com/150", "10", "2025-09-01", "https://example.com/pdf1.pdf", "Lote1"],
  ["2025-07-15", "NP5678", "https://via.placeholder.com/150", "5", "2025-07-25", "https://example.com/pdf2.pdf", "Lote2"],
  ["2025-07-10", "NP9012", "https://via.placeholder.com/150", "8", "2025-12-01", "https://example.com/pdf3.pdf", "Lote3"],
];

async function getSheetData() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.values) {
      return data.values;
    } else {
      throw new Error('No se encontraron datos');
    }
  } catch (error) {
    console.warn('Error conectando con Google Sheets, usando datos de ejemplo:', error);
    return mockData;
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

function diffMonths(date1, date2) {
  const years = date2.getFullYear() - date1.getFullYear();
  const months = date2.getMonth() - date1.getMonth();
  return years * 12 + months;
}

function createCard(imageUrl, status, name, cantidad, fechaRecibo, pdfLink, index) {
  const statusSafe = status ? status.toString() : '';
  const isVigente = statusSafe.toUpperCase() === 'VIGENTE';
  const isVencimiento = statusSafe.toUpperCase() === 'VENCIMIENTO';

  const badgeClass = isVencimiento ? 'status-badge status-mt blink' : isVigente ? 'status-badge status-progress' : 'status-badge status-neutral';
  const borderColor = isVigente ? '#10b981' : isVencimiento ? '#ef4444' : '#64748b';

  return `
    <div class="machine-card" style="border-top: 4px solid ${borderColor}; animation-delay: ${index * 0.1}s;">
      <div class="machine-image">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${name}" onerror="this.parentElement.innerHTML='<div class=placeholder>📷 Sin Imagen</div>'">`
            : `<div class="placeholder">📷 Sin Imagen</div>`
        }
        ${
          pdfLink
            ? `<a href="${pdfLink}" target="_blank" class="pdf-button" title="Ver Hoja de Seguridad">📄</a>`
            : ''
        }
      </div>
      <div class="machine-details-content">
        <div class="fecha-recibo"><strong>Fecha de Recibo:</strong> ${fechaRecibo}</div>
        <div class="cantidad">Cantidad: ${cantidad}</div>
        <div class="${badgeClass}">${isVigente ? 'Vigente' : isVencimiento ? 'Vencimiento' : statusSafe}</div>
      </div>
    </div>
  `;
}

async function loadData() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Actualizando datos...</p>
    </div>
  `;

  try {
    const rawData = await getSheetData();

    if (rawData.length > 0 && rawData[0][0].toLowerCase().includes('fecha')) {
      rawData.shift();
    }

    const today = new Date();
    const cards = rawData.map((row, i) => {
      const fechaVencimiento = row[4];
      let status = 'Vigente';
      if (fechaVencimiento) {
        const vencDate = new Date(fechaVencimiento);
        const diff = diffMonths(today, vencDate);
        if (diff < 1) status = 'Vencimiento';
      }

      return {
        imageUrl: row[2] || '',
        status,
        name: row[1] || 'Sin nombre',
        cantidad: row[3] || '0',
        fechaRecibo: row[0] || 'N/A',
        pdfLink: row[5] || '',
      };
    });

    const vencidos = cards.filter(c => c.status === 'Vencimiento');
    const vigentes = cards.filter(c => c.status === 'Vigente');
    const orderedCards = [...vencidos, ...vigentes];

    let cardsHTML = '<div class="machines-grid">';
    orderedCards.forEach((card, index) => {
      cardsHTML += createCard(card.imageUrl, card.status, card.name, card.cantidad, card.fechaRecibo, card.pdfLink, index);
    });
    cardsHTML += '</div>';

    content.innerHTML = cardsHTML;

    document.getElementById('total-machines').textContent = `${cards.length} Químicos`;
    document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString('es-MX');
  } catch (error) {
    content.innerHTML = `
      <div class="error-message">
        ❌ Error al cargar datos: ${error.message}
        <br><br>
        <button class="btn-refresh" onclick="loadData()">Reintentar</button>
      </div>
    `;
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

  const btnRefresh = document.getElementById('btn-refresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadData();
    });
  }
}

window.addEventListener('load', init);
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});
