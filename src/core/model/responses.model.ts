export interface ResponseModel {
  success: boolean;
  result: any[];
  count?: number;
}
export interface ResponseSyncModel {
  new_records: any[];
  downloads: any[];
  timestamp: string;
}
export interface ResponseSignModel {
  success: boolean;
  token: string;
  error: string;
}
