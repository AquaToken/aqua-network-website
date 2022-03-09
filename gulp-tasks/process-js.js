'use strict';

const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const named = require('vinyl-named');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const path = require('path');
const through2 = require('through2').obj;
const hash = require('gulp-hash-filename');
const argv = require('yargs').argv;
const browserSync = require('browser-sync');

const ENV = global.config.ENV || argv.env;

function processJs() {

    let plugins = ENV === 'dev' ? null : [["angularjs-annotate", { "explicitOnly" : true}], ["transform-runtime", { "polyfill": false, "regenerator": true }]];

    let options = {
        watch: ENV === 'dev',
        devtool: ENV === 'dev' ? 'cheap-module-inline-source-map' : false,
        module: {
            loaders: [{
                test: /\.html$/,
                loader: 'html-loader',
                include: [/src/],
                options: {
                    attrs: false
                }
            }, {
                test: /\.js$/,
                loader: 'jshint-loader',
                enforce: 'pre',
                exclude: [/node_modules/, /assets/]
            }, {
                test: /\.js$/,
                loader: 'jscs-loader',
                enforce: 'pre',
                exclude: [/node_modules/, /assets/]
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        ['latest', { loose: true, modules: false }]
                    ],
                    plugins: plugins
                },
                exclude: [/node_modules/, /assets/]
            }, {
                test: /\.json/,
                loader: 'json-loader'
            }]
        },
        plugins: [
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.ProvidePlugin({})
        ]
    };

    return gulp.src(global.config.pathes.mainJs)
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: 'Webpack',
                message: err.message
            }))
        }))
        .pipe(named())
        .pipe(webpackStream(options))
        .pipe(gulpif(ENV !== 'dev', uglify()))
        .pipe(gulpif(() => process.env.NODE_ENV === 'prod', hash({format: "{name}.{hash}{ext}" })))
        .pipe(gulpif(() => process.env.NODE_ENV === 'prod', through2((file, enc, callback) => {
            let findName = file.basename.match(/(.*?)\./),
                name = findName && findName[1];
            global.config.namesWithHash.js[name] = file.basename;
            callback(null, file);
        })))
        .pipe(gulp.dest(`${global.config.base.dist}/scripts/`))
        .on('end', () => browserSync.reload());
}

module.exports = processJs;
