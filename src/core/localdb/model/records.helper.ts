import SQLite from 'react-native-sqlite-storage';
import {
	ResponseModel,
	RequestPatientModel,
	MonitorPatientModel,
	PatientModel,
	RequestGlucoseMonitorModel,
	PatientMonitorRawModel,
	GlucoseMonitorModel,
	PointModel,
	MANAGE_KIND
} from '@src/core/model';
import { BaseHelper } from './base.helper';
import * as UTILS from '@src/core/app_utils';
import GLOBAL from '@src/core/globals';
import { AppSync } from '@src/core/appSync';
import moment from 'moment';

export class RecordsHelper extends BaseHelper {
	private _tableName: string;
	private _ViewName: string;
	private _refName: string;
	private _ViewSql: string;
	protected $fillable = [
		'hospital_id',
		'patient_id',
		'time',
		'point',
		'value',
		'user_id',
		'memo',
		'state',
		'task_type',
		'task_value',
		'flag'
	];
	constructor(database: SQLite.SQLiteDatabase, tableName: string, viewName: string, refName: string) {
		super(database);
		this._tableName = tableName;
		this._ViewName = viewName;
		this._refName = refName;
		this._ViewSql = `SELECT
			records.id,
			records.patient_id,
			records.hospital_id,
			records.time,
			records.point,
			records.value,
			records.user_id,
			records.state,
			records.memo,
			records.min,
			records.max,
			records.delete_user_id,
			records.task_type,
			records.task_value,
			records.flag,
			records.created_at,
			records.updated_at,
			View_Patients.department_name,
			View_Patients.doctor_name,
			View_Patients.nurse_name,
			View_Patients.age,
			View_Patients.in_days,
			View_Patients.hospital_name,
			View_Patients.name as patient_name,
			View_Patients.gender,
			View_Patients.birthday,
			View_Patients.department_id,
			View_Patients.doctor_id,
			View_Patients.nurse_id,
			View_Patients.patient_number,
			View_Patients.bed_number,
			View_Patients.alarm_min,
			View_Patients.alarm_max,
			View_Patients.target_before_max,
			View_Patients.target_before_min,
			View_Patients.target_after_min,
			View_Patients.target_after_max,
			users.name as user_name
		FROM
		records
		INNER JOIN View_Patients ON View_Patients.id = records.patient_id
		LEFT JOIN users ON users.id = records.user_id`;
	}

