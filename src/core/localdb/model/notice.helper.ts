import SQLite from 'react-native-sqlite-storage';
import { ResponseModel, MANAGE_KIND, SYN_KIND } from '@src/core/model';
import { BaseHelper } from './base.helper';
// import { Database } from '@src/core/utils/database';
import { NoticeModel } from '@src/core/model/notice.model';
import * as UTILS from '@src/core/app_utils';

export class NoticeHelper extends BaseHelper {
	private _tableName: string;
	private _viewName: string;
	protected $fillable = [
		"id",
		"patient_id",
		"type",
		"notice",
		"date",
		"task_type",
		"task_value",
		"record_id"
	];
	constructor(database: SQLite.SQLiteDatabase, tableName: string, viewName: string) {
		super(database);
		this._tableName = tableName;
		this._viewName = viewName;
	}

	public mySelect(): Promise<any> {
		// return this.select(`SELECT * FROM ${Database.TBL_NOTICES}`)
		return this.select(`SELECT * FROM ${this._tableName}`).then((r) => {
			return r;
		}).catch((e) => {
			return e;
		});
	}

	public setPatientNotice = (formData: FormData, kind: MANAGE_KIND): Promise<any> => {
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

	public async store(request: NoticeModel | any): Promise<any> {
		const id = await this.getMaxValue('id', this._tableName);
		const timestamp: string = UTILS.getFormattedDate(undefined, 1);
		const newNotice = {
			id: id + 1,
			patient_id: request.patient_id,
			type: request.type,
			notice: request.notice,
			date: request.date,
			task_type: request.task_type ? request.task_type : 0,
			task_value: request.task_value ? request.task_value : 0,
			record_id: request.record_id ? request.record_id : 0,
			flag: 1,
			syn_flag: SYN_KIND.UNSYNCHRONIZE,
			updated_at: timestamp,
			created_at: timestamp,
		};

		let bigqery = '';
		const keys = Object.keys(newNotice);
		let values = '';
		const field_values: any[] = [];
		keys.forEach((key, index) => {
			if (newNotice[key] != undefined) {
				if (index === 0) {
					bigqery = key;
					values = `?`;
				} else {
					bigqery += `,${key}`;
					values += `, ?`;
				}
				field_values.push(newNotice[key]);
			}
		});

		const response = { success: false, notice: undefined };
		return this.database.executeSql(`INSERT INTO ${this._tableName} (${bigqery}) VALUES (${values})`, field_values)
			.then(() => {
				response.success = true;
				response.notice = newNotice;
				return response;
			})
			.catch((e) => {
				return response;
			});
	}
	public update(request: NoticeModel | any): Promise<any> {
		const timestamp: string = UTILS.getFormattedDate(undefined, 1);
		const newNotice = {
			patient_id: request.patient_id,
			type: request.type,
			notice: request.notice,
			date: request.date,
			task_type: request.task_type ? request.task_type : 0,
			task_value: request.task_value ? request.task_value : 0,
			record_id: request.record_id ? request.record_id : 0,
			flag: request.flag,
			syn_flag: SYN_KIND.UNSYNCHRONIZE,
			updated_at: timestamp,
			created_at: timestamp,
		};
		const keys = Object.keys(newNotice);
		const field_values: any[] = [];
		const update_set: string[] = [];
		keys.forEach((key, index) => {
			if (newNotice[key] != undefined) {
				update_set.push(`${key}=?`);
				field_values.push(newNotice[key]);
			}

		});
		const sql = `UPDATE ${this._tableName} SET ${update_set.join(', ')} WHERE id=${request.id}`;
		const response = { success: false, notice: undefined };
		return this.database.executeSql(sql, field_values).then(() => {
			response.success = true;
			response.notice = newNotice;
			return response;
		}).catch(() => {
			return response;
		});
		return Promise.resolve({ succuess: false });
	}
	public deleteSyn = (ids: any[]): Promise<any> => {
		return this.database.executeSql(`DELETE FROM ${this._tableName} WHERE id in (${ids.join(',')})`)
			.then(() => {
				if (__DEV__) console.info('success to delete');
				return { success: true };
			})
			.catch((error) => {
				if (__DEV__) console.error('failed to delete', error);
				return { success: false };
			});
	}
	private destroy(request: NoticeModel | any): Promise<any> {
		const updated_at = UTILS.getFormattedDate(undefined, 1);
		const response = { success: false, notice: undefined };
		return this.database.executeSql(`UPDATE ${this._tableName} SET flag=0, syn_flag=${SYN_KIND.UNSYNCHRONIZE}, updated_at='${updated_at}' WHERE id=${request.id}`)
			.then(() => {
				response.success = true;
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
