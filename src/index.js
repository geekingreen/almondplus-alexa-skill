/**
 * This sample demonstrates a simple driver  built against the Alexa Lighting Api.
 * For additional details, please refer to the Alexa Lighting API developer documentation
 * https://developer.amazon.com/public/binaries/content/assets/html/alexa-lighting-api.html
 */
var config = require('./config');
var https = require('https');
var REMOTE_CLOUD_BASE_PATH = config.basePath;
var REMOTE_CLOUD_HOSTNAME = config.hostname;

/**
 * Main entry point.
 * Incoming events from Alexa Lighting APIs are processed via this method.
 */
exports.handler = function(event, context) {

    log('Input', event);

    switch (event.header.namespace) {

        /**
         * The namespace of "Discovery" indicates a request is being made to the lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         * can use the accessToken that is made available as part of the payload to determine
         * the customer.
         */
        case 'Alexa.ConnectedHome.Discovery':
            handleDiscovery(event, context);
            break;

            /**
             * The namespace of "Control" indicates a request is being made to us to turn a
             * given device on, off or brighten. This message comes with the "appliance"
             * parameter which indicates the appliance that needs to be acted on.
             */
        case 'Alexa.ConnectedHome.Control':
            handleControl(event, context);
            break;

            /**
             * We received an unexpected message
             */
        default:
            log('Err', 'No supported namespace: ' + event.header.namespace);
            context.fail('Something went wrong');
            break;
    }
};

/**
 * This method is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given
 * customer.
 */
function handleDiscovery(event, context) {

    var accessToken = event.payload.accessToken.trim();

    var options = {
        hostname: REMOTE_CLOUD_HOSTNAME,
        port: 443,
        path: REMOTE_CLOUD_BASE_PATH + '/switches?access_token=' + accessToken,
        headers: {
            accept: '*/*'
        }
    };

    var serverError = function (e) {
        log('Error', e.message);
        /**
         * Craft an error response back to Alexa Smart Home Skill
         */
        context.fail(generateControlError('DiscoveryFail', 'DEPENDENT_SERVICE_UNAVAILABLE', 'Unable to connect to server'));
    };

    var callback = function(response) {
        var str = '';

        response.on('data', function(chunk) {
            str += chunk.toString('utf-8');
        });

        response.on('end', function() {
            /**
             * Test the response from remote endpoint (not shown) and craft a response message
             * back to Alexa Smart Home Skill
             */
            var headers = {
                namespace: 'Alexa.ConnectedHome.Discovery',
                name: 'DiscoverAppliancesResponse',
                payloadVersion: '2'
            };
            var payloads = {
                discoveredAppliances: JSON.parse(str)
            };
            var result = {
                header: headers,
                payload: payloads
            };
            log('Discovery', result);
            context.succeed(result);
        });

        response.on('error', serverError);
    };

    /**
     * Make an HTTPS call to remote endpoint.
     */
    https.get(options, callback)
        .on('error', serverError).end();
}

/**
 * Control events are processed here.
 * This is called when Alexa requests an action (IE turn off appliance).
 */
function handleControl(event, context) {

    log('event', event.payload);
    /**
     * Fail the invocation if the header is unexpected. This example only demonstrates
     * turn on / turn off, hence we are filtering on anything that is not SwitchOnOffRequest.
     */
    if (event.header.namespace != 'Alexa.ConnectedHome.Control' || !(/Turn(?:On|Off)Request/i).test(event.header.name)) {
        context.fail(generateControlError('SwitchOnOffRequest', 'UNSUPPORTED_OPERATION', 'Unrecognized operation'));
    }

    if (event.header.namespace === 'Alexa.ConnectedHome.Control' && (/Turn(?:On|Off)Request/i).test(event.header.name)) {

        /**
         * Retrieve the appliance id and accessToken from the incoming message.
         */
        var applianceId = event.payload.appliance.applianceId;
        var accessToken = event.payload.accessToken.trim();
        var turnOn = (/on/i).test(event.header.name);
        log('applianceId', applianceId);

        /**
         * Make a remote call to execute the action based on accessToken and the applianceId and the switchControlAction
         * Some other examples of checks:
         *	validate the appliance is actually reachable else return TARGET_OFFLINE error
         *	validate the authentication has not expired else return EXPIRED_ACCESS_TOKEN error
         * Please see the technical documentation for detailed list of errors
         */
        var path = '';
        if (turnOn) {
            path = REMOTE_CLOUD_BASE_PATH + '/switches/' + applianceId + '/on?access_token=' + accessToken;
        } else {
            path = REMOTE_CLOUD_BASE_PATH + '/switches/' + applianceId + '/off?access_token=' + accessToken;
        }

        var options = {
            hostname: REMOTE_CLOUD_HOSTNAME,
            port: 443,
            path: path,
            headers: {
                accept: '*/*'
            }
        };

        log('options', options);

        var serverError = function (e) {
            log('Error', e.message);
            /**
             * Craft an error response back to Alexa Smart Home Skill
             */
            context.fail(generateControlError('SwitchOnOffRequest', 'DEPENDENT_SERVICE_UNAVAILABLE', 'Unable to connect to server'));
        };

        var callback = function(response) {
            var str = '';

            response.on('data', function(chunk) {
                str += chunk.toString('utf-8');
            });

            response.on('end', function() {
                /**
                 * Test the response from remote endpoint (not shown) and craft a response message
                 * back to Alexa Smart Home Skill
                 */
                log('Almond Response', str);
                var headers = {
                    namespace: 'Alexa.ConnectedHome.Control',
                    name: turnOn ? 'TurnOnConfirmation' : 'TurnOffConfirmation',
                    payloadVersion: '1'
                };
                var payloads = {
                    success: true
                };
                var result = {
                    header: headers,
                    payload: payloads
                };
                log('Control Response', result);
                context.succeed(result);
            });

            response.on('error', serverError);
        };

        /**
         * Make an HTTPS call to remote endpoint.
         */
        https.get(options, callback)
            .on('error', serverError).end();
    }
}

/**
 * Utility functions.
 */
function log(title, msg) {
    console.log('*************** ' + title + ' *************');
    console.log(msg);
    console.log('*************** ' + title + ' End*************');
}

function generateControlError(name, code, description) {
    var headers = {
        namespace: 'Alexa.ConnectedHome.Control',
        name: name,
        payloadVersion: '2'
    };

    var payload = {
        exception: {
            code: code,
            description: description
        }
    };

    var result = {
        header: headers,
        payload: payload
    };

    return result;
}