	public getGlucoseMonitorsRecordCount(reqParams: RequestGlucoseMonitorModel): Promise<any> {
		let query: string;
		if (reqParams.is_group === 1) {
			query = `SELECT COUNT(*) FROM ${this._refName} WHERE ${this.getPatientsParams(reqParams)}`;
			// query = `SELECT COUNT(*) FROM patients WHERE ${this.getPatientsParams(reqParams)}`;
		} else {
			query = `SELECT COUNT(*) FROM ${this._ViewName} WHERE ${this.getParams(reqParams)}`;
			// query = `SELECT COUNT(*) FROM view_records WHERE ${this.getParams(reqParams)}`;
		}
		return this.select(query).then((r) => {
			const result = r.result[0];
			return { success: r.success, count: result[Object.keys(result)[0]] };
		}).catch((e) => {
			return e;
		});
	}
	public async getPoints(): Promise<PointModel[]> {
		const sql = 'SELECT * FROM points';
		const recResponse = await this.select(sql);
		const res = recResponse.result as PointModel[];
		return res;

	}
	public async downloadGlucoseMonitors(reqParams: RequestGlucoseMonitorModel): Promise<any> {
		let query: string;
		// console.log(reqParams);

		if (reqParams.is_group === 1) {
			const dayOfWeek: number = UTILS.getDayofWeek(reqParams.begin_time);
			const orders: any[] = [];
			if (reqParams && reqParams.o_doctor_id) {
				orders.push(`(doctor_id=${reqParams.o_doctor_id}) DESC`);
			}
			if (reqParams && reqParams.o_nurse_id) {
				orders.push(`(nurse_id=${reqParams.o_nurse_id}) DESC`);
			}
			orders.push('CAST(bed_number AS int)');
			// tslint:disable-next-line: max-line-length
			const points = `(SELECT	GROUP_CONCAT(point || '%' || advice_id) FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE	patient_id= patients.id AND DATE(from_time) <= '${reqParams.begin_time}' AND (DATE(to_time) IS NULL OR DATE(to_time) >= DATE('${reqParams.begin_time}')) AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point = 1 ) GROUP BY id > 0 ) AS points`;

			// tslint:disable-next-line: max-line-length
			const advices = `(SELECT GROUP_CONCAT(id || '%' || from_time || '%' || to_time) FROM advice_records WHERE patient_id=patients.id AND DATE(from_time) <= '${reqParams.begin_time}' AND (DATE(to_time) IS NULL OR DATE(to_time) >=DATE('${reqParams.begin_time}')) AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek} ) GROUP BY patient_id) as advices`;
			// tslint:disable-next-line: max-line-length
			const anytime = `(SELECT GROUP_CONCAT(id) FROM advice_records WHERE patient_id=patients.id AND DATE(from_time) <= '${reqParams.begin_time}' AND (DATE(to_time) IS NULL OR DATE(to_time) >=DATE('${reqParams.begin_time}')) AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek} ) AND is_point <> 1 AND id IN (SELECT advice_id FROM measure_times WHERE advice_id=advice_records.id ) GROUP BY is_point <> 1 ) AS anytime`;

			// tslint:disable-next-line: max-line-length
			query = `SELECT id, name, bed_number, target_before_min, target_before_max, target_after_min, target_after_max, alarm_min, alarm_max, Cast ((JulianDay('now') - JulianDay(birthday)) / 365 As Integer) as age, gender, ${points} , ${anytime}, ${advices} FROM ${this._refName} WHERE ${this.getPatientsParams(reqParams)} ORDER BY ${orders.join(', ')}`;
			// tslint:disable-next-line: max-line-length
			// query = `SELECT id, name, bed_number, target_before_min, target_before_max, target_after_min, target_after_max, alarm_min, alarm_max FROM patients WHERE ${this.getPatientsParams(reqParams)} order by CAST(bed_number AS int)`;
		} else if (reqParams.has_record_days > 0) {
			let params = '1' + this.getUserRecordsParams();
			params += ` AND patient_id=${reqParams.patient_id}`;
			params += ` AND date <= DATE('now')`;
			params += ` GROUP BY date`;
			// params += ` ORDER BY CAST(bed_number AS int)`;
			params += ` ORDER BY date`;
			params += ` LIMIT 0, ${reqParams.has_record_days}`;
			query = `SELECT DATE(time) as date FROM ${this._tableName} WHERE ${params}`;
			// query = `SELECT DATE(time) as date FROM records WHERE ${params}`;
			// query = `SELECT *, DATE(time) as date FROM view_records WHERE ${params}`;
		} else {
			query = `SELECT * FROM (${this._ViewSql})  WHERE ${this.getParams(reqParams)}`;
			// query = `SELECT * FROM view_records WHERE ${this.getParams(reqParams)}`;
		}
		const recWheres: string[] = [];
		recWheres.push('1' + this.getUserRecordsParams());
		if (reqParams.begin_time) { recWheres.push(`DATETIME(time) >= '${reqParams.begin_time}'`); }
		if (reqParams.end_time) { recWheres.push(`DATETIME(time) <= '${reqParams.end_time}'`); }

		// tslint:disable-next-line: max-line-length
		/// console.log(query);
		const patResponse = await this.select(query);
		if (reqParams.is_group === 1) {
			// tslint:disable-next-line: max-line-length
			const sql = `SELECT id, value, point, state, patient_id, time, delete_user_id, flag, eat_time, (SELECT GROUP_CONCAT(id || '%' || notice || '%' || type || '%' || date || '%' || task_type) FROM notices WHERE record_id=${this._tableName}.id AND patient_id=${this._tableName}.patient_id AND flag = 1 ) as notice_obj  FROM ${this._tableName} WHERE ${recWheres.join(' AND ')}`;
			/// console.log(sql);
			const recResponse = await this.select(sql);
			const recData = recResponse.result as GlucoseMonitorModel[];
			if (patResponse.success && patResponse.result.length) {
				const patients: PatientMonitorRawModel[] = patResponse.result;
				for (const patient of patients) {
					const records = recData.filter(_it => _it.patient_id === patient.id);
					const patInfo = {
						target_before_min: patient.target_before_min,
						target_before_max: patient.target_before_max,
						target_after_max: patient.target_after_max,
						target_after_min: patient.target_after_min,
						alarm_min: patient.alarm_min,
						alarm_max: patient.alarm_max,
						age: patient.age,
					}
					patient.records = records.map(_it => {
						return {
							..._it,
							...patInfo,
						};
					});
					if (reqParams.begin_time) { this.advicePoints(patient, reqParams.begin_time); }
				}
				return patients;
			}
		} else {
			return patResponse;
		}


	}
	public async getHasMonitorDays(patient_id: number, has_record_days: number, hospital_id: number): Promise<any> {
		// patient_id: number, has_reocrd_days: number)
		return await this.downloadGlucoseMonitors({
			patient_id: patient_id,
			has_record_days: has_record_days
		});
	}
	private getPatientsParams = (reqParams: RequestGlucoseMonitorModel | undefined) => {
		// 20191229 rhj for add is_in
		// 20200108 other deleted 'AND'
		let params = '1 AND is_in=1' + this.getUserPatientsParams();
		if (reqParams.department_id >= 0) {
			params += ` AND department_id=${reqParams.department_id}`;
		}
		if (reqParams.from >= 0 && reqParams.count >= 0) {
		}


		if (reqParams.doctor_id >= 0) { params += ` AND doctor_id=${reqParams.doctor_id}`; }
		if (reqParams.nurse_id >= 0) { params += ` AND nurse_id=${reqParams.nurse_id}`; }
		if (reqParams.o_doctor_id >= 0) { params += ` AND doctor_id=${reqParams.o_doctor_id}`; }
		if (reqParams.o_nurse_id >= 0) { params += ` AND nurse_id=${reqParams.o_nurse_id}`; }
		if (reqParams.departments.length) {
			params += ` AND department_id IN (${reqParams.departments.join(', ')})`;
		}
		if (reqParams.patients) {
			params += ` AND id IN (${reqParams.patients.join(', ')})`;
		}
		// if (reqParams.searchTxt) {
		// 	params += 'AND ( name LIKE "%' + reqParams.searchTxt + '%" OR bed_number LIKE "' + reqParams.searchTxt + '")';
		// }
		return params;
	};
	private getParams = (reqParams: RequestGlucoseMonitorModel | undefined) => {
		let params = '1' + this.getUserRecordsParams();
		if (reqParams.user_id) { params += ` AND user_id=${reqParams.user_id}`; }
		if (reqParams.patient_id) { params += ` AND patient_id=${reqParams.patient_id}`; }
		if (reqParams.begin_time) { params += ` AND DATETIME(time) >= "${reqParams.begin_time}"`; }
		if (reqParams.end_time) { params += ` AND DATETIME(time) <= "${reqParams.end_time}"`; }
		if (reqParams.department_id >= 0) { params += ` AND department_id=${reqParams.department_id}`; }
		if (reqParams.doctor_id >= 0) { params += ` AND doctor_id=${reqParams.doctor_id}`; }
		if (reqParams.nurse_id >= 0) { params += ` AND nurse_id=${reqParams.nurse_id}`; }
		if (reqParams.departments && reqParams.departments.length) {
			params += ` AND department_id IN (${reqParams.departments.join(', ')})`;
		}
		if (reqParams.patients) {
			params += ` AND patient_id IN (${reqParams.patients.join(', ')})`;
		}
		if (reqParams.points) {
			params += ` AND point IN (${reqParams.points.join(', ')})`;
		}
		// 2020-05-13
		// params += ` ORDER BY time desc, department_id, CAST(bed_number AS int), CAST(patient_number AS int)`;
		params += ` ORDER BY CAST(bed_number AS int)`;
		if (reqParams.from && reqParams.count) {
			params += ` LIMIT ${reqParams.from}, ${reqParams.from + reqParams.count}`;
		}

		return params;
	}

