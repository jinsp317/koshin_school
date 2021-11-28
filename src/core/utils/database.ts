// implementation of database.ts by @rihyokju
// original implementation used an external library for network requests, this uses fetch()
import SQLite, { ResultSet } from 'react-native-sqlite-storage';
import {
	FreePatientModel,
	FreePatientMeasureModel,
	UserModel,
	PatientModel,
	DoctorsOrderModel,
	GlucoseMonitorModel,
	WarningLogModel,
	SyncTableInfoModel,
	SYN_KIND
} from '@src/core/model';
import { NoticeHelper } from '../localdb/model/notice.helper';
import { PatientsHelper } from '../localdb/model/patients.helper';
import { TasksHelper } from '../localdb/model/tasks.helper';
import { RecordsHelper } from '../localdb/model/records.helper';
import { MemberHelper } from '../localdb/model/member.help';
import { FreeMeasuresHelper } from '../localdb/model/freeMeasures.helper';
import { ConsultRecordHelper } from '../localdb/model/consultRecord.helper';

import { UploadsHelper } from '../localdb/model/uploads.helper';

import * as UTILS from '@src/core/app_utils';
import { HospitalModel } from '../model/hospital.model';
import { ResponseModel } from '../model/responses.model';
import { Interface } from 'readline';
import { InsulinHelper } from '../localdb/model/insulin.help';
import {
	InsulinKind,
	InsulinMedcine,
	InsulinAdvice,
	InsulinInjectAction,
	AdviceRecord,
	ConsultRecord, FreeMeasure,
	InOutDepartmentRecord, InOutHospitalRecord,
	Notice, Record, VisitRecord,
	User
} from '@src/core/model/table.model';
import moment from 'moment';
let that: Database;
export class Database {
	static readonly TBL_RELEATEDDEPATMENT = 'user_related_departments';
	static readonly TBL_PATIENTS = 'patients';
	static readonly TBL_RECORDS = 'records';
	static readonly TBL_ADVICES = 'advice_records';
	static readonly TBL_NOTICES = 'notices';
	static readonly TBL_FREEPAITENT = 'FreePatient';
	static readonly TBL_FREEPATIENT_MEASURE = 'FreePatientMeasure';
	static readonly TBL_FREE_MEASURES = 'free_measures';
	static readonly TBL_DAYS = 'days';
	static readonly TBL_DEPARTMENT_GROUPS = 'department_groups';
	static readonly TBL_DEPARTMENTS = 'departments';
	static readonly TBL_DIABETES_TYPES = 'diabetes_types';
	static readonly TBL_GROUPS = 'groups';
	static readonly TBL_IN_OUT_DEPARTMENT_RECORDS = 'in_out_department_records';
	static readonly TBL_IN_OUT_HOSPITAL_RECORDS = 'in_out_hospital_records';
	static readonly TBL_INSULIN_ADVICES = 'insulin_advices';
	static readonly TBL_INSULIN_INJECT_ACTIONS = 'insulin_inject_actions';
	static readonly TBL_INSULIN_KINDS = 'insulin_kinds';
	static readonly TBL_INSULIN_MEDCINES = 'insulin_medcines';
	static readonly TBL_INSULINS = 'insulins';
	static readonly TBL_JOB_POSITIONS = 'job_positions';
	static readonly TBL_MEASURE_POINTS = 'measure_points';
	static readonly TBL_MEASURE_TIMES = 'measure_times';
	static readonly TBL_POINTS = 'points';
	static readonly TBL_RECORD_STATES = 'record_states';
	static readonly TBL_STATES = 'states';
	static readonly TBL_USER_RELATED_DEPARTMENTS = 'user_related_departments';
	static readonly TBL_USER_RELATED_HOSPITALS = 'user_related_hospitals';
	static readonly TBL_USERS = 'users';
	static readonly TBL_VISIT_RECORDS = 'visit_records';
	static readonly TBL_IN_OUT_HOSPITAL = 'in_out_hospital_records';
	static readonly TBL_CONSULT_RECORDS = 'consult_records';
	static readonly TBL_MEMBERS = 'members';
	static readonly TBL_HOSPITAL = 'hospitals';
	static readonly TBL_WARNINGLOG = 'warning_log';
	static readonly VIEW_PATIENTS = 'view_patients';
	static readonly VIEW_RECORDS = 'View_Records';
	static readonly VIEW_NOTICES = 'View_Notices';
	static readonly VIEW_FREEPATIENTMEASURE = 'View_FreePatientMeasure';
	static readonly VIEW_FREE_MEASURES = 'View_Free_Measures';
	private database: SQLite.SQLiteDatabase | undefined;
	public noticeHelper: NoticeHelper;
	public patientsHelper: PatientsHelper;
	public tasksHelper: TasksHelper;
	public recordsHelper: RecordsHelper;
	public freeMeasuresHelper: FreeMeasuresHelper;
	public uploadsHelper: UploadsHelper;
	public consultRecordHelper: ConsultRecordHelper;
	public memberHelper: MemberHelper;
	public insulinHelper: InsulinHelper;
	constructor() {
		that = this;
		this.init();
	}

