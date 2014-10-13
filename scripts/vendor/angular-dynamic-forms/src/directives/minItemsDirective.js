(function () {
    'use strict';

    function MinItemsDirective() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }

                var minItems = parseInt(attrs.minItems, 10);
                if (isNaN(minItems)) {
                    return;
                }

                var validator = function (model) {
                    var isValid = !!(model && model.length >= minItems);
                    ngModel.$setValidity('minitems', isValid);

                    return model;
                };

                scope.$watchCollection(attrs.ngModel, function (newValue) {
                    if (!angular.isDefined(newValue)) {
                        return;
                    }

                    validator(ngModel.$modelValue);
                });

                ngModel.$formatters.push(validator);
                ngModel.$parsers.unshift(validator);
            }
        };
    }

    angular.module('dynamic-forms')
        .directive('minItems', [MinItemsDirective]);
}());
