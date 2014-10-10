var gulp = require('gulp'),
    notify = require('gulp-notify'),
    karma = require('gulp-karma'),
    templateCache = require('gulp-angular-templatecache'),
    jade = require('gulp-jade'),
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

gulp.task('jade', function () {
    return gulp.src(paths.jade)
		.pipe(jade({ pretty: true }))
		.pipe(gulp.dest('./build/templates'))
		.on('error', notify.onError({
		    title: 'Error Running Karma Unit Tests',
		    message: '<%= error.message %>'
		}));;
});

gulp.task('watch', ['default'], function () {
    gulp.watch(paths.scripts, ['scripts', 'karma']);
    gulp.watch(paths.jade, ['jade', 'cache-templates']);
});

gulp.task('default', ['karma']);