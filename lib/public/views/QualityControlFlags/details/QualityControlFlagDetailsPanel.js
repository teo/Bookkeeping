/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { qualityControlFlagBreadcrum } from '../common/qualityControlBreadcrumbs.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';
import { dateTimeInput } from '../../../components/common/form/inputs/dateTimeInput.js';
import spinner from '../../../components/common/spinner.js';
import { table } from '../../../components/common/table/table.js';
import { flagsVerificationsActiveColumns } from './ActiveColumns.js';
import { qcFlagsChartComponent } from '../qcFlagsVisualization/qcFlagsVisualziationComponent.js';

/**
 * Create panel with input forms for quality control flag creation
 * @param {QualityControlFlagCreationModel} detailsModel model
 * @return {Component} panel
 */
const leftPanel = (detailsModel) => {
    const commentPanel = 
        h(
            PanelComponent,
            [
                h(LabelPanelHeaderComponent, 'Comment'),
                markdownInput(
                    detailsModel.comment,
                    {
                        id: 'comment',
                        placeholder: 'Your message...',
                        // eslint-disable-next-line no-return-assign
                        oninput: (e) => detailsModel.comment = e.target.value,
                    },
                    // { height: '100%' },
                    { height: '10rem' },
                ),
            ],
        );

    const verifyButton = h('button.btn.btn-success#send', {
        onclick: () => detailsModel.verify(),
    }, 'Verify');

    const deleteButton = h('button.btn.btn-danger#send', {
        onclick: () => detailsModel.delete(),
    }, 'Delete');

    const leftPanel = [
        commentPanel,
        h(
            '.items-center.flex-row.h-50',
            { style: { 'justify-content': 'center' } },
            h('', detailsModel.verifyResult.match({
                NotAsked: () => verifyButton,
                Loading: () => spinner({ absolute: false, size: 5 }),
                Failure: (payload) => [h('', verifyButton), h('', payload.map?.((e) => e.detail))],
                Success: () => h('.success.', 'Successfuly verified'),
            })),
        ),
        h(
            '.items-center.flex-row.h-50',
            { style: { 'justify-content': 'center' } },
            deleteButton,
        ),
    ];

    return leftPanel;
};

/**
 * Render Quality Control Flags Overview Model
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const QualityControlFlagDetailPage = ({ qualityControlFlagsModel: { detailsModel } }) => {
    const run = detailsModel._observableRun.getCurrent();
    const dataPass = detailsModel._observableDataPass.getCurrent();
    const detector = detailsModel._observableDetector.getCurrent();
    const verifications = detailsModel._observableVerifications.getCurrent();

    const flag = detailsModel._observableFlag.getCurrent();

    return h('', {
        onremove: () => detailsModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g3', [
                h('h2', 'Details'),
                qualityControlFlagBreadcrum(run, dataPass, detector),
            ]),
            frontLink(h('.flex-row.items-center.g1', 'QC'), 'quality-control-flags', {
                runNumber: run.payload?.runNumber,
                dataPassId: dataPass.payload?.id,
                detectorId: detector.payload?.id,
            }, {
                class: 'btn btn-primary',
                title: 'Quality control flag overview',
            }),
        ]),
        h('.w-100.flex-column', [
            flag.match({
                Success: (payload) => run.match({
                    Success: (runPayload) => qcFlagsChartComponent([payload], runPayload, () => detailsModel.notify()),
                    Other: () => null,
                }),
                Other: () => null,
            }),

            h('.flex-row.g3.flex-grow', [
                h('.w-60.flex-column.g3', table(verifications, flagsVerificationsActiveColumns, { classes: '.table-sm' })),
                h('.w-60.flex-column.g3', leftPanel(detailsModel)),
            ]),
        ]),
    ]);
};