	private async init() {
		// console.log('-------database.init------------------------');
		try {
			const db = await this.getDatabase();
			this.noticeHelper = new NoticeHelper(db, Database.TBL_NOTICES, Database.VIEW_NOTICES);
			this.patientsHelper = new PatientsHelper(db, Database.TBL_PATIENTS, Database.VIEW_PATIENTS);
			this.tasksHelper = new TasksHelper(db);
			this.recordsHelper = new RecordsHelper(db, Database.TBL_RECORDS, Database.VIEW_RECORDS, Database.TBL_PATIENTS);
			this.freeMeasuresHelper = new FreeMeasuresHelper(db, Database.TBL_FREE_MEASURES, Database.VIEW_FREE_MEASURES);
			this.uploadsHelper = new UploadsHelper(db);
			this.consultRecordHelper = new ConsultRecordHelper(db, Database.TBL_CONSULT_RECORDS, Database.TBL_MEMBERS);
			this.memberHelper = new MemberHelper(db);
			this.insulinHelper = new InsulinHelper(db);

		} catch (reason) {
			return console.error(reason);
		}
	}
	// Open the connection to the database
	public open(): Promise<SQLite.SQLiteDatabase> {
		SQLite.DEBUG(false);
		SQLite.enablePromise(true);
		let databaseInstance: SQLite.SQLiteDatabase;

		return SQLite.openDatabase({
			name: 'daleDB.db',
			location: 'default',
			createFromLocation: '~www/daleDB.db',
		}).then((db) => {
			databaseInstance = db;
			// console.log('[db] Database open!');
			this.database = databaseInstance;
			// db.executeSql('PRAGMA journal_mode = MEMORY');
			// // db.executeSql('PRAGMA synchronous = OFF');
			// db.executeSql('PRAGMA page_size = 5120');
			return databaseInstance;
		}).catch((err) => {
			if (__DEV__) console.error('openDatabase Error:', err);
			return null;
		});
	}

	// Close the connection to the database
	public close(): Promise<void> {
		if (this.database === undefined) {
			return Promise.reject('[db] Database was not open; unable to close.');
		}
		return this.database.close().then((status) => {
			// console.log('[db] Database closed.');
			this.database = undefined;
		});
	}

	public getDatabase(): Promise<SQLite.SQLiteDatabase> {
		if (this.database !== undefined) {
			return Promise.resolve(this.database);
		}
		// otherwise: open the database first
		return this.open();
	}

	public getTest(): Promise<any> {
		return this.noticeHelper.mySelect().then((r) => {
			return r;
		}).catch((e) => {
			return e;
		});
	}
	public storeRecord(table: string,
		record: (InsulinAdvice | InsulinInjectAction | ConsultRecord | FreeMeasure | InOutDepartmentRecord | InOutHospitalRecord | Notice | Record | VisitRecord)): Promise<boolean> {
		const keys = Object.keys(record);
		const fields: string[] = [];
		const valset: string[] = [];
		const values: any[] = [];
		keys.forEach((fd, index) => {
			fields.push(fd);
			valset.push('?');
			values.push(record[fd]);
		});
		return this.getDatabase()
			.then((db) => db.executeSql(`INSERT INTO ${table}(${fields.join(' ,')}) VALUES ${valset.join(' ,')}`, values))
			.then(([_res]) => {
				return true;
			}).catch(() => {
				return false;
			});
	}
	public updateRecord(table: string,
		record: (InsulinAdvice | InsulinInjectAction | ConsultRecord | FreeMeasure | InOutDepartmentRecord | InOutHospitalRecord | Notice | Record | VisitRecord)): Promise<boolean> {
		const keys = Object.keys(record);
		const fields: string[] = [];
		const valset: string[] = [];
		const values: any[] = [];
		keys.forEach((fd, index) => {
			fields.push(`${fd}=?`);
			values.push(record[fd]);
		});
		values.push(record.id);
		return this.getDatabase()
			.then((db) => db.executeSql(`UPDATE ${table} SET ${fields.join(' ,')} WHERE id=?`, values))
			.then(([_res]) => {
				return true;
			}).catch(() => {
				return false;
			});
	}
	public getLastValue(field: string, table: string): Promise<number> {
		return this.getDatabase()
			.then((db) => db.executeSql(`SELECT ${field} FROM ${table} order by ${field} DESC limit 1;`))
			.then(([results]) => {
				if (results === undefined) {
					return -1;
				}
				const count = results.rows.length;
				if (count < 1) return -1;

				const row = results.rows.item(0);
				const { id } = row;
				return id;
			});
	}
	public getReleatedDepartments(user_id: number): Promise<number[]> {
		return this.getDatabase()
			.then((db) =>
				db.executeSql(`SELECT department_id FROM ${Database.TBL_RELEATEDDEPATMENT} WHERE user_id=?`, [
					user_id,
				]),
			)
			.then(([results]) => {
				if (results === undefined) {
					return [];
				}
				const count = results.rows.length;
				if (count < 1) {
					return [];
				}
				const lists: number[] = [];
				for (let i = 0; i < count; i++) {
					const row = results.rows.item(i);
					const { id } = row;

					lists.push(id);
				}
				return lists;
			});
	}
	public getFreePatientId(patient: FreePatientModel): Promise<number> {
		return this.getDatabase()
			.then((db) =>
				db.executeSql(
					`SELECT id FROM ${Database.TBL_FREEPAITENT} WHERE fp_name LIKE ? AND fp_certNum LIKE ? AND fp_certKind=?`,
					[patient.name, patient.cert_num, patient.cert_kind],
				),
			)
			.then(([results]) => {
				if (results === undefined) {
					return -1;
				}
				const count = results.rows.length;
				if (count < 1) {
					return -1;
				}
				const row = results.rows.item(0);
				const { id } = row;
				return id;
			})
			.catch((reason) => {
				if (__DEV__) console.warn(reason);
			});
	}
	public synchronousOff() {
		this.getDatabase().then((db) => db.executeSql('PRAGMA synchronous = OFF'));
	}
	public synchronousOn() {
		this.getDatabase().then((db) => db.executeSql('PRAGMA synchronous = NORMAL'));
	}

