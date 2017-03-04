(function () {
    'use strict';

    function DynamicFieldController($scope) {
        var vm = this;

        vm.showError = function () {
            var field = $scope.formField;
            return field && field.$invalid && field.$dirty;
        };

        vm.showSuccess = function () {
            var field = $scope.formField;
            return field && field.$valid && field.$dirty;
        };

        vm.hasError = function() {
            var field = $scope.formField;
            return field.errorMessage && field.$dirty;
        };

        vm.hasSuccess = function() {
            var field = $scope.formField;
            return field.$valid && ($scope.model || field.$dirty);
        };
    }

    function DynamicFieldDirective($compile, validation, dynamicTemplates) {

        return {
            restrict: 'E',
            replace: true,
            require: '?^dynamicForm',
            controller: 'dynamicFieldController',
            controllerAs: 'field',
            link: function (scope, element, attrs, dynamicForm) {
                var template = dynamicForm ? dynamicForm.getFieldTemplate(scope.schema.fieldType) : dynamicTemplates.getFieldTemplate(scope.schema),
                    fieldElement = angular.element(template);

                element.replaceWith(fieldElement);
                $compile(fieldElement)(scope);
            }
        };
    }

    angular.module('dynamic-forms')
        .controller('dynamicFieldController', ['$scope', DynamicFieldController])
        .directive('dynamicField', ['$compile', 'validation', 'dynamicTemplates', DynamicFieldDirective]);

}());
