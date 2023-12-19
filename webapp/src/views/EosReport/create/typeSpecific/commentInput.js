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

import { h } from '@aliceo2/web-ui-frontend';

/**
 * Returns a labelled comment input component
 *
 * @param {string|undefined} value the current input value
 * @param {function} onChange function called with the new value if input value change
 * @return {Component} the input component
 */
export const commentInput = (value, onChange) => h('li', [
    h('label', 'Comments'),
    h(
        'textarea.form-control.v-resize',
        {
            rows: 1,
            style: 'resize: vertical',
            onchange: (e) => onChange(e.target.value),
        },
        value || '',
    ),
]);
