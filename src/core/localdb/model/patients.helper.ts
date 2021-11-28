import SQLite from 'react-native-sqlite-storage';
import {
	ResponseModel, RequestPatientModel, MonitorPatientModel, PatientModel,
	VisitModel, MANAGE_KIND, PatientMonitorRawModel, UserModel, UserSummary, RequestVisitModel,
} from '@src/core/model';
import { BaseHelper } from './base.helper';
import * as UTILS from '@src/core/app_utils';
import { AppSync } from '@src/core/appSync';
import GLOBAL from "@src/core/globals";
import moment from 'moment';
function delay(item) {
	return new Promise((resolve) =>
		setTimeout(() => {
			if (__DEV__) console.info(item);
			resolve();
		}, 500),
	);
}

export class PatientsHelper extends BaseHelper {
	private _tableName: string;
	private _viewName: string;

	constructor(database: SQLite.SQLiteDatabase, tableName: string, viewName: string) {
		super(database);
		this._tableName = tableName;
		this._viewName = viewName;
	}

	public mySelect(): Promise<any> {
		return this.select(`SELECT * FROM ${this._viewName}`).then((r) => {
			return r;
		}).catch((e) => {
			return e;
		});
	}
	public getPatientsRecordCount(reqParams: RequestPatientModel): Promise<any> {
		return this.select(`SELECT COUNT(*) FROM ${this._viewName} WHERE ${this.getParams(reqParams)}`)
			.then((r) => {
				const result = r.result[0];
				return { success: r.success, count: result[Object.keys(result)[0]] };
			}).catch((e) => {
				return e;
			});
	}