	private advicePoints(patient: PatientMonitorRawModel, time: string) {
		// const dayOfWeek: number = UTILS.getDayofWeek(time);
		const cdate = moment(time).format('YYYY-MM-DD');
		const advice: string[] = patient.advices ? patient.advices.split(',') : [];
		const resultPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		if (patient.anytime !== null) {
			resultPoints[UTILS.getAnytimePoint(true)] = 1;
		}
		if (patient.points !== null) {
			// GLOBAL.serverPoints
			const poss: string = patient.points;
			// console.log(poss);
			const points: string[] = poss.split(',');
			for (const point of points) {
				const pnt: string[] = point.split('%');
				const adv = advice.find(_it => _it.indexOf(`${pnt[1]}%`) === 0);
				if (adv) {
					const adTime = moment(adv.split('%')[1]);
					const adETime = adv.split('%')[2];
					const ft = GLOBAL.serverPoints[pnt[0]];
					const pTime = moment(`${cdate} ${ft.to_time}`);
					const fTime = moment(`${cdate} ${ft.from_time}`);
					if (pTime >= adTime) {
						if (adETime != '') {
							const edTime = moment(adETime);
							if (pTime <= edTime || (pTime >= adTime && fTime <= edTime)) {
								// if(fTime <= adTime && pTime >= )
								// if (pTime <= edTime || moment(adETime)) {
								resultPoints[pnt[0]] = 1;
							}
						} else {
							resultPoints[pnt[0]] = 1;
						}

					}
				}

			}
		}
		patient.advice = [...resultPoints];
	}