	public addFreePatient(patient: FreePatientModel): Promise<number> {
		return this.getFreePatientId(patient).then((addedId) => {
			if (addedId < 0) {
				return this.getDatabase()
					.then((db) =>
						db.executeSql(
							`INSERT INTO ${Database.TBL_FREEPAITENT} (fp_name, fp_certNum, fp_certKind) VALUES (?,?,?)`,
							[patient.name, patient.cert_num, patient.cert_kind],
						),
					)
					.then(([results]) => {
						if (results.rowsAffected > 0) {
							return this.getLastValue('id', Database.TBL_FREEPAITENT).then((addedId) => {
								return addedId;
							});
						} else {
							return -1;
						}
					});
			}
			return addedId;
		});
	}

	/**
   * 添加随测资料 患者资料，测量值
   */
	public addFreePatientMeasure(patient: FreePatientModel, data: FreePatientMeasureModel): Promise<boolean> {
		return this.addFreePatient(patient).then((id) => {
			data.patient_id = id;
			return this.getDatabase()
				.then((db) =>
					db.executeSql(
						`INSERT INTO ${Database.TBL_FREEPATIENT_MEASURE} (fpm_patientId, fpm_value, fpm_time, fpm_timeMark) VALUES (?,?,?,?)`,
						[data.patient_id, data.value, data.time, data.point],
					),
				)
				.then(([results]) => {
					if (results.rowsAffected > 0) {
						return true;
					} else {
						return false;
					}
				});
		});
	}

	// Get an array of all the lists in the database
	// public getFreePatientMeasure(): Promise<any[]> {
	// 	console.log('[db] Fetching lists from the db...');
	// 	return this.getDatabase()
	// 		.then((db) =>
	// 			// Get all the lists, ordered by newest lists first
	// 			db.executeSql(`SELECT * FROM ${Database.VIEW_FREEPATIENTMEASURE}  ORDER BY "fpm_time" DESC;`),
	// 		)
	// 		.then(([results]) => {
	// 			if (results === undefined) {
	// 				return [];
	// 			}
	// 			const count = results.rows.length;
	// 			const lists: UploadDataModel[] = [];
	// 			for (let i = 0; i < count; i++) {
	// 				const row = results.rows.item(i);
	// 				const {
	// 					id,
	// 					fpm_value,
	// 					fpm_time,
	// 					fpm_timeMark,
	// 					fpm_userNick,
	// 					fp_name,
	// 					fp_certNum,
	// 					fp_certKind,
	// 					fp_sex,
	// 					fp_birthday,
	// 					fp_registerNick,
	// 					address,
	// 				} = row;
	// 				// lists.push({ id, fpm_value, fpm_time, fpm_timeMark, fpm_userNick, fp_name, fp_certNum, fp_certKind, fp_sex, fp_birthday, fp_registerNick });
	// 				lists.push({
	// 					kind: 1,
	// 					patient_id: undefined,
	// 					id,
	// 					value: fpm_value,
	// 					time: fpm_time,
	// 					point: fpm_timeMark,
	// 					name: fp_name,
	// 					cert_num: fp_certNum,
	// 					cert_kind: fp_certKind,
	// 					gender: fp_sex,
	// 					birthday: fp_birthday,
	// 					address,
	// 				});
	// 			}
	// 			return lists;
	// 		});
	// }
	public deleteFreePatientMeasure(id: number): Promise<boolean> {
		return this.getDatabase()
			.then((db) => db.executeSql(`DELETE FROM ${Database.TBL_FREEPATIENT_MEASURE} WHERE id = ?;`, [id]))
			.then(() => {
				if (__DEV__) console.info('success to deleteFreePatientMeasure');
				return true;
			})
			.catch((error) => {
				if (__DEV__) console.error('failed to deleteFreePatientMeasure:', error);
				return false;
			});
	}

