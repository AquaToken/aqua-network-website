'use strict';

//Simple phone inputs mask
let phoneInput = document.querySelectorAll('.phone-input');
const allowedKeys = [8, 35, 36, 37, 38, 39, 40, 46];

Array.prototype.forEach.call(phoneInput, (input) => {
    input.onkeydown = function(event) {
        let digit = parseInt(event.key),
            currentValue = input.value,
            valueLength = currentValue.length,
            allowPlusSign = event.key === '+' && !valueLength,
            allowSpace =  event.key === ' ' && valueLength && currentValue[valueLength - 1] !== ' ',
            allowedKey = !!~allowedKeys.indexOf(event.keyCode);

        if (isNaN(digit) && !allowPlusSign && !allowSpace && !allowedKey) {
            return false;
        }
    };
});
