function ZABGenerator() {
    this.sheetConnections = {
        produccion: {
            scriptUrl: 'https://script.google.com/macros/s/AKfycbzEyZ6Q8aMtHpVRWRUQ5LL2X9IFl0fJKYNdS0LEt52CmSpEvqt_zqfFTjTPrSqU7JeFyw/exec',
            spreadsheetId: '18TLDwUV4QCpwOi6nhwLCzcoll0kMjPi1lRoteJsaSfA',
            sheetName: 'CONCENTRADO ZAB'
        }
    };

    this.BACKEND_URL = this.sheetConnections.produccion.scriptUrl;
    
    this.val = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
        'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27,
        'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33, 'Y': 34, 'Z': 35
    };
    
    this.revval = {
        0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
        10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F', 16: 'G', 17: 'H', 18: 'I',
        19: 'J', 20: 'K', 21: 'L', 22: 'M', 23: 'N', 24: 'O', 25: 'P', 26: 'Q', 27: 'R',
        28: 'S', 29: 'T', 30: 'U', 31: 'V', 32: 'W', 33: 'X', 34: 'Y', 35: 'Z'
    };
    
    this.weight = {
        1: 5, 2: 7, 3: 11, 4: 13, 5: 17, 6: 19, 7: 23, 8: 29, 9: 31
    };
    
    this.generatedCodes = [];
    this.currentCounter = 300000;
    this.isBackendReady = false;
    
    this.initializeElements();
    this.bindEvents();
    this.initializeBackend();
}

ZABGenerator.prototype.initializeElements = function() {
    this.modal = document.getElementById('modalOverlay');
    this.openModalBtn = document.getElementById('openModalBtn');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    
    this.zabForm = document.getElementById('zabForm');
    this.lastZabInput = document.getElementById('lastZabInput');
    this.quantitySelect = document.getElementById('quantityInput');
    this.customQuantityGroup = document.getElementById('customQuantityGroup');
    this.customQuantityInput = document.getElementById('customQuantityInput');
    
    this.resultsArea = document.getElementById('resultsArea');
    this.resultsGrid = document.getElementById('resultsGrid');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.clearBtn = document.getElementById('clearBtn');
    
    this.totalGeneratedEl = document.getElementById('totalGenerated');
    this.lastZabEl = document.getElementById('lastZab');
    this.currentCounterEl = document.getElementById('currentCounter');
    
    this.loadingIndicator = document.getElementById('loadingIndicator');
    
    this.toastContainer = document.getElementById('toastContainer');
    
    var elements = [
        this.modal, this.openModalBtn, this.closeModalBtn, this.cancelBtn,
        this.zabForm, this.lastZabInput, this.quantitySelect, this.customQuantityGroup,
        this.customQuantityInput, this.resultsArea, this.resultsGrid, this.downloadBtn,
        this.clearBtn, this.totalGeneratedEl, this.lastZabEl, this.currentCounterEl,
        this.loadingIndicator, this.toastContainer
    ];
    
    for (var i = 0; i < elements.length; i++) {
        if (!elements[i]) {
            console.error('Elemento no encontrado:', elements[i]);
        }
    }
};

ZABGenerator.prototype.bindEvents = function() {
    var self = this;
    
    if (this.openModalBtn) {
        this.openModalBtn.addEventListener('click', function() { self.openModal(); });
    }
    if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener('click', function() { self.closeModal(); });
    }
    if (this.cancelBtn) {
        this.cancelBtn.addEventListener('click', function() { self.closeModal(); });
    }
    if (this.modal) {
        this.modal.addEventListener('click', function(e) {
            if (e.target === self.modal) self.closeModal();
        });
    }
    
    if (this.zabForm) {
        this.zabForm.addEventListener('submit', function(e) { self.handleFormSubmit(e); });
    }
    if (this.quantitySelect) {
        this.quantitySelect.addEventListener('change', function() { self.handleQuantityChange(); });
    }
    if (this.lastZabInput) {
        this.lastZabInput.addEventListener('input', function(e) { self.formatZabInput(e); });
    }
    
    if (this.downloadBtn) {
        this.downloadBtn.addEventListener('click', function() { self.downloadCSV(); });
    }
    if (this.clearBtn) {
        this.clearBtn.addEventListener('click', function() { self.clearResults(); });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.target !== self.lastZabInput && e.key === 'Escape' && self.modal && self.modal.style.display === 'flex') {
            self.closeModal();
        }
    });
};