	/**for glucose monitor */
	private setPatient(patient: PatientModel): Promise<boolean> {
		let database;
		return this.getDatabase().then((db) => {
			database = db;
			return db
				.executeSql(`SELECT id FROM ${Database.TBL_PATIENTS} WHERE id = ?`, [patient.id])
				.then(([results]) => {
					if (results.rows.length === 0) {
						database.executeSql(`INSERT INTO ${Database.TBL_PATIENTS} (id, name, gender) VALUES (?,?,?)`, [
							patient.id,
							patient.name,
							patient.gender,
						]);
					} else {
						database.executeSql(`UPDATE ${Database.TBL_PATIENTS} SET name = ?, gender = ? WHERE id = ?;`, [
							patient.name,
							patient.gender,
							patient.id,
						]);
					}
					return true;
				});
		});
	}
	public addGlucoseMonitor(monitor: GlucoseMonitorModel): Promise<boolean> {
		const patient: PatientModel = {
			id: monitor.patient_id,
			name: monitor.patient_name,
			gender: monitor.gender,
		};

		//  const user: UserModel = {id:monitor.user_id, name: monitor.user_name}
		//  this.setUser(user);

		return this.setPatient(patient).then((result) => {
			if (result) {
				return this.getDatabase()
					.then((db) =>
						db.executeSql(
							`INSERT INTO ${Database.TBL_RECORDS} (patient_id, time, point, value, state, user_id, memo) VALUES (?,?,?,?,?,?,?)`,
							[
								monitor.patient_id,
								monitor.time,
								monitor.point,
								monitor.value,
								monitor.state,
								monitor.user_id,
								monitor.memo,
							],
						),
					)
					.then(([results]) => {
						if (results.rowsAffected > 0) {
							return true;
						} else {
							return false;
						}
					});
			} else {
				return false;
			}
		});
	}
	public updateGlucoseMonitor(data: GlucoseMonitorModel): Promise<boolean> {
		return this.getDatabase()
			.then((db) =>
				db.executeSql(
					`UPDATE ${Database.TBL_RECORDS} SET value = ?, state = ?, time = ?, point = ? WHERE id = ?;`,
					[data.value, data.state, data.time, data.point, data.id],
				),
			)
			.then(([results]) => {
				if (__DEV__) console.info('success to updateGlucoseMonitor');
				return true;
			})
			.catch((error) => {
				if (__DEV__) console.error('failed to updateGlucoseMonitor:', error);
				return false;
			});
	}

	// public getGlucoseMonitors(): Promise<any[]> {
	// 	return this.getDatabase()
	// 		.then((db) =>
	// 			// Get all the lists, ordered by newest lists first
	// 			db.executeSql(`SELECT * FROM ${Database.VIEW_RECORDS}  ORDER BY "time" DESC;`),
	// 		)
	// 		.then(([results]) => {
	// 			if (results === undefined) {
	// 				return [];
	// 			}
	// 			const count = results.rows.length;
	// 			const lists: UploadDataModel[] = [];
	// 			for (let i = 0; i < count; i++) {
	// 				const row = results.rows.item(i);
	// 				const {
	// 					id,
	// 					value,
	// 					state,
	// 					time,
	// 					patient_id,
	// 					point,
	// 					user_id,
	// 					memo,
	// 					patient_name,
	// 					bed_number,
	// 					patient_number,
	// 					user_name,
	// 				} = row;
	// 				lists.push({
	// 					kind: 0,
	// 					id,
	// 					value,
	// 					state,
	// 					time,
	// 					patient_id,
	// 					point,
	// 					user_id,
	// 					memo,
	// 					patient_name,
	// 					bed_number,
	// 					patient_number,
	// 					user_name,
	// 				});
	// 			}
	// 			return lists;
	// 		});
	// }
	// public deleteGlucoseMonitor(data: UploadDataModel): Promise<boolean> {
	// 	return this.getDatabase()
	// 		.then((db) =>
	// 			db.executeSql(
	// 				`DELETE FROM ${Database.TBL_RECORDS} WHERE id = ? AND patient_id=? AND value=? AND point=?;`,
	// 				[data.id, data.patient_id, data.value, data.point],
	// 			),
	// 		)
	// 		.then(() => {
	// 			console.log('success to delete');
	// 			return true;
	// 		})
	// 		.catch((error) => {
	// 			console.log('failed to delete');
	// 			return false;
	// 		});
	// }

