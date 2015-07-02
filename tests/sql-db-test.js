/**
 * Created by RonG on 6/29/15.
 */

var async = require("async");
var fs = require("fs");

exports.testSQLDb = {
    "test database creation and initialization": function(test) {

        var testDbFile = "./test.sqlite";
        if (fs.existsSync(testDbFile)) {
            fs.unlinkSync(testDbFile);
        }

        var SQL = require("../sql-db.js");

        test.doesNotThrow(function () {
            var db = new SQL.Db({
                file: testDbFile,
                schema: [
                    {
                        name: "test",
                        sql: [
                            "create table if not exists test1 (id integer primary key, test1 text)",
                            "create table if not exists test2 (id integer primary key, test2 text)",
                        ]
                    },{
                        name: "one",
                        sql: [
                            "create table if not exists one1 (id integer primary key, one1 text)",
                            "create table if not exists one2 (id integer primary key, two2 text)",
                        ]
                    }
                ]
            });

            db.serialize(function() {
                db.run("delete from test1");
                db.run("insert into test1 (id, test1) values (0, 'testing')");
            });

            db.close();

        }, Error);

        test.done();
    },

};

