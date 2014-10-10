(function () {
    'use strict';

    var $$compile = null,
        $$rootScope = null,
        scope = null;

    describe('maxItems validation directive', function () {
        beforeEach(function() {
            module('dynamic-forms');

            inject(function($compile, $rootScope) {
                $$rootScope = $rootScope;
                $$compile = $compile;

            });
        });

        function createDynamicList(maxItems, items) {
            scope = $$rootScope.$new();
            scope.model = items;

            var element = angular.element('<div ng-model="model"></div>');
            element.attr('data-max-items', maxItems);

            element = $$compile(element)(scope);
            scope.$digest();

            return element;
        }

        it('passes validation when the maxItems is not a number', function () {
            var element = createDynamicList('string', [1, 2, 3]);

            expect(element.hasClass('ng-valid')).toBeTruthy();
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
        });

        it('fails validation when the array length is greater than the value', function () {
            var element = createDynamicList(2, [1, 2, 3]);
            expect(element.hasClass('ng-valid')).not.toBeTruthy();
            expect(element.hasClass('ng-invalid')).toBeTruthy();
        });

        it('passes validation when the array length is equal to the value', function () {
            var element = createDynamicList(3, [1, 2, 3]);
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
            expect(element.hasClass('ng-valid')).toBeTruthy();
        });

        it('fails validation when a new item is added and causes array length to exceed max value', function() {
            var element = createDynamicList(3, [1, 2, 3]);
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
            expect(element.hasClass('ng-valid')).toBeTruthy();

            scope.model.push(4);
            scope.$digest();

            expect(element.hasClass('ng-valid')).not.toBeTruthy();
            expect(element.hasClass('ng-invalid')).toBeTruthy();
        });

        it('passes validation when max items is exceeded and then an item is removed to be equal to the maxItems', function() {
            var element = createDynamicList(2, [1, 2, 3]);
            expect(element.hasClass('ng-invalid')).toBeTruthy();
            expect(element.hasClass('ng-valid')).not.toBeTruthy();

            scope.model.splice(0, 1);
            scope.$digest();

            expect(element.hasClass('ng-valid')).toBeTruthy();
            expect(element.hasClass('ng-invalid')).not.toBeTruthy();
        });
    });
}());
