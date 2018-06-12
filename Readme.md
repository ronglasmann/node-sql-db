# node-sql-db

This project is forked from https://github.com/ronglasmann/node-sql-db

It contains a new function "insert" that allows you to retrieve the last inserted id in a table, no mather which database type is connected.

Usage:
<code>db.insert('query',params,callback);</code>

Sample:
<code>
 db.insert("insert into ...",[],function(){
            if (db.errLastInsertId)
              alert('Error: '+db.errLastInsertId);
            else
              alert('Saved to database with id '+db.lastInsertedId);
          });
</code>


A wrapper around multiple NodeJS database drivers providing a simple and consistent api for relational database interaction and maintenance of database structures. **Please note:** this release provides support for SQLite and MySQL databases.  Support for additional platforms is coming soon.

## Design and inspiration

Release management of database structure alongside related applications can become challenging as applications evolve throughout their lifetimes.  Traditionally this is accomplished through manually applied databases changes and/or SQL DDL scripts that are executed in a coordinated manner with application releases.  As systems grow in complexity this approach can become difficult to sustain and error-prone.

node-sql-db allows application code to be responsible for managing the state of database structures it depends upon.  When a database connection is obtained through node-sql-db the library automatically evaluates the version of one or more "named schemas" in the database and executes DDL and/or DML as needed to bring them in sync with the state expected by the application.  The database connection is only returned to the caller after any necessary database updates are applied.

node-sql-db allows for very fast prototyping and development of applications supported by a rdms backend.  Initial code can be assembled quickly (maybe even using only an in-memory SQLite DB) and then seamlessly and rapidly evolved into production code.  If the application grows beyond a file-based db, transitioning to a server based database involves only minor code changes (or maybe even none at all). 

**Features:**

 * Rapid prototyping and development of database supported applications
 * Management of database structure within related application code 
 * SQLite databases supported via require("sqlite3")
 * MySQL databases supported via require("mysql")
 * Simple and consistent usage pattern
 
## Installation

    npm install node-sql-db -save

## Usage

node-sql-db.Db(..) takes a Javascript object that provides **database definition** that node-sql-db will use to establish the database connection and do schema migration.  Once node-sql-db.Db(..) returns the caller is guaranteed that any needed database updates have completed and the connection is ready to use.

A database definition object is structured like this:

    {
        platform:     "" - Either SQLite or MySQL, defaults to SQLite
        file:         "" - SQLite file on disk, full path and filename
        host:         "" - MySQL server host
        user:         "" - MySQL authorized username
        password:     "" - MySQL authorized user password
        database:     "" - MySQL database name
        versionTable: "" - Table name used to maintain schema versions, optional
        schema:       [] - Array of schema objects that define database structure and seed 
                           data, optional
    }

A schema object is structured like this:

    {
        name: "" - The name of this schema, required
        sql:  [] - Array of strings, SQL statements executed in sequence to build the database 
                   structure, required
    }

### Examples

SQLite with multiple schemas:

    var SQL = require("node-sql-db");
    var db = new SQL.Db({
        platform: "SQLite",
        schema: [{
            name: "test",
            sql: ["create table if not exists test1 (id integer primary key, test1 text)",
                  "create table if not exists test2 (id integer primary key, test2 text)"]
        },{
            name: "one",
            sql: ["create table if not exists one1 (id integer primary key, one1 text)",
                  "create table if not exists one2 (id integer primary key, two2 text)"]
        }]
    });
    
    db.execute("delete from test1");
    db.execute("insert into test1 (id, test1) values (0, 'testing')");

    db.query("select * from test1 where id=0", function(err, rows) {
        console.log(rows);
    });

    db.close();

MySQL with only one schema:

    var SQL = require("node-sql-db");
    var db = new SQL.Db({
        platform: "MySQL",
        host:     "localhost",
        user:     "mysql_user",
        password: "mysql_pwd",
        database: "test_db",
        schema: [{
            name: "test",
            sql: ["create table if not exists test1 (id integer primary key, test1 text)",
                  "create table if not exists test2 (id integer primary key, test2 text)"]
        }]
    });
    
    db.execute("delete from test1");
    db.execute("insert into test1 (id, test1) values (0, 'testing')");

    db.query("select * from test1 where id=0", function(err, rows) {
        console.log(rows);
    });

    db.close();

## License

node-sql-db is released under the MIT License (MIT)

Copyright (c) 2015 Ron Glasmann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
