const LAST_COMPLETED_INDEX = 4;

let position = 0;
let activeSlide = 2;

const next = document.getElementById('next');
const previous = document.getElementById('previous');

next.addEventListener('click', nextSlide);
previous.addEventListener('click', previousSlide);

const slider = document.getElementById('slider');
const pillar = document.getElementById('pillar');
const filler = document.getElementById('filler');

const slides = document.getElementsByClassName('slide');

const isMobile = window.innerWidth < 800;

const slidesCount = slides.length;

const slideWidth = slides[activeSlide].getBoundingClientRect().width;

const pillarWidth = slidesCount * slideWidth + 200 + ((slidesCount - 1) * 60);

const fillerWidth = 100 + ((LAST_COMPLETED_INDEX - 1) * (slideWidth + 60));

pillar.style.width = `${pillarWidth}px`;
filler.style.width = `${fillerWidth}px`;

function nextSlide() {
    if ((isMobile ? slidesCount + 1 : slidesCount - 1) === activeSlide) {
        return;
    }
    activeSlide++;
    position -= slideWidth + 60;
    filler.setAttribute('style', `transform: translateX(${position}px); width: ${fillerWidth}px;`);
    pillar.setAttribute('style', `transform: translateX(${position}px); width: ${pillarWidth}px;`);
    slider.setAttribute('style', `transform: translateX(${position}px)`);
}

function previousSlide() {
    if ((isMobile ? activeSlide - 1 : activeSlide) === 1) {
        return;
    }
    activeSlide--;
    position += slideWidth + 60;
    filler.setAttribute('style', `transform: translateX(${position}px); width: ${fillerWidth}px;`);
    pillar.setAttribute('style', `transform: translateX(${position}px); width: ${pillarWidth}px;`);
    slider.setAttribute('style', `transform: translateX(${position}px)`);
}
