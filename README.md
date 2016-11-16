# teo-db-adapter-mongoose
Mongoose adapter for [Teo.JS](https://github.com/Antyfive/teo.js).
## Usage Example
```javascript
const MongooseAdapter = require("teo-db-adapter-mongoose");
const adapter = new MongooseAdapter({
  // this config is usually set in Teo.JS config, so we should support the current signature of other APIs
  adapterConfig: {
    host: "localhost",
    dbName: "test"
  }
});
```
Example of the real model, which can be created in Teo.JS application.
```javascript
const identity = "test";
const Schema = require('mongoose').Schema;

const schema = new Schema({
    title:  String,
    author: String,
    body:   String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs:  Number
    }
});

module.exports = {identity, schema};
```
Each model should have **identity**, and **schema** properties. To add a model directly via this API, call `adapter.addModel({idenity: 'users', schema: new Mongoose.Schema({/**/})})`.

