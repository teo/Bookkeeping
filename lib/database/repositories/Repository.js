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

const { dataSource } = require('../DataSource.js');
const { QueryBuilder } = require('../utilities/QueryBuilder.js');

/**
 * Sequelize implementation of the Repository.
 */
class Repository {
    /**
     * Creates a new `Repository` instance.
     *
     * @param {Object} model The database model to use.
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Returns the total number of entities.
     *
     * @param {object|QueryBuilder} [findQuery] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<Number>} Promise object representing the total number of entities.
     */
    async count(findQuery) {
        if (!findQuery) {
            findQuery = dataSource.createQueryBuilder();
        }

        if (findQuery instanceof QueryBuilder) {
            findQuery = findQuery.toImplementation();
        }

        return this.model.count(findQuery);
    }

    /**
     * Returns all entities.
     *
     * @param {Object|QueryBuilder} [findQuery={}] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<array>} Promise object representing the full mock data
     */
    async findAll(findQuery = {}) {
        return this.model.findAll(findQuery instanceof QueryBuilder ? findQuery.toImplementation() : findQuery);
    }

    /**
     * Returns all entities.
     *
     * @param {object|QueryBuilder} [findQuery] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAndCountAll(findQuery) {
        if (!findQuery) {
            findQuery = dataSource.createQueryBuilder();
        }

        if (findQuery instanceof QueryBuilder) {
            findQuery.set('distinct', true);
            findQuery = findQuery.toImplementation();
        }

        return this.model.findAndCountAll(findQuery);
    }

    /**
     * Returns a specific entity.
     *
     * @param {Object|QueryBuilder} [findQuery] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<Object>|null} Promise object representing the full mock data
     */
    async findOne(findQuery = {}) {
        if (findQuery instanceof QueryBuilder) {
            findQuery = findQuery.toImplementation();
        }
        findQuery.limit = 1;
        return this.model.findOne(findQuery);
    }

    /**
     * Find a given entity or create it if it does not exist
     *
     * Do not use query builder! It creates a where clause with `[Op.and]` that is not compatible with the creation
     *
     * @param {Partial<Object>} criteria the part of the entity to find/create that should be enough to find it distinctly
     * @returns {Promise<Object>} resolves with the found or created entity
     */
    async findOneOrCreate(criteria) {
        const [ret] = await this.model.findOrCreate({
            where: criteria,
            limit: 1,
        });
        return ret;
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the just inserted this.model.
     */
    async insert(entity) {
        return this.model.create(entity);
    }

    /**
     * Insert multiple entities
     *
     * @param {*[]} entities list of entities to be inserted
     * @return {Promise<*[]>} promise
     */
    async insertAll(entities) {
        return this.model.bulkCreate(entities);
    }

    /**
     * Removes all entities which can be found with provided findQuery
     *
     * @param {Object|QueryBuilder} [findQuery] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<*[]>} promise with list of removed entities
     */
    async removeAll(findQuery) {
        if (findQuery instanceof QueryBuilder) {
            findQuery = findQuery.toImplementation();
        }

        const entities = await this.findAll(findQuery);
        if (entities?.length > 0) {
            await this.model.destroy(findQuery);
        }

        return entities;
    }

    /**
     * Removes a specific entity.
     *
     * @param {Object|QueryBuilder} [findQuery] the find query (see sequelize findOne options) or a find query builder
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async removeOne(findQuery) {
        if (findQuery instanceof QueryBuilder) {
            findQuery = findQuery.toImplementation();
        }
        findQuery.limit = 1;

        const entity = await this.findOne(findQuery);
        if (entity) {
            await this.model.destroy(findQuery);
        }

        return entity;
    }

    /**
     * Apply a patch on a given model and save the model to the database
     *
     * @param {Object} model the model on which to apply the patch
     * @param {Object} patch the patch to apply
     * @return {Promise<void>} promise that resolves when the patch has been applied
     */
    async update(model, patch) {
        return model.update(patch);
    }

    /**
     * Apply a patch on set of entities defined by findQuery
     *
     * @param {Object} patch the patch to apply
     * @param {Object|QueryBuilder} findQuery the find query (see sequelize findOne options) or a find query builder
     * @return {Promise<void>} promise that resolves when the patch has been applied
     */
    async updateAll(patch, findQuery) {
        if (findQuery instanceof QueryBuilder) {
            findQuery = findQuery.toImplementation();
        }

        return this.model.update(patch, findQuery);
    }

    /**
     * Upsert entity in db
     * @param {Object} entity entity
     * @return {Promise<[Model, boolean]>} upserted instance and information whether created new instance
     */
    async upsert(entity) {
        return this.model.upsert(entity);
    }
}

module.exports = Repository;
