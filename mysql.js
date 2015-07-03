
function Connection(host, user, password, database) {

    var mysql      = require("mysql");

    var bootstrap = mysql.createConnection({
        host     : host,
        user     : user,
        password : password,
    });
    bootstrap.connect();
    bootstrap.query("create database if not exists " + database);
    bootstrap.end();

    var connection = mysql.createConnection({
        host     : host,
        user     : user,
        password : password,
        database : database
    });

    connection.connect();

    this._conn = connection;
}

Connection.prototype.execute = function () {
    console.log(arguments);
    if (arguments.length < 1) {
        throw new Error("execute(..) requires at least one argument");
    } else if (arguments.length < 2) {
        this._conn.query(arguments[0]);
    } else if (arguments.length < 3) {
        this._conn.query(arguments[0], arguments[1]);
    } else {
        var params = [];
        for (var i = 1; i < arguments.length - 1; i++) {
            params.push(arguments[i]);
        }
        this._conn.query(arguments[0], params, arguments[arguments.length - 1]);
    }
};

Connection.prototype.query = function () {
    console.log(arguments);
    if (arguments.length < 1) {
        throw new Error("query(..) requires at least one argument");
    } else if (arguments.length < 2) {
        this._conn.query(arguments[0]);
    } else if (arguments.length < 3) {
        this._conn.query(arguments[0], arguments[1]);
    } else {
        var params = [];
        for (var i = 1; i < arguments.length - 1; i++) {
            params.push(arguments[i]);
        }
        this._conn.query(arguments[0], params, arguments[arguments.length - 1]);
    }
};

Connection.prototype.close = function (callback) {
    this._conn.end(callback);
};

exports = module.exports = {};
exports.Connection = Connection;
