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

const { AliEcsEventMessagesConsumer } = require('./consumers/AliEcsEventMessagesConsumer.js');
const { EnvironmentConfiguration } = require('../services/environment/EnvironmentConfiguration.js');
const { TriggerValue } = require('../../domain/enums/TriggerValue.js');

const ENVIRONMENT_CONSUMER_GROUP = 'bookkeeping-environment';
const ENVIRONMENT_TOPICS = ['aliecs.environment'];

const RUN_CONSUMER_GROUP = 'bookkeeping-run';
const RUN_TOPICS = ['aliecs.run'];

/**
 * Utility synchronizing AliECS data into bookkeeping, listening to kafka
 */
class AliEcsSynchronizer {
    /**
     * Constructor
     *
     * @param {object} services services instances
     * @param {Kafka} services.kafkaClient configured kafka client
     * @param {EnvironmentService} services.environmentService instance of EnvironmentService
     * @param {RunService} services.runService instance of RunService
     * @param {Logger} [services.logger] an optional logger to log errors
     */
    constructor(services) {
        const { kafkaClient, environmentService, runService, logger = null } = services;
        this.logger = logger;

        this.ecsEnvironmentsConsumer = new AliEcsEventMessagesConsumer(kafkaClient, ENVIRONMENT_CONSUMER_GROUP, ENVIRONMENT_TOPICS);
        this.ecsEnvironmentsConsumer.onMessageReceived(async (eventMessage) => {
            const { timestamp, environmentEvent: { environmentId, state, message, vars } } = eventMessage;

            await environmentService.createOrUpdateEnvironment(
                environmentId,
                { timestamp: timestamp.toNumber(), status: state, statusMessage: message },
                vars,
            );
        });

        this.ecsRunConsumer = new AliEcsEventMessagesConsumer(kafkaClient, RUN_CONSUMER_GROUP, RUN_TOPICS);
        this.ecsRunConsumer.onMessageReceived(async (eventMessage) => {
            const { timestamp, runEvent: { environmentId, runNumber, state, transition } } = eventMessage;

            if (state === 'CONFIGURED' && transition === 'START_ACTIVITY') {
                const { rawConfiguration } = await environmentService.get(environmentId);

                /**
                 * @type {Partial<Run>}
                 */
                const newRun = {
                    runNumber,
                    environmentId,
                    timeO2Start: timestamp.toNumber(),
                };

                try {
                    const configuration = new EnvironmentConfiguration(environmentId, JSON.parse(rawConfiguration), logger);
                    const detectors = configuration.getArray('detectors');
                    const hosts = configuration.getArray('hosts');

                    const ctp = configuration.getBool('trg_global_run_enabled');
                    const triggerEnabled = configuration.getBool('trg_enabled');
                    let triggerValue = TriggerValue.Off;
                    if (triggerEnabled) {
                        triggerValue = ctp ? TriggerValue.CTP : TriggerValue.LTU;
                    }

                    newRun.detectors = detectors;
                    newRun.nDetectors = detectors?.length ?? 0;

                    newRun.runType = configuration.getString('run_type');
                    newRun.dd_flp = configuration.getBool('dd_enabled');
                    newRun.dcs = configuration.getBool('dcs_enabled');
                    newRun.epn = configuration.getBool('odc_enabled');
                    newRun.triggerValue = triggerValue;
                    newRun.pdpConfigOption = configuration.getString('pdp_config_option');
                    newRun.pdpTopologyDescriptionLibraryFile = configuration.getString('pdp_topology_description_library_file');
                    newRun.pdpWorkflowParameters = configuration.getString('pdp_workflow_parameters');
                    newRun.tfbDdMode = configuration.getString('tfb_dd_mode');
                    newRun.lhcPeriod = configuration.getString('lhc_period');
                    newRun.odcTopologyFullName = configuration.getString('odc_topology_fullname');
                    newRun.pdpBeamType = configuration.getString('pdp_beam_type');
                    newRun.epnTopology = configuration.getString('odc_topology');
                    newRun.odcTopologyFullName = configuration.getString('odc_n_epns');
                    newRun.nFlps = (hosts?.length ?? 0) + (ctp ? 1 : 0); // Add 1 for ctp flp which is not in hosts
                    newRun.readoutCfgUri = configuration.getString('readout_cfg_uri');
                } catch (e) {
                    this.logger.error(`Invalid configuration for environment ${environmentId}, unable to use it for run ${runNumber}`);
                }

                await runService.create(newRun);
            }

            if (state === 'RUNNING' && transition === 'STOP_ACTIVITY') {
                await runService.update({ runNumber }, { runPatch: { timeO2End: timestamp.toNumber() } });
            }
        });

        this.ecsTrgIntegratedServiceConsumer = new AliEcsEventMessagesConsumer();
        this.ecsTrgIntegratedServiceConsumer.onMessageReceived(async (eventMessage) => {
            const { timestamp, integratedServiceEvent: {  } } = eventMessage;
        })
    }

    /**
     * Start the synchronization process
     *
     * @return {void}
     */
    start() {
        this.logger.info('Starting to consume AliECS messages');
        this.ecsEnvironmentsConsumer.start()
            .catch((e) => this.logger?.error(`An error occurred when starting ECS environment consumer: ${e.stackTrace}`));

        this.ecsRunConsumer.start()
            .catch((e) => this.logger?.error(`An error occurred when starting ECS runs consumer: ${e.stackTrace}`));
    }
}

exports.AliEcsSynchronizer = AliEcsSynchronizer;
