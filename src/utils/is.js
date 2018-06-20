const getConstructor = input => (input !== null && typeof input !== 'undefined' ? input.constructor : null);

const instanceOf = (input, constructor) => Boolean(input && constructor && input instanceof constructor);

const is = {
    array(input) {
        return !this.nullOrUndefined(input) && Array.isArray(input);
    },
    object(input) {
        return getConstructor(input) === Object;
    },
    number(input) {
        return getConstructor(input) === Number && !Number.isNaN(input);
    },
    string(input) {
        return getConstructor(input) === String;
    },
    boolean(input) {
        return getConstructor(input) === Boolean;
    },
    function(input) {
        return getConstructor(input) === Function;
    },
    nullOrUndefined(input) {
        return input === null || typeof input === 'undefined';
    },
    objectId(input) {
        return this.string(input) && /^[a-f\d]{24}$/i.test(input);
    },
    currencyCode(input) {
        return this.string(input) && /^[A-z]{3}$/.test(input);
    },
    url(input) {
        // Accept a URL object
        if (instanceOf(input, window.URL)) {
            return true;
        }

        // Add the protocol if required
        let string = input;
        if (!input.startsWith('http://') || !input.startsWith('https://')) {
            string = `http://${input}`;
        }

        try {
            const url = new URL(string);
            return !this.empty(url.hostname);
        } catch (e) {
            return false;
        }
    },
    empty(input) {
        return (
            this.nullOrUndefined(input) || ((this.string(input) || this.array(input)) && !input.length) || (this.object(input) && !Object.keys(input).length)
        );
    },
};

export default is;
