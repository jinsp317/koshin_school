import {
	SyncTableInfoModel,
	RequestSyncDataModel,
	UploadListItemModel,
	GlucoseMonitorModel,
	MANAGE_KIND,
	ResponseSyncModel,
	Http_Error
} from './model'
import { database, Database } from './utils/database'
import { httpHelper } from './utils/httpHelper'
import GLOBAL from '@src/core/globals'
import * as UTILS from '@src/core/app_utils'
import { FreePatientMeasureData } from './model/monitor.model'
import { asyncStorageHelper } from './utils/storageHelper';
import { NoticeModel } from './model/notice.model'
import { EventRegister } from 'react-native-event-listeners'
import Strings from "@src/assets/strings";
import { ResponseSignModel } from './model/responses.model';
import { NetInfoStateType } from "@react-native-community/netinfo";
// import wifiHelper from '@src/core/utils/wifiHelper';
import wifi from 'react-native-android-wifi';
import { syncWait, connectedBluetoothServer } from '../actions/actions';
import store from "../store";
interface SynResponseModel {
	success?: boolean;
	timestamp?: string;
	downloads?: any[];
	new_records?: any[];
}
/**
 created by @rihyokju
 */

// Class to support Dropbox backup and sync
export class AppSync {
	// True when a backup is already in progress
	public static syncIsCurrentlyInProgress = false;
	public static hasLocalUpdate = false;
	public static oldSyncTime: string = '0000-00-00 00:00:00';
	public static lastSyncTime: string = '0000-00-00 00:00:00';
	public static lastServerTime: string = '0000-00-00 00:00:00';
	public static nwLastSynTime: string = '0000-00-00 00:00:00';
	public static hasFullSynchronized = false;
	public static synCompleted = false;
	public static resetData = false;
	// private lastLocalBackupTimestamp: Moment;
	// private lastDropboxBackupTimestamp: Moment;

	public static syncTables: SyncTableInfoModel[] = [
		{ table: 'records', has_update: false },
		{ table: 'notices', has_update: false },
		{ table: 'patients', has_update: false },
		{ table: 'free_measures', has_update: false },
		{ table: 'advice_records', has_update: false },
		{ table: 'days', has_update: false },
		{ table: 'departments', has_update: false },
		{ table: 'diabetes_types', has_update: false },
		{ table: 'hospitals', has_update: false },
		// { table: 'in_out_department_records', has_update: false },
		{ table: 'in_out_hospital_records', has_update: false },
		{ table: 'job_positions', has_update: false },
		{ table: 'measure_points', has_update: false },
		{ table: 'measure_times', has_update: false },
		{ table: 'points', has_update: false },
		{ table: 'record_states', has_update: false },
		{ table: 'states', has_update: false },
		{ table: 'user_related_departments', has_update: false },
		{ table: 'user_related_hospitals', has_update: false },
		{ table: 'users', has_update: false },
	];

	public static nonSyncTables: string[] = [
		'points', 'record_states', 'job_positions', 'diabetes_types',
	];
	public upload(): Promise<void> {
		return Promise.resolve();
	}

