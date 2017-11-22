// ==========================================================================
// Gulp build script
// ==========================================================================
/* global require, __dirname */
/* eslint no-console: "off" */

const gulp = require('gulp');
const path = require('path');
const del = require('del');
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
const rollupReplace = require('rollup-plugin-replace');
const replace = require('gulp-replace');
const s3 = require('gulp-s3');

const pkg = require('./package.json');
const aws = require('./aws.json');

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

gulp.task('clean', () => del(['dist/**/*']));

// JavaScript
gulp.task('js', () => {
    const format = 'umd';

    return gulp
        .src('./src/index.js')
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
                        uglify({}, minify),
                    ],
                },
                { name: namespace, format },
            ),
        )
        .pipe(rename({ basename: `client.${format}.polyfilled` }))
        .pipe(size(sizeOptions))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('./dist/'));
});

// SASS
gulp.task('sass', () =>
    gulp
        .src('./src/ui/styles.scss')
        .on('error', gutil.log)
        .pipe(sass())
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
    run(['clean'], ['sass'], ['js'], 'watch');
});

// If aws is setup
if (Object.keys(aws).length) {
    const regex = '(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*).(?:0|[1-9][0-9]*)(?:-[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:.[\\da-z\\-]+)*)?';
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
        gulp
            .src([`${__dirname}/readme.md`])
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
        run(['clean'], ['sass'], ['js'], 'upload');
    });
}