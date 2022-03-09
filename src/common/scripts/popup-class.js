'use strict';

class Popup {
    constructor(mainElement) {
        this._mainElement = mainElement;
        this._inputs = mainElement.querySelectorAll('input');
        this._closeBtns = mainElement.querySelectorAll('.close-btn');
        this._confirmBtn = mainElement.querySelector('.confirm-btn');
        this._popupElement = mainElement.querySelector('.popup-element');
        this._popupForm = mainElement.querySelector('.popup-form');

        this.opened = false;

        this._addEvents();
    }

    open(defaultValues) {
        if (!defaultValues || typeof defaultValues !== 'object') {
            defaultValues = {};
        }
        if (this._popupForm) {
            this._popupForm.reset();
        }

        Array.prototype.forEach.call(this._inputs, (input) => {
            let value = defaultValues[input.name];
            if (value) {
                input.value = value;
            }
        });

        this._mainElement.classList.remove('closed');
        this._mainElement.classList.add('opened');
        this.opened = true;
    }

    close() {
        if (this._freezed) { return; }
        this._mainElement.classList.add('closed');
        let animation = this._mainElement.animate([{opacity: 1}, {opacity: 0}], {duration: 250});
        animation.onfinish = () => {
            this._mainElement.classList.remove('opened');
            this._mainElement.classList.remove('closed');
        };
        this.opened = false;
    }

    _addEvents() {
        Array.prototype.forEach.call(this._closeBtns, (button) => {
            button.addEventListener('click', () => this.close(), false);
        });
        this._mainElement.onclick = () => this.close();
        this._popupElement.onclick = (event) => event.stopImmediatePropagation();
        document.addEventListener('keydown', (event) => {
            if (this.opened && event.keyCode === 27) {
                this.close();
            }
        }, false);
    }

    setFreezed(freezed) {
        this._freezed = !!freezed;
    }

}

export default Popup;
