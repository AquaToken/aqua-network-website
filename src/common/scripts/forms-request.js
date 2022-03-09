'use strict';

import bookADemoPopup from '../../pages/home/book-a-demo-popup/book-a-demo-popup';

//Send form
let forms = document.querySelectorAll('.radaro-form');
let sendingInProcess = false;

Array.prototype.forEach.call(forms, (form) => {
    form.onsubmit = (event) => {
        event.preventDefault();
        if (sendingInProcess) { return; }

        sendingInProcess = true;
        setInputsReadonly(true);
        form.classList.add('in-progress');
        bookADemoPopup.setFreezed(true);

        let data = getDataFromElements(form.elements);
        let url = `${location.protocol}//${location.host}/api/book-demo/`;

        fetch(url, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: new Headers({'content-type': 'application/json'}),
            mode: 'cors'
        }).then((data) => {
            bookADemoPopup.setFreezed(false);
            if (!data.ok) { return; }

            if (bookADemoPopup.opened) {
                bookADemoPopup.close();
            }
            form.reset();
        }).finally(() => {
            setInputsReadonly(false);
            sendingInProcess = false;
            form.classList.remove('in-progress');
        });
    };
});

function getDataFromElements(elements) {
    let data = {};
    if (!elements || !elements.length) { return data; }

    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (!element || !element.dataset || !element.dataset.field) { continue; }

        data[element.dataset.field] = element.value;
    }

    return data;
}

function setInputsReadonly(readonly) {
    let methodName = readonly ? 'setAttribute' : 'removeAttribute';
    let inputs = document.querySelectorAll('input');
    let textareas = document.querySelectorAll('textarea');
    for (let input of inputs) {
        input[methodName]('readonly', '');
    }
    for (let textarea of textareas) {
        textarea[methodName]('readonly', '');
    }
}
