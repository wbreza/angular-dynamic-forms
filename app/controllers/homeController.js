(function () {
    'use strict';

    angular.module('app')
        .controller('homeController', ['$scope', HomeController]);

    function HomeController($scope) {
        var a = 1;
    }
}());