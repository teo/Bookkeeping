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

const application = require('../../lib/application');
const OverviewSuite = require('../public/subsystems/overview.test');
const DetailSuite = require('../public/subsystems/detail.test');

describe('Bookkeeping', () => {
    before(async () => {
        await application.run();
        await application.connectDatabase();
    });

    after(async () => {
        await application.stop(true);
    });

    describe('Subsystems', () => {
        describe('Overview Page', OverviewSuite);
        describe('Detail Page', DetailSuite);
    });
});
