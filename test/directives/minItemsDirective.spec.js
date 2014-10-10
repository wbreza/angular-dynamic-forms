(function () {
    'use strict';

    var $$compile = null,
        $$rootScope = null,
        scope = null;

    describe('minItems validation directive', function () {
        beforeEach(function () {
            module('dynamic-forms');

            inject(function ($compile, $rootScope) {
                $$rootScope = $rootScope;
                $$compile = $compile;

            });
        });

        function createDynamicList(minItems, items) {
            scope = $$rootScope.$new();
            scope.model = items;

            var element = angular.element('<div ng-model="model"></div>');
            element.attr('data-min-items', minItems);

            element = $$compile(element)(scope);
            scope.$digest();

            return element;
        }

        it('passes validation when the minItems is not a number', function() {
            var element = createDynamicList('string', [1, 2, 3]);

            expect(element.hasClass('ng-valid')).toBeTruthy();
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
        });

        it('fails validation when the array length is less than the value', function () {
            var element = createDynamicList(2, [1]);
            expect(element.hasClass('ng-valid')).not.toBeTruthy();
            expect(element.hasClass('ng-invalid')).toBeTruthy();
        });

        it('passes validation when the array length is equal to the value', function () {
            var element = createDynamicList(3, [1, 2, 3]);
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
            expect(element.hasClass('ng-valid')).toBeTruthy();
        });

        it('fails validation when an item is removed and causes array length to be less than the min value', function () {
            var element = createDynamicList(2, [1, 2]);
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
            expect(element.hasClass('ng-valid')).toBeTruthy();

            scope.model.splice(0, 1);
            scope.$digest();

            expect(element.hasClass('ng-valid')).not.toBeTruthy();
            expect(element.hasClass('ng-invalid')).toBeTruthy();
        });

        it('passes validation when min items is less than min value and then an item is added to be equal to the minItems', function () {
            var element = createDynamicList(2, [1]);
            expect(element.hasClass('ng-invalid')).toBeTruthy();
            expect(element.hasClass('ng-valid')).not.toBeTruthy();

            scope.model.push(2);
            scope.$digest();

            expect(element.hasClass('ng-valid')).toBeTruthy();
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
        });
    });
}());
