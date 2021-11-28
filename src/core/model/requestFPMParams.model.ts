import { FreePatientModel } from "./";

export interface RequestFPMParams {
  begin_time?: string | undefined;
  end_time?: string | undefined;
  free_patient?: FreePatientModel | undefined;
  from?: number | undefined;
  count?: number | undefined;
  user_id?: number | undefined;
  point?: number | undefined;
}
