import snakeCase from 'snakecase-keys';

const utils = {
    deserializer(json) {
        return snakeCase(json);
    },
};

export default utils;
