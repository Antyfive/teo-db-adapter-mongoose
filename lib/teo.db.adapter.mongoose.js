/*!
 * Mongoose adapter implementation
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 11/16/16
 */

"use strict";

const BaseAdapter = require("teo-db-adapter");
const mongoose = require("mongoose");

module.exports = class TeoJSMongooseAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
    }

    applyConfig(config) {
        this.config = {
            host: config.mongooseAdapter.host,
            dbName: config.mongooseAdapter.dbName
        }
    }

    createModelsObject() {  // @base constructor method
        this.models = {};
        this.schemas = {};
    }

    /**
     * Adds model
     * @param {Object} model
     */
    addModel(model) {
        const {identity, schema} = model;
        this.schemas[identity] = schema;
    }

    * connect() {
        const {host, dbName} = this.config;
        const url = this.url = `mongodb://${host}/${dbName}`;

        this.createModels();

        mongoose.connect(url);

        const db = mongoose.connection;

        db.on("error", logger.error.bind(logger, 'connection error:'));

        yield function(callback) {
            db.once('open', callback);
        };
        // we're connected!
        logger.success(`Mongoose connected to ${url}`);
        this.connected = true;
    }

    * disconnect() {
        if (this.connected === false) {
            console.warn("Mongoose isn't connected to disconnect!");
            return;
        }

        yield function(callback) {
            mongoose.disconnect(callback);
        };
        logger.success(`Mongoose disconnected from ${this.url}`);
        this.connected = false;
        this.url = null;
    }

    isConnected() {
        return this.connected;
    }

    /**
     * Converts schemas into models
     */
    createModels() {
        Object.keys(this.schemas).forEach((identity) => {
            this.models[identity] = mongoose.model(identity, this.schemas[identity]);
        });
    }

    // getters ---- ---- ---- ---- ---- ----
    get modelsObject() {
        return this.models;
    }
};