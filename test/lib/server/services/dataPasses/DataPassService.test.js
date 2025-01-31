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

const { expect } = require('chai');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const assert = require('assert');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { dataPassService } = require('../../../../../lib/server/services/dataPasses/DataPassService.js');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');

const LHC22b_apass1 = {
    id: 1,
    name: 'LHC22b_apass1',
    versions: [
        {
            id: 1,
            dataPassId: 1,
            description: 'Some random desc',
            reconstructedEventsCount: 50948694,
            outputSize: 56875682112600,
            lastSeen: 108,
            deletedFromMonAlisa: true,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22b_apass2 = {
    id: 2,
    name: 'LHC22b_apass2',
    versions: [
        {
            id: 2,
            dataPassId: 2,
            description: 'Some random desc 2',
            reconstructedEventsCount: 50848604,
            outputSize: 55765671112610,
            lastSeen: 55,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 3,
    simulationPassesCount: 1,
};

const LHC22a_apass1 = {
    id: 3,
    name: 'LHC22a_apass1',
    versions: [
        {
            id: 3,
            dataPassId: 3,
            description: 'Some random desc for apass 1',
            reconstructedEventsCount: 50848111,
            outputSize: 55761110122610,
            lastSeen: 105,
            deletedFromMonAlisa: false,
            createdAt: 1704884400000,
            updatedAt: 1704884400000,
        },
    ],
    runsCount: 4,
    simulationPassesCount: 2,
};

module.exports = () => {
    before(resetDatabaseContent);

    describe('Fetching', () => {
        it('should succesfully get by id', async () => {
            const dataPass = await dataPassService.getByIdentifier({ id: 1 });
            expect(dataPass).to.be.eql(LHC22b_apass1);
        });

        it('should succesfully get by name', async () => {
            const dataPass = await dataPassService.getByIdentifier({ name: 'LHC22a_apass1' });
            expect(dataPass).to.be.eql(LHC22a_apass1);
        });

        it('should succesfully get all data', async () => {
            const { rows: dataPasses } = await dataPassService.getAll();
            expect(dataPasses).to.be.lengthOf(3);
        });

        it('should fail when no Data Pass with given id', async () => {
            await assert.rejects(
                () => dataPassService.getOneOrFail({ id: 99999 }),
                new NotFoundError('Data pass with this id (99999) could not be found'),
            );
        });

        it('should succesfully filter data passes on names', async () => {
            const dto = {
                query: {
                    filter: {
                        names: ['LHC22b_apass1'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(1);
            expect(dataPasses[0]).to.be.eql(LHC22b_apass1);
        });

        it('should succesfully filter data passes on ids', async () => {
            const dto = {
                query: {
                    filter: {
                        ids: ['1', '2'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(2);
        });

        it('should return null when no Data Pass with given id', async () => {
            expect(await dataPassService.getByIdentifier({ id: 99999 })).to.be.null;
        });

        it('should succesfully filter data passes on lhc petriods ids', async () => {
            const dto = {
                query: {
                    filter: {
                        lhcPeriodIds: ['2'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.be.lengthOf(2);
            expect(dataPasses).to.have.deep.members([LHC22b_apass1, LHC22b_apass2]);
        });

        it('should succesfully filter data passes on simulation pass ids', async () => {
            const dto = {
                query: {
                    filter: {
                        simulationPassIds: ['1'],
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.have.all.deep.members([LHC22b_apass1, LHC22b_apass2]);
        });

        it('should succesfully sort data passes by names', async () => {
            const dto = {
                query: {
                    sort: {
                        name: 'ASC',
                    },
                },
            };
            const { rows: dataPasses } = await dataPassService.getAll(dto.query);
            expect(dataPasses).to.have.ordered.deep.members([LHC22a_apass1, LHC22b_apass1, LHC22b_apass2]);
        });
    });
    describe('Manage GAQ detectors', () => {
        const dataPassId = 3;
        it('should successfuly set GAQ detectors', async () => {
            const runNumbers = [49, 56];
            const dplDetectorIds = [4, 7];
            const data = await dataPassService.setGaqDetectors(dataPassId, runNumbers, dplDetectorIds);
            expect(data).to.be.have.all.deep.members(runNumbers
                .flatMap((runNumber) => dplDetectorIds.map((dplDetectorId) => ({ dataPassId, runNumber, dplDetectorId }))));
        });
        it('should fail to set GAQ detectors because of miaaing association', async () => {
            let errorMessage = `No association between data pass with id ${dataPassId} and following runs: 1`;
            assert.rejects(
                () => dataPassService.setGaqDetectors(dataPassId, [1], [4]),
                new BadParameterError(errorMessage),
            );
            errorMessage = `No association between runs and detectors: ${JSON.stringify([[56, 'CPV']])}`;
            assert.rejects(
                () => dataPassService.setGaqDetectors(dataPassId, [105, 56], [1]),
                new BadParameterError(errorMessage),
            );
        });
    });
};
