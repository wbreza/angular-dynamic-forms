(function () {
    'use strict';

    /**
     * Instantiates the Angular ValidationProvider for the dynamic-forms module
     *
     * @constructor
     * @this {ValidationProvider}
     */
    function ValidationProvider() {
        var validators = {},
            validatorMapping = {},
            provider = this;

        // Private Functions

        /**
         * Registers a validators to be globally available within the dynamic forms module
         *
         * @param {typeName} The name of the property used when defining the JSON schema
         * @param {options} A object map which contains additional metadata and linking functions used when applying validation rules
         *
         * @returns {object} The complete validator object
         */
        function registerValidator(typeName, options) {
            if (typeof (validators[typeName]) === 'undefined') {
                validators[typeName] = {};
            }

            // If validator property is not defined in the options, then assume it's the same name as the typeName that is being registered
            var validator = angular.extend(validators[typeName], { validator: typeName }, options, { name: typeName });

            // Store a mapping to the validators for easy lookup by angular validation since they use different names for
            // validation attributes vs. JSON Schema standard
            validatorMapping[validator.validator] = validator;

            return validator;
        }

        /**
         * Apples validation rules to the specifed input element based on the schema configuration
         *
         * @param {inputElement} The inputElement to apply DOM transformations
         * @param {schema} The schema configuration which includes all validation rules
         */
        function applyRules(inputElement, schema) {
            for (var key in schema) {
                var validator = validators[key];
                if (!validator) {
                    continue;
                }

                // Link function called below is responsible for appending angular validation
                // directive attributes to the form input elements
                if (angular.isFunction(validator.link)) {
                    validator.link(inputElement, schema[key], schema);
                }
            }
        }

        /**
         * Monitors the scope, listens for validation errors and sets error messages
         *
         * @param {scope} The scope to monitor for changes
         * @param {fieldSchema} The field schema which contains all validation rules for the field
         * @param {formField} The form field within the angular formController that is linked to the fieldSchema
         */
        function monitorField(scope, fieldSchema, formField) {
            scope.errorMessage = null;

            scope.$watch(function () {
                if (!formField.$invalid) {
                    scope.errorMessage = null;
                    return;
                }

                for (var key in formField.$error) {
                    if (formField.$error[key] === true) {
                        scope.errorMessage = getErrorMessage(fieldSchema, key);
                        break;
                    }
                }
            });
        }

        /**
         * Get the error message for the specified validatorType for the fieldSchema
         *
         * @param {fieldSchema} The fieldSchema to find the validation message for
         * @param {validatorType} The type of validation failure that occurred
         *
         * @returns {string} The error message to display to the user for the specified validation failure.
         */
        function getErrorMessage(fieldSchema, validatorType) {
            var errorMessage,
                validator = validatorMapping[validatorType];

            if (validator) {
                errorMessage = (fieldSchema.messages && fieldSchema.messages[validator.name]) || validator.message;
            }

            return errorMessage || 'Enter a valid value';
        }

        function getValidators() {
            return validators;
        }

        function getValidatorValue(config) {
            return typeof (config) === 'object' ? config.value : config;
        }

        /**
         * Registers the default validation rules that are globally available
         */
        function registerDefaultValidators() {
            registerValidator('required', {
                link: function (inputElement) {
                    inputElement.attr('required', 'required');
                },
                message: 'Field is required'
            });

            registerValidator('minLength', {
                validator: 'minlength',
                link: function (inputElement, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (attrValue) === 'number') {
                        inputElement.attr('ng-minlength', getValidatorValue(value));
                    }
                },
                message: 'Value is less than the allowed length'
            });

            registerValidator('maxLength', {
                validator: 'maxlength',
                link: function (inputElement, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (attrValue) === 'number') {
                        inputElement.attr('ng-maxlength', getValidatorValue(value));
                    }
                },
                message: 'Value is greater than the allowed length'
            });

            registerValidator('pattern', {
                link: function (inputElement, pattern) {
                    var attrValue = pattern instanceof RegExp ? pattern : pattern.value;
                    inputElement.attr('ng-pattern', attrValue);
                },
                message: 'Value does not match the allowed pattern'
            });

            registerValidator('minimum', {
                validator: 'min',
                link: function (inputElement, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (attrValue) === 'number') {
                        inputElement.attr('min', attrValue);
                    }
                },
                message: 'Value is less than the allowed value'
            });

            registerValidator('maximum', {
                validator: 'max',
                link: function (inputElement, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (attrValue) === 'number') {
                        inputElement.attr('max', attrValue);
                    }
                },
                message: 'Value is greater than the allowed value'
            });

            registerValidator('range', {
                link: function (inputElement, config, schema) {
                    schema.minimum = config.minimum;
                    schema.maximum = config.maximum;

                    validators.minimum.link(inputElement, schema.minimum, schema);
                    validators.maximum.link(inputElement, schema.maximum, schema);
                },
                message: 'Value is not within the expected range'
            });

            registerValidator('minItems', {
                validator: 'minitems',
                link: function (element, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (value) === 'number') {
                        element.attr('data-min-items', attrValue);
                    }
                },
                message: 'Number of items is less than the allowed value'
            });

            registerValidator('maxItems', {
                validator: 'maxitems',
                link: function (element, value) {
                    var attrValue = getValidatorValue(value);

                    if (typeof (value) === 'number') {
                        element.attr('data-max-items', attrValue);
                    }
                },
                message: 'Number of items is greater than the allowed value'
            });

            provider.registerValidator('email', { message: 'Enter a valid email address' });
            provider.registerValidator('url', { message: 'Enter a valid url' });
            provider.registerValidator('number', { message: 'Enter a valid number' });
            provider.registerValidator('date', { message: 'Enter a valid date' });
        }

        /**
         * Activates the provider and applies public functions
         */
        function activate() {
            provider.$get = [function () {
                return {
                    applyRules: applyRules,
                    monitorField: monitorField,
                };
            }];

            provider.registerValidator = registerValidator;
            provider.getValidators = getValidators;

            registerDefaultValidators();
        }

        activate();
    }

    angular.module('dynamic-forms')
        .provider('validation', ValidationProvider);
}());
