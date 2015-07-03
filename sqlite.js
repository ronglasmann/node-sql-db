
function Connection(file) {
    var sqlite3 = require("sqlite3").verbose();

    var sdb = new sqlite3.Database(file);
    sdb.on("trace", function(sql) {
        console.log(sql);
    });

    sdb.serialize();

    //return sdb;
    this._sqldb = sdb;
}

Connection.prototype.execute = function () {
    if (arguments.length < 1) {
        throw new Error("execute(..) requires at least one argument");
    } else if (arguments.length < 2) {
        this._sqldb.run(arguments[0]);
    } else if (arguments.length < 3) {
        this._sqldb.run(arguments[0], arguments[1]);
    } else if (arguments.length < 4) {
        this._sqldb.run(arguments[0], arguments[1], arguments[2]);
    } else {
        var params = [];
        for (var i = 1; i < arguments.length - 1; i++) {
            params.push(arguments[i]);
        }
        this._sqldb.run(arguments[0], params, arguments[arguments.length - 1]);
    }
};

Connection.prototype.query = function () {
    if (arguments.length < 1) {
        throw new Error("query(..) requires at least one argument");
    } else if (arguments.length < 2) {
        this._sqldb.all(arguments[0]);
    } else if (arguments.length < 3) {
        this._sqldb.all(arguments[0], arguments[1]);
    } else if (arguments.length < 4) {
        this._sqldb.all(arguments[0], arguments[1], arguments[2]);
    } else {
        var params = [];
        for (var i = 1; i < arguments.length - 1; i++) {
            params.push(arguments[i]);
        }
        this._sqldb.all(arguments[0], params, arguments[arguments.length - 1]);
    }
};

Connection.prototype.close = function (callback) {
    this._sqldb.close(callback);
};

exports = module.exports = {};
exports.Connection = Connection;
