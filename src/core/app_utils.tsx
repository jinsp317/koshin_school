import { Alert, ToastAndroid, MaskedViewComponent, ImageProps, Text, View } from "react-native";
import Strings from "@src/assets/strings";
import GLOBAL from "@src/core/globals";
import moment from "moment";
import {
  ObjectModel,
  PatientModel,
  TaskDataModel,
  MonitorPatientModel,
  GlucoseMonitorModel,
  MonitorModel, HospitalModel,
  PointModel,
} from "./model";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StateEatIconFill,
  StateDoubleIconFill,
  NewPatientIcon
} from "@src/assets/icons";
import { StyleType } from "@src/core/react-native-ui-kitten/theme";
import React from "react";
import { GlucoseMonitor } from "./model/uploadData.model";
import { TaskFilter } from "@src/containers/tasks/taskFilter/taskFilter.component";
import { DoctorsOrderPointModel } from "./model/doctorsOrder.model";
import commonStyles from "@src/containers/styles/common";
import ReactNativeAN from "react-native-alarm-notification";
import momentLocale from "moment/locale/zh-cn";

// 20191229 rhj 서버와 규약완성후 수정할것
export function isAfterPoint(point: number) {
  let isAfter = false;
  if (point == 3 || point == 5 || point == 7) isAfter = true;

  return isAfter;
}
export function SendAlarm(e: TaskDataModel, alertValueType: number) {
  const alarmData = { ...GLOBAL.alarmNotifDataDef };
  alarmData.id = GLOBAL.AlarmKey_GlucoseAlert;
  alarmData.play_sound = GLOBAL.curWarningPlaySoundEnabled === 0 ? true : false;
  alarmData.schedule_once;
  const subMessage = alertValueType === 1 ? "高于预警值 请关注" : "低于预警值 请关注";
  const glucoseValue = e.record.value > 0 ? glucoseConvMMol(e.record.value) : "";
  alarmData.message = `${e.bed_number}床 ${e.name} ${
    GLOBAL.COMMON_POINTS[e.record.point]
    } ${glucoseValue} ${subMessage}`;
  alarmData.fire_date = ReactNativeAN.parseDate(new Date(Date.now() + 10));
  // ReactNativeAN.scheduleAlarm(alarmData);

  ReactNativeAN.sendNotification(alarmData);
}
export function checkOffline(showAlert: boolean = true) {
  if (showAlert && GLOBAL.isOffline) showToast(Strings.message.alert_isOffline);

  return GLOBAL.isOffline;
}
export function getPointName(task: TaskDataModel) {
  let pointString;
  if (task && task.task_type > 0 && task.task_detail) {
    if (task.task_type === 1) {
      pointString = getPointNameById(task.task_detail.point);
    } else if (task.task_type === 2) {
      pointString = `${Strings.common.str_anytime} ${task.task_detail.time}`;
    } else if (task.task_type === 3) {
      if (task.task_detail.point >= 0) {
        pointString = getPointNameById(task.task_detail.point);
      } else if (task.task_detail.time) {
        pointString = `${Strings.common.str_anytime} ${task.task_detail.time}`;
      }
    }
  }
  return pointString;
}
export function getPointId(task: TaskDataModel) {
  let pointId = getAnytimePoint();
  if (task && task.task_type > 0 && task.task_detail) {
    if (task.task_type === 1) {
      pointId = task.task_detail.point;
    } else if (task.task_type === 2) {
      // pointId = getAnytimePoint();
    } else if (task.task_type === 3) {
      if (task.task_detail.point >= 0) {
        pointId = task.task_detail.point;
      } else if (task.task_detail.time) {
        // pointId = getAnytimePoint();
      }
    }
  }
  return pointId;
}
export function getCurrentTask(tasks: TaskDataModel[], time: string) {
  let task: TaskDataModel;
  tasks.some((data, index) => {
    if (data.task_type === 1) {
      // for point
      const curPoint = getPointById(data.task_detail.point);
      if (curPoint) {
        const fromTime = moment(`${moment(time).format("YYYY-MM-DD")} ${curPoint.from_time}:00`);
        const toTime = moment(`${moment(time).format("YYYY-MM-DD")} ${curPoint.to_time}:59`);
        if (moment(time).isBetween(moment(fromTime), moment(toTime))) {
          task = data;
          return true;
        }
      }
    } else if (data.task_type === 2) {
      // for anytime
      const fromTime = modifyDate(data.task_detail.time, 30, false, 3); // subtract 30m
      const toTime = modifyDate(data.task_detail.time, 30, true, 3); // add 30m
      if (moment(time).isBetween(moment(fromTime), moment(toTime))) {
        task = data;
        return true;
      }
    }
  });
  return task;
}
export function getTaskName(data: TaskDataModel) {
  let taskName = Strings.common.str_unknowen;
  if (data.task_type === 1) {
    taskName = getPointNameById(data.task_detail.point);
  } else if (data.task_type === 2) {
    taskName = `${Strings.common.str_anytime} ${data.task_detail.time}`;
  } else if (data.task_type === 3) {
    taskName = `${Strings.common.str_remonitor} ${getMinuteString(data.notice.notice)}`;
  } else {
  }
  return taskName;
}

