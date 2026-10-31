// Variables globales
let isPlaying = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

function getAudio() {
    return document.getElementById('bgMusic');
}

// Funciones globales para los botones del modal
function enterWithMusicClick() {
    enableMusic = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    activateMusic();
}

function enterWithoutMusicClick() {
    enableMusic = false;
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    deactivateMusic();
}

// play() se llama directo dentro del clic del usuario (lo que exige iOS Safari)
function activateMusic() {
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.style.display = 'block';
    const audio = getAudio();
    if (!audio) return;
    audio.volume = 0.8;
    const p = audio.play();
    if (p && p.then) {
        p.then(() => { isPlaying = true; updateMusicIcon(); })
         .catch(() => { isPlaying = false; updateMusicIcon(); });
    } else {
        isPlaying = true;
        updateMusicIcon();
    }
}

function deactivateMusic() {
    const audio = getAudio();
    if (audio) audio.pause();
    isPlaying = false;
    // Se muestra el botón igual, por si luego quieren activar la música
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) musicPlayer.style.display = 'block';
    updateMusicIcon();
}

// Función para configurar los botones directamente
function setupModalButtons() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    if (enterWithMusic) enterWithMusic.onclick = enterWithMusicClick;
    if (enterWithoutMusic) enterWithoutMusic.onclick = enterWithoutMusicClick;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeCarousel();
    setupModalButtons();

    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) musicToggle.addEventListener('click', toggleMusic);

    const audio = getAudio();
    if (audio) {
        audio.addEventListener('play', () => { isPlaying = true; updateMusicIcon(); });
        audio.addEventListener('pause', () => { isPlaying = false; updateMusicIcon(); });
    }

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'flex';
});

// Pausar la música si el invitado cambia de app/pestaña y reanudar al volver
document.addEventListener('visibilitychange', function() {
    const audio = getAudio();
    if (!audio) return;
    if (document.hidden) {
        if (!audio.paused) { audio.dataset.resume = '1'; audio.pause(); }
    } else if (audio.dataset.resume === '1') {
        audio.dataset.resume = '';
        audio.play().catch(() => {});
    }
});

