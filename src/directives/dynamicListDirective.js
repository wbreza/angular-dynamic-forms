(function (undefined) {
    'use strict';

    function DynamicListDirective(validation) {
        return {
            restrict: 'E',
            replace: true,
            require: ['?^form', 'ngModel'],
            transclude: true,
            template: '<section ng-transclude></section>',
            controller: 'dynamicListController',
            controllerAs: 'dynamicList',
            link: function (scope, element, attrs, ctrls) {
                var formCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1];

                if (formCtrl) {
                    scope.form = formCtrl;
                    ngModelCtrl.$name = scope.schema.name + '-' + scope.$id;
                    formCtrl.$addControl(ngModelCtrl);
                    scope.formField = formCtrl[ngModelCtrl.$name];

                    if (scope.formField) {
                        validation.monitorField(scope, scope.schema, scope.formField);
                    }
                }

                scope.$on('$destroy', function () {
                    formCtrl.$removeControl(ngModelCtrl);
                });
            }
        };
    }

    function DynamicListController($scope) {
        var vm = this;

        function activate() {
            if ($scope.model === undefined) {
                $scope.model = [];
            }

            if (angular.isDefined($scope.schema.minItems) && $scope.model.length < $scope.schema.minItems) {
                for (var i = $scope.model.length; i < $scope.schema.minItems; i++) {
                    vm.addItem();
                }
            }
        }

        vm.addItem = function () {
            $scope.model.push({});
        };

        vm.removeItem = function (item, index) {
            return $scope.model.splice(index, 1);
        };

        vm.canAddItem = function() {
            return angular.isDefined($scope.schema.maxItems) ? ($scope.model.length < $scope.schema.maxItems) : true;
        };

        vm.canRemoveItem = function() {
            return angular.isDefined($scope.schema.minItems) ? ($scope.model.length > $scope.schema.minItems) : true;
        };

        activate();
    }

    angular.module('dynamic-forms')
        .directive('dynamicList', ['validation', DynamicListDirective])
        .controller('dynamicListController', ['$scope', DynamicListController]);
}());
