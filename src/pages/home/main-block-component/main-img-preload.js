'use strict';

//Main block image preload
let preload = document.createElement('IMG');
let imgName = window.devicePixelRatio > 1 ? 'group-8@2x.png' : 'group-8@2x.png';
preload.src = `/static/assets/img/${imgName}`;

preload.onload = () => {
    let mainContainer = document.querySelector('.main-block__info'),
        preloadImg = document.querySelector('.temp-img');

    mainContainer.style.cssText = `background-image: url("/static/assets/img/${imgName}")`;
    preloadImg.classList.add('hidden');
};