function toggleMusic() {
    const audio = getAudio();
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (volumeIcon) {
        if (isPlaying) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#222" stroke-width="2"></path>
                <circle cx="6.5" cy="12" r="1" fill="#ffe27a"/>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <line x1="19" y1="9" x2="17" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <line x1="17" y1="9" x2="19" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <circle cx="6.5" cy="12" r="1" fill="#ff6b6b"/>
            `;
        }
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2027-01-30T18:00:00-04:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track) return;

    // calcular total dinámicamente
    const items = track.querySelectorAll('.carousel-item');
    totalSlides = items.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    // Ajuste inicial para asegurar cálculo correcto tras el render
    updateCarousel();
    requestAnimationFrame(updateCarousel);
    setTimeout(updateCarousel, 200);

    // Auto-play del carrusel
    setInterval(() => {
        nextSlide();
    }, 2500);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const items = track.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const container = track.parentElement;

        // Temporarily reset transform to measure actual positions
        const previousTransform = track.style.transform;
        track.style.transform = 'none';

        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1] ? items[1].getBoundingClientRect() : null;
        const stepWidth = Math.max(1, secondRect ? Math.round(secondRect.left - firstRect.left) : Math.round(firstRect.width));

        const containerWidth = Math.round(container.getBoundingClientRect().width);
        const visibleCount = Math.max(1, Math.floor((containerWidth + 1) / stepWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCount);

        // Detectar si esta actualización implica dar la vuelta (última foto -> primera, o viceversa)
        let wrapped = false;
        if (currentSlide > maxIndex) { currentSlide = 0; wrapped = true; }
        if (currentSlide < 0) { currentSlide = maxIndex; wrapped = true; }

        const trackRect = track.getBoundingClientRect();
        const baseLeft = Math.round(firstRect.left - trackRect.left);
        const translateXpx = -Math.round(baseLeft + (currentSlide * stepWidth));

        if (wrapped) {
            // Salto instantáneo al dar la vuelta, para que no se vea "regresando"
            // animado hacia atrás por todas las fotos.
            track.style.transition = 'none';
            track.style.transform = `translateX(${translateXpx}px)`;
            void track.offsetHeight; // forzar reflow antes de reactivar la transición
            requestAnimationFrame(() => {
                track.style.transition = '';
            });
        } else {
            track.style.transform = `translateX(${translateXpx}px)`;
        }
        // console.log('Carousel moved to slide:', { currentSlide, visibleCount, maxIndex, translateXpx, stepWidth, baseLeft, wrapped });
    }
    updateSlideCounter();
    markCenterCarouselItem();
}

function nextSlide() {
    currentSlide++;
    updateCarousel();
}

function previousSlide() {
    currentSlide--;
    updateCarousel();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    if (currentSlideElement) currentSlideElement.textContent = (currentSlide + 1);
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
}

// Mark center carousel item on desktop
function markCenterCarouselItem() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));

    const firstItem = items[0];
    const container = track.parentElement;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.floor(containerWidth / itemWidth));

    const centerIndex = (currentSlide + Math.floor(visibleCount / 2)) % items.length;
    items[centerIndex].classList.add('is-center');
}

// Hook into carousel updates
const _origUpdateCarousel = typeof updateCarousel === 'function' ? updateCarousel : null;
if (_origUpdateCarousel) {
    window.updateCarousel = function() {
        _origUpdateCarousel();
        markCenterCarouselItem();
    };
}

window.addEventListener('resize', markCenterCarouselItem);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(markCenterCarouselItem, 200);
});

// Funciones de los botones (plantilla de ejemplo: sin enlaces reales)
function openLocation(location) {
    window.open('https://maps.app.goo.gl/ZADYFA7jb2SNFjCG9', '_blank', 'noopener');
}

function uploadPhoto() {
    window.open('https://photos.app.goo.gl/UFdg5Wn1YSvUCCFD6', '_blank', 'noopener');
}

function showDressCode() {
    showInfoModal(
        "Código de Vestimenta",
        `<p class="dress-code-label">Elegante</p>
         <p>Damas: vestido largo o de cóctel elegante.<br/>Caballeros: traje.</p>
         <div class="no-green-note">
            <span class="no-green-swatch" aria-hidden="true"></span>
            <p>El color verde está reservado exclusivamente para la quinceañera. Se solicita amablemente a los invitados evitar su uso.</p>
         </div>`
    );
}

function showGifts() {
    showInfoModal(
        "Regalos",
        `<p>Tu presencia es mi mejor regalo. Si deseas hacerme un obsequio, puedes hacerlo a esta cuenta:</p>
         <div class="bank-card">
            <div class="bank-row"><span class="bank-label">Banco</span><span class="bank-value">Banreservas</span></div>
            <div class="bank-row"><span class="bank-label">Tipo de cuenta</span><span class="bank-value">Ahorro</span></div>
            <div class="bank-row"><span class="bank-label">Número</span><span class="bank-value bank-number" id="bankNumber">9605724105</span></div>
            <div class="bank-row"><span class="bank-label">Titular</span><span class="bank-value">Dalmia González</span></div>
         </div>
         <button class="btn-gold copy-btn" id="copyBankBtn" onclick="copyBankNumber()">Copiar número de cuenta</button>`
    );
}

function copyBankNumber() {
    const number = '9605724105';
    const btn = document.getElementById('copyBankBtn');
    const done = () => { if (btn) { btn.textContent = '¡Copiado! ✓'; setTimeout(() => { btn.textContent = 'Copiar número de cuenta'; }, 2000); } };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(number).then(done).catch(() => fallbackCopy(number, done));
    } else {
        fallbackCopy(number, done);
    }
}

function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) {}
    document.body.removeChild(ta);
}

const RSVP_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScJ_fJBFr4Pc8MXhP5RpurEeJRvPjI45AeYY7Sv5LDRNqfEow/viewform?usp=publish-editor';
const RSVP_WHATSAPP = '18494019000';
const RSVP_MESSAGE = '¡Hola! Confirmo mi asistencia a los XV años de Cristhin el sábado 30 de enero de 2027. Mi nombre es: ';

function confirmAttendance() {
    showInfoModal(
        "Confirma tu Asistencia",
        `<p>Elige cómo prefieres confirmar:</p>
         <div class="rsvp-options">
            <button class="btn-gold rsvp-option" onclick="confirmByForm()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
                Confirmar por formulario
            </button>
            <button class="btn-gold rsvp-option rsvp-whatsapp" onclick="confirmByWhatsApp()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                Confirmar por WhatsApp
            </button>
         </div>`
    );
}

function confirmByForm() {
    window.open(RSVP_FORM_URL, '_blank', 'noopener');
}

function confirmByWhatsApp() {
    window.open('https://wa.me/' + RSVP_WHATSAPP + '?text=' + encodeURIComponent(RSVP_MESSAGE), '_blank', 'noopener');
}

// Modal de información (ventana flotante reutilizable, ej. Dress Code)
function showInfoModal(title, bodyHtml) {
    const modal = document.getElementById('infoModal');
    const titleEl = document.getElementById('infoModalTitle');
    const bodyEl = document.getElementById('infoModalBody');
    if (!modal || !titleEl || !bodyEl) return;
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    modal.style.display = 'flex';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.style.display = 'none';
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();
