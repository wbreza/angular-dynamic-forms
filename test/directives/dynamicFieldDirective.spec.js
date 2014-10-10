(function () {
    'use strict';

    var userSchema = {
        properties: {
            firstName: { type: 'string', required: true, minLength: 3, maxLength: 20 }
        }
    };

    var userModel = {
        firstName: 'John',
    };

    describe('dynamicField directive', function () {
        var form = null, scope = null;

        beforeEach(function () {
            module('dynamic-forms');
            var template = '<dynamic-form ng-model="userModel" data-schema="userSchema"></dynamic-form>';

            inject(function ($compile, $rootScope) {
                scope = $rootScope.$new();
                scope.userModel = angular.copy(userModel);
                scope.userSchema = angular.copy(userSchema);

                form = angular.element(template);
                form = $compile(form)(scope)[0];
                scope.$digest();
            });
        });

        it('selects the template specified by the "type" on the field schema', function () {
            var fieldElements = form.querySelectorAll('.form-group');
            expect(fieldElements.length).toEqual(Object.keys(scope.userSchema.properties).length);
        });
    });
}());
