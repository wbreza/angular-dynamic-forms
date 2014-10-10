describe('dynamicInput directive', function () {
    'use strict';

    var fieldSchema = { name: 'firstName', type: 'string', required: true, minLength: 3, maxLength: 20 },
        fieldModel = 'John',
        template = '<div><form><dynamic-input ng-model="firstName" data-schema="fieldSchema"></dynamic-input></form></div>',
        scope = null,
        $$compile = null;

    beforeEach(function () {
        module('dynamic-forms');

        inject(function ($compile, $rootScope) {
            scope = $rootScope.$new();
            scope.model = fieldModel;
            scope.schema = fieldSchema;

            $$compile = $compile;
        });
    });

    function createDynamicInput(fieldScope, selector) {
        var container = angular.element(template);
        container = $$compile(container)(fieldScope);
        scope.$digest();

        return container.find(selector || 'input');
    }

    it('creates a dynamic input element', function () {
        var input = createDynamicInput(scope);

        expect(input.length).toEqual(1);
        expect(input[0].tagName).toEqual('INPUT');
    });

    it('should set the model of the input element to the specified model value', function() {
        var input = createDynamicInput(scope);

        expect(input.val()).toEqual(fieldModel);
    });

    it('should set the validation attributes as defined by the field schema', function () {
        var input = createDynamicInput(scope);

        expect(input.attr('required')).toEqual('required');
        expect(parseInt(input.attr('ng-minlength'), 10)).toEqual(fieldSchema.minLength);
        expect(parseInt(input.attr('ng-maxlength'), 10)).toEqual(fieldSchema.maxLength);
    });

    it('should use the "format" property on the schema over the "type" property when the "format" property is defined', function() {
        scope.schema.format = 'multilineText';
        var input = createDynamicInput(scope, 'textarea');

        expect(input[0].tagName).toEqual('TEXTAREA');
    });

    it('should use the default "string" template when the "type" or "format" specific templates cannot be found', function() {
        scope.schema.format = 'fancyEmailTemplate';

        var input = createDynamicInput(scope);

        expect(input[0].tagName).toEqual('INPUT');
        expect(input.attr('type')).toEqual('text');
    });

    it('registers the form field with the formController', function () {
        var input = createDynamicInput(scope, 'INPUT'),
            inputScope = angular.element(input).scope();

        expect(inputScope.formField).toBeDefined();
    });

    it('set the errorMessage property of the form field when an validation error exists', function () {
        var input = createDynamicInput(scope, 'INPUT'),
            inputScope = angular.element(input).scope();

        expect(inputScope.formField.$error.message).toBeDefined();
        expect(inputScope.formField.$error.message).toBeNull();

        scope.model = '';
        scope.$digest();

        expect(inputScope.formField.$error.message.length).toBeGreaterThan(0);
    });
});
