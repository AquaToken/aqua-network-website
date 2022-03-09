import createStellarIdenticon from 'stellar-identicon-js';
import { truncateKey } from './truncate-key';
import { addDataToTemplate } from './add-data-to-template';

import eligebleStatus from '../../pages/airdrop2/account-eligibility/eligible-status.html';
import rewardStatus from '../../pages/airdrop2/account-eligibility/reward-status/reward-status.html';
import snapshotHoldings from '../../pages/airdrop2/account-eligibility/snapshot-holdings/snapshot-holdings.html';
import notEligebleStatus from '../../pages/airdrop2/account-eligibility/not-eligible-status.html';
import accountEligibility from '../../pages/airdrop2/account-eligibility/eligibility-status.html';
import { formatNumber, roundNumber } from './format-number';

const INVALID_ADDRESS_ERROR = 'Please enter a valid Stellar account address';
const NOT_ELIGEBLE_ERROR = ` `;
const ACCOUNT_ERROR_ICON =
    `data:image/svg+xml,%3Csvg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11Z' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20ZM11 22C17.0751 22 22 17.0751 22 11C22 4.92487 17.0751 0 11 0C4.92487 0 0 4.92487 0 11C0 17.0751 4.92487 22 11 22Z' fill='%23FF3461'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 12V6H12V12H10Z' fill='%23FF3461'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 16V13H12V16H10Z' fill='%23FF3461'/%3E%3C/svg%3E%0A`;

const URL = 'https://horizon.stellar.org/accounts/';
const DROP_BASE_URL = 'https://airdrop2-checker-api.aqua.network/api/snapshot/';

const form = document.getElementById('check-form');
const btnSubmit = form.querySelector('#button-submit');
const accountEligibilityContainer = document.querySelector('section.account-eligibility');
const statusData = accountEligibilityContainer.querySelector('#status-result');

let loadedAddress = '';

export function loadData(account) {
    if (!account || loadedAddress === account) {
        return;
    }
    loadedAddress = account;
    btnSubmit.setAttribute('disabled', 'disabled');
    accountEligibilityContainer.classList.remove('hidden');
    accountEligibilityContainer.classList.add('loading-in-process');

    let publicKey = account;
    let federation = account;
    validateAddress(account)
        .then(address => {
            publicKey = address;
            return fetch(`${URL}${address}/`);
        })
        // make request if valid
        .then(response => (response.status === 200 ? response.json() : {errorText: NOT_ELIGEBLE_ERROR}))
        .then((accountData) => resolveFederation(accountData, publicKey, federation).then((federationAdderss) => {
            federation = federationAdderss;
            return publicKey;
        }))
        .then((publicKey) => checkEligibility(publicKey))
        // set error text if invalid
        .catch(() => ({errorText: INVALID_ADDRESS_ERROR}))
        .then(data => renderData(data, publicKey, federation))
        .finally(() => {
            btnSubmit.removeAttribute('disabled');
            accountEligibilityContainer.classList.remove('loading-in-process');
        });
}

function validateAddress(address) {
    if (address.includes('*')) {
        return StellarSdk.FederationServer.resolve(address).then(({account_id}) => account_id);
    } else {
        return address[0] === 'G' && address.length === 56 ? Promise.resolve(address) : Promise.reject();
    }
}

function resolveFederation(account, publicKey, federation) {
    if (publicKey !== federation) {
        return Promise.resolve(federation);
    }
    if (!account.home_domain) {
        return Promise.resolve(null);
    }
    return StellarSdk.FederationServer.createForDomain(account.home_domain)
        .then(federationServer => federationServer.resolveAccountId(publicKey))
        .then(({stellar_address}) => stellar_address)
        .catch(() => null)
}

