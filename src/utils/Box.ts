import sha1 = require('sha1')
import { Config } from "../config"
import * as fs from 'fs'

export class Box {

	static cryptPass(password: String): String {
		return sha1(Config.__SALT + password + Config.__SALT) as String
	}

	static copyFile(source: string, target: string): Promise<any> {
		return new Promise((resolve, reject) => {
			var rd = fs.createReadStream(source)
			rd.on('error', rejectCleanup)
			var wr = fs.createWriteStream(target)
			wr.on('error', rejectCleanup)
			wr.on('finish', resolve)
			rd.pipe(wr)
			function rejectCleanup(err: any) {
				rd.destroy()
				wr.end()
				reject(err)
			}
		});
	}

	static createWhereFromQuery(query: any): Object {
		let where = JSON.parse(JSON.stringify(query || {}))
		delete where.search;
		delete where.limit;
		delete where.page;
		delete where.sort;
		return where;
	}

	static escapeRegExpChars(text: string): string {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
}
