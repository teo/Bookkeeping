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

import { tooltip } from '../../../components/common/popover/tooltip.js';
import { h, info } from '/js/src/index.js';

/**
 *
 * @param {*} detectors
 * @returns
 */
const detectorsBadges = (detectors) =>
    h(
        // '.g2.flex-row.flex-grow.flex-wrap.justify-end',
        '.grid.g3',
        { style: 'grid-template-columns: 1fr 1fr 1fr;' },
        detectors.map((runDetector) => h(
            '.flex-row.justify-center.f3.p1',
            h(
                `button.btn.shadow-level1${runDetector.selected ? '.btn-success.active' : ''}`,
                { onclick: () => runDetector.selected = !runDetector.selected },
                runDetector.name,
            ),
        )),
    );

/**
 *
 * @param {*} modalHandler
 * @returns
 */
const gaqDetectorSelectorForam = (run, modalHandler) => {
    const { detectorsQualities } = run;
    const enabled = true;

    return h(
        '.flex-column.g4.items-center',
        [
            h('.flex-column.g2.items-center', [
                h('.flex-row', [h('h2', 'GAQ detectors selection'), tooltip(info(), 'ok')]),
                h('', `For run ${run.runNumber}`),
            ]),
            detectorsBadges(detectorsQualities),
            h('button.shadow-level1.btn.btn-success.w-75#send', {
                disabled: !enabled,
                onclick: async () => {
                    modalHandler.dismiss();
                },
            }, true ? 'Send' : 'Loading data'),
        ],
    );
};

/**
 *
 * @param {Run} run run
 * @param {*} modelModel
 * @returns
 */
export const gaqDetectorSelectorModal = (run, modalModel) =>
    h(
        'button.btn.btn-primary',
        { onclick: () => modalModel.display({ content: (modalHandler) => gaqDetectorSelectorForam(run, modalHandler) }) },
        '+GAQ',
    );
