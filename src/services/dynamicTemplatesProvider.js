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