	public downloadPatients(reqParams: RequestPatientModel): Promise<any> {
		// console.log('start downloadPatients ---');
		return this.select(`SELECT * FROM ${this._viewName} WHERE ${this.getParams(reqParams)}`)
			.then((r) => {
				return r;
			}).catch((e) => {
				return e;
			});
	}
	public downloadInhosptials(reqParams: any): Promise<any> {
		const wheres: any[] = [];
		wheres.push(1);
		if (reqParams.patient_id) {
			wheres.push(`patient_id=${reqParams.patient_id}`);
		}
		// tslint:disable-next-line: max-line-length
		return this.select(`SELECT *, (SELECT name FROM patients WHERE id=patient_id) as patient_name, (SELECT name FROM departments WHERE id=department_id) as department_name, (SELECT name FROM users WHERE id=doctor_id) as doctor_name, (SELECT name FROM users WHERE id=nurse_id) as nurse_name, (SELECT io_hospital FROM states WHERE value=state) as state_name FROM in_out_hospital_records WHERE ${wheres.join(' AND ')} ORDER BY id DESC`);

	}
	public async getUsers(hospital_id: number): Promise<UserModel[]> {
		const sql = `SELECT id, nick, name, password FROM users `;
		const res = await this.select(sql);
		const users = res.result as UserModel[];
		return users;
	}
	public async downloadVisits(reqParams: RequestVisitModel | undefined) {
		const wheres: any[] = [];
		wheres.push(1);
		if (reqParams.patient_id) {
			wheres.push(`patient_id=${reqParams.patient_id}`);
		}
		// tslint:disable-next-line: max-line-length
		return this.select(`SELECT *, (SELECT name FROM patients WHERE id = patient_id) as patient_name, (SELECT name FROM departments WHERE id = department_id) as department_name, (SELECT name FROM users WHERE id = doctor_id) as doctor_name, (SELECT name FROM users WHERE id = user_id) as user_name, (SELECT visit FROM states WHERE value = state) as state_name FROM visit_records WHERE ${wheres.join(' AND ')} ORDER BY id DESC`);
	}
	public async storeVisit(vi_data: VisitModel) {
		const update_time = UTILS.getFormattedDate(undefined, 1);
		const keys = Object.keys(vi_data);
		const values: string[] = [];
		const bigqery: string[] = [];
		const field_values: any[] = [];
		keys.forEach((field, _index) => {
			if (vi_data[field]) {
				+
					bigqery.push(` ${field}`);
				values.push('?');
				field_values.push(vi_data[field]);
			}
		});
		field_values.push(0);
		values.push('?');
		bigqery.push(' state');
		field_values.push(GLOBAL.curUser.id);
		values.push('?');
		bigqery.push(' user_id');
		field_values.push(update_time);
		values.push('?');
		bigqery.push(' updated_at');

		field_values.push(update_time);
		values.push('?');
		bigqery.push(' created_at');
		const inId = await this.getMaxValue('id', 'visit_records');
		field_values.push(inId + 1);
		values.push('?');
		bigqery.push('id');
		const sql = `INSERT INTO visit_records(${bigqery.join(', ')}) VALUES(${values.join(', ')})`;
		return this.database.executeSql(sql, field_values);

	}
	public async downloadDoctorsOrders(reqParams: RequestDoctorsOrderModel | undefined): Promise<any> {
		const wheres: any[] = [];
		wheres.push('((EXISTS(SELECT 1 FROM measure_points WHERE measure_points.advice_id = advice_records.id)) OR (EXISTS(SELECT 1 FROM measure_times WHERE measure_times.advice_id = advice_records.id)))');
		if (reqParams.patient_id) {
			wheres.push(`patient_id=${reqParams.patient_id}`);
		}
		// if (reqParams.begin_time) {
		// 	const stime = UTILS.getFormattedDate(UTILS.modifyDate(reqParams.begin_time, 0, false, 0), 1);
		// 	wheres.push(`from_time>='${stime}'`);
		// }
		if (reqParams.end_time) {
			const etime = UTILS.getFormattedDate(UTILS.modifyDate(reqParams.end_time, 1, true, 0), 1);
			wheres.push(`from_time <='${etime}'`);
		}
		// tslint:disable-next-line: max-line-length
		const sql = `SELECT *, (SELECT name FROM users WHERE id = user_id) as user_name, (select advice from states where value = state) as state_name, (SELECT name FROM departments WHERE id = (SELECT department_id FROM users where id = user_id)) as department_name FROM advice_records WHERE ${wheres.join(' AND ')}`;
		// console.log(sql);
		const res: ResponseModel = await this.select(sql);
		const records: any[] = [];
		if (res.success) {
			const ret = res.result;
			for (const item of ret) {
				const day1 = await this.select(`SELECT id, advice_id, day FROM days WHERE advice_id=${item.id}`);
				item.days = [];
				if (day1.success) {
					item.days = day1.result;
				}
				item.points = [];
				const pnts = await this.select(`SELECT id, advice_id, point FROM measure_points  WHERE advice_id=${item.id}`);
				if (pnts.success) {
					item.points = pnts.result;
				}
				const times = await this.select(`SELECT GROUP_CONCAT(time) as times FROM measure_times  WHERE advice_id=${item.id} GROUP BY advice_id`);
				if (times.success) {
					item.times = times.result[0]?.times;
				}
				records.push(item);
			}
		}
		return records;
	}
	public async getPatientSummary(reqParams: RequestPatientModel): Promise<PatientMonitorRawModel[]> {
		if (reqParams.patient) reqParams.patient.is_in = 1;
		else reqParams.patient = { is_in: 1, id: 0, name: '' };

		const time = UTILS.getFormattedDate(reqParams.end_time, 1);
		const ytime = UTILS.getFormattedDate(UTILS.modifyDate(time, 1, false, 0), 1);
		const date = reqParams.end_time;
		const fdate = UTILS.getFirstDateofMonth(date);
		const fmDate = UTILS.getFormattedDate(fdate, 0);
		const edate = UTILS.getLastDateofMonth(date);
		const emDate = UTILS.getFormattedDate(edate, 0);
		// console.log(reqParams);
		// console.log(time);
		const dayOfWeek: number = UTILS.getDayofWeek(time);
		// tslint:disable-next-line: max-line-length
		const points = `(SELECT	GROUP_CONCAT(point) FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE	patient_id= View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point = 1 ) GROUP BY id > 0 ) AS points`;
		// tslint:disable-next-line: max-line-length
		const anytime = `(SELECT GROUP_CONCAT(id) FROM advice_records WHERE patient_id=View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek} ) AND is_point <> 1 AND id IN (SELECT advice_id FROM measure_times WHERE advice_id=advice_records.id ) GROUP BY is_point <> 1 ) as anytime`;
		// tslint:disable-next-line: max-line-length
		const apoints = `(SELECT GROUP_CONCAT(name) FROM points WHERE id IN (SELECT point FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id= View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point=1 ) ) GROUP BY flag) AS apoints`;
		// tslint:disable-next-line: max-line-length
		const atimes = `(SELECT GROUP_CONCAT(time) FROM measure_times  WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id = View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point<>1  ) GROUP BY id > 0) AS atimes`;
		// tslint:disable-next-line: max-line-length
		const record_obj = `(SELECT count(*) FROM records WHERE patient_id=View_Patients.id AND date(time) ="${date}" AND flag=1 AND state IN (0,5,6 )  GROUP BY id > 0 ) as record_obj`;
		const doctor_nick = `(SELECT nick FROM users WHERE id=View_Patients.doctor_id ) as doctor_nick`;
		const record_month = `(SELECT count(*) FROM records WHERE patient_id=View_Patients.id AND  state IN (0,5,6 ) AND date(time) >="${fmDate}" AND date(time) <="${emDate}" AND flag=1   GROUP BY id > 0 ) as record_month`;
		const record_all = `(SELECT count(*) FROM records WHERE patient_id=View_Patients.id AND flag=1 AND state IN (0,5,6 ) AND DATE(time) >= DATE(View_Patients.in_date)  GROUP BY id > 0 ) as record_all`;
		// tslint:disable-next-line: max-line-length
		const notice_obj = `(SELECT id || '%' || type || '%' || notice || '%' ||  date || '%' ||  task_type || '%' ||  task_value FROM notices WHERE flag = 1 AND patient_id=View_Patients.id AND date= "${date}" ORDER BY id desc ) as notice_obj`;
		// tslint:disable-next-line: max-line-length
		const sql = `SELECT id,bed_number, patient_number, name, doctor_id, nurse_id, department_name, alarm_max, alarm_min,target_after_max,target_after_min, target_before_max, target_before_max, in_days, doctor_name, in_date, ${points}, ${anytime}, ${apoints}, ${atimes}, ${record_obj}, ${record_all}, ${record_month}, ${doctor_nick} FROM ${this._viewName} WHERE ${this.getParams(reqParams, time)}`;
		const res: ResponseModel = await this.select(sql);
		if (res.success && res.result.length) {
			return res.result.map(item => {
				const _it = item as PatientMonitorRawModel;
				const advice = this.getAdvicePoints(_it, time);
				_it.advice = [...advice];
				// _it.record = this.getRecordObject(_it);
				// _it.notice = this.getNoticeObject(_it);
				return _it;
			});
		} else {
			return [];
		}
	}
	public async getUsersSummary(reqParams: RequestPatientModel): Promise<UserSummary[]> {
		const date = reqParams.end_time;
		const months = `(SELECT COUNT(*) FROM records WHERE user_id=users.id and flag=1 and state in (0,5,6) AND STRFTIME('%Y-%m', time) = STRFTIME('%Y-%m', '${date}')) as months`;
		const todays = `(SELECT COUNT(*) FROM records WHERE user_id=users.id and flag=1 and state in (0,5,6) and STRFTIME('%Y-%m-%d', time) = STRFTIME('%Y-%m-%d', '${date}')) as todays`;
		const sql = `SELECT *, (SELECT name FROM departments WHERE id=users.department_id) AS department_name, ${months}, ${todays} FROM users WHERE hospital_id=${GLOBAL.curHospitalId} AND months > 0`;
		const res: ResponseModel = await this.select(sql);
		if (res.success && res.result.length) {
			const users = res.result as UserSummary[];
			return users;
		} else {
			return [];
		}
	}
	public async getMonitorPatients(reqParams: RequestPatientModel): Promise<PatientMonitorRawModel[]> {
		if (reqParams.patient) reqParams.patient.is_in = 1;
		else reqParams.patient = { is_in: 1, id: 0, name: '' };

		const time = UTILS.getFormattedDate(undefined, 1);
		const ytime = UTILS.getFormattedDate(UTILS.modifyDate(time, 1, false, 0), 1);
		const date = UTILS.getFormattedDate(undefined, 0);
		// console.log(reqParams);
		// console.log(time);
		const dayOfWeek: number = UTILS.getDayofWeek(time);
		// tslint:disable-next-line: max-line-length
		const points = `(SELECT	GROUP_CONCAT(point) FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE	patient_id= View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point = 1 ) GROUP BY id > 0 ) AS points`;
		// tslint:disable-next-line: max-line-length
		const anytime = `(SELECT GROUP_CONCAT(id) FROM advice_records WHERE patient_id=View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek} ) AND is_point <> 1 AND id IN (SELECT advice_id FROM measure_times WHERE advice_id=advice_records.id ) GROUP BY is_point <> 1 ) as anytime`;
		// tslint:disable-next-line: max-line-length
		const apoints = `(SELECT GROUP_CONCAT(name) FROM points WHERE id IN (SELECT point FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id= View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point=1 ) ) GROUP BY flag) AS apoints`;
		// tslint:disable-next-line: max-line-length
		const atimes = `(SELECT GROUP_CONCAT(time) FROM measure_times  WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id = View_Patients.id AND from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point<>1  ) GROUP BY id > 0) AS atimes`;
		// tslint:disable-next-line: max-line-length
		const record_obj = `(SELECT id || '%' || time || '%' || point || '%' || value || '%' || user_id || '%' || state ||  '%' || min || '%' || max || '%' || task_type || '%' || task_value || '%' || flag || '%' || delete_user_id FROM records WHERE patient_id=View_Patients.id AND time BETWEEN "${ytime}" AND "${time}" and flag=1 ORDER BY time desc ) as record_obj`;
		// tslint:disable-next-line: max-line-length
		const notice_obj = `(SELECT id || '%' || type || '%' || notice || '%' ||  date || '%' ||  task_type || '%' ||  task_value FROM notices WHERE flag = 1 AND patient_id=View_Patients.id AND date= "${date}" ORDER BY id desc ) as notice_obj`;
		// tslint:disable-next-line: max-line-length
		const sql = `SELECT id, bed_number, name, doctor_id, nurse_id, department_name, alarm_max, alarm_min,target_after_max,target_after_min, target_before_max, target_before_max, in_days, doctor_name, ${points}, ${anytime}, ${apoints}, ${atimes}, ${record_obj}, ${notice_obj} FROM ${this._viewName} WHERE ${this.getParams(reqParams, time)}`;
		const res: ResponseModel = await this.select(sql);
		if (res.success && res.result.length) {
			return res.result.map(item => {
				const _it = item as PatientMonitorRawModel;
				const advice = this.getAdvicePoints(_it, time);
				const atimes = this.processAdviceTimes(_it, time);
				_it.advice = [...advice];
				_it.atimes = atimes;
				_it.record = this.getRecordObject(_it);
				_it.notice = this.getNoticeObject(_it);
				return _it;
			});
		} else {
			return [];
		}
		// console.log(sql);
		// return this.select(sql).then(async (r) => {
		// 	if (r.success) {
		// 		this.setDetail2Patient(r.result, time, ytime);
		// 	}
		// 	return r;
		// }).catch((e) => {
		// 	return e;
		// });
	}
	public async getUncheckedCount(): Promise<number> {
		const sql = 'SELECT COUNT(*) as cnt FROM records WHERE delete_user_id = -1 OR delete_user_id=-2';
		const res = await this.select(sql);
		if (res.result) {
			const cnt = res.result[0].cnt as number;
			return cnt;
		}
		return 0;
	}
	public downloadMonitorPatients(reqParams: RequestPatientModel): Promise<ResponseModel> {
		// is_detail=1
		if (reqParams.patient) reqParams.patient.is_in = 1;
		else reqParams.patient = { is_in: 1 };

		const time = UTILS.getFormattedDate(undefined, 1);
		const ytime = UTILS.getFormattedDate(UTILS.modifyDate(time, 1, false, 0), 1);
		const date = UTILS.getFormattedDate(undefined, 0);
		// console.log(reqParams);
		// console.log(time);
		const dayOfWeek: number = UTILS.getDayofWeek(time);
		// tslint:disable-next-line: max-line-length
		const points = `(SELECT	GROUP_CONCAT(point) FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE	patient_id= View_Patients.id AND from_time <= "${time}" AND (to_time='' OR to_time >='${time}') AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point = 1 ) GROUP BY id > 0 ) AS points`;
		// tslint:disable-next-line: max-line-length
		const anytime = `(SELECT GROUP_CONCAT(id) FROM advice_records WHERE patient_id=View_Patients.id AND from_time <= '${time}' AND (to_time='' OR to_time >='${time}') AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek} ) AND is_point <> 1 AND id IN (SELECT advice_id FROM measure_times WHERE advice_id=advice_records.id ) GROUP BY is_point <> 1 ) as anytime`;
		// tslint:disable-next-line: max-line-length
		const apoints = `(SELECT GROUP_CONCAT(name) FROM points WHERE id IN (SELECT point FROM measure_points WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id= View_Patients.id AND from_time <= '${time}' AND (to_time='' OR to_time >='${time}') AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point=1 ) ) GROUP BY flag) AS apoints`;
		// tslint:disable-next-line: max-line-length
		const atimes = `(SELECT GROUP_CONCAT(time) FROM measure_times  WHERE advice_id IN (SELECT id FROM advice_records WHERE patient_id = View_Patients.id AND from_time <='${time}' AND (to_time='' OR to_time >='${time}') AND id IN ( SELECT advice_id FROM days WHERE day=${dayOfWeek}) AND is_point<>1  ) GROUP BY id > 0) AS atimes`;
		// tslint:disable-next-line: max-line-length
		const record_obj = `(SELECT id || '%' || time || '%' || point || '%' || value || '%' || user_id || '%' || state ||  '%' || min || '%' || max || '%' || task_type || '%' || task_value || '%' || flag FROM records WHERE patient_id=View_Patients.id AND time BETWEEN '${ytime}' AND '${time}' and flag=1 ORDER BY time desc ) as record_obj`;
		// tslint:disable-next-line: max-line-length
		const notice_obj = `(SELECT id || '%' || type || '%' || notice || '%' ||  date || '%' ||  task_type || '%' ||  task_value FROM notices WHERE flag = 1 AND patient_id=View_Patients.id AND date= '${date}' ORDER BY id desc ) as notice_obj`;
		// tslint:disable-next-line: max-line-length
		const sql = `SELECT id, bed_number, name, doctor_id, nurse_id, department_name, alarm_max, alarm_min,target_after_max,target_after_min, target_before_max, target_before_max, ${points}, ${anytime}, ${apoints}, ${atimes}, ${record_obj}, ${notice_obj} FROM ${this._viewName} WHERE ${this.getParams(reqParams, time)}`;
		// console.log(sql);
		return this.select(sql).then(async (r) => {
			if (r.success) {
				this.setDetail2Patient(r.result, time, ytime);
			}
			return r;
		}).catch((e) => {
			return e;
		});
	}

