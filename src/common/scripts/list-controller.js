const REWARD_URL = 'https://reward-api.aqua.network/api/rewards/';
const ASSETS_DATA_URL = 'https://assets.ultrastellar.com/api/v1/assets/';

const ASSETS_DATA = new Map([['XLM:', {
    code: 'XLM',
    issuer: undefined,
    name: 'Stellar Lumens',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjUgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOS43OTczIDUuNTQyNDlMMTcuMzk1NiA2Ljc2NjEyTDUuNzk4MTUgMTIuNjczM0M1Ljc1ODkzIDEyLjM3NDIgNS43MzkyIDEyLjA3MjggNS43MzkwOCAxMS43NzEyQzUuNzQyMyA5LjMyMjA5IDcuMDQxODYgNy4wNTc3NSA5LjE1NDg3IDUuODE5NTFDMTEuMjY3OSA0LjU4MTI3IDEzLjg3ODUgNC41NTQyMSAxNi4wMTY3IDUuNzQ4MzlMMTcuMzkxNCA1LjA0Nzk3TDE3LjU5NjUgNC45NDMzM0MxNS4wMjg4IDMuMDc5NjUgMTEuNjMyNyAyLjgxMzY5IDguODA2MTggNC4yNTQ5MUM1Ljk3OTY1IDUuNjk2MTMgNC4yMDAzNSA4LjYwMDk1IDQuMjAwNjggMTEuNzczN0M0LjIwMDY4IDExLjk4ODYgNC4yMDg4NCAxMi4yMDI3IDQuMjI1MTUgMTIuNDE1OUM0LjI3MTg4IDEzLjAzMzMgMy45NDMwOSAxMy42MTgzIDMuMzkxNCAxMy44OTk0TDIuNjY2NSAxNC4yNjkxVjE1Ljk5MzFMNC44MDA2OCAxNC45MDU0TDUuNDkxODIgMTQuNTUyNkw2LjE3MjgzIDE0LjIwNThMMTguMzk5IDcuOTc2MjRMMTkuNzcyOCA3LjI3NjY2TDIyLjYxMjUgNS44Mjk0MVY0LjEwNjJMMTkuNzk3MyA1LjU0MjQ5WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTIyLjYxMjUgNy41NTQ2OUw2Ljg2NzM1IDE1LjU3MTZMNS40OTM1MSAxNi4yNzI4TDIuNjY2NSAxNy43MTMzVjE5LjQzNTdMNS40NzQxIDE4LjAwNTNMNy44NzU3OSAxNi43ODE3TDE5LjQ4NTEgMTAuODY2MUMxOS41MjQzIDExLjE2NzIgMTkuNTQ0IDExLjQ3MDUgMTkuNTQ0MSAxMS43NzQxQzE5LjU0MjYgMTQuMjI2MSAxOC4yNDE2IDE2LjQ5MzYgMTYuMTI1NCAxNy43MzIzQzE0LjAwOTMgMTguOTcxIDExLjM5NTEgMTguOTk1MiA5LjI1NjM4IDE3Ljc5Nkw5LjE3MTk5IDE3Ljg0MDhMNy42ODE2OSAxOC42MDAzQzEwLjI0ODggMjAuNDY0IDEzLjY0NDIgMjAuNzMwNiAxNi40NzA3IDE5LjI5MDNDMTkuMjk3MyAxNy44NTAxIDIxLjA3NzMgMTQuOTQ2NCAyMS4wNzgzIDExLjc3NDFDMjEuMDc4MyAxMS41NTcyIDIxLjA2OTkgMTEuMzQwMyAyMS4wNTM4IDExLjEyNkMyMS4wMDcyIDEwLjUwODggMjEuMzM1NiA5LjkyMzk3IDIxLjg4NjggOS42NDI0NUwyMi42MTI1IDkuMjcyODNWNy41NTQ2OVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=',
    asset_string: 'XLM:native',
    home_domain: 'stellar.org',
}]]);

const number = new Intl.NumberFormat('en-En');
export const PAGE_SIZE = 50;

export class PairsListController {
    get maxPage() {
        return this.count ? Math.ceil(this.count / PAGE_SIZE) : 0;
    }

    get currentParams() {
        const params = new URLSearchParams(location.search);
        return {
            count: this.count,
            currentPage: params.get('page') || 1,
            ordering: params.get('ordering') || null,
        };
    }

