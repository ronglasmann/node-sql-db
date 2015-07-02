
var async = require("async");

// Returns an instance of sqlite3.Database that has been initialized according to the specified database definition.
// definition is structured like this:
// {
// 	file:         "" - SQLite file on disk, full path and filename, required
//	versionTable: "" - Table name used by LiteSQL to maintain schema versions, optional
//  schema:       [] - Array of schema objects that define database structure and seed data, optional
// }
//
// schema objects are structured like this:
// {
//	name: "" - The name of this schema, required
// 	sql:  [] - Array of strings, SQL statements executed in sequence to build the database structure, required
// }
//
function Db(definition) {

	var sqlite3 = require("sqlite3").verbose();

	if (!definition) throw new Error("Db definition was not specified");

	if (!definition.file) throw new Error("A file not specified in the Db definition");

	if (definition.schema && definition.schema.length > 0) {
		for (var i = 0; i < definition.schema.length; i++) {
			var schema = definition.schema[i];
			if (!schema.name) {
				throw new Error("A schema was specified without a name in the Db definition")
			}
		}
	}

	if (!definition.versionTable) definition.versionTable = "litesql_version";

	var sdb = new sqlite3.Database(definition.file);
	sdb.on("trace", function(sql) {
		console.log(sql);
	});

	var initialized = false;
	var anError = null;

	async.waterfall([

		// create the version table
		function(callback) {
			sdb.run("create table if not exists " + definition.versionTable + " (schema text primary key, version integer not null)", function(err) {
				callback(err);
			});
		},

		// process each schema
		function(callback) {

			// create a schema processing task for each schema in the db definition and
			// put them into an array
			var fns = [];
			for (var i = 0; i < definition.schema.length; i++) {
				(function(schema, database, versionTable){
					fns.push(function(callback) {
						_taskProcessSchema(schema, database, versionTable, callback);
					});
				}(definition.schema[i], sdb, definition.versionTable));
			}

			// process each schema in the array in parallel
			async.parallel(fns, function(err) {
				callback(err);
			});

		}

	], function(err) {
		if (err) anError = err;
		initialized = true;
	});

	require('deasync').loopWhile(function(){return !initialized;});

	if (anError) throw anError;

	return sdb;

}

exports = module.exports = {};
exports.Db = Db;

function _taskProcessSchema(schema, database, versionTable, callback) {
	return (function(s, db, vTbl) {
		async.waterfall([

			// insert base version number for schema
			function(callback) {
				//console.log("insert base version number for schema " + s.name);
				db.run("insert or ignore into " + vTbl + " (schema, version) values ('" + s.name + "', 0)", function (err) {
					callback(err);
				});
			},

			// get version for schema
			function (callback) {
				//console.log("get version for schema " + s.name);
				db.get("select version from " + vTbl + " where schema = '" + s.name + "'", function(err, row) {
					if (err) {
						callback(err);
					} else if (!row) {
						callback(new Error("Version row is missing for " + s.name));
					} else {
						callback(null, row.version);
					}
				});
			},

			// migrate the schema
			function (dbV, callback) {
				if (s.sql.length > dbV) {
					//console.log("migrate schema " + s.name + " from " + dbV + " to " + s.sql.length);
					db.serialize(function() {
						for (var i = dbV; i < s.sql.length; i++) {
							(function(ii) {
								//console.log("v" + (ii + 1) + ": " + s.sql[ii]);
								db.run(s.sql[ii], function (err) {
									if (err) {
										callback(err);
									} else {
										db.run("update " + vTbl + " set version=" + (ii + 1) + " where schema ='" + schema.name + "'", function (err) {
											if (err) {
												callback(err);
											} else {
												callback(null);
											}
										});
									}
								});
							}(i));
						}
					});
				} else {
					callback(null);
				}
			}

		], function (err, results) {
			if (err) {
				console.error(err);
			}
			callback(err, results);
		});
	})(schema, database, versionTable);
}


