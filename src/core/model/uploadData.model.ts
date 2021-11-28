import { PatientModel, GlucoseValuesOneDayModel } from ".";
import { Monitor } from "./monitor.model";

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
}

export interface UploadListItemModel {
  kind: number; // 0 hospital patient, 1 fpm, 2 notice
  id: number; // record_id or fpm_id or notice_id
  patient_name: string;
  time: string;

  gender?: number;
  age?: number;

  department_name?: string;
  doctor_name?: string;
  nurse_name?: string;
  bed_number?: string;
  patient_number?: string;

  glucose_value?: number;
  glucose_state?: number;
  glucose_point?: number;

  fm_cert_num?: string;
  fm_cert_kind?: number;

  notice_type?: number;
  notice_notice?: string;
  // notice_date?: string; as time

  updated_at?: string;
  flag?: number;
}
