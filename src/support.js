// Check for CSS3 support
const support = {
    get animation() {
        const test = document.createElement('div');
        const prefixes = 'Webkit Moz O ms Khtml'.split(' ');
        return prefixes.some(prefix => test.style[`${prefix}AnimationName`] !== undefined);
    },
    get pointerEvents() {
        const x = document.createElement('x');
        x.style.cssText = 'pointer-events:auto';
        return x.style.pointerEvents === 'auto';
    },
};

export default support;
