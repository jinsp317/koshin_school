export interface Visit {
  id?: number;
  patient_id: number;
  hospital_id: number;
  department_id: number;
  doctor_id: number;
  user_id: number;
  from_time: string;
  to_time?: string;
  state: number;
  memo?: string;
  image?: string;
  image_file?: any; // file data

  patient_name?: string;
  hospital_name?: string;
  doctor_name?: string;
  user_name?: string;
  state_name?: string;
}

export interface RequestVisit {
  patient_id?: number;
  hospital_id?: number;
  begin_time?: string;
  end_time?: string;
}
