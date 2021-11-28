import { PatientModel, DoctorsOrderModel, GlucoseMonitorModel } from ".";
export interface TaskDetailModel {
  id: number;
  point?: number;
  from_time?: string;
  to_time?: string;
  time?: string;
}
export interface TaskDataModel extends PatientModel {
  record?: GlucoseMonitorModel;
  task_type?: number; // 1 point, 2 any time, 3 notice(type > 0)
  task_value?: number; // id...
  task_detail?: TaskDetailModel;

  records: GlucoseMonitorModel[];
}

export interface RequestTaskDataModel {
  day: string;
  is_completed?: number;
  point?: number; // 고정포인트의 과제를 얻을때...
  pointIndex?: number; // 오늘과제 어제밤, 래일새벽
  patient_id?: number; // 개별환자의 task자료를 얻을때... return (points && records)

  departments?: number[];
  patients?: number[];
  is_charge?: number;
}
