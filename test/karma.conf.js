var paths = require('../paths.js');

module.exports = function (config) {
    config.set({
        basePath: '../',
        files: paths.karmaFiles,
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
        preprocessors: { './src/**/*.js': ['coverage'] },
        coverageReporter: {
            reporters: [
                { type: 'html' },
                { type: 'text-summary' }
            ]
        },
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
    });
};
