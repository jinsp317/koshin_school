import SQLite from 'react-native-sqlite-storage';
import { ResponseModel, MANAGE_KIND } from '@src/core/model';
import { BaseHelper } from './base.helper';
import { Database } from '@src/core/utils/database';
import { InsulinInjectAction, InsulinMedcine, InsulinAdvice } from '@src/core/model/table.model';
import { InsulinInjectActionVw } from '@src/core/model/insulin.modal'
import * as UTILS from '@src/core/app_utils';
import { promises } from 'dns';
import moment from 'moment';
export class InsulinHelper extends BaseHelper {
    constructor(database: SQLite.SQLiteDatabase) {
        super(database);
    }
    public getInjectActionList(params: InsulinInjectAction): Promise<InsulinInjectActionVw[]> {
        const where: string[] = [];
        const keys = Object.keys(params);
        where.push(`advice_id IN (SELECT id FROM ${Database.TBL_INSULIN_ADVICES} WHERE patient_id IN (SELECT id FROM PATIENTS where is_in = 1))`);
        keys.forEach((_field) => {
            if (_field === 'advice_id') {
                where.push(` advice_id IN (SELECT id FROM ${Database.TBL_INSULIN_ADVICES} WHERE patient_id=${params[_field]})`);
            } else if (_field == 's_flag') {
                where.push(`advice_id=${params[_field]}`);
            } else if (_field === 'hospital_id') {
                where.push(` advice_id IN (SELECT id FROM ${Database.TBL_INSULIN_ADVICES} WHERE patient_id IN (SELECT id FROM ${Database.TBL_PATIENTS} WHERE hospital_id=${params[_field]} ))`);
            } else if (_field === 'from_time') {
                const hour = moment().get('hour');
                if (hour > 11 && !params.org_flag) {
                    const nxt_day = moment(params[_field]).add(1, 'days').format('YYYY-MM-DD');
                    where.push(`( DATE(ex_date) >='${params[_field]}' AND  DATE(ex_date) <= '${nxt_day}')`);
                } else {
                    where.push(` DATE(ex_date)='${params[_field]}'`);
                }
            } else if (_field == 'ex_date') {
                where.push(` DATE(ex_date)='${params[_field]}'`);
            } else if (_field == 'point_kind') {
                where.push(` advice_id IN (SELECT id FROM ${Database.TBL_INSULIN_ADVICES} WHERE inject_kind=${params[_field]})`);
            } else if (_field == 'org_flag') {
            } else {
                where.push(`${_field}='${params[_field]}'`);
            }

        });

        // tslint:disable-next-line: max-line-length
        const sql = `SELECT *, (SELECT name FROM ${Database.TBL_INSULIN_MEDCINES} WHERE id=${Database.TBL_INSULIN_INJECT_ACTIONS}.insulin_id) AS vw_medicine_name, (SELECT name FROM ${Database.TBL_INSULIN_KINDS} WHERE id=${Database.TBL_INSULIN_INJECT_ACTIONS}.kind_id) AS vm_kind_name, (SELECT from_time || '$' || inject_kind || '$' || user_id || '$' || patient_id FROM ${Database.TBL_INSULIN_ADVICES} WHERE id=${Database.TBL_INSULIN_INJECT_ACTIONS}.advice_id) AS vm_advice_obj FROM ${Database.TBL_INSULIN_INJECT_ACTIONS} WHERE ${where.join(' AND ')}`;
        // console.log(sql);
        return this.select(sql).then(res => {
            return <InsulinInjectActionVw[]>res.result;
        }).catch(err => {
            return [];
        })
    }
    public updateInjectAction(item: InsulinInjectActionVw): Promise<boolean> {
        const update_time = UTILS.getFormattedDate(undefined, 1);
        item.updated_at = update_time;
        const keys: string[] = Object.keys(item);
        const fieldset: string[] = [];
        const values: any[] = [];
        keys.forEach((fd, _id) => {
            if (fd !== 'id' && !fd.startsWith('vw_') && !fd.startsWith('vm_')) {
                fieldset.push(`${fd}=?`);
                values.push(item[fd]);
            }
        });
        if (item.exec_id && item.exec_id > 0) {
            fieldset.push('exec_time=?');
            values.push(update_time);
        }
        
        const sql = `UPDATE ${Database.TBL_INSULIN_INJECT_ACTIONS} SET ${fieldset.join(' , ')} WHERE id=${item.id}`;
        return this.database.executeSql(sql, values).then(() => true).catch(() => false);
    }
}
