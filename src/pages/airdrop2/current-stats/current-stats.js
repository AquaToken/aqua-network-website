import template from './current-stats.template.html';
import { addDataToTemplate } from '../../../common/scripts/add-data-to-template';
import { formatNumber } from '../../../common/scripts/format-number';

const container = document.getElementById('current-stats-data');

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
});

const AQUA_LIMIT = 10000000;

fetch('https://airdrop2-checker-api.aqua.network/api/snapshot/stats/')
    .then(response => (response.status === 200 ? response.json() : Promise.reject()))
    .then(({accounts, total_xlm, share_price}) => {
        const total = Number(total_xlm).toFixed();
        const perXlm = Number(share_price);
        const per500Xlm = Number((perXlm * 500).toFixed(4));
        const xlmLimit = Number((AQUA_LIMIT / perXlm).toFixed(0));
        container.innerHTML = addDataToTemplate({
            date: DATE_FORMAT.format(new Date()),
            accounts: formatNumber(accounts, ','),
            amount: formatNumber(total, ','),
            aqua_per_xlm: formatNumber(perXlm.toFixed(5), ','),
            aqua_per_500xlm: formatNumber(per500Xlm, ','),
            limit: formatNumber(xlmLimit, ',')
        }, template);
    });
