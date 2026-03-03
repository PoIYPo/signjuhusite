// Гостевая книга с рисованием - РАБОЧАЯ ВЕРСИЯ С ДВУМЯ ХОЛСТАМИ
var guestbook = {
    currentTool: 'brush',
    currentColor: '#000000',
    currentSize: 3,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    
    // Основной холст
    mainCanvas: null,
    mainCtx: null,
    
    // Холст для предпросмотра
    previewCanvas: null,
    previewCtx: null,
    
    init: function() {
        console.log('Initializing guestbook');

        this.mainCanvas = document.getElementById('signature-pad');
        this.previewCanvas = document.getElementById('signature-preview');
        
        if (!this.mainCanvas || !this.previewCanvas) {
            console.error('Canvas not found!');
            return;
        }

        try {
            // Контексты
            this.mainCtx = this.mainCanvas.getContext('2d', { willReadFrequently: true });
            this.previewCtx = this.previewCanvas.getContext('2d');
            
            // Белый фон
            this.clearCanvas();

            // Инициализация
            this.initSignaturePad();
            this.initSignatureTools();
            this.loadEntries();

            console.log('Guestbook initialized successfully');
        } catch (e) {
            console.error('Error initializing guestbook:', e);
        }
    },

    clearCanvas: function() {
        if (this.mainCtx && this.mainCanvas) {
            this.mainCtx.fillStyle = 'white';
            this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        }
        this.clearPreview();
    },
    
    clearPreview: function() {
        if (this.previewCtx && this.previewCanvas) {
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        }
    },

    initSignaturePad: function() {
        if (!this.mainCanvas) return;

        // Обработчики событий мыши - только на основном холсте
        this.mainCanvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.mainCanvas.addEventListener('mousemove', this.draw.bind(this));
        this.mainCanvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.mainCanvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Кнопка очистки
        var clearBtn = document.getElementById('clear-signature');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                this.clearCanvas();
            }.bind(this));
        }

        // Кнопка отправки
        var submitBtn = document.getElementById('guestbook-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', this.addEntry.bind(this));
        }
    },

    initSignatureTools: function() {
        // Выбор инструмента
        var toolBtns = document.querySelectorAll('[data-tool]');
        for (var i = 0; i < toolBtns.length; i++) {
            toolBtns[i].addEventListener('click', function(e) {
                var tool = e.target.getAttribute('data-tool');
                if (tool) {
                    this.currentTool = tool;
                    var allTools = document.querySelectorAll('[data-tool]');
                    for (var j = 0; j < allTools.length; j++) {
                        allTools[j].classList.remove('active');
                    }
                    e.target.classList.add('active');
                    this.clearPreview();
                }
            }.bind(this));
        }

        // Выбор цвета
        var colorPicker = document.getElementById('signature-color');
        if (colorPicker) {
            colorPicker.addEventListener('input', function(e) {
                this.currentColor = e.target.value;
            }.bind(this));
        }

        // Выбор размера
        var sizeSelect = document.getElementById('signature-size');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', function(e) {
                this.currentSize = parseInt(e.target.value, 10);
            }.bind(this));
        }
    },

    startDrawing: function(e) {
        if (!this.mainCanvas || !this.mainCtx) return;

        var rect = this.mainCanvas.getBoundingClientRect();
        var x = Math.min(Math.max(0, e.clientX - rect.left), this.mainCanvas.width);
        var y = Math.min(Math.max(0, e.clientY - rect.top), this.mainCanvas.height);

        this.isDrawing = true;
        this.startX = this.lastX = x;
        this.startY = this.lastY = y;

        if (this.currentTool === 'fill') {
            this.floodFill(Math.floor(x), Math.floor(y));
            this.isDrawing = false;
        } else if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            // Кисть и ластик рисуем на основном холсте
            this.mainCtx.beginPath();
            this.mainCtx.moveTo(this.lastX, this.lastY);
            if (this.currentTool === 'eraser') {
                this.mainCtx.strokeStyle = '#ffffff';
            } else {
                this.mainCtx.strokeStyle = this.currentColor;
            }
            this.mainCtx.lineWidth = this.currentSize;
            this.mainCtx.lineJoin = 'round';
            this.mainCtx.lineCap = 'round';
        } else {
            // Для фигур очищаем preview
            this.clearPreview();
        }
    },

    draw: function(e) {
        if (!this.isDrawing || !this.mainCanvas || !this.mainCtx) return;

        var rect = this.mainCanvas.getBoundingClientRect();
        var currentX = Math.min(Math.max(0, e.clientX - rect.left), this.mainCanvas.width);
        var currentY = Math.min(Math.max(0, e.clientY - rect.top), this.mainCanvas.height);

        // Кисть
        if (this.currentTool === 'brush') {
            this.mainCtx.strokeStyle = this.currentColor;
            this.mainCtx.lineTo(currentX, currentY);
            this.mainCtx.stroke();
            this.mainCtx.beginPath();
            this.mainCtx.moveTo(currentX, currentY);
            this.lastX = currentX;
            this.lastY = currentY;
        }
        // Ластик
        else if (this.currentTool === 'eraser') {
            this.mainCtx.strokeStyle = '#ffffff';
            this.mainCtx.lineTo(currentX, currentY);
            this.mainCtx.stroke();
            this.mainCtx.beginPath();
            this.mainCtx.moveTo(currentX, currentY);
            this.lastX = currentX;
            this.lastY = currentY;
        }
        // Фигуры - рисуем ТОЛЬКО на preview холсте
        else if (this.currentTool === 'line' || this.currentTool === 'rectangle' || this.currentTool === 'circle') {
            // Очищаем preview
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            
            // Настройки для preview
            this.previewCtx.strokeStyle = this.currentColor;
            this.previewCtx.lineWidth = this.currentSize;
            this.previewCtx.setLineDash([5, 3]); // Пунктир для предпросмотра
            
            // Рисуем фигуру на preview
            this.previewCtx.beginPath();
            
            if (this.currentTool === 'line') {
                this.previewCtx.moveTo(this.startX, this.startY);
                this.previewCtx.lineTo(currentX, currentY);
                this.previewCtx.stroke();
            } else if (this.currentTool === 'rectangle') {
                var width = currentX - this.startX;
                var height = currentY - this.startY;
                this.previewCtx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.currentTool === 'circle') {
                var radius = Math.sqrt(
                    Math.pow(currentX - this.startX, 2) +
                    Math.pow(currentY - this.startY, 2)
                );
                this.previewCtx.beginPath();
                this.previewCtx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                this.previewCtx.stroke();
            }
            
            // Возвращаем обычный стиль
            this.previewCtx.setLineDash([]);
            
            // Сохраняем координаты
            this.lastX = currentX;
            this.lastY = currentY;
        }
    },

    stopDrawing: function() {
        if (!this.isDrawing || !this.mainCanvas || !this.mainCtx) return;

        // Для фигур переносим с preview на основной холст
        if (this.currentTool === 'line' || this.currentTool === 'rectangle' || this.currentTool === 'circle') {
            // Рисуем финальную фигуру на основном холсте
            this.mainCtx.strokeStyle = this.currentColor;
            this.mainCtx.lineWidth = this.currentSize;
            this.mainCtx.beginPath();
            
            if (this.currentTool === 'line') {
                this.mainCtx.moveTo(this.startX, this.startY);
                this.mainCtx.lineTo(this.lastX, this.lastY);
                this.mainCtx.stroke();
            } else if (this.currentTool === 'rectangle') {
                var width = this.lastX - this.startX;
                var height = this.lastY - this.startY;
                this.mainCtx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.currentTool === 'circle') {
                var radius = Math.sqrt(
                    Math.pow(this.lastX - this.startX, 2) +
                    Math.pow(this.lastY - this.startY, 2)
                );
                this.mainCtx.beginPath();
                this.mainCtx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                this.mainCtx.stroke();
            }
            
            // Очищаем preview
            this.clearPreview();
        }

        this.isDrawing = false;
    },

    // --- ЗАЛИВКА (без изменений) ---
    floodFill: function(x, y) {
        if (!this.mainCanvas || !this.mainCtx) return;

        var ctx = this.mainCtx;
        var imageData = ctx.getImageData(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        var targetColor = this.getPixelColor(imageData, x, y);
        var fillRgb = this.hexToRgb(this.currentColor);

        if (this.colorsMatch(targetColor, fillRgb)) {
            return;
        }

        var width = this.mainCanvas.width;
        var height = this.mainCanvas.height;
        var data = imageData.data;
        var pixelsToCheck = [[x, y]];

        while (pixelsToCheck.length > 0) {
            var pixel = pixelsToCheck.pop();
            var px = pixel[0];
            var py = pixel[1];
            var pixelPos = (py * width + px) * 4;

            if (px >= 0 && px < width && py >= 0 && py < height &&
                data[pixelPos] === targetColor.r &&
                data[pixelPos + 1] === targetColor.g &&
                data[pixelPos + 2] === targetColor.b &&
                data[pixelPos + 3] === targetColor.a) {

                data[pixelPos] = fillRgb.r;
                data[pixelPos + 1] = fillRgb.g;
                data[pixelPos + 2] = fillRgb.b;
                data[pixelPos + 3] = 255;

                if (px > 0) pixelsToCheck.push([px - 1, py]);
                if (px < width - 1) pixelsToCheck.push([px + 1, py]);
                if (py > 0) pixelsToCheck.push([px, py - 1]);
                if (py < height - 1) pixelsToCheck.push([px, py + 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    },

    getPixelColor: function(imageData, x, y) {
        var data = imageData.data;
        var pos = (y * imageData.width + x) * 4;
        return {
            r: data[pos],
            g: data[pos + 1],
            b: data[pos + 2],
            a: data[pos + 3]
        };
    },

    hexToRgb: function(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
            a: 255
        };
    },

    colorsMatch: function(color1, color2) {
        return color1.r === color2.r &&
               color1.g === color2.g &&
               color1.b === color2.b &&
               color1.a === color2.a;
    },

    // --- Методы для работы с записями ---
    addEntry: function() {
        var nameInput = document.getElementById('guestbook-name');
        var messageInput = document.getElementById('guestbook-message');

        if (!nameInput || !messageInput) return;

        var name = nameInput.value.trim();
        var message = messageInput.value.trim();

        if (!name || !message) {
            alert('Заполните все поля!');
            return;
        }

        var signature = null;
        if (!this.isCanvasBlank()) {
            signature = this.mainCanvas.toDataURL();
        }

        var entries = JSON.parse(localStorage.getItem('guestbookEntries') || '[]');
        entries.push({
            name: name,
            message: message,
            date: new Date().toLocaleString(),
            signature: signature
        });
        localStorage.setItem('guestbookEntries', JSON.stringify(entries));

        nameInput.value = '';
        messageInput.value = '';
        this.clearCanvas();

        this.loadEntries();
    },

    isCanvasBlank: function() {
        if (!this.mainCanvas || !this.mainCtx) return true;
        var context = this.mainCtx;
        var pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, this.mainCanvas.width, this.mainCanvas.height).data.buffer
        );
        for (var i = 0; i < pixelBuffer.length; i++) {
            if (pixelBuffer[i] !== 4294967295) return false;
        }
        return true;
    },

    loadEntries: function() {
        var container = document.getElementById('guestbook-entries');
        if (!container) return;

        container.innerHTML = '<h3>Сообщения гостей:</h3>';
        var entries = JSON.parse(localStorage.getItem('guestbookEntries') || '[]');

        if (entries.length === 0) {
            container.innerHTML += '<p>Пока нет сообщений</p>';
            return;
        }

        for (var i = entries.length - 1; i >= 0; i--) {
            var entry = entries[i];
            var entryElement = document.createElement('div');
            entryElement.className = 'guestbook-entry';

            var signatureHTML = '';
            if (entry.signature) {
                signatureHTML = '<div style="margin-top:10px;"><strong>Подпись:</strong><br><img src="' + entry.signature + '" style="max-width:100%; border:1px solid #8B00FF; background:white;" /></div>';
            }

            entryElement.innerHTML =
                '<div class="guestbook-name">' + entry.name + '</div>' +
                '<div class="guestbook-message">' + entry.message + '</div>' +
                signatureHTML +
                '<div class="guestbook-date">' + entry.date + '</div>';

            container.appendChild(entryElement);
        }
    }
};