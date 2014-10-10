var gulp = require('gulp'),
    notify = require('gulp-notify'),
    karma = require('gulp-karma'),
    templateCache = require('gulp-angular-templatecache'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    paths = require('./paths.js');

gulp.task('karma', ['templates'], function () {
    return gulp.src(paths.karmaFiles)
		.pipe(karma({
		    configFile: 'test/karma.conf.js',
		    action: process.env.DEBUG ? 'start' : 'run',
		    dieOnError: false
		}))
		.on('error', notify.onError({
		    title: 'Error Running Karma Unit Tests',
		    message: '<%= error.message %>'
		}));
});

gulp.task('templates', function () {
    return gulp.src(paths.jadeTemplates)
		.pipe(jade({ pretty: true }))
        .pipe(templateCache('templates.js', {
            module: 'dynamic-forms',
            root: '/app/dynamic-forms'
        }))
		.pipe(gulp.dest('./build'))
		.on('error', notify.onError({
		    title: 'Error Running Angular Templates',
		    message: '<%= error.message %>'
		}));
});

gulp.task('combine-scripts', ['templates'], function () {
    return gulp.src(paths.buildFiles)
        .pipe(concat('dynamic-forms.js'))
        .pipe(gulp.dest('./build/dist'))
		.on('error', notify.onError({
		    title: 'Error Combining Scripts',
		    message: '<%= error.message %>'
		}));
});

gulp.task('uglify', ['combine-scripts'], function () {
    return gulp.src('./build/dist/dynamic-forms.js')
        .pipe(uglify())
        .pipe(rename('dynamic-forms.min.js'))
        .pipe(gulp.dest('./build/dist'))
        .on('error', notify.onError({
            title: 'Error Building',
            message: '<%= error.message %>'
        }));
});

gulp.task('jade', function () {
    return gulp.src(paths.jade)
		.pipe(jade({ pretty: true }))
		.pipe(gulp.dest('./build/templates'))
		.on('error', notify.onError({
		    title: 'Error Running Karma Unit Tests',
		    message: '<%= error.message %>'
		}));
});

gulp.task('watch', ['default'], function () {
    gulp.watch(paths.scripts, ['scripts', 'karma']);
    gulp.watch(paths.jade, ['jade', 'cache-templates']);
});

gulp.task('build', ['templates', 'combine-scripts', 'uglify']);
gulp.task('default', ['karma']);