	private getParams = (reqParams: RequestPatientModel | undefined, time: string = undefined) => {
		let params = '1' + this.getUserPatientsParams();
		if (reqParams && reqParams.o_doctor_id) params += ` AND doctor_id=${reqParams.o_doctor_id}`;
		if (reqParams && reqParams.o_nurse_id) params += ` AND nurse_id=${reqParams.o_nurse_id}`;
		if (reqParams.patient) {
			if (reqParams.patient.id) params += ` AND id = ${reqParams.patient.id}`;
			if (reqParams.patient.name) params += ` AND name like '%${reqParams.patient.name}%'`;
			if (reqParams.patient.mobile) params += ` AND mobile like '%${reqParams.patient.mobile}%'`;
			if (reqParams.patient.is_in != undefined) params += ` AND is_in=${reqParams.patient.is_in}`;
			if (reqParams.patient.doctor_id) params += ` AND doctor_id=${reqParams.patient.doctor_id}`;
			if (reqParams.patient.nurse_id) params += ` AND nurse_id=${reqParams.patient.nurse_id}`;
		}
		if (reqParams.departments && reqParams.departments.length > 0) {
			params += ` AND department_id IN (${reqParams.departments.join(',')})`;

		}
		if (reqParams.patients && reqParams.patients.length > 0) {
			params += ` AND id IN (${reqParams.patients.join(',')})`;
		}
		if (reqParams.bed_number) {
			params += ` AND bed_number='${reqParams.bed_number}'`;
		}
		if (reqParams.mobile) {
			params += ` AND mobile='${reqParams.mobile}'`;
		}
		if (reqParams.patient_number) {
			params += ` AND patient_number='${reqParams.patient_number}'`;
		}

		// if (reqParams.has_advice !== undefined) {
		// 	const dayOfWeek = UTILS.getDayofWeek(time);
		// 	// tslint:disable-next-line: max-line-length
		// tslint:disable-next-line: max-line-length
		// 	params += ` AND ${reqParams.has_advice === 0 ? 'NOT' : ''} (id IN (SELECT patient_id FROM advice_records WHERE from_time <= "${time}" AND (to_time="" OR to_time >="${time}") AND id IN (SELECT advice_id FROM days WHERE day=${dayOfWeek} ) AND (id IN (SELECT advice_id FROM measure_times) OR id IN (SELECT advice_id from measure_points)))`;
		// }
		if (reqParams.no_record_begin_time) {
			if (reqParams.no_record_end_time) {
				params += ` AND NOT id IN (SELECT patient_id FROM records WHERE DATETIME(time) BETWEEN "${reqParams.no_record_begin_time}" AND "${reqParams.no_record_end_time}")`;
			} else {
				params += ` AND NOT id IN (SELECT patient_id FROM records WHERE DATETIME(time) BETWEEN "${reqParams.no_record_begin_time}" AND DATETIME("now"))`;
			}
		}
		if (reqParams.patient && reqParams.patient.o_doctor_id) {
			params += ` AND doctor_id=${reqParams.patient.o_doctor_id} `;
		}
		if (reqParams.patient && reqParams.patient.o_nurse_id) {
			params += ` AND nurse_id=${reqParams.patient.o_nurse_id} `;
		}

		if (reqParams.is_cure) {
			const update_time = UTILS.getFormattedDate(reqParams.begin_time, 0);
			const hour = moment().get('hour');
			if (hour > 11) {
				const nxt_day = moment(reqParams.begin_time).add(1, 'days').format('YYYY-MM-DD');
				// tslint:disable-next-line: max-line-length
				params += ` AND id IN ( SELECT  patient_id FROM insulin_advices WHERE id IN (SELECT advice_id FROM insulin_inject_actions WHERE DATE(ex_date) >='${update_time}' AND DATE(ex_date) <= '${nxt_day}'))`;
			} else {
				params += ` AND id IN ( SELECT  patient_id FROM insulin_advices WHERE id IN (SELECT advice_id FROM insulin_inject_actions WHERE DATE(ex_date)='${update_time}'))`;
			}

		}
		// 2020-04-10
		// params += ` ORDER BY department_id, CAST(bed_number AS int), CAST(patient_number AS int)`;
		const orders: any[] = [];
		if (reqParams.patient.o_doctor_id) {
			orders.push(`(doctor_id=${reqParams.patient.o_doctor_id}) DESC`);
		}
		if (reqParams.patient.o_nurse_id) {
			orders.push(`(nurse_id=${reqParams.patient.o_nurse_id}) DESC`);
		}
		if (reqParams.o_doctor_id) {
			orders.push(`(doctor_id=${reqParams.o_doctor_id}) DESC`);
		}
		if (reqParams.o_nurse_id) {
			orders.push(`(nurse_id=${reqParams.o_nurse_id}) DESC`);
		}
		if (reqParams.patient.is_in === 0) {
			orders.push('out_date DESC');
		} else {
			orders.push('CAST(bed_number AS int), bed_number');
		}

		params += ` ORDER BY ${orders.join(' ,')}`;
		// else
		// params += ` ORDER BY CAST(bed_number AS int), bed_number`;
		if (reqParams.from && reqParams.count) {
			params += ` LIMIT ${reqParams.from}, ${reqParams.from + reqParams.count}`;
		}

		// console.log(params);
		return params;
	};
	/**
	 * name
	 */
	public getCurePatients = (reqParams: RequestPatientModel): Promise<PatientModel[]> => {
		const sql = `SELECT * FROM ${this._viewName} WHERE ${this.getParams(reqParams)}`;
		return this.select(sql).then(res => {
			return <PatientModel[]>res.result;
		}).catch(err => {
			return [];
		});

	}