	// users
	// patients
	private getPatient = async (id: number): Promise<PatientModel> => {
		let patient: PatientModel;

		try {
			const db = await this.getDatabase();
			db.executeSql(`SELECT * FROM ${Database.TBL_PATIENTS} WHERE id=${id}`).then(([results]) => {
				if (results !== undefined) {
					const count = results.rows.length;
					if (count > 0) {
						patient = results.rows.item(0);
					}
				}
				return patient;
			});
		} catch (e) {
			console.log('failed to getDatabase');
			return patient;
		}
	};

	// Perform initial setup of the database tables
	private createPatientsTable(transaction: SQLite.Transaction) {
		// Patients table
		transaction.executeSql('DROP TABLE IF EXISTS ' + Database.TBL_PATIENTS);
		transaction.executeSql(`CREATE TABLE IF NOT EXISTS ${Database.TBL_PATIENTS}
    (id INTEGER NOT NULL,
    name TEXT NOT NULL,
    is_in INTEGER NOT NULL DEFAULT 0,
    gender INTEGER NOT NULL DEFAULT 1,
    birthday date DEFAULT NULL,
    address TEXT DEFAULT NULL,
    mobile TEXT DEFAULT NULL,
    family_contact TEXT DEFAULT NULL,
    is_married INTEGER DEFAULT NULL,
    has_child INTEGER DEFAULT NULL,
    smoking INTEGER DEFAULT NULL,
    dranking INTEGER DEFAULT NULL,
    has_medical_insurance INTEGER DEFAULT NULL,
    medical_insurance_number TEXT DEFAULT NULL,
    hospital_id INTEGER NOT NULL,
    department_id INTEGER DEFAULT NULL,
    doctor_id INTEGER DEFAULT NULL,
    nurse_id INTEGER DEFAULT NULL,
    patient_number TEXT DEFAULT NULL,
    bed_number TEXT DEFAULT NULL,
    id_card_number TEXT DEFAULT NULL,
    in_date datetime DEFAULT NULL,
    out_date datetime DEFAULT NULL,
    diabetes_type_id INTEGER DEFAULT NULL,
    diagnostic_time TIME DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TEXT NULL DEFAULT NULL,
    updated_at TEXT NULL DEFAULT NULL)
    `);
	}
	private addPatients(db: SQLite.SQLiteDatabase, patients: PatientModel[]) {
		patients.forEach((patient, i) => {
			let bigqery = '';
			const keys = Object.keys(patient);
			const field_values: any[] = [];
			const table_field_count = 28;

			keys.forEach((key, index) => {
				if (index < table_field_count) {
					if (index === 0) bigqery += '?';
					else bigqery += ',?';
					field_values.push(patient[key]);
				}
			});
			db.executeSql(`INSERT INTO ${Database.TBL_PATIENTS} VALUES (${bigqery})`, field_values)
				.then(() => {
					if (__DEV__) console.info('addPatients ok');
					return true;
				})
				.catch((e) => {
					if (__DEV__) console.error(e.message);
					return false;
				});
		});
	}
	public deleteSyn = (table: string, ids: any[]): Promise<any> => {
		return this.database.transaction(tx => {
			tx.executeSql(`DELETE FROM ${table} WHERE id IN (${ids.join(',')})`)
				.then(() => {
					if (__DEV__) console.info('success to delete:', ids.join(', '));
					return { success: true };
				}).catch((error) => {
					if (__DEV__) console.error('failed to delete');
					return { success: false };
				});
		});

	}
	public emptyTable = async (table: string): Promise<boolean> => {
		try {
			const db = await this.getDatabase();
			db
				.transaction((tx) => {
					tx.executeSql(`DELETE FROM ${table}`);
				})
				.then((success) => {
					if (__DEV__) console.info('-- empty table ok ', table);
					return success;
				})
				.catch((e) => {
					return false;
				});
		} catch (e) {
			return false;
		}
	};

	public resetPatients = async (patients: PatientModel[]): Promise<boolean> => {
		try {
			const db = await this.getDatabase();
			db
				.transaction(this.createPatientsTable)
				.then((success) => {
					this.addPatients(db, patients);
					return success;
				})
				.catch((e) => {
					return false;
				});
		} catch (e) {
			return false;
		}
	};
	private createRecordsTable(transaction: SQLite.Transaction) {
		// records table
		transaction.executeSql('DROP TABLE IF EXISTS ' + Database.TBL_RECORDS);
		transaction.executeSql(`CREATE TABLE IF NOT EXISTS ${Database.TBL_RECORDS}
    (id INTEGER NOT NULL,
     patient_id INTEGER NOT NULL,
     hospital_id INTEGER NOT NULL,
     time TEXT NOT NULL,
     point INTEGER NOT NULL DEFAULT 0,
     value INTEGER NOT NULL,
     user_id INTEGER NOT NULL,
     memo TEXT NOT NULL DEFAULT '',
    created_at TEXT NULL DEFAULT NULL,
    updated_at TEXT NULL DEFAULT NULL)
    `);
	}

