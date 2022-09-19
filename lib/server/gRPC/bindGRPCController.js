/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { extractFieldsConverters } = require('./services/protoParsing/extractFieldsConverters.js');

/**
 * Adapt gRPC service method to controller handler
 *
 * @param {function} controllerHandler the controller handler corresponding to the gRPC service
 * @param {FieldConverter[]} requestFieldsConverters the list of request field converters
 * @param {FieldConverter[]} responseFieldsConverters the list of response field converters
 * @return {function} the function's adapter
 */
const adaptGrpcServiceMethodToControllerHandler = (
    controllerHandler,
    requestFieldsConverters,
    responseFieldsConverters,
) => async ({ request }) => {
    for (const { path, name, toJs } of requestFieldsConverters) {
        let subject = request;
        for (const pathPart of path) {
            subject = (subject || [])[pathPart];
        }
        if (subject) {
            const grpcValue = subject[name];
            subject[name] = toJs(grpcValue);
        }
    }

    const response = await controllerHandler(request);

    if (!response) {
        return response;
    }

    // Convert values to enums for response
    for (const { path, name, fromJs } of responseFieldsConverters) {
        let subject = response;
        for (const pathPart of path) {
            subject = (subject || [])[pathPart];
        }
        if (subject) {
            const jsValue = subject[name];
            subject[name] = fromJs(jsValue);
        }
    }

    return response;
};

/**
 * Adapt a controller to be used as implementation for a given service definition
 *
 * For the methods of the given controller that match service methods, the controller's method will be used to handle gRPC request, the call's
 * request will be provided as unique parameter when calling controller's function (it will match the request type specified in the proto) and
 * the controller's response will be returned to the caller (waiting for promises if it applies)
 *
 * Enums are converted from gRPC values to js values using {@see fromGRPCEnum} and conversely using {@see toGRPCEnum}
 *
 * @param {Object} serviceDefinition the definition of the service to bind
 * @param {Object} implementation the controller instance to use as implementation
 * @param {Array<function|{process:function}>} preProcessors a list of functions (or class containing a `process` function) that need to be run
 *     against the call before the implementation
 * @param {Map<string, Object>} absoluteMessagesDefinitions the absolute messages definitions
 * @return {Object} the adapter to provide as gRPC service implementation
 */
const bindGRPCController = (serviceDefinition, implementation, preProcessors, absoluteMessagesDefinitions) => {
    const serviceImplementation = {};

    for (const [methodName, { requestType, responseType, path }] of Object.entries(serviceDefinition)) {
        const requestEnumsPaths = extractFieldsConverters(requestType.type, absoluteMessagesDefinitions);
        const responseEnumsPaths = extractFieldsConverters(responseType.type, absoluteMessagesDefinitions);

        serviceImplementation[methodName] = async (call, callback) => {
            const adapter = adaptGrpcServiceMethodToControllerHandler(
                implementation[methodName].bind(implementation),
                requestEnumsPaths,
                responseEnumsPaths,
            );

            try {
                for (const preProcessor of preProcessors || []) {
                    await typeof preProcessor === 'function' ? preProcessor(call) : preProcessor.process(call);
                }

                const response = adapter(call);

                if (response === null) {
                    callback(new Error(`Controller for ${path} returned a null response`));
                } else {
                    callback(null, response);
                }
            } catch (error) {
                callback(error);
            }
        };
    }

    return serviceImplementation;
};

exports.bindGRPCController = bindGRPCController;