export function getPointNameById(id: number) {
  let pointName = Strings.common.str_unknowen;
  GLOBAL.serverPoints.forEach((item) => {
    if (item.id === id) pointName = item.name;
  });
  return pointName;
}
export function getGlucoseValueString(monitor: MonitorModel) {
  let glucoseVal: string;
  if (!monitor) return glucoseVal;

  if (monitor.state > 0 && monitor.state < GLOBAL.mealState) glucoseVal = GLOBAL.MONITOR_STATES[monitor.state];
  else if (monitor.state === GLOBAL.mealState) {
    glucoseVal = '🍔';
  } else if (monitor.state === GLOBAL.retryState) {
    glucoseVal = '🕘';
  } else {
    glucoseVal = glucoseConvMMol(monitor.value);
    if (monitor.value > GLOBAL.GLUCOSE_INVALID_MAX_VAL) glucoseVal = GLOBAL.WARNINGTYPES[1];
    if (monitor.value < GLOBAL.GLUCOSE_INVALID_MIN_VAL) glucoseVal = GLOBAL.WARNINGTYPES[2]; // "LOW";
  }
  if (glucoseVal == "HIGH") glucoseVal = "HI";
  if (glucoseVal == "LOW") glucoseVal = "LO";
  return glucoseVal;
}

export function getGlucoseValueLabel(data: TaskDataModel | MonitorPatientModel, initVal = "-") {
  let glucoseVal = initVal;

  if (data.record) {
    glucoseVal = getGlucoseValueString(data.record);
  }
  if (glucoseVal == "HIGH") glucoseVal = "HI";
  return glucoseVal;
}

export function getGlucoseColorEx_old(data: TaskDataModel | MonitorPatientModel) {
  let glucoseColor = "black";
  if (data.record) {
    // glucoseColor = getMonitorValueColor(data.record);
    if (data.record) {
      if (data.alarm_max && data.record.value >= data.alarm_max) {
        glucoseColor = GLOBAL.GLUCOSE_HIGH_COLOR;
      }
      if (data.alarm_min && data.record.value <= data.alarm_min) {
        glucoseColor = GLOBAL.GLUCOSE_LOW_COLOR;
      }
    }
  }

  const glucoseVal = getGlucoseValueLabel(data, "");
  if (glucoseVal == "HIGH") glucoseColor = GLOBAL.GLUCOSE_HIGH_COLOR;
  else if (glucoseVal == "LOW") glucoseColor = GLOBAL.GLUCOSE_LOW_COLOR;

  return glucoseColor;
}