	private createAdvicesTable(transaction: SQLite.Transaction) {
		// advices table
		transaction.executeSql('DROP TABLE IF EXISTS ' + Database.TBL_ADVICES);
		transaction.executeSql(`CREATE TABLE IF NOT EXISTS ${Database.TBL_ADVICES}
    (id INTEGER NOT NULL,
     patient_id INTEGER NOT NULL,
     user_id INTEGER NOT NULL,
     from_time TEXT NOT NULL,
     to_time TEXT NOT NULL DEFAULT '',
     is_long INTEGER NOT NULL,
     is_point INTEGER NOT NULL,
     points TEXT DEFAULT NULL,
     times TEXT DEFAULT NULL,
     days TEXT NOT NULL,
     state INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NULL DEFAULT NULL,
    updated_at TEXT NULL DEFAULT NULL)
    `);
	}
	private addAdvices(db: SQLite.SQLiteDatabase, advices: DoctorsOrderModel[]) {
		advices.forEach((advice, i) => {
			let bigqery = '';
			const keys = Object.keys(advice);
			const field_values: any[] = [];
			const table_field_count = 13;
			keys.forEach((key, index) => {
				if (index < table_field_count) {
					if (index === 0) bigqery += '?';
					else bigqery += ',?';
					field_values.push(advice[key]);
				}
			});
			db.executeSql(`INSERT INTO ${Database.TBL_ADVICES} VALUES (${bigqery})`, field_values)
				.then(() => {
					if (__DEV__) console.info('addAdvices ok');
					return true;
				})
				.catch((e) => {
					if (__DEV__) console.error('addAdvices', e.message);
					return false;
				});
		});
	}

	public resetAdvices = async (advices: DoctorsOrderModel[]): Promise<boolean> => {
		try {
			const db = await this.getDatabase();
			db
				.transaction(this.createPatientsTable)
				.then((success) => {
					this.addAdvices(db, advices);
					return success;
				})
				.catch((e) => {
					return false;
				});
		} catch (e) {
			return false;
		}
	};
	public userAccessLogSet = (user: User) => {
		const sql = `UPDATE ${Database.TBL_USERS} SET remember_token=? WHERE id=?`;
		const params: any[] = [];
		params.push(user.remember_token);
		params.push(user.id);
		this.getDatabase().then((db) => {
			db.executeSql(sql, params).then(_r => {
				if (__DEV__) console.info(_r);
			});
		});
	}
	public getUserPath = async (user: User) => {
		const sql = `SELECT remember_token FROM ${Database.TBL_USERS}  WHERE id=?`;
		const params: any[] = [];
		params.push(user.id);
		const db = await this.getDatabase();
		const [results] = await db.executeSql(sql, params);
		if (results === undefined) {
			return '';
		}
		const count = results.rows.length;
		if (count < 1) {
			return '';
		}
		const row = results.rows.item(0);
		const { remember_token } = row;
		return remember_token;
		// db.executeSql(sql, params)
		// 	.then(([results]) => {
		// 		if (results === undefined) {
		// 			return '';
		// 		}
		// 		const count = results.rows.length;
		// 		if (count < 1) {
		// 			return '';
		// 		}

		// 		const row = results.rows.item(0);
		// 		const { remember_token } = row;
		// 		return remember_token;
		// 	}).catch(() => {
		// 		return '';
		// 	});

	}

