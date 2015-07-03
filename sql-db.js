
var async = require("async");

// Returns a database connection that has been configured and initialized according to the specified
// database definition.
function Db(definition) {

	if (!definition) throw new Error("Db definition was not specified");

	if (definition.schema && definition.schema.length > 0) {
		for (var i = 0; i < definition.schema.length; i++) {
			var schema = definition.schema[i];
			if (!schema.name) {
				throw new Error("A schema was specified without a name in the Db definition")
			}
		}
	}

	if (!definition.platform) definition.platform = "SQLite";

	if (!definition.file) definition.file = ":memory:";

	if (!definition.versionTable) definition.versionTable = "sqldb_version";

	if (definition.platform == "MySQL") {
		if (!definition.host) definition.host = "localhost";
		if (!definition.user) throw new Error("user is required for the MySQL platform");
		if (!definition.password) throw new Error("password is required for the MySQL platform");
		if (!definition.database) throw new Error("database is required for the MySQL platform");
	}

	var sdb = null;
	if (definition.platform == "SQLite") {
		var SQLite = require("./sqlite.js");
		sdb = new SQLite.Connection(definition.file);
	} else if (definition.platform == "MySQL") {
		var MySQL = require("./mysql.js");
		sdb = new MySQL.Connection(definition.host, definition.user, definition.password, definition.database);
	} else {
		throw new Error(definition.platform + " is not supported by node-sql-db");
	}

	var initialized = false;
	var anError = null;

	async.waterfall([

		// create the version table
		function(callback) {
			sdb.execute("create table if not exists " + definition.versionTable + " (sdb_schema varchar(50) primary key, version integer not null)", function(err) {
				callback(err);
			});
		},

		// process each schema
		function(callback) {

			// create a schema processing task for each schema in the db definition and
			// put them into an array
			var fns = [];
			for (var i = 0; i < definition.schema.length; i++) {
				(function(schema, database, versionTable, platform){
					fns.push(function(callback) {
						_taskProcessSchema(schema, database, versionTable, platform, callback);
					});
				}(definition.schema[i], sdb, definition.versionTable, definition.platform));
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

function _taskProcessSchema(schema, database, versionTable, platform, callback) {
	return (function(s, db, vTbl, plt) {
		async.waterfall([

			// insert base version number for schema
			function(callback) {
				//console.log("insert base version number for schema " + s.name);
				var or = " ";
				if (plt == "SQLite") or = " or ";
				db.execute("insert" + or + "ignore into " + vTbl + " (sdb_schema, version) values ('" + s.name + "', 0)", function (err) {
					callback(err);
				});
			},

			// get version for schema
			function (callback) {
				//console.log("get version for schema " + s.name);
				db.query("select version from " + vTbl + " where sdb_schema = '" + s.name + "'", function(err, rows) {
					if (err) {
						callback(err);
					} else if (!rows || rows.length == 0) {
						callback(new Error("Version row is missing for " + s.name));
					} else {
						callback(null, rows[0].version);
					}
				});
			},

			// migrate the schema
			function (dbV, callback) {
				if (s.sql.length > dbV) {
					//console.log("migrate schema " + s.name + " from " + dbV + " to " + s.sql.length);
					for (var i = dbV; i < s.sql.length; i++) {
						(function (ii) {
							//console.log("v" + (ii + 1) + ": " + s.sql[ii]);
							db.execute(s.sql[ii], function (err) {
								if (err) {
									callback(err);
								} else {
									db.execute("update " + vTbl + " set version=" + (ii + 1) + " where sdb_schema ='" + schema.name + "'", function (err) {
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
				} else if (s.sql.length < dbV) {
					callback(new Error("Database version exceeds definition schema version"));
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
	})(schema, database, versionTable, platform);
}


