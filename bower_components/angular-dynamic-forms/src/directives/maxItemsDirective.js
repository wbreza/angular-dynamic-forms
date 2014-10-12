(function () {
    'use strict';

    function MaxItemsDirective() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }

                var maxItems = parseInt(attrs.maxItems, 10);
                if (isNaN(maxItems)) {
                    return;
                }

                var validator = function (model) {
                    var isValid = !!(model && model.length <= maxItems);
                    ngModel.$setValidity('maxitems', isValid);

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
        .directive('maxItems', [MaxItemsDirective]);
}());