export function getGlucoseBackgroundColorEx(monitor: GlucoseMonitorModel, hospital: HospitalModel) {
  let color: string = "white";
  const high_color = hospital && hospital.high_color ? hospital.high_color : GLOBAL.GLUCOSE_HIGH_COLOR;
  const low_color = hospital && hospital.low_color ? hospital.low_color : GLOBAL.GLUCOSE_LOW_COLOR;
  const below_color = hospital && hospital.below_color ? hospital.below_color : GLOBAL.GLUCOSE_LOW_COLOR;
  const above_color = hospital && hospital.above_color ? hospital.above_color : GLOBAL.GLUCOSE_HIGH_COLOR;
  const prepare_color = 'white';
  const normal_color = 'white';
  if (monitor) {
    if (monitor.delete_user_id == -1 || monitor.delete_user_id == -2) {
      return prepare_color;
    }
    if (monitor.state > 0) {
      if (monitor.state === 5) color = high_color;
      // if (monitor.state === 5) color = GLOBAL.GLUCOSE_HIGH_COLOR;
      else if (monitor.state === 6) color = low_color;
      // else if (monitor.state === 6) color = color = GLOBAL.GLUCOSE_LOW_COLOR;
      else color = normal_color;
    } else {
      if (monitor.value > monitor.alarm_max && monitor.point !== 9) {
        color = high_color;
        // color = GLOBAL.GLUCOSE_HIGH_COLOR_1;
      } else if (monitor.value < monitor.alarm_min && monitor.point !== 9) {
        // color = GLOBAL.GLUCOSE_LOW_COLOR_1;
        color = low_color;
      } else if (monitor.point === 9 && monitor.value > monitor.alarm_max) {
        // color = GLOBAL.GLUCOSE_HIGH_COLOR;
        color = high_color;
      } else if (monitor.point === 9 && monitor.value < monitor.alarm_min) {
        color = low_color;
        // color = GLOBAL.GLUCOSE_LOW_COLOR;
      } else if (
        (monitor.point === 3 || monitor.point === 5 || monitor.point === 7) &&
        monitor.value > monitor.target_after_max
      ) {
        color = normal_color;
        // color = "white";
      } else if (
        (monitor.point === 3 || monitor.point === 5 || monitor.point === 7) &&
        monitor.value < monitor.target_after_min
      ) {
        color = normal_color;
        // color = "white";
      } else if (
        monitor.point !== 3 &&
        monitor.point !== 9 &&
        monitor.point !== 5 &&
        monitor.point !== 7 &&
        monitor.value > monitor.target_before_max
      ) {
        color = normal_color;
        // color = "white";
      } else if (
        monitor.point !== 3 &&
        monitor.point !== 9 &&
        monitor.point !== 5 &&
        monitor.point !== 7 &&
        monitor.value < monitor.target_before_min
      ) {
        color = normal_color;
        // color = "white";
      } else if (monitor.point === 9) {
        color = normal_color;
        // color = "white";
      }
    }
  }

  return color;
}
// 20191229 rhj
export function getGlucoseColorEx(monitor: GlucoseMonitorModel, hospital: HospitalModel) {
  let color: string = hospital && hospital.pass_color ? hospital.pass_color : GLOBAL.GLUCOSE_NORMAL_COLOR_1;
  // let color: string = GLOBAL.GLUCOSE_NORMAL_COLOR_1;
  const high_color = hospital && hospital.high_color ? hospital.high_color : GLOBAL.GLUCOSE_HIGH_COLOR;
  const low_color = hospital && hospital.low_color ? hospital.low_color : GLOBAL.GLUCOSE_LOW_COLOR;
  const below_color = hospital && hospital.below_color ? hospital.below_color : GLOBAL.GLUCOSE_LOW_COLOR;
  const above_color = hospital && hospital.above_color ? hospital.above_color : GLOBAL.GLUCOSE_HIGH_COLOR;
  const common_color = 'black';
  const prepare_color = hospital && hospital.prepare_color ? hospital.prepare_color : 'grey';
  const sym_color = 'white';
  if (monitor) {
    if (monitor.delete_user_id == -1 || monitor.delete_user_id == -2) {
      return prepare_color;
    }
    if (monitor.state > 0) {
      if (monitor.state === 5) color = sym_color;
      // if (monitor.state == 5) color = "white";
      else if (monitor.state === 6) color = sym_color;
      // else if (monitor.state == 6) color = "white";
      else color = common_color;
      // else color = "black";
    } else {
      if (monitor.value > monitor.alarm_max && monitor.point != 9) color = sym_color;
      // if (monitor.value > monitor.alarm_max && monitor.point != 9) color = "white";
      else if (monitor.value < monitor.alarm_min && monitor.point != 9) color = sym_color;
      // else if (monitor.value < monitor.alarm_min && monitor.point != 9) color = "white";
      else if (monitor.point == 9 && monitor.value > monitor.alarm_max) color = sym_color;
      // else if (monitor.point == 9 && monitor.value > monitor.alarm_max) color = "white";
      else if (monitor.point == 9 && monitor.value < monitor.alarm_min) color = sym_color;
      // else if (monitor.point == 9 && monitor.value < monitor.alarm_min) color = "white";
      else if ((monitor.point === 3 || monitor.point === 5 || monitor.point === 7) &&
        monitor.value > monitor.target_after_max
      ) {
        color = above_color;
        // color = high_color;
        // color = GLOBAL.GLUCOSE_HIGH_COLOR_1;
      } else if ((monitor.point == 3 || monitor.point == 5 || monitor.point == 7) &&
        monitor.value < monitor.target_after_min
      ) {
        color = below_color;
        // color = low_color;
        // color = GLOBAL.GLUCOSE_LOW_COLOR_1;
      } else if (monitor.point != 3 &&
        monitor.point != 9 &&
        monitor.point != 5 &&
        monitor.point != 7 &&
        monitor.value > monitor.target_before_max
      ) {
        color = above_color;
        // color = GLOBAL.GLUCOSE_HIGH_COLOR_1;
      } else if (monitor.point != 3 && monitor.point != 9 &&
        monitor.point != 5 &&
        monitor.point != 7 &&
        monitor.value < monitor.target_before_min
      ) {
        color = below_color;
        // color = GLOBAL.GLUCOSE_LOW_COLOR_1;
      } else if (monitor.point == 9) {
        color = common_color;
        // color = "black";
      }
    }
  }

  return color;
}
export function getGlucoseColor(glucoseVal: number, hospital: HospitalModel) {
  let color: string = hospital.normal_color ? hospital.normal_color : GLOBAL.GLUCOSE_NORMAL_COLOR_1;
  if (glucoseVal > GLOBAL.GLUCOSE_HIGH_VAL) color = hospital.high_color ? hospital.high_color : GLOBAL.GLUCOSE_HIGH_COLOR_1;
  else if (glucoseVal < GLOBAL.GLUCOSE_LOW_VAL) color = hospital.low_color ? hospital.low_color : GLOBAL.GLUCOSE_LOW_COLOR_1;
  return color;
}
export function getGlucoseValueStyle(monitor: GlucoseMonitorModel, hospital: HospitalModel, fontSize: number = undefined) {
  let textStyle;
  if (fontSize) {
    textStyle = [
      commonStyles.textParagraph,

      {
        //        color: getGlucoseColor(monitor.value),
        // 20191229 rhj
        backgroundColor: getGlucoseBackgroundColorEx(monitor, hospital),
        color: getGlucoseColorEx(monitor, hospital),
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: fontSize
      },
    ];
  } else {
    // 20191229 rhj
    // textStyle = [commonStyles.textParagraph, { color: getGlucoseColor(monitor.value) }];
    //// const flx = monitor.delete_user_id === 1 || monitor.delete_user_id === 2 ? 0.7 : 1;
    textStyle = [
      commonStyles.textParagraph,
      {
        backgroundColor: getGlucoseBackgroundColorEx(monitor, hospital),
        color: getGlucoseColorEx(monitor, hospital), 
        justifyContent: 'center',
        alignItems: 'center'
      },
    ];
  }

  /*
  if (monitor) {
    if (monitor.state > 0) {
      textStyle = [textStyle, { color: "black" }];
      if (monitor.state == 5) textStyle = [textStyle, { color: GLOBAL.GLUCOSE_HIGH_COLOR }];
      else if (monitor.state == 6) textStyle = [textStyle, { color: GLOBAL.GLUCOSE_LOW_COLOR }];
    } else if (monitor.value >= 0) {
      if (
        monitor.value > GLOBAL.GLUCOSE_WARNING_MAX_VAL ||
        monitor.value > GLOBAL.GLUCOSE_INVALID_MAX_VAL
      ) {
        textStyle = [
          commonStyles.glucoseWarningText,
          { backgroundColor: GLOBAL.GLUCOSE_HIGH_COLOR, fontSize: fontSize }
        ];
      } else if (
        monitor.value < GLOBAL.GLUCOSE_WARNING_MIN_VAL ||
        monitor.value < GLOBAL.GLUCOSE_INVALID_MIN_VAL
      ) {
        textStyle = [
          commonStyles.glucoseWarningText,
          { backgroundColor: GLOBAL.GLUCOSE_LOW_COLOR, fontSize: fontSize }
        ];
      }
    }
  }
  */
  return textStyle;
}
export function getMonitorValueColor(monitor: MonitorModel, hospital: HospitalModel) {
  let glucoseColor = "black";
  if (monitor) {
    if (monitor.state > 0) {
    } else if (monitor.value) {
      glucoseColor = getGlucoseColor(monitor.value, hospital);
      if (monitor.value > GLOBAL.GLUCOSE_WARNING_MAX_VAL) glucoseColor = hospital.high_color ? hospital.high_color : GLOBAL.GLUCOSE_HIGH_COLOR;
      // if (monitor.value > GLOBAL.GLUCOSE_WARNING_MAX_VAL) glucoseColor = GLOBAL.GLUCOSE_HIGH_COLOR;
      if (monitor.value < GLOBAL.GLUCOSE_WARNING_MIN_VAL) glucoseColor = hospital.low_color ? hospital.low_color : GLOBAL.GLUCOSE_LOW_COLOR;
      // if (monitor.value < GLOBAL.GLUCOSE_WARNING_MIN_VAL) glucoseColor = GLOBAL.GLUCOSE_LOW_COLOR;

      /*
      glucoseData.safe_ranges.forEach(e => {
        if (e.point === glucoseData.record.point) {
          if (glucoseData.record.value > e.max) glucoseColor = GLOBAL.GLUCOSE_WARNING_HIGHT_COLOR;
          if (glucoseData.record.value < e.min) glucoseColor = GLOBAL.GLUCOSE_WARNING_LOW_COLOR;
        }
      });
      */
    }
  }

  return glucoseColor;
}

