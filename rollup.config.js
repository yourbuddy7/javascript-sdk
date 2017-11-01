import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
// import istanbul from 'rollup-plugin-istanbul';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const pkg = require('./package.json');

const external = []; // Object.keys(pkg.dependencies);

const plugins = [
    resolve({
        jsnext: true,
        main: true,
        browser: true,
    }),
    commonjs(),
    babel(babelrc()),
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
    plugins,
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