    constructor() {
        this.count = 0;
        this.lastData = null;
        this._dataSubscribers = new Set();
        this._paramsSubscribers = new Set();
        window.addEventListener('popstate', () => this._makeRequest());
    }

    subscribeOnData(callback) {
        this._dataSubscribers.add(callback);
        callback(this.lastData);
        return () => this._dataSubscribers.delete(callback);
    }

    subscribeOnParams(callback) {
        this._paramsSubscribers.add(callback);
        callback(this.currentParams);
        return () => this._paramsSubscribers.delete(callback);
    }

    updateParams(params) {
        const newParams = new URLSearchParams(location.search);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        history.pushState({}, '', `?${newParams.toString()}`);
        this._runParamsCallbacks();
        window.dispatchEvent(new Event('popstate'));
    }

    async _makeRequest() {
        const params = new URLSearchParams(location.search);
        if (!params.has('page')) {
            params.append('page', 1);
        }
        params.append('page_size', PAGE_SIZE.toString());
        this._runDataCallbacks(null);
        try {
            this._runDataCallbacks(await this._getPairData(params.toString()));
            this._runParamsCallbacks();
        } catch (e) {
            this.count = 0;
            this._runDataCallbacks([]);
            this._runParamsCallbacks();
        }

    }

    async _getPairData(params) {
        const resp = await fetch(`${REWARD_URL}?${params}`);
        const data = await resp.json();
        this.count = data.count;
        const assetsToRequest = new Set();
        data.results.forEach((data) => {
            const asset1 = `${data.market_key.asset1_code}:${data.market_key.asset1_issuer}`;
            const asset2 = `${data.market_key.asset2_code}:${data.market_key.asset2_issuer}`;
            if (data.market_key.asset1_issuer && !ASSETS_DATA.has(asset1)) {
                assetsToRequest.add(`asset=${asset1}`);
            }
            if (data.market_key.asset2_issuer && !ASSETS_DATA.has(asset2)) {
                assetsToRequest.add(`asset=${asset2}`);
            }
        });
        if (assetsToRequest.size) {
            const requestParam = Array.from(assetsToRequest).join('&');
            const assetDataResp = await fetch(`${ASSETS_DATA_URL}?${requestParam}`);
            const assetData = await assetDataResp.json();
            assetData.results.forEach((asset) => ASSETS_DATA.set(`${asset.code}:${asset.issuer}`, Object.assign(asset, {
                name: asset.name || asset.code
            })));
        }
        return data.results.map((dataObject) => {
            const assetData1 = getAssetData(dataObject.market_key.asset1_code, dataObject.market_key.asset1_issuer);
            const assetData2 = getAssetData(dataObject.market_key.asset2_code, dataObject.market_key.asset2_issuer);
            return {
                base: assetData1,
                counter: assetData2,
                amm: {
                    reward: number.format(dataObject.daily_amm_reward),
                    link: `${geAMMtAssetPath(assetData1.code, assetData1.issuer)}/${geAMMtAssetPath(assetData2.code, assetData2.issuer)}`,
                },
                sdex: {
                    reward: number.format(dataObject.daily_sdex_reward),
                    link: `${geSDEXtAssetPath(assetData1.code, assetData1.issuer)}/${geSDEXtAssetPath(assetData2.code, assetData2.issuer)}`,
                },
                total: number.format(dataObject.daily_total_reward),
            };
        });
    }

    _runDataCallbacks(data) {
        if (data !== this.lastData) {
            this.lastData = data;
            for (const call of this._dataSubscribers.values()) {
                call(data);
            }
        }
    }

    _runParamsCallbacks() {
        const params = this.currentParams;
        for (const call of this._paramsSubscribers.values()) {
            call(params);
        }
    }
}

function geAMMtAssetPath(code, issuer) {
    return issuer ? `${code}:${issuer}` : 'native';
}

function geSDEXtAssetPath(code, issuer) {
    return `${code}-${issuer || 'native'}`;
}

function getAssetData(code, issuer) {
    const key = `${code}:${issuer}`;
    const data = ASSETS_DATA.get(key) || {};
    return {
        asset_string: key,
        code,
        home_domain: data.home_domain || 'unknown',
        image: data.image,
        issuer,
        name: data.name || code
    }
}