ZABGenerator.prototype.initializeBackend = function() {
    var self = this;
    
    console.log('🔄 Inicializando conexión con backend...');
    console.log('📋 URL:', this.BACKEND_URL);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.BACKEND_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    console.log('✅ Backend conectado:', data);
                    
                    if (data.success) {
                        self.currentCounter = data.lastCounter || self.currentCounter;
                        self.updateStats();
                        self.isBackendReady = true;
                        self.showToast('✅ Conexión con Google Sheets establecida', 'success');
                    } else {
                        throw new Error(data.error || 'Error del backend');
                    }
                } catch (parseError) {
                    console.error('❌ Error parseando respuesta:', parseError);
                    self.activateOfflineMode();
                }
            } else {
                console.error('❌ Error HTTP:', xhr.status, xhr.statusText);
                self.activateOfflineMode();
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ Error de red');
        self.activateOfflineMode();
    };
    
    xhr.timeout = 10000;
    xhr.ontimeout = function() {
        console.error('⏰ Timeout de conexión');
        self.activateOfflineMode();
    };
    
    xhr.send();
};

ZABGenerator.prototype.activateOfflineMode = function() {
    this.isBackendReady = false;
    this.showToast('⚠️ Modo offline activado. Los códigos se guardarán localmente.', 'warning');
    this.loadFromLocalStorage();
};

ZABGenerator.prototype.openModal = function() {
    if (this.modal) {
        this.modal.style.display = 'flex';
        var self = this;
        setTimeout(function() { 
            if (self.lastZabInput) self.lastZabInput.focus(); 
        }, 100);
        document.body.style.overflow = 'hidden';
    }
};

ZABGenerator.prototype.closeModal = function() {
    if (this.modal) {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (this.zabForm) this.zabForm.reset();
        if (this.customQuantityGroup) this.customQuantityGroup.style.display = 'none';
    }
};

ZABGenerator.prototype.handleQuantityChange = function() {
    if (this.quantitySelect && this.customQuantityGroup) {
        if (this.quantitySelect.value === 'custom') {
            this.customQuantityGroup.style.display = 'block';
            var self = this;
            setTimeout(function() { 
                if (self.customQuantityInput) self.customQuantityInput.focus(); 
            }, 100);
        } else {
            this.customQuantityGroup.style.display = 'none';
        }
    }
};

ZABGenerator.prototype.formatZabInput = function(e) {
    var value = e.target.value.toUpperCase();
    value = value.replace(/[^ZAB0-9A-Z]/g, '');
    
    if (value && !value.startsWith('ZAB')) {
        if ('ZAB'.startsWith(value)) {
            value = 'ZAB'.substring(0, value.length);
        } else {
            value = 'ZAB' + value.replace(/ZAB/g, '');
        }
    }
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    e.target.value = value;
};

ZABGenerator.prototype.handleFormSubmit = function(e) {
    e.preventDefault();
    var self = this;
    
    var lastZab = this.lastZabInput ? this.lastZabInput.value.trim().toUpperCase() : '';
    var quantity = this.quantitySelect ? (this.quantitySelect.value === 'custom' 
        ? parseInt(this.customQuantityInput ? this.customQuantityInput.value : 0) 
        : parseInt(this.quantitySelect.value)) : 0;
    
    if (lastZab && !this.validateZabFormat(lastZab)) {
        this.showToast('Formato de ZAB inválido. Debe ser ZAB + 6 dígitos + 1 check digit', 'error');
        return;
    }
    
    if (!quantity || quantity < 1 || quantity > 1000) {
        this.showToast('La cantidad debe estar entre 1 y 1000', 'error');
        return;
    }
    
    this.closeModal();
    this.showLoading(true);
    
    var startCounter = lastZab ? this.extractCounterFromZab(lastZab) + 1 : this.currentCounter + 1;
    
    this.generateZABCodes(startCounter, quantity)
        .then(function() {
            self.showLoading(false);
            self.showToast('✅ ' + quantity + ' códigos ZAB generados y guardados', 'success');
        })
        .catch(function(error) {
            self.showLoading(false);
            console.error('Error generando códigos:', error);
            self.showToast('❌ Error: ' + error.message, 'error');
        });
};

