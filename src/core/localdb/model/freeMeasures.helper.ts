import SQLite from "react-native-sqlite-storage";
import { RequestFPMParamsModel, MANAGE_KIND } from "@src/core/model";
import { BaseHelper } from "./base.helper";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { AppSync } from "@src/core/appSync";
export class FreeMeasuresHelper extends BaseHelper {
	private _tableName: string;
	private _viewName: string;
	constructor(database: SQLite.SQLiteDatabase, tableName: string, viewName: string) {
		super(database);
		this._tableName = tableName;
		this._viewName = viewName;
	}

	public getFPMRecordCount(reqParams: RequestFPMParamsModel): Promise<any> {
		const query = `SELECT COUNT(*) FROM ${this._viewName} WHERE ${this.getParams(reqParams)}`;
		// let query = `SELECT COUNT(*) FROM ${Database.VIEW_FREE_MEASURES} WHERE ${this.getParams(reqParams)}`;
		return this.select(query)
			.then((r) => {
				const result = r.result[0];
				return { success: r.success, count: result[Object.keys(result)[0]] };
			})
			.catch((e) => {
				return e;
			});
	}
	public downloadFreePatientMeasure(reqParams: RequestFPMParamsModel): Promise<any> {
		let query;
		let params = this.getParams(reqParams);
		params += ` ORDER BY time desc`;
		if (reqParams.from && reqParams.count) {
			params += ` LIMIT ${reqParams.from}, ${reqParams.from + reqParams.count}`;
		}
		query = `SELECT id, name, age, cert_num,user_name,  point, time, value FROM ${this._viewName} WHERE ${params}`;
		// query = `SELECT id, name, age, cert_num,user_name,  point, time, value FROM ${Database.VIEW_FREE_MEASURES} WHERE ${params}`;
		return this.select(query).then((r) => {
			return r;
		}).catch((e) => {
			return e;
		});
	}

	private getParams = (reqParams: RequestFPMParamsModel | undefined) => {
		let params = 'flag=1' + this.getFmsParams();
		if (reqParams.user_id) { params += ` AND user_id=${reqParams.user_id}`; }
		if (reqParams.free_patient) {
			if (reqParams.free_patient.name) { params += ` AND name like "%${reqParams.free_patient.name}%"`; }
			if (reqParams.free_patient.cert_num) { params += ` AND cert_num like "%${reqParams.free_patient.cert_num}%"`; }
			if (reqParams.free_patient.cert_kind >= 0) { params += ` AND cert_kind=${reqParams.free_patient.cert_kind}`; }
		}
		if (reqParams.begin_time) { params += ` AND time >= "${reqParams.begin_time}"`; }
		if (reqParams.end_time) { params += ` AND time <= "${reqParams.end_time}"`; }
		if (reqParams.point >= 0) { params += ` AND point=${reqParams.point}`; }

		return params;
	};

	public manageFreePatientMeasure = (formData: FormData, kind: MANAGE_KIND): Promise<any> => {
		if (kind === MANAGE_KIND.ADD) {
			return this.store(UTILS.getRequestParams(formData));
		} else if (kind === MANAGE_KIND.DEL) {
			return this.destroy(UTILS.getRequestParams(formData));
		} else if (kind === MANAGE_KIND.MODIFY) {
			return this.update(UTILS.getRequestParams(formData));
		} else if (kind === MANAGE_KIND.FULL_DEL) {
			return this.destroy_full(UTILS.getRequestParams(formData));
		}
	};
	public deleteSyn = (ids: any[]): Promise<any> => {
		return this.database.executeSql(`DELETE FROM ${this._tableName} WHERE id in (${ids.join(',')})`)
			.then(() => {
				if (__DEV__) console.info('success to delete');
				return { success: true };
			}).catch((error) => {
				if (__DEV__) console.error('failed to delete', error);
				return { success: false };
			});
	}
	private async store(request: any): Promise<any> {
		const id = await this.getMaxValue('id', this._tableName);
		const now = UTILS.getFormattedDate(undefined, 1);
		const newRecord = {
			id: id + 1,
			hospital_id: GLOBAL.curUser.hospital_id,
			user_id: GLOBAL.curUser.id,
			address: request.address ? request.address : '',
			memo: request.memo ? request.memo : '',
			name: request.name,
			time: request.time ? request.time : now,
			point: request.point ? request.point : 0,
			value: request.value ? request.value : 0,
			cert_num: request.cert_num,
			cert_kind: request.cert_kind,
			gender: request.gender >= 0 ? request.gender : 1,
			updated_at: now,
			created_at: now
		};

		let bigqery = '';
		const keys = Object.keys(newRecord);
		let values = '';
		const field_values: any[] = [];
		keys.forEach((key, index) => {
			if (index === 0) {
				bigqery = key;
				values = `?`;
			} else {
				bigqery += `,${key}`;
				values += `, ?`;
			}
			field_values.push(newRecord[key]);
		});

		const response = { success: false, notice: undefined };
		return this.database.executeSql(`INSERT INTO ${this._tableName} (${bigqery}) VALUES (${values})`, field_values)
			.then(() => {
				response.success = true;
				response.record = newRecord;
				AppSync.hasLocalUpdate = true;

				return response;
			})
			.catch((e) => {
				return response;
			});
	}
	private update(request: any): Promise<any> {
		const newRecord = {
			id: request.id,
			hospital_id: GLOBAL.curUser.hospital_id,
			user_id: GLOBAL.curUser.id,
			updated_at: UTILS.getFormattedDate(undefined, 1)
		};
		if (request.address) { newRecord.address = request.address; }
		if (request.memo) { newRecord.memo = request.memo; }
		if (request.name) { newRecord.name = request.name; }
		if (request.time) { newRecord.time = request.time; }
		if (request.cert_num) { newRecord.cert_num = request.cert_num; }
		if (request.point >= 0) { newRecord.point = request.point; }
		if (request.value >= 0) { newRecord.value = request.value; }
		if (request.cert_kind >= 0) { newRecord.cert_kind = request.cert_kind; }
		if (request.gender >= 0) { newRecord.gender = request.gender; }
		let bigqery = '';
		const keys = Object.keys(newRecord);
		const field_values: any[] = [];

		keys.forEach((key, index) => {
			if (index === 0) {
				bigqery = ` ${key}=?`;
			} else {
				bigqery += `, ${key}=?`;
			}
			field_values.push(newRecord[key]);
		});


		const response = { success: false, notice: undefined };
		return this.database.executeSql(`UPDATE ${this._tableName} SET ${bigqery} WHERE id=${newRecord.id}`, field_values)
			.then(() => {
				response.success = true;
				response.record = newRecord;
				AppSync.hasLocalUpdate = true;
				return response;
			})
			.catch((e) => {
				return response;
			});
	}
	private destroy(request: any): Promise<any> {
		const updated_at = UTILS.getFormattedDate(undefined, 1);
		const response = { success: false, notice: undefined };
		return this.database.executeSql(`UPDATE ${this._tableName} SET flag=0, updated_at='${updated_at}' WHERE id=${request.id}`)
			.then(() => {
				response.success = true;
				AppSync.hasLocalUpdate = true;
				return response;
			})
			.catch((e) => {
				return response;
			});
	}
	private destroy_full(request: any): Promise<any> {
		return this.database.executeSql(`DELETE FROM ${this._tableName} WHERE id = ${request.id}`)
			.then(() => {
				if (__DEV__) console.info('success to delete');
				return { success: true };
			})
			.catch((error) => {
				if (__DEV__) console.error('failed to delete', error);
				return { success: false };
			});
	}
}
