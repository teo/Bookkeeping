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

import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { h, iconWarning } from '@aliceo2/web-ui-frontend';
import { tooltip } from '../../../components/common/popover/tooltip.js';

/**
 * Display the given environment's status
 *
 * @param {Environment} environment the environment for which status should be displayed
 * @return {vnode} the resulting component
 */
export const displayEnvironmentStatus = ({ status, historyItems }) => {
    let statusCell = status;

    if (historyItems.some(({ status }) => status === 'ERROR')) {
        statusCell = h('.flex-row', h(
            '.flex-row.g2.justify-center.items-center',
            [status, tooltip(iconWarning(), h('.black', 'Environment has been in ERROR state'))],
        ));
    }

    return coloredEnvironmentStatusComponent(statusCell);
};