ZABGenerator.prototype.validateZabFormat = function(zab) {
    var regex = /^ZAB\d{6}[0-9A-Z]$/;
    return regex.test(zab);
};

ZABGenerator.prototype.extractCounterFromZab = function(zab) {
    return parseInt(zab.substring(3, 9));
};

ZABGenerator.prototype.calculateCheckDigit = function(sn) {
    var snDigits = sn.split('');
    var addend = 0;
    
    for (var i = 0; i < 9; i++) {
        var digit = snDigits[i];
        var weight = this.weight[i + 1];
        var value = this.val[digit];
        addend += value * weight;
    }
    
    var chkdigit = addend % 36;
    return this.revval[chkdigit];
};

ZABGenerator.prototype.generateZABCodes = function(startCounter, quantity) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
        try {
            var newCodes = [];
            var counter = startCounter;
            
            for (var i = 0; i < quantity; i++) {
                var sn = 'ZAB' + counter.toString().padStart(6, '0');
                var checkDigit = self.calculateCheckDigit(sn);
                var finalCode = sn + checkDigit;
                
                newCodes.push(finalCode);
                counter++;
            }
            
            self.saveToBackend(newCodes)
                .then(function(result) {
                    self.generatedCodes = self.generatedCodes.concat(newCodes);
                    self.currentCounter = counter - 1;
                    self.updateStats();
                    self.displayResults(newCodes);
                    resolve(result);
                })
                .catch(function(error) {
                    reject(error);
                });
                
        } catch (error) {
            reject(error);
        }
    });
};

ZABGenerator.prototype.saveToBackend = function(codes) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
        if (!self.isBackendReady) {
            self.saveToLocalStorage(codes);
            resolve({ success: true, savedCount: codes.length, offline: true });
            return;
        }
        
        console.log('💾 Enviando', codes.length, 'códigos al backend...');
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', self.BACKEND_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var result = JSON.parse(xhr.responseText);
                        if (result.success) {
                            console.log('✅ Guardado en backend:', result.savedCount, 'códigos');
                            resolve(result);
                        } else {
                            throw new Error(result.error || 'Error del backend');
                        }
                    } catch (error) {
                        console.error('❌ Error parseando respuesta:', error);
                        self.saveToLocalStorage(codes);
                        resolve({ success: true, savedCount: codes.length, offline: true });
                    }
                } else {
                    console.error('❌ Error HTTP:', xhr.status);
                    self.saveToLocalStorage(codes);
                    resolve({ success: true, savedCount: codes.length, offline: true });
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ Error de red');
            self.saveToLocalStorage(codes);
            resolve({ success: true, savedCount: codes.length, offline: true });
        };
        
        xhr.timeout = 30000;
        xhr.ontimeout = function() {
            console.error('⏰ Timeout enviando datos');
            self.saveToLocalStorage(codes);
            resolve({ success: true, savedCount: codes.length, offline: true });
        };
        
        xhr.send(JSON.stringify({
            codes: codes,
            action: 'saveCodes'
        }));
    });
};

ZABGenerator.prototype.saveToLocalStorage = function(codes) {
    try {
        var storedCodes = JSON.parse(localStorage.getItem('zabCodes') || '[]');
        var newStoredCodes = storedCodes.concat(codes);
        localStorage.setItem('zabCodes', JSON.stringify(newStoredCodes));
        localStorage.setItem('zabCounter', this.currentCounter.toString());
        
        console.log('💾 Guardado local:', codes.length, 'códigos');
        this.showToast('📱 Códigos guardados localmente (modo offline)', 'warning');
        
    } catch (error) {
        console.error('Error guardando localmente:', error);
        throw new Error('No se pudieron guardar los códigos localmente');
    }
};

ZABGenerator.prototype.loadFromLocalStorage = function() {
    try {
        var storedCodes = JSON.parse(localStorage.getItem('zabCodes') || '[]');
        var storedCounter = localStorage.getItem('zabCounter');
        
        if (storedCodes.length > 0) {
            this.generatedCodes = storedCodes;
            this.currentCounter = storedCounter ? parseInt(storedCounter) : this.currentCounter;
            this.updateStats();
            this.showToast('📱 Datos cargados desde almacenamiento local', 'info');
        }
    } catch (error) {
        console.error('Error cargando datos locales:', error);
    }
};

