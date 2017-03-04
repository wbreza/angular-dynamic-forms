(function () {
    'use strict';

    describe('dynamicTemplates Service', function () {
        var dynamicTemplatesService, $$templateCache;

        beforeEach(function () {
            angular
                .module('dynamicTemplatesProviderTest', [])
                .config(function (dynamicTemplatesProvider) {
                    // Used for tests below
                    dynamicTemplatesProvider.registerTemplatePath('/app/custom-module/views'); // Gets appended to the end of the list
                    dynamicTemplatesProvider.registerTemplatePath('/app/another-module/views', 0); // Gets inserted into first index
                });

            module('dynamic-forms', 'dynamicTemplatesProviderTest');

            inject(function (dynamicTemplates, $templateCache) {
                dynamicTemplatesService = dynamicTemplates;
                $$templateCache = $templateCache;
            });
        });

        it('should be defined', function () {
            expect(dynamicTemplatesService).toBeDefined();
        });

        it('defines a getTemplate function defined', function () {
            expect(dynamicTemplatesService.getTemplate).toBeDefined();
            expect(typeof (dynamicTemplatesService.getTemplate)).toEqual('function');
        });

        describe('implementation', function () {
            it('returns a template when it has been cached in the templateCache', function () {
                var templateType = 'forms',
                    dataType = 'default',
                    template = dynamicTemplatesService.getTemplate(templateType, dataType);

                expect(template).toBeDefined();
                expect(template).not.toBeNull();
                expect(typeof (template)).toEqual('string');
            });

            it('returns null when the template is not found', function () {
                var templateType = 'forms',
                    dataType = 'INVALID',
                    template = dynamicTemplatesService.getTemplate(templateType, dataType);

                expect(template).not.toBeDefined();
            });

            it('getFormTemplate returns "default" template when template not found', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/forms/default.html');
                var template = dynamicTemplatesService.getFormTemplate('NOTFOUND');

                expect(template).toEqual(expected);
            });

            it('getFormTemplate can accept object input', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/forms/horizontal.html');
                var template = dynamicTemplatesService.getFormTemplate({ format: 'horizontal' });

                expect(template).toEqual(expected);
            });

            it('getEditorTemplate returns "property" template when template not found', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/editors/property.html');
                var template = dynamicTemplatesService.getEditorTemplate('NOTFOUND');

                expect(template).toEqual(expected);
            });

            it('getEditorTemplate can accept object input', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/editors/section.html');
                var template = dynamicTemplatesService.getEditorTemplate({ type: 'object', format: 'section' });

                expect(template).toEqual(expected);
            });

            it('getFieldTemplate returns "default" template when template not found', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/fields/default.html');
                var template = dynamicTemplatesService.getFieldTemplate('NOTFOUND');

                expect(template).toEqual(expected);
            });

            it('getFieldTemplate can accept object input', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/fields/checkbox.html');
                var template = dynamicTemplatesService.getFieldTemplate({ format: 'checkbox' });

                expect(template).toEqual(expected);
            });

            it('getFieldTemplate can accept string input', function () {
                var expected = $$templateCache.get('/app/dynamic-forms/views/fields/checkbox.html');
                var template = dynamicTemplatesService.getFieldTemplate('checkbox');

                expect(template).toEqual(expected);
            });

            it('getTemplate search all registered template paths when not found in first registered path', function() {
                var customFormPath = '/app/custom-module/views/forms/fancy.html';

                $$templateCache.put(customFormPath, '<div>Fancy form</div>');
                var expected = $$templateCache.get(customFormPath);

                var template = dynamicTemplatesService.getTemplate('forms', 'fancy');

                expect(template).toEqual(expected);
            });

            it('getTemplate search will find the first template found within its registered template paths', function() {
                var customFormPath = '/app/another-module/views/forms/default.html';
                $$templateCache.put(customFormPath, '<div>Overriden Default</div>');
                var expected = $$templateCache.get(customFormPath);

                var template = dynamicTemplatesService.getTemplate('forms', 'default');

                expect(template).toEqual(expected);
            });
        });
    });

    describe('dynamicTemplates Provider', function () {
        var provider = null;

        beforeEach(function () {
            angular
                .module('dynamicTemplatesProviderTest', [])
                .config(function (dynamicTemplatesProvider) {
                provider = dynamicTemplatesProvider;
            });

            module('dynamic-forms', 'dynamicTemplatesProviderTest');
            inject(function ()
            { }); // This is needed even thought it appears it doesn't do anything
        });

        it('should be defined', function () {
            expect(provider).toBeDefined();
            expect(provider).not.toBeNull();
        });

        it('should define a "getTemplatePaths" function', function () {
            expect(angular.isFunction(provider.getTemplatePaths)).toBeTruthy();
        });

        it('should define a "registerTemplatePath" function', function () {
            expect(angular.isFunction(provider.registerTemplatePath)).toBeTruthy();
        });

        it('should define a "clearTemplatePaths" function', function () {
            expect(angular.isFunction(provider.clearTemplatePaths)).toBeTruthy();
        });

        it('should contain an array of default registered template paths', function () {
            var templatePaths = provider.getTemplatePaths();
            expect(templatePaths.length >= 1).toBeTruthy();
        });

        it('"registerTemplatePath" registers a new distinct template path', function () {
            var expectedPath = '/foo/bar',
                templatePaths = provider.getTemplatePaths(),
                origCount = templatePaths.length;

            provider.registerTemplatePath(expectedPath);
            provider.registerTemplatePath(expectedPath);
            provider.registerTemplatePath(expectedPath);

            templatePaths = provider.getTemplatePaths();

            expect(templatePaths.length).toEqual(origCount + 1);
            expect(templatePaths.indexOf(expectedPath)).toBeGreaterThan(-1);
        });

        it('"registerTemplatePath" will trim paths the end with forward slash', function () {
            var templatePaths = provider.getTemplatePaths(),
                origCount = templatePaths.length;

            provider.registerTemplatePath('/foo/bar');
            provider.registerTemplatePath('/foo/bar/');

            templatePaths = provider.getTemplatePaths();

            expect(templatePaths.length).toEqual(origCount + 1);
        });

        it('"registerTemplatePath" will add the template path at the specified index', function() {
            var expectedPath = 'another/path',
                index = 0;

            provider.registerTemplatePath(expectedPath, index);
            var templatePaths = provider.getTemplatePaths();

            expect(templatePaths[index]).toEqual(expectedPath);
        });

        it('"clearTemplatePaths" should clear the list of registered template paths', function () {
            var templatePaths = provider.getTemplatePaths(),
                origCount = templatePaths.length;

            provider.clearTemplatePaths();
            templatePaths = provider.getTemplatePaths();

            expect(templatePaths.length).toEqual(0);
            expect(origCount).toBeGreaterThan(templatePaths.length);
        });
    });
}());
