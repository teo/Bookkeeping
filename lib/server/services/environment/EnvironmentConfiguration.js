/**
 * Represents the configuration of an environment
 */
class EnvironmentConfiguration {
    /**
     * Constructor
     *
     * @param {string} environmentId the id of the environment
     * @param {Object<string, string>} rawConfiguration the raw configuration object
     * @param {Logger} logger a logger instance
     */
    constructor(environmentId, rawConfiguration, logger) {
        this._environmentId = environmentId;
        this._rawConfiguration = rawConfiguration;
        this._logger = logger;
    }

    /**
     * Return a configuration value as string
     *
     * @param {string} key the key of the value to extract
     * @return {string|undefined} the value
     */
    getString(key) {
        return this._rawConfiguration[key];
    }

    /**
     * Return a configuration value as boolean
     *
     * @param {string} key the key of the value to extract
     * @return {boolean|undefined} the value
     */
    getBool(key) {
        const value = this.getJsonParsed(key);
        if (value !== undefined && typeof value !== 'boolean') {
            this._logger.error(`Invalid configuration for ${key} expected boolean got ${value}`);
        }
        return value;
    }

    /**
     * Return a configuration value as an array
     *
     * @param {string} key the key of the value to extract
     * @return {array|undefined} the value
     */
    getArray(key) {
        const value = this.getJsonParsed(key);
        if (value !== undefined && !Array.isArray(value)) {
            this._logger.error(`Invalid configuration for ${key} expected array got ${value}`);
        }
        return value;
    }

    /**
     * Return the JSON parsed value of a configuration value
     *
     * @param {string} key the key of the value to extract
     * @return {*} the JSON parsed value
     */
    getJsonParsed(key) {
        const rawValue = this._rawConfiguration[key] || undefined;
        if (rawValue === undefined) {
            return rawValue;
        }

        try {
            return JSON.parse(key);
        } catch (_) {
            this._logger.error(`Failed to parse ${key} as JSON`);
            return undefined;
        }
    }
}

exports.EnvironmentConfiguration = EnvironmentConfiguration;