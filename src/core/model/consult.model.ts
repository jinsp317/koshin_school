export interface ConsultMember {
  department_id: number;
  state?: number;
  user_id: number;
}
export interface Consult {
  id?: number;
  patient_id: number;
  hospital_id: number;
  department_id: number;
  requester_id: number;
  request_time: string;
  consult_time: string;
  state: number;
  members?: ConsultMember[];

  patient_name?: string;
  hospital_name?: string;
  department_name?: string;
  requester_name?: string;
  state_name?: string;
}

export interface RequestConsult {
  patient_id?: number;
  hospital_id?: number;

  begin_time?: string;
  end_time?: string;
}