	// Check if the backup file on Dropbox is newer than our local database file.
	public static async hasRemoteUpdate(): Promise<boolean> {
		let hasUpdate = false
		if (__DEV__) console.info('------ begin sync count');
		for (const item of AppSync.syncTables) {
			if (AppSync.hasFullSynchronized && AppSync.getIndex(item.table, AppSync.nonSyncTables) > -1) {
				continue;
			}
			const reqeust: RequestSyncDataModel = { table: item.table, time: AppSync.lastSyncTime }
			const response = await httpHelper.getSyncDataCount(reqeust)
			if (__DEV__) console.info(`table ${item.table} count = ${response.count}`);
			item.has_update = response.count > 0 ? true : false;
			if (item.has_update) hasUpdate = true;
		}
		if (__DEV__) console.info('------ end sync count')
		return Promise.resolve(hasUpdate)
	}
	public static getIndex(value: string, arr: string[]) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === value) {
				return i;
			}
		}
		return -1; // to handle the case where the value doesn't exist
	}
	public static async manualSynchonize() {
		AppSync.synchronize(false).then(() => {

		}).catch(_ => {

		});
	}
	public static async synchronize(reset: boolean) {
		// let wifiState = false;
		// wifi.getCurrentSignalStrength(level => {
		// 	if (__DEV__) console.log('Wifi Level:', level);

		// 	const wifiState = level > GLOBAL.wifiStopDbm ? true : false;
		// });
		if (AppSync.syncIsCurrentlyInProgress) return;
		return wifi.getCurrentSignalStrength(async (level) => {
			// console.log("------- wifi strength " + level);
			if (__DEV__) console.log('Wifi Level:', level);
			const wifiState = (level > GLOBAL.wifiStopDbm) ? true : false;

			if (!wifiState && GLOBAL.server_mode === 1 && GLOBAL.connectType === NetInfoStateType.wifi) {
				UTILS.showToast(Strings.message.warning_current_wifi_bad);
				EventRegister.emit(GLOBAL.sync_connect_error, 'The synctronization happed Error !!!');
				return;
			}
			if (GLOBAL.connectType === NetInfoStateType.none) {
				UTILS.showToast(Strings.message.warning_current_wifi_bad);
				EventRegister.emit(GLOBAL.sync_connect_error, 'The synctronization happed Error !!!');
				return;
			}
			const oldSyncTime = UTILS.getFormattedDate(undefined, 1);
			AppSync.synCompleted = false;
			if (!GLOBAL.isSignin) return;
			store.dispatch(syncWait(true));
			//

			// if (__DEV__) {
			// 	// console.clear();
			// 	console.time('synchronize');
			// }
			await AppSync.uploadToServerNw(reset);
			if (AppSync.synCompleted) {
				// UTILS.showToast("Http UpdateTime Connect!");
				AppSync.oldSyncTime = AppSync.lastSyncTime;
				AppSync.lastSyncTime = oldSyncTime;
				// console.info('end sync -------------------<<<< ', UTILS.getFormattedDate(undefined, 1));
				EventRegister.emit(GLOBAL.sync_success, 'The synctronization is completed !!!');

			} else {
				EventRegister.emit(GLOBAL.sync_connect_error, 'The synctronization was completed, there is happed error !!!');
			}
			AppSync.synCompleted = true;
			// tslint:disable-next-line: no-console
			// if (__DEV__) {
			// 	console.timeEnd('synchronize');
			// }
			await asyncStorageHelper.setSyncInfos();

			store.dispatch(syncWait(false));
		});
	}


	public static async downloadToLocalDb(): Promise<boolean> {
		if (GLOBAL.isOffline) return false;
		try {
			const hasUpdate = await AppSync.hasRemoteUpdate()
			if (hasUpdate) {
				// database.synchronousOff();
				if (__DEV__) console.info('------ begin sync download');
				for (const item of AppSync.syncTables) {
					if (AppSync.hasFullSynchronized && AppSync.getIndex(item.table, AppSync.nonSyncTables) > -1) {
						continue;
					}
					if (__DEV__) console.info('------ begin sync download ', item.table)
					if (!item.has_update) continue

					const reqeust: RequestSyncDataModel = { table: item.table, time: AppSync.lastSyncTime }
					const response = await httpHelper.downloadSyncData(reqeust)
					if (response.result && response.result.length > 0) {
						if (__DEV__) console.info(`table ${item.table} count = ${response.result.length}`);

						await database.addSyncData(item, response.result, undefined);
						if (__DEV__) console.info(`${item.table} ------ end add sync data to databse count ${response.result.length} `);
					}
					// item.has_update = response.count > 0 ? true : false;
				}
				AppSync.hasFullSynchronized = true
				await asyncStorageHelper.setSyncInfos();
				return Promise.resolve(true);
			}
		} catch (e) {
			if (__DEV__) console.error('error:', e);
			return Promise.resolve(false);
		}
		if (__DEV__) console.info('--------lastSyncTime=' + AppSync.lastSyncTime)

		// return Promise.resolve();
	}
	public static async downloadToLocalDbNw(): Promise<boolean> {
		if (GLOBAL.isOffline) return false;
		try {
			const formData = new FormData();
			formData.append('timestamp', AppSync.lastSyncTime);

			await httpHelper.downloadDataMonitor(formData).then(async (response) => {
				// console.log(response.ids);
				const synData: SynResponseModel = response;
				if (__DEV__) console.info('downLoad Table Data!');
				if (synData.success) {
					// database.synchronousOff();
					if (synData.downloads) {
						for (let i = 0; i < synData.downloads.length; i++) {
							const item = synData.downloads[i];
							const records: any[] = item.records;
							const table: SyncTableInfoModel = { table: 'records', has_update: false };
							table.table = item.table;
							if (records.length > 0) {
								// console.log(`table ${item.table} count = ${records.length}`);
								await database.addSyncData(table, records, synData.timestamp);
							}
						}
					}
					// database.synchronousOn();
					// return Promise.resolve(true);
				}
				// return Promise.resolve(true);
			}).catch(() => {
				if (__DEV__) console.info('failed to download --- fail ');
				return Promise.resolve(false);
			});
			AppSync.hasFullSynchronized = true;
			await asyncStorageHelper.setSyncInfos();
			return Promise.resolve(true);

		} catch (e) {
			if (__DEV__) console.error('error:', e);
			return Promise.resolve(false);
		}
		if (__DEV__) console.info('--------lastSyncTime=', AppSync.lastSyncTime)

		// return Promise.resolve();
	}
	public static async uploadReqeustData(lastTime: string) {
		const uploadRecords: any[] = [];
		if (lastTime !== '0000-00-00 00:00:00') {
			let response = await database.uploadsHelper.getUploadRecords(Database.TBL_PATIENTS, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_PATIENTS, 'records': records });
				}
			}
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_RECORDS, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_RECORDS, 'records': records });
				}
			}
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_FREE_MEASURES, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_FREE_MEASURES, 'records': records });
				}
			}
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_NOTICES, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_NOTICES, 'records': records });
				}
			}

			// return Promise.resolve(true);
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_IN_OUT_HOSPITAL, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_IN_OUT_HOSPITAL, 'records': records });
				}
			}
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_CONSULT_RECORDS, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_CONSULT_RECORDS, 'records': records });
				}
			}
			response = await database.uploadsHelper.getUploadRecords(Database.TBL_INSULIN_INJECT_ACTIONS, lastTime);
			if (response.success) {
				const records: any[] = response.result;
				if (records.length) {
					uploadRecords.push({ 'table': Database.TBL_INSULIN_INJECT_ACTIONS, 'records': records });
				}
			}
		}
		return uploadRecords;
	}
	public static async uploadToServerNw(reset: boolean) {
		if (GLOBAL.isOffline) {
			return;
		}

		AppSync.syncIsCurrentlyInProgress = true;
		if (__DEV__) {
			console.info('begin sync upload------------------->>> ' + UTILS.getFormattedDate(undefined, 1));
		}
		const uploadRecords = await AppSync.uploadReqeustData(AppSync.lastSyncTime);

		const timestamp = reset ? '0000-00-00 00:00:00' : AppSync.lastServerTime;
		await AppSync.uploadRecordsAll(uploadRecords, timestamp, reset);
		AppSync.syncIsCurrentlyInProgress = false;

		// return Promise.resolve(true);
	}
	public static async uploadToServer(): Promise<boolean> {
		if (GLOBAL.isOffline) return false;
		// console.log('uploadToServer!');
		const response = await database.uploadsHelper.getUploads(AppSync.lastSyncTime);
		if (response.success) {
			// console.log('response.success!');
			const uploadData: UploadListItemModel[] = response.result;
			for (let i = 0; i < uploadData.length; i++) {
				const data = uploadData[i];
				if (data.kind === 0) {
					// console.log('GlucoseMonitorModel!');
					const record: GlucoseMonitorModel = await database.recordsHelper.getRecord(
						Database.TBL_RECORDS,
						data.id,
					);
					if (record) {
						if (await !AppSync.uploadMonitor(record)) {
							return Promise.resolve(false);
						}
					}
				} else if (data.kind === 1) {
					const record: FreePatientMeasureData = await database.freeMeasuresHelper.getRecord(
						Database.TBL_FREE_MEASURES,
						data.id,
					);
					if (record) {
						if (await !AppSync.uploadFreeMeasure(record)) {
							return Promise.resolve(false);
						}
					}
				} else if (data.kind === 2) {
					const record: NoticeModel = await database.noticeHelper.getRecord(Database.TBL_NOTICES, data.id);
					if (record) {
						if (await !AppSync.uploadNotice(record)) {
							return Promise.resolve(false);
						}
					}
				}
			}
			return Promise.resolve(true);
		}
		return Promise.resolve(false);

	}
	public static async responseSynData(response: any) {
		const nw_record = response.new_records;
		const downloads = response.downloads;
		const timestamp = response.timestamp;
		// if (__DEV__) console.info(downloads);
		if (nw_record && nw_record.length) {
			for (const records of nw_record) {
				if (records.length === 0) continue;
				await database.deleteSyn(records.table, records.ids);
			}
		}
		// console.log('success to upload monitor !!!!!');
		if (__DEV__) {
			console.info('success to download monitor !!!!!' + UTILS.getFormattedDate(undefined, 1));
		}

		if (downloads) {
			let records: any[] = [];
			// if (__DEV__) { console.time('localDB_Set') }
			const db = await database.getDatabase();
			await db.transaction(async tx => {
				let updated_at = timestamp;
				if (timestamp != '0000-00-00 00:00:00') {
					const time = UTILS.modifyDate(timestamp, 2, false, 2);
					updated_at = UTILS.getFormattedDate(time, 1);
				}
				for (const item of downloads) {
					records = item.records;
					if (records.length > 0) {
						if (__DEV__) { console.log(item.table, ':', records.length); }
						const table: SyncTableInfoModel = { table: 'records', has_update: false };
						const keys = Object.keys(records[0]);
						const o_keys = keys.filter(fd => fd != 'doctor_list');
						const fields = o_keys.join(',');
						const vals: any[] = [];
						const up_vals: any[] = [];
						let deleteSql: string = '';
						let insertSql: string = '';
						const updateSql: string = '';
						keys.forEach((key, index) => {
							if (key != 'doctor_list') {
								vals.push('?');
								up_vals.push(`${key}=?`);
							}
						});
						const values = `(${vals.join(',')})`;
						const id_field = 'id';
						// insertSql = `INSERT INTO ${item.table}(${fields}) VALUES ${values}`;
						// table.table = item.table;
						let ids: any[] = [];
						let fvalues: any[] = [];
						let field_values: any[] = [];
						for (let i = 0; i < records.length; i++) {
							const record = records[i];
							ids.push(record.id);
							fvalues.push(values);
							// const field_values: any[] = [];
							record.updated_at = updated_at;
							keys.forEach((key, index) => {
								if (key != 'doctor_list') {
									field_values.push(record[key]);
								}
							});
							if (ids.length === 10) {
								deleteSql = `DELETE FROM ${item.table} WHERE ${id_field} IN (${ids.join(', ')})`;
								insertSql = `INSERT INTO ${item.table}(${fields}) VALUES ${fvalues.join(', ')}`;
								AppSync.recordInsert(tx, deleteSql, insertSql, field_values);
								ids = [];
								fvalues = [];
								field_values = [];
							}
						}
						if (ids.length > 0) {
							deleteSql = `DELETE FROM ${item.table} WHERE ${id_field} IN (${ids.join(', ')})`;
							insertSql = `INSERT INTO ${item.table}(${fields}) VALUES ${fvalues.join(', ')}`;
							AppSync.recordInsert(tx, deleteSql, insertSql, field_values);
							ids = [];
							fvalues = [];
							field_values = [];
						}

					}
				}
			});
			/* for (const item of downloads) {
				records = item.records;
				if (records.length > 0) {
					const table: SyncTableInfoModel = { table: 'records', has_update: false };
					table.table = item.table;
					await database.addSyncData(table, records, timestamp);
				}
			} */
			// if (__DEV__) { console.timeEnd('localDB_Set'); }
		}
		if (__DEV__) {
			console.info('success to upload monitor !!!!!' + UTILS.getFormattedDate(undefined, 1));
		}

		// AppSync.syncIsCurrentlyInProgress = false;
		if (__DEV__) console.info('success to download monitor syncIsCurrentlyInProgress !!!', UTILS.getFormattedDate(undefined, 1));
		AppSync.hasFullSynchronized = true;
		AppSync.synCompleted = true;
		AppSync.lastServerTime = response.serverTime;
		GLOBAL.curHospital = await database.getHospitalModel(GLOBAL.curHospitalId);

		await asyncStorageHelper.setSyncInfos();
	}
	public static recordInsert(tx, delSql: string, InsertSql: string, values: any[]) {
		tx.executeSql(delSql, [], (tx, res) => {
			// if (res.rows.length == 0) {
			tx.executeSql(InsertSql, values);
			// } else {
			// 	tx.executeSql(uSql, values);
			// }
		}, (tx, err) => {
			if (__DEV__) console.error(err);
			tx.executeSql(InsertSql, values);
		});
	}
	private static async uploadRecordsAll(data: any[], timestamp: string, reset: boolean) {

		if (GLOBAL.isOffline) return;
		const formData = new FormData();
		formData.append('records', JSON.stringify(data));
		formData.append('timestamp', timestamp);
		if (__DEV__) console.dir(data);
		try {
			const response = await httpHelper.manageDataMonitorNw(formData) as ResponseSyncModel;
			if (reset && response.downloads) {
				await database.resetDatabase();
			}
			// console.log(response);
			// if (__DEV__) console.log(response);
			if (response.downloads.length) {
				await AppSync.responseSynData(response);
			}
		} catch (e) {
			if (__DEV__) {
				console.error('synchronize error:', e);
			}
			AppSync.synCompleted = false;

			if (e == Http_Error.Server_Error) {
				UTILS.showToast(Strings.message.connectServer_fail);
			} else {
				if (e == Http_Error.Authority_Error) {
					UTILS.showToast(Strings.message.upload_noData);
				}
				if (!GLOBAL.isOffline && GLOBAL.curUser.nick) {
					const formdata = new FormData();
					formdata.append("nick", GLOBAL.curUser.nick);
					formdata.append("password", GLOBAL.curUser.password);
					GLOBAL.server_mode === 0 && formdata.append("hospital_id", GLOBAL.hospital_num);
					try {
						const response = await httpHelper.signIn(formdata);
						const responseJson = response as ResponseSignModel;
						if (responseJson.success == true) {
							// console.info(responseJson);
							GLOBAL.token = responseJson.token;
							AppSync.syncIsCurrentlyInProgress = false;
							// AppSync.uploadToServerNw(true);
						}
					} catch (error) {
						if (__DEV__) console.error('synchronize error:', error);
					}
				}
				return;
			}
		}
	}
	private static async uploadMonitor(data: GlucoseMonitorModel): Promise<boolean> {
		if (GLOBAL.isOffline) return Promise.resolve(false)

		const formData = new FormData()
		if (data.id) formData.append('id', data.id);
		if (data.patient_id) formData.append('patient_id', data.patient_id);
		if (data.value >= 0) formData.append('value', data.value);
		if (data.state >= 0) formData.append('state', data.state);
		if (data.time) formData.append('time', data.time);
		if (data.point >= 0) formData.append('point', data.point);
		if (data.memo) formData.append('memo', data.memo);
		formData.append('flag', data.flag);
		if (data.task_type >= 0) formData.append('task_type', data.task_type);
		if (data.task_value >= 0) formData.append('task_value', data.task_value);
		let opKind = MANAGE_KIND.ADD;
		if (data.updated_at > data.created_at) {
			if (data.updated_at > AppSync.lastSyncTime && data.created_at > AppSync.lastSyncTime) {
				opKind = MANAGE_KIND.ADD;
			} else opKind = MANAGE_KIND.MODIFY;
		} else opKind = MANAGE_KIND.MODIFY;
		try {
			if (__DEV__) console.info('---begin upload monitor id=', data.id)
			await httpHelper.manageGlucoseMonitor(formData, opKind)
				.then(async () => {
					if (__DEV__) console.info('---begin delete from local monitor id=', data.id)
					// if (response.success) {
					await database.recordsHelper.manageGlucoseMonitor(data, MANAGE_KIND.DEL);
					return Promise.resolve(true);
					// }
				})
				.catch(() => {
					if (__DEV__) console.error('failed to upload monitor---');
					return Promise.resolve(false);
				});
		} catch (e) {
			if (__DEV__) console.error('failed to upload monitor---ll', e);
			return Promise.resolve(false);
		}
	}
	private static async uploadFreeMeasure(data: FreePatientMeasureData): Promise<boolean> {
		if (GLOBAL.isOffline) return Promise.resolve(false);
		const formData = new FormData()
		if (data.id) formData.append('id', data.id)
		if (data.value >= 0) formData.append('value', data.value)
		if (data.state >= 0) formData.append('state', data.state)
		if (data.time) formData.append('time', data.time)
		if (data.point >= 0) formData.append('point', data.point)
		if (data.memo) formData.append('memo', data.memo)

		if (data.name) formData.append('name', data.name)
		if (data.cert_num) formData.append('cert_num', data.cert_num)
		if (data.cert_kind >= 0) formData.append('cert_kind', data.cert_kind)
		if (data.address) formData.append('address', data.address)
		if (data.birthday) formData.append('birthday', data.address)
		if (data.task_type >= 0) formData.append('task_type', data.task_type)
		if (data.task_value >= 0) formData.append('task_value', data.task_value)

		let opKind = MANAGE_KIND.ADD
		if (data.updated_at > data.created_at) {
			if (data.updated_at > AppSync.lastSyncTime && data.created_at > AppSync.lastSyncTime) {
				opKind = MANAGE_KIND.ADD;
			} else opKind = MANAGE_KIND.MODIFY;
		}

		await httpHelper
			.manageFreePatientMeasure(formData, opKind)
			.then(async () => {
				// if (response.success) {
				await database.freeMeasuresHelper.manageFreePatientMeasure(formData, MANAGE_KIND.DEL);
				return Promise.resolve(true);

				// }
			})
			.catch(() => {
				if (__DEV__) console.error('failed to upload fpm');
				return Promise.resolve(false);

			});

	}
	private static async uploadNotice(data: NoticeModel): Promise<boolean> {
		if (GLOBAL.isOffline) return Promise.resolve(false)
		const formData = new FormData()
		if (data.id) formData.append('id', data.id)
		if (data.patient_id) formData.append('patient_id', data.patient_id)
		if (data.type >= 0) formData.append('type', data.type)
		if (data.notice) formData.append('notice', data.notice)
		if (data.date) formData.append('date', data.date)
		if (data.record_id) formData.append('date', data.record_id)

		if (data.flag) formData.append('memo', data.flag)

		if (data.task_type >= 0) formData.append('task_type', data.task_type)
		if (data.task_value >= 0) formData.append('task_value', data.task_value)
		await httpHelper
			.setPatientNotice(formData, MANAGE_KIND.ADD)
			.then(async () => {
				// if (response.success) {
				await database.noticeHelper.setPatientNotice(formData, MANAGE_KIND.DEL);
				return Promise.resolve(false);
				// }
			})
			.catch((error) => {
				if (__DEV__) console.error('failed to upload monitor', error);
				return Promise.resolve(false);
			})
	}
}
