import template from './spinner.html';
import gradient from './gradient.html';

const div = document.createElement('div');
div.innerHTML = gradient;
const svg = div.querySelector('svg');

document.body.append(svg);
document.querySelectorAll('.spinner').forEach((el) => {
    el.innerHTML = template;
});
