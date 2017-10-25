const config = {
    urls: {
        product(domain, url) {
            return `https://${domain}/embed/productdata?url=${url}`;
        },
    },
};

export default config;
