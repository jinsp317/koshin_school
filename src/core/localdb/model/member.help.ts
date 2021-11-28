import SQLite from "react-native-sqlite-storage";
import { RequestFPMParamsModel, MANAGE_KIND, UserModel, ResponseModel } from "@src/core/model";
import { BaseHelper } from "./base.helper";
export class MemberHelper extends BaseHelper {
    constructor(database: SQLite.SQLiteDatabase) {

        super(database);
    }
    public async getMember(nick: string): Promise<UserModel> {
        const sql = `SELECT * FROM users WHERE nick='${nick}'`;
        const res: ResponseModel = await this.select(sql);
        if (res.success && res.result.length > 0) {
            const ret = res.result[0] as UserModel;
            return ret;
        }
        return null;
    }
}