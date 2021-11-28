import SQLite from 'react-native-sqlite-storage';
import {
	ResponseModel,
	RequestPatientModel,
	MonitorPatientModel,
	PatientModel,
	RequestTaskDataModel,
	TaskDataModel
} from '@src/core/model';
import { BaseHelper } from './base.helper';
import * as UTILS from '@src/core/app_utils';
import moment from 'moment';
import GLOBAL from '@src/core/globals';
function delay(item) {
	return new Promise((resolve) =>
		setTimeout(() => {
			if (__DEV__) console.info(item);
			resolve();
		}, 500)
	);
}

export class TasksHelper extends BaseHelper {
	private _tableName: string;
	private _viewName: string;
	constructor(database: SQLite.SQLiteDatabase) {
		super(database);
	}
	public async downloadTasksMin(request: MonitorPatientModel): Promise<TaskDataModel[]> {
		const points: any[] = [];
		const res: TaskDataModel[] = [];
		const atimes = request.atimes;
		request.advice.forEach((item, id) => {
			if (item === 1) points.push(id);
		});
		if (points.length > 0) {
			// let task1: TaskDataModel = { task_type: 1, task_value: 0 };
			const sql = `SELECT 1 as task_type, 0 as task_value, id FROM points WHERE id IN( ${points.join(',')})`;
			const task1: ResponseModel = await this.select(sql);
			if (task1.success) {
				for (const it of task1.result) {
					const tk: TaskDataModel = it;
					// tk.task_detail.id = it.id;
					tk.task_detail = { id: it.id, point: it.id };
					res.push(tk);
				}
			}
		}
		if (atimes != null && atimes.length > 0) {
			const ats: any[] = atimes.split(',');
			for (const it of ats) {
				const tk: TaskDataModel = { task_type: 2, task_value: 0 };
				tk.task_detail = { id: 9, time: it };
				res.push(tk);
			}
		}
		return res;
	}
	public async downloadTasks(request: RequestTaskDataModel): Promise<any> {
		const start = request.day;
		const end = UTILS.getFormattedDate(UTILS.modifyDate(start, 1, true, 0), 0);
		const point = request.point >= 0 ? request.point : -1;

		let query: string;
		let query_temp: string;
		if (request.patient_id) {
			// 개별환자의 미션들...  포인트 무시..
			if (request.is_completed === 1) {
				query_temp = this.apiTasks(true, start, -1, request.patient_id);
			} else if (request.is_completed === 0) {
				query_temp = this.apiTasks(false, start, -1, request.patient_id);
			} else {
				query_temp = this.apiAllTasks(start, -1, request.patient_id);
			}
			query = query_temp;
		} else {
			// 포인트별 전체환자들의 미션들...  환자아이디 무시...
			if (request.is_completed === 1) {
				query_temp = this.apiTasks(true, start, point, -1);
			} else if (request.is_completed === 0) {
				query_temp = this.apiTasks(false, start, point, -1);
			} else {
				query_temp = this.apiAllTasks(start, point, -1);
			}

			query = `SELECT * FROM (${query_temp}) WHERE 1`;
			if (request.is_charge === 1) {
				query += ` AND (doctor_id=${GLOBAL.curUser.id} OR nurse_id=${GLOBAL.curUser.id})`;
			}
			if (request.departments) {
				if (request.departments.length > 0) {
					query += ` AND department_id IN (${request.departments.join(',')})`;
				}
				// request.departments.forEach((id, index) => {
				// 	if (index === 0) {
				// 		query += ` AND (department_id=${id}`;
				// 	} else {
				// 		query += ` OR department_id=${id}`;
				// 	}
				// 	if (index === request.departments.length - 1) {
				// 		query += `)`;
				// 	}
				// });
			}
			if (request.patients) {
				if (request.patients.length > 0) {
					query += ` AND id IN (${request.patients.join(',')})`;
				}
			}
			query += ' ORDER BY CAST(bed_number AS int)';
		}

		const sql = `${query}`;
		// console.log(sql);
		const res: ResponseModel = await this.select(sql);
		// console.log(res);
		if (res.success) {
			await this.setDetail2Task(res.result, start, end);
			return res;
		} else {
			return res;
		}
		// return this.select(sql).then(async (r) => {
		// 	if (r.success) {
		// 		await this.setDetail2Task(r.result, start, end);
		// 	}
		// 	return r;
		// })
		// 	.catch((e) => {
		// 		return e;
		// 	});
	}
	private apiTasks(isCompleted: boolean, day: string, point: number, patientId: number) {
		let select_fields = '*';
		let where_params = '';
		let orderby_params = '';
		let query_tasks_1: string;
		let query_tasks_2: string;
		let query_tasks_3: string;
		let query_temp: string;

		/**task type 1 : by point */
		select_fields = `View_Patients.*, 1 AS task_type, measure_points.id as task_value`;

		query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN measure_points ON View_Patients.id = (SELECT patient_id FROM advice_records WHERE id = measure_points.advice_id)`;

		// orderby_params = `GROUP BY patients.id, measure_points.point ORDER BY measure_points.point `;
		// 2020-05-13
		orderby_params = `GROUP BY View_Patients.id, measure_points.point ORDER BY CAST(View_Patients.bed_number AS int) `;

		const dayOfWeek = UTILS.getDayofWeek(day);
		// tslint:disable-next-line: max-line-length
		where_params = `WHERE EXISTS (SELECT id FROM advice_records WHERE id=measure_points.advice_id AND DATE(from_time) <= "${day}" AND ( to_time='' OR to_time >= "${day}"))`;

		// where_params += ` AND (SELECT EXISTS(SELECT 1 FROM days WHERE advice_id = measure_points.advice_id AND day=${dayOfWeek})) = 1 `;
		where_params += ` AND EXISTS(SELECT id FROM days WHERE advice_id=measure_points.advice_id AND day=${dayOfWeek})`;
		where_params += ` AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND View_Patients.is_in=1 `;
		if (point >= 0) where_params += ` AND measure_points.point = ${point} `;
		if (patientId >= 0) {
			where_params += ` AND View_Patients.id = ${patientId} `;
		} else {
			// FIXME: for boss or admin hard coded level 4
			if (GLOBAL.curUser.job_position_level <= 4 && GLOBAL.curUser.is_admin != 1) {
				// const relatedDepartments = $this->relatedDepartments();
				// $second = $second->where(function ($query) use ($relatedDepartments) {
				//     $query = $query->where('patients.department_id', '=', $this->department_id);
				//     foreach ($relatedDepartments as $index => $value) {
				//         $query = $query->orWhere('patients.department_id', '=', $value->department_id);
				//     }
				// });
				// where_params += ` AND patients.department_id in (select department_id from user_related_departments where user_id=${GLOBAL.curUser.id}) `;
			}
		}
		// add is completed
		/// ) = ${isCompleted ? 1 : 0}
		// tslint:disable-next-line: max-line-length
		where_params += ` AND  ${isCompleted ? 'EXISTS' : 'NOT EXISTS'} (SELECT id FROM records WHERE flag=1 AND patient_id IN (SELECT patient_id FROM advice_records WHERE id=measure_points.advice_id) AND point=measure_points.point AND DATE(time)="${day}") `;
		// tslint:disable-next-line: max-line-length
		// where_params += ` AND (SELECT EXISTS(SELECT 1 FROM records WHERE flag=1 AND patient_id = (SELECT patient_id FROM advice_records WHERE id = measure_points.advice_id) AND point = measure_points.point AND DATE(time) = "${day}")) = ${isCompleted ? 1 : 0} `;

		query_tasks_1 = `${query_temp} ${where_params} ${orderby_params}`;
		/**task type 3 : by notice */
		if (!isCompleted) {
			select_fields = `View_Patients.*, 3 AS task_type, notices.id AS task_value`;

			query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN notices ON View_Patients.id=notices.patient_id AND notices.flag=1`;

			// tslint:disable-next-line: max-line-length
			where_params = ` WHERE View_Patients.is_in=1 AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND notices.type > 0 AND notices.date='${day}' AND NOT EXISTS (SELECT 1 FROM records WHERE flag=1 AND task_type=3 AND task_value = notices.id)`;
			if (point >= 0) {
				where_params += ` AND EXISTS (SELECT 1 FROM points WHERE id =${point} AND  TIME(notices.notice) BETWEEN from_time AND to_time)`;
				// where_params += ` AND TIME(notices.notice) >= (SELECT from_time FROM points WHERE id =${point}) AND TIME(notices.notice) < (SELECT to_time FROM points WHERE id=${point})`;
			}
			if (patientId >= 0) {
				where_params += ` AND View_Patients.id=${patientId}`;
			}
			query_tasks_2 = `${query_temp} ${where_params}`;
		}
		/**  task type 2 by any time */
		select_fields = `View_Patients.*, 2 AS task_type, measure_times.id as task_value`;

