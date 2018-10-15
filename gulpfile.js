// ==========================================================================
// Gulp build script
// ==========================================================================
/* global require, __dirname */
/* eslint no-console: "off" */

const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const run = require('run-sequence');
const rename = require('gulp-rename');
const size = require('gulp-size');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const rollupReplace = require('rollup-plugin-replace');
const replace = require('gulp-replace');
const s3 = require('gulp-s3');
const pkg = require('./package.json');

let aws = {};
try {
    aws = require('./aws.json'); // eslint-disable-line
} catch (e) {
    // Do nothing
}

const namespace = 'SelzClient';

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
    clean: ['clean'],
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
            .on('error', gutil.log)
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
            .pipe(uglify())
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
        .on('error', gutil.log)
        .pipe(sourcemaps.init())
        .pipe(
            rollup(
                {
                    plugins: [resolve(), commonjs(), babel(babelrc)],
                },
                { format: 'es' },
            ),
        )
        .pipe(uglify())
        .pipe(size(sizeOptions))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./docs/dist')),
);

// Clean out /dist
gulp.task('clean', () => del(['dist/**/*']));

// Watch for file changes
gulp.task('watch', [], () => {
    const paths = ['src/**/*.scss', 'src/**/*.js', 'docs/scripts.js'];
    gulp.watch(paths, tasks.js, ['js:demo']);
});

// Default gulp task
gulp.task('default', () => {
    run(tasks.clean, tasks.js, ['js:demo'], 'watch');
});

// If aws is setup
if (Object.keys(aws).length) {
    const regex =
        '(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*).(?:0|[1-9][0-9]*)(?:-[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?';
    const cdnpath = new RegExp(`${aws.domain}/${regex}`, 'gi');
    const paths = {
        local: new RegExp('(../)?dist', 'gi'),
        cdn: `https://${aws.domain}/${pkg.version}`,
    };

    // Upload options
    const maxAge = 31536000; // 1 year
    const options = {
        headers: {
            'Cache-Control': `max-age=${maxAge}`,
            Vary: 'Accept-Encoding',
        },
        failOnError: true,
    };

    // Publish version to CDN bucket
    gulp.task('upload', () => {
        console.log(`Uploading ${pkg.version} to ${aws.domain}...`);

        // Replace versioned files in readme.md
        gulp.src([`${__dirname}/readme.md`])
            .pipe(replace(cdnpath, `${aws.domain}/${pkg.version}`))
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
            .pipe(s3(aws, options.cdn));
    });

    // Do everything
    gulp.task('deploy', () => {
        run(tasks.clean, tasks.js, 'upload');
    });
}
