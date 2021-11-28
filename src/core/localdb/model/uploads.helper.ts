import SQLite from 'react-native-sqlite-storage';
import {
	ResponseModel,
	RequestPatientModel,
	MonitorPatientModel,
	PatientModel,
	RequestTaskDataModel,
	TaskDataModel,
	SYN_KIND
} from '@src/core/model';
import { BaseHelper } from './base.helper';
import * as UTILS from '@src/core/app_utils';
import moment from 'moment';
import GLOBAL from '@src/core/globals';
import { Database } from '@src/core/utils/database';

export class UploadsHelper extends BaseHelper {
	constructor(database: SQLite.SQLiteDatabase) {
		super(database);
	}

	public getUploads(last_sync_timestamp: string): Promise<any> {
		const records_fields = '0 as kind, id, updated_at';
		const fms_fields = '1 as kind, id, updated_at';
		const notices_fields = '2 as kind, id, updated_at';

		const query_records = `SELECT ${records_fields} FROM records WHERE updated_at > '${last_sync_timestamp}'`;
		const query_fms = `SELECT ${fms_fields} FROM free_measures WHERE updated_at > '${last_sync_timestamp}'`;
		const query_notices = `SELECT ${notices_fields} FROM notices WHERE updated_at > '${last_sync_timestamp}'`;

		const query = `SELECT * FROM (SELECT * FROM (${query_records}) AS t1 UNION ALL SELECT * FROM (${query_fms}) AS t2 UNION ALL SELECT * FROM (${query_notices}) AS t3) ORDER BY updated_at DESC`;

		return this.select(query);
	}
	public getUploadRecords(table_name: string, last_sync_timestamp: string): Promise<any> {
		// tslint:disable-next-line: max-line-length
		let query_records = `SELECT * FROM ${table_name} WHERE updated_at > '${last_sync_timestamp}`;
		if (table_name === Database.TBL_RECORDS) {
			query_records = `SELECT * FROM ${table_name} WHERE updated_at > '${last_sync_timestamp}' OR delete_user_id < ${SYN_KIND.UNSYNCHRONIZE}`;
		} else if (table_name === Database.TBL_PATIENTS) {
			query_records = `SELECT * FROM ${table_name} WHERE updated_at > '${last_sync_timestamp}' OR flag != -1`;
		} else if (table_name === Database.TBL_NOTICES) {
			query_records = `SELECT * FROM ${table_name} WHERE updated_at > '${last_sync_timestamp}' OR syn_flag = ${SYN_KIND.UNSYNCHRONIZE}`;
		} else if (table_name === Database.TBL_INSULIN_INJECT_ACTIONS) {
			query_records = `SELECT * FROM ${table_name} WHERE syn_flag = ${SYN_KIND.UNSYNCHRONIZE}`;
		}
		return this.select(query_records);
	}

}
