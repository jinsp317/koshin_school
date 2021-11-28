import { PatientModel, GlucoseValuesOneDayModel, MonitorModel } from ".";
import { UserModel } from '@src/core/model';
export interface Monitor {
  id?: number;
  value: number; // mg / dl
  time?: string; // yyyy-mm-dd hh:mm:ss
  eat_time?: string; // yyyy-mm-dd hh:mm:ss
  state?: number;
}
export interface GlucoseMonitor extends Monitor {
  patient_id: number;
  hospital_id?: number;
  point: number;
  user_id?: number;
  memo?: string;

  user_name?: string;
  point_name?: string;
  patient_name?: string;
  age?: number;
  gender?: number;
  bed_number?: string;
  patient_number?: string;

  task_type?: number; // 1 point，2 anytime， 3 notice
  task_value?: number; // point/meatime_point_id, any_time/measure_time-id, notice/notices-id
  delete_user_id?: number; /// -1 insert , -2 delete & update , 0 - commited;
  flag?: number;
  eat_time?: string;
  updated_at?: string;
  created_at?: string;

  // 20191229 rhj
  min?: number;
  max?: number;
  alarm_min?: number;
  alarm_max?: number;
  target_before_min?: number; // 4.4 ~ 7
  target_before_max?: number;
  target_after_min?: number; // 4.4 ~ 10
  target_after_max?: number;

  pulse_before_min?: number;
  pulse_before_max?: number;
  pulse_after_min?: number;
  pulse_after_max?: number;
  pulse_anytime_min?: number;
  pulse_anytime_max?: number;
  isRetry?: boolean;
  notice_obj?: string;
}

export interface RequestGlucoseMonitor {
  patient_id?: number;
  begin_time?: string;
  end_time?: string;
  from?: number;
  count?: number;
  points?: number[];
  user_id?: number;
  department_id?: number;
  is_group?: number;
  doctor_id?: number;
  searchTxt?: string;
  nurse_id?: number;
  o_doctor_id?: number;
  o_nurse_id?: number;
  departments?: number[];
  patients?: number[];
  has_record_days?: number;
  hospital_id?: number;
}

export interface GlucoseValuesOneDay {
  date: string;
  monitors: GlucoseMonitor[][];
}

export interface MonitorsOnePointModel {
  monitors: GlucoseMonitor[];
}
export interface PatientMonitorModel extends PatientModel {
  point_monitors: MonitorsOnePointModel[]; // size = number of points
  advice: number[];
}
export interface PatientMonitorRawModel extends PatientModel {
  records?: GlucoseMonitor[];
  record?: GlucoseMonitor;
  advice?: number[];
  record_all?: number;
  record_month?: number;
  doctor_nick?: string;
}
export interface UserSummary extends UserModel {
  department_name: string;
  months: number;
  todays: number;
}

export interface FreePatientMeasure extends Monitor {
  patient_id: number; // free patient id
  user_id: number; // measured persion id
  point: number; // time division 0~... free,before breakfrist, after breakfirst,...
  temperature?: number;
  pressure_low?: number;
  pressure_high?: number;
  user_name: string;
}

export interface FreePatientMeasureData extends GlucoseMonitor {
  kind: number; // 0 hospital patient, 1 fpm, 2 notice
  name?: string;
  cert_num?: string;
  cert_kind?: number;
  birthday?: string;
  address?: string;

  temperature?: number;
  pressure_low?: number;
  pressure_high?: number;

  task_type?: number;
  task_value?: number;
}
export interface MonitorDayModel {
  date: string;
  checked: boolean;
}
