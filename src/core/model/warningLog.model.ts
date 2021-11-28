export interface WarningLogModel {
  id: number; // monitor id
  patient_id: number;
  point: number;
  patient_name?: string;
  bed_number?: string;
  patient_number?: string;
  department_id?: number;
  department_name?: string;
  doctor_id?: number;
  doctor_name?: string;
  nurse_id?: number;
  nurse_name?: string;
  alarm_min?:number;
  alarm_max?:number;
  state?:number;
  value: number;
  time: string;
  warning_kind: number;
  warning_time: string;
  //  flag: number;
}
