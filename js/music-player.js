// Музыкальный плеер
var musicPlayer = {
    audio: new Audio(),
    currentTrack: 0,
    isPlaying: false,
    updateInterval: null,
    playlist: [
        {
            title: "Bailando",
            artist: "Paradisio",
            file: "music/Paradisio-Bailando.mp3",
            cover: "images/cover_bailando.jpg",
            duration: "3:28"
        },
        {
            title: "Hit The Road Jack",
            artist: "Ray Charles",
            file: "music/RayCharles-HittheRoadJack.mp3",
            cover: "images/hittheroadjack.jpg",
            duration: "1:58"
        },
        {   
            title: "Better off Alone",
            artist: "Alice DJ",
            file: "music/AliceDj-BetterOffAlone.mp3",
            cover: "images/betteroffalone_cover.jpg",
            duration: "3:36"
        },
        { 
            title: "Lease",
            artist: "Takeshi Abo",
            file: "music/LEASE-Takeshi abo.mp3",
            cover: "images/lease_cover.jpg",
            duration: "1:48"
        }
    ],
    
    init: function() {
        console.log('Music player init');
        
        // Проверяем существование элементов
        if (!document.getElementById('winamp-play')) {
            console.error('Player elements not found');
            return;
        }
        
        // Удаляем старые обработчики и добавляем новые
        this.cleanup();
        
        // Добавляем обработчик окончания трека
        this.audio.addEventListener('ended', this.nextTrack.bind(this));
        
        // Настраиваем элементы управления
        this.setupControls();
        this.setupMinimize();
        this.setupDraggable();
        
        // Загружаем первый трек
        this.loadTrack(this.currentTrack);
    },
    
    cleanup: function() {
        // Удаляем старые обработчики с кнопок, заменяя их клонами
        var playBtn = document.getElementById('winamp-play');
        var pauseBtn = document.getElementById('winamp-pause');
        var nextBtn = document.getElementById('winamp-next');
        var prevBtn = document.getElementById('winamp-prev');
        
        if (playBtn) playBtn.replaceWith(playBtn.cloneNode(true));
        if (pauseBtn) pauseBtn.replaceWith(pauseBtn.cloneNode(true));
        if (nextBtn) nextBtn.replaceWith(nextBtn.cloneNode(true));
        if (prevBtn) prevBtn.replaceWith(prevBtn.cloneNode(true));
    },
    
    setupControls: function() {
        var playBtn = document.getElementById('winamp-play');
        var pauseBtn = document.getElementById('winamp-pause');
        var nextBtn = document.getElementById('winamp-next');
        var prevBtn = document.getElementById('winamp-prev');
        var volumeSlider = document.getElementById('winamp-volume');
        var progressContainer = document.getElementById('winamp-progress-container');
        
        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.play();
            }.bind(this));
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.pause();
            }.bind(this));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.nextTrack();
            }.bind(this));
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.prevTrack();
            }.bind(this));
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', function(e) {
                this.audio.volume = e.target.value;
            }.bind(this));
        }
        
        if (progressContainer) {
            progressContainer.addEventListener('click', function(e) {
                if (this.audio.duration) {
                    var rect = progressContainer.getBoundingClientRect();
                    var clickX = e.clientX - rect.left;
                    var percent = clickX / rect.width;
                    this.audio.currentTime = percent * this.audio.duration;
                }
            }.bind(this));
        }
    },
    
    setupMinimize: function() {
        var minimizeBtn = document.getElementById('winamp-minimize');
        var restoreBtn = document.getElementById('winamp-restore');
        var container = document.getElementById('winamp-container');
        var minimized = document.getElementById('winamp-minimized');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function() {
                if (container) container.style.display = 'none';
                if (minimized) minimized.style.display = 'block';
            });
        }
        
        if (restoreBtn) {
            restoreBtn.addEventListener('click', function() {
                if (container) container.style.display = 'block';
                if (minimized) minimized.style.display = 'none';
            });
        }
    },
    
    setupDraggable: function() {
        var playerContainer = document.getElementById('winamp-container');
        var playerHeader = document.getElementById('winamp-header');
        
        if (playerHeader && playerContainer) {
            var isDragging = false;
            var offsetX, offsetY;
            
            playerHeader.addEventListener('mousedown', function(e) {
                isDragging = true;
                var rect = playerContainer.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                playerHeader.style.cursor = 'grabbing';
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                
                playerContainer.style.left = (e.clientX - offsetX) + 'px';
                playerContainer.style.top = (e.clientY - offsetY) + 'px';
                playerContainer.style.bottom = 'auto';
                playerContainer.style.right = 'auto';
                e.preventDefault();
            });
            
            document.addEventListener('mouseup', function() {
                isDragging = false;
                playerHeader.style.cursor = 'grab';
            });
        }
    },
    
    loadTrack: function(index) {
        if (index < 0 || index >= this.playlist.length) {
            console.error('Invalid track index:', index);
            return;
        }
        
        this.currentTrack = index;
        var track = this.playlist[index];
        console.log('Loading track:', track.title);
        
        this.audio.src = track.file;
        
        // Обновляем информацию о треке
        var titleEl = document.getElementById('winamp-track-title');
        var artistEl = document.getElementById('winamp-track-artist');
        var coverEl = document.getElementById('winamp-cover');
        var timeEl = document.getElementById('winamp-time');
        
        if (titleEl) titleEl.textContent = track.title;
        if (artistEl) artistEl.textContent = track.artist;
        if (coverEl) {
            if (track.cover) {
                coverEl.style.backgroundImage = "url('" + track.cover + "')";
            } else {
                coverEl.style.backgroundImage = 'none';
            }
        }
        if (timeEl) timeEl.textContent = '0:00 / ' + track.duration;
        
        // Сбрасываем прогресс
        var progressBar = document.getElementById('winamp-progress-bar');
        if (progressBar) progressBar.style.width = '0%';
        
        // ВАЖНО: Всегда запускаем воспроизведение при загрузке трека
        // Не проверяем this.isPlaying, просто запускаем
        this.play();
    },
    
    play: function() {
        // Если уже играет, не делаем ничего
        if (this.isPlaying) return;
        
        var volumeSlider = document.getElementById('winamp-volume');
        if (volumeSlider) {
            this.audio.volume = volumeSlider.value;
        }
        
        var playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(function() {
                    this.isPlaying = true;
                    
                    var playBtn = document.getElementById('winamp-play');
                    var pauseBtn = document.getElementById('winamp-pause');
                    
                    if (playBtn) playBtn.style.display = 'none';
                    if (pauseBtn) pauseBtn.style.display = 'block';
                    
                    if (this.updateInterval) clearInterval(this.updateInterval);
                    this.updateInterval = setInterval(function() {
                        this.updateProgress();
                        this.updateTime();
                    }.bind(this), 100);
                    
                    console.log('Playback started');
                }.bind(this))
                .catch(function(e) {
                    console.log('Playback failed:', e);
                    // Если не удалось воспроизвести (например, из-за политик браузера),
                    // сбрасываем флаг воспроизведения
                    this.isPlaying = false;
                }.bind(this));
        }
    },
    
    pause: function() {
        if (!this.isPlaying) return;
        
        this.audio.pause();
        this.isPlaying = false;
        
        var playBtn = document.getElementById('winamp-play');
        var pauseBtn = document.getElementById('winamp-pause');
        
        if (playBtn) playBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('Playback paused');
    },
    
    nextTrack: function() {
        var nextIndex = (this.currentTrack + 1) % this.playlist.length;
        console.log('Next track, index:', nextIndex);
        this.loadTrack(nextIndex);
        // Не нужно вызывать play(), loadTrack() уже запускает воспроизведение
    },
    
    prevTrack: function() {
        var prevIndex = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        console.log('Previous track, index:', prevIndex);
        this.loadTrack(prevIndex);
        // Не нужно вызывать play(), loadTrack() уже запускает воспроизведение
    },
    
    updateProgress: function() {
        if (this.audio.duration) {
            var progress = (this.audio.currentTime / this.audio.duration) * 100;
            var progressBar = document.getElementById('winamp-progress-bar');
            if (progressBar) progressBar.style.width = progress + '%';
        }
    },
    
    updateTime: function() {
        if (this.audio.duration) {
            var current = this.formatTime(this.audio.currentTime);
            var duration = this.formatTime(this.audio.duration);
            var timeEl = document.getElementById('winamp-time');
            if (timeEl) timeEl.textContent = current + ' / ' + duration;
        }
    },
    
    formatTime: function(seconds) {
        if (isNaN(seconds)) return '0:00';
        var mins = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
};