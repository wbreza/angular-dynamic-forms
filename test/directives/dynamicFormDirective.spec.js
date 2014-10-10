(function () {
    'use strict';

    var userSchema = {
        properties: {
            firstName: { type: 'string', required: true, minLength: 3, maxLength: 20 },
            lastName: { type: 'string', required: true, minLength: 3, maxLength: 20 },
            email: { type: 'string', format: 'email', required: true },
            birthDate: { type: 'string', format: 'date' },
            age: { type: 'integer', minimum: 0, maximum: 110 }
        }
    };

    var userModel = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jon@doe.me',
        age: 23
    };

    describe('dynamicForm directive', function () {
        var scope = null,
            form = null;

        beforeEach(function () {
            module('dynamic-forms');
            var template = '<dynamic-form ng-model="userModel" data-schema="userSchema"><p class="custom-content">Transclude me please</p></dynamic-form>';

            inject(function ($compile, $rootScope) {
                scope = $rootScope.$new();
                scope.userModel = angular.copy(userModel);
                scope.userSchema = angular.copy(userSchema);

                form = angular.element(template);
                $compile(form)(scope);
                scope.$digest();
            });
        });

        it('creates a dynamic form element', function () {
            var htmlForm = form.find('form');

            expect(htmlForm.length).toEqual(1);
        });

        it('creates a dynamic form with a field for each field defined within the schema', function () {
            var fieldElements = form[0].querySelectorAll('.form-group');
            expect(fieldElements.length).toEqual(Object.keys(userSchema.properties).length);
        });

        it('transcludes content specified within the dynamic-form tag', function () {
            var transcludedContent = form[0].querySelector('.custom-content');
            expect(transcludedContent).toBeDefined();
            expect(transcludedContent.tagName).toEqual('P');
        });
    });

    describe('dynamicForm controller', function () {
        var controller = null, scope = null;

        beforeEach(function() {
            module('dynamic-forms');

            inject(function($controller, $rootScope, dynamicTemplates) {
                scope = $rootScope.$new();
                scope.schema = angular.copy(userSchema);
                scope.model = angular.copy(userModel);
                scope.submit = function() {

                };

                controller = $controller('dynamicFormController', { $scope: scope, dynamicTemplates: dynamicTemplates });
            });
        });

        it('defines a "getFieldTemplate" function', function() {
            expect(controller.getFieldTemplate).toBeDefined();
        });

        it('gets the correct template when "fieldType" is specified', function() {
            var template = controller.getFieldTemplate('checkbox');
            expect(template.indexOf('checkbox') > -1).toBeTruthy();
        });

        it('gets the correct template when "fieldType" is not specified, but "format" is defined on the form schema', function() {
            scope.schema.format = 'horizontal';

            var template = controller.getFieldTemplate(null);
            expect(template.indexOf('col-sm-10') > -1).toBeTruthy();
        });

        it('gets the default template when fieldType is not specified', function() {
            var template = controller.getFieldTemplate(null);
            expect(template.indexOf('form-group') > -1).toBeTruthy();
            expect(template.indexOf('col-sm-10') > -1).not.toBeTruthy();
            expect(template.indexOf('checkbox') > -1).not.toBeTruthy();
        });

        it('defines an "onSubmit" function on the scope', function() {
            expect(controller.onSubmit).toBeDefined();
        });

        it('calls the registered submit expression when "onSubmit" is executed', function() {
            spyOn(scope, 'submit');

            controller.onSubmit();
            expect(scope.submit).toHaveBeenCalled();
        });
    });
}());
