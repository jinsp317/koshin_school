import { Sex } from "./common.model";
import { ObjectModel } from "./object.model";
import { DoctorsOrderModel, GlucoseMonitorModel } from ".";
import { SafeRangeModel } from "./safeRange.model";
import { NoticeModel } from "./notice.model";

export interface Patient extends ObjectModel {
  id: number;
  // name?: string;
  is_in?: number;
  gender?: number;
  birthday?: string;
  address?: string;
  mobile?: string;
  family_contact?: string;
  is_married?: number;
  has_child?: number;
  smoking?: number;
  drinking?: number;
  has_medical_insurance?: number;
  medical_insurance_number?: string;
  hospital_id?: number;
  department_id?: number;
  area_id?: number;
  doctor_id?: number;
  nurse_id?: number;
  patient_number?: string;
  bed_number?: string;
  id_card_number?: string;
  in_date?: string;
  out_date?: string;
  diabetes_id?: number;
  diagnostic_time?: string;
  remarks?: string;
  created_at?: string;
  notice?: NoticeModel;
  safe_ranges?: SafeRangeModel[];

  department_name?: string;
  doctor_name?: string;
  nurse_name?: string;
  age?: number;
  in_days?: number;
  area_name?: string;

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
  note?: string;
  points?: string;
  anytime?: string;
  apoints?: string;
  atimes?: string;
  record_obj?: string;
  notice_obj?: string;
  o_doctor_id?: number;
  o_nurse_id?: number;
}

export interface MonitorPatientModel extends Patient {
  advice?: number[];
  record?: GlucoseMonitorModel; // recent record in 24h

  notice_meal_time?: string;
  notice_double_time?: string;
}

export interface RequestPatientModel {
  begin_time?: string | undefined;
  end_time?: string | undefined;
  patient?: Patient | undefined;
  from?: number | undefined;
  count?: number | undefined;
  c_point?: number;
  departments?: number[];
  patients?: number[];
  areas?: number[];
  is_cure?: boolean;
  is_in?: number;
  is_detail?: number;
  bed_number?: string;
  mobile?: string;
  no_record_begin_time?: string;
  no_record_end_time?: string;
  no_record_from_time?: Date;
  no_record_to_time?: Date;
  inject_kind?: string;
  has_advice?: number | undefined;
  advice_id?: number;
  doctor_id?: number;
  nurse_id?: number;
  o_doctor_id?: number;
  o_nurse_id?: number;
  hospital_id?: number;
  patient_number?: string;
}
