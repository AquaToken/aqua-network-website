'use strict';

import Popup from '../../common/scripts/popup-class';

//Book a Demo popup
let popupMainElement = document.querySelector('section.get-token-popup');
let popup = new Popup(popupMainElement);

let popupBtns = document.querySelectorAll('.get-token-popup-button');
Array.prototype.forEach.call(popupBtns, (button) => {
    button.addEventListener('click', () => {
        //Collect default values if inputs provided
        let defaultValues = {};
        let inputsNames = button.dataset.inputs || '',
            splittedNames = inputsNames.split(', ').filter((name) => !!name);

        splittedNames.forEach((name) => {
            let input = document.querySelector(`input[name=${name}]`);
            if (!input || !input.value) { return; }

            let fieldName = input.dataset.field;
            if (fieldName) {
                defaultValues[fieldName] = input.value;
                input.value = '';
            }
        });
        popup.open(defaultValues);
    }, false);
});

const assetBlock = popupMainElement.querySelector('.asset-block');
assetBlock.addEventListener('click', copy);

function copy() {
    let textarea;

    try {
        textarea = document.createElement('textarea');
        textarea.setAttribute('readonly', 'true');
        textarea.setAttribute('contenteditable', 'true');
        textarea.style.position = 'fixed';
        textarea.value = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const range = document.createRange();
        range.selectNodeContents(textarea);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        textarea.setSelectionRange(0, textarea.value.length);
        document.execCommand('copy');
        assetBlock.classList.add('copied');
    } catch (err) {
        console.error(err);
    } finally {
        document.body.removeChild(textarea);
    }
    setTimeout(() => assetBlock.classList.remove('copied'), 2000);
}
