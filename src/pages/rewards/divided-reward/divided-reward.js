import {formatNumber} from '../../../common/scripts/format-number';

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;

fetch('https://reward-api.aqua.network/api/rewards/total/')
    .then(response => (response.status === 200 ? response.json() : Promise.reject()))
    .catch(() => ({
        total_daily_sdex_reward: '-',
        total_daily_amm_reward: '-'
    }))
    .then((data) => {
        Object.entries(data).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.innerText = isNaN(value) ? value : formatNumber(value, ',') + ' AQUA';
                element.closest('.card').classList.remove('loading');
            }
        });

        const overall = data.total_daily_amm_reward + data.total_daily_sdex_reward;
        document.getElementById('overall-ammount').innerText = formatNumber(overall, ',') + ' AQUA';

        let lastUpdatedDiff = new Date() - new Date(data.last_updated);
        if (!lastUpdatedDiff || lastUpdatedDiff < 0) {
            lastUpdatedDiff = 0;
        }
        let duration = '';
        const hoursDiff = Math.floor(lastUpdatedDiff / HOUR);
        if (hoursDiff > 23) {
            const days = Math.floor(hoursDiff / 24);
            const hours = hoursDiff % 24;
            const hoursString = hours ? ` ${hours} hour${hours > 1 ? 's' : ''}` : '';
            duration = `${days} day${days > 1 ? 's' : ''}${hoursString}`;
        } else if (!hoursDiff) {
            const minutesDiff = Math.floor(lastUpdatedDiff / MINUTE);
            duration = `${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
        } else {
            duration = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
        }
        document.getElementById('last-updated').innerText = `Last updated ${duration} ago`;
    });