export function getGlucoseByMMol(valByMMg: number) {
  let res: number;

  if (valByMMg == undefined) res = undefined;
  else {
    if (GLOBAL.isChineseDevice) {
      if (__DEV__) console.info("国内设备");
      res = Number((valByMMg / 10).toFixed(1));
    } else {
      if (__DEV__) console.info("国外设备");
      res = Number((valByMMg / GLOBAL.MMOL_RATIO).toFixed(1)); // val * 0.0556
    }

  }

  return res;
}
export function glucoseConvMMolNum(val: number) {
  let res: number;

  if (val == undefined) res = undefined;
  else res = val; // / 18.02; //val * 0.0556
  return res;
}
export function glucoseConvMMol(val: number) {
  let res: string;

  if (val == undefined) res = undefined;
  else {
    if (GLOBAL.isChineseDevice && val == 1.0) {
      res = "LO";
    } else if (GLOBAL.isChineseDevice && val == 70.0) {
      res = "HI";
    } else if (val > 33.3) {
      res = "HI";
    } else if (val <= 1.0) {
      res = "LO";
    } else {
      res = val.toFixed(1);
    }
  }


  return res;
}
export function glucoseConvMgNum(val: number) {
  if (val == undefined) return undefined;
  return val; // * 18.02;
}
export function getDateStringFromNum(date: number, kind: number) {
  const d = date > 1000 ? new Date(date * 1000) : new Date();
  return getFormattedDate(d, kind);
}
export function getDayofWeek(date: string) {
  return moment(date).day();
}
/** for release version create time object */
export function createDate(date: string = undefined) {
  // moment.updateLocale("zh-cn", momentLocale);
  // Alert.alert(date);
  //  return date ? new Date(date.replace(/ /g, "T")) : new Date()
  return date ? moment(date).toDate() : moment().toDate();
}
/**updated for react native release version instead of  getFormattedDateDebug*/
export function setDate(src: string | Date, dstDate: number) {
  return moment(src).date(dstDate).format("YYYY-MM-DD HH:mm:ss");
}
export function changeDay(src: string, dst: string) {
  const srcDate = moment(src);
  const dstDate = moment(dst);
  return srcDate.date(dstDate.date()).format("YYYY-MM-DD HH:mm:ss");
}
export function getFormattedDate(dateNormal: Date | string, kind: number) {
  const date = dateNormal ? moment(dateNormal) : moment();
  let str: string;
  switch (kind) {
    case 0:
      str = date.format("YYYY-MM-DD");
      break;
    case 1:
      str = date.format("YYYY-MM-DD HH:mm:ss");
      break;
    case 2:
      str = date.format("HH:mm:ss");
      break;
    case 3:
      str = date.format("YYYY-MM-DD HH:mm");
      break;
    case 4:
      str = date.format("HH:mm");
      break;
    case 5:
      str = date.format("MM/DD");
      break;
    case 6:
      str = date.format("M-D H:m");
      break;
    case 7:
      str = date.format("MM.DD");
      break;
  }
  return str;
}
export function conv2TodayTimeString(date: Date | string) {
  return moment().format("YYYY-MM-DD") + " " + moment(date).format("HH:mm:ss");
}
export function getFirstDateofMonth(date: Date | string) {
  const firstDate = moment(date).format("YYYY-MM") + "-01";
  return moment(firstDate).toDate();
}
export function getLastDateofMonth(date: Date | string) {
  const days = moment(date).daysInMonth();
  const firstDate = moment(date).format("YYYY-MM-") + days.toString();
  return moment(firstDate).toDate();
}
export function getBeforeOneMonth(date: Date) {
  return moment(date).subtract(29, "days").toDate();
}
export function getAddedDate(date: Date | string, value: number) {
  return moment(date).add(value, "days").toDate().toString();
}
export function getAddedDateString(date: Date | string, value: number) {
  return moment(date).add(value, "days").toDate().getDate().toString();
}
export function getBeforeDate(date: Date | string, value: number) {
  return moment(date).subtract(value, "days").toDate();
}
export function modifyDate(date: Date | string, value: number, isAdd: boolean, unit: number) {
  let newDate: Date;
  if (isAdd) {
    if (unit === 0) newDate = moment(date).add(value, "days").toDate();
    else if (unit === 1) newDate = moment(date).add(value, "months").toDate();
    else if (unit === 2) newDate = moment(date).add(value, "hours").toDate();
    else if (unit === 3) newDate = moment(date).add(value, "minutes").toDate();
  } else {
    if (unit === 0) newDate = moment(date).subtract(value, "days").toDate();
    else if (unit === 1) newDate = moment(date).subtract(value, "months").toDate();
    else if (unit === 2) newDate = moment(date).subtract(value, "hours").toDate();
    else if (unit === 3) newDate = moment(date).subtract(value, "minutes").toDate();
  }
  return newDate;
}

