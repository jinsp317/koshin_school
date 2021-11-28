export interface RequestSyncDataModel {
  table: string;
  time?: string;
  from?: number;
  count?: number;
}
export interface SyncTableInfoModel {
  table: string;
  has_update: boolean;
}
export interface SyncTablesModel {
  advice_records?: SyncTableInfoModel;
  days?: SyncTableInfoModel;
  departments?: SyncTableInfoModel;
  diabetes_types?: SyncTableInfoModel;
  free_measures?: SyncTableInfoModel;
  hospitals?: SyncTableInfoModel;
  in_out_department_records?: SyncTableInfoModel;
  in_out_hospital_records?: SyncTableInfoModel;
  job_positions?: SyncTableInfoModel;
  measure_points?: SyncTableInfoModel;
  measure_times?: SyncTableInfoModel;
  notices?: SyncTableInfoModel;
  patients?: SyncTableInfoModel;
  points?: SyncTableInfoModel;
  record_states?: SyncTableInfoModel;
  states?: SyncTableInfoModel;
  user_related_departments?: SyncTableInfoModel;
  user_related_hospitals?: SyncTableInfoModel;
  users?: SyncTableInfoModel;
}