	// warning
	public getWarningLogs = async (fromTime: string): Promise<any[]> => {
		let data: WarningLogModel[];
		const sql = `SELECT id, patient_id, point, patient_name, bed_number, patient_number, department_id, department_name, doctor_id, doctor_name, nurse_id, nurse_name, value, time, state, alarm_min, alarm_max  FROM ${Database.VIEW_RECORDS} WHERE time > '${fromTime}' and ( state IN (5, 6 )  OR (value > alarm_max ) OR ( value < alarm_min))  ORDER BY time DESC`;
		const wsql = `SELECT * FROM ${Database.TBL_WARNINGLOG} WHERE warning_time > '${fromTime}' ORDER BY warning_time DESC`;
		if (__DEV__) console.log(sql);
		try {
			const db = await this.getDatabase();
			return db.executeSql(sql)
				.then(([results]) => {
					if (results !== undefined) {
						const count = results.rows.length;
						if (count > 0) {
							data = [];
							for (let i = 0; i < count; i++) {
								data.push(results.rows.item(i));
							}
							return data;
						}
					}
					return data;
				});
		} catch (e) {
			if (__DEV__) console.error('failed to getDatabase', e);
			return data;
		}
	};
	public getWarningLog(id: number): Promise<any> {
		let data: WarningLogModel;
		return this.getDatabase().then((db) => {
			return db.executeSql(`SELECT * FROM ${Database.TBL_WARNINGLOG} WHERE id=${id}`).then(([results]) => {
				if (results !== undefined) {
					const count = results.rows.length;
					if (count > 0) {
						data = results.rows.item(0);
					}
				}
				return data;
			});
		})
			.catch((e) => {
				return data;
			});
	}
	public addWarningLog = (data: WarningLogModel): Promise<boolean> => {
		return this.getDatabase()
			.then((db) => {
				let bigqery = '';
				const keys = Object.keys(data);
				const field_values: any[] = [];
				keys.forEach((key, index) => {
					if (index === 0) bigqery += '?';
					else bigqery += ',?';
					field_values.push(data[key]);
				});

				return db
					.executeSql(`INSERT INTO ${Database.TBL_WARNINGLOG} VALUES (${bigqery})`, field_values)
					.then(() => {
						if (__DEV__) console.info('insert ok');
						return true;
					})
					.catch((e) => {
						if (__DEV__) console.error('addWarningLog:', e.message);
						return false;
					});
			})
			.catch((e) => {
				return false;
			});
	};
	public resetDatabase = async (): Promise<boolean> => {
		const db = await this.getDatabase();
		let sql = 'DELETE FROM in_out_hospital_records';
		let res = await db.executeSql(sql);
		if (__DEV__) console.info(res);
		sql = 'DELETE FROM patients';
		res = await db.executeSql(sql);
		if (__DEV__) console.info(res);
		return true;
	}
	public addSyncData = async (item: SyncTableInfoModel, records: any[], timestamp: string): Promise<any> => {
		const db = await this.getDatabase();
		if (db) {
			await this.addRecords(db, item, records, timestamp);
		}
	};
	public getHospitalModel = async (hospital_id: number): Promise<HospitalModel> => {
		let hospData: HospitalModel;
		const db = await this.getDatabase();
		const response: [ResultSet] = await db.executeSql(`SELECT * FROM ${Database.TBL_HOSPITAL} WHERE id=${hospital_id}`);
		if (response[0].rows.length > 0) {
			hospData = response[0].rows.item(0);
		}
		// console.log(hospData);
		return hospData;
		// if(response.resu)
		// return this.getDatabase().then((db) => {
		// 	return db.executeSql(`SELECT * FROM ${Database.TBL_HOSPITAL} WHERE id=${hospital_id}`).then(([results]) => {
		// 		if (results !== undefined) {
		// 			const count = results.rows.length;
		// 			if (count > 0) {
		// 				hospData = results.rows.item(0);
		// 			}
		// 		}
		// 		return hospData;
		// 	});
		// }).catch((e) => {
		// 	return hospData;
		// });


	}
	public getInsulinKinds = async (): Promise<InsulinKind[]> => {
		const db = await this.getDatabase();
		const result: InsulinKind[] = [];
		const response: [ResultSet] = await db.executeSql(`SELECT * FROM ${Database.TBL_INSULIN_KINDS}`);
		if (response[0].rows.length > 0) {
			for (let i = 0; i < response[0].rows.length; i++) {
				result.push((response[0].rows.item(i) as InsulinKind));
			}
		}
		return result;
	}
	public getInsulinMedicines = async (): Promise<InsulinMedcine[]> => {
		const db = await this.getDatabase();
		const result: InsulinMedcine[] = [];
		const response: [ResultSet] = await db.executeSql(`SELECT * FROM ${Database.TBL_INSULIN_MEDCINES} WHERE del_flag=0`);
		if (response[0].rows.length > 0) {
			for (let i = 0; i < response[0].rows.length; i++) {
				result.push((response[0].rows.item(i) as InsulinMedcine));
			}
		}
		return result;
	}
	public async saveInsulinAction(action: InsulinInjectAction): Promise<any> {
		if (action.id == 0) {
			await this.storeInsulinAction(action);
			return this.postSaveInsulinAction(action.advice_id);

		} else {
			await this.updateInsulinAction(action);
			return this.postSaveInsulinAction(action.advice_id);
		}
	}
	private async updateInsulinAction(action: InsulinInjectAction): Promise<any> {
		const keys = Object.keys(action);
		const up_vals: string[] = [];
		const field_values: any[] = [];
		keys.forEach((key, index) => {
			if (key != 'vw_medicine_name' && key != 'vm_kind_name' && key != 'vm_advice_obj' && key != 'hospital_id') {
				up_vals.push(`${key}=?`);
				field_values.push(action[key]);
			}
		});
		const sql = `UPDATE ${Database.TBL_INSULIN_INJECT_ACTIONS} SET ${up_vals.join(' ,')} WHERE id=${action.id}`;
		const db = await this.getDatabase();
		return db.executeSql(sql, field_values).then(res => {
			return Promise.resolve(res[0].rowsAffected !== 0);
		}).catch(err => {
			return Promise.resolve(false);
		})
	}
	private async storeInsulinAction(action: InsulinInjectAction): Promise<any> {
		let bigqery = '';
		let values = '';
		let id = await this.getLastValue('id', Database.TBL_INSULIN_INJECT_ACTIONS);
		id += 1000;
		action.id = id;
		const keys = Object.keys(action);
		const field_values: any[] = [];
		keys.forEach((key, index) => {
			if (key != 'vw_medicine_name' && key != 'vm_kind_name' && key != 'vm_advice_obj' && key != 'hospital_id') {
				if (index === 0) {
					bigqery = key;
					values = `?`;
				} else {
					bigqery += `,${key}`;
					values += `, ?`;
				}
				field_values.push(action[key]);
			}
		});
		const insertSql = `INSERT INTO ${Database.TBL_INSULIN_INJECT_ACTIONS} (${bigqery}) VALUES (${values})`;
		const db = await this.getDatabase();
		return db.executeSql(insertSql, field_values).then(res => {
			return Promise.resolve(res[0].rowsAffected !== 0);
		}).catch(err => {
			return Promise.resolve(false);
		})
	}
	private async postSaveInsulinAction(advice: number): Promise<any> {
		const date = moment().toDate();
		const time_stamp = UTILS.getFormattedDate(date, 1);
		const sql = `UPDATE ${Database.TBL_INSULIN_INJECT_ACTIONS} SET updated_at='${time_stamp}' WHERE id=${advice}`;
		const db = await this.getDatabase();
		return db.executeSql(sql);
	}
	private async addRecords(db, item: SyncTableInfoModel, records: any[], timestamp: string) {
		if (records.length === 0) return;
		let keys: string[] = [];
		keys = Object.keys(records[0]);
		// console.log(records[0])
		const o_keys = keys.filter(fd => fd != 'doctor_list');
		let fields = o_keys.join(',');
		const vals: any[] = [];
		const up_vals: any[] = [];
		let deleteSql: string = '';
		let insertSql: string = '';
		let updateSql: string = '';
		keys.forEach((key, index) => {
			if (key != 'doctor_list') {
				vals.push('?');
				up_vals.push(`${key}=?`);
			}
		});
		if (item.table == Database.TBL_NOTICES) {
			vals.push('?');
			up_vals.push('syn_flag=?');
			fields += ', syn_flag';
		}

		const values = `(${vals.join(',')})`;
		const id_field = 'id';
		insertSql = `INSERT INTO ${item.table}(${fields}) VALUES ${values}`;
		await db.transaction(async tx => {
			for (let i = 0; i < records.length; i++) {
				const record = records[i];
				const field_values: any[] = [];
				// record.updated_at = timestamp;
				keys.forEach((key, index) => {
					if (key != 'doctor_list') { field_values.push(record[key]); }
				});
				if (item.table == Database.TBL_NOTICES) {
					field_values.push(SYN_KIND.SYNCHRONIZE);
				}
				// deleteSql = `DELETE FROM ${item.table} WHERE ${id_field}=${record[id_field]}`;
				deleteSql = `SELECT id FROM ${item.table} WHERE ${id_field}=${record[id_field]}`;
				updateSql = `UPDATE ${item.table} SET ${up_vals.join(', ')} WHERE ${id_field}=${record[id_field]}`;
				if (item.table === Database.TBL_RECORDS) {
					const wParam: any[] = [];
					wParam.push(`patient_id=${record.patient_id}`);
					wParam.push(`hospital_id=${record.hospital_id}`);
					wParam.push(`point=${record.point}`);
					wParam.push(`id=${record.id}`);
					wParam.push(`created_at="${record.created_at}"`);
					deleteSql = `SELECT id FROM ${item.table} WHERE ${wParam.join(' AND ')}`;
					updateSql = `UPDATE ${item.table} SET ${up_vals.join(', ')} WHERE ${wParam.join(' AND ')}`;
				}
				that.recordUnit(tx, deleteSql, insertSql, updateSql, field_values);
			}
		});
	}
	private recordUnit(tx, sSql: string, iSql: string, uSql: string, values: any[]) {
		tx.executeSql(sSql, [], (tx, res) => {
			if (res.rows.length == 0) {
				tx.executeSql(iSql, values);
			} else {
				tx.executeSql(uSql, values);
			}
		}, (tx, err) => {
			if (__DEV__) console.error('recordUnit Error:', err);
			tx.executeSql(iSql, values);
		});
	}
}

// Export a single instance of DatabaseImpl
export const database: Database = new Database();