ZABGenerator.prototype.updateStats = function() {
    if (this.totalGeneratedEl) {
        this.totalGeneratedEl.textContent = this.generatedCodes.length.toLocaleString();
    }
    if (this.lastZabEl) {
        this.lastZabEl.textContent = this.generatedCodes.length > 0 ? 
            this.generatedCodes[this.generatedCodes.length - 1] : 'Ninguno';
    }
    if (this.currentCounterEl) {
        this.currentCounterEl.textContent = this.currentCounter.toLocaleString();
    }
};

ZABGenerator.prototype.displayResults = function(codes) {
    if (!this.resultsArea || !this.resultsGrid) return;
    
    this.resultsArea.style.display = 'block';
    this.resultsGrid.innerHTML = '';
    
    for (var i = 0; i < codes.length; i++) {
        var code = codes[i];
        var item = document.createElement('div');
        item.className = 'result-item';
        item.textContent = code;
        item.title = 'Clic para copiar';
        
        item.addEventListener('click', (function(code) {
            return function() {
                navigator.clipboard.writeText(code).then(function() {
                    this.showToast('📋 ' + code + ' copiado al portapapeles', 'success');
                }.bind(this)).catch(function() {
                    this.showToast('❌ Error al copiar', 'error');
                }.bind(this));
            };
        }.bind(this))(code));
        
        this.resultsGrid.appendChild(item);
    }
    
    this.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

ZABGenerator.prototype.downloadCSV = function() {
    if (this.generatedCodes.length === 0) {
        this.showToast('No hay códigos para descargar', 'error');
        return;
    }
    
    var csvContent = 'ZAB\n' + this.generatedCodes.join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    
    if (link.download !== undefined) {
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ZAB_Codes_' + new Date().toISOString().split('T')[0] + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('📥 Archivo CSV descargado exitosamente', 'success');
    }
};

ZABGenerator.prototype.clearResults = function() {
    if (this.generatedCodes.length === 0) {
        this.showToast('No hay resultados para limpiar', 'info');
        return;
    }
    
    if (confirm('¿Está seguro de que desea limpiar todos los resultados?')) {
        this.generatedCodes = [];
        if (this.resultsArea) this.resultsArea.style.display = 'none';
        if (this.resultsGrid) this.resultsGrid.innerHTML = '';
        this.updateStats();
        localStorage.removeItem('zabCodes');
        localStorage.removeItem('zabCounter');
        this.showToast('🧹 Resultados limpiados', 'success');
    }
};

ZABGenerator.prototype.showLoading = function(show) {
    if (this.loadingIndicator) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
    if (this.openModalBtn) {
        this.openModalBtn.disabled = show;
    }
};

ZABGenerator.prototype.showToast = function(message, type) {
    if (!this.toastContainer) return;
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    
    var icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = '<span style="font-size: 1.2rem; margin-right: 8px;">' + icon + '</span><span>' + message + '</span>';
    
    this.toastContainer.appendChild(toast);
    
    var self = this;
    setTimeout(function() {
        if (toast.parentNode === self.toastContainer) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease-out';
            setTimeout(function() {
                if (toast.parentNode === self.toastContainer) {
                    self.toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
};

window.testConnection = function() {
    var url = 'https://script.google.com/macros/s/AKfycbxgQs2ae3Uh-ulWZKpeLHreccCNDSqjm-JRs3__HqsYrBC9X47XhYpFkinZAug3-Q2dhg/exec';
    
    console.log('🔗 Probando conexión con:', url);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log('Status:', xhr.status, xhr.statusText);
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    console.log('✅ Respuesta del backend:', data);
                } catch (e) {
                    console.error('❌ Error parseando JSON:', e);
                }
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ Error de conexión');
    };
    
    xhr.timeout = 10000;
    xhr.ontimeout = function() {
        console.error('⏰ Timeout de conexión');
    };
    
    xhr.send();
};

window.clearLocalData = function() {
    if (confirm('¿Eliminar todos los datos locales?')) {
        localStorage.removeItem('zabCodes');
        localStorage.removeItem('zabCounter');
        console.log('🧹 Datos locales limpiados');
        alert('Datos locales eliminados');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando ZAB Generator...');
    window.zabGenerator = new ZABGenerator();
});

window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
});