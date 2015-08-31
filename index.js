'use strict';

/*
	 connection format: json://path/to/file.json
*/

var fs = require('fs');
var path = require('path');
var mud = require('mud');
var isArrayish = require('is-arrayish');
var parseJson = require('parse-json');

var mudJson = module.exports = {
	install: function () {
		mud.protocol.json = mudJson;
	},

	getFileFromUrl: function (urlInfo) {
		return path.resolve(path.join(urlInfo.host, urlInfo.path));
	},

	connect: function (db, opts, cb) {
		opts = opts || {};

		if (db.urlInfo.protocol !== 'json:') {
			return cb(new Error('not a JSON connection string: ' +
						db.urlInfo.format()));
		}

		db.filepath = mudJson.getFileFromUrl(db.urlInfo);
		fs.readFile(db.filepath, opts, function (err, data) {
			if (err) {
				return cb(err);
			}

			try {
				db.data = parseJson(data.toString());
			} catch (e) {
				e.fileName = db.filepath;
				return cb(e);
			}

			cb();
		});
	},

	getTables: function (db, cb) {
		var tables = {};

		// it can only either be an array or object; we need an object
		if (isArrayish(db.data)) {
			return cb(new Error('parsed data is an array; expected object'));
		}

		for (var k in db.data) {
			if (db.data.hasOwnProperty(k)) {
				var table = db.data[k];
				if (!isArrayish(table)) {
					return cb(new Error('table does not contain array data: ' + k));
				}

				// Getting the property names on the first column is the best we
				//	can sensibly do.
				tables[k] = {
					rows: table.length,
					columns: Object.getOwnPropertyNames(table[0])
				};
			}
		}

		return cb(null, tables);
	}
};
