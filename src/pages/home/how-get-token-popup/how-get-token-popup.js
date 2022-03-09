import Popup from '../../../common/scripts/popup-class';

// show popup when page is load
let popupHowGetTokenElement = document.querySelector('section.how-get-token-popup');
let popupGetToken = new Popup(popupHowGetTokenElement);
document.addEventListener('DOMContentLoaded', ready);
function ready() {
    let defaultValues = {};
    popupGetToken.open(defaultValues);
}

// show get token popup
let popupMainElement = document.querySelector('section.get-token-popup');
let popup = new Popup(popupMainElement);
let openGetAqua = document.querySelector('.open-get-aqua-popup');

openGetAqua.addEventListener('click', () => {
    popupGetToken.close();
    let defaultValues = {};
    popup.open(defaultValues);
});
