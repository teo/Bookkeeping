/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
const protobuf = require('protobufjs');
const path = require('node:path');
const { Logger } = require('../../../utilities/index.js');

const root = protobuf.loadSync(path.resolve(__dirname, '../../../../', 'proto/events.proto'));
const EventMessage = root.lookupType('events.Event');

/**
 * @callback MessageReceivedCallback
 * @param {EventMessage} message received message
 * @return {Promise<void>}
 */

const logger = Logger('ECS-ENVIRONMENT-CONSUMER');

/**
 * Consumer that consume ECS environments messages and update the database accordingly
 */
class AliEcsEventMessagesConsumer {
    /**
     * Constructor
     *
     * @param {Kafka} kafkaClient configured kafka client
     * @param {string} groupId the group id to use for the kafka consumer
     * @param {string[]} topics the list of topics to consume
     */
    constructor(kafkaClient, groupId, topics) {
        this.consumer = kafkaClient.consumer({ groupId });
        this._topics = topics;

        /**
         * @type {MessageReceivedCallback[]}
         * @private
         */
        this._listeners = [];
    }

    /**
     * Register a listener to listen on event message being received
     *
     * Listeners are called all at once, not waiting for completion before calling the next ones, only errors are caught and logged
     *
     * @param {MessageReceivedCallback} listener the listener to register
     * @return {void}
     */
    onMessageReceived(listener) {
        this._listeners.push(listener);
    }

    /**
     * Start the kafka environment consumer
     *
     * @return {Promise<void>} Resolves once the consumer started to consume messages
     */
    async start() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topics: this._topics });
        await this.consumer.run({
            eachMessage: async ({ message, topic }) => {
                const error = EventMessage.verify(message.value);
                if (error) {
                    logger.error(`Received an invalid message on "${topic}" ${error}`);
                    return;
                }

                await this._handleEnvironmentEvent(EventMessage.decode(message.value));
            },
        });
    }

    /**
     * Handle a received message
     *
     * @param {EventMessage} message the received message
     * @return {void}
     */
    async _handleEnvironmentEvent(message) {
        for (const listener of this._listeners) {
            try {
                await listener(message);
            } catch (error) {
                logger.error(`An error occurred when handling environment event: ${error.stack}`);
            }
        }
    }
}

exports.AliEcsEventMessagesConsumer = AliEcsEventMessagesConsumer;
