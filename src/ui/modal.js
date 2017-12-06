import support from '../support';
import utils from '../utils';

class Modal {
    constructor(options) {
        this.namespace = 'selz-modal';

        this.config = Object.assign(
            {
                minSize: {
                    checkout: {
                        width: 400,
                        height: 400,
                    },
                    item: {
                        width: 800,
                        height: 600,
                    },
                },
                popup: {
                    checkout: {
                        width: 400,
                        height: 600,
                    },
                },
                colors: {
                    buttons: {
                        background: null,
                        text: null,
                    },
                    checkout: {
                        background: null,
                        text: null,
                    },
                },
            },
            options,
        );

        // Scroll position
        this.scroll = null;

        // Elements
        this.elements = {
            modal: null,
            loader: null,
            iframe: null,
            wrapper: null,
        };
    }

    // Event listeners
    listeners() {
        // Listen for messages
        window.addEventListener('message', event => this.messageHandler.call(this, event), false);

        // Bind escape key to close
        document.addEventListener(
            'keydown',
            event => {
                if (event.keyCode === 27) {
                    this.hide();
                }
            },
            false,
        );

        // Listen for browser close
        window.addEventListener(
            'beforeunload',
            () => {
                if (this.elements.iframe) {
                    this.elements.iframe.contentWindow.postMessage(
                        JSON.stringify({
                            key: 'beforeunload',
                        }),
                        '*',
                    );
                }
            },
            false,
        );
    }

    // Get colors in weird format
    get theme() {
        const formatted = {};
        const { colors } = this.config;

        // Buttons
        if (utils.is.hexColor(colors.buttons.background)) {
            formatted.cb = colors.buttons.background;
        }
        if (utils.is.hexColor(colors.buttons.text)) {
            formatted.ct = colors.buttons.text;
        }

        // Checkout
        if (utils.is.hexColor(colors.checkout.background)) {
            formatted.chbg = colors.checkout.background;
        }
        if (utils.is.hexColor(colors.checkout.text)) {
            formatted.chtx = colors.checkout.text;
        }

        return formatted;
    }

    // Receive postMessage from iframe
    messageHandler(event) {
        // Get data
        const message = event.data;
        const domain = `https://${utils.is.string(this.config.env) && this.config.env.length ? `${this.config.env}.` : ''}selz.com`;

        // Make sure we consume only selz messages
        // Bail if it's not a string
        if (event.origin !== domain || !utils.is.string(message)) {
            return;
        }

        // Handle message
        try {
            const json = JSON.parse(message);

            switch (json.key) {
                case 'modal-theme':
                    // Send back the colors
                    event.source.postMessage(
                        JSON.stringify({
                            key: 'modal-theme',
                            data: this.theme,
                        }),
                        domain,
                    );
                    break;

                case 'modal-reloading':
                    this.loading();
                    break;

                case 'modal-loaded':
                    this.show();
                    break;

                // Close modal
                case 'modal-close':
                    this.hide();
                    break;

                default:
                    break;
            }
        } catch (exception) {
            // Invalid JSON, do nothing
        }
    }

    // Check if we need to open a new window or modal
    // If we are within iframe return true
    // If the height or width of the container smaller then config values, return true
    canOpenModal(isCheckout) {
        // If script not within iframe, skip this function
        if (!utils.isIframed()) {
            return true;
        }

        // Retrive size of iframe
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Check if current wrapper(iframe) dimensions are within defined parameters in the config
        if (isCheckout) {
            if (height >= this.config.minSize.checkout.height && width >= this.config.minSize.checkout.width) {
                return true;
            }
        } else if (height >= this.config.minSize.item.height && width >= this.config.minSize.item.width) {
            return true;
        }

        return false;
    }

    // Hide the modal
    hide() {
        if (!this.elements.modal) {
            return;
        }

        this.elements.modal.setAttribute('hidden', '');

        // Reset to initial state
        this.config.colors = null;

        // Enable scrolling
        this.toggleScroll();

        // Refocus body
        // TODO: This should really re-focus the original element that had focus
        document.body.focus();
    }

    // Loading state
    loading(toggle) {
        this.elements.modal.classList[toggle ? 'add' : 'remove'](`${this.namespace}--is-loading`);
    }

