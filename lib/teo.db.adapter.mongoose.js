/*!
 * Mongoose adapter implementation
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 11/16/16
 */

"use strict";

const BaseAdapter = require("teo-db-adapter");
const mongoose = require("mongoose");

// Use native promises
mongoose.Promise = global.Promise;

module.exports = class TeoJSMongooseAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
    }

    applyConfig(config) {
        this.config = Object.assign({}, config);
    }

    createModelsObject() {  // @base constructor method
        this.models = {};
    }

    /**
     * Adds model
     * @param {Object} model
     */
    addModel(model) {
        const {identity, schema} = model;
        this.models[identity] = mongoose.model(identity, schema);
    }
    getConnectionUrl() {
        const {host, dbUser, dbPass, port, dbName } = this.config;
        let url = 'mongodb://';
        // mongodb://dbuser:dbpass@host:port/dbname
        if (dbUser) {
            url += `${dbUser}`;
        }
        if (dbPass) {
            url += `:${dbPass}`;   
        }
        if (host) {
            url += dbUser && dbPass ? `@${host}` : host;
        }
        if (port) {
            url += `:${port}`;
        }
        if (dbName) {
            url += `/${dbName}`;
        }
        return url;
    }

    * connect() {
        const url = this.url = this.getConnectionUrl();

        mongoose.connect(url);

        const db = mongoose.connection;

        db.on("error", logger.error.bind(logger, 'connection error:'));

        yield function(callback) {
            db.once("open", callback);
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

    // getters ---- ---- ---- ---- ---- ----
    get modelsObject() {
        return this.models;
    }
};