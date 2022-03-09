const createRegExp = key => new RegExp(`{{\\s+${key}\\s+}}`, 'g');

export const addDataToTemplate = (data, template, base = '') => {
    return Object.entries(data).reduce((result, [key, value]) => {
        const computedKey = base ? `${base}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            return addDataToTemplate(value, result, computedKey);
        } else {
            const PROP_REG = createRegExp(computedKey);
            return result.replaceAll(PROP_REG, value);
        }
    }, template);
};