    // Show it
    show() {
        // Clear loading state
        this.loading(false);

        // Show modal incase it's been hidden
        this.elements.modal.removeAttribute('hidden');

        // Show and focus iframe
        this.elements.iframe.removeAttribute('hidden');
        this.elements.iframe.focus();
    }

    // Disable scrolling the body
    // Scroll is done within the modal iframe
    toggleScroll(input) {
        const toggle = utils.is.boolean(input) ? input : false;

        // Save where the user scroll position
        if (toggle) {
            this.scroll = {
                x: window.pageXOffset || 0,
                y: window.pageYOffset || 0,
            };
        } else {
            window.scrollTo(this.scroll.x, this.scroll.y);
        }

        // Toggle body scroll (iOS ignores this, of course)
        document.body.style.overflow = toggle ? 'hidden' : '';
        document.documentElement.style.overflow = toggle ? 'hidden' : '';

        // Toggle scroll on iOS
        // https://github.com/twbs/bootstrap/issues/16557
        if (/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            document.documentElement.style.position = toggle ? 'fixed' : '';
            document.documentElement.style.height = toggle ? '100%' : '';
            document.documentElement.style.width = toggle ? '100%' : '';
        }
    }

    // Render the modal elements
    build(label) {
        // Modal container
        const modal = document.createElement('div');
        modal.setAttribute('class', this.namespace);

        // Add class if animations supported
        utils.toggleClass.call(modal, 'supports-cssanimations', support.animation);

        // Loader
        const loader = document.createElement('div');
        loader.setAttribute('class', `${this.namespace}__loader`);
        loader.innerHTML = utils.is.string(label) ? label : 'Loading...';

        // Iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('class', `${this.namespace}__iframe`);
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'geolocation');
        iframe.setAttribute('hidden', '');

        // Prevent white flash
        utils.preventFlash.call(iframe);

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', `${this.namespace}__body`);

        // Cache elements
        this.elements.modal = modal;
        this.elements.loader = loader;
        this.elements.iframe = iframe;
        this.elements.wrapper = wrapper;

        // Inject elements
        wrapper.appendChild(iframe);
        modal.appendChild(loader);
        modal.appendChild(wrapper);
        document.body.appendChild(modal);

        // Event listeners
        this.listeners();
    }

    // Public functions
    open(link, colors, label) {
        let url = link.toLowerCase();

        // Store colors if passed
        if (utils.is.object(colors)) {
            Object.assign(this.config.colors, colors);
        }

        // Set frame type
        url = utils.addUrlQuery.call(url, 'frame', 'modal');

        // Set channel
        url = utils.addUrlQuery.call(url, 'channel', 'jssdk');

        if (
            !url.includes('?_ga') &&
            !url.includes('&_ga') &&
            utils.is.function(window.ga) &&
            utils.is.object(window.gaplugins) &&
            utils.is.function(window.gaplugins.Linker)
        ) {
            // Cross-domain tracking for iframe - we need to add _ga to query string if it's not already added
            // https://www.knewledge.com/en/blog/2013/11/cross-domain-tracking-for-links-with-gtm/
            // https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframe
            window.ga(tracker => {
                // GTM does not expose tracker
                if (typeof tracker === 'undefined' && utils.is.function(window.ga.getAll)) {
                    const gaTrackers = window.ga.getAll();

                    if (gaTrackers.length) {
                        tracker = gaTrackers[0]; // eslint-disable-line
                    }
                }

                if (typeof tracker !== 'undefined') {
                    const linker = new window.gaplugins.Linker(tracker);
                    url = linker.decorate(url);
                }
            });
        }

        const isCheckout = utils.parseUrl(url).pathname.indexOf('/checkout') === 0;

        // Check if window meets min sizes
        if (!this.canOpenModal(isCheckout)) {
            if (isCheckout) {
                const { width, height } = this.config.popup.checkout;
                utils.popup(url, width, height);
            } else {
                // Strip URL queryssss
                url = utils.removeUrlQuery.call(url, 'frame');

                // Open window
                window.open(url);
            }
        }

        // Disable scroll
        this.toggleScroll(true);

        // If the modal doesn't exist, render it
        if (this.elements.modal === null) {
            this.build(label);
        }

        // Set loading state
        this.loading(true);

        // Set the URL
        this.elements.iframe.src = url;
    }
}

export default Modal;
