(function() {
    'use strict';

    describe('validation service', function() {
        var validationService = null;

        beforeEach(function() {
            module('dynamic-forms');
            inject(function(validation) {
                validationService = validation;
            });
        });

        it('should be defined', function() {
            expect(validationService).toBeDefined();
        });

        it('should define a monitorField function', function() {
            expect(validationService.monitorField).toBeDefined();
            expect(typeof (validationService.monitorField)).toEqual('function');
        });

        it('should define an applyRules function', function() {
            expect(validationService.applyRules).toBeDefined();
            expect(typeof (validationService.applyRules)).toEqual('function');
        });

        it('applyRules add validation directive attributes to an element', function() {
            var schema = { name: 'foo', required: true, minLength: 4, maxLength: 16 };

            var inputElement = angular.element('<input type="text" />');

            validationService.applyRules(inputElement, schema);

            expect(inputElement.attr('required')).toBeDefined();
            expect(inputElement.attr('ng-minlength')).toBeDefined();
            expect(inputElement.attr('ng-maxlength')).toBeDefined();
        });

        it('monitorField sets the error message when a validation fails', inject(function($rootScope) {
            var fieldSchema = { name: 'foo', dataType: 'text', validations: { required: true, minLength: 4, maxLength: 16 } };
            var formField = { $error: { required: true }, $invalid: true };

            var scope = $rootScope.$new();
            scope.schema = fieldSchema;

            expect(scope.errorMessage).toBeUndefined();
            validationService.monitorField(scope, fieldSchema, formField);
            scope.$digest();

            expect(scope.errorMessage).not.toBeNull();
            expect(scope.errorMessage.length).toBeGreaterThan(0);
        }));

        it('monitorField removes the error message when there are no validation errors', inject(function($rootScope) {
            var fieldSchema = { name: 'foo', dataType: 'text', validations: { required: true, minLength: 4, maxLength: 16 } };
            var formField = { $error: { required: true }, $invalid: true };

            var scope = $rootScope.$new();
            scope.schema = fieldSchema;

            validationService.monitorField(scope, fieldSchema, formField);
            scope.$digest();

            expect(scope.errorMessage).not.toBeNull();
            expect(scope.errorMessage.length).toBeGreaterThan(0);

            formField.$invalid = false;
            formField.$error.required = false;
            scope.$digest();

            expect(scope.errorMessage).toBeNull();
        }));

        describe('Default Validators', function() {
            var inputElement = null;

            beforeEach(function() {
                inputElement = angular.element('<input type="text" />');
            });

            describe('(required validator)', function() {
                it('should set the required attribute on the input element', function() {
                    var schema = { name: 'foo', required: true };
                    validationService.applyRules(inputElement, schema);

                    expect(inputElement.attr('required')).toBeDefined();
                });
            });

            describe('(minLength validator)', function() {
                it('should set the ng-minlength attribute on the input element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', minLength: 4 };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('ng-minlength');

                    expect(attrValue).toBeDefined();
                    expect(parseInt(attrValue, 10)).toEqual(schema.minLength);
                });

                it('should not set the "ng-minlength" attribute on the input element when the value is not a number', function() {
                    var schema = { name: 'foo', minLength: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('ng-minlength');

                    expect(attrValue).not.toBeDefined();
                });
            });

            describe('(maxLength validator)', function() {
                it('should set the ng-maxlength attribute on the input element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', maxLength: 16 };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('ng-maxlength');

                    expect(attrValue).toBeDefined();
                    expect(parseInt(attrValue, 10)).toEqual(schema.maxLength);
                });

                it('should not set the "ng-maxlength" attribute on the input element when the value is not a number', function () {
                    var schema = { name: 'foo', maxLength: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('ng-maxlength');

                    expect(attrValue).not.toBeDefined();
                });
            });

            describe('(pattern validator)', function() {
                it('should set the ng-pattern attribute on the input element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', pattern: /.*?/ };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('ng-pattern');

                    expect(attrValue).toBeDefined();
                    expect(attrValue).toEqual(schema.pattern.toString());
                });
            });

            describe('(min validator)', function() {
                it('should set the "min" attribute on the input element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', minimum: 2 };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('min');

                    expect(attrValue).toBeDefined();
                    expect(parseInt(attrValue, 10)).toEqual(schema.minimum);
                });

                it('should not add the "min" attribute when the specified value is not numeric', function() {
                    var schema = { name: 'foo', minimum: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('min');

                    expect(attrValue).not.toBeDefined();
                });
            });

            describe('(max validator)', function() {
                it('should set the "max" attribute on the input element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', maximum: 32 };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('max');

                    expect(attrValue).toBeDefined();
                    expect(parseInt(attrValue, 10)).toEqual(schema.maximum);
                });

                it('should not add the "max" attribute when the specified value is not numeric', function () {
                    var schema = { name: 'foo', maximum: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var attrValue = inputElement.attr('max');

                    expect(attrValue).not.toBeDefined();
                });
            });

            describe('(range validator)', function() {
                it('should set the "min" and "max" attributes on the input element and it should be equal to the specified values', function() {
                    var schema = { name: 'foo', range: { minimum: 8, maximum: 64 } };
                    validationService.applyRules(inputElement, schema);
                    var minValue = inputElement.attr('min'),
                        maxValue = inputElement.attr('max');

                    expect(minValue).toBeDefined();
                    expect(maxValue).toBeDefined();
                    expect(parseInt(minValue, 10)).toEqual(schema.range.minimum);
                    expect(parseInt(maxValue, 10)).toEqual(schema.range.maximum);
                });

                it('should not set the "min" and "max" attributes on the input element when the value is not a number', function() {
                    var schema = { name: 'foo', range: { minimum: 'foo', maximum: 'bar' } };
                    validationService.applyRules(inputElement, schema);
                    var minValue = inputElement.attr('min'),
                        maxValue = inputElement.attr('max');

                    expect(minValue).not.toBeDefined();
                    expect(maxValue).not.toBeDefined();
                });
            });

            describe('(minItems validator)', function() {
                it('should set the "min-items" attributs on the element and it should be equal to the specified value', function() {
                    var schema = { name: 'foo', minItems: 2 };
                    validationService.applyRules(inputElement, schema);
                    var minItemsValue = inputElement.attr('data-min-items');

                    expect(minItemsValue).toBeDefined();
                    expect(parseInt(minItemsValue, 10)).toEqual(schema.minItems);
                });

                it('should not set the "min-items" attribute when the value is not a number', function() {
                    var schema = { name: 'foo', minItems: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var minItemsValue = inputElement.attr('data-min-items');

                    expect(minItemsValue).not.toBeDefined();
                });
            });

            describe('(maxItems validator)', function() {
                it('should set the "max-items" attribute on the element and it should be equal to the specified value', function () {
                    var schema = { name: 'foo', maxItems: 2 };
                    validationService.applyRules(inputElement, schema);
                    var maxItemsValue = inputElement.attr('data-max-items');

                    expect(maxItemsValue).toBeDefined();
                    expect(parseInt(maxItemsValue, 10)).toEqual(schema.maxItems);
                });

                it('should not set the "max-items" attribute when the value is not a number', function () {
                    var schema = { name: 'foo', maxItems: 'bar' };
                    validationService.applyRules(inputElement, schema);
                    var maxItemsValue = inputElement.attr('data-max-items');

                    expect(maxItemsValue).not.toBeDefined();
                });
            });
        });
    });

    describe('validationProvider', function() {
        var provider = null;

        beforeEach(function() {
            angular
                .module('validationProviderTest', [])
                .config(function(validationProvider) {
                    provider = validationProvider;
                });

            module('dynamic-forms', 'validationProviderTest');
            inject(function () { }); // This is needed even thought it appears it doesn't do anything
        });

        it('should be defined', function() {
            expect(provider).toBeDefined();
            expect(provider).not.toBeNull();
        });

        it('should contain many default registered validators', function() {
            var registeredValidators = provider.getValidators();
            expect(Object.keys(registeredValidators).length).toBeGreaterThan(0);
        });

        it('should define a registerValidator function', function() {
            expect(provider.registerValidator).toBeDefined();
            expect(typeof (provider.registerValidator)).toEqual('function');
        });

        it('should define a getValidators function', function() {
            expect(provider.getValidators).toBeDefined();
            expect(typeof (provider.getValidators)).toEqual('function');
        });

        it('should register a new validator when calling registerValidator method', function() {
            var validatorName = 'customValidator',
                newValidator = {
                    link: function(inputElement) {
                        inputElement.attr('ng-custom-attr', 'foobar');
                    },
                    message: 'This is the default validation message'
                };

            var validators = provider.getValidators();

            expect(validators.customValidator).not.toBeDefined();
            provider.registerValidator(validatorName, newValidator);
            expect(validators.customValidator).toBeDefined();
        });

        it('should extend / modify an existing validator when calling registerValidator method', function() {
            var validatorName = 'customValidator',
                newValidator = { message: 'Original Message' },
                validators = provider.getValidators();

            // Register initial validator
            provider.registerValidator(validatorName, newValidator);
            expect(validators[validatorName].message).toEqual(newValidator.message);
            expect(validators[validatorName].link).not.toBeDefined();

            // Extend the validators
            provider.registerValidator(validatorName, { link: function() {} });

            // Ensure both properties are still set
            expect(validators[validatorName].message).toEqual(newValidator.message);
            expect(validators[validatorName].link).toBeDefined();
        });
    });
}());
