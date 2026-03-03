// Основной файл с инициализацией и вспомогательными функциями

// Управление вкладками
function setupTabs() {
    console.log('Setting up tabs');
    var tabs = document.querySelectorAll('[data-tab]');
    
    for (var i = 0; i < tabs.length; i++) {
        // Удаляем старые обработчики и добавляем новые
        tabs[i].replaceWith(tabs[i].cloneNode(true));
    }
    
    // Снова получаем все кнопки после замены
    tabs = document.querySelectorAll('[data-tab]');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function(e) {
            e.preventDefault();
            
            var tabId = this.getAttribute('data-tab');
            console.log('Switching to tab:', tabId);
            
            // Скрываем все вкладки
            var contents = document.querySelectorAll('.tab-content');
            for (var j = 0; j < contents.length; j++) {
                contents[j].style.display = 'none';
            }
            
            // Убираем активный класс
            var buttons = document.querySelectorAll('.tab-button, .guestbook-button');
            for (var k = 0; k < buttons.length; k++) {
                buttons[k].classList.remove('active');
            }
            
            // Показываем выбранную вкладку
            var targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.style.display = 'block';
            }
            this.classList.add('active');
        });
    }
}

// Счетчик посещений
function updateCounter() {
    try {
        var counterDiv = document.querySelector('.counter');
        if (!counterDiv) {
            // Создаем счетчик, если его нет
            counterDiv = document.createElement('div');
            counterDiv.className = 'counter';
            var td = document.querySelector('td[valign="top"]');
            if (td) td.appendChild(counterDiv);
        }
        
        var visits = localStorage.getItem('visits');
        if (!visits) visits = '0';
        visits = parseInt(visits, 10) + 1;
        localStorage.setItem('visits', visits);
        counterDiv.innerHTML = 'Ты стал № ' + visits + ' на сайте (^-^)';
    } catch (e) {
        console.log('Counter error:', e);
    }
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Обновляем счетчик
    updateCounter();
    
    // Настройка вкладок
    setTimeout(function() {
        setupTabs();
        
        // Делаем главную вкладку активной по умолчанию
        var mainTab = document.querySelector('[data-tab="main"]');
        if (mainTab) {
            mainTab.click();
        }
    }, 100);
    
    // Инициализация плеера
    if (typeof musicPlayer !== 'undefined') {
        console.log('Initializing music player...');
        setTimeout(function() {
            musicPlayer.init();
        }, 200);
    } else {
        console.error('musicPlayer not found');
    }
    
    // Инициализация гостевой книги
    setTimeout(function() {
        if (typeof guestbook !== 'undefined') {
            console.log('Initializing guestbook...');
            guestbook.init();
        } else {
            console.error('guestbook not found');
        }
    }, 300);
});