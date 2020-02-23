
'use strict';

const gulp = require('gulp'),
    fs = require('fs'),
    del = require('del'),
    inject = require('gulp-inject-string'),
    htmlValidator = require('gulp-w3c-html-validator'),
    embedTemplates = require('gulp-angular-embed-templates'),
    sourcemaps = require('gulp-sourcemaps'),
    useref = require('gulp-useref'),
    lazypipe = require('lazypipe'),
    gulpif = require('gulp-if'),
    terser = require('gulp-terser'),
    minifyCss = require('gulp-clean-css'),
    npmDist = require('gulp-npm-dist'),
    livereload = require('gulp-livereload');

/**
 * Config
 */
const googleAnalyticsSnippetFile = '.ga-snip.html';
const rootDest = './dist';
const watchAllSrc = './src/**/*.{html,php,css,pl,cgi,js}';
const paths = {
  htdocs: {
    src:  './src/**/*.{html,php,pl,cgi}',
    dest: './dist/**/*.{html,php,pl,cgi}',
    opts: { }
  },
  js: {
    src:  './src/**/*.js',
    dest: './dist/**/*.js',
    opts: { }
  },
    css: {
    src:  './src/**/*.{css}',
    dest: './dist/**/*.{css}',
    opts: { }
  }
};

var gaSnippet = "";
if( fs.existsSync( googleAnalyticsSnippetFile ) ){
  gaSnippet = fs.readFileSync(googleAnalyticsSnippetFile, 'utf8');
}

/**
 * Task Streams
 */
gulp.task('clean', function(){
  return del(rootDest);
});
gulp.task('clean:postbuild', function(){
  return del(rootDest + '/views');
});
gulp.task('build', function(){
  return gulp.src(paths.htdocs.src)
    .pipe(gulpif('index.html', inject.replace('<!-- gulp-inject-google-analytics -->', gaSnippet )))
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
    .pipe(gulpif('blackjack.min.js', embedTemplates()))
    .pipe(gulpif('*.js', terser()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(rootDest));
});
// Excludes sourcemaps
gulp.task('build-prod', function(){
  return gulp.src(paths.htdocs.src)
    .pipe(useref())
    .pipe(gulpif('*.js', embedTemplates()))
    .pipe(gulpif('*.js', terser()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest(rootDest));
});

gulp.task('validate-html', function() {
  //return gulp.src(paths.htdocs.src)
  // views fail... and won't ever pass..
  return gulp.src('src/index.html')
    .pipe(htmlValidator())
    .pipe(htmlValidator.reporter());
});

// Copy dependencies to ./dest/resources
gulp.task('copy:libs', function() {
  return gulp.src(npmDist(), {base:'./node_modules'})
    .pipe(gulp.dest(rootDest + '/resources'));
});
gulp.task('copy:devlibs', function() {
  return gulp.src(npmDist({copyUnminified: true}), {base:'./node_modules'})
    .pipe(gulp.dest( './src' + '/resources'));
});

/**
 * Default task
 */
gulp.task('default', gulp.series('clean','validate-html','copy:devlibs','build','clean:postbuild'));

