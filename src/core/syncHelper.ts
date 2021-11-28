/**
 * created by @rihyokju 20190824
 */
import { database } from "@src/core/utils/database";
import { httpHelper } from "@src/core/utils/httpHelper";
import { NativeModules } from "react-native";
import { setSyncWait, connectedBluetoothServer } from '../actions/actions';
import store from "../store";
class UpBluetoothParams {
  action: string;
  token?: string;
  params?: string;
  records?: string;
  timestamp?: string;
}
interface ResponseJson {
  success: boolean;
  result: any;
  message: string;
}
import {
  MANAGE_KIND,
  UploadListItemModel,
  TaskDataModel,
  RequestTaskDataModel,
  AlarmModel,
  WarningLogModel,
  PointModel
} from "./model";
import { ToastAndroid } from "react-native";
import Strings from "@src/assets/strings";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";

import ReactNativeAN from "react-native-alarm-notification";
import { asyncStorageHelper } from "./utils/storageHelper";
import { AppSync } from "./appSync";
import { useReducer } from "react";
const BluetoothChat = NativeModules.BluetoothIOModule;
export async function dataSyncProc() {
  const key = GLOBAL.foregroundJobKey;
  if (!GLOBAL.isSignin) return;
  if (GLOBAL.usingBluetoothServer) {
    // if (GLOBAL.isOffline) {
    // console.log(GLOBAL.token);
    const bStatus = store.getState().blueServerConn;
    if (__DEV__) console.info(bStatus);
    if (store.getState().blueServerConn.connected && !store.getState().blueServerConn.syncStatus
      && GLOBAL.token != undefined) {
      if (__DEV__) console.info(`begin-----sync Bluetooth  DataSyncProc lastTime ${AppSync.lastSyncTime}`);
      const upData = await AppSync.uploadReqeustData(AppSync.lastSyncTime);
      let timestamp = AppSync.lastSyncTime;
      if (AppSync.resetData) {
        await database.resetDatabase();
        timestamp = '0000-00-00 00:00:00';
      }
      AppSync.nwLastSynTime = UTILS.getFormattedDate(undefined, 1);
      if (__DEV__) console.info(`begin-----sync Bluetooth  DataSyncProc curTime ${AppSync.nwLastSynTime}`);
      const formData = new UpBluetoothParams();
      formData.action = 'records/synchronizeNw';
      formData.records = JSON.stringify(upData);
      formData.timestamp = timestamp;
      formData.token = GLOBAL.token;
      const flag = await BluetoothChat.writeString(JSON.stringify(formData));
      // console.log(flag)
      if (flag != 3) {
        store.dispatch(connectedBluetoothServer(false));
        BluetoothChat.connect(GLOBAL.bluetoothServer, false);
      } else {
        store.dispatch(setSyncWait(true));
      }
    } else {
      if (GLOBAL.token === undefined || !store.getState().blueServerConn.connected) {
        BluetoothChat.connect(GLOBAL.bluetoothServer, false);
      }
      // store.dispatch(setSyncWait(false));
      // if (!store.getState().blueServerConn.connected) {
      //   BluetoothChat.connect(GLOBAL.bluetoothServer, false);
      // }
    }
  } else {
    if (!GLOBAL.isOffline) {
      if (__DEV__) console.info(`begin-----sync   DataSyncProc Http fired! Key=${key}`);
      await AppSync.synchronize(false);
      if (__DEV__) console.info(`end--------sync  DataSyncProc Http fired! Key=${key}`);
    }
  }
}
export function monitorMyTask(key: string) {
  if (__DEV__) console.info(`monitorMyTask! Key=${key}`);
  if (UTILS.checkOffline(false)) return;

  let requestParams: RequestTaskDataModel = {
    day: UTILS.getFormattedDate(undefined, 0),
    is_completed: 0,
    point: UTILS.getPointIdFromTime(),
    is_charge: 1
  };
  // for check current task
  GLOBAL.curTaskCheckIntervalIdx > 0 && httpHelper.downloadTasks(requestParams)
    .then(responseJson => {
      const result: TaskDataModel[] = responseJson.result;
      if (result && result.length > 0) {
        const alarmData = { ...GLOBAL.alarmNotifDataDef };
        alarmData.id = GLOBAL.AlarmKey_CheckTask;
        alarmData.message = "该时段有测量任务";
        alarmData.play_sound = GLOBAL.curWarningPlaySoundEnabled === 0 ? true : false;
        alarmData.fire_date = ReactNativeAN.parseDate(new Date(Date.now() + 1000));

        ReactNativeAN.scheduleAlarm(alarmData);
      }
    })
    .catch(exception => {
      if (__DEV__) console.error(exception);
    });
  // for check value on completed task
  requestParams = {
    day: UTILS.getFormattedDate(undefined, 0),
    is_completed: 1,
    point: UTILS.getPointIdFromTime(),
    is_charge: 1
  };

  GLOBAL.curWarningCheckIdx === 0 && httpHelper.downloadTasks(requestParams)
    .then(responseJson => {
      const res = responseJson as ResponseJson;
      const result: TaskDataModel[] = res.result;
      if (result && result.length > 0) {
        result.forEach(e => {
          let alertValueType = 0;
          const alarm_min = e.alarm_min ? e.alarm_min : GLOBAL.GLUCOSE_LOW_VAL;
          const alarm_max = e.alarm_max ? e.alarm_max : GLOBAL.GLUCOSE_HIGH_VAL;
          if (e.record.value > alarm_max) {
            alertValueType = 1;
          } else if (e.record.value < alarm_min) {
            alertValueType = 2;
          }

          if (alertValueType > 0) {
            database.getWarningLog(e.record.id).then(warning => {
              if (warning) {
                // prev proceed
              } else {
                UTILS.SendAlarm(e, alertValueType);
                const warningData: WarningLogModel = {
                  id: e.record.id,
                  patient_id: e.id,
                  patient_name: e.name,
                  bed_number: e.bed_number,
                  patient_number: e.patient_number,
                  department_id: e.department_id,
                  department_name: e.department_name,
                  doctor_id: e.doctor_id,
                  doctor_name: e.doctor_name,
                  nurse_id: e.nurse_id,
                  nurse_name: e.nurse_name,
                  point: e.record.point,
                  value: e.record.value,
                  time: e.record.time,
                  warning_kind: alertValueType,
                  warning_time: UTILS.getFormattedDate(undefined, 1)
                  //                    flag: 1
                };
                database.addWarningLog(warningData);
              }
            });
          }
        });
      }
    })
    .catch(exception => {
      if (__DEV__) console.error(exception);
    });
}
export function setGlobalUsers(users: any[]) {
  GLOBAL.myUsers = users;
  const cUser = GLOBAL.myUsers.find((usr) => usr.nick.toLowerCase() === GLOBAL.curUser.nick.toLowerCase());
  GLOBAL.curUser = { ...cUser, password: GLOBAL.curUser.password };
  GLOBAL.curHospitalId = GLOBAL.curUser.hospital_id;
  if (__DEV__) console.info("GLOBAL.job_position_id=", GLOBAL.curUser.job_position_type);
}
export function setGlobalDepartments(depts: any[]) {
  GLOBAL.totalDepartments = depts.map(item => {
    return { ...item, checked: true };
  });
  if (__DEV__) console.info("------------download departments");
}

