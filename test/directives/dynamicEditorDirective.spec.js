(function () {
    'use strict';

    var objectSchema = {
            type: 'object',
            name: 'simpleUser',
            title: 'Simple User',
            properties: {
                firstName: { type: 'string', required: true, title: 'First Name' },
                lastName: { type: 'string', required: true, title: 'Last Name' }
            }
        },
        objectData = {
            firstName: 'Wallace',
            lastName: 'Breza'
        },
        fieldSchema = {
            type: 'string',
            name: 'firstName',
            title: 'First Name',
            required: true
        },
        complexObjectSchema = {
            title: 'Fancy Form',
            description: 'I am the fancy form description',
            type: 'object',
            properties: {
                name: {
                    type: 'object',
                    format: 'section',
                    required: 'true',
                    title: 'Full Name Info',
                    description: 'Enter you full name',
                    index: 15,
                    properties: {
                        firstName: {
                            type: 'string',
                            title: 'First Name',
                            required: true,
                            messages: { required: 'First Name is required' },
                            description: 'First Name Help Message',
                            index: 10
                        },
                        lastName: {
                            type: 'string',
                            title: 'Last Name',
                            required: true,
                            index: 20
                        }
                    }
                }
            }
        },
        complexObjectData = {
            name: {
                firstName: 'Wallace',
                lastName: 'Breza'
            }
        };

    describe('dynamicEditor Directive', function () {
        var template = '<div><form><dynamic-form data-schema="schema" ng-model="model"></dynamic-form></form></div>',
            $$compile, $$rootScope;

        beforeEach(function () {
            module('dynamic-forms');

            inject(function ($rootScope, $compile) {
                $$rootScope = $rootScope;
                $$compile = $compile;
            });
        });

        function getDynamicEditor(schema, model) {
            var container = angular.element(template),
                scope = $$rootScope.$new();

            scope.schema = angular.copy(schema);
            scope.model = angular.copy(model);
            var editor = $$compile(container)(scope);
            scope.$digest();

            return editor;
        }

        it('renders multiple fields for a complex object', function () {
            var objectEditor = getDynamicEditor(objectSchema);
            var inputElements = objectEditor[0].querySelectorAll('.form-group');

            expect(inputElements.length).toEqual(Object.keys(objectSchema.properties).length);
        });

        it('renders a single field for a simple object', function () {
            var fieldEditor = getDynamicEditor(fieldSchema);
            var inputElements = fieldEditor[0].querySelectorAll('.form-group');

            expect(inputElements.length).toEqual(1);
        });

        it('parent scope is updated for simple form', function () {
            var objectEditor = $(getDynamicEditor(objectSchema, objectData)),
                objectScope = angular.element(objectEditor.find('.ng-scope:first')).scope(),
                firstNameInput = objectEditor.find('input:first'),
                inputScope = angular.element(firstNameInput).scope();

            inputScope.$apply(function () {
                inputScope.model = 'changed...';
            });

            var expected = firstNameInput.val();
            expect(inputScope.model).toEqual(expected);
            expect(objectScope.model.firstName).toEqual(expected);
        });

        it('parent scope is updated for complex form', function () {
            var objectEditor = $(getDynamicEditor(complexObjectSchema, complexObjectData)),
                objectScope = angular.element(objectEditor.find('.ng-scope:first')).scope(),
                firstNameInput = objectEditor.find('input:first'),
                inputScope = angular.element(firstNameInput).scope();

            inputScope.$apply(function () {
                inputScope.model = 'changed...';
            });

            var expected = firstNameInput.val();
            expect(inputScope.model).toEqual(expected);
            expect(objectScope.model.name.firstName).toEqual(expected);
        });
    });

    describe('dynamicEditor Controller', function () {
        var $$controller, $$rootScope, defaultController, scope;

        beforeEach(function () {
            module('dynamic-forms');

            inject(function ($controller, $rootScope) {
                $$controller = $controller;
                $$rootScope = $rootScope;

                defaultController = getDynamicEditorController(objectSchema);
            });
        });

        function getDynamicEditorController(schema) {
            scope = $$rootScope.$new();
            scope.schema = angular.copy(schema);

            return $$controller('dynamicEditorController', { $scope: scope });
        }

        it('should be defined', function () {
            expect(defaultController).toBeDefined();
        });

        it('should define a getProperties function', function () {
            expect(defaultController.getProperties).toBeDefined();
        });

        it('getProperties function converts a schema\'s properties object into array with the same number of items', function () {
            var properties = defaultController.getProperties();
            expect(properties.length).toEqual(Object.keys(objectSchema.properties).length);
        });

        it('getProperties function converts an schema\'s properties into an array and sets the "name" as a new property within the schema', function () {
            var properties = defaultController.getProperties();

            properties.forEach(function (property) {
                expect(property.name).toBeDefined();
                expect(objectSchema.properties[property.name]).toBeDefined();
            });
        });
    });
}());