function checkEligibility(publicKey) {
    return fetch(`${DROP_BASE_URL}${publicKey}/`)
        .then(response => (response.status === 200 ? response.json() : {errorText: NOT_ELIGEBLE_ERROR}))
        .then(({
                   airdrop_boost,
                   raw_airdrop_reward,
                   airdrop_reward,
                   aqua_lock_balance,
                   native_balance,
                   native_pool_balance,
                   yxlm_balance,
                   yxlm_pool_balance,
                   aqua_pool_balance,
                   aqua_balance
        }) => {
            if (!raw_airdrop_reward) {
                return {errorText: NOT_ELIGEBLE_ERROR};
            }
            const boostAmount = Number(airdrop_boost) * 100;
            const boostRounded = Number(boostAmount.toFixed(2));
            const baseDrop = Number(raw_airdrop_reward) || 0;
            const baseDropRounded = Math.floor(baseDrop);
            const finalDrop = Number(airdrop_reward) || 0;
            const finalDropRounded = Math.floor(finalDrop);

            const reward = finalDrop || baseDrop;
            const by_year = Math.floor(reward / 3);
            const by_month = roundNumber(reward / 3 / 12, 2);

            const aquaBalance = roundNumber(aqua_balance, 2);
            const aquaPoolBalance = roundNumber(aqua_pool_balance, 2);
            const xlmBalance = roundNumber(native_balance, 2);
            const xlmPoolBalance = roundNumber(native_pool_balance, 2);
            const yxlmBalance = roundNumber(yxlm_balance, 2);
            const yxlmPoolBalance = roundNumber(yxlm_pool_balance, 2);
            const aquaLockBalance = roundNumber(aqua_lock_balance, 2);
            return {
                boost: boostRounded,
                base: formatNumber(baseDropRounded, ','),
                result: formatNumber(finalDropRounded, ','),
                without_boost: !boostRounded ? 'without-boost' : '',
                aqua_balance: formatNumber(aquaBalance, ','),
                aqua_pool_balance: formatNumber(aquaPoolBalance, ','),
                amm_aqua_class: aquaPoolBalance ? '' : 'hidden',
                xlm_balance: formatNumber(xlmBalance, ','),
                xlm_pool_balance: formatNumber(xlmPoolBalance, ','),
                amm_xlm_class: xlmPoolBalance ? '' : 'hidden',
                yxlm_balance: formatNumber(yxlmBalance, ','),
                yxlm_pool_balance: formatNumber(yxlmPoolBalance, ','),
                amm_yxlm_class: yxlmPoolBalance ? '' : 'hidden',
                aqua_lock_balance: formatNumber(aquaLockBalance, ','),
                by_month: formatNumber(by_month, ','),
                by_year: formatNumber(by_year, ',')
            };
        })
}


function renderData(data, account, federation) {
    const isInvalidAccount = data.errorText === INVALID_ADDRESS_ERROR;

    // render account-eligibility block
    const DATA_ACCOUNT_ELIGIBILITY = Object.assign({
        federation,
        key: account,
        shortKey: truncateKey(account),
        identIcon: isInvalidAccount ? ACCOUNT_ERROR_ICON : createStellarIdenticon(account).toDataURL(),
        status: !data.errorText
            ? eligebleStatus
            : addDataToTemplate(
                  { errorText: data.errorText, statusClass: isInvalidAccount ? 'hidden' : '' },
                  notEligebleStatus
              ),
        containerClass: `${isInvalidAccount ? 'error' : ''} ${!federation ? 'without-federation' : ''}`
    }, data);
    const accountInfoTemplate = addDataToTemplate(DATA_ACCOUNT_ELIGIBILITY, accountEligibility);
    const rewardsTemplate = data.errorText ? '' : addDataToTemplate(DATA_ACCOUNT_ELIGIBILITY, rewardStatus);
    const holdingsTemplate = data.errorText ? '' : addDataToTemplate(DATA_ACCOUNT_ELIGIBILITY, snapshotHoldings);
    statusData.innerHTML = `${accountInfoTemplate}${holdingsTemplate}${rewardsTemplate}`;
}
