'use strict';

const browserSync = require('browser-sync');

function browserify() {
  browserSync.init({
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ["html"]
      }
    }
  });
}

module.exports = browserify;