	private setDetail2Patient(patients: PatientMonitorRawModel[], time: string, ytime: string) {
		// const promises = patients.map(item => {
		//   this.advicePoints(item, time);
		// });
		// await Promise.all(promises);
		for (const item of patients) {
			this.advicePoints(item, time);
			this.toRecord(item);
			this.toNotice(item);
			// await this.records(item, time, ytime);
			// await this.notices(item);
		}
		if (__DEV__) console.info('***************** all promise Done!');
	}
	private toRecord(patient: PatientMonitorRawModel) {
		if (patient.record_obj != null) {
			const record_obj = patient.record_obj;
			const obj: any[] = record_obj.split('%');
			const record: any = { patient_id: patient.id };
			record.id = obj[0];
			record.time = obj[1];
			record.point = obj[2];
			record.value = Number(obj[3]);
			record.user_id = obj[4];
			record.state = obj[5];
			record.min = Number(obj[6]);
			record.max = Number(obj[7]);
			record.task_type = obj[8];
			record.task_value = obj[9];
			record.alarm_max = patient.alarm_max;
			record.alarm_min = patient.alarm_min;
			record.target_after_max = patient.target_after_max;
			record.target_after_min = patient.target_after_min;
			record.target_before_max = patient.target_before_max;
			record.target_before_min = patient.target_before_min;
			patient.record = record;
		}

	}
	private toNotice(patient: PatientMonitorRawModel) {
		if (patient.notice_obj != null) {
			const record_obj = patient.notice_obj;
			const obj: any[] = record_obj.split('%');
			const notice: any = {};
			notice.id = obj[0];
			notice.type = obj[1];
			notice.notice = obj[2];
			notice.date = obj[3];
			notice.task_type = obj[4];
			notice.task_value = obj[5];
			patient.notice = notice;
		}
	}
	private getAdvicePoints(patient: PatientMonitorRawModel, time: string) {
		const dayOfWeek: number = UTILS.getDayofWeek(time);
		const resultPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		if (patient.anytime !== null) {
			resultPoints[UTILS.getAnytimePoint(true)] = 1;
		}
		if (patient.points !== null) {
			const poss: string = patient.points;
			// console.log(poss);
			const points: string[] = poss.split(',');
			for (const pos of points) {
				resultPoints[pos] = 1;
			}
		}
		return resultPoints;
	}
	private processAdviceTimes(patient: PatientMonitorRawModel, time: string) {
		const atimes = patient.atimes;
		const stimes: string[] = [];
		if (atimes && atimes.length > 0) {
			const ats = atimes.split(',');
			ats.forEach(_tm => {
				if (stimes.findIndex((_id) => _id == _tm) < 0) {
					stimes.push(_tm);
				}
			});
			return stimes.sort().join(', ');
		}
		return '';
	}
	private getRecordObject(patient: PatientMonitorRawModel) {
		if (patient.record_obj != null) {
			const record_obj = patient.record_obj;
			const obj: any[] = record_obj.split('%');
			const record: any = { patient_id: patient.id };
			record.id = obj[0];
			record.time = obj[1];
			record.point = obj[2];
			record.value = Number(obj[3]);
			record.user_id = obj[4];
			record.state = obj[5];
			record.min = Number(obj[6]);
			record.max = Number(obj[7]);
			record.task_type = obj[8];
			record.task_value = obj[9];
			record.delete_user_id = obj[11];
			record.alarm_max = patient.alarm_max;
			record.alarm_min = patient.alarm_min;
			record.target_after_max = patient.target_after_max;
			record.target_after_min = patient.target_after_min;
			record.target_before_max = patient.target_before_max;
			record.target_before_min = patient.target_before_min;
			return record;
			//// patient.record = record;
		}
		return undefined;
	}
	private getNoticeObject(patient: PatientMonitorRawModel) {
		if (patient.notice_obj != null) {
			const record_obj = patient.notice_obj;
			const obj: any[] = record_obj.split('%');
			const notice: any = {};
			notice.id = obj[0];
			notice.type = obj[1];
			notice.notice = obj[2];
			notice.date = obj[3];
			notice.task_type = obj[4];
			notice.task_value = obj[5];
			return notice;
			//// patient.notice = notice;
		}
		return undefined;
	}
	public async updateData(data: PatientModel, kind: MANAGE_KIND): Promise<any> {
		if (data.doctor_id === undefined) {
			data.doctor_id = 0;
		}
		if (data.nurse_id === undefined) {
			data.nurse_id = 0;
		}
		if (data.out_date === undefined) {
			data.out_date = '';
		}
		const bigqery: any[] = [];
		const bigqery1: any[] = [];
		const keys = Object.keys(data);
		const field_values: any[] = [];
		const field_values1: any[] = [];
		const update_time = UTILS.getFormattedDate(undefined, 1);
		if (kind === MANAGE_KIND.ADD) {
			const id = await this.getMaxValue('id', this._tableName);
			const values: any[] = [];
			const values1: any[] = [];
			keys.forEach((key, index) => {
				// tslint:disable-next-line: max-line-length
				if (key !== 'notice' && key !== 'age' && key !== 'safe_ranges' && key !== 'department_name' && key !== 'doctor_name' && key !== 'nurse_name' && key !== 'area_id' && key !== 'in_days' && key !== 'area_name') {
					bigqery.push(` ${key}`);
					values.push('?');
					field_values.push(data[key]);
				}
			});
			field_values.push(GLOBAL.curHospitalId);
			values.push('?');
			bigqery.push(' hospital_id');

			field_values.push(kind);
			values.push('?');
			bigqery.push(' flag');

			field_values.push(1);
			values.push('?');
			bigqery.push(' is_in');
			field_values.push(id + 1);
			values.push('?');
			bigqery.push(' id');
			field_values.push(update_time);
			values.push('?');
			bigqery.push(' updated_at');

			field_values.push(update_time);
			values.push('?');
			bigqery.push(' created_at');


			const response = { success: false, record: undefined };
			{
				const inId = await this.getMaxValue('id', 'in_out_hospital_records');
				field_values1.push(id);
				bigqery1.push('patient_id');
				values1.push('?');

				field_values1.push(inId + 1);
				bigqery1.push('id');
				values1.push('?');

				field_values1.push(update_time);
				values1.push('?');
				bigqery1.push(' updated_at');

				field_values1.push(update_time);
				values1.push('?');
				bigqery1.push(' created_at');

				field_values1.push(data.department_id);
				values1.push('?');
				bigqery1.push(' department_id');

				field_values1.push(data.doctor_id);
				values1.push('?');
				bigqery1.push(' doctor_id');

				field_values1.push(data.nurse_id);
				values1.push('?');
				bigqery1.push(' nurse_id');

				field_values1.push(data.in_date);
				values1.push('?');
				bigqery1.push(' in_date');

				field_values1.push(1);
				values1.push('?');
				bigqery1.push(' state');

				field_values1.push(-1);
				values1.push('?');
				bigqery1.push(' his_code');
			}
			const inhospSql = `INSERT INTO in_out_hospital_records(${bigqery1.join(', ')}) VALUES(${values1.join(', ')})`;
			return this.database.executeSql(`INSERT INTO ${this._tableName}(${bigqery.join(',')}) VALUES(${values.join(',')})`, field_values).then(async () => {
				await this.database.executeSql(inhospSql, field_values1);
				response.success = true;
				response.record = data;
				AppSync.hasLocalUpdate = true;
				return response;
			}).catch((e) => {
				return response;
			});
		} else {
			if (kind === MANAGE_KIND.IN) {
				const values: any[] = [];
				const fields: any[] = [];
				const valued: any[] = [];
				keys.forEach((key, index) => {
					if (key === 'patient_id'
						|| key === 'department_id'
						|| key === 'doctor_id'
						|| key === 'nurse_id'
						|| key === 'in_date') {
						fields.push(` ${key}`);
						values.push('?');
						valued.push(data[key]);
					}
					if (key === 'id') {
						fields.push(' patient_id ');
						values.push('?');
						valued.push(data[key]);
					}
				});
				values.push('?');
				fields.push('created_at');
				valued.push(update_time);
				values.push('?');
				fields.push('updated_at');
				valued.push(update_time);

				values.push('?');
				fields.push('state');
				valued.push(1);

				// tslint:disable-next-line: max-line-length
				await this.database.executeSql(`INSERT INTO in_out_hospital_records(${fields.join(', ')}) VALUES(${values.join(',')})`, valued);
			}
			if (kind === MANAGE_KIND.OUT) {
				// const values: any[] = [];
				const fields: any[] = [];
				const valued: any[] = [];
				keys.forEach((key, index) => {
					if (key === 'patient_id'
						|| key === 'department_id'
						|| key === 'doctor_id' ||
						key === 'nurse_id' ||
						key === 'in_date' ||
						key === 'out_date') {
						fields.push(` ${key}=?`);
						// values.push('?');
						valued.push(data[key]);
					}
				});
				// // values.push('?');
				// fields.push('out_date=?');
				// valued.push(data['data']);
				// values.push('?');
				fields.push('updated_at=?');
				valued.push(update_time);

				fields.push('state=?');
				valued.push(2);

				const sql = `SELECT id FROM in_out_hospital_records WHERE patient_id=${data.id} ORDER BY id DESC`;
				const res: ResponseModel = await this.select(sql);
				if (res.success && res.result.length) {
					const rs = res.result[0];
					// tslint:disable-next-line: max-line-length
					await this.database.executeSql(`UPDATE in_out_hospital_records SET ${fields.join(', ')} WHERE id=${rs.id}`, valued);
				}

			}
			keys.forEach((key, index) => {
				if (key !== 'notice'
					&& key !== 'age'
					&& key !== 'safe_ranges'
					&& key !== 'department_name'
					&& key !== 'doctor_name'
					&& key !== 'nurse_name'
					&& key !== 'area_id'
					&& key !== 'in_days'
					&& key !== 'area_name'
					&& key !== 'hospital_name') {
					bigqery.push(` ${key} =? `);
					field_values.push(data[key]);
				}
			});

			field_values.push(update_time);
			bigqery.push(' updated_at=?');
			field_values.push(kind);
			bigqery.push(' flag=?');
			const response = { success: false, record: undefined };
			return this.database.executeSql(`UPDATE ${this._tableName} SET ${bigqery.join(', ')} WHERE id=${data.id}`, field_values).then(() => {
				response.success = true;
				response.record = data;
				AppSync.hasLocalUpdate = true;
				return response;
			}).catch((e) => {
				return response;
			});
		}
	}
	private advicePoints(patient: PatientMonitorRawModel, time: string) {
		// console.log('--------------- advice points ' + patient.id);
		const dayOfWeek: number = UTILS.getDayofWeek(time);
		const resultPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		if (patient.anytime !== null) {
			resultPoints[UTILS.getAnytimePoint(true)] = 1;
		}
		if (patient.points !== null) {
			const poss: string = patient.points;
			// console.log(poss);
			const points: string[] = poss.split(',');
			for (const pos of points) {
				resultPoints[pos] = 1;
			}
		}
		patient.advice = [...resultPoints];
		// tslint:disable-next-line: max-line-length
		// const sql = `SELECT GROUP_CONCAT(id) as ids, is_point, state FROM advice_records WHERE patient_id = ${patient.id} AND from_time <= "${time}" AND(to_time = "" OR to_time >= "${time}") AND id IN(SELECT advice_id FROM days WHERE day = ${dayOfWeek}) GROUP BY is_point`;
		// const response: ResponseModel = await this.select(sql);
		// if (response) {
		// 	if (response.success) {
		// 		const advices = response.result;
		// 		for (const item of advices) {
		// 			if (item.is_point === 1) {
		// 				const sql1 = `SELECT point FROM measure_points WHERE advice_id IN(${item.ids}) GROUP BY point`;
		// 				const response1: ResponseModel = await this.select(sql1);
		// 				if (response1.success) {
		// 					response1.result.forEach((point) => {
		// 						resultPoints[point.point] = 1;
		// 					});
		// 				}
		// 			} else resultPoints[UTILS.getAnytimePoint(true)] = 1;
		// 		}
		// 	}
		// 	patient.advice = [...resultPoints];
		// }
	}