export function isFutureTime(endTime: Date | string, diffTime: Date | string, procEndTime = true) {
  const targetedDate = procEndTime ? moment(getBeginEndTimeString(endTime, false)) : moment(endTime);
  const diffTargetDate = moment(diffTime);
  const diffValue = targetedDate.diff(diffTargetDate);
  return diffValue < 0;
}
export function isFutureMonth(diffTime:Date) {
  const thisMonth = moment(getLastDateofMonth(undefined));
  const diffTargetDate = moment(diffTime);
  const diffValue = thisMonth.diff(diffTargetDate);
  return diffValue < 0;

}

export function getBeginEndTimeString(dateNormal: Date | string, begin: boolean) {
  const date = dateNormal ? moment(dateNormal) : moment();
  const searchDate = begin
    ? date.format("YYYY-MM-DD") + " 00:00:00"
    : date.format("YYYY-MM-DD") + " 23:59:59";
  // moment('2013-11-16').endOf('day') //2013년 11월 16일의 끝나는 시점. 2013년 11월 16일 11시 59분 59초
  return searchDate;
}
export function getBeginEndTime(dateNormal: Date | string, begin: boolean) {
  const date = dateNormal ? moment(dateNormal) : moment();
  let searchDate = begin
    ? date.format("YYYY-MM-DD") + " 00:00:00"
    : date.format("YYYY-MM-DD") + " 23:59:59";
  if (!begin) {
    const eDay = this.modifyDate(dateNormal, 10, true, 0);
    searchDate = moment(eDay).format("YYYY-MM-DD") + " 23:59:59";
  }
  return moment(searchDate).toDate();
}
export function getShortTime(date: string, kind: number) {
  let destTime: string;
  if (kind === 0) destTime = moment(date).format("MM/DD HH:mm");
  else destTime = moment(date).format("YY年MM月DD日 HH时:mm分:ss秒");
  return destTime;
}
export function getFormattedDateDebug(date: Date, kind: number) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  // var time =  (h<10?('0'+h):h)+':'+(min<10?('0'+min):min)+':'+(sec<10?('0'+sec):sec);
  const time =
    (h < 10 ? "0" + h : h) +
    ":" +
    (min < 10 ? "0" + min : min) +
    ":" +
    (sec < 10 ? "0" + sec : sec);
  let str = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
  if (kind == 0) {
  } else if (kind == 1) {
    str = str + " " + time;
  } else str = time;

  return str;
}

