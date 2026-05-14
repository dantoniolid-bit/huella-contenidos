const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.side-menu a');

function openMenu() {
    sideMenu.classList.add('open');
    menuToggle.classList.add('open');
    menuOverlay.classList.add('open');
}

function closeMenu() {
    sideMenu.classList.remove('open');
    menuToggle.classList.remove('open');
    menuOverlay.classList.remove('open');
}

menuToggle.addEventListener('click', () => {
    if (sideMenu.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

// close when clicking overlay
menuOverlay.addEventListener('click', closeMenu);

// close when clicking a link
menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

const menuClose = document.querySelector('.menu-close');
menuClose.addEventListener('click', closeMenu);

const contactBtns = document.querySelectorAll('.contact-btn');
const contactModal = document.querySelector('.contact-modal');
const contactOverlay = document.querySelector('.contact-overlay');
const contactClose = document.querySelector('.contact-close');

function openContact() {
    contactModal.classList.add('open');
}

function closeContact() {
    contactModal.classList.remove('open');
}

contactBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeMenu();      // close slide menu first
        openContact();    // then open modal
    });
});
contactOverlay.addEventListener('click', closeContact);
contactClose.addEventListener('click', closeContact);




// ===============================
// SCROLL GLIDE
// ===============================

const SCROLL_DURATION = 700;
const sections = document.querySelectorAll("section");

let currentSection = 0;
let isAnimating = false;
let scrollTimeout = null;

function smoothScrollTo(targetY, duration = SCROLL_DURATION) {

    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {

        if (!startTime) startTime = currentTime;

        let timeElapsed = currentTime - startTime;
        let progress = Math.min(timeElapsed / duration, 1);
        let ease = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * ease);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            isAnimating = false;
        }
    }

    requestAnimationFrame(animation);
}

function goToSection(index) {

    if (index < 0 || index >= sections.length) return;
    if (isAnimating) return;

    isAnimating = true;
    currentSection = index;

    const targetY = sections[index].offsetTop;

    smoothScrollTo(targetY, SCROLL_DURATION);
}

let lastScrollTime = 0;
const SCROLL_THRESHOLD = 50;   // ignore tiny movements
const SCROLL_COOLDOWN = 600;   // time between section jumps

window.addEventListener("wheel", function(e) {

    e.preventDefault();

    const now = Date.now();

    // ignore tiny trackpad noise
    if (Math.abs(e.deltaY) < SCROLL_THRESHOLD) return;

    // ignore rapid-fire events (momentum)
    if (now - lastScrollTime < SCROLL_COOLDOWN) return;

    // block while animating (your existing logic)
    if (isAnimating) return;

    lastScrollTime = now;

    if (e.deltaY > 0) {
        goToSection(currentSection + 1);
    } else {
        goToSection(currentSection - 1);
    }

}, { passive: false });

window.addEventListener("load", () => {

    let scrollPosition = window.scrollY;

    sections.forEach((section, index) => {
        if (scrollPosition >= section.offsetTop - 10) {
            currentSection = index;
        }
    });

});

// ===============================
// SCROLL GLIDE FOR LINKS
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        const index = Array.from(sections).indexOf(target);

        goToSection(index);

    });

});
// ===============================
// MOBILE FIXED SECTION SWIPE
// ===============================

let touchStartY = 0;
let touchEndY = 0;
let isTouchMoving = false;

const SWIPE_THRESHOLD = 60;

window.addEventListener("touchstart", (e) => {

    if (isAnimating) return;

    touchStartY = e.touches[0].clientY;
    isTouchMoving = true;

}, { passive: true });

window.addEventListener("touchmove", (e) => {

    if (!isTouchMoving) return;

    // HARD BLOCK native mobile scrolling
    e.preventDefault();

}, { passive: false });

window.addEventListener("touchend", (e) => {

    if (!isTouchMoving) return;
    if (isAnimating) return;

    touchEndY = e.changedTouches[0].clientY;

    const diff = touchStartY - touchEndY;

    isTouchMoving = false;

    // ignore tiny accidental movements
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    // ONE section only
    if (diff > 0) {
        goToSection(currentSection + 1);
    } else {
        goToSection(currentSection - 1);
    }

}, { passive: true });


// HARD BLOCK native arrow scrolling
window.addEventListener("keydown", (e) => {

    // allow typing inside form fields
    const tag = document.activeElement.tagName;

    const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA";

    if (isTyping) return;

    if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === " "
    ) {
        e.preventDefault();
    }

}, { passive: false });


// ===============================
// SCROLL GLIDE KEYBOARD (FINAL)
// ===============================

let lastKeyTime = 0;
const KEY_COOLDOWN = 500;

window.addEventListener("keydown", (e) => {

    const now = Date.now();

    if (now - lastKeyTime < KEY_COOLDOWN) return;
    if (isAnimating) return;

    if (sideMenu.classList.contains("open")) return;

    const tag = document.activeElement.tagName;

    const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA";

    if (isTyping) return;

    if (e.key === "ArrowDown" || e.key === " ") {
        lastKeyTime = now;
        goToSection(currentSection + 1);
    }

    if (e.key === "ArrowUp") {
        lastKeyTime = now;
        goToSection(currentSection - 1);
    }

});






// ===============================
// PROYECTOS CAROUSEL (SINGLE CARD)
// ===============================

const track = document.querySelector(".carousel-track");
const cards = document.querySelectorAll(".proyecto-card");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

let currentSlide = 0;
const totalSlides = cards.length;
updateCarousel();

function updateCarousel() {

    cards.forEach((card, index) => {

        if (index === currentSlide) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }

    });

}