	private async records(patient: PatientModel, time: string, ytime: string) {
		// console.log('--------------- records ' + patient.id);
		// tslint:disable-next-line: max-line-length
		const sql = `SELECT id, time, point, value, user_id, state, memo, min, max, task_type, task_value, flag, upload_flag FROM records WHERE patient_id = ${patient.id} AND time BETWEEN "${ytime}" AND "${time}" ORDER BY time desc LIMIT 0, 1`;
		// console.log(sql);
		const response: ResponseModel = await this.select(sql);
		if (response) {
			if (response.success && response.result.length > 0) {
				const record = response.result[0];
				record.alarm_max = patient.alarm_max;
				record.alarm_min = patient.alarm_min;
				record.target_after_max = patient.target_after_max;
				record.target_after_min = patient.target_after_min;
				record.target_before_max = patient.target_before_max;
				record.target_before_min = patient.target_before_min;
				patient.record = record;
			}
		}
	}
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
	private async notices(patient: PatientModel) {
		// console.log('--------------- notices ' + patient.id);
		const date = UTILS.getFormattedDate(undefined, 0);
		const sql = `SELECT id, type, notice, date, task_type, task_value FROM notices WHERE flag = 1 AND patient_id = ${patient.id} AND date = "${date}" ORDER BY id desc LIMIT 0, 1`;
		const response: ResponseModel = await this.select(sql);
		if (response) {
			if (response.success && response.result.length > 0) {
				patient.notice = response.result[0];
			}
		}
	}
}
