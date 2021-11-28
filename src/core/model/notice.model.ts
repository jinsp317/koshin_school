export interface NoticeModel {
  id: number;
  patient_id: number;
  date?: string; // YY-MM-DD
  type?: number; // 0 meal, 1 retest,
  notice?: string; // HH:mm
  task_type?: number; // 1 point，2 anytime， 3 notice
  task_value?: number; // point/meatime_point_id, any_time/measure_time-id, notice/notices-id
  record_id?: number;
  flag?: number;
  updated_at?: string;
  created_at?: string;
}
