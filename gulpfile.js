var gulp = require('gulp'),
    notifier = require('gulp-notify'),
    karma = require('gulp-karma'),
    jade = require('gulp-jade');

var notify = function (obj) {
    var stream = through.obj(function (file, enc, callback) {
        if (config.notify) {
            file.pipe(notifier(obj));
        }
        this.push(file);
        return callback();
    });
    return stream;
};

gulp.task('karma', ['cache-templates'], function () {
    gulp.src('foobar')
        .pipe(notify({ message: 'Running jasmine tests' }));
    return gulp.src('foobar')
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: process.env.DEBUG ? 'start' : 'run',
            dieOnError: false
        }));
});

gulp.task('templates', function () {
    return gulp.src(paths.templates)
        .pipe(templateCache('templates.js', {
            module: 'dynamic-forms',
            root: '/app/'
        }))
        .pipe(gulp.dest('./build'))
        .on('error', notify.onError({
            title: 'Error Running Angular Templates',
            message: '<%= error.message %>'
        }));
});

gulp.task('jade', function () {
    gulp.src('foobar')
        .pipe(notify({ message: 'Converting Jade to HTML' }));
    return gulp.src(paths.jade)
        .pipe(jade({ pretty: true }))
        .pipe(gulp.dest('./build/templates'));
});

gulp.task('watch', ['default'], 
	gulp.watch(paths.scripts, ['scripts', 'karma']);
	gulp.watch(paths.spec, ['spec-lint', 'karma']);
	gulp.watch(paths.jade, ['jade', 'cache-templates']);
);

gulp.task('default', ['lint', 'karma', 'jade']);
