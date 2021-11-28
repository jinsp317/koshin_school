import SQLite from 'react-native-sqlite-storage';
import { ResponseModel } from '@src/core/model';
import GLOBAL from '@src/core/globals';
import { bool } from 'prop-types';

export class BaseHelper {
	protected database: SQLite.SQLiteDatabase | undefined;

	constructor(database: SQLite.SQLiteDatabase) {
		this.database = database;
	}
	protected select(sql: string): Promise<ResponseModel> {
		const response: ResponseModel = { success: false, result: [] };
		if (this.database) {
			return this.database.executeSql(sql)
				.then(([results]) => {
					if (results) {
						const count = results.rows.length;
						if (count < 1) {
							response.success = true;
						} else {
							response.success = true;
							response.result = [];
							for (let i = 0; i < count; i++) response.result.push(results.rows.item(i));
						}
					}
					return response;
				})
				.catch((e) => {
					return response;
				});
		} else {
			return Promise.resolve(response);
		}
	}
	protected selectWithTransaction(sql: string): Promise<ResponseModel> {
		const response: ResponseModel = { success: false, result: [] };
		if (this.database) {
			return this.database
				.transaction((tx) => this.queryProc(tx, sql, response))
				.then((result) => {
					return response;
				})
				.catch((e) => {
					return response;
				});
		} else {
			return Promise.resolve(response);
		}
	}

	private queryProc = (tx, sql, response: ResponseModel) => {
		return tx
			.executeSql(sql)
			.then(([tx, results]) => {
				if (results) {
					const count = results.rows.length;
					if (count < 1) {
						response.success = true;
					} else {
						response.success = true;
						response.result = [];
						for (let i = 0; i < count; i++) response.result.push(results.rows.item(i));
					}
				}
				return response;
			})
			.catch((e) => {
				return response;
			});
	};
	protected getUserPatientsParams() {
		const user = GLOBAL.curUser;
		let params = ` AND hospital_id=${user.hospital_id ? user.hospital_id : 1}`;
		params += ' AND ( NOT flag IN (2, 5) OR flag IS NULL )';
		// FIXME: hard coded boss leve1 4
		// params += ' AND is_in = 1';
		if (user.job_position_id <= 4 && user.is_admin != 1) {
			// doctor_boss
			// params += ` AND department_id=${user.department_id}`;
			params += ` AND (department_id=${user.department_id} OR department_id IN (SELECT department_id FROM user_related_departments where user_id=${user.id})) `;
		}
		return params;
	}
	protected getUserRecordsParams() {
		const user = GLOBAL.curUser;
		const params = ` AND (flag=1 OR delete_user_id = -2) AND hospital_id=${user.hospital_id ? user.hospital_id : 1} `;
		// FIXME: hard coded boss leve1 4
		if (user.job_position_id <= 4) {
			// doctor_boss
			// params += ` AND (department_id=${user.department_id} OR department_id IN (SELECT department_id FROM user_related_departments where user_id=${user.id})) `;
		}
		return params;
	}
	/** free patient monitors */
	protected getFmsParams() {
		const user = GLOBAL.curUser;
		let params = ` AND hospital_id=${
			user.hospital_id ? user.hospital_id :
				1}`;
		if (user.job_position_level <= 4) {
			// doctor_boss
			params += ` AND department_id=${user.department_id}`;
		}
		return params;
	}

	protected getMaxValue(field: string, table: string): Promise<number> {
		return this.database
			.executeSql(`SELECT ${field} FROM ${table} order by ${field} DESC limit 1`)
			.then(([results]) => {
				if (results === undefined) {
					return 0;
				}
				const count = results.rows.length;
				if (count < 1) return 0;

				const row = results.rows.item(0);
				const { id } = row;
				return id;
			});
	}

	protected queryInsert(table: string, field1: string, fields2: string, values: any[]): Promise<boolean> {
		return this.database
			.executeSql(`INSERT INTO ${table}(${field1}) VALUES (${fields2})`, values)
			.then(() => {
				return true;
			})
			.catch((e) => {
				return false;
			});
	}
	protected queryUpdate(table: string, fieldset: string, where: string, values: any[]): Promise<boolean> {
		return this.database
			.executeSql(`UPDATE ${table} SET ${fieldset} WHERE ${where}`, values)
			.then(() => {
				return true;
			})
			.catch((e) => {
				return false;
			});
	}

	public getRecord(table: string, id: number): Promise<any> {
		return this.database
			.executeSql(`SELECT * FROM ${table} WHERE id=${id}`)
			.then(([results]) => {
				const count = results.rows.length;
				if (count < 1) return null;

				return results.rows.item(0);
			})
			.catch((e) => {
				return null;
			});
	}
	public changeId(table: string, from_id: number, to_id: number): Promise<boolean> {
		return this.database
			.executeSql(`UPDATE ${table} SET id=${to_id} WHERE id=${from_id}`)
			.then(() => {
				return true;
			})
			.catch((e) => {
				return false;
			});
	}
}
