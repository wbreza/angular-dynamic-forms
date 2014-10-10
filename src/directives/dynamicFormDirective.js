(function () {
    'use strict';

    function DynamicFormDirective(dynamicTemplates, $compile) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                schema: '=',
                model: '=ngModel',
                submit: '&'
            },
            controller: 'dynamicFormController',
            controllerAs: 'dynamicForm',
            link: function (scope, element, attrs, ctrl, transclude) {
                var template = dynamicTemplates.getFormTemplate(scope.schema),
                    formElement = angular.element(template);

                element.append(formElement);
                $compile(formElement, transclude)(scope);

                // Find the first form within the template and set it as part of the scope.
                scope.form = formElement.controller('form');
                if (!scope.form) {
                    scope.form = formElement.find('form').controller('form');
                }
            }
        };
    }

    function DynamicFormController($scope, dynamicTemplates, jsonSchema) {
        var vm = this;

        vm.onSubmit = function () {
            $scope.submit({ '$form': $scope.form, '$model': $scope.model });
        };

        vm.getFieldTemplate = function (fieldType) {
            return dynamicTemplates.getFieldTemplate(fieldType || $scope.schema.format || 'default');
        };

        vm.setupSchema = function (editorSchema) {
            if (angular.isDefined(editorSchema.$ref)) {
                jsonSchema.extend(editorSchema, $scope.schema);
            }
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicForm', ['dynamicTemplates', '$compile', DynamicFormDirective])
        .controller('dynamicFormController', ['$scope', 'dynamicTemplates', 'jsonSchema', DynamicFormController]);
}());
