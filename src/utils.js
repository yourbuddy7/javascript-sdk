const utils = {
    is: {
        array(input) {
            return !this.nullOrUndefined(input) && Array.isArray(input);
        },
        object(input) {
            return this.getConstructor(input) === Object;
        },
        number(input) {
            return this.getConstructor(input) === Number && !Number.isNaN(input);
        },
        string(input) {
            return this.getConstructor(input) === String;
        },
        boolean(input) {
            return this.getConstructor(input) === Boolean;
        },
        function(input) {
            return this.getConstructor(input) === Function;
        },
        htmlElement(input) {
            return this.instanceof(input, HTMLElement);
        },
        nodeList(input) {
            return this.instanceof(input, NodeList);
        },
        nullOrUndefined(input) {
            return input === null || typeof input === 'undefined';
        },
        hexColor(input) {
            const regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$');
            return this.string(input) && regex.test(input);
        },
        objectId(input) {
            return this.string(input) && /^[a-f\d]{24}$/i.test(input);
        },
        currencyCode(input) {
            return this.string(input) && /^[A-z]{3}$/.test(input);
        },
        empty(input) {
            return (
                this.nullOrUndefined(input) ||
                ((this.string(input) || this.array(input) || this.nodeList(input)) && !input.length) ||
                (this.object(input) && !Object.keys(input).length)
            );
        },
        instanceof(input, constructor) {
            return Boolean(input && constructor && input instanceof constructor);
        },
        getConstructor(input) {
            return !this.nullOrUndefined(input) ? input.constructor : null;
        },
    },

    // Toggle class on an element
    toggleClass(name, toggle) {
        const element = this;

        if (utils.is.htmlElement(element)) {
            element.classList[toggle ? 'add' : 'remove'](name);
        }
    },

    // Fix iframe white flash
    preventFlash(callback) {
        const iframe = this;

        // Need an iframe
        if (!utils.is.htmlElement(iframe) || iframe.tagName.toLowerCase() !== 'iframe') {
            return;
        }

        // Prevent white flash (hide the iframe until loaded)
        iframe.style.opacity = 0;
        iframe.style.visibility = 'hidden';

        // Handle iframe loaded
        iframe.addEventListener('load', () => {
            // Slight delay for reduced jankness
            setTimeout(() => {
                iframe.style.opacity = 1;
                iframe.style.visibility = 'visible';

                // If there's a callback, fire it
                if (typeof callback === 'function') {
                    callback.call(iframe);
                }
            }, 300);
        });
    },

    // Determine if page is iframed
    isIframed() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },

    // Parse a URL
    // https://gist.github.com/jlong/2428561
    parseUrl(input) {
        // Create a faux anchor
        const parser = document.createElement('a');

        // Use the current url as fallback
        const url = utils.is.string(input) ? input : window.location.href;

        // Set the href to the url to parse
        parser.href = url;

        // Return the parts we need
        // Fix pathname for IE
        const info = {
            host: parser.host,
            hostname: parser.hostname,
            hash: parser.hash,
            protocol: parser.protocol,
            pathname: parser.pathname.indexOf('/') !== 0 ? `/${parser.pathname}` : parser.pathname,
            search: parser.search,
        };

        // Get the filename from path
        const parts = info.pathname.split('/');
        info.filename = parts[parts.length - 1];

        return info;
    },

    // Get all URL query parameters
    getUrlQueries() {
        let url = this;

        // Use curreny URL if not supplied
        if (url === null || typeof url !== 'string') {
            url = window.location.href;
        }

        url = utils.parseUrl(url);

        // Get queries
        const queries = decodeURIComponent(url.search)
            .substr(1)
            .split('&');

        if (queries[0] === '') {
            return {};
        }

        const results = {};

        queries.forEach(query => {
            const parts = query.split('=');
            results[parts[0]] = parts.length === 2 ? decodeURIComponent(parts[1].replace(/\+/g, ' ')) : '';
        });

        return results;
    },

    // Add a URL query to a URL
    addUrlQuery(key, value) {
        let url = this;

        if (!utils.is.string(url)) {
            url = window.location.href;
        }

        const parts = url.split('?');
        const parameters = utils.getUrlQueries.call(url);
        const hash = parts.length > 1 ? parts[1].split('#')[1] : null;
        let search = '';

        // Add the new parameter
        parameters[key] = value;

        // Construct the parameters
        Object.keys(parameters).forEach(k => {
            const parameter = parameters[k];
            search += `${search.length ? '&' : '?'}${k}${parameter.length ? `=${parameter}` : null}`;
        });

        // Reconstruct the URL
        return `${parts[0]}${search}${hash ? `#${hash}` : ''}`;
    },

    // Remove URL parameter
    removeUrlQuery(key) {
        let url = this;

        if (!utils.is.string(url)) {
            url = window.location.href;
        }

        // Get URL parts
        const parts = url.split('#');
        const search = parts[0].split('?');
        const hash = parts[1];

        if (search.length >= 2) {
            const prefix = `${encodeURIComponent(key)}=`;
            const parameters = search[1].split(/[&;]/g);

            // Reverse iteration as may be destructive
            parameters.reverse().forEach((parameter, index) => {
                if (parameter.startsWith(prefix)) {
                    parameters.splice(index, 1);
                }
            });

            // Reconstruct the URL
            return search[0] + (parameters.length ? `?${parameters.join('&')}` : '') + (hash ? `#${hash}` : '');
        }
        return url;
    },

    // Open a new popup window
    popup(url, width, height) {
        // Get position
        let left = 0;
        let top = 0;

        if (window.screen.availLeft !== undefined && window.screen.availTop !== undefined) {
            left = window.screen.availLeft;
            top = window.screen.availTop;
        } else if (window.screenLeft !== undefined && window.screenTop !== undefined) {
            left = window.screenLeft;
            top = window.screenTop;
        } else {
            ({ left, top } = window.screen);
        }

        // Open in the centre of the screen
        const x = window.screen.width / 2 - width / 2 + left;
        const y = window.screen.height / 2 - height / 2 + top;

        // Create a popup window
        const popup = window.open(url, '_blank', `top=${y},left=${x},height=${height},width=${width}`);

        // Puts focus on the newWindow
        if (window.focus) {
            popup.focus();
        }
    },

    /**
     * Convert an Object to FormData
     * @param {Object} source - source Object
     * @param {FormData} form - existing FormData object
     * @param {String} namespace - namespace for FormData
     */
    buildFormData(source, form, namespace) {
        const data = form || new FormData();
        let formKey;

        // Source must be an object
        if (!utils.is.object(source)) {
            return data;
        }

        // Loop through the object to convert
        Object.keys(source).forEach(key => {
            if (namespace) {
                formKey = `${namespace}[${key}]`;
            } else {
                formKey = key;
            }

            // If the property is an object, but not a File, use recursivity
            if (typeof source[key] === 'object' && !(source[key] instanceof File)) {
                utils.buildFormData(source[key], data, key);
            } else {
                data.append(formKey, source[key]);
            }
        });

        return data;
    },

    // Deep extend destination object with N more objects
    extend(target = {}, ...sources) {
        if (!sources.length) {
            return target;
        }

        const source = sources.shift();

        if (!utils.is.object(source)) {
            return target;
        }

        Object.keys(source).forEach(key => {
            if (utils.is.object(source[key])) {
                if (!Object.keys(target).includes(key)) {
                    Object.assign(target, { [key]: {} });
                }

                utils.extend(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        });

        return utils.extend(target, ...sources);
    },
};

export default utils;
