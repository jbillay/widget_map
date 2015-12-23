/**
 * Created by jeremy on 26/11/2015.
 */
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    gutil   = require('gulp-util'),
    clean = require('gulp-dest-clean'),
    zip = require('gulp-zip'),
    preprocessify = require('preprocessify'),
    plugins = require('gulp-load-plugins')();

gulp.task('connect', ['build'], function () {
    connect.server({
        root: './',
        port: process.env.PORT || 5000
    })
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.js', ['browserify-live']);
    gulp.watch('src/**/*.less', ['build-css-live']);
});

gulp.task('browserify-live', function() {
    var config = require('konfig')();
    // Grabs the app.js file
    return browserify('./src/js/mrt.js')
        .transform(preprocessify(config.app))
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main_mrt_map_widget.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./dist/js/'));
});

// Less to CSS: Run manually with: "gulp build-css"
gulp.task('build-css-live', function() {
    return gulp.src('src/less/*.less')
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(
            {
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'firefox >= 4',
                    'safari 7',
                    'safari 8',
                    'IE 8',
                    'IE 9',
                    'IE 10',
                    'IE 11'
                ],
                cascade: false
            }
        ))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest('dist/css')).on('error', gutil.log);
});

gulp.task('clean', function () {
    return gulp.src('src/', {read: false})
        .pipe(clean('dist'));
});

gulp.task('set-env-test', function () {
    return process.env.NODE_ENV = 'test';
});

gulp.task('set-env-prod', function () {
    return process.env.NODE_ENV = 'prod';
});

gulp.task('browserify', ['clean'], function() {
    var config = require('konfig')();
    // Grabs the app.js file
    return browserify('./src/js/mrt.js')
        .transform(preprocessify(config.app))
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main_mrt_map_widget.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./dist/js/'));
});

// Less to CSS: Run manually with: "gulp build-css"
gulp.task('build-css', ['clean'], function() {
    return gulp.src('src/less/*.less')
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(
            {
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'firefox >= 4',
                    'safari 7',
                    'safari 8',
                    'IE 8',
                    'IE 9',
                    'IE 10',
                    'IE 11'
                ],
                cascade: false
            }
        ))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest('dist/css')).on('error', gutil.log);
});

gulp.task('copy-assets', ['clean'], function() {
    gulp.src(['node_modules/font-awesome/fonts/*', 'node_modules/bootstrap/dist/fonts/*'])
        .pipe(gulp.dest('dist/fonts/'));
    return gulp.src('node_modules/jquery-ui/themes/base/images/*')
        .pipe(gulp.dest('dist/css/images'));
});

gulp.task('wordpress-plugin', ['build'], function () {
    gulp.src('wordpress/**')
        .pipe(gulp.dest('dist/wordpress/'));
    return gulp.src(['dist/**/*', '!dist/wordpress', '!dist/wordpress/**'])
        .pipe(gulp.dest('dist/wordpress/assets'));
});

gulp.task('wordpress-package', ['wordpress-plugin'], function () {
    var d = new Date();
    return gulp.src(['dist/wordpress/**', '!dist/wordpress/mrt_widget_map.zip'])
        .pipe(zip('mrt_widget_map_' +
        process.env.NODE_ENV + '_' +
        d.getFullYear() + (d.getMonth() + 1) + d.getDate() +
        '.zip'))
        .pipe(gulp.dest('dist/wordpress'));
});

gulp.task('wordpress-clean', ['wordpress-package'], function () {
    return gulp.src('src/', {read: false})
        .pipe(clean('dist/wordpress', '*.zip'));
});

gulp.task('joomla-plugin', ['build'], function () {
    gulp.src('joomla/**')
        .pipe(gulp.dest('dist/joomla/'));
    return gulp.src(['dist/**/*', '!dist/joomla', '!dist/joomla/**'])
        .pipe(gulp.dest('dist/joomla/assets'));
});

gulp.task('joomla-package', ['joomla-plugin'], function () {
    var d = new Date();
    return gulp.src(['dist/joomla/**', '!dist/joomla/mrt_widget_map.zip'])
        .pipe(zip('mrt_widget_map_' +
        process.env.NODE_ENV + '_' +
        d.getFullYear() + (d.getMonth() + 1) + d.getDate() +
        '.zip'))
        .pipe(gulp.dest('dist/joomla'));
});

gulp.task('joomla-clean', ['joomla-package'], function () {
    return gulp.src('src/', {read: false})
        .pipe(clean('dist/joomla', '*.zip'));
});

gulp.task('build', ['clean', 'build-css', 'copy-assets', 'browserify']);

gulp.task('build-test', ['set-env-test', 'build']);

gulp.task('build-prod', ['set-env-prod', 'build']);

gulp.task('wordpress', ['build', 'wordpress-plugin', 'wordpress-package', 'wordpress-clean']);

gulp.task('wordpress-test', ['build-test', 'wordpress-plugin', 'wordpress-package', 'wordpress-clean']);

gulp.task('wordpress-prod', ['build-prod', 'wordpress-plugin', 'wordpress-package', 'wordpress-clean']);

gulp.task('joomla', ['build', 'joomla-plugin', 'joomla-package', 'joomla-clean']);

gulp.task('joomla-test', ['build-test', 'joomla-plugin', 'joomla-package', 'joomla-clean']);

gulp.task('joomla-prod', ['build-prod', 'joomla-plugin', 'joomla-package', 'joomla-clean']);

gulp.task('dev', ['build', 'connect', 'watch']);

gulp.task('default', ['wordpress-prod', 'joomla-prod']);