// next
nextBtn.addEventListener("click", () => {

    currentSlide++;

    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }

    updateCarousel();

});

// prev
prevBtn.addEventListener("click", () => {

    currentSlide--;

    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }

    updateCarousel();

});





// ===============================
// PDF MODAL (MULTI CATEGORY)
// ===============================

// buttons
const pdfButtons = document.querySelectorAll(".pdf-icon");

// modal elements
const pdfModal = document.querySelector(".pdf-modal");
const pdfOverlay = document.querySelector(".pdf-overlay");
const pdfClose = document.querySelector(".pdf-close");
const pdfList = document.querySelector(".pdf-list");
const pdfTitle = document.querySelector(".pdf-title");

// 👇 DEFINE YOUR FILES HERE
const pdfData = {
    autor: {
        title: "Derecho de autor",
        files: [
            { name: "Autoedición oportunidades y desafíos.", url: "pdfs/Derecho de autor/01 Autoedición oportunidades y desafíos.pdf" },
            { name: "Derecho de autor e inteligencia artificial.", url: "pdfs/Derecho de autor/01 Derecho de autor e inteligencia artificial.pdf" },
            { name: "El derecho de autor de los creadores digitales de contenidos.", url: "pdfs/Derecho de autor/01 El derecho de autor de los creadores digitales de contenidos.pdf" },
            { name: "El plagio. Uso indebido de los contenidos de otros.", url: "pdfs/Derecho de autor/01 El plagio. Uso indebido de los contenidos de otros.pdf" },
            { name: "El respeto de la propiedad intelectual. De qué estamos hablando.", url: "pdfs/Derecho de autor/01 El respeto de la propiedad intelectual. De qué estamos hablando.pdf" },
            { name: "La delgada línea entre similitud y plagio.", url: "pdfs/Derecho de autor/01 La delgada línea entre similitud y plagio.pdf" },
            { name: "Plagio, malas prácticas y conciencia pública.", url: "pdfs/Derecho de autor/01 Plagio, malas prácticas y conciencia pública.pdf" },
            { name: "Revistas depredadoras. Otro tentáculo de las malas prácticas.", url: "pdfs/Derecho de autor/01 Revistas depredadoras. Otro tentáculo de las malas prácticas.pdf" },
        ]
    },
    carbono: {
        title: "Huella de carbono",
        files: [
            { name: "Cómo se mide la huella de carbono de un libro.", url: "pdfs/Huella de Carbono/02 Cómo se mide la huella de carbono de un libro.pdf" },
            { name: "Infografía: Libros y planeta. Cuál es la verdadera huella de carbono.", url: "pdfs/Huella de Carbono/02 Infografia Libros y planeta. Cual es la verdadera huella de carbono.pdf" },
            { name: "La huella de carbono de las compras públicas de libros del MinCul.", url: "pdfs/Huella de Carbono/02 La huella de carbono de las compras públicas de libros del MinCul.pdf" },
            { name: "La huella de carbono editorial. Un tema urgente.", url: "pdfs/Huella de Carbono/02 La huella de carbono editorial. Un tema urgente.pdf" },
        ]
    },
    tecnologia: {
        title: "Tecnología editorial",
        files: [
            { name: "Contratos inteligentes y cesión de derechos de autor.", url: "pdfs/Tecnologia editorial/03 Contratos inteligentes y cesión de derechos de autor.pdf" },
            { name: "El futuro de los tokens no fungibles.", url: "pdfs/Tecnologia editorial/03 El futuro de los tokens no fungibles.pdf" },
            { name: "Inteligencia artificial. ¿Y el derecho de autor?", url: "pdfs/Tecnologia editorial/03 Inteligencia artificial. Y el derecho de autor.pdf" },
            { name: "La responsabilidad editorial en la era de la desinformación.", url: "pdfs/Tecnologia editorial/03 La responsabilidad editorial en la era de la desinformación.pdf" },
            { name: "Tokens no fungibles. Qué son y cuál es su impacto en los derechos de autor.", url: "pdfs/Tecnologia editorial/03 Tokens no fungibles. Qué son y cuál es su impacto en los derechos de autor.pdf" },
        ]
    }
};

// open modal
function openPDFModal(category) {

    const data = pdfData[category];
    if (!data) return;

    // set title
    pdfTitle.textContent = data.title;

    // clear previous
    pdfList.innerHTML = "";

    // add files
    data.files.forEach(file => {
        const link = document.createElement("a");
        link.href = file.url;
        link.textContent = file.name;
        link.target = "_blank";
        pdfList.appendChild(link);
    });

    pdfModal.classList.add("open");
}

// close modal
function closePDFModal() {
    pdfModal.classList.remove("open");
}

// events
pdfButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const category = btn.dataset.category;
        openPDFModal(category);
    });
});

pdfOverlay.addEventListener("click", closePDFModal);
pdfClose.addEventListener("click", closePDFModal);




// ===============================
// CONTACT FORM AJAX SUBMIT
// ===============================

const contactForm = document.getElementById("contact-form");
const formResult = document.getElementById("form-result");

contactForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    formResult.textContent = "Enviando mensaje...";

    const formData = new FormData(contactForm);

    try {

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {

            formResult.textContent = "Mensaje enviado correctamente.";

            contactForm.reset();

            // optional auto-close after 2 sec
            setTimeout(() => {
                formResult.textContent = "";
                closeContact();
            }, 2000);

        } else {

            formResult.textContent = "Hubo un problema. Intente nuevamente.";

        }

    } catch (error) {

        formResult.textContent = "Error de conexión.";

    }

});