export function myformatter(date, kind) { }

/**
 *
 * @param {string} date - date in format yyyymmdd
 * @return {string} - formatted string of date, ex: Apr 6
 */
function formatDateString(date) {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  const d = new Date(year, month - 1, day);
  let dateString = d.toDateString();

  // Wed Apr 11 2018 -> Apr 11
  dateString = dateString.match(/[A-Z][a-z]{2}[\s0-9]{3}/)[0];
  return dateString;
}

function myparser(s) {
  if (!s) return new Date();
  const y = s.substring(0, 4);
  const m = s.substring(5, 7);
  const d = s.substring(8, 10);
  const h = s.substring(11, 13);
  const min = s.substring(14, 16);
  const sec = s.substring(17, 19);
  if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min) && !isNaN(sec)) {
    return new Date(y, m - 1, d, h, min, sec);
  } else {
    return new Date();
  }
}

export function getBeginDate(date: Date, index: number) {
  let beginDate: Date;
  if (index > 0) {
    let modNum = 0;
    let modUnit = 0;
    if (index == 1) {
      modNum = 7;
      modUnit = 0; // 7 days
    } else if (index == 2) {
      modNum = 14;
      modUnit = 0; // 14 days
    } else if (index == 3) {
      modNum = 1;
      modUnit = 1; // 1 month
    } else if (index == 4) {
      modNum = 3;
      modUnit = 1; // 3 month
    } else if (index == 5) {
      modNum = 6;
      modUnit = 1; // 6 month
    }
    beginDate = this.modifyDate(date, modNum, false, modUnit);
  }
  return beginDate;
}

