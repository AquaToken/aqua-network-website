'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const through2 = require('through2').obj;
const browserSync = require('browser-sync');
const gulpif = require('gulp-if');
const hash = require('gulp-hash-filename');

function processStyles() {
    return gulp.src(global.config.pathes.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(through2((file, enc, callback) => {
            file.stat.mtime = new Date();
            callback(null, file);
        }))
        .pipe(gulpif(() => process.env.NODE_ENV === 'prod', hash({format: "{name}.{hash}{ext}" })))
        .pipe(gulpif(() => process.env.NODE_ENV === 'prod', through2((file, enc, callback) => {
            let findName = file.basename.match(/(.*?)\./),
                name = findName && findName[1];
            global.config.namesWithHash.css[name] = file.basename;
            callback(null, file);
        })))
        .pipe(gulp.dest(`${global.config.base.dist}/styles/`))
        .on('end', () => browserSync.reload());
}

module.exports = processStyles;
