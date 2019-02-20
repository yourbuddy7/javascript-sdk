// ==========================================================================
// Gulp build script
// ==========================================================================
/* global require, __dirname */
/* eslint no-console: "off" */

const gulp = require('gulp');
const del = require('del');

// JavaScript
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

// Utils
const log = require('fancy-log');
const ansi = require('ansi-colors');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const size = require('gulp-size');

// Deployment
const publish = require('gulp-awspublish');
const aws = require('aws-sdk');

const pkg = require('./package.json');
const build = require('./build.json');

const { version } = pkg;

// Create publisher instance
const domain = 'sdk.selzstatic.com';
const publisher = publish.create({
    region: 'us-east-1',
    params: {
        Bucket: 'selz-sdk',
    },
    credentials: new aws.SharedIniFileCredentials({ profile: 'selz' }),
});

// Set environment to production by default
process.env.NODE_ENV = process.env.BUILD || 'production';

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

const tasks = {
    clean: 'clean',
    js: [],
};

// JavaScript

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

Object.entries(build.js).forEach(([filename, entry]) => {
    entry.formats.forEach(format => {
        const name = `js:${filename}:${format}`;
        tasks.js.push(name);

        gulp.task(name, () =>
            gulp
                .src(entry.src)
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(
                    rollup(
                        {
                            plugins: [resolve(), commonjs(), babel(babelrc)],
                        },
                        {
                            name: entry.namespace,
                            exports: 'named',
                            format,
                        },
                    ),
                )
                .pipe(terser())
                .pipe(
                    rename({
                        extname: `.${format === 'es' ? 'mjs' : 'js'}`,
                    }),
                )
                .pipe(size(sizeOptions))
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest(entry.dist)),
        );
    });
});

// Clean out /dist
gulp.task('clean', () => del(['dist/**/*']));

// Watch for file changes
gulp.task('watch', () => {
    const paths = ['src/**/*.js', 'docs/scripts.js'];
    return gulp.watch(paths, gulp.parallel(...tasks.js));
});

// Default gulp task
gulp.task('default', gulp.series(tasks.clean, gulp.parallel(...tasks.js), 'watch'));

// Deployment
const regex =
    '(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*).(?:0|[1-9][0-9]*)(?:-[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?';
const cdnpath = new RegExp(`${domain}/${regex}`, 'gi');
const paths = {
    local: new RegExp('(../)?dist', 'gi'),
    cdn: `https://${domain}/${version}`,
};

// Upload options
const headers = {
    'Cache-Control': `max-age=${31536000}`,
};

// Publish version to CDN bucket
gulp.task('upload', () => {
    log(`Updating ${ansi.green.bold(version)} to ${domain}...`);

    // Replace versioned files in readme.md
    gulp.src([`${__dirname}/readme.md`])
        .pipe(replace(cdnpath, `${domain}/${version}`))
        .pipe(gulp.dest(__dirname));

    // Upload to CDN
    return gulp
        .src('./dist/**')
        .pipe(
            rename(p => {
                // eslint-disable-next-line
                p.dirname = p.dirname.replace('.', version);
            }),
        )
        .pipe(replace(paths.local, paths.cdn))
        .pipe(publisher.publish(headers))
        .pipe(publish.reporter());
});

// Do everything
gulp.task('deploy', gulp.series(tasks.clean, ...tasks.js, 'upload'));
