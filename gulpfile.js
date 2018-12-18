// ==========================================================================
// Gulp build script
// ==========================================================================
/* global require, __dirname */
/* eslint no-console: "off" */

const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const size = require('gulp-size');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const rollupReplace = require('rollup-plugin-replace');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const replace = require('gulp-replace');
const publish = require('gulp-awspublish');
const aws = require('aws-sdk');
const pkg = require('./package.json');

const namespace = 'SelzClient';

// Create publisher instance
const domain = 'sdk.selzstatic.com';
const publisher = publish.create({
    region: 'us-east-1',
    params: {
        Bucket: 'selz-sdk',
    },
    credentials: new aws.SharedIniFileCredentials({ profile: 'selz' }),
});

// Build types
const builds = {
    dev: 'development',
    prod: 'production',
};

// Set environment to production by default
const build = process.env.BUILD || builds.prod;
process.env.NODE_ENV = build;

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

const tasks = {
    clean: 'clean',
    js: [],
};

// Babel config
const babelrc = {
    babelrc: false,
    presets: [
        '@babel/env',
        [
            'minify',
            {
                builtIns: false, // Temporary fix for https://github.com/babel/minify/issues/904
            },
        ],
    ],
};

// JavaScript
// Formats to build
const formats = {
    es: {
        format: 'es',
        ext: 'mjs',
        polyfill: false,
    },
    umd: {
        format: 'umd',
        ext: 'js',
        polyfill: false,
    },
};

Object.entries(formats).forEach(([format, task]) => {
    const name = `js:${format}`;
    tasks.js.push(name);

    gulp.task(name, () =>
        gulp
            .src('./src/client.js')
            .on('error', console.log)
            .pipe(sourcemaps.init())
            .pipe(
                rollup(
                    {
                        plugins: [
                            resolve(),
                            commonjs(),
                            rollupReplace({
                                exclude: 'node_modules/**',
                                ENVIRONMENT: JSON.stringify(build),
                                VERSION: JSON.stringify(pkg.version),
                            }),
                            babel(babelrc),
                        ],
                    },
                    {
                        name: namespace,
                        exports: 'named',
                        format: task.format,
                    },
                ),
            )
            .pipe(
                terser({
                    // keep_classnames: true,
                }),
            )
            .pipe(
                rename({
                    extname: `.${task.ext}`,
                }),
            )
            .pipe(size(sizeOptions))
            .pipe(sourcemaps.write(''))
            .pipe(gulp.dest('./dist/')),
    );
});

// Docs JS
gulp.task('js:demo', () =>
    gulp
        .src('./docs/src/*.js')
        .on('error', console.log)
        .pipe(sourcemaps.init())
        .pipe(
            rollup(
                {
                    plugins: [resolve(), commonjs(), babel(babelrc)],
                },
                { format: 'es' },
            ),
        )
        .pipe(
            terser({
                // keep_classnames: true,
            }),
        )
        .pipe(size(sizeOptions))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./docs/dist')),
);

// Clean out /dist
gulp.task('clean', () => del(['dist/**/*']));

// Watch for file changes
gulp.task('watch', () => {
    const paths = ['src/**/*.js', 'docs/scripts.js'];
    return gulp.watch(paths, gulp.parallel(...tasks.js, 'js:demo'));
});

// Default gulp task
gulp.task('default', gulp.series(tasks.clean, gulp.parallel(...tasks.js), 'js:demo', 'watch'));

// Deployment
const regex =
    '(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*).(?:0|[1-9][0-9]*)(?:-[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?';
const cdnpath = new RegExp(`${domain}/${regex}`, 'gi');
const paths = {
    local: new RegExp('(../)?dist', 'gi'),
    cdn: `https://${domain}/${pkg.version}`,
};

// Upload options
const headers = {
    'Cache-Control': `max-age=${31536000}`,
};

// Publish version to CDN bucket
gulp.task('upload', () => {
    console.log(`Uploading ${pkg.version} to ${domain}...`);

    // Replace versioned files in readme.md
    gulp.src([`${__dirname}/readme.md`])
        .pipe(replace(cdnpath, `${domain}/${pkg.version}`))
        .pipe(gulp.dest(__dirname));

    // Upload to CDN
    return gulp
        .src('./dist/**')
        .pipe(
            rename(p => {
                // eslint-disable-next-line
                p.dirname = p.dirname.replace('.', pkg.version);
            }),
        )
        .pipe(replace(paths.local, paths.cdn))
        .pipe(publisher.publish(headers))
        .pipe(publish.reporter());
});

// Do everything
gulp.task('deploy', gulp.series(tasks.clean, ...tasks.js, 'upload'));