export function getSingleArrFromMultiArr(arr: object[], key: string) {
  return arr.map((item) => {
    return item[key];
  });
}

export function getIndexFromId(arr: ObjectModel[], id: number) {
  let result = 0; // -1;
  const newArr = getSingleArrFromMultiArr(arr, "id");
  newArr.forEach((e, index) => {
    if (e === id) {
      result = index;
    }
  });

  return result;
}

export function confirmAlert(
  message: string,
  okCallback,
  cancelCallback,
  otherCallback,
  caption: string,
  param = undefined
) {
  const alertCaption = caption ? caption : "温馨提示";
  Alert.alert(
    alertCaption,
    message,
    [
      okCallback &&
      typeof okCallback === "function" && { text: "确定", onPress: () => okCallback(param) },
      {
        text: "取消",
        onPress: () => {
          cancelCallback && typeof cancelCallback === "function" && cancelCallback();
        },
        style: "cancel",
      },
      otherCallback && { text: "其他", onPress: () => otherCallback() },
    ],
    { cancelable: false }
  );
}

export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}
export function getAnytimePoint(getIndex: boolean = false) {
  let result: number;
  GLOBAL.serverPoints.some((data, index) => {
    if (data.name === "随机") {
      result = getIndex ? index : data.id;
      return true;
    }
  });
  return result;
}
export function getPointIndex(id: number) {
  let pointIndex;
  GLOBAL.serverPoints.some((data, index) => {
    if (data.id === id) {
      pointIndex = index;
      return true;
    }
  });
  return pointIndex;
}
export function getTaskPointIndexFromTime(time: Date | string = undefined) {
  return getPointIdFromTime(time) + 1;
}
export function getPointFromNow(): number {
  let point = getAnytimePoint();
  const myTime = moment();
  let flag = GLOBAL.serverPoints.some((data, index) => {
    const fromTime = moment(`${myTime.format("YYYY-MM-DD")} ${data.from_time}:00`);
    const toTime = moment(`${myTime.format("YYYY-MM-DD")} ${data.to_time}:59`);
    if (myTime.isBetween(fromTime, toTime)) {
      point = data.id;
      return true;
    }
  });
  return point;
}
export function getPointIdFromTime(time: Date | string = undefined): number {
  let point = getAnytimePoint();
  const testTime = "2021-08-23 14:23:00";
  const myTime = moment(time);
  // flag = false;
  let flag = GLOBAL.serverPoints.some((data, index) => {
    const fromTime = moment(`${myTime.format("YYYY-MM-DD")} ${data.from_time}:00`);
    const toTime = moment(`${myTime.format("YYYY-MM-DD")} ${data.to_time}:59`);
    if (myTime.isBetween(fromTime, toTime) && data.id != getAnytimePoint()) {
      point = data.id;
      return true;
    }
  });

  if (!flag) {
    const pid = GLOBAL.serverPoints.findIndex(pos => {
      const fromTime = moment(`${myTime.format("YYYY-MM-DD")} ${pos.from_time}:00`);
      if (myTime < fromTime) {
        return true;
      }
    });
    if (pid < 0) {
      point = GLOBAL.serverPoints[getAnytimePoint() - 1].id;
    } else if (pid == 0) {
      point = GLOBAL.serverPoints[pid].id;
    }
    else {
      const prevTime = moment(`${myTime.format("YYYY-MM-DD")} ${GLOBAL.serverPoints[pid - 1].to_time}`);
      const nextTime = moment(`${myTime.format("YYYY-MM-DD")} ${GLOBAL.serverPoints[pid].from_time}`);
      if (Math.abs(myTime.diff(prevTime)) < Math.abs(myTime.diff(nextTime))) {
        point = GLOBAL.serverPoints[pid - 1].id;
      } else {
        point = GLOBAL.serverPoints[pid].id;
      }
    }
  }
  return point;

  return point;
}
export function getPointById(id: number) {
  let point: PointModel;
  GLOBAL.serverPoints.some((data) => {
    if (data.id === id) {
      point = data;
      return true;
    }
  });
  return point;
}

