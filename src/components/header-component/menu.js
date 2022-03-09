const header = document.querySelector('header');
header.querySelector('.menu-toggle').addEventListener('click', toggleMenu, false);

Array.from(header.querySelectorAll('a')).forEach((link) => {
    link.addEventListener('click', toggleMenu, false);
});

function toggleMenu() {
    const isOpened = header.classList.contains('menu-opened');
    if (isOpened) {
        header.querySelector('.menu')
            .animate([{opacity: 1}, {opacity: 0}], {duration: 200})
            .onfinish = () => header.classList.remove('menu-opened');
    } else {
        header.classList.add('menu-opened');
    }
}
