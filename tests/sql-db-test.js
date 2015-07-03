
var async = require("async");
var fs = require("fs");

exports.testSQLDb = {
    "test database creation and initialization": function(test) {

        var SQL = require("../sql-db.js");

        test.doesNotThrow(function () {
            var db = new SQL.Db({
                platform: "SQLite",
                schema: [
                    {
                        name: "test",
                        sql: [
                            "create table if not exists test1 (id integer primary key, test1 varchar(50))",
                            "create table if not exists test2 (id integer primary key, test2 varchar(50))",
                        ]
                    },{
                        name: "one",
                        sql: [
                            "create table if not exists one1 (id integer primary key, one1 varchar(50))",
                            "create table if not exists one2 (id integer primary key, two2 varchar(50))",
                        ]
                    }
                ]
            });

            db.execute("delete from test1");
            db.execute("insert into test1 (id, test1) values (0, 'testing')");

            db.query("select * from test1 where id=0", function(err, rows) {
                test.equal(rows.length, 1, "resultset contains " + rows.length + " rows, expecting 1");
                test.equal(rows[0].test1, "testing", "test1 contains " + rows[0].test1 + " expecting 'testing'");
            });

            db.close();

        }, function(err) {
            console.error(err);
        });

        test.done();
    },

};