	private async records(patient: PatientMonitorRawModel, reqParams: RequestGlucoseMonitorModel) {
		reqParams.patient_id = patient.id;
		const query = `SELECT id, value, point, time FROM ${this._ViewName} WHERE ${this.getParams(reqParams)}`;
		// const query = `SELECT id, value, point, time FROM View_Records WHERE ${this.getParams(reqParams)}`;
		const response = await this.select(query);
		if (response.success && response.result) {
			patient.records = response.result;
		}
	}
	private async real_records(patient: PatientMonitorRawModel, reqParams: RequestGlucoseMonitorModel) {
		reqParams.patient_id = patient.id;
		const wheres: string[] = [];
		wheres.push('1' + this.getUserRecordsParams());
		wheres.push(`patient_id=${patient.id}`);
		if (reqParams.begin_time) { wheres.push(`time >= '${reqParams.begin_time}'`); }
		if (reqParams.end_time) { wheres.push(`time <= '${reqParams.end_time}'`); }
		// let wheres[] = this.getUserRecordsParams();
		// where += ` AND patient_id=${patient.id}`;
		// tslint:disable-next-line: max-line-length
		const query = `SELECT id, value, point, state, ${patient.target_before_min} AS target_before_min, ${patient.target_before_max} AS target_before_max, ${patient.target_after_max} AS target_after_max, ${patient.target_after_min} AS target_after_min , ${patient.alarm_min} AS alarm_min, ${patient.alarm_max} AS alarm_max, time, delete_user_id, flag, (SELECT id || '%' || notice FROM notices WHERE record_id=${this._tableName}.id AND patient_id=${this._tableName}.patient_id AND flag = 1 ) as notice_obj  FROM ${this._tableName} WHERE ${wheres.join(' AND ')}`;
		// tslint:disable-next-line: max-line-length
		// const query = `SELECT id, value, point, state, ${patient.target_before_min} AS target_before_min, ${patient.target_before_max} AS target_before_max, ${patient.target_after_max} AS target_after_max, ${patient.target_after_min} AS target_after_min , ${patient.alarm_min} AS alarm_min, ${patient.alarm_max} AS alarm_max, time  FROM records WHERE ${wheres.join(' AND ')}`;
		const response = await this.select(query);
		if (response.success && response.result) {
			patient.records = response.result;
		}
	}
	public manageGlucoseMonitor = (formData: GlucoseMonitorModel, kind: MANAGE_KIND): Promise<any> => {
		if (kind === MANAGE_KIND.ADD) {
			return this.store(formData);
			// return this.store(UTILS.getRequestParams(formData));
		} else if (kind === MANAGE_KIND.DEL) {
			return this.destroy(formData);
		} else if (kind === MANAGE_KIND.MODIFY) {
			return this.update(formData);
		} else if (kind === MANAGE_KIND.FULL_DEL) {
			return this.postGlucoseMoniterAction(formData);
		}
	};