export function setGlobalPoints(points: PointModel[]) {
  GLOBAL.serverPoints = points;
  GLOBAL.todayTaskPoints = UTILS.makeTodayTaskPoints();
  if (__DEV__) console.info("------------download task points count=", GLOBAL.todayTaskPoints.length);
}
export async function setGlobalInfo() {
  // get users list
  await httpHelper.downloadUsers(false)
    .then(response => {
      const res = response as ResponseJson;
      if (res.success) {
        setGlobalUsers(res.result);
        // console.log(response.result);
        // GLOBAL.myUsers = response.result;
        // GLOBAL.myUsers.forEach(e => {
        //   const password = GLOBAL.curUser.password;
        //   if (e.nick.toLocaleLowerCase() === GLOBAL.curUser.nick.toLocaleLowerCase()) {
        //     // if (e.nick === GLOBAL.curUser.nick) {
        //     GLOBAL.curUser = { ...e, password: password };
        //     GLOBAL.curHospitalId = GLOBAL.curUser.hospital_id;
        //     console.log("GLOBAL.job_position_id=" + GLOBAL.curUser.job_position_type);
        //   }
        // });
      }
    })
    .catch(ex => {
      if (__DEV__) console.info("failed to downloadUsers", ex);
    });
  // get points list
  await httpHelper.downloadPointInfo()
    .then(response => {
      const points: PointModel[] = response.result;
      if (response.success && points && points.length > 0) {
        // for (var t = Date.now(); Date.now() - t <= 5000;); sleep for test
        setGlobalPoints(points);
      }
    })
    .catch(ex => {
      if (__DEV__) console.error("failed to download point", ex);
    });

  // get departs list
  await httpHelper.downloadDepartments(undefined)
    .then(response => {
      if (response.success) {
        setGlobalDepartments(response.result);
        // for (var t = Date.now(); Date.now() - t <= 5000;); sleep for test
        // GLOBAL.totalDepartments = response.result.map(item => {
        //   return { ...item, checked: true };
        // });
        if (__DEV__) console.info("------------download departments");
      }
    })
    .catch(ex => {
      if (__DEV__) console.error("failed to download total departments", ex);
    });

}