		query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN measure_times ON View_Patients.id=(SELECT patient_id FROM advice_records WHERE id = measure_times.advice_id)`;

		// tslint:disable-next-line: max-line-length
		where_params = ` WHERE View_Patients.is_in=1 AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND EXISTS (SELECT id FROM advice_records WHERE id= measure_times.advice_id AND (to_time ='' OR to_time >='${day}') AND from_time <= '${day}' ) AND EXISTS (SELECT 1 FROM days WHERE advice_id=measure_times.advice_id AND day = ${dayOfWeek})`;

		if (point >= 0) {
			where_params += ` AND EXISTS(SELECT 1  FROM points WHERE id =${point} AND measure_times.time BETWEEN from_time AND to_time)`;
			// where_params += ` AND measure_times.time >= (SELECT from_time FROM points WHERE id =${point}) AND measure_times.time < (SELECT to_time FROM points WHERE id =${point})`;
		}
		if (patientId >= 0) {
			where_params += ` AND View_Patients.id=${patientId}`;
		}

		// check is completed
		// tslint:disable-next-line: max-line-length
		where_params += ` AND ${isCompleted ? 'EXISTS' : 'NOT EXISTS'} (SELECT 1 FROM records WHERE flag = 1 AND patient_id = (SELECT patient_id FROM advice_records WHERE id = measure_times.advice_id) AND 
		point = ${UTILS.getAnytimePoint()} AND DATE(time) = '${day}' AND 
		((time BETWEEN  DATETIME( '${day}' || measure_times.time, '-30 minutes') AND DATETIME( '${day}' ||measure_times.time, '30 minutes') ) OR 
		(task_type=2 AND task_value=measure_times.id)))`;
		// where_params += ` AND ${isCompleted ? 'EXISTS' : 'NOT EXISTS'} (SELECT 1 FROM records WHERE flag = 1 AND patient_id = (SELECT patient_id FROM advice_records WHERE id = measure_times.advice_id) AND point = ${UTILS.getAnytimePoint()} AND DATE(time) = '${day}' AND ((strftime('%H:%M', time) BETWEEN strftime("%H:%M", datetime(measure_times.time, '-30 minutes')) AND strftime("%H:%M", datetime(measure_times.time, '30 minutes')) ) OR (task_type=2 AND task_value=measure_times.id)))`;
		// tslint:disable-next-line: max-line-length
		// where_params += ` AND (SELECT EXISTS(SELECT 1 FROM records WHERE flag = 1 AND patient_id = (SELECT patient_id FROM advice_records WHERE id = measure_times.advice_id) AND point = ${UTILS.getAnytimePoint()} AND DATE(time) = '${day}' AND ((strftime('%H:%M', time) BETWEEN strftime("%H:%M", datetime(measure_times.time, '-30 minutes')) AND strftime("%H:%M", datetime(measure_times.time, '30 minutes')) ) OR (task_type=2 AND task_value=measure_times.id))))=${isCompleted ? 1 : 0}`;
		orderby_params = `GROUP BY View_Patients.id, measure_times.time ORDER BY measure_times.time`;
		// 2020-05-13
		// orderby_params = `GROUP BY patients.id, measure_times.time ORDER BY CAST(patients.bed_number AS int`;

		query_tasks_3 = `${query_temp} ${where_params} ${orderby_params}`;

		// tslint:disable-next-line: max-line-length
		const tasks = query_tasks_2 ? `SELECT * FROM (${query_tasks_1}) AS t1 UNION ALL SELECT * FROM (${query_tasks_2}) AS t2 UNION ALL SELECT * FROM (${query_tasks_3}) AS t3` : `SELECT * FROM (${query_tasks_1}) AS t1 UNION ALL SELECT * FROM (${query_tasks_3}) AS t3`;
		// console.log(tasks);
		return tasks;
	}
	private apiAllTasks(day: string, point: number, patientId: number) {
		let select_fields = '*';
		let where_params = '';
		let orderby_params = '';
		let query_tasks_1: string;
		let query_tasks_2: string;
		let query_tasks_3: string;
		let query_temp: string;

		/**task type 1 : by point */
		select_fields = `View_Patients.*, 1 AS task_type, measure_points.id as task_value`;

		query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN measure_points ON View_Patients.id=(SELECT patient_id FROM advice_records WHERE id = measure_points.advice_id)`;

		orderby_params = `GROUP BY View_Patients.id , measure_points.point ORDER BY measure_points.point`;
		// 2020-05-13
		// orderby_params = `GROUP BY patients.id, measure_points.point ORDER BY CAST(patients.bed_number AS int`;

		const dayOfWeek = UTILS.getDayofWeek(day);
		where_params = `WHERE EXISTS (SELECT 1 FROM advice_records WHERE id = measure_points.advice_id AND (to_time ='' OR DATE(to_time) >= "${day}") AND DATE(from_time) <= "${day}")`;

		// tslint:disable-next-line: max-line-length
		// where_params = `WHERE (SELECT from_time FROM advice_records WHERE id = measure_points.advice_id) <= "${day}" and ((SELECT to_time FROM advice_records WHERE id = measure_points.advice_id) = '' or (SELECT to_time FROM advice_records WHERE id = measure_points.advice_id) >= "${day}")`;

		where_params += ` AND EXISTS (SELECT 1 FROM days WHERE advice_id = measure_points.advice_id AND day=${dayOfWeek}) `;
		// where_params += ` AND (SELECT EXISTS(SELECT 1 FROM days WHERE advice_id = measure_points.advice_id AND day = ${dayOfWeek})) = 1 `;
		where_params += ` AND View_Patients.hospital_id = ${GLOBAL.curUser.hospital_id} AND View_Patients.is_in =1 `;
		if (point >= 0) where_params += ` AND measure_points.point = ${point} `;
		if (patientId >= 0) {
			where_params += ` AND View_Patients.id = ${patientId} `;
		}

		query_tasks_1 = `${query_temp} ${where_params} ${orderby_params}`;
		/**task type 3 : by notice */
		// console.log(query_tasks_1);
		select_fields = `View_Patients.*, 3 AS task_type, notices.id as task_value`;

		query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN notices ON View_Patients.id = notices.patient_id AND notices.flag=1`;

		where_params = ` WHERE View_Patients.is_in=1 AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND notices.type > 0 AND DATE(notices.date)='${day}'`;
		if (point >= 0) {
			where_params += `EXISTS (SELECT 1 FROM points WHERE id=${point} AND TIME(notices.notice) BETWEEN from_time AND to_time)`;
			// where_params += ` AND TIME(notices.notice) >= (SELECT from_time FROM points WHERE id =${point}) AND TIME(notices.notice) < (SELECT to_time FROM points WHERE id =${point})`;
		}
		if (patientId >= 0) {
			where_params += ` AND View_Patients.id=${patientId}`;
		}

		query_tasks_2 = `${query_temp} ${where_params}`;
		/**  task type 2 by any time */
		select_fields = `View_Patients.*, 2 AS task_type, measure_times.id as task_value`;

		query_temp = `SELECT ${select_fields} FROM View_Patients LEFT JOIN measure_times ON View_Patients.id = (SELECT patient_id FROM advice_records WHERE id = measure_times.advice_id)`;

		// tslint:disable-next-line: max-line-length
		where_params = ` WHERE View_Patients.is_in=1 AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND EXISTS (SELECT 1 FROM advice_records WHERE id=measure_times.advice_id AND (to_time = '' OR DATE(to_time) >= '${day}') AND DATE(from_time) <= '${day}') AND EXISTS ( SELECT 1 FROM days WHERE advice_id = measure_times.advice_id AND day=${dayOfWeek})`;
		// tslint:disable-next-line: max-line-length
		// where_params = ` WHERE View_Patients.is_in=1 AND View_Patients.hospital_id=${GLOBAL.curUser.hospital_id} AND (SELECT from_time FROM advice_records WHERE id = measure_times.advice_id) <= '${day}' AND ((SELECT to_time FROM advice_records WHERE id = measure_times.advice_id)="" OR (SELECT to_time FROM advice_records WHERE id = measure_times.advice_id) >= '${day}') AND (SELECT EXISTS(SELECT 1 FROM days WHERE advice_id = measure_times.advice_id AND day = ${dayOfWeek})=1)`;

		if (point >= 0) {
			where_params += ` AND EXISTS (SELECT 1 FROM points WHERE id=${point} AND measure_times.time BETWEEN from_time AND to_time) `;
			// where_params += ` AND measure_times.time >= (SELECT from_time FROM points WHERE id =${point}) AND measure_times.time < (SELECT to_time FROM points WHERE id =${point})`;
		}
		if (patientId >= 0) {
			where_params += ` AND View_Patients.id=${patientId}`;
		}

		orderby_params = `GROUP BY View_Patients.id , measure_times.time ORDER BY measure_times.time`;
		// 2020-05-13
		// orderby_params = `GROUP BY patients.id , measure_times.time ORDER BY CAST(patients.bed_number AS int)`;

		query_tasks_3 = `${query_temp} ${where_params} ${orderby_params}`;

		// tslint:disable-next-line: max-line-length
		const tasks = query_tasks_2 ? `SELECT * FROM (${query_tasks_1}) AS t1 UNION ALL SELECT * FROM (${query_tasks_2}) AS t2 UNION ALL SELECT * FROM (${query_tasks_3}) AS t3` : `SELECT * FROM (${query_tasks_1}) AS t1 UNION ALL SELECT * FROM (${query_tasks_3}) AS t3`;

		return tasks;
	}
	private async setDetail2Task(tasks: TaskDataModel[], start: string, end: string) {
		for (const task of tasks) {
			if (task.task_type === 1) {
				let response: ResponseModel;
				let advicePoint;
				let sql = `SELECT a.*, b.from_time, b.to_time FROM measure_points a, advice_records b WHERE a.advice_id=b.id AND a.id=${task.task_value}`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						advicePoint = response.result[0];
					}
				}
				const select_fields_records = `*`;
				// tslint:disable-next-line: max-line-length
				sql = `SELECT ${select_fields_records} FROM view_records WHERE flag=1 AND patient_id=${task.id} AND task_type=${task.task_type} AND task_value=${task.task_value} AND DATE(time)='${start}' LIMIT 0, 1`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						task.record = response.result[0];
					} else {
						sql = `SELECT ${select_fields_records} FROM view_records WHERE flag=1 AND patient_id=${task.id} AND point=${advicePoint.point} AND time BETWEEN "${start}" AND "${end}" LIMIT 0, 1`;
						response = await this.select(sql);
						if (response) {
							if (response.success && response.result.length > 0) {
								task.record = response.result[0];
							}
						}
					}
				}
				sql = `SELECT * FROM notices WHERE flag=1 AND patient_id=${task.id} AND DATE(date)='${start}' AND task_type=${task.task_type} AND task_value=${task.task_value} LIMIT 0, 1`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						task.notice = response.result[0];
					}
				}
				task.task_detail = advicePoint;
			} else if (task.task_type === 3) {
				const sql = `SELECT * FROM notices WHERE flag=1 AND patient_id=${task.id} AND id=${task.task_value} LIMIT 0, 1`;
				const response: ResponseModel = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						task.notice = response.result[0];
					}
				}
			} else if (task.task_type === 2) {
				let response: ResponseModel;
				let adviceTime;
				let sql = `SELECT a.*, b.from_time, b.to_time  FROM measure_times a, advice_records b WHERE a.advice_id=b.id AND a.id=${task.task_value}`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						adviceTime = response.result[0];
					}
				}
				const select_fields_records = `*`;
				// tslint:disable-next-line: max-line-length
				sql = `SELECT ${select_fields_records} FROM view_records WHERE flag=1 AND patient_id=${task.id} AND task_type=${task.task_type} AND task_value=${task.task_value} AND point=9 AND DATE(time)='${start}' LIMIT 0, 1`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						task.record = response.result[0];
					} else {
						if (adviceTime) {
							const time = `${start} ${adviceTime.time}:00`;
							// console.log(time)
							const advice_time_range_min = UTILS.getFormattedDate(UTILS.modifyDate(time, 14, false, 3), 1);
							const advice_time_range_max = UTILS.getFormattedDate(UTILS.modifyDate(time, 14, true, 3), 1);
							// tslint:disable-next-line: max-line-length
							sql = `SELECT ${select_fields_records} FROM view_records WHERE flag=1 AND point=9 AND patient_id=${task.id} AND time BETWEEN "${start}" AND "${end}" AND time BETWEEN "${advice_time_range_min}" AND "${advice_time_range_max}" LIMIT 0, 1`;
							// console.log(sql);
							response = await this.select(sql);
							if (response) {
								if (response.success && response.result.length > 0) {
									task.record = response.result[0];
								}
							}
						}
					}
				}
				sql = `SELECT * FROM notices WHERE flag=1 AND patient_id=${task.id} AND DATE(date)='${start}' AND task_type=${task.task_type} AND task_value=${task.task_value} LIMIT 0, 1`;
				response = await this.select(sql);
				if (response) {
					if (response.success && response.result.length > 0) {
						task.notice = response.result[0];
					}
				}
				task.task_detail = adviceTime;
			}
		}
		if (__DEV__) console.info('***************** all promise Done!');
	}
}
