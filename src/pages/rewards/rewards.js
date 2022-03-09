import '../../components/get-token-popup/get-token-popup';
import '../../components/header-component/menu';
import '../../components/spinner/spinner';
import './divided-reward/divided-reward';
import pairRowTemplate from './pairs-table/pair-row.html';
import questionTemplate from '../../components/faq/question-template.html';
import questions from '../../assets/data/faq';
import { addDataToTemplate } from '../../common/scripts/add-data-to-template';
import { PairsListController, PAGE_SIZE } from '../../common/scripts/list-controller';

const table = document.querySelector('#table');
const spinner = document.querySelector('#loading');
const error = document.querySelector('#error');

const footer = document.querySelector('#table-footer');
const rangeElement = footer.querySelector('#range');
const countElement = footer.querySelector('#count');
const pagesElement = footer.querySelector('#pages');

const List = new PairsListController();
// Subscribe on data changes. Data will be loaded on url params changes.
// After successful response rows containing par data will be rendered
List.subscribeOnData((data) => {
    table.querySelectorAll('.cell').forEach((el) => el.remove());
    error.classList.add('hidden');
    spinner.classList.add('hidden');
    if (!data) {
        spinner.classList.remove('hidden');
    } else if (!data.length) {
        error.classList.remove('hidden');
    } else {
        const el = document.createElement('div');
        el.innerHTML = data.map((dataObj) => addDataToTemplate(dataObj, pairRowTemplate)).join('');
        table.append(...el.children);
    }
});
// Subscribe on sorting change. Highlight current sorting column
List.subscribeOnParams((params) => {
    const currentOrderingElements = table.querySelector('.asc, .desc');
    if (currentOrderingElements) {
        currentOrderingElements.classList.remove('asc');
        currentOrderingElements.classList.remove('desc');
    }
    if (!params.ordering) {
        return;
    }
    const direction = params.ordering[0] === '-' ? 'desc' : 'asc';
    const field = direction === 'asc' ? params.ordering : params.ordering.slice(1);
    const element = table.querySelector(`[data-sort=${field}]`);
    if (!element) {
        return;
    }
    element.classList.add(direction);
});
// Subscribe on pagination params. Render pages count, highlight current page
List.subscribeOnParams(({count, currentPage}) => {
    if (count < PAGE_SIZE) {
        footer.classList.add('hidden');
        return;
    }
    footer.classList.remove('hidden');
    countElement.innerText = count;
    rangeElement.innerText = `${PAGE_SIZE * currentPage - (PAGE_SIZE - 1)}-${Math.min(count, PAGE_SIZE * currentPage)}`;
    const pages = Array.from({length: Math.ceil(count / PAGE_SIZE)}, (e, i) => {
        const element = document.createElement('div');
        element.innerText = i + 1;
        if (Number(currentPage) === i + 1) {
            element.classList.add('active');
        }
        return element;
    });
    pagesElement.innerHTML = '';
    pagesElement.append(...pages);
});

// Trigger initial url params change
const params = new URLSearchParams(location.search);
if (!params.has('ordering')) {
    List.updateParams({ordering: '-daily_total_reward'});
} else {
    window.dispatchEvent(new Event('popstate'));
}

// On sorting column click
table.querySelectorAll('[data-sort]').forEach((el) => {
    el.addEventListener('click', () => {
        let orderValue = el.dataset.sort;
        if (el.classList.contains('asc')) {
            orderValue = `-${orderValue}`;
        }
        List.updateParams({page: null, ordering: orderValue});
    });
});

// on Page counter click
pagesElement.addEventListener('click', (e) => {
    const page = Number(e.target.innerText);
    if (!page) {
        return;
    }
    List.updateParams({page});
});

// click on pagination arrows (< or >)
footer.querySelectorAll('[data-page-change]').forEach((el) => {
    el.addEventListener('click', () => {
        const mod = Number(el.dataset.pageChange);
        const {currentPage} = List.currentParams;
        const nextPage = Number(currentPage) + mod;
        if (nextPage < 1 || nextPage > List.maxPage) {
            return;
        }
        List.updateParams({page: nextPage});
    });
});

// Render faq questions
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
