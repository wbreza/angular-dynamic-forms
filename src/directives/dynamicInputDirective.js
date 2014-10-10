(function () {
    'use strict';

    function DynamicInputDirective(dynamicTemplates, $compile, $interpolate, validation) {
        return {
            restrict: 'E',
            replace: true,
            require: '?^form',
            link: function (scope, element, attrs, formCtrl) {
                // Get the template
                var elementId = scope.schema.name + '-' + scope.$id,
                    template = dynamicTemplates.getTemplate('editors', scope.schema.format, scope.schema.type, 'string');

                template = $interpolate(template)(scope);

                var inputElement = angular.element(template);

                inputElement.attr({
                    id: elementId,
                    name: elementId
                });

                validation.applyRules(inputElement, scope.schema);
                element.replaceWith(inputElement);
                $compile(inputElement)(scope);

                if (formCtrl) {
                    scope.form = formCtrl;
                    scope.formField = formCtrl[elementId];
                    if (scope.formField) {
                        validation.monitorField(scope, scope.schema, scope.formField);
                    }
                }
            }
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicInput', ['dynamicTemplates', '$compile', '$interpolate', 'validation', DynamicInputDirective]);
}());
