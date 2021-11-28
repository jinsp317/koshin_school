export interface Inhospital {
  id?: number;
  patient_id: number;
  hospital_id: number;
  doctor_id: number;
  nurse_id: number;
  in_date: string;
  out_date: string;
  state_id?: number;

  patient_name?: string;
  hospital_name?: string;
  doctor_name?: string;
  nurse_name?: string;
  department_name?: string;
  state_name?: string;
}

export interface RequestInhospital {
  patient_id?: number;
  hospital_id?: number;
  begin_time?: string;
  end_time?: string;
}
