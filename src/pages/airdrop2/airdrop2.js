import '../../components/get-token-popup/get-token-popup';
import '../../components/header-component/menu';
import './current-stats/current-stats';
import questionTemplate from '../../components/faq/question-template.html';
import questions from '../../assets/data/airdrop-faq';
import { addDataToTemplate } from '../../common/scripts/add-data-to-template';
import { loadData } from '../../common/scripts/load-and-render';

const faq = document.querySelector('.faq-questions');
if (!questions.length) {
    faq.classList.add('hidden');
}
faq.append(...questions.map((question) => {
    const template = addDataToTemplate(question, questionTemplate);
    const el = document.createElement('div');
    el.innerHTML = template;
    el.classList.add('question-block');
    el.addEventListener('click', () => el.classList.toggle('opened'));
    return el;
}));

const form = document.getElementById('check-form');
const input = form.querySelector('#address');

form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value;
    loadData(value);
    scrollToChecker();
});

const eligibilityBlock = document.getElementById('account-eligibility');
const container = document.getElementById('main-content');
function scrollToChecker() {
    const {top} = eligibilityBlock.getBoundingClientRect();
    const currentScroll = container.scrollTop;
    container.scrollTo({ top: currentScroll + top - 100, left: 0, behavior: 'smooth' });
}
