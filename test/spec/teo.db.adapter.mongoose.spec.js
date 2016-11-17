/*!
 * Teo.JS Mongoose adapter spec
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 11/16/16
 */

"use strict";

const
    Emitter = require("events").EventEmitter,
    MongooseAdapter = require("../../lib/teo.db.adapter.mongoose"),
    Mongoose = require("mongoose");

describe("Testing teo.db.adapter.mongoose", () => {

    let config, adapter, mongooseModelStub;

    beforeEach(() => {
        config = {
            host: "localhost",
            dbName: "test"
        };

        global.logger = {
            error: sinon.spy(),
            success: sinon.spy()
        };

        mongooseModelStub = sinon.stub(Mongoose, "model");

        adapter = new MongooseAdapter(config);

    });

    afterEach(() => {

        config = adapter = global.logger = null;
        mongooseModelStub.restore();

    });

    describe("Initialize", () => {

        it("Should create new instance", () => {

            assert.instanceOf(adapter, MongooseAdapter, "Should be instance of mongoose adapter");

        });

        it("Should apply passed config", () => {

           assert.equal(adapter.config.host, "localhost");
           assert.equal(adapter.config.dbName, "test");

        });

        it("Should create model objects", () => {

            assert.isObject(adapter.models);
            assert.isObject(adapter.schemas);

        });

    });

    it("Should add a single model", () => {

        adapter.addModel({ identity: "myModel", schema: { mySchema: true }});

        assert.deepEqual(adapter.schemas, { myModel: { mySchema: true }});

    });

    it("Should create models from passed recently schemas", () => {

        adapter.addModel({ identity: "myModel", schema: { mySchema: true }});

        assert.deepEqual(adapter.models, {});

        mongooseModelStub.returns("myModelHere");

        adapter.createModels();

        assert.deepEqual(adapter.models, {myModel: "myModelHere"});

    });

    describe("Connect & Disconnect", () => {

        let connectStub, emitter, createModelsStub, disconnectStub;

        beforeEach(() => {

            connectStub = sinon.stub(Mongoose, "connect");
            disconnectStub = sinon.stub(Mongoose, "disconnect", (cb) => {
                cb();
            });
            createModelsStub = sinon.stub(adapter, "createModels");

            emitter = new Emitter();
            Mongoose.connection = emitter;

        });

        afterEach(() => {

            connectStub.restore();
            createModelsStub.restore();
            disconnectStub.restore();
            emitter = null;

        });

        it("Should connect to database", async(function* () {

            assert.isFalse(adapter.connected);

            setImmediate(() => {
                emitter.emit("open");
            });

            yield* adapter.connect();

            assert.isTrue(connectStub.calledOnce);
            assert.equal(connectStub.args[0][0], 'mongodb://localhost/test', 'Url should be correct');

            assert.isTrue(createModelsStub.calledOnce);

            assert.isTrue(adapter.connected);
            assert.isTrue(adapter.isConnected());

        }));

        it("Should disconnect from database if connected", async(function* () {

            setImmediate(() => {
                emitter.emit("open");
            });

            yield* adapter.connect();
            yield* adapter.disconnect();

            assert.isTrue(disconnectStub.calledOnce);
            assert.isFalse(adapter.connected);
            assert.isFalse(adapter.isConnected());


        }));

    });

});