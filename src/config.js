const config = {
    urls: {
        product(url) {
            return `https://local.selz.com/embed/productdata?url=${url}`;
        },
    },
};

export default config;
