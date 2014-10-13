/// <reference path="bower_components/angular/angular.js" />
var gulp = require('gulp'),
    bower = require('gulp-bower'),
    notify = require('gulp-notify'),
    templateCache = require('gulp-angular-templatecache'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf');
/*
 * Paths
 */
var paths = {
    appScripts: ['./app/*.js', './app/**/*.js'],
    htmlTemplates: ['./app/**/*.html'],
    vendorScripts: [
        './scripts/vendor/angular/angular.js',
        './scripts/vendor/angular-resource/angular-resource.js',
        './scripts/vendor/angular-route/angular-route.js',
        './scripts/vendor/bootstrap/dist/jquery.js',
        './scripts/vendor/jquery/dist/js/bootstrap.js'
    ]
};

/*
 * Gulp Tasks
 */

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('./vendor'));
});

gulp.task('templates', function () {
    return gulp.src(paths.htmlTemplates)
    .pipe(templateCache('templates.js', {
        module: 'app',
        root: '/app/views'
    }))
    .pipe(gulp.dest('./app'))
    .on('error', notify.onError({
        title: 'Error Running Angular Templates',
        message: '<%= error.message %>'
    }));
});

gulp.task('combine-app-scripts', ['templates'], function () {
    return gulp.src(paths.appScripts)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./scripts/release'))
    .on('error', notify.onError({
        title: 'Error Combining Scripts',
        message: '<%= error.message %>'
    }));
});

gulp.task('combine-vendor-scripts', function () {
    return gulp.src(paths.vendorScripts)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./scripts/release'))
    .on('error', notify.onError({
        title: 'Error Combining Scripts',
        message: '<%= error.message %>'
    }));
});

gulp.task('uglify-app-scripts', ['combine-app-scripts'], function () {
    return gulp.src('./scripts/release/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('./scripts/release'))
    .on('error', notify.onError({
        title: 'Error Uglifying',
        message: '<%= error.message %>'
    }));
});

gulp.task('uglify-vendor-scripts', ['combine-vendor-scripts'], function () {
    return gulp.src('./scripts/release/vendor.js')
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest('./scripts/release'))
    .on('error', notify.onError({
        title: 'Error Uglifying',
        message: '<%= error.message %>'
    }));
});

gulp.task('watch', function () {
    gulp.watch(paths.appScripts, ['build']);
    gulp.watch(paths.htmlTemplates, ['build']);
});

gulp.task('clean', function (cb) {
    rimraf('./scripts/release', cb);
});

gulp.task('combine', ['combine-app-scripts', 'combine-vendor-scripts']);
gulp.task('uglify', ['uglify-app-scripts', 'uglify-vendor-scripts']);
gulp.task('build', ['clean', 'bower', 'combine', 'uglify']);
gulp.task('default', ['build', 'watch']);