/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

var switchUrl = 'https://nas.geekingreen.com/almond/api/switches';
var request = require('./request');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.ToggleSwitchIntent = function (intent, session, response) {
        var accessToken = session.user.accessToken,
            deviceName = intent.slots.DeviceName,
            action = intent.slots.Action,
            queryString = '?auth_token=' + accessToken;

        queryString += '&device_name=' + deviceName.value;
        queryString += '&action=' + action.value;

        request(switchUrl + queryString, function (err, data) {
            if (err) {
                console.log(err);
                response.tell('Hmmm, I\'m having trouble communicating with your Almond...');
            } else {
                response.tell('OK');
            }
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can ask me to turn on and off your lights.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can ask me to turn on and off your lights.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