export function makeTodayTaskPoints() {
  const anytimePointIndex = getAnytimePoint(true);
  return [
    { ...GLOBAL.serverPoints[anytimePointIndex - 1], name: "昨日睡前" },
    ...GLOBAL.serverPoints
      .map((point, index) => {
        if (index != anytimePointIndex) return point;
      })
      .filter((point) => point),
    { ...GLOBAL.serverPoints[0], name: "明日凌晨" },
  ];
}
export function showToast(message: string, delay = ToastAndroid.SHORT) {
  ToastAndroid.show(message, delay);
}
export function alert(message: string, caption: string = undefined) {
  // const alertCaption = caption ? caption : "温馨提示";
  Alert.alert(caption, message, [{
    text: "确定", onPress: () => {
      if (__DEV__) console.info("alert");
    }
  }], {
    cancelable: false,
  });
}
export function updateSavedUsers() {
  let is_newUser = true;
  GLOBAL.savedUsers.forEach((e) => {
    if (e.id === GLOBAL.curUser.id) {
      e.password = GLOBAL.curUser.password;
      is_newUser = false;
    }
  });

  if (is_newUser) {
    GLOBAL.savedUsers.push({
      id: GLOBAL.curUser.id,
      nick: GLOBAL.curUser.nick,
      password: GLOBAL.curUser.password,
      hospital_num: GLOBAL.hospital_num,
    });
  }

  return is_newUser;
}

export function getSavedUser(id: number) {
  let savedUser;
  GLOBAL.savedUsers.forEach((e) => {
    if (e.id === id) savedUser = e;
  });

  return savedUser;
}

export function getMinuteString(time: string | Date) {
  return moment(time).format("HH:mm");
}

export function getAge(time: string) {
  return moment(time, "YYYYMMDD").fromNow();
}

export function renderIconElement(
  Icon: Function,
  style: StyleType
): React.ReactElement<ImageProps> {
  const iconElement: React.ReactElement<ImageProps> = Icon(style);
  if (iconElement) return React.cloneElement(iconElement, { style });
  else return;
}

export function isMyPatient(patient: PatientModel) {
  let isMy = false;
  if (patient) {
    isMy =
      patient.doctor_id === GLOBAL.curUser.id || patient.nurse_id === GLOBAL.curUser.id
        ? true
        : false;
  }
  return isMy;
}

export function getMinMaxDateFromData(data: GlucoseMonitorModel[], isMin: boolean) {
  let min = moment();
  let max = moment("1983-09-30");
  data.forEach((item) => {
    if (!isFutureTime(min.toDate(), item.time)) min = moment(item.time);
    if (isFutureTime(max.toDate(), item.time)) max = moment(item.time);
  });
  return isMin ? min.format("YYYY-MM-DD HH:mm:ss") : max.format("YYYY-MM-DD HH:mm:ss");
}

export function isTimeInDay(time: Date | string, day: Date | string) {
  const now = moment(time);
  const start = moment(day).startOf("day");
  const finish = moment(day).endOf("day");
  return now.isBetween(start, finish, "day", "[]");
}

export function getFormDataParam(data, key: string) {
  let value;
  const field = data.getParts().find((item) => item.fieldName === "key");
  if (field) {
    value = field.string;
  }
  return value;
}
export function getRequestParams(data: FormData) {
  const requestParams = {};
  data._parts.forEach((item) => {
    requestParams[item[0]] = item[1];
  });
  return requestParams;
}
export function renderGlucoseItem(item: GlucoseMonitorModel, hospitalInfo: HospitalModel, fontSize: number) {
  if (item.value == undefined) return;
  const cellStyle = getGlucoseValueStyle(item, hospitalInfo, fontSize);
  let value = getGlucoseValueString(item);
  if (item.state === GLOBAL.mealState) {
    if (item.eat_time != null) {
      const times = `${getFormattedDate(item.eat_time, 4)}`;
      return (
        <View key={item.id} style={cellStyle}>
          {renderIconElement(StateEatIconFill, commonStyles.iconMark)}
          <Text>{times}</Text>
        </View>
      )
    }
  }
  if (item.state === GLOBAL.retryState) {
    if (item.eat_time != null) {
      const times = `${getFormattedDate(item.eat_time, 4)}`;
      return (
        <View key={item.id} style={cellStyle}>
          {renderIconElement(StateDoubleIconFill, commonStyles.iconMark)}
          <Text>{times}</Text>
        </View>
      )
    }
  }

  return (
    <Text style={cellStyle} key={item.id}>
      {`${value}`}
    </Text>
  );
}
