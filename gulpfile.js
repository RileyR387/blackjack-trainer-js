
'use strict';

const gulp = require('gulp'),
    embedTemplates = require('gulp-angular-embed-templates'),
    sourcemaps = require('gulp-sourcemaps'),
    useref = require('gulp-useref'),
    lazypipe = require('lazypipe'),
    gulpif = require('gulp-if'),
    terser = require('gulp-terser'),
    minifyCss = require('gulp-clean-css'),
    npmDist = require('gulp-npm-dist'),
    del = require('del'),
    livereload = require('gulp-livereload');

/**
 * Config
 */
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

// Copy dependencies to ./dest/resources
gulp.task('copy:libs', function() {
  return gulp.src(npmDist(), {base:'./node_modules'})
    .pipe(gulp.dest(rootDest + '/resources'));
});
gulp.task('copy:devlibs', function() {
  return gulp.src(npmDist({copyUnminified: true}), {base:'./node_modules'})
    .pipe(gulp.dest( './src' + '/resources'));
});

gulp.task('start-livereload', function(){
  console.log('Starting LiveReload server');
  livereload.listen();
  return 1;
});
gulp.task('reload-all', function(){
  console.log('Reloading ' + watchAllSrc);
  return gulp.src(watchAllSrc).pipe(livereload());
});
gulp.task('reload-htdocs', function(){
  console.log('Reloading ' + paths.htdocs.src);
  return gulp.src(paths.htdocs.dest).pipe(livereload());
});
gulp.task('reload-js', function(){
  console.log('Reloading ' + paths.js.src);
  return gulp.src(paths.js.dest).pipe(livereload());
});
gulp.task('reload-css', function(){
  console.log('Reloading ' + paths.css.src);
  return gulp.src(paths.css.dest).pipe(livereload());
});

/**
 * Watchers
 */
gulp.task('watch-all', function(){
  livereload.listen();
  gulp.watch(watchAllSrc,
    gulp.series(
      gulp.series('build','reload-all'),
      gulp.parallel('watch-all')
    )
  );
});
gulp.task('watch-htdocs', function(){
  gulp.watch(paths.htdocs.src,
    gulp.series('build', 'reload-htdocs',
      gulp.parallel('watch-htdocs')
    )
  );
});
gulp.task('watch-js', function(){
  gulp.watch(paths.js.src,
    gulp.series('build', 'reload-js',
      gulp.parallel('watch-js')
    )
  );
});
gulp.task('watch-css', function(){
  gulp.watch(paths.css.src,
    gulp.series('build', 'reload-css',
      gulp.parallel('watch-css')
    )
  );
});

/**
 * Watch Launchers
 */
gulp.task('watch-any', gulp.series('build',
  gulp.parallel('watch-all')
));

gulp.task('watch', gulp.series('build',
  gulp.parallel('start-livereload', 'watch-htdocs', 'watch-js', 'watch-css')
));

/**
 * Default task
 */
gulp.task('default', gulp.series('clean','copy:devlibs','build','clean:postbuild'));

