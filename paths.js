var paths = {
    scripts: ['./src/*.js', './src/**/*.js'],
    specs: './test/**/*.spec.js',
    jadeTemplates: './src/**/*.jade',
    buildOutput: ['./build/*.js', './build/**/*.js'],
    vendorScripts: [
        './bower_components/angular/angular.js',
        './bower_components/angular-resource/angular-resource.js',
        './bower_components/angular-route/angular-route.js',
        './bower_components/angular-mocks/angular-mocks.js',
        './bower_components/jquery/dist/jquery.js'
    ]
};

paths.karmaFiles = paths.vendorScripts
    .concat(paths.scripts)
    .concat(paths.buildOutput)
    .concat(paths.specs);

paths.codeCoverage = {};
paths.codeCoverage[paths.scripts] = ['coverage'];

module.exports = paths;