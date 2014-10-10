(function () {
    'use strict';

    describe('jsonSchema service', function () {
        var service,
            testSchema = {
                id: 'http://json-schema.org/demo/foobar',
                type: 'object',
                properties: {
                    bar: { type: 'string' }
                }
            },
            schemaWithLocalRef = {
                type: 'object',
                properties: {
                    foo: { $ref: '#/definitions/foo' },
                    bar: { $ref: '#/definitions/bar' }
                },
                definitions: {
                    foo: {
                        type: 'object',
                        properties: {
                            a: { type: 'string' },
                            b: { type: 'string' }
                        }
                    },
                    bar: {
                        properties: {
                            c: { type: 'string' },
                            d: { type: 'string' }
                        }
                    }
                }
            };

        beforeEach(function () {
            module('dynamic-forms');
            inject(function (jsonSchema) {
                service = jsonSchema;
            });
        });

        it('should define a isComplex function', function () {
            expect(service.isComplex).toBeDefined();
        });

        it('should define a "register" function', function () {
            expect(angular.isFunction(service.register)).toBeTruthy();
        });

        it('should define a "get" function', function () {
            expect(angular.isFunction(service.get)).toBeTruthy();
        });

        it('should define an "extend" function', function () {
            expect(angular.isFunction(service.extend)).toBeTruthy();
        });

        it('should define a "clear" function', function () {
            expect(angular.isFunction(service.clear)).toBeTruthy();
        });

        it('isComplex returns false for emtpy object', function () {
            expect(service.isComplex({})).not.toBeTruthy();
        });

        it('isComplex returns false for simple types', function () {
            expect(service.isComplex({ type: 'string' })).not.toBeTruthy();
        });

        it('isComplex returns true when type="object"', function () {
            expect(service.isComplex({ type: 'object' })).toBeTruthy();
        });

        it('isComplex returns true when schema has properties defined', function () {
            expect(service.isComplex({ properties: { firstName: { type: 'string' } } })).toBeTruthy();
        });

        it('"register" should register a new schema in the schema store when it has an "id" property defined', function () {
            service.clear();
            service.register(testSchema);

            var schema = service.get(testSchema.id);

            expect(schema).toBeDefined();
            expect(schema).toBe(testSchema);
        });

        it('"register" should fail when the specified schema does not contain an "id" property', function () {
            var badSchema = {},
                exceptionThrown = false;

            try {
                service.register(badSchema);
            } catch (e) {
                exceptionThrown = true;
            }

            expect(exceptionThrown).toBeTruthy();
        });

        it('"get" returns undefined when a schema cannot be found', function () {
            var schema = service.get('foobar');
            expect(schema).not.toBeDefined();
        });

        it('"clear" clears the schema store', function () {
            service.clear();
            service.register(testSchema);

            var schema = service.get(testSchema.id);

            expect(schema).toBeDefined();

            service.clear();
            schema = service.get(testSchema.id);
            expect(schema).not.toBeDefined();
        });

        it('"extend" extends a schema with a $ref pointer with the schema found in the schema store', function () {
            var newSchema = { $ref: testSchema.id };

            service.clear();
            service.register(testSchema);
            service.extend(newSchema);

            expect(newSchema.id).toEqual(testSchema.id);
            expect(newSchema.type).toEqual(testSchema.type);
            expect(newSchema.properties).toBe(testSchema.properties);
        });

        it('"extend" extends a schema from the root document when the $ref pointer is a local path', function () {
            service.extend(schemaWithLocalRef.properties.foo, schemaWithLocalRef);

            expect(schemaWithLocalRef.properties.foo.properties).toBe(schemaWithLocalRef.definitions.foo.properties);
        });

        it('"extend" does not extend a schema the the $ref pointer is not found', function() {
            var badSchema = { $ref: '#/definitions/notfound' };

            service.extend(badSchema, schemaWithLocalRef);
            expect(Object.keys(badSchema).length).toEqual(1);
        });

        it('"extend" does not extend a schema that does not have a $ref pointer', function() {
            var badSchema = { type: 'object' };
            service.extend(badSchema);
            expect(Object.keys(badSchema).length).toEqual(1);
        });
    });
}());
