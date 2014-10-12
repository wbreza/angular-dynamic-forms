(function (angular) {
    'use strict';

    var module = angular.module('dynamic-forms', ['ngResource', 'ngRoute']);

    module.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/dynamic-forms', {
                controller: 'demoController',
                templateUrl: '/app/dynamic-forms/views/demo.html'
            });
    }]);
}(angular));

(function () {
    'use strict';

    function DynamicEditorDirective($compile, dynamicTemplates, jsonSchema, validation) {
        return {
            restrict: 'E',
            replace: true,
            require: '?^dynamicForm',
            scope: {
                schema: '=',
                model: '=ngModel'
            },
            controller: 'dynamicEditorController',
            controllerAs: 'editor',
            link: function (scope, element, attrs, dynamicFormCtrl) {
                if (dynamicFormCtrl) {
                    // Inspects the schema for embedded references and expands as needed
                    dynamicFormCtrl.setupSchema(scope.schema);
                }

                var isComplex = jsonSchema.isComplex(scope.schema),
                    editorTemplate = dynamicTemplates.getEditorTemplate(scope.schema),
                    editorElement = angular.element(editorTemplate);

                if (isComplex) {
                    // Required to prevent recursive stackoverflow
                    scope.schema.format = null;

                    // Define an empty model when the model has not been defined
                    if (scope.schema.type === 'object' && !scope.model) {
                        scope.model = {};
                    }
                }

                element.replaceWith(editorElement);
                validation.applyRules(editorElement, scope.schema);
                $compile(editorElement)(scope);

                // Find the first form within the template and set it as part of the scope.
                scope.form = editorElement.controller('form');
                if (!scope.form && editorElement[0].querySelector) {
                    scope.form = angular.element(editorElement[0].querySelector('.ng-form')).controller('form');
                }
            }
        };
    }

    function DynamicEditorController($scope) {
        var vm = this,
            propertyArray = [];

        /**
         * Get and transforms the JSON schema properties from object map to an array
         * Also merges in the key of the object as the "name" within the property
         * Bound from the form HTML view
         *
         * @returns And array of JSON schema properties
         */
        vm.getProperties = function () {
            if (propertyArray.length > 0) {
                return propertyArray;
            }

            for (var key in $scope.schema.properties) {
                var property = angular.extend({}, $scope.schema.properties[key], { name: key });
                propertyArray.push(property);
            }

            return propertyArray;
        };

        /**
         * Determines if the form is in a valid state
         *
         * @returns true if valid, otherwise false
         */
        vm.isValid = function () {
            return $scope.form.$valid;
        };

        /**
         * Determines if the form has errors that should be displayed
         * If the field starts in an invalid state, waits for it to become dirty
         *
         * @returns true if has errors, otherwise false.
         */
        vm.hasError = function () {
            return $scope.form.$invalid && $scope.form.$dirty;
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicEditor', ['$compile', 'dynamicTemplates', 'jsonSchema', 'validation', DynamicEditorDirective])
        .controller('dynamicEditorController', ['$scope', DynamicEditorController]);
}());

(function () {
    'use strict';

    function DynamicFieldController($scope) {
        var vm = this;

        vm.showError = function () {
            var field = $scope.formField;
            return field && field.$invalid && field.$dirty;
        };

        vm.showSuccess = function () {
            var field = $scope.formField;
            return field && field.$valid && field.$dirty;
        };

        vm.hasError = function() {
            var field = $scope.formField;
            return field.$error.message && field.$dirty;
        };

        vm.hasSuccess = function() {
            var field = $scope.formField;
            return field.$valid && ($scope.model || field.$dirty);
        };
    }

    function DynamicFieldDirective($compile, validation, dynamicTemplates) {

        return {
            restrict: 'E',
            replace: true,
            require: '?^dynamicForm',
            controller: 'dynamicFieldController',
            controllerAs: 'field',
            link: function (scope, element, attrs, dynamicForm) {
                var template = dynamicForm ? dynamicForm.getFieldTemplate(scope.schema.fieldType) : dynamicTemplates.getFieldTemplate(scope.schema),
                    fieldElement = angular.element(template);

                element.replaceWith(fieldElement);
                $compile(fieldElement)(scope);
            }
        };
    }

    angular.module('dynamic-forms')
        .controller('dynamicFieldController', ['$scope', DynamicFieldController])
        .directive('dynamicField', ['$compile', 'validation', 'dynamicTemplates', DynamicFieldDirective]);

}());

(function () {
    'use strict';

    function DynamicFormDirective(dynamicTemplates, $compile) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                schema: '=',
                model: '=ngModel',
                submit: '&'
            },
            controller: 'dynamicFormController',
            controllerAs: 'dynamicForm',
            link: function (scope, element, attrs, ctrl, transclude) {
                var template = dynamicTemplates.getFormTemplate(scope.schema),
                    formElement = angular.element(template);

                element.append(formElement);
                $compile(formElement, transclude)(scope);

                // Find the first form within the template and set it as part of the scope.
                scope.form = formElement.controller('form');
                if (!scope.form) {
                    scope.form = formElement.find('form').controller('form');
                }
            }
        };
    }

    function DynamicFormController($scope, dynamicTemplates, jsonSchema) {
        var vm = this;

        vm.onSubmit = function () {
            $scope.submit({ '$form': $scope.form, '$model': $scope.model });
        };

        vm.getFieldTemplate = function (fieldType) {
            return dynamicTemplates.getFieldTemplate(fieldType || $scope.schema.format || 'default');
        };

        vm.setupSchema = function (editorSchema) {
            if (angular.isDefined(editorSchema.$ref)) {
                jsonSchema.extend(editorSchema, $scope.schema);
            }
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicForm', ['dynamicTemplates', '$compile', DynamicFormDirective])
        .controller('dynamicFormController', ['$scope', 'dynamicTemplates', 'jsonSchema', DynamicFormController]);
}());

(function () {
    'use strict';

    function DynamicInputDirective(dynamicTemplates, $compile, $interpolate, validation) {
        return {
            restrict: 'E',
            replace: true,
            require: '?^form',
            link: function (scope, element, attrs, formCtrl) {
                // Get the template
                var elementId = scope.schema.name + '-' + scope.$id,
                    template = dynamicTemplates.getTemplate('editors', scope.schema.format, scope.schema.type, 'string');

                template = $interpolate(template)(scope);

                var inputElement = angular.element(template);

                inputElement.attr({
                    id: elementId,
                    name: elementId
                });

                validation.applyRules(inputElement, scope.schema);
                element.replaceWith(inputElement);
                $compile(inputElement)(scope);

                if (formCtrl) {
                    scope.form = formCtrl;
                    scope.formField = formCtrl[elementId];
                    if (scope.formField) {
                        validation.monitorField(scope, scope.schema, scope.formField);
                    }
                }
            }
        };
    }

    angular.module('dynamic-forms')
        .directive('dynamicInput', ['dynamicTemplates', '$compile', '$interpolate', 'validation', DynamicInputDirective]);
}());

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

(function () {
    'use strict';

    var templatePaths = [];

    /**
     * Instantiates the DynamicTemplate Service
     *
     * @constructor
     * @this {DynamicTemplateService}
     */
    function DynamicTemplatesService($templateCache, jsonSchema) {
        function getTemplateName(args) {
            if (!args || args.length < 1) {
                return null;
            }

            var arg = args[0];
            return angular.isString(arg) ? arg : (arg.format || arg.type);
        }

        /**
         * Get the angular HTML template for the specified templateType and dataType
         *
         * @param {templateType} The type of template to search for
         * @param {templateName} 1 or more template names to search for within the template type
         *
         * @returns {string} The HTML template that matches the specified values, otherwise undefined.
         */
        function getTemplate(templateType) {
            var template;

            if (arguments.length < 2) {
                return null;
            }

            for (var i = 1; i < arguments.length; i++) {
                var templateName = arguments[i];

                for (var j = 0; j < templatePaths.length; j++) {
                    var templatePath = templatePaths[j] + '/' + templateType + '/' + templateName + '.html';
                    template = $templateCache.get(templatePath);

                    if (template) {
                        break;
                    }
                }

                if (template) {
                    break;
                }
            }

            return template;
        }

        function getFormTemplate(formSchema) {
            return getTemplate('forms', formSchema.format, formSchema.type, 'default');
        }

        function getEditorTemplate(editorSchema) {
            var isComplex = jsonSchema.isComplex(editorSchema);

            return isComplex ? getTemplate('editors', editorSchema.format, editorSchema.type, 'object')
                             : getTemplate('editors', 'property');
        }

        function getFieldTemplate() {
            var templateName = getTemplateName(arguments);
            return getTemplate('fields', templateName, 'default');
        }

        return {
            getTemplate: getTemplate,
            getFormTemplate: getFormTemplate,
            getEditorTemplate: getEditorTemplate,
            getFieldTemplate: getFieldTemplate
        };
    }

    /**
     * Instantiates the DynamicTemplate Provider
     *
     * @constructor
     * @this {DynamicTemplateProvider}
     */
    function DynamicTemplatesProvider() {
        var provider = this;

        function trimPath(path) {
            if (path[path.length - 1] === '/') {
                path = path.substr(0, path.length - 1);
            }

            return path;
        }

        function registerTemplatePath(path, index) {
            if (!angular.isDefined(index)) {
                index = templatePaths.length;
            }

            if (templatePaths.indexOf(path) === -1) {
                templatePaths.splice(index, 0, trimPath(path));
            }
        }

        function clearTemplatePaths() {
            templatePaths.length = 0;
        }

        function registerDefaultTemplatePaths() {
            registerTemplatePath('/app/dynamic-forms/views');
        }

        function getTemplatePaths() {
            return templatePaths;
        }

        function activate() {
            provider.$get = ['$templateCache', 'jsonSchema', DynamicTemplatesService];

            provider.registerTemplatePath = registerTemplatePath;
            provider.clearTemplatePaths = clearTemplatePaths;
            provider.getTemplatePaths = getTemplatePaths;

            registerDefaultTemplatePaths();
        }

        activate();
    }

    angular.module('dynamic-forms')
        .provider('dynamicTemplates', DynamicTemplatesProvider);
}());

(function () {
    'use strict';

    function JsonSchemaService() {
        var schemaStore = {};

        function isComplex(schema) {
            return (schema.type === 'object' || schema.type === 'array') || ((schema.properties && Object.keys(schema.properties).length > 0) || false);
        }

        function getSchema(pointer) {
            //TODO: if the pointer is the URI and the URI is not in the cache, then attempt to download and add to cache

            return schemaStore[pointer];
        }

        function registerSchema(schema) {
            if (!schema.id) {
                throw new Error('Schema does not specify an ID attribute');
            }

            schemaStore[schema.id] = schema;
        }

        function extendSchema(schema, rootSchema) {
            if (!angular.isDefined(schema.$ref)) {
                return schema;
            }

            var referencedSchema = schema.$ref[0] === '#' ? getDocumentSchema(schema.$ref, rootSchema)
                                                          : getSchema(schema.$ref);

            if (referencedSchema) {
                angular.extend(schema, referencedSchema);
            }

            return schema;
        }

        /**
         * Searches the specified schema for a reference pointer
         *
         * @param {pointer} the JSON path to search for
         * @param {schema} the schema to search
         */
        function getDocumentSchema(pointer, schema) {
            var pathParts = pointer.substr(2).split('/'),
                currentNode = schema;

            for (var i = 0; i < pathParts.length; i++) {
                currentNode = currentNode[pathParts[i]];

                if (!angular.isDefined(currentNode)) {
                    return null;
                }
            }

            return currentNode;
        }

        function clearSchemaStore() {
            schemaStore = {};
        }

        return {
            isComplex: isComplex,
            get: getSchema,
            register: registerSchema,
            extend: extendSchema,
            clear: clearSchemaStore
        };
    }

    angular.module('dynamic-forms')
        .factory('jsonSchema', [JsonSchemaService]);
}());

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
            scope.$watch(function () {
                if (!formField.$invalid) {
                    formField.$error.message = null;
                    return;
                }

                for (var key in formField.$error) {
                    if (formField.$error[key] === true) {
                        formField.$error.message = getErrorMessage(fieldSchema, key);
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

angular.module("dynamic-forms").run(["$templateCache", function($templateCache) {$templateCache.put("/app/dynamic-forms/views/fields/checkbox.html","\n<div class=\"checkbox\">\n  <label>\n    <dynamic-input data-schema=\"schema\" ng-model=\"model\">{{schema.title}}</dynamic-input>\n    <p ng-show=\"field.hasError()\" class=\"text-danger\">{{formField.$error.message}}</p>\n  </label>\n</div>");
$templateCache.put("/app/dynamic-forms/views/fields/default.html","\n<div ng-class=\"{\'has-error\': field.hasError(), \'has-success\': field.hasSuccess()}\" class=\"form-group has-feedback\">\n  <label class=\"control-label\">{{schema.title}} </label><span ng-show=\"schema.required\" class=\"required\">*</span><span ng-show=\"schema.description\" title=\"{{schema.description}}\" class=\"information float-right\">i</span>\n  <dynamic-input data-schema=\"schema\" ng-model=\"model\"></dynamic-input><span ng-class=\"{\'glyphicon-ok\': field.showSuccess(), \'glyphicon-remove\': field.showError()}\" class=\"glyphicon form-control-feedback\"></span>\n  <p data-ng-show=\"field.hasError()\" class=\"text-danger\">{{formField.$error.message}}</p>\n</div>");
$templateCache.put("/app/dynamic-forms/views/fields/horizontal.html","\n<div class=\"form-group\">\n  <label class=\"control-label col-sm-2\">{{schema.title}}</label><span ng-show=\"schema.required\" class=\"required\">*</span><span ng-show=\"schema.description\" title=\"{{schema.description}}\" class=\"information float-right\">i</span>\n  <div class=\"col-sm-10\">\n    <dynamic-input data-schema=\"schema\" ng-model=\"model\"></dynamic-input><span ng-class=\"{\'glyphicon-ok\': field.showSuccess(), \'glyphicon-remove\': field.showError()}\" class=\"glyphicon form-control-feedback\"></span>\n    <p ng-show=\"field.hasError()\" class=\"text-danger\">{{formField.$error.message}}</p>\n  </div>\n</div>");
$templateCache.put("/app/dynamic-forms/views/editors/array.html","\n<dynamic-list data-schema=\"schema\" ng-model=\"model\">\n  <p data-ng-show=\"formField.$error.message\" class=\"text-danger\">{{formField.$error.message}}</p>\n  <button ng-click=\"dynamicList.addItem()\" ng-disabled=\"!dynamicList.canAddItem()\" type=\"button\" class=\"btn btn-default btn-xs\">Add Item</button>\n  <ul class=\"list-group\">\n    <li ng-repeat=\"item in model\" class=\"list-group-item\">\n      <button ng-click=\"dynamicList.removeItem(item, $index)\" ng-disabled=\"!dynamicList.canRemoveItem()\" type=\"button\" class=\"btn btn-default btn-xs\">Remove Item</button>\n      <div>\n        <dynamic-editor data-schema=\"schema.items\" ng-model=\"item\" data-form=\"form\"></dynamic-editor>\n      </div>\n    </li>\n  </ul>\n</dynamic-list>");
$templateCache.put("/app/dynamic-forms/views/editors/bool.html","\n<input type=\"checkbox\" ng-checked=\"model\" ng-model=\"model\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/date.html","\n<input type=\"date\" ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/dropdown.html","\n<select ng-options=\"{{schema.bindingExpression}}\" ng-model=\"model\" class=\"form-control\"></select>");
$templateCache.put("/app/dynamic-forms/views/editors/email.html","\n<input type=\"email\" ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/integer.html","\n<input type=\"number\" ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/multilineText.html","\n<textarea rows=\"6\" ng-model=\"model\" class=\"form-control\"></textarea>");
$templateCache.put("/app/dynamic-forms/views/editors/number.html","\n<input type=\"number\" data-ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/object.html","\n<div data-ng-repeat=\"property in editor.getProperties() | orderBy:\'index\' track by property.name\">\n  <dynamic-editor ng-model=\"model[property.name]\" data-schema=\"property\"></dynamic-editor>\n</div>");
$templateCache.put("/app/dynamic-forms/views/editors/password.html","\n<input type=\"password\" data-ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/property.html","\n<dynamic-field ng-model=\"model\" data-schema=\"schema\"></dynamic-field>");
$templateCache.put("/app/dynamic-forms/views/editors/richText.html","\n<textarea rows=\"8\" data-ng-model=\"model\" class=\"form-control\"></textarea>");
$templateCache.put("/app/dynamic-forms/views/editors/section.html","\n<div ng-class=\"{\'panel-danger\':editor.hasError(), \'panel-success\':editor.isValid()}\" ng-form=\"ng-form\" class=\"panel panel-default\">\n  <div class=\"panel-heading\">{{schema.title}}</div>\n  <div class=\"panel-body\">\n    <p>{{schema.description}}</p>\n    <dynamic-editor data-schema=\"schema\" ng-model=\"model\"></dynamic-editor>\n  </div>\n</div>");
$templateCache.put("/app/dynamic-forms/views/editors/string.html","\n<input type=\"text\" data-ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/editors/uri.html","\n<input type=\"url\" data-ng-model=\"model\" class=\"form-control\"/>");
$templateCache.put("/app/dynamic-forms/views/forms/default.html","\n<article>   \n  <form role=\"form\" ng-submit=\"dynamicForm.onSubmit()\" novalidate=\"novalidate\">\n    <dynamic-editor data-schema=\"schema\" ng-model=\"model\"></dynamic-editor>\n    <section data-ng-transclude=\"data-ng-transclude\"></section>\n  </form>\n</article>");
$templateCache.put("/app/dynamic-forms/views/forms/horizontal.html","\n<article>\n  <h1>{{schema.title}}</h1>\n  <h4>{{schema.description}}</h4>\n  <hr/>\n  <form role=\"form\" ng-submit=\"form.onSubmit(dynamicForm)\" novalidate=\"novalidate\" class=\"form-horizontal\">\n    <dynamic-editor data-schema=\"schema\" ng-model=\"model\"></dynamic-editor>\n    <div class=\"form-group\">\n      <div class=\"col-sm-2\"></div>\n      <div class=\"col-sm-10\">\n        <section ng-transclude=\"ng-transclude\"></section>\n      </div>\n    </div>\n  </form>\n</article>");}]);