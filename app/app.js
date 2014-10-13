(function () {
    'use strict';

    angular.module('app', ['dynamic-forms'])
        .config(['$routeProvider', AppConfig]);

    function AppConfig($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/app/views/home.html',
                controller: 'homeController',
                controllerAs: 'home'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
}());