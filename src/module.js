(function (angular) {
    'use strict';

    var module = angular.module('dynamic-forms', ['ngResource', 'ngRoute']);

    module.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/dynamic-forms', {
                controller: 'demoController',
                templateUrl: '/app/dynamic-forms/views/demo.html'
            });
    }]);
}(angular));
