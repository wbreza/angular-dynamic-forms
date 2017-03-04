var gulp = require('gulp'),
    notify = require('gulp-notify'),
    templateCache = require('gulp-angular-templatecache'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf'),
    paths = require('./paths.js');
    KarmaServer = require('karma').Server;

// TEST
gulp.task('karma', ['templates'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/test/karma.conf.js'
    }, done).start();
})
.on('error', notify.onError({
    title: 'Error Running Karma Unit Tests',
    message: '<%= error.message %>'
}));

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
        .pipe(gulp.dest('./dist'))
        .on('error', notify.onError({
            title: 'Error Combining Scripts',
            message: '<%= error.message %>'
        }));
});

gulp.task('uglify', ['combine-scripts'], function () {
    return gulp.src('./dist/dynamic-forms.js')
        .pipe(uglify())
        .pipe(rename('dynamic-forms.min.js'))
        .pipe(gulp.dest('./dist'))
        .on('error', notify.onError({
            title: 'Error Uglifying',
            message: '<%= error.message %>'
        }));
});

gulp.task('jade', function () {
    return gulp.src(paths.jadeTemplates)
        .pipe(jade({ pretty: true }))
        .pipe(gulp.dest('./build/templates'))
        .on('error', notify.onError({
            title: 'Error Running Karma Unit Tests',
            message: '<%= error.message %>'
        }));
});

gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

gulp.task('watch', ['default'], function () {
    gulp.watch(paths.scripts, ['karma']);
    gulp.watch(paths.jadeTemplates, ['templates']);
});

gulp.task('build', ['clean', 'templates', 'combine-scripts', 'uglify']);
gulp.task('default', ['build', 'karma']);