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
    plugins = require('gulp-load-plugins')();

gulp.task('connect', function () {
    connect.server({
        root: './',
        port: process.env.PORT || 5000
    })
});

gulp.task('clean', function () {
    return gulp.src('src/', {read: false})
        .pipe(clean('dist/'));
});

gulp.task('browserify', ['clean'], function() {
    // Grabs the app.js file
    return browserify('./src/js/mrt.js')
    // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main.js'))
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

gulp.task('wordpress-package', ['wordpress-plugin'], function () {
    return gulp.src('dist/wordpress/*')
        .pipe(zip('mrt_widget_journey.zip'))
        .pipe(gulp.dest('dist/wordpress'));
});

gulp.task('wordpress-clean', ['wordpress-package'], function () {
    return gulp.src('src/', {read: false})
        .pipe(clean('dist/wordpress', '*.zip'));
});

gulp.task('wordpress-plugin', ['build'], function () {
    gulp.src('wordpress/**')
        .pipe(gulp.dest('dist/wordpress/'));
    return gulp.src(['dist/**/*', '!dist/wordpress'])
        .pipe(gulp.dest('dist/wordpress/assets'));

});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['browserify']);
    gulp.watch('src/**/*.less', ['build-css']);
});

gulp.task('build', ['clean', 'build-css', 'copy-assets', 'browserify']);

gulp.task('wordpress', ['build', 'wordpress-plugin', 'wordpress-package', 'wordpress-clean']);

gulp.task('default', ['build', 'connect', 'watch']);