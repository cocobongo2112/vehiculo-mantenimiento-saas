// 🔹 MOSTRAR / OCULTAR
function toggleInfo() {
    const info = document.getElementById('info');
    if (!info) return;

    info.classList.toggle('hidden');
}

// 🔥 CARRUSEL PRO
let slideIndex = 0;
const totalSlides = 6;

function updateCarrusel() {
    const carrusel = document.getElementById('carruselPro');
    if (!carrusel) return;

    carrusel.style.transform = `translateX(-${slideIndex * 100}%)`;

    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('bg-white', i === slideIndex);
        dot.classList.toggle('bg-white/50', i !== slideIndex);
    });
}

function nextSlide() {
    slideIndex = (slideIndex + 1) % totalSlides;
    updateCarrusel();
}

function prevSlide() {
    slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
    updateCarrusel();
}

// AUTO PLAY
setInterval(nextSlide, 4000);

// 🔹 SCROLL
window.addEventListener('scroll', () => {
    document.querySelectorAll('.animar-scroll').forEach(el => {
        const pos = el.getBoundingClientRect().top;
        const screen = window.innerHeight;

        if (pos < screen - 100) {
            el.classList.add('opacity-100', 'translate-y-0');
            el.classList.remove('opacity-0', 'translate-y-10');
        }
    });
});

// ANIMACIONES SCROLL
const elementos = document.querySelectorAll('.animar-scroll');

const mostrarScroll = () => {
    elementos.forEach(el => {
        const posicion = el.getBoundingClientRect().top;
        const pantalla = window.innerHeight;

        if (posicion < pantalla - 100) {
            el.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', mostrarScroll);
window.addEventListener('load', mostrarScroll);

// MOSTRAR / OCULTAR
function toggleElemento(id) {
    const el = document.getElementById(id);
    el.classList.toggle('activo');
}

function flipCard(card) {
  card.classList.add('is-flipped');
}

function unflipCard(card) {
  card.classList.remove('is-flipped');
}

function toggleInfo() {
    const info = document.getElementById('info');
    if (!info) return;

    info.classList.toggle('open');
}

function toggleAboutExtra() {
    const extra = document.getElementById('aboutExtra');
    if (!extra) return;

    extra.classList.toggle('open');
}