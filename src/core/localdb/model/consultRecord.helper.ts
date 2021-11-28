import SQLite from "react-native-sqlite-storage";
import { BaseHelper } from "./base.helper";
import * as UTILS from "@src/core/app_utils";
import { Database } from "@src/core/utils/database";
import GLOBAL from "@src/core/globals";
import {
    RequestConsultModel,
    MANAGE_KIND,
    ConsultModel
} from '@src/core/model';
import { bool } from "prop-types";
export class ConsultRecordHelper extends BaseHelper {
    private _tableName: string;
    private _refName: string;
    constructor(database: SQLite.SQLiteDatabase, tableName: string, refName: string) {
        super(database);
        this._tableName = 'consult_records';
        this._refName = 'members';
    }
    public downloadConsults(reqParams: RequestConsultModel | undefined): Promise<unknown> {
        const wheres: any[] = [];
        wheres.push('del_flag=0');
        if (reqParams) {
            if (reqParams.patient_id) wheres.push(` patient_id=${reqParams.patient_id}`);
            if (reqParams.hospital_id >= 0) wheres.push(` hospital_id=${reqParams.hospital_id}`);
        }
        const select = '*, (SELECT name FROM patients WHERE id=patient_id) as patient_name, (SELECT mobile FROM patients WHERE id = patient_id) as patient_mobile, (SELECT name FROM departments WHERE id=department_id) as department_name, (SELECT name FROM users WHERE id = requester_id) as requester_name, (SELECT consult FROM states WHERE value = state) as state_name';
        return this.select(`SELECT ${select} FROM ${this._tableName}  WHERE ${wheres.join(' AND ')} ORDER BY id DESC`).then(async (res) => {
            return res;
        }).catch((e) => {
            return e;
        });
    }
    public async manageConsult(formData: ConsultModel, kind: MANAGE_KIND): Promise<unknown> {
        const time = UTILS.getFormattedDate(undefined, 1);
        const response = { success: false };
        if (kind === MANAGE_KIND.ADD) {
            const id = await this.getMaxValue('id', this._tableName);
            const keys = Object.keys(formData);
            let fields: any[] = [];
            let value_lab: any[] = [];
            let values: any[] = [];
            keys.forEach((key, index) => {
                if (key === 'patient_id' || key === 'request_time' || key === 'state' || key === 'result' || key === 'type' || key === 'summary' || key === 'department_id' || key === 'requester_id') {
                    fields.push(key);
                    value_lab.push('?');
                    values.push(formData[key]);
                }
            });
            // fields.push('department_id');
            // value_lab.push('?');
            // values.push(GLOBAL.curUser.department_id);
            // fields.push('requester_id');
            // value_lab.push('?');
            // values.push(GLOBAL.curUser.id);
            fields.push('id');
            value_lab.push('?');
            values.push(id + 1);
            const flag: boolean = await this.queryInsert(this._tableName, fields.join(','), value_lab.join(','), values);
            if (flag) {
                const vid = await this.getMaxValue('id', this._refName);
                fields = [];
                value_lab = [];
                values = [];
                fields.push('consult_id');
                value_lab.push('?');
                values.push(id + 1);
                fields.push('id');
                value_lab.push('?');
                values.push(vid + 1);
                fields.push('user_id');
                value_lab.push('?');
                values.push(formData.requester_id);
                fields.push('department_id');
                value_lab.push('?');
                values.push(formData.department_id);
                const sflag: boolean = await this.queryInsert(this._refName, fields.join(','), value_lab.join(','), values);
                if (sflag) {
                    response.success = true;
                    return response;
                } else {
                    return response;
                }
            } else {
                return response;
            }

        } else if (kind === MANAGE_KIND.MODIFY) {
            const keys = Object.keys(formData);
            let fields: any[] = [];
            let value_lab: any[] = [];
            let values: any[] = [];
            keys.forEach((key, index) => {
                if (key === 'patient_id' || key === 'request_time' || key === 'state' || key === 'result' || key === 'type' || key === 'summary' || key == 'department_id' || key === 'requester_id') {
                    fields.push(`key=?`);
                    // value_lab.push('?');
                    values.push(formData[key]);
                }
            });
            if (formData.id) {
                const flag: boolean = await this.queryUpdate(this._tableName, fields.join(','), `id=${formData.id}`, values);
                if (flag) {
                    const vid = await this.getMaxValue('id', this._refName);
                    let vflag: boolean = await this.queryUpdate(this._refName, `updated_at='${time}', del_flag=1`, `consult_id=${formData.id}`, []);
                    fields = [];
                    value_lab = [];
                    values = [];
                    fields.push('consult_id');
                    value_lab.push('?');
                    values.push(formData.id);
                    fields.push('id');
                    value_lab.push('?');
                    values.push(vid);
                    fields.push('user_id');
                    value_lab.push('?');
                    values.push(formData.requester_id);
                    fields.push('department_id');
                    value_lab.push('?');
                    values.push(formData.department_id);
                    vflag = await this.queryInsert(this._refName, fields.join(','), value_lab.join(','), values);
                    if (vflag) {
                        response.success = true;
                        return response;
                    } else {
                        return response;
                    }
                } else {
                    return response;
                }
            }

        } else if (kind === MANAGE_KIND.DEL) {
            // const response = { success: false };
            // this.queryUpdate(Database.TBL_CONSULT_RECORDS, `updated_at='${time}', del_flag=0`, `id=${formData.id}`)
            const sql = `UPDATE ${this._tableName} SET updated_at='${time}', del_flag=1 WHERE id=${formData.id}`;
            return this.database.executeSql(sql, []).then(() => {
                response.success = true;
                return response;
            }).catch((e) => {
                return response;
            });

        }
        return response;
    }
}
