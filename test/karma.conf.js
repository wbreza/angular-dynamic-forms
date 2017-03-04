var karmaFiles = [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/jquery/dist/jquery.js',
    'src/*.js',
    'src/**/*.js',
    'build/templates.js',
    'test/**/*.spec.js'
];

module.exports = function (config) {
    config.set({
        basePath: '../',
        files: karmaFiles,
        exclude: [],
        reporters: process.env.DEBUG ? ['spec'] : ['spec', 'coverage'],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: [process.env.DEBUG ? 'Chrome' : 'PhantomJS'],
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-spec-reporter',
            'karma-phantomjs-launcher',
	        'karma-coverage'
        ],
        preprocessors: { 'src/**/*.js': ['coverage'] },
        coverageReporter: {
            reporters: [
                { type: 'html' },
                { type: 'text-summary' }
            ]
        },
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        singleRun: true
    });
};
