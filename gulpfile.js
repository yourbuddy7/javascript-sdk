// ==========================================================================
// Gulp build script
// ==========================================================================
/* global require, __dirname */
/* eslint no-console: "off" */

const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const run = require('run-sequence');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const size = require('gulp-size');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');

const pkg = require('./package.json');

// Build types
const builds = {
    dev: 'development',
    prod: 'production',
};
const build = process.env.BUILD || builds.dev;

// Naming
const namespace = 'SelzClient';

// Browser list
const browsers = ['> 1%', 'last 2 versions'];

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

// Babel config
const babelrc = {
    presets: [
        [
            'env',
            {
                targets: {
                    browsers,
                },
                useBuiltIns: true,
                modules: false,
            },
        ],
    ],
    plugins: ['external-helpers'],
    babelrc: false,
    exclude: 'node_modules/**',
};

// JavaScript
gulp.task('js', () =>
    gulp
        .src('./src/index.js')
        .pipe(sourcemaps.init())
        .pipe(
            rollup(
                {
                    plugins: [
                        resolve(),
                        commonjs(),
                        replace({
                            exclude: 'node_modules/**',
                            ENVIRONMENT: JSON.stringify(build),
                            VERSION: JSON.stringify(pkg.version),
                        }),
                        babel(babelrc),
                        uglify({}, minify),
                    ],
                },
                { name: namespace, format: 'umd' },
            ),
        )
        .pipe(rename({ basename: 'client' }))
        .pipe(size(sizeOptions))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./dist/')),
);

// SASS
gulp.task('sass', () =>
    gulp
        .src('./src/ui/styles.scss')
        .pipe(sass())
        .on('error', gutil.log)
        .pipe(autoprefixer(browsers, { cascade: false }))
        .pipe(cleancss())
        .pipe(rename({ basename: 'styles' }))
        .pipe(size(sizeOptions))
        .pipe(gulp.dest('./dist/')),
);

// Watch for file changes
gulp.task('watch', () => {
    gulp.watch('./src/**/*.scss', ['sass']);
    gulp.watch('./src/**/*.js', ['js']);
});

// Default gulp task
gulp.task('default', () => {
    run(['sass'], ['js'], 'watch');
});
