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
