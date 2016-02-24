/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AlexaSkill = require('./AlexaSkill'),
    eventHandlers = require('./eventHandlers'),
    intentHandlers = require('./intentHandlers');

var APP_ID = 'amzn1.echo-sdk-ams.app.bd334700-5ae8-452f-af89-9daa178197bb';//replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var skillContext = {};

/**
 * ScoreKeeper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Jarvis = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
Jarvis.prototype = Object.create(AlexaSkill.prototype);
Jarvis.prototype.constructor = Jarvis;

eventHandlers.register(Jarvis.prototype.eventHandlers, skillContext);
intentHandlers.register(Jarvis.prototype.intentHandlers, skillContext);

module.exports = Jarvis;