	private postGlucoseMoniterAction = (request: GlucoseMonitorModel): Promise<any> => {
		const wheres: string[] = [];
		const timestamp: string = UTILS.getFormattedDate(undefined, 1);
		wheres.push(`patient_id=${request.patient_id}`);
		wheres.push(`flag=1`);
		if (request.id) {
			wheres.push(`id <> ${request.id}`);
		}
		wheres.push(`DATE(time)=DATE('${request.time}')`);
		wheres.push(`point=${request.point}`);
		wheres.push(`state IN (10, 11)`);
		const sql = `UPDATE records SET flag=0, updated_at='${timestamp}', delete_user_id=-2 WHERE ${wheres.join(' AND ')}`;
		return this.database.executeSql(sql);
	}
	private postRemoveRetryNotice = (request: GlucoseMonitorModel): Promise<any> => {
		const wheres: string[] = [];
		const timestamp: string = UTILS.getFormattedDate(undefined, 1);
		wheres.push(`patient_id=${request.patient_id}`);
		wheres.push(`id <> ${request.id}`);
		wheres.push(`DATE(time)=DATE('${request.time}')`);
		wheres.push(`point=${request.point}`);
		const sql = `UPDATE notices SET flag=0, updated_at='${timestamp}' WHERE record_id IN (SELECT id FROM records WHERE ${wheres.join(' AND ')})`;
		return this.database.executeSql(sql);
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
	private async store(request: GlucoseMonitorModel): Promise<any> {
		const id = await this.getMaxValue('id', this._tableName);
		const timestamp: string = UTILS.getFormattedDate(undefined, 1);
		let state = request.state;
		if (request.state == 0 && request.value < 1.1) {
			state = 6;
		}
		if (request.state == 0 && request.value > 33.3) {
			state = 5;
		}
		const newRecord = {
			id: id + 3170,
			hospital_id: GLOBAL.curUser.hospital_id,
			patient_id: request.patient_id,
			time: request.time,
			point: request.point ? request.point : 0,
			value: request.value ? request.value : 0,
			eat_time: request.eat_time,
			user_id: GLOBAL.curUser.id,
			delete_user_id: -1,
			memo: request.memo ? request.memo : '',
			state: state,
			task_type: request.task_type ? request.task_type : 0,
			task_value: request.task_value ? request.task_value : 0,
			flag: 1,
			min: request.min ? request.min : 0,
			max: request.max ? request.max : 0,
			upload_flag: 0,
			updated_at: timestamp,
			created_at: timestamp
		};
		const wheres: string[] = [];
		wheres.push(`patient_id=${newRecord.patient_id}`);
		wheres.push(`flag=1`);
		wheres.push(`user_id=${newRecord.user_id}`);
		wheres.push(`time='${newRecord.time}'`);
		wheres.push(`state='${newRecord.state}'`);
		wheres.push(`point=${newRecord.point}`);
		wheres.push(`value=${newRecord.value}`);
		const checkSql = `SELECT id FROM ${this._tableName} WHERE ${wheres.join(' AND ')}`;

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
		const response = { success: false, record: undefined };
		const insertSql = `INSERT INTO ${this._tableName} (${bigqery}) VALUES (${values})`;
		await this.database.transaction(tx => {
			tx.executeSql(checkSql, [], (tx1, results) => {
				if (results.rows.length === 0) {
					tx1.executeSql(insertSql, field_values, (_, res) => {
						response.success = true;
						response.record = newRecord;
						AppSync.hasLocalUpdate = true;
					});
				}
			});
		});
		request.id = newRecord.id;
		await this.postGlucoseMoniterAction(request);
		if (!request.isRetry) {
			await this.postRemoveRetryNotice(request);
		}
		return response;
	}
	private async update(request: GlucoseMonitorModel): Promise<any> {
		let state = request.state;
		if (request.state == 0 && request.value < 1.1) {
			state = 6;
		}
		if (request.state == 0 && request.value > 33.3) {
			state = 5;
		}
		const newRecord: GlucoseMonitorModel = {
			id: request.id,
			patient_id: request.patient_id,
			time: request.time,
			point: request.point,
			value: request.value,
			hospital_id: GLOBAL.curUser.hospital_id,
			user_id: GLOBAL.curUser.id,
			state: state,
			updated_at: UTILS.getFormattedDate(undefined, 1)
		};
		if (request.delete_user_id == 0) newRecord.delete_user_id = -2;
		if (request.memo) { newRecord.memo = request.memo; }
		if (request.eat_time) { newRecord.eat_time = request.eat_time; }
		if (request.task_type) { newRecord.task_type = request.task_type; }
		// if (request.task_value) { newRecord.task_value = request.task_value; } else newRecord.delete_user_id = -1;
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

		const response = { success: false, record: undefined };
		await this.postGlucoseMoniterAction(request);
		await this.postRemoveRetryNotice(request);
		return this.database.executeSql(`UPDATE ${this._tableName} SET ${bigqery}, upload_flag=-ABS(upload_flag) WHERE id=${newRecord.id}`,
			field_values).then(() => {
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
		let del_user = 'delete_user_id=-2'
		if (request.delete_user_id == 0) del_user = 'delete_user_id=-2'
		else del_user = 'delete_user_id=-1'
		return this.database.executeSql(`UPDATE ${this._tableName} SET flag=0, updated_at='${updated_at}', upload_flag = -ABS(upload_flag), ${del_user} WHERE id = ${request.id}`).then(() => {
			if (__DEV__) console.info('success to delete');
			AppSync.hasLocalUpdate = true;
			return { success: true };
		}).catch((error) => {
			if (__DEV__) console.error('failed to delete', error);
			return { success: false };
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
