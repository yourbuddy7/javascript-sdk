import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
// import istanbul from 'rollup-plugin-istanbul';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const pkg = require('./package.json');

const external = []; // Object.keys(pkg.dependencies);

const browsers = legacy =>
    legacy ? ['> 1%', 'last 2 versions', 'Firefox ESR'] : ['Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'];

// Babel config
const config = browserlist => ({
    presets: [
        [
            'env',
            {
                targets: {
                    browsers: browserlist,
                },
                useBuiltIns: true,
                modules: false,
            },
        ],
    ],
    plugins: ['external-helpers'],
    babelrc: false,
    exclude: 'node_modules/**',
});

const plugins = (legacy = false) => [
    resolve({
        jsnext: true,
        main: true,
        browser: true,
    }),
    commonjs(),
    babel(babelrc({ config: config(browsers(legacy)) })),
    uglify({}, minify),
];

// if (process.env.BUILD !== 'production') {
//   plugins.push(
//        istanbul({
//            exclude: ['test/**/*', 'node_modules/**/*'],
//        }),
//    );
// }

export default {
    input: 'src/index.js',
    plugins: plugins(),
    external,
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: 'SelzClient',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        },
    ],
};
