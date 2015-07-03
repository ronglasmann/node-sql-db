
var async = require("async");
var fs = require("fs");
var SQL = require("../sql-db.js");

exports.testSQLDb = {
    "test database creation and initialization": function(test) {

        test.expect(3);

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
                db.close();
                test.done();
            });


        }, function(err) {
            console.error(err);
        });

    },

    "test param arrays": function(test) {

        test.expect(5);

        test.doesNotThrow(function () {

            var db = new SQL.Db({
                platform: "SQLite",
                file: "./test.sqlite",
                schema: [
                    {
                        name: "test",
                        sql: [
                            "create table if not exists test (test1 varchar(50), test2 varchar(50), test3 varchar(50))",
                        ]
                    }
                ]
            });

            db.execute("delete from test");

            var p = ["one", "two", "three"];
            db.execute("insert into test (test1,test2,test3) values (?,?,?)", p, function(err) {
                test.ifError(err);

                db.query("select * from test", function(err, rows) {
                    test.ifError(err);
                    console.log(rows[0]);
                    test.equal(rows.length, 1, "resultset contains " + rows.length + " rows, expecting 1");
                    test.equal(rows[0].test1, "one", "test1 contains " + rows[0].test1 + " expecting 'one'");

                    db.close();

                    test.done();
                });
            });

        }, function(err) {
            console.error(err);
        });

    },

};

