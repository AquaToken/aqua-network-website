export function formatNumber(number, delimiter = ' ') {
    const [integer, remain = ''] = String(number).split('.');
    const formatted = String(integer).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${delimiter}`)
    return `${formatted}${remain ? '.' : ''}${remain}`;
}

export function roundNumber(number, digits = 0) {
    const multi = new Array(digits).fill(0);
    multi.unshift(1);
    const resultMulti = Number(multi.join(''));
    const input = Number(number) || 0;
    return Math.floor(input * resultMulti) / resultMulti
}
