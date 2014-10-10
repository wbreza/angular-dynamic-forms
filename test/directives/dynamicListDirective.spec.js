(function() {
    'use strict';

    beforeEach(module('dynamic-forms'));

    describe('dynamicList Directive', function () {
        var $$compile,
            $$rootScope,
            defaultScope = {
                model: [],
                schema: { name: 'foo', type: 'array' }
            };

        beforeEach(inject(function($compile, $rootScope) {
            $$compile = $compile;
            $$rootScope = $rootScope;
        }));

        function createForm(scope) {
            if (!scope) {
                scope = defaultScope;
            }

            var elementScope = $$rootScope.$new(),
                template = '<form><dynamic-list id="dynamicList" data-schema="schema" ng-model="model"></dynamic-list></form>';

            angular.extend(elementScope, scope);
            var element = $$compile(template)(elementScope);

            elementScope.$digest();

            return element;
        }

        it('adds the list as a form control when form controller is available', function() {
            var form = createForm(),
                list = angular.element(form[0].querySelector('#dynamicList')),
                listScope = list.scope();

            expect(listScope.form).toBeDefined();
            expect(listScope.formField).toBeDefined();
            expect(listScope.form[listScope.formField.$name]).toBeDefined();
        });

        it('removes the list from the form controls when the scope is destroyed', function() {
            var form = createForm(),
                list = angular.element(form[0].querySelector('#dynamicList')),
                listScope = list.scope();

            expect(listScope.form[listScope.formField.$name]).toBeDefined();
            listScope.$destroy();
            expect(listScope.form[listScope.formField.$name]).not.toBeDefined();
        });
    });

    describe('dynamicList Directive Controller', function() {
        var defaultController = null,
            scope = null,
            schemaWithMinItems = { type: 'array', minItems: 1 },
            schemaWithMaxItems = { type: 'array', maxItems: 2 },
            basicSchema = { type: 'array' },
            $$controller = null,
            $$rootScope = null;

        beforeEach(inject(function($controller, $rootScope) {
            $$controller = $controller;
            $$rootScope = $rootScope;

            defaultController = createController({ model: [] });
        }));

        function createController(model) {
            scope = $$rootScope.$new();
            scope.schema = schemaWithMinItems;
            angular.extend(scope, model);

            return $$controller('dynamicListController', { $scope: scope });
        }

        it('is defined', function () {
            expect(defaultController).toBeDefined();
        });

        it('defines an "addItem" function', function() {
            expect(defaultController.addItem).toBeDefined();
            expect(angular.isFunction(defaultController.addItem)).toBeTruthy();
        });

        it('defines a "removeItem" function', function() {
            expect(defaultController.removeItem).toBeDefined();
            expect(angular.isFunction(defaultController.removeItem)).toBeTruthy();
        });

        it('defines the scope "model" as an array if not already defined', function() {
            createController();
            expect(scope.model).toBeDefined();
            expect(scope.model instanceof Array).toBeTruthy();
        });

        it('adds a place holder item to meet the minimum validation requirement', function() {
            createController();
            expect(scope.model.length).toEqual(schemaWithMinItems.minItems);
        });

        it('addItem function adds a new empty item to the model array', function() {
            var testScope = {
                    model: [{}],
                    schema: { type: 'array' }
                },
                controller = createController(testScope);

            expect(scope.model.length).toEqual(testScope.model.length);
            controller.addItem();
            expect(scope.model.length).toEqual(testScope.model.length);
        });

        it('removeItem function removes an item from the model array', function() {
            var testScope = {
                    model: [{}],
                    schema: { type: 'array' }
                },
                controller = createController(testScope);

            expect(scope.model.length).toEqual(testScope.model.length);
            var removedItems = controller.removeItem(null, 0);
            expect(removedItems.length).toEqual(1);
            expect(scope.model.length).toEqual(testScope.model.length);
        });

        it('removeItem does not remove any items when the specified index is out of bounds', function() {
            var testScope = {
                    model: [{}],
                    schema: { type: 'array' }
                },
                controller = createController(testScope);

            expect(scope.model.length).toEqual(testScope.model.length);
            var removedItems = controller.removeItem(null, 100);
            expect(removedItems.length).toEqual(0);
            expect(scope.model.length).toEqual(testScope.model.length);
        });

        it('canAddItem returns true when max items is not defined', function() {
            var testScope = { schema: basicSchema },
                controller = createController(testScope);

            expect(controller.canAddItem()).toBeTruthy();
        });

        it('canAddItem returns true when item count is less than max items', function() {
            var testScope = { schema: schemaWithMaxItems, model: [1] },
                controller = createController(testScope);

            expect(controller.canAddItem()).toBeTruthy();
        });

        it('canAddItem returns false when item count is greater than max items', function () {
            var testScope = { schema: schemaWithMaxItems, model: [1, 2, 3] },
                controller = createController(testScope);

            expect(controller.canAddItem()).not.toBeTruthy();
        });

        it('canAddItem returns false when item count is equal to the max items', function () {
            var testScope = { schema: schemaWithMaxItems, model: [1, 2] },
                controller = createController(testScope);

            expect(controller.canAddItem()).not.toBeTruthy();
        });

        it('canRemoveItem returns true when min items is not defined', function() {
            var testScope = { schema: basicSchema },
                controller = createController(testScope);

            expect(controller.canRemoveItem()).toBeTruthy();
        });

        it('canRemoveItem returns true when item count is greater than the min items', function() {
            var testScope = { schema: schemaWithMinItems, model: [1,2] },
                controller = createController(testScope);

            expect(controller.canRemoveItem()).toBeTruthy();
        });

        it('canRemoveItem returns false when the item count is less than min items', function () {
            var testScope = { schema: schemaWithMinItems, model: [] },
                controller = createController(testScope);

            expect(controller.canRemoveItem()).not.toBeTruthy();
        });

        it('canRemoveItem returns false when the item count is equal to the min items', function () {
            var testScope = { schema: schemaWithMinItems, model: [1] },
                controller = createController(testScope);

            expect(controller.canRemoveItem()).not.toBeTruthy();
        });
    });
}());
