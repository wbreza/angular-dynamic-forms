(function () {
    'use strict';

    function DynamicEditorDirective($compile, dynamicTemplates, jsonSchema, validation) {
        return {
            restrict: 'E',
            replace: true,
            require: '?^dynamicForm',
            scope: {
                schema: '=',
                model: '=ngModel'
            },
            controller: 'dynamicEditorController',
            controllerAs: 'editor',
            link: function (scope, element, attrs, dynamicFormCtrl) {
                if (dynamicFormCtrl) {
                    // Inspects the schema for embedded references and expands as needed
                    dynamicFormCtrl.setupSchema(scope.schema);
                }

                var isComplex = jsonSchema.isComplex(scope.schema),
                    editorTemplate = dynamicTemplates.getEditorTemplate(scope.schema),
                    editorElement = angular.element(editorTemplate);

                if (isComplex) {
                    // Required to prevent recursive stackoverflow
                    scope.schema.format = null;

                    // Define an empty model when the model has not been defined
                    if (scope.schema.type === 'object' && !scope.model) {
                        scope.model = {};
                    }
                }

                element.replaceWith(editorElement);
                validation.applyRules(editorElement, scope.schema);
                $compile(editorElement)(scope);

                // Find the first form within the template and set it as part of the scope.
                scope.form = editorElement.controller('form');
                if (!scope.form && editorElement[0].querySelector) {
                    scope.form = angular.element(editorElement[0].querySelector('.ng-form')).controller('form');
                }
            }
        };
    }

    function DynamicEditorController($scope) {
        var vm = this,
            propertyArray = [];

        /**
         * Get and transforms the JSON schema properties from object map to an array
         * Also merges in the key of the object as the "name" within the property
         * Bound from the form HTML view
         *
         * @returns And array of JSON schema properties
         */
        vm.getProperties = function () {
            if (propertyArray.length > 0) {
                return propertyArray;
            }

            for (var key in $scope.schema.properties) {
                var property = angular.extend({}, $scope.schema.properties[key], { name: key });
                propertyArray.push(property);
            }

            return propertyArray;
        };

        /**
         * Determines if the form is in a valid state
         *
         * @returns true if valid, otherwise false
         */
        vm.isValid = function () {
            return $scope.form.$valid;
        };

        /**
         * Determines if the form has errors that should be displayed
         * If the field starts in an invalid state, waits for it to become dirty
         *
         * @returns true if has errors, otherwise false.
         */
        vm.hasError = function () {
            return $scope.form.$invalid && $scope.form.$dirty;
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicEditor', ['$compile', 'dynamicTemplates', 'jsonSchema', 'validation', DynamicEditorDirective])
        .controller('dynamicEditorController', ['$scope', DynamicEditorController]);
